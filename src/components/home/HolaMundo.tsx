'use client';

import { motion } from 'framer-motion';

export const HolaMundo = () => (
  <main className="hero-shell">
    <div className="hero-glow" aria-hidden="true" />
    <section className="hero-content" aria-labelledby="hero-title">
      <p className="eyebrow">Infraestructura fullstack</p>
      <h1 id="hero-title" className="hero-title">
        <motion.span
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          Hola
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        >
          Mundo
        </motion.span>
      </h1>
      <motion.div
        className="hero-rule"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 1 }}
      />
      <motion.p
        className="hero-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
      >
        Una base limpia para construir algo que importe.
      </motion.p>
      <motion.span
        className="tech-badge"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 1.6 }}
      >
        TS <span aria-hidden="true">✓</span>
      </motion.span>
    </section>
  </main>
);
