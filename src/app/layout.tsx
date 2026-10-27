import type { Metadata } from 'next';
import { Bebas_Neue, Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google';
import { MapLabelReveal } from '@/components/MapLabelReveal';
import { ScrollDepth } from '@/components/ScrollDepth';
import { SierraLandscape } from '@/components/SierraLandscape';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gonzalo Zuñiga — Diseño digital y sistemas narrativos',
  description: 'Diseño digital, investigación y narrativa convertidos en sistemas claros.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-ibm-plex-mono' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable} ${bebasNeue.variable}`}>
        <SierraLandscape />
        <ScrollDepth />
        <MapLabelReveal />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
