import { ColorableName } from '@/components/ColorableName';
import { HeroCrystal } from '@/components/HeroCrystal';
import { LiquidText } from '@/components/LiquidText';
import { MarqueeBanner } from '@/components/MarqueeBanner';
import { getCuadrosPublicados, getHabilidades, getSitio } from '@/lib/portfolio';

export default async function Home() {
  const [sitio, habilidades, cuadros] = await Promise.all([getSitio(), getHabilidades(), getCuadrosPublicados()]);
  const grupos = Object.entries(Object.groupBy(habilidades, ({ grupo }) => grupo));
  return <main id="contenido" className="site-main">
    <section className="hero scene" aria-labelledby="hero-title"><div className="glass-panel hero-glass"><LiquidText className="hero-liquid"><h1 id="hero-title"><ColorableName className="hero-name">{sitio.nombre}</ColorableName></h1><p>{sitio.hero}</p></LiquidText><HeroCrystal /></div></section>
    <MarqueeBanner />
    <section className="scene" id="sobre-mi" aria-labelledby="sobre-mi-title"><div className="glass-panel section-glass"><h2 id="sobre-mi-title">Sobre mí</h2><div className="prose">{sitio.bio.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div></section>
    <section className="scene" id="proyectos" aria-labelledby="proyectos-title"><div className="glass-panel section-glass"><h2 id="proyectos-title">Proyectos</h2>{cuadros.length === 0 ? <p className="meta">Aún no hay cuadros publicados.</p> : <div className="project-list">{cuadros.map((cuadro) => <article className="project-box" key={cuadro.slug}><span className="project-number">Cuadro {cuadro.numero}</span><div><h3><a className="editorial-link" href={`/proyectos/${cuadro.slug}`}>{cuadro.titulo}</a></h3><p className="meta">{cuadro.rol} · {cuadro.anio} · {cuadro.formato.join(' · ')}</p><p>{cuadro.resumen}</p><a className="arrow-link" href={`/proyectos/${cuadro.slug}`}>Ver proyecto completo <span aria-hidden="true">→</span></a></div></article>)}</div>}</div></section>
    <section className="scene" id="habilidades" aria-labelledby="habilidades-title"><div className="glass-panel section-glass"><h2 id="habilidades-title">Habilidades</h2><div className="skill-groups">{grupos.map(([grupo, items]) => <div key={grupo}><p className="meta">{grupo}</p><div className="skill-grid">{items?.map((habilidad) => <div className="skill-card" key={habilidad.nombre}>{habilidad.nombre}</div>)}</div></div>)}</div></div></section>
    <section className="scene" id="contacto" aria-labelledby="contacto-title"><div className="glass-panel section-glass"><h2 id="contacto-title">Contacto</h2><div className="contact-list">{sitio.canales.map((canal) => <a className="contact-row" href={canal.url} key={canal.url}><span className="meta">{canal.etiqueta}</span><span>{canal.valor}</span><span aria-hidden="true">→</span></a>)}</div></div></section>
  </main>;
}
