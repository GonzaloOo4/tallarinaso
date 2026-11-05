import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CuentaForm } from '../cuenta/CuentaForm';
import { getVisitante, safeNext } from '@/lib/auth/visitante';

export const metadata: Metadata = { title: 'Crear cuenta — Gonzalo Zuñiga', robots: { index: false } };

type Props = { searchParams: Promise<{ siguiente?: string }> };

export default async function RegistroPage({ searchParams }: Props) {
  const siguiente = safeNext((await searchParams).siguiente);
  if (await getVisitante()) redirect(siguiente);

  return (
    <main id="contenido" className="site-main cuenta">
      <section className="glass-panel section-glass cuenta-card" aria-labelledby="registro-title">
        <p className="eyebrow">Comentarios</p>
        <h1 id="registro-title">Crea tu cuenta</h1>
        <p className="meta">Para comentar en los proyectos necesitas una cuenta. Tu correo no se muestra a nadie.</p>
        <CuentaForm modo="registro" siguiente={siguiente} />
        <p className="cuenta-alt">
          ¿Ya tienes cuenta? <Link className="editorial-link" href={`/entrar?siguiente=${encodeURIComponent(siguiente)}`}>Entra aquí</Link>
        </p>
      </section>
    </main>
  );
}
