'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { setNameColor, useNameColor, useNameColorHintSeen, visibleSwatches } from '@/lib/name-color';

const HINT_ID = 'nombre-color-pista';

/** El nombre del hero como botón: cada clic pasa al siguiente color. */
export const NameColorCycle = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const color = useNameColor();

  const cycle = () => {
    const swatches = visibleSwatches(resolvedTheme);
    const current = swatches.indexOf(color);
    setNameColor(swatches[(current + 1) % swatches.length] ?? swatches[0]!);
  };

  return (
    <button className="name-cycle" type="button" onClick={cycle} aria-describedby={HINT_ID}>
      {children}
    </button>
  );
};

/** Pista discreta que aparece hasta que el visitante prueba a cambiar el color. */
export const NameColorHint = () => {
  const seen = useNameColorHintSeen();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <p id={HINT_ID} className={mounted && !seen ? 'name-hint is-visible' : 'name-hint'}>
      <span aria-hidden="true">✦</span> Toca mi nombre para cambiar su color
    </p>
  );
};
