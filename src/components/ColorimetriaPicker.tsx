'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'nombre-color';
const DEFAULT_COLOR = '#4A6B52';
const DARK_COLOR = '#131311';
const SWATCHES = [DEFAULT_COLOR, '#B5502F', '#2F5FB5', '#B5992F', '#8A2FB5', DARK_COLOR];

const applyColor = (color: string | null) => {
  if (color) {
    document.documentElement.style.setProperty('--name-color', color);
  } else {
    document.documentElement.style.removeProperty('--name-color');
  }
};

export const ColorimetriaPicker = ({ onlyButtons = false }: { onlyButtons?: boolean }) => {
  const { resolvedTheme: theme } = useTheme();
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [mounted, setMounted] = useState(false);
  // El tema solo se conoce en el navegador; antes de montar se usa el mismo HTML que el servidor.
  const resolvedTheme = mounted ? theme : undefined;

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setColor(saved);
    } catch {
      // Sin almacenamiento local se usa el color por defecto.
    }
  }, []);

  useEffect(() => {
    if (mounted) applyColor(resolvedTheme === 'dark' && color === DARK_COLOR ? null : color);
  }, [color, resolvedTheme, mounted]);

  const handleChange = (next: string) => {
    setColor(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // El color se aplica igual aunque no se pueda guardar.
    }
  };

  return (
    <div className={cn('colorimetria', onlyButtons && 'colorimetria-buttons-only')}>
      <div className="colorimetria-swatches" role="group" aria-label="Colores predefinidos">
        {SWATCHES.filter((swatch) => resolvedTheme !== 'dark' || swatch !== DARK_COLOR).map((swatch) => (
          <button
            key={swatch}
            type="button"
            className="colorimetria-swatch"
            style={{ background: swatch }}
            aria-label={`Usar color ${swatch}`}
            aria-pressed={color === swatch}
            onClick={() => handleChange(swatch)}
          />
        ))}
      </div>
      {!onlyButtons && (
        <label className="colorimetria-custom">
          <span className="meta">Color personalizado</span>
          <input
            type="color"
            value={color}
            onChange={(event) => handleChange(event.target.value)}
            aria-label="Elegir color personalizado para mi nombre"
          />
        </label>
      )}
    </div>
  );
};
