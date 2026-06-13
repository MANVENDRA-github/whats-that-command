'use client';

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion
} from 'framer-motion';

/**
 * Mouse-tracking 3D tilt — the panel behaves like a small glass CRT screen
 * angling toward the cursor, with a phosphor glare hotspot that follows it.
 * Transform/opacity only; mouse pointers only (touch ignored); reduced
 * motion renders the children untouched.
 */
export default function Tilt3D({ children, className = '', max = 6, glare = true }) {
  const prefersReducedMotion = useReducedMotion();

  // Cursor position within the element, 0..1 on both axes.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 280, damping: 28 });
  const sy = useSpring(py, { stiffness: 280, damping: 28 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const glareX = useTransform(sx, [0, 1], ['-35%', '35%']);
  const glareY = useTransform(sy, [0, 1], ['-35%', '35%']);
  const glareOpacity = useSpring(useMotionValue(0), { stiffness: 200, damping: 30 });

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onEnter = (e) => {
    if (e.pointerType !== 'mouse') return;
    glareOpacity.set(0.65);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      className={`relative [transform-style:preserve-3d] ${className}`}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <motion.div
            style={{ x: glareX, y: glareY, opacity: glareOpacity }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--glow-green-far),transparent_60%)]"
          />
        </div>
      )}
    </motion.div>
  );
}
