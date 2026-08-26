import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marca Personal',
  description: 'Sistema fullstack TypeScript con persistencia JSON.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
