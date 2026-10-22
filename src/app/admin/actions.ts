'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession, requireAdmin } from '@/lib/auth/session';
import { CONFIG_TAG, RESPETAR_REDUCIR_ANIMACIONES } from '@/lib/configuracion';
import { createAdminClient } from '@/lib/supabase/admin';

export type LoginState = { error?: string };

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const INVALID = 'Usuario o contraseña incorrectos.';

const LoginSchema = z.object({
  usuario: z.string().trim().toLowerCase().min(1).max(80),
  password: z.string().min(1).max(200),
});

type UsuarioRow = {
  id: number;
  password_hash: string;
  activo: boolean;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
};

// Si el usuario no existe se verifica contra un hash falso para que la
// respuesta tarde lo mismo y no revele qué usuarios existen.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword(crypto.randomUUID()));

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({ usuario: formData.get('usuario'), password: formData.get('password') });
  if (!parsed.success) return { error: 'Ingresa tu usuario y contraseña.' };

  const db = createAdminClient();
  const { data: user, error } = await db
    .from('usuarios')
    .select('id, password_hash, activo, intentos_fallidos, bloqueado_hasta')
    .eq('usuario', parsed.data.usuario)
    .maybeSingle<UsuarioRow>();
  if (error) return { error: 'No se pudo conectar con la base de datos.' };

  if (user?.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
    return { error: 'Demasiados intentos fallidos. Intenta de nuevo en unos minutos.' };
  }

  const valid = await verifyPassword(parsed.data.password, user?.password_hash ?? (await getDummyHash()));
  if (!user || !user.activo || !valid) {
    if (user) {
      const attempts = user.intentos_fallidos + 1;
      const locked = attempts >= MAX_ATTEMPTS;
      // Tras responder, para que el tiempo de respuesta no delate que el usuario existe.
      after(async () => {
        await db.from('usuarios').update({
          intentos_fallidos: locked ? 0 : attempts,
          bloqueado_hasta: locked ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : null,
        }).eq('id', user.id);
      });
    }
    return { error: INVALID };
  }

  await db.from('usuarios').update({
    intentos_fallidos: 0,
    bloqueado_hasta: null,
    last_login_at: new Date().toISOString(),
  }).eq('id', user.id);
  await createSession(user.id);
  redirect('/admin');
}

export type PasswordState = { error?: string; ok?: boolean };

const PasswordSchema = z.object({
  actual: z.string().min(1),
  nueva: z.string().min(12, 'La nueva contraseña debe tener al menos 12 caracteres.').max(200),
  confirmacion: z.string(),
}).refine((data) => data.nueva === data.confirmacion, { message: 'Las contraseñas nuevas no coinciden.' });

export async function changePassword(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  const { user, db } = await requireAdmin();
  const parsed = PasswordSchema.safeParse({
    actual: formData.get('actual'),
    nueva: formData.get('nueva'),
    confirmacion: formData.get('confirmacion'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Revisa los campos.' };

  const { data: row } = await db.from('usuarios').select('password_hash').eq('id', user.id).single<{ password_hash: string }>();
  if (!row || !(await verifyPassword(parsed.data.actual, row.password_hash))) {
    return { error: 'La contraseña actual no es correcta.' };
  }

  const { error } = await db.from('usuarios').update({
    password_hash: await hashPassword(parsed.data.nueva),
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);
  if (error) return { error: 'No se pudo guardar la contraseña.' };

  // Cierra todas las sesiones (incluidas las de otros dispositivos) y abre una nueva aquí.
  await db.from('sesiones').delete().eq('usuario_id', user.id);
  await createSession(user.id);
  return { ok: true };
}

export async function signOut() {
  await destroySession();
  redirect('/admin/login');
}

const CommentIdSchema = z.coerce.number().int().positive();
const StatusSchema = z.enum(['approved', 'rejected', 'pending']);

export async function setCommentStatus(formData: FormData) {
  const { db } = await requireAdmin();
  const id = CommentIdSchema.parse(formData.get('id'));
  const status = StatusSchema.parse(formData.get('status'));
  const { error } = await db.from('project_comments').update({ status }).eq('id', id);
  if (error) throw new Error('No se pudo actualizar el comentario.');
  revalidatePath('/admin');
}

export async function setRespetarReducirAnimaciones(formData: FormData) {
  const { db } = await requireAdmin();
  const valor = z.enum(['true', 'false']).parse(formData.get('respetar')) === 'true';
  const { error } = await db.from('configuracion').upsert({
    clave: RESPETAR_REDUCIR_ANIMACIONES,
    valor,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error('No se pudo guardar el ajuste.');
  revalidateTag(CONFIG_TAG);
  revalidatePath('/', 'layout');
}

export async function deleteComment(formData: FormData) {
  const { db } = await requireAdmin();
  const id = CommentIdSchema.parse(formData.get('id'));
  const { error } = await db.from('project_comments').delete().eq('id', id);
  if (error) throw new Error('No se pudo eliminar el comentario.');
  revalidatePath('/admin');
}
