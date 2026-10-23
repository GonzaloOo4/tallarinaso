import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="status-page">
      <section className="glass-panel status-card" aria-labelledby="status-title">
        <p className="eyebrow">Error 404</p>
        <h1 id="status-title">Esta página se perdió en el bosque</h1>
        <p>El enlace puede estar roto o la página ya no existe.</p>
        <Link className="button-primary" href="/">Volver al inicio <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
