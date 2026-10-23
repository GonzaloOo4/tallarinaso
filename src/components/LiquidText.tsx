'use client';

import { useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/utils';

const HOVER_SCALE = 6;
const LERP_SPEED = 0.12;

// Distorsión líquida al pasar el mouse. El filtro y el bucle de animación
// solo se activan durante la transición; en reposo no consumen nada.
export const LiquidText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const filterId = `liquid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
  const targetScale = useRef(0);
  const currentScale = useRef(0);
  const frame = useRef<number | null>(null);

  const tick = () => {
    currentScale.current += (targetScale.current - currentScale.current) * LERP_SPEED;
    const settled = Math.abs(targetScale.current - currentScale.current) < 0.02;
    if (settled) currentScale.current = targetScale.current;
    displaceRef.current?.setAttribute('scale', currentScale.current.toFixed(2));
    if (settled) {
      frame.current = null;
      if (currentScale.current === 0 && wrapperRef.current) wrapperRef.current.style.filter = '';
      return;
    }
    frame.current = requestAnimationFrame(tick);
  };

  const animateTo = (scale: number) => {
    targetScale.current = scale;
    if (scale > 0 && wrapperRef.current) wrapperRef.current.style.filter = `url(#${filterId})`;
    if (frame.current === null) frame.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  return (
    <span
      ref={wrapperRef}
      className={cn('liquid-text', className)}
      onPointerEnter={() => animateTo(HOVER_SCALE)}
      onPointerLeave={() => animateTo(0)}
    >
      {children}
      <svg className="liquid-filter-defs" aria-hidden="true">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={2} seed={7} result="noise" />
          <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </span>
  );
};
