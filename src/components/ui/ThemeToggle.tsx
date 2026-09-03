'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './Button';

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === 'dark';

  useEffect(() => setMounted(true), []);

  return (
    <Button
      aria-label="Cambiar tema"
      className="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      variant="quiet"
      type="button"
    >
      <span aria-hidden="true">{mounted ? (isDark ? 'sun' : 'moon') : ''}</span>
    </Button>
  );
};
