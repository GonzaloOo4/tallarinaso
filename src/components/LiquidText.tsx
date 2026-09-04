'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const MAX_INTENSITY = 1;
const LERP_SPEED = 0.1;
const DISPLACE_SCALE = 26;
const TRAIL_OFFSET = 12;

export const LiquidText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const filterId = `liquid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [hovering, setHovering] = useState(false);
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
  const offsetRRef = useRef<SVGFEOffsetElement>(null);
  const offsetCRef = useRef<SVGFEOffsetElement>(null);
  const offsetMRef = useRef<SVGFEOffsetElement>(null);
  const trailAlphaRef = useRef<SVGFEFuncAElement>(null);
  const targetIntensity = useRef(0);
  const currentIntensity = useRef(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      currentIntensity.current += (targetIntensity.current - currentIntensity.current) * LERP_SPEED;
      const intensity = currentIntensity.current;
      displaceRef.current?.setAttribute('scale', (intensity * DISPLACE_SCALE).toFixed(2));
      offsetRRef.current?.setAttribute('dx', (-intensity * TRAIL_OFFSET).toFixed(2));
      offsetCRef.current?.setAttribute('dx', (intensity * TRAIL_OFFSET).toFixed(2));
      offsetMRef.current?.setAttribute('dy', (intensity * TRAIL_OFFSET).toFixed(2));
      trailAlphaRef.current?.setAttribute('slope', intensity.toFixed(2));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span
      className={cn('liquid-wrap', hovering && 'is-hovering', className)}
      onPointerEnter={() => { targetIntensity.current = MAX_INTENSITY; setHovering(true); }}
      onPointerLeave={() => { targetIntensity.current = 0; setHovering(false); }}
    >
      <span className="liquid-blobs" aria-hidden="true" />
      <span className="liquid-content" style={{ filter: `url(#${filterId})` }}>{children}</span>
      <svg className="liquid-filter-defs" aria-hidden="true">
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" numOctaves={2} seed={7} result="noise">
            <animate attributeName="baseFrequency" dur="7s" values="0.008 0.02;0.02 0.045;0.008 0.02" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" result="warped" />

          <feOffset ref={offsetRRef} in="warped" dx="0" dy="0" result="offR" />
          <feColorMatrix in="offR" type="matrix" values="0 0 0 0 1  0 0 0 0 0.1  0 0 0 0 0.55  0 0 0 1 0" result="trailR" />

          <feOffset ref={offsetCRef} in="warped" dx="0" dy="0" result="offC" />
          <feColorMatrix in="offC" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.85  0 0 0 0 1  0 0 0 1 0" result="trailC" />

          <feOffset ref={offsetMRef} in="warped" dx="0" dy="0" result="offM" />
          <feColorMatrix in="offM" type="matrix" values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.15  0 0 0 1 0" result="trailM" />

          <feBlend in="trailR" in2="trailC" mode="screen" result="blend1" />
          <feBlend in="blend1" in2="trailM" mode="screen" result="trailsRaw" />
          <feComponentTransfer in="trailsRaw" result="trails">
            <feFuncA ref={trailAlphaRef} type="linear" slope="0" intercept="0" />
          </feComponentTransfer>

          <feGaussianBlur in="trails" stdDeviation="5" result="bloom" />
          <feColorMatrix in="bloom" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.8 0" result="bloomBoost" />

          <feMerge>
            <feMergeNode in="bloomBoost" />
            <feMergeNode in="trails" />
            <feMergeNode in="warped" />
          </feMerge>
        </filter>
      </svg>
    </span>
  );
};

