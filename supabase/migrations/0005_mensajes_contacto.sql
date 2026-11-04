-- Mensajes del formulario de contacto. Se guardan siempre (aunque falle el correo) y sirven
-- para limitar envíos por visitante. Solo el servidor (service_role) lee y escribe.

create table public.mensajes_contacto (
  id bigint generated always as identity primary key,
  nombre text not null check (char_length(nombre) between 1 and 80),
  correo text not null check (char_length(correo) between 3 and 254),
  mensaje text not null check (char_length(mensaje) between 1 and 4000),
  -- Hash del IP (nunca el IP en claro), solo para el límite de envíos.
  ip_hash text not null,
  enviado boolean not null default false,
  created_at timestamptz not null default now()
);

create index mensajes_contacto_ip_created_idx on public.mensajes_contacto (ip_hash, created_at desc);

alter table public.mensajes_contacto enable row level security;
revoke all on public.mensajes_contacto from anon, authenticated;
grant select, insert, update on public.mensajes_contacto to service_role;
