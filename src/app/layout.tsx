import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marca Personal',
  description: 'Sistema fullstack TypeScript con persistencia JSON.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
