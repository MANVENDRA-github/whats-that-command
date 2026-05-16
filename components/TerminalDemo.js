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
    <div className="border-2 border-ink bg-paper-2 shadow-block-sm sm:shadow-block">
      <div className="flex items-center justify-between border-b-2 border-ink px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-kicker text-ink">
          ~/work · zsh
        </span>
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 bg-ink" />
          <span className="h-2 w-2 bg-ink" />
          <span className="h-2 w-2 bg-ink" />
        </div>
      </div>
      <div className="px-6 py-8 font-mono text-sm leading-relaxed text-ink sm:px-10 sm:py-10 sm:text-base">
        {children}
      </div>
    </div>
  );
}

function Beats() {
  return (
    <>
      <span className="text-accent">$</span> how do I undo my last commit?
    </>
  );
}

function SectionShell({ children, sectionRef }) {
  return (
    <section
      ref={sectionRef}
      aria-label="Product demo"
      className="mx-auto max-w-page px-7 py-20 sm:py-28"
    >
      <p className="kicker mb-6 justify-self-start">about the search</p>
      {children}
    </section>
  );
}

function StaticDemo() {
  return (
    <SectionShell>
      <Frame>
        <p>
          <span className="text-accent">$</span> how do I undo my last commit?
        </p>
        <p className="mt-3">
          <span className="text-accent">→</span>{' '}
          <span className="font-medium">git reset --soft HEAD~1</span>
        </p>
        <p className="mt-3 text-moss">[copied to clipboard]</p>
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

  const scale = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.94, 1, 1, 0.97]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.55]);

  const beat1 = useTransform(scrollYProgress, [0.28, 0.36], [0, 1]);
  const beat2 = useTransform(scrollYProgress, [0.46, 0.54], [0, 1]);
  const beat3 = useTransform(scrollYProgress, [0.64, 0.72], [0, 1]);

  return (
    <SectionShell sectionRef={ref}>
      <motion.div style={{ scale, opacity }} className="will-change-transform">
        <Frame>
          <motion.p style={{ opacity: beat1 }}>
            <span className="text-accent">$</span> how do I undo my last commit?
          </motion.p>
          <motion.p style={{ opacity: beat2 }} className="mt-3">
            <span className="text-accent">→</span>{' '}
            <span className="font-medium">git reset --soft HEAD~1</span>
          </motion.p>
          <motion.p style={{ opacity: beat3 }} className="mt-3 text-moss">
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
