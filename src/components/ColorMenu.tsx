'use client';

import { useEffect, useRef, useState } from 'react';
import { ColorimetriaPicker } from './ColorimetriaPicker';

// Botón del header que despliega los colores del nombre.
export const ColorMenu = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="color-menu" ref={rootRef}>
      <button
        className="color-menu-toggle"
        type="button"
        aria-label="Elegir el color del nombre"
        aria-expanded={open}
        aria-controls="color-menu-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="color-menu-dot" aria-hidden="true" />
      </button>
      {open && (
        <div id="color-menu-panel" className="color-menu-panel">
          <p className="meta">Color del nombre</p>
          <ColorimetriaPicker />
        </div>
      )}
    </div>
  );
};
