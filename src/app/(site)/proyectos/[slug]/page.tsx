import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Bloque } from '@data/_schema/cuadro.schema';
import { LikeOla } from '@/components/LikeOla';
import { SeaDetails } from '@/components/SeaDetails';
import { getCuadroPublicado, getCuadrosPublicados, tienePagina } from '@/lib/portfolio';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCuadrosPublicados()).filter(tienePagina).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cuadro = await getCuadroPublicado((await params).slug);
  if (!cuadro) return {};
  return { title: `${cuadro.titulo} — Gonzalo Zuñiga`, description: cuadro.resumen };
}

const Bloques = ({ bloques }: { bloques: Bloque[] }) => (
  <>
    {bloques.map((bloque) => (
      <div className="bloque" key={bloque.titulo}>
        <h3>{bloque.titulo}</h3>
        {bloque.texto && <p>{bloque.texto}</p>}
        {bloque.items && (
          <dl className="bloque-items">
            {bloque.items.map((item) => (
              <div key={item.titulo}>
                <dt>{item.titulo}</dt>
                <dd>{item.texto}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    ))}
  </>
);

export default async function ProyectoPage({ params }: Props) {
  const cuadro = await getCuadroPublicado((await params).slug);
  if (!cuadro || !tienePagina(cuadro)) notFound();
  const coautores = cuadro.coautores?.length ? new Intl.ListFormat('es', { type: 'conjunction' }).format(cuadro.coautores) : null;

  return (
    <main id="contenido" className="site-main proyecto">
      <section className="proyecto-hero" aria-labelledby="proyecto-title">
        <Link className="arrow-link proyecto-back" href="/#proyectos"><span aria-hidden="true">←</span> Proyectos</Link>
        <p className="eyebrow">Cuadro {cuadro.numero} · {cuadro.anio} · {cuadro.rol}</p>
        <h1 id="proyecto-title" className="proyecto-title"><span className="colorable-name">{cuadro.titulo}</span></h1>
        {coautores && <p className="meta">En coautoría con {coautores}</p>}
        <p className="proyecto-lead">{cuadro.resumen}</p>
        <div className="proyecto-actions">
          <LikeOla slug={cuadro.slug} />
          {cuadro.enlace && (
            <a className="arrow-link" href={cuadro.enlace} target="_blank" rel="noopener noreferrer">
              Documentación completa <span aria-hidden="true">↗</span><span className="sr-only"> (abre en otra pestaña)</span>
            </a>
          )}
        </div>
      </section>

      {cuadro.portada && (
        <figure className={cn('project-cover proyecto-cover', cuadro.ambiente && `project-ambiente-${cuadro.ambiente}`)}>
          <Image src={cuadro.portada.src} alt={cuadro.portada.alt} width={1600} height={1000} sizes="(max-width: 900px) 100vw, 880px" priority />
          {cuadro.ambiente === 'mar' && <SeaDetails />}
        </figure>
      )}

      <section className="scene" aria-labelledby="proceso-title">
        <div className="glass-panel section-glass">
          <h2 id="proceso-title">Proceso</h2>
          <Bloques bloques={cuadro.proceso ?? []} />
        </div>
      </section>

      <section className="scene" aria-labelledby="resultado-title">
        <div className="glass-panel section-glass">
          <h2 id="resultado-title">Resultado</h2>
          <Bloques bloques={cuadro.resultado ?? []} />
        </div>
      </section>

      <section className="proyecto-fin" aria-label="Cierre del proyecto">
        <p className="meta">Formato: {cuadro.formato.join(' · ')} — Herramientas: {cuadro.herramientas.join(' · ')}</p>
        <Link className="arrow-link" href="/#proyectos"><span aria-hidden="true">←</span> Volver a proyectos</Link>
      </section>
    </main>
  );
}
