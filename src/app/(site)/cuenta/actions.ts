'use server';

import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createVisitanteSession, destroyVisitanteSession, getIpHash, safeNext } from '@/lib/auth/visitante';
import { createAdminClient } from '@/lib/supabase/admin';

export type CuentaState = { error?: string };

const MIN_FILL_MS = 2500; // un humano tarda más que esto en llenar el formulario
const MAX_REGISTROS = 5; // cuentas nuevas por visitante…
const VENTANA_HORAS = 1; // …en esta ventana
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const esBot = (formData: FormData) => {
  const startedAt = Number(formData.get('t'));
  return Boolean(formData.get('empresa_web')) || !startedAt || Date.now() - startedAt < MIN_FILL_MS;
};

const RegistroSchema = z.object({
  nombre: z.string().trim().min(1, 'Escribe tu nombre.').max(60, 'El nombre es demasiado largo.'),
  correo: z.string().trim().toLowerCase().email('Escribe un correo válido.').max(254),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(200),
  confirmacion: z.string(),
}).refine((data) => data.password === data.confirmacion, { message: 'Las contraseñas no coinciden.' });

// Acciones públicas: se valida todo el input, se filtran bots y se limita la frecuencia.
export async function registrarse(_previous: CuentaState, formData: FormData): Promise<CuentaState> {
  if (esBot(formData)) return { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.' };
  const parsed = RegistroSchema.safeParse({
    nombre: formData.get('nombre'),
    correo: formData.get('correo'),
    password: formData.get('password'),
    confirmacion: formData.get('confirmacion'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Revisa los campos.' };

  const db = createAdminClient();
  const ipHash = await getIpHash('registro');
  const since = new Date(Date.now() - VENTANA_HORAS * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await db
    .from('visitantes')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);
  if (countError) return { error: 'No se pudo conectar. Inténtalo en un momento.' };
  if ((count ?? 0) >= MAX_REGISTROS) return { error: 'Se crearon demasiadas cuentas desde aquí. Espera un rato.' };

  const { data: creado, error } = await db
    .from('visitantes')
    .insert({
      nombre: parsed.data.nombre,
      correo: parsed.data.correo,
      password_hash: await hashPassword(parsed.data.password),
      ip_hash: ipHash,
    })
    .select('id')
    .single<{ id: number }>();
  // 23505: el correo ya tiene cuenta.
  if (error?.code === '23505') return { error: 'Ese correo ya tiene una cuenta. Entra con tu contraseña.' };
  if (error || !creado) return { error: 'No se pudo crear la cuenta. Inténtalo en un momento.' };

  await createVisitanteSession(creado.id);
  redirect(safeNext(formData.get('siguiente')));
}

const EntrarSchema = z.object({
  correo: z.string().trim().toLowerCase().min(1).max(254),
  password: z.string().min(1).max(200),
});

type VisitanteRow = { id: number; password_hash: string; intentos_fallidos: number; bloqueado_hasta: string | null };

// Si el correo no existe se verifica contra un hash falso: la respuesta tarda lo mismo
// y no revela qué correos tienen cuenta.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword(crypto.randomUUID()));

export async function entrar(_previous: CuentaState, formData: FormData): Promise<CuentaState> {
  const parsed = EntrarSchema.safeParse({ correo: formData.get('correo'), password: formData.get('password') });
  if (!parsed.success) return { error: 'Escribe tu correo y contraseña.' };

  const db = createAdminClient();
  const { data: visitante, error } = await db
    .from('visitantes')
    .select('id, password_hash, intentos_fallidos, bloqueado_hasta')
    .eq('correo', parsed.data.correo)
    .maybeSingle<VisitanteRow>();
  if (error) return { error: 'No se pudo conectar. Inténtalo en un momento.' };
  if (visitante?.bloqueado_hasta && new Date(visitante.bloqueado_hasta) > new Date()) {
    return { error: 'Demasiados intentos fallidos. Intenta de nuevo en unos minutos.' };
  }

  const valid = await verifyPassword(parsed.data.password, visitante?.password_hash ?? (await getDummyHash()));
  if (!visitante || !valid) {
    if (visitante) {
      const attempts = visitante.intentos_fallidos + 1;
      const locked = attempts >= MAX_ATTEMPTS;
      after(async () => {
        await db.from('visitantes').update({
          intentos_fallidos: locked ? 0 : attempts,
          bloqueado_hasta: locked ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : null,
        }).eq('id', visitante.id);
      });
    }
    return { error: 'Correo o contraseña incorrectos.' };
  }

  if (visitante.intentos_fallidos || visitante.bloqueado_hasta) {
    await db.from('visitantes').update({ intentos_fallidos: 0, bloqueado_hasta: null }).eq('id', visitante.id);
  }
  await createVisitanteSession(visitante.id);
  redirect(safeNext(formData.get('siguiente')));
}

export async function salir(formData: FormData) {
  await destroyVisitanteSession();
  redirect(safeNext(formData.get('siguiente')));
}
