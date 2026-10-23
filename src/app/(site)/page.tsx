import Image from 'next/image';
import { ColorableName } from '@/components/ColorableName';
import { Fireflies } from '@/components/Fireflies';
import { HeroPhrase } from '@/components/HeroPhrase';
import { LiquidText } from '@/components/LiquidText';
import { MarqueeBanner } from '@/components/MarqueeBanner';
import { NameColorCycle, NameColorHint } from '@/components/NameColorCycle';
import { SeaDetails } from '@/components/SeaDetails';
import { getRespetarReducirAnimaciones } from '@/lib/configuracion';
import { getCuadrosPublicados, getHabilidades, getSitio, tienePagina } from '@/lib/portfolio';
import { cn } from '@/lib/utils';

const listFormat = new Intl.ListFormat('es', { type: 'conjunction' });

export default async function Home() {
  const [sitio, habilidades, cuadros, respetarReducirAnimaciones] = await Promise.all([
    getSitio(), getHabilidades(), getCuadrosPublicados(), getRespetarReducirAnimaciones(),
  ]);
  const grupos = Object.entries(Object.groupBy(habilidades, ({ grupo }) => grupo));
  const contacto = sitio.canales[0];
  // Los cuadros vienen ordenados; el de mayor orden es el más reciente.
  const reciente = cuadros.at(-1);

  return (
    <main id="contenido" className="site-main">
      <section className="hero hero-editorial" aria-labelledby="hero-title">
        <Fireflies respectReducedMotion={respetarReducirAnimaciones} />
        <div className="hero-copy">
          <p className="eyebrow">Diseño digital{sitio.ubicacion && ` · ${sitio.ubicacion}`}</p>
          <LiquidText className="hero-liquid">
            <h1 id="hero-title">
              <NameColorCycle>
                <ColorableName className="hero-name">
                  <span className="hero-line">{sitio.nombre}</span>
                  {sitio.apellido && <> <span className="hero-line">{sitio.apellido}</span></>}
                </ColorableName>
              </NameColorCycle>
            </h1>
          </LiquidText>
          <NameColorHint />
          <p className="hero-lead"><HeroPhrase text={sitio.hero} /></p>
          <div className="hero-actions">
            <a className="button-primary" href="#proyectos">Ver proyectos <span aria-hidden="true">↓</span></a>
            {contacto && <a className="button-ghost" href={contacto.url}>Escríbeme <span aria-hidden="true">→</span></a>}
          </div>
        </div>
        <div className="hero-strip">
          {sitio.ahora && (
            <p className="hero-now">
              <span className="meta">Ahora</span>
              <span className="hero-now-text">{sitio.ahora}</span>
            </p>
          )}
          {reciente && (
            <a className="hero-recent" href={tienePagina(reciente) || !reciente.enlace ? `/proyectos/${reciente.slug}` : reciente.enlace}>
              <span className="meta">Proyecto reciente</span>
              <span className="hero-recent-title">{reciente.titulo} <span aria-hidden="true">→</span></span>
            </a>
          )}
        </div>
      </section>

      <MarqueeBanner />

      <section className="scene" id="sobre-mi" aria-labelledby="sobre-mi-title">
        <div className="glass-panel section-glass">
          <h2 id="sobre-mi-title">Sobre mí</h2>
          <div className="prose">{sitio.bio.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </section>

      <section className="scene" id="proyectos" aria-labelledby="proyectos-title">
        <div className="glass-panel section-glass">
          <h2 id="proyectos-title">Proyectos</h2>
          {cuadros.length === 0 ? <p className="meta">Aún no hay cuadros publicados.</p> : (
            <div className="project-list">
              {cuadros.map((cuadro) => {
                const interno = tienePagina(cuadro) || !cuadro.enlace;
                const href = interno ? `/proyectos/${cuadro.slug}` : cuadro.enlace;
                const external = interno ? {} : { target: '_blank', rel: 'noopener noreferrer' };
                return (
                  <article className={cn('project-box', cuadro.ambiente && `project-ambiente-${cuadro.ambiente}`)} key={cuadro.slug}>
                    <span className="project-number">Cuadro {cuadro.numero}</span>
                    <div>
                      {cuadro.portada && (
                        <a className="project-cover" href={href} {...external} tabIndex={-1} aria-hidden="true">
                          <Image src={cuadro.portada.src} alt="" width={1600} height={1000} sizes="(max-width: 900px) 100vw, 760px" />
                          {cuadro.ambiente === 'mar' && <SeaDetails />}
                        </a>
                      )}
                      <h3><a className="editorial-link" href={href} {...external}>{cuadro.titulo}</a></h3>
                      <p className="meta">{cuadro.rol} · {cuadro.anio} · {cuadro.formato.join(' · ')}</p>
                      {cuadro.coautores?.length ? <p className="meta">En coautoría con {listFormat.format(cuadro.coautores)}</p> : null}
                      <p>{cuadro.resumen}</p>
                      <a className="arrow-link" href={href} {...external}>
                        {interno ? 'Ver el caso completo' : 'Ver proyecto'} <span aria-hidden="true">{interno ? '→' : '↗'}</span>
                        {!interno && <span className="sr-only"> (abre en otra pestaña)</span>}
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="scene" id="habilidades" aria-labelledby="habilidades-title">
        <div className="glass-panel section-glass">
          <h2 id="habilidades-title">Habilidades</h2>
          <div className="skill-groups">
            {grupos.map(([grupo, items]) => (
              <div key={grupo}>
                <p className="meta">{grupo}</p>
                <div className="skill-grid">{items?.map((habilidad) => <div className="skill-card" key={habilidad.nombre}>{habilidad.nombre}</div>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="scene" id="contacto" aria-labelledby="contacto-title">
        <div className="glass-panel section-glass">
          <h2 id="contacto-title">Contacto</h2>
          <div className="contact-list">
            {sitio.canales.map((canal) => (
              <a className="contact-row" href={canal.url} key={canal.url}>
                <span className="meta">{canal.etiqueta}</span><span>{canal.valor}</span><span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
