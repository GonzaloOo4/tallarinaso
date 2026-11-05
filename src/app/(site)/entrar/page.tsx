import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CuentaForm } from '../cuenta/CuentaForm';
import { getVisitante, safeNext } from '@/lib/auth/visitante';

export const metadata: Metadata = { title: 'Entrar — Gonzalo Zuñiga', robots: { index: false } };

type Props = { searchParams: Promise<{ siguiente?: string }> };

export default async function EntrarPage({ searchParams }: Props) {
  const siguiente = safeNext((await searchParams).siguiente);
  if (await getVisitante()) redirect(siguiente);

  return (
    <main id="contenido" className="site-main cuenta">
      <section className="glass-panel section-glass cuenta-card" aria-labelledby="entrar-title">
        <p className="eyebrow">Comentarios</p>
        <h1 id="entrar-title">Entra a tu cuenta</h1>
        <CuentaForm modo="entrar" siguiente={siguiente} />
        <p className="cuenta-alt">
          ¿No tienes cuenta? <Link className="editorial-link" href={`/registro?siguiente=${encodeURIComponent(siguiente)}`}>Regístrate</Link>
        </p>
      </section>
    </main>
  );
}
