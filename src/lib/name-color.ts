import { useSyncExternalStore } from 'react';

// Color del nombre compartido por todo el sitio (selector del header, clic en el nombre…),
// persistido en localStorage. En el servidor siempre es el color por defecto.
const STORAGE_KEY = 'nombre-color';
const HINT_KEY = 'nombre-color-pista-vista';

export const DEFAULT_COLOR = '#4A6B52';
export const DARK_COLOR = '#131311';
// Paleta de Santa Marta: cada color sale del paisaje o de un proyecto, y todos se leen bien
// en tema claro (contraste ≥ 4.5:1 sobre el fondo). En tema oscuro se aclaran en CSS (OKLCH).
export const SWATCH_NAMES: Record<string, string> = {
  [DEFAULT_COLOR]: 'Sierra',
  '#0E7C7B': 'Caribe',
  '#B5502F': 'Tairona',
  '#7A2350': 'Ekta',
  '#8A6516': 'Cayeye',
  '#3B4A9C': 'Noche',
  [DARK_COLOR]: 'Carbón',
};
export const SWATCHES = Object.keys(SWATCH_NAMES);

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
