'use client';

import { useEffect } from 'react';

const GLASS_SELECTOR = '.glass-panel, .site-header';

export const GlassSpotlight = () => {
  useEffect(() => {
    let active: HTMLElement | null = null;

    const handleMove = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(GLASS_SELECTOR) ?? null;
      if (target !== active) {
        active?.classList.remove('is-lit');
        active = target;
        active?.classList.add('is-lit');
        document.body.classList.toggle('over-glass', Boolean(target));
      }
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return null;
};
