'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Headlines as styled segments so the typewriter can type across
 * an emphasis word without losing its color.
 */
const HEADLINES = [
  [
    { t: "What's " },
    { t: 'that', em: true },
    { t: ' command?' }
  ],
  [
    { t: 'The shell command you ' },
    { t: 'almost', em: true },
    { t: ' know.' }
  ],
  [
    { t: 'When ' },
    { t: '--help', em: true },
    { t: " isn't helping." }
  ],
  [
    { t: "It's " },
    { t: 'somewhere', em: true },
    { t: ' in your shell history.' }
  ]
];

const TYPE_MS = 42;
const DELETE_MS = 16;
const HOLD_MS = 2600;
const GAP_MS = 350;

const H1_CLASS = 'block font-display leading-[1.02] text-ink';
const H1_STYLE = {
  // VT323 is half-width mono: the longest headline (37ch ≈ 18.5em) must stay
  // within two lines of the 48rem column, or the search box jumps below it.
  fontSize: 'clamp(2.2rem, 4.5vw + 1rem, 4.75rem)',
  minHeight: '2.15em'
};

function Segments({ headline, visible }) {
  let consumed = 0;
  return headline.map((seg, i) => {
    const start = consumed;
    consumed += seg.t.length;
    const shown = Math.max(0, Math.min(seg.t.length, visible - start));
    if (shown === 0) return null;
    return (
      <span
        key={i}
        className={seg.em ? 'glow-amber text-accent-deep' : undefined}
      >
        {seg.t.slice(0, shown)}
      </span>
    );
  });
}

function StaticHeadline() {
  return (
    <h1 className={`${H1_CLASS} glow`} style={H1_STYLE}>
      <Segments
        headline={HEADLINES[0]}
        visible={HEADLINES[0].reduce((n, s) => n + s.t.length, 0)}
      />
      <span aria-hidden="true" className="crt-cursor" />
    </h1>
  );
}

function TypewriterHeadline() {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing | holding | deleting
  const [paused, setPaused] = useState(false);

  const headline = HEADLINES[index];
  const total = useMemo(
    () => headline.reduce((n, s) => n + s.t.length, 0),
    [headline]
  );
  const text = useMemo(() => headline.map((s) => s.t).join(''), [headline]);

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
    let id;
    if (phase === 'typing') {
      if (visible < total) {
        id = setTimeout(() => setVisible((v) => v + 1), TYPE_MS);
      } else {
        id = setTimeout(() => setPhase('deleting'), HOLD_MS);
      }
    } else if (phase === 'deleting') {
      if (visible > 0) {
        id = setTimeout(() => setVisible((v) => v - 1), DELETE_MS);
      } else {
        id = setTimeout(() => {
          setIndex((i) => (i + 1) % HEADLINES.length);
          setPhase('typing');
        }, GAP_MS);
      }
    }
    return () => clearTimeout(id);
  }, [paused, phase, visible, total]);

  return (
    <h1 ref={ref} className={`${H1_CLASS} glow`} style={H1_STYLE} aria-label={text}>
      <span aria-hidden="true">
        <Segments headline={headline} visible={visible} />
        <span className="crt-cursor" />
      </span>
    </h1>
  );
}

export default function HeroHeadline() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? <StaticHeadline /> : <TypewriterHeadline />;
}
