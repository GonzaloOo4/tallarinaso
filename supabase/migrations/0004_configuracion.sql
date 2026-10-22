-- Ajustes del sitio editables desde /admin (clave → valor JSON).
-- Solo el servidor lee y escribe (service_role); el sitio público recibe el valor ya resuelto.

create table public.configuracion (
  clave text primary key check (clave ~ '^[a-z0-9_]{1,60}$'),
  valor jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.configuracion enable row level security;
revoke all on public.configuracion from anon, authenticated;
grant select, insert, update on public.configuracion to service_role;

-- false: las animaciones se ven siempre, aunque el sistema pida reducir movimiento.
insert into public.configuracion (clave, valor) values ('respetar_reducir_animaciones', 'false');
