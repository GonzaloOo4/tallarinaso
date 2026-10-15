import { FallingLeaves } from '@/components/FallingLeaves';
import { Footer } from '@/components/Footer';
import { GlassSpotlight } from '@/components/GlassSpotlight';
import { LightBeam } from '@/components/LightBeam';
import { SiteHeader } from '@/components/SiteHeader';
import { getSitio } from '@/lib/portfolio';

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sitio = await getSitio();
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <SiteHeader sitio={sitio} />
      <LightBeam />
      <FallingLeaves />
      <GlassSpotlight />
      {children}
      <Footer sitio={sitio} />
    </>
  );
}
