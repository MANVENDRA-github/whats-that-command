'use client';

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Phosphor scroll progress — a thin accent line that fills along the
 * navbar's bottom border as the page scrolls. Transform-only (scaleX).
 */
export default function ScrollProgress() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001
  });

  if (prefersReducedMotion) return null;

  return (
    <motion.span
      aria-hidden="true"
      style={{ scaleX }}
      className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent shadow-glow-soft"
    />
  );
}
