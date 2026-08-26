'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="hero-shell">
      <section className="hero-content">
        <p className="eyebrow">500</p>
        <h1 className="hero-title">Algo falló</h1>
        <button className="tech-badge" onClick={reset} type="button">Reintentar</button>
      </section>
    </main>
  );
}
