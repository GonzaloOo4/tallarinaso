'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { z } from 'zod';
import { sendContactEmail } from '@/lib/email';
import { createAdminClient } from '@/lib/supabase/admin';

export type ContactState = { status: 'idle' | 'ok' | 'error'; message?: string };

const MAX_PER_WINDOW = 3; // envíos permitidos por visitante…
const WINDOW_MINUTES = 15; // …en esta ventana
const MIN_FILL_MS = 3000; // un humano tarda más que esto en llenar el formulario

const ContactSchema = z.object({
  nombre: z.string().trim().min(1, 'Escribe tu nombre.').max(80, 'El nombre es demasiado largo.'),
  correo: z.string().trim().email('Escribe un correo válido.').max(254),
  mensaje: z.string().trim().min(10, 'Cuéntame un poco más (mínimo 10 caracteres).').max(4000, 'El mensaje es demasiado largo.'),
});

// Acción pública (formulario abierto): no hay sesión que verificar, así que se valida todo
// el input, se filtran bots y se limita la frecuencia por visitante.
export async function sendContact(_previous: ContactState, formData: FormData): Promise<ContactState> {
  // Trampa para bots: campo invisible que una persona deja vacío, y tiempo mínimo de llenado.
  const startedAt = Number(formData.get('t'));
  if (formData.get('empresa_web') || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: 'ok' }; // a un bot no se le revela que fue descartado
  }

  const parsed = ContactSchema.safeParse({
    nombre: formData.get('nombre'),
    correo: formData.get('correo'),
    mensaje: formData.get('mensaje'),
  });
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Revisa los campos.' };

  const requestHeaders = await headers();
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || 'desconocido';
  const ipHash = createHash('sha256').update(`contacto:${ip}`).digest('hex');

  // Guardar el mensaje y limitar envíos es lo deseable, pero lo esencial es el correo: si la base
  // de datos no responde, se sigue adelante (los filtros anti-bots de arriba siguen activos).
  let db: ReturnType<typeof createAdminClient> | null = null;
  let savedId: number | null = null;
  try {
    db = createAdminClient();
    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count, error: countError } = await db
      .from('mensajes_contacto')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_PER_WINDOW) {
      return { status: 'error', message: 'Ya recibí tus mensajes. Espera unos minutos antes de enviar otro.' };
    }
    // Se guarda antes de enviar: si el correo falla, el mensaje no se pierde.
    const { data: saved, error: insertError } = await db
      .from('mensajes_contacto')
      .insert({ ...parsed.data, ip_hash: ipHash })
      .select('id')
      .single<{ id: number }>();
    if (insertError) throw insertError;
    savedId = saved?.id ?? null;
  } catch (error) {
    console.error('Contacto: base de datos no disponible, se envía solo el correo', error);
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (error) {
    console.error('Correo de contacto no enviado', error);
    return {
      status: 'error',
      message: savedId
        ? 'Tu mensaje quedó guardado, pero el correo no salió. Si es urgente, escríbeme directo.'
        : 'No se pudo enviar ahora. Inténtalo en un momento o escríbeme directo al correo de arriba.',
    };
  }

  if (db && savedId) await db.from('mensajes_contacto').update({ enviado: true }).eq('id', savedId);
  return { status: 'ok' };
}
