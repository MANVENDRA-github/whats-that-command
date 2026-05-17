'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion
} from 'framer-motion';

const HEADLINES = [
  {
    id: 'almost-know',
    render: () => (
      <>
        The shell command you{' '}
        <span className="italic text-accent-deep">almost</span> know.
      </>
    )
  },
  {
    id: 'help-not-helping',
    render: () => (
      <>
        When{' '}
        <code className="font-mono text-[0.78em] font-normal tracking-tight text-ink">
          --help
        </code>{' '}
        <span className="italic text-accent-deep">isn&apos;t</span> helping.
      </>
    )
  }
];

const STEP_MS = 5500;

const H1_CLASS =
  'block font-display font-medium leading-[1.04] tracking-tight text-ink';
const H1_STYLE = {
  fontSize: 'clamp(2rem, 4.5vw + 1rem, 4.5rem)',
  minHeight: '2.5em'
};

function StaticHeadline() {
  return (
    <h1 className={H1_CLASS} style={H1_STYLE}>
      {HEADLINES[0].render()}
    </h1>
  );
}

function AnimatedHeadline() {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HEADLINES.length);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <h1 ref={ref} className={H1_CLASS} style={H1_STYLE}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={HEADLINES[index].id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          className="block"
        >
          {HEADLINES[index].render()}
        </motion.span>
      </AnimatePresence>
    </h1>
  );
}

export default function HeroHeadline() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? <StaticHeadline /> : <AnimatedHeadline />;
}
