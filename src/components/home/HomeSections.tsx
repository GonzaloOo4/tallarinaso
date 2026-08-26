import { Card } from '@/components/ui/Card';

export const HomeSections = () => (
  <div className="home-sections">
    <section className="content-section" id="sobre-mi" aria-labelledby="about-title">
      <p className="eyebrow">01 / Sobre mí</p>
      <h2 id="about-title">Ideas claras, sistemas que avanzan.</h2>
      <p className="section-copy">Construyo experiencias digitales con criterio técnico, atención al detalle y espacio para que las buenas ideas respiren.</p>
    </section>
    <section className="content-section" id="stack" aria-labelledby="stack-title">
      <p className="eyebrow">02 / Stack</p>
      <h2 id="stack-title">Una base lista para crecer.</h2>
      <div className="card-grid">
        <Card><span className="card-index">01</span><h3>TypeScript</h3><p>Interfaces precisas de extremo a extremo.</p></Card>
        <Card><span className="card-index">02</span><h3>Next.js</h3><p>Rutas rápidas y una arquitectura preparada.</p></Card>
        <Card><span className="card-index">03</span><h3>JSON DB</h3><p>Persistencia simple para iterar sin fricción.</p></Card>
      </div>
    </section>
  </div>
);
