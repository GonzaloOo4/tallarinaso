-- Cuentas de visitantes: para comentar en un proyecto hay que registrarse primero.
-- Van aparte de public.usuarios (el panel), así una cuenta de visitante nunca da acceso a /admin.
-- Solo el servidor (service_role) lee y escribe estas tablas.

create table public.visitantes (
  id bigint generated always as identity primary key,
  nombre text not null check (char_length(nombre) between 1 and 60),
  -- Se guarda en minúsculas (lo normaliza el servidor) para que sea único sin importar mayúsculas.
  correo text not null unique check (char_length(correo) between 3 and 254 and correo = lower(correo)),
  password_hash text not null,
  -- Hash del IP de registro (nunca el IP en claro), solo para limitar registros.
  ip_hash text not null,
  intentos_fallidos integer not null default 0 check (intentos_fallidos >= 0),
  bloqueado_hasta timestamptz,
  created_at timestamptz not null default now()
);

create index visitantes_ip_created_idx on public.visitantes (ip_hash, created_at desc);

create table public.sesiones_visitantes (
  token_hash text primary key,
  visitante_id bigint not null references public.visitantes (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index sesiones_visitantes_visitante_id_idx on public.sesiones_visitantes (visitante_id);
create index sesiones_visitantes_expires_at_idx on public.sesiones_visitantes (expires_at);

-- Cada comentario nuevo queda ligado a la cuenta que lo escribió.
alter table public.project_comments
  add column visitante_id bigint references public.visitantes (id) on delete set null;
create index project_comments_visitante_id_idx on public.project_comments (visitante_id);

-- Los comentarios ya no se insertan desde la API pública: solo el servidor, con sesión de visitante.
drop policy project_comments_insert_public on public.project_comments;
revoke insert on public.project_comments from anon, authenticated;
grant insert on public.project_comments to service_role;

alter table public.visitantes enable row level security;
alter table public.sesiones_visitantes enable row level security;
revoke all on public.visitantes, public.sesiones_visitantes from anon, authenticated;
grant select, insert, update, delete on public.visitantes, public.sesiones_visitantes to service_role;
