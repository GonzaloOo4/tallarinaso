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

export const SiteHeader = ({ sitio }: { sitio: Sitio }) => {
  const [open, setOpen] = useState(false);
  const ciudad = sitio.ubicacion?.split(',')[0]?.trim();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={cn('site-header', open && 'is-open')}>
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
