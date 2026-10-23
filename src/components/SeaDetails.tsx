// Detalles animados de mar para la portada de un proyecto con ambiente "mar".
// Solo CSS y SVG: olas que se deslizan, burbujas y reflejos de luz.

import type { CSSProperties } from 'react';

// Posición (%), tamaño (px), duración y retraso (s) de cada burbuja.
const BUBBLES = [
  [12, 6, 9, 0], [24, 10, 12, 4], [38, 5, 8, 7], [55, 8, 11, 2],
  [68, 4, 7, 5.5], [79, 9, 13, 9], [90, 6, 10, 3],
].map(([x, size, duration, delay]) => ({
  '--x': `${x}%`, '--s': `${size}px`, '--d': `${duration}s`, '--delay': `-${delay}s`,
}) as CSSProperties);

// Ola continua de 0 a 2400 con el periodo dado; la animación la desplaza un periodo exacto.
const wavePath = (period: number, crest: number) => {
  const half = period / 2;
  let d = `M0 30 Q${half / 2} ${30 - crest} ${half} 30`;
  for (let x = half; x < 2400; x += half) d += ` T${x + half} 30`;
  return `${d} V60 H0 Z`;
};

export const SeaDetails = () => (
  <span className="sea-details" aria-hidden="true">
    <span className="sea-caustics" />
    {BUBBLES.map((style, index) => <span className="sea-bubble" key={index} style={style} />)}
    <svg className="sea-waves" viewBox="0 0 1200 60" preserveAspectRatio="none">
      <path className="sea-wave sea-wave-back" d={wavePath(300, 14)} />
      <path className="sea-wave sea-wave-front" d={wavePath(400, 10)} />
    </svg>
  </span>
);
