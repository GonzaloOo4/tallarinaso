'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'nombre-color';
const SWATCHES = ['#4A6B52', '#B5502F', '#2F5FB5', '#B5992F', '#8A2FB5', '#131311'];

const applyColor = (color: string) => {
  document.documentElement.style.setProperty('--name-color', color);
};

export const ColorimetriaPicker = ({ compact = false }: { compact?: boolean }) => {
  const [color, setColor] = useState('#4A6B52');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setColor(saved);
      applyColor(saved);
    }
  }, []);

  const handleChange = (next: string) => {
    setColor(next);
    applyColor(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <div className={cn('colorimetria', compact && 'colorimetria-compact')}>
      <div className="colorimetria-swatches" role="group" aria-label="Colores predefinidos">
        {SWATCHES.map((swatch) => (
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
      <label className="colorimetria-custom">
        <span className="meta">Color personalizado</span>
        <input
          type="color"
          value={color}
          onChange={(event) => handleChange(event.target.value)}
          aria-label="Elegir color personalizado para mi nombre"
        />
      </label>
    </div>
  );
};
