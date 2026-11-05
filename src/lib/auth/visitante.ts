import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import type { Route } from 'next';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

// Sesiones de visitantes (quienes comentan). Independientes de las del panel: otra tabla,
// otra cookie, y nunca dan acceso a /admin.
const COOKIE = 'visitante_sesion';
const SESSION_DAYS = 30;

export type Visitante = { id: number; nombre: string };

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Hash del IP del visitante (nunca se guarda en claro), para limitar abusos. */
export const getIpHash = async (scope: string) => {
  const requestHeaders = await headers();
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || 'desconocido';
  return createHash('sha256').update(`${scope}:${ip}`).digest('hex');
};

export const createVisitanteSession = async (visitanteId: number) => {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = createAdminClient();
  const { error } = await db.from('sesiones_visitantes').insert({
    token_hash: hashToken(token),
    visitante_id: visitanteId,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error('No se pudo crear la sesión.');
  await db.from('sesiones_visitantes').delete().lt('expires_at', new Date().toISOString());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
};

export const destroyVisitanteSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (token) await createAdminClient().from('sesiones_visitantes').delete().eq('token_hash', hashToken(token));
  cookieStore.delete({ name: COOKIE, path: '/' });
};

type SessionRow = { expires_at: string; visitantes: Visitante | null };

export const getVisitante = cache(async (): Promise<Visitante | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await createAdminClient()
    .from('sesiones_visitantes')
    .select('expires_at, visitantes (id, nombre)')
    .eq('token_hash', hashToken(token))
    .maybeSingle<SessionRow>();
  if (!data?.visitantes || new Date(data.expires_at) <= new Date()) return null;
  return data.visitantes;
});

/** Solo rutas internas como destino tras registrarse o entrar (evita redirecciones abiertas). */
export const safeNext = (value: FormDataEntryValue | string | null | undefined): Route => {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') && !next.startsWith('/admin') ? (next as Route) : '/';
};
