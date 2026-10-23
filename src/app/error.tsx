'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="status-page">
      <section className="glass-panel status-card" aria-labelledby="status-title">
        <p className="eyebrow">Error</p>
        <h1 id="status-title">Algo falló</h1>
        <p>No pudimos cargar esta parte del sitio. Inténtalo de nuevo en un momento.</p>
        <button className="button-primary" onClick={reset} type="button">Reintentar <span aria-hidden="true">↻</span></button>
      </section>
    </main>
  );
}
