-- Panel de administración + primeras tablas de interacción de visitantes.
-- Los proyectos viven en data/cuadro.json, así que se referencian por slug.

create schema if not exists private;

-- Administradores: usuarios de Supabase Auth con acceso al panel.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create policy admins_select_self on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Fuera del esquema expuesto por la API; se usa desde las políticas.
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Vistas de un proyecto.
create table public.project_views (
  id bigint generated always as identity primary key,
  project_slug text not null check (project_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create index project_views_slug_created_idx on public.project_views (project_slug, created_at);

-- Likes: un visitor_id anónimo (generado en el navegador) por proyecto.
create table public.project_likes (
  id bigint generated always as identity primary key,
  project_slug text not null check (project_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  unique (project_slug, visitor_id)
);

-- Comentarios: entran como 'pending' y solo se publican al aprobarlos.
create table public.project_comments (
  id bigint generated always as identity primary key,
  project_slug text not null check (project_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  author_name text not null check (char_length(author_name) between 1 and 80),
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index project_comments_slug_status_idx on public.project_comments (project_slug, status, created_at);
create index project_comments_status_created_idx on public.project_comments (status, created_at desc);

alter table public.project_views enable row level security;
alter table public.project_likes enable row level security;
alter table public.project_comments enable row level security;

-- Visitantes (anon) solo pueden insertar; los comentarios siempre entran pendientes.
create policy project_views_insert_public on public.project_views
  for insert to anon, authenticated with check (true);

create policy project_likes_insert_public on public.project_likes
  for insert to anon, authenticated with check (true);

create policy project_comments_insert_public on public.project_comments
  for insert to anon, authenticated with check (status = 'pending');

create policy project_comments_select_approved on public.project_comments
  for select to anon, authenticated using (status = 'approved');

-- Administradores: lectura total y moderación.
create policy project_views_select_admin on public.project_views
  for select to authenticated using ((select private.is_admin()));

create policy project_likes_select_admin on public.project_likes
  for select to authenticated using ((select private.is_admin()));

create policy project_comments_select_admin on public.project_comments
  for select to authenticated using ((select private.is_admin()));

create policy project_comments_update_admin on public.project_comments
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy project_comments_delete_admin on public.project_comments
  for delete to authenticated using ((select private.is_admin()));

-- Privilegios explícitos (mínimos) para la Data API.
revoke all on public.admins, public.project_views, public.project_likes, public.project_comments from anon, authenticated;
grant select on public.admins to authenticated;
grant insert (project_slug) on public.project_views to anon, authenticated;
grant insert (project_slug, visitor_id) on public.project_likes to anon, authenticated;
grant insert (project_slug, author_name, body) on public.project_comments to anon, authenticated;
grant select on public.project_comments to anon, authenticated;
grant select on public.project_views, public.project_likes to authenticated;
grant update (status), delete on public.project_comments to authenticated;

-- Resumen por proyecto; security_invoker respeta el RLS de quien consulta.
create view public.project_stats with (security_invoker = true) as
select
  slugs.project_slug,
  (select count(*) from public.project_views v where v.project_slug = slugs.project_slug) as views,
  (select count(*) from public.project_likes l where l.project_slug = slugs.project_slug) as likes,
  (select count(*) from public.project_comments c where c.project_slug = slugs.project_slug and c.status = 'pending') as pending_comments,
  (select count(*) from public.project_comments c where c.project_slug = slugs.project_slug and c.status = 'approved') as approved_comments
from (
  select project_slug from public.project_views
  union select project_slug from public.project_likes
  union select project_slug from public.project_comments
) as slugs;

revoke all on public.project_stats from anon;
grant select on public.project_stats to authenticated;
