import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { SESSION_COOKIE } from './constants';

const SESSION_DAYS = 7;

export type SessionUser = { id: number; usuario: string; nombre: string | null };

type SessionRow = { expires_at: string; usuarios: (SessionUser & { activo: boolean }) | null };

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const createSession = async (usuarioId: number) => {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = createAdminClient();
  const { error } = await db.from('sesiones').insert({
    token_hash: hashToken(token),
    usuario_id: usuarioId,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error('No se pudo crear la sesión.');
  await db.from('sesiones').delete().lt('expires_at', new Date().toISOString());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    expires: expiresAt,
  });
};

export const destroySession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await createAdminClient().from('sesiones').delete().eq('token_hash', hashToken(token));
  cookieStore.delete({ name: SESSION_COOKIE, path: '/admin' });
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { data } = await createAdminClient()
    .from('sesiones')
    .select('expires_at, usuarios (id, usuario, nombre, activo)')
    .eq('token_hash', hashToken(token))
    .maybeSingle<SessionRow>();
  const user = data?.usuarios;
  if (!data || !user?.activo || new Date(data.expires_at) <= new Date()) return null;
  return { id: user.id, usuario: user.usuario, nombre: user.nombre };
});

/** Devuelve el usuario del panel y un cliente de base de datos; si no hay sesión, redirige al login. */
export const requireAdmin = async () => {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  return { user, db: createAdminClient() };
};
