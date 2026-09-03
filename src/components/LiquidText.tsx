'use client';

import { useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/utils';

const HOVER_SCALE = 26;
const LERP_SPEED = 0.12;

export const LiquidText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const filterId = `liquid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
  const targetScale = useRef(0);
  const currentScale = useRef(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      currentScale.current += (targetScale.current - currentScale.current) * LERP_SPEED;
      displaceRef.current?.setAttribute('scale', currentScale.current.toFixed(2));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span
      className={cn('liquid-text', className)}
      style={{ filter: `url(#${filterId})` }}
      onPointerEnter={() => { targetScale.current = HOVER_SCALE; }}
      onPointerLeave={() => { targetScale.current = 0; }}
    >
      {children}
      <svg className="liquid-filter-defs" aria-hidden="true">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" numOctaves={2} seed={7} result="noise">
            <animate attributeName="baseFrequency" dur="7s" values="0.008 0.02;0.02 0.045;0.008 0.02" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </span>
  );
};
