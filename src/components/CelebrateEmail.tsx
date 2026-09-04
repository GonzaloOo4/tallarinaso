'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const BURST = ['🎉', '✨', '⭐', '💌'];

export const CelebrateEmail = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <span ref={ref} className="celebrate-email">
      <motion.span
        className="celebrate-email-text"
        animate={inView ? { scale: [1, 1.2, 0.92, 1.06, 1] } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {children}
      </motion.span>
      {inView && BURST.map((emoji, index) => (
        <motion.span
          key={emoji}
          aria-hidden="true"
          className="celebrate-piece"
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 0, x: (index - 1.5) * 28, y: -28 - index * 8, scale: 1, rotate: (index - 1.5) * 50 }}
          transition={{ duration: 0.9, delay: index * 0.05, ease: 'easeOut' }}
        >
          {emoji}
        </motion.span>
      ))}
    </span>
  );
};
