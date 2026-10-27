'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Sitio } from '@data/_schema/sitio.schema';
import { cn } from '@/lib/utils';
import { ColorMenu } from './ColorMenu';
import { HeaderClock } from './HeaderClock';
import { Monogram } from './Monogram';
import { ThemeToggle } from './ui/ThemeToggle';

const LINKS = [
  { href: '/#sobre-mi', label: 'Sobre mí' },
  { href: '/#proyectos', label: 'Proyectos' },
  { href: '/#habilidades', label: 'Habilidades' },
  { href: '/#contacto', label: 'Contacto' },
] as const;

const TOP_ZONE = 80; // px desde arriba en los que el header siempre se ve, transparente como siempre
const HIDE_AFTER = 10; // bajar esto (acumulado) lo esconde
// Subir esto seguido lo muestra. Es alto a propósito: en el celular el scroll táctil da
// pequeños rebotes hacia arriba (fin del gesto, barra del navegador) que no son intención de navegar.
const SHOW_AFTER = 80;

// Mientras se lee (scroll hacia abajo) el header se esconde; con un scroll hacia arriba vuelve.
// Fuera de la zona superior se vuelve más opaco para no mezclarse con el texto de debajo.
const useScrollHeader = (keepVisible: boolean) => {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let down = 0; // recorrido seguido hacia abajo
    let up = 0; // recorrido seguido hacia arriba
    let frame: number | null = null;
    const update = () => {
      frame = null;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      setScrolled(y > TOP_ZONE);
      if (y <= TOP_ZONE) { setHidden(false); down = up = 0; return; }
      if (delta > 0) { down += delta; up = 0; } else if (delta < 0) { up -= delta; down = 0; }
      if (down > HIDE_AFTER) setHidden(true);
      else if (up > SHOW_AFTER) setHidden(false);
    };
    const onScroll = () => { if (frame === null) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return { hidden: hidden && !keepVisible, scrolled, show: () => setHidden(false) };
};

export const SiteHeader = ({ sitio }: { sitio: Sitio }) => {
  const [open, setOpen] = useState(false);
  const { hidden, scrolled, show } = useScrollHeader(open);
  const ciudad = sitio.ubicacion?.split(',')[0]?.trim();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    // Con teclado, al llegar al header con Tab vuelve a mostrarse.
    <header className={cn('site-header', open && 'is-open', hidden && 'is-hidden', scrolled && 'is-scrolled')} onFocus={show}>
      <div className="site-header-bar">
        <Link className="brand-mark" href="/" aria-label={`${[sitio.nombre, sitio.apellido].filter(Boolean).join(' ')} — ir al inicio`}>
          <Monogram className="brand-monogram" />
        </Link>
        {ciudad && <HeaderClock ciudad={ciudad} />}
        <nav className="site-nav" aria-label="Navegación principal">
          {LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="site-header-tools">
          <ColorMenu />
          <ThemeToggle />
          <button
            className="site-menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </div>
      <nav id="site-menu" className="site-menu" aria-label="Menú" hidden={!open}>
        {LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
      </nav>
    </header>
  );
};
