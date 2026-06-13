'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

// ASCII-only so every glyph exists in VT323/Plex Mono — with a monospace
// font and a constant char count, scrambling causes zero layout shift.
const GLYPHS = '#%&@$*+=<>/\\!?;:^~01';

/**
 * Terminal decode reveal — text resolves left-to-right from random glyphs
 * when scrolled into view. Static export renders the final text, so no-JS
 * visitors and crawlers see real copy.
 */
export default function DecodeText({ text, className = '', duration = 800, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const prefersReducedMotion = useReducedMotion();
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    let raf;
    let start;
    const tick = (now) => {
      if (start === undefined) start = now + delay;
      const t = (now - start) / duration;
      if (t >= 1) {
        setOutput(text);
        return;
      }
      if (t >= 0) {
        const resolved = Math.floor(t * text.length);
        let s = '';
        for (let i = 0; i < text.length; i += 1) {
          const c = text[i];
          s +=
            i < resolved || c === ' '
              ? c
              : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        setOutput(s);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, prefersReducedMotion, text, duration, delay]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{output}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
