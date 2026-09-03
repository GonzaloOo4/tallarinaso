'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export const CursorGlow = () => {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 260, damping: 24, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 24, mass: 0.4 });

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [x, y]);

  return (
    <motion.div
      className="cursor-glow"
      aria-hidden="true"
      style={{ translateX: springX, translateY: springY }}
    />
  );
};
