'use client';

// Detalles animados de cocina para la portada de un proyecto con ambiente "cocina":
// un plato giratorio con cinco cuencos (guiño a PlatiRoll), vapor que sube y especias flotando.
// Solo CSS y SVG, en el mismo sistema de coordenadas que la portada (1600×1000).
import { useEffect, useRef, type CSSProperties } from 'react';

const HOVER_RATE = 3; // velocidad del plato con el cursor encima
const RATE_EASE = 0.035; // suavidad de la aceleración y el frenado

const CENTER = { x: 800, y: 432 }; // centro del logo en la portada
// Gira solo alrededor del logo: el borde inferior de los cuencos (432 + 206 + 15 = 653)
// queda por encima de la palabra EKTA, que empieza en y = 656.
const RING_R = 206;
const BOWLS = Array.from({ length: 5 }, (_, i) => {
  const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
  return { x: CENTER.x + Math.cos(angle) * RING_R, y: CENTER.y + Math.sin(angle) * RING_R };
});

// Volutas de vapor: posición (x) y ritmo (s).
const STEAM = [
  [560, 9, 0],
  [690, 11, 3.5],
  [910, 10, 6],
  [1040, 12, 1.8],
  [1180, 9.5, 4.6],
].map(([x, duration, delay]) => ({
  x: x!,
  style: { '--d': `${duration}s`, '--delay': `-${delay}s` } as CSSProperties,
}));

// Especias: posición (%), tamaño (px), duración y retraso (s), y si es dorada o vino.
const SPICES = [
  [10, 4, 11, 0, 1],
  [22, 3, 9, 4, 0],
  [34, 5, 13, 7, 1],
  [63, 3, 10, 2, 0],
  [74, 4, 12, 5.5, 1],
  [86, 3, 9.5, 8, 0],
  [94, 5, 14, 3, 1],
].map(([x, size, duration, delay, gold]) => ({
  className: gold ? 'kitchen-spice is-gold' : 'kitchen-spice',
  style: {
    '--x': `${x}%`,
    '--s': `${size}px`,
    '--d': `${duration}s`,
    '--delay': `-${delay}s`,
  } as CSSProperties,
}));

const steamPath = (x: number) =>
  `M${x} 1010 C${x - 40} 930 ${x + 40} 880 ${x} 800 S${x - 30} 690 ${x + 10} 620`;

// Con el cursor sobre la tarjeta, el plato acelera y frena de forma progresiva. Se cambia la
// velocidad de reproducción (no la duración), así el giro conserva su posición y no salta.
const useSmoothSpin = (ref: React.RefObject<HTMLSpanElement | null>) => {
  useEffect(() => {
    const root = ref.current;
    const card = root?.closest<HTMLElement>('.project-ambiente-cocina') ?? root?.parentElement;
    const animation = root?.querySelector('.kitchen-ring')?.getAnimations()[0];
    if (!card || !animation) return;
    let rate = 1;
    let target = 1;
    let frame: number | null = null;
    const tick = () => {
      rate += (target - rate) * RATE_EASE;
      if (Math.abs(target - rate) < 0.01) rate = target;
      animation.updatePlaybackRate(rate);
      frame = rate === target ? null : requestAnimationFrame(tick);
    };
    const go = (next: number) => {
      target = next;
      if (frame === null) frame = requestAnimationFrame(tick);
    };
    const enter = () => go(HOVER_RATE);
    const leave = () => go(1);
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    return () => {
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [ref]);
};

export const KitchenDetails = () => {
  const ref = useRef<HTMLSpanElement>(null);
  useSmoothSpin(ref);
  return (
    <span ref={ref} className="kitchen-details" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <g className="kitchen-steam">
          {STEAM.map(({ x, style }) => (
            <path key={x} d={steamPath(x)} style={style} />
          ))}
        </g>
        <g className="kitchen-ring" style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>
          <circle cx={CENTER.x} cy={CENTER.y} r={RING_R} className="kitchen-ring-line" />
          {BOWLS.map((bowl) => (
            <g key={`${bowl.x}-${bowl.y}`}>
              <circle cx={bowl.x} cy={bowl.y} r="15" className="kitchen-bowl" />
              <circle cx={bowl.x} cy={bowl.y} r="8" className="kitchen-bowl-food" />
            </g>
          ))}
        </g>
      </svg>
      {SPICES.map((spice, index) => (
        <span key={index} className={spice.className} style={spice.style} />
      ))}
    </span>
  );
};
