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
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setColor(saved);
    }
  }, []);

  useEffect(() => {
    applyColor(resolvedTheme === 'dark' && color === DARK_COLOR ? null : color);
  }, [color, resolvedTheme]);

  const handleChange = (next: string) => {
    setColor(next);
    window.localStorage.setItem(STORAGE_KEY, next);
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
