'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { DARK_COLOR, setNameColor, useNameColor, visibleSwatches } from '@/lib/name-color';
import { cn } from '@/lib/utils';

/** Aplica el color elegido a todo el sitio (variable --name-color). Va una sola vez en el layout. */
export const NameColorSync = () => {
  const color = useNameColor();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark' && color === DARK_COLOR) root.style.removeProperty('--name-color');
    else root.style.setProperty('--name-color', color);
  }, [color, resolvedTheme]);

  return null;
};

export const ColorimetriaPicker = ({ className }: { className?: string }) => {
  const { resolvedTheme } = useTheme();
  const color = useNameColor();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Antes de montar, el tema es desconocido: se usa el mismo HTML que en el servidor.
  const swatches = visibleSwatches(mounted ? resolvedTheme : undefined);

  return (
    <div className={cn('colorimetria-swatches', className)} role="group" aria-label="Colores del nombre">
      {swatches.map((swatch) => (
        <button
          key={swatch}
          type="button"
          className="colorimetria-swatch"
          style={{ background: swatch }}
          aria-label={`Usar color ${swatch}`}
          aria-pressed={color === swatch}
          onClick={() => setNameColor(swatch)}
        />
      ))}
    </div>
  );
};
