'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion
} from 'framer-motion';

function Frame({ children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)]">
      <div className="flex items-center gap-1.5 border-b border-[color:var(--border)] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f4a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f4a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f4a]" />
        <span className="ml-2 font-mono text-xs text-[color:var(--muted)]">~/work</span>
      </div>
      <div className="px-5 py-7 font-mono text-sm leading-relaxed sm:px-8 sm:py-10 sm:text-base">
        {children}
      </div>
    </div>
  );
}

function SectionShell({ children, sectionRef }) {
  return (
    <section
      ref={sectionRef}
      aria-label="Product demo"
      className="mx-auto max-w-3xl px-5 py-20 sm:py-28"
    >
      <h2 className="mb-6 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--muted)] sm:text-xs">
        What it feels like
      </h2>
      {children}
    </section>
  );
}

function StaticDemo() {
  return (
    <SectionShell>
      <Frame>
        <p>
          <span className="text-[color:var(--muted)]">$</span> how do I undo my last commit?
        </p>
        <p className="mt-3 text-[color:var(--accent)]">
          <span className="text-[color:var(--muted)]">→</span> git reset --soft HEAD~1
        </p>
        <p className="mt-3 text-[color:var(--muted)]">[copied to clipboard]</p>
      </Frame>
    </SectionShell>
  );
}

function AnimatedDemo() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const scale = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.92, 1, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.35, 1, 1, 0.5]);

  const beat1 = useTransform(scrollYProgress, [0.28, 0.36], [0, 1]);
  const beat2 = useTransform(scrollYProgress, [0.46, 0.54], [0, 1]);
  const beat3 = useTransform(scrollYProgress, [0.64, 0.72], [0, 1]);

  return (
    <SectionShell sectionRef={ref}>
      <motion.div style={{ scale, opacity }} className="will-change-transform">
        <Frame>
          <motion.p style={{ opacity: beat1 }}>
            <span className="text-[color:var(--muted)]">$</span> how do I undo my last commit?
          </motion.p>
          <motion.p
            style={{ opacity: beat2 }}
            className="mt-3 text-[color:var(--accent)]"
          >
            <span className="text-[color:var(--muted)]">→</span> git reset --soft HEAD~1
          </motion.p>
          <motion.p
            style={{ opacity: beat3 }}
            className="mt-3 text-[color:var(--muted)]"
          >
            [copied to clipboard]
          </motion.p>
        </Frame>
      </motion.div>
    </SectionShell>
  );
}

export default function TerminalDemo() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? <StaticDemo /> : <AnimatedDemo />;
}
