'use client';

import { useEffect } from 'react';

// Expone el scroll como variable CSS (--sy) para el paralaje del paisaje.
export const ScrollDepth = () => {
  useEffect(() => {
    let frame: number | null = null;
    const update = () => {
      frame = null;
      document.documentElement.style.setProperty('--sy', String(Math.round(window.scrollY)));
    };
    const onScroll = () => { if (frame === null) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
};
