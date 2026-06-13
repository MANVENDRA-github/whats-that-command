'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useReducedMotion
} from 'framer-motion';
import DecodeText from '@/components/ui/DecodeText';
import Tilt3D from '@/components/ui/Tilt3D';

const EXAMPLES = [
  {
    query: 'how do I undo my last commit?',
    command: 'git reset --soft HEAD~1',
    meta: 'git · undo'
  },
  {
    query: "what's using port 3000?",
    command: 'lsof -i :3000',
    meta: 'bash · network'
  },
  {
    query: 'extract a tar file',
    command: 'tar -xzvf <archive>.tar.gz',
    meta: 'bash · archive'
  },
  {
    query: 'shell into a running container',
    command: 'docker exec -it <container> /bin/bash',
    meta: 'docker · containers'
  },
  {
    query: 'what did I change?',
    command: 'git diff',
    meta: 'git · inspect'
  }
];

const STEP_MS = 4000;

function Frame({ children, activeIndex, dotCount = 3 }) {
  return (
    <div className="crt-panel border border-hairline bg-paper-2 shadow-stack">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-kicker text-muted">
          <span className="text-accent">▓</span> ~/work · zsh
        </span>
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 transition-colors duration-300 ${
                activeIndex === undefined
                  ? 'bg-accent'
                  : i === activeIndex
                    ? 'bg-accent shadow-glow-soft'
                    : 'bg-hairline'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="px-6 py-8 font-mono text-sm leading-relaxed text-ink sm:px-10 sm:py-10 sm:text-base">
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
      className="relative mx-auto max-w-page px-5 py-16 sm:px-7 sm:py-24 lg:py-28"
    >
      <p className="kicker mb-6">
        <DecodeText text="about the search" />
      </p>
      {children}
    </section>
  );
}

const beatVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }
  }
};

function ExampleContent({ example }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.55, delayChildren: 0.15 }
        }
      }}
    >
      <motion.p variants={beatVariants}>
        <span className="glow text-accent">$</span>{' '}
        <span className="text-muted">{example.query}</span>
      </motion.p>
      <motion.p variants={beatVariants} className="mt-3 break-words">
        <span className="glow text-accent">→</span>{' '}
        <span className="glow font-medium text-accent">{example.command}</span>
      </motion.p>
      <motion.p
        variants={beatVariants}
        className="mt-4 font-mono text-[10px] uppercase tracking-kicker text-muted"
      >
        {example.meta}
      </motion.p>
    </motion.div>
  );
}

function StaticDemo() {
  return (
    <SectionShell>
      <Frame>
        <p>
          <span className="glow text-accent">$</span>{' '}
          <span className="text-muted">{EXAMPLES[0].query}</span>
        </p>
        <p className="mt-3 break-words">
          <span className="glow text-accent">→</span>{' '}
          <span className="glow font-medium text-accent">{EXAMPLES[0].command}</span>
        </p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-kicker text-muted">
          {EXAMPLES[0].meta}
        </p>
      </Frame>
    </SectionShell>
  );
}

function AnimatedDemo() {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(true);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.94, 1, 1, 0.97]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.55]);
  // The monitor tilts upright in 3D as it scrolls into view.
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [10, 0]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % EXAMPLES.length);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <SectionShell sectionRef={ref}>
      <motion.div
        style={{ scale, opacity, rotateX, transformPerspective: 1200 }}
        className="will-change-transform"
      >
        <Tilt3D max={5}>
          <Frame activeIndex={index} dotCount={EXAMPLES.length}>
            <div className="min-h-[9.5rem] sm:min-h-[7rem]" aria-hidden="true">
              <AnimatePresence mode="wait">
                <ExampleContent key={index} example={EXAMPLES[index]} />
              </AnimatePresence>
            </div>
          </Frame>
        </Tilt3D>
      </motion.div>
    </SectionShell>
  );
}

export default function TerminalDemo() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? <StaticDemo /> : <AnimatedDemo />;
}
