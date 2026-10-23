import { NameColorSync } from '@/components/ColorimetriaPicker';
import { FallingLeaves } from '@/components/FallingLeaves';
import { Footer } from '@/components/Footer';
import { GlassSpotlight } from '@/components/GlassSpotlight';
import { LightBeam } from '@/components/LightBeam';
import { SiteHeader } from '@/components/SiteHeader';
import { getRespetarReducirAnimaciones } from '@/lib/configuracion';
import { getSitio } from '@/lib/portfolio';

// El ajuste de animaciones se edita en /admin; el sitio lo vuelve a leer como mucho cada 30 s.
export const revalidate = 30;

const REDUCED_MOTION_CSS =
  '@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation: none !important; transition: none !important; } .falling-leaves { display: none; } }';

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [sitio, respetarReducirAnimaciones] = await Promise.all([getSitio(), getRespetarReducirAnimaciones()]);
  return (
    <>
      {respetarReducirAnimaciones && <style>{REDUCED_MOTION_CSS}</style>}
      <NameColorSync />
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <SiteHeader sitio={sitio} />
      <LightBeam respectReducedMotion={respetarReducirAnimaciones} />
      <FallingLeaves />
      <GlassSpotlight />
      {children}
      <Footer sitio={sitio} />
    </>
  );
}
