import type { Metadata } from 'next';
import { Bebas_Neue, Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google';
import { CursorGlow } from '@/components/CursorGlow';
import { Footer } from '@/components/Footer';
import { GlassSpotlight } from '@/components/GlassSpotlight';
import { LightBeam } from '@/components/LightBeam';
import { SiteHeader } from '@/components/SiteHeader';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getSitio } from '@/lib/portfolio';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gonzalo - Diseñador de sistemas narrativos',
  description: 'Diseño digital, investigación y narrativa convertidos en sistemas claros.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-ibm-plex-mono' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sitio = await getSitio();
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable} ${bebasNeue.variable}`}>
        <ThemeProvider>
          <a className="skip-link" href="#contenido">Saltar al contenido</a>
          <SiteHeader sitio={sitio} />
          <LightBeam />
          <CursorGlow />
          <GlassSpotlight />
          {children}
          <Footer sitio={sitio} />
        </ThemeProvider>
      </body>
    </html>
  );
}
