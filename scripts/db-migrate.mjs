// Aplica en orden los .sql de supabase/migrations que aún no se han ejecutado.
// Uso: npm run db:migrate
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import postgres from 'postgres';

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) throw new Error('Falta POSTGRES_URL_NON_POOLING en .env.local');

const directory = path.resolve('supabase/migrations');
const sql = postgres(url.replace(/[?&]sslmode=[^&]*/, ''), { ssl: 'require', max: 1, onnotice: () => {} });

try {
  await sql`create schema if not exists private`;
  await sql`create table if not exists private.schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const applied = new Set((await sql`select name from private.schema_migrations`).map((row) => row.name));
  const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const source = await readFile(path.join(directory, file), 'utf8');
    await sql.begin(async (tx) => {
      await tx.unsafe(source);
      await tx`insert into private.schema_migrations (name) values (${file})`;
    });
    console.log(`✓ ${file}`);
  }
  console.log('Migraciones al día.');
} finally {
  await sql.end();
}
