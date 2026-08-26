import Link from 'next/link';
import { ThemeToggle } from './ui/ThemeToggle';

export const SiteHeader = () => (
  <header className="site-header">
    <Link className="brand-mark" href="/" aria-label="Ir al inicio">GZ<span>.</span></Link>
    <nav className="site-nav" aria-label="Navegación principal">
      <Link href="#sobre-mi">Sobre mí</Link>
      <Link href="#stack">Stack</Link>
      <ThemeToggle />
    </nav>
  </header>
);
