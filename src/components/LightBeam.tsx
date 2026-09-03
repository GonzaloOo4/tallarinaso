'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

export const LightBeam = () => {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 28 });
  return <div className="light-beam" aria-hidden="true"><motion.div className="light-beam-progress" style={{ scaleY: reducedMotion ? 1 : progress }} /></div>;
};