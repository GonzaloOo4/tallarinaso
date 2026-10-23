'use server';

import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getCuadroPublicado } from '@/lib/portfolio';
import { createAdminClient } from '@/lib/supabase/admin';

export type Interaccion = { likes: number; liked: boolean };

const VISITOR_COOKIE = 'visitante';
const SlugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

// Identificador anónimo del visitante; solo se crea cuando da un like.
const getVisitorId = async (create: boolean) => {
  const cookieStore = await cookies();
  const current = cookieStore.get(VISITOR_COOKIE)?.value;
  if (current && z.string().uuid().safeParse(current).success) return current;
  if (!create) return null;
  const id = randomUUID();
  cookieStore.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
};

const requirePublicado = async (slug: string) => {
  const parsed = SlugSchema.parse(slug);
  if (!(await getCuadroPublicado(parsed))) throw new Error('Proyecto no encontrado.');
  return parsed;
};

const leerEstado = async (db: ReturnType<typeof createAdminClient>, slug: string, visitorId: string | null) => {
  const [{ count }, mine] = await Promise.all([
    db.from('project_likes').select('id', { count: 'exact', head: true }).eq('project_slug', slug),
    visitorId
      ? db.from('project_likes').select('id').eq('project_slug', slug).eq('visitor_id', visitorId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return { likes: count ?? 0, liked: Boolean(mine.data) };
};

/** Registra la vista (si corresponde) y devuelve likes del proyecto. */
export async function abrirProyecto(slug: string, contarVista: boolean): Promise<Interaccion> {
  const projectSlug = await requirePublicado(slug);
  const db = createAdminClient();
  if (contarVista) await db.from('project_views').insert({ project_slug: projectSlug });
  return leerEstado(db, projectSlug, await getVisitorId(false));
}

export async function darLike(slug: string): Promise<Interaccion> {
  const projectSlug = await requirePublicado(slug);
  const db = createAdminClient();
  const visitorId = await getVisitorId(true);
  const { error } = await db.from('project_likes').insert({ project_slug: projectSlug, visitor_id: visitorId });
  // 23505: ya le había dado like (único por visitante y proyecto).
  if (error && error.code !== '23505') throw new Error('No se pudo registrar el like.');
  return leerEstado(db, projectSlug, visitorId);
}
