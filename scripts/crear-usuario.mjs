// Crea un usuario del panel o cambia su contraseña si ya existe.
// Uso (en tu terminal): npm run db:crear-usuario -- <usuario> [nombre visible]
// La contraseña se pide sin mostrarse. Sin terminal interactiva se lee de CLAVE_USUARIO.
import { createInterface } from 'node:readline';
import postgres from 'postgres';
import { hashPassword } from '../src/lib/auth/password.ts';

const [usuarioArg, ...nombreParts] = process.argv.slice(2);
const usuario = usuarioArg?.trim().toLowerCase();
const nombre = nombreParts.join(' ').trim() || null;

if (!usuario || !/^[a-z0-9._+@-]{3,80}$/.test(usuario)) {
  console.error('Uso: npm run db:crear-usuario -- <usuario> [nombre]  (3-80 caracteres: a-z 0-9 . _ + @ -)');
  process.exit(1);
}

const askHidden = (question) =>
  new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) process.stdout.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });

let password = process.env.CLAVE_USUARIO;
if (!password) {
  if (!process.stdin.isTTY) {
    console.error('Ejecuta el comando en una terminal interactiva o define CLAVE_USUARIO.');
    process.exit(1);
  }
  password = await askHidden('Contraseña: ');
  if (password !== (await askHidden('Repite la contraseña: '))) {
    console.error('Las contraseñas no coinciden.');
    process.exit(1);
  }
}

if (password.length < 12) {
  console.error('La contraseña debe tener al menos 12 caracteres.');
  process.exit(1);
}

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) throw new Error('Falta POSTGRES_URL_NON_POOLING en .env.local');
const sql = postgres(url.replace(/[?&]sslmode=[^&]*/, ''), { ssl: 'require', max: 1 });

try {
  const passwordHash = await hashPassword(password);
  const [row] = await sql`
    insert into public.usuarios (usuario, nombre, password_hash)
    values (${usuario}, ${nombre}, ${passwordHash})
    on conflict (usuario) do update set
      password_hash = excluded.password_hash,
      nombre = coalesce(excluded.nombre, public.usuarios.nombre),
      intentos_fallidos = 0,
      bloqueado_hasta = null,
      updated_at = now()
    returning (xmax = 0) as creado, id`;
  // Cambiar la contraseña cierra las sesiones abiertas de ese usuario.
  if (!row.creado) await sql`delete from public.sesiones where usuario_id = ${row.id}`;
  console.log(row.creado ? `✓ Usuario "${usuario}" creado.` : `✓ Contraseña de "${usuario}" actualizada.`);
} finally {
  await sql.end();
}
