'use client';

import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export const ContactCelebration = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div ref={ref} className="contact-celebration">
      {children}
      <AnimatePresence>
        {inView && (
          <motion.span
            className="contact-phone"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 0.5], rotate: [-12, 8, 0, -12] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
          >
            📞
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
