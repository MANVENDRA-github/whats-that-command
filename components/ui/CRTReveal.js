'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Mirrors the `crt-on` body keyframes so reveals feel like the same screen
// powering on. Opacity-only.
const FLICKER = [0, 0.9, 0.25, 1, 0.65, 1];
const TIMES = [0, 0.12, 0.24, 0.4, 0.52, 1];

/**
 * CRT power-on reveal — the block flickers on like a phosphor screen when
 * scrolled into view. Reduced motion gets the content rendered plainly.
 */
export default function CRTReveal({ children, className = '' }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: FLICKER }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.55, times: TIMES, ease: 'linear' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
