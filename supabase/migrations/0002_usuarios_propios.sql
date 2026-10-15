-- El panel deja de usar Supabase Auth: usuarios y sesiones propios.
-- El servidor accede con la clave secreta (service_role); anon y authenticated no ven estas tablas.

-- Quitar el acceso de administrador basado en Supabase Auth.
drop policy project_views_select_admin on public.project_views;
drop policy project_likes_select_admin on public.project_likes;
drop policy project_comments_select_admin on public.project_comments;
drop policy project_comments_update_admin on public.project_comments;
drop policy project_comments_delete_admin on public.project_comments;
drop function private.is_admin();
drop table public.admins;

revoke select on public.project_views, public.project_likes from authenticated;
revoke update, delete on public.project_comments from authenticated;
revoke select on public.project_stats from authenticated;

-- Usuarios del panel.
create table public.usuarios (
  id bigint generated always as identity primary key,
  usuario text not null unique check (usuario ~ '^[a-z0-9._-]{3,40}$'),
  nombre text check (char_length(nombre) <= 80),
  password_hash text not null,
  activo boolean not null default true,
  intentos_fallidos integer not null default 0 check (intentos_fallidos >= 0),
  bloqueado_hasta timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sesiones: se guarda el hash SHA-256 del token, nunca el token.
create table public.sesiones (
  token_hash text primary key,
  usuario_id bigint not null references public.usuarios (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index sesiones_usuario_id_idx on public.sesiones (usuario_id);
create index sesiones_expires_at_idx on public.sesiones (expires_at);

-- RLS sin políticas: nadie fuera del servidor puede leerlas ni escribirlas.
alter table public.usuarios enable row level security;
alter table public.sesiones enable row level security;
revoke all on public.usuarios, public.sesiones from anon, authenticated;

grant select, insert, update, delete on public.usuarios, public.sesiones to service_role;
grant select on public.project_views, public.project_likes, public.project_stats to service_role;
grant select, update, delete on public.project_comments to service_role;
