import Link from 'next/link';
import type { Sitio } from '@data/_schema/sitio.schema';
import { ColorimetriaPicker } from './ColorimetriaPicker';
import { ThemeToggle } from './ui/ThemeToggle';

export const SiteHeader = ({ sitio }: { sitio: Sitio }) => (
  <header className="site-header">
    <Link className="brand-mark" href="/" aria-label="Ir al inicio">{sitio.nombre.toLowerCase()}</Link>
    <ColorimetriaPicker onlyButtons />
    <nav className="site-nav" aria-label="Navegación principal">
      <Link href="#sobre-mi">Sobre mí</Link>
      <Link href="#proyectos">Proyectos</Link>
      <Link href="#habilidades">Habilidades</Link>
      <Link href="#contacto">Contacto</Link>
      <ThemeToggle />
    </nav>
  </header>
);
