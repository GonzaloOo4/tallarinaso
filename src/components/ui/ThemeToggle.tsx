'use client';

import { useEffect, useState } from 'react';
import { Button } from './Button';

type Theme = 'light' | 'dark';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme') as Theme | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const nextTheme = storedTheme ?? preferredTheme;
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.localStorage.setItem('theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  return (
    <Button
      aria-label={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
      className="theme-toggle"
      onClick={toggleTheme}
      variant="quiet"
      type="button"
    >
      <span aria-hidden="true">{theme === 'light' ? '◐' : '○'}</span>
    </Button>
  );
};
