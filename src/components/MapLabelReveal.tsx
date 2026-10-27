'use client';

import { useEffect } from 'react';

const REVEAL_RADIUS = 140; // px alrededor del punto en los que aparece la etiqueta

// Las etiquetas del paisaje solo se muestran al acercar el cursor a su punto.
// El paisaje no recibe eventos (está detrás del contenido), así que se mide la distancia
// del puntero a cada punto. Solo en pantallas anchas con mouse.
export const MapLabelReveal = () => {
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (min-width: 901px)');
    let frame: number | null = null;
    let last = { x: -9999, y: -9999 };

    const update = () => {
      frame = null;
      document.querySelectorAll<SVGGElement>('.sierra-label').forEach((label) => {
        const dot = label.querySelector('.sierra-label-dot')?.getBoundingClientRect();
        if (!dot) return;
        const near = Math.hypot(last.x - (dot.left + dot.width / 2), last.y - (dot.top + dot.height / 2)) < REVEAL_RADIUS;
        label.classList.toggle('is-revealed', near);
      });
    };
    const onMove = (event: PointerEvent) => {
      if (!media.matches) return;
      last = { x: event.clientX, y: event.clientY };
      if (frame === null) frame = requestAnimationFrame(update);
    };
    const onLeave = () => { last = { x: -9999, y: -9999 }; update(); };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onLeave, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onLeave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
};
