import { useSyncExternalStore } from 'react';

// Color del nombre compartido por todo el sitio (selector del header, clic en el nombre…),
// persistido en localStorage. En el servidor siempre es el color por defecto.
const STORAGE_KEY = 'nombre-color';
const HINT_KEY = 'nombre-color-pista-vista';

export const DEFAULT_COLOR = '#4A6B52';
export const DARK_COLOR = '#131311';
export const SWATCHES = [DEFAULT_COLOR, '#B5502F', '#2F5FB5', '#B5992F', '#8A2FB5', DARK_COLOR];

/** El negro no se ofrece en tema oscuro: se confundiría con el fondo. */
export const visibleSwatches = (theme: string | undefined) => SWATCHES.filter((swatch) => theme !== 'dark' || swatch !== DARK_COLOR);

const read = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento local, el cambio dura lo que dure la página.
  }
};

let color: string | null = null;
let hintSeen: boolean | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const notify = () => listeners.forEach((listener) => listener());

const getColor = () => (color ??= read(STORAGE_KEY) ?? DEFAULT_COLOR);
const getHintSeen = () => (hintSeen ??= read(HINT_KEY) === '1');

export const setNameColor = (next: string) => {
  color = next;
  hintSeen = true;
  write(STORAGE_KEY, next);
  write(HINT_KEY, '1');
  notify();
};

export const useNameColor = () => useSyncExternalStore(subscribe, getColor, () => DEFAULT_COLOR);
/** En el servidor se asume vista para no pintar la pista antes de saber si ya se usó. */
export const useNameColorHintSeen = () => useSyncExternalStore(subscribe, getHintSeen, () => true);
