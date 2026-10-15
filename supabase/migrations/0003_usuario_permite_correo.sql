-- Permite usar un correo como nombre de usuario.
alter table public.usuarios drop constraint usuarios_usuario_check;
alter table public.usuarios add constraint usuarios_usuario_check
  check (usuario ~ '^[a-z0-9._+@-]{3,80}$');
