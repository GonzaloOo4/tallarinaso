'use server';

import { z } from 'zod';
import { getVisitante } from '@/lib/auth/visitante';
import { getCuadroPublicado } from '@/lib/portfolio';
import { createAdminClient } from '@/lib/supabase/admin';

export type Comentario = { id: number; autor: string; texto: string; fecha: string };
export type EstadoComentarios = { comentarios: Comentario[]; visitante: { nombre: string } | null };
export type ComentarState = { status: 'idle' | 'ok' | 'error'; message?: string };

const SlugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const TextoSchema = z.string().trim()
  .min(2, 'Escribe un comentario.')
  .max(2000, 'El comentario es demasiado largo (máximo 2000 caracteres).');
const MAX_POR_HORA = 10;

const requirePublicado = async (slug: string) => {
  const parsed = SlugSchema.parse(slug);
  if (!(await getCuadroPublicado(parsed))) throw new Error('Proyecto no encontrado.');
  return parsed;
};

type Row = { id: number; author_name: string; body: string; created_at: string };

/** Comentarios aprobados del proyecto y, si hay sesión, quién está comentando. */
export async function cargarComentarios(slug: string): Promise<EstadoComentarios> {
  const projectSlug = await requirePublicado(slug);
  const [visitante, { data }] = await Promise.all([
    getVisitante(),
    createAdminClient()
      .from('project_comments')
      .select('id, author_name, body, created_at')
      .eq('project_slug', projectSlug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .limit(100)
      .returns<Row[]>(),
  ]);
  return {
    visitante: visitante && { nombre: visitante.nombre },
    comentarios: (data ?? []).map((row) => ({ id: row.id, autor: row.author_name, texto: row.body, fecha: row.created_at })),
  };
}

// Solo con cuenta: sin sesión de visitante el comentario se rechaza aunque llamen a la acción directo.
export async function comentar(slug: string, _previous: ComentarState, formData: FormData): Promise<ComentarState> {
  const visitante = await getVisitante();
  if (!visitante) return { status: 'error', message: 'Necesitas una cuenta para comentar.' };
  const projectSlug = await requirePublicado(slug);
  const parsed = TextoSchema.safeParse(formData.get('texto'));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Revisa el comentario.' };

  const db = createAdminClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from('project_comments')
    .select('id', { count: 'exact', head: true })
    .eq('visitante_id', visitante.id)
    .gte('created_at', since);
  if ((count ?? 0) >= MAX_POR_HORA) return { status: 'error', message: 'Has comentado mucho en poco tiempo. Espera un rato.' };

  const { error } = await db.from('project_comments').insert({
    project_slug: projectSlug,
    author_name: visitante.nombre,
    body: parsed.data,
    visitante_id: visitante.id,
  });
  if (error) return { status: 'error', message: 'No se pudo guardar el comentario. Inténtalo en un momento.' };
  return { status: 'ok' };
}
