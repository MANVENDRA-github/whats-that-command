'use client';

import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { MotionConfig, motion } from 'framer-motion';
import commands from '@/commands.json';
import { fuseOptions } from '@/lib/searchConfig';
import useSearchQuery from '@/hooks/useSearchQuery';
import Navbar from '@/components/Navbar';
import TerminalDemo from '@/components/TerminalDemo';
import SearchInput from '@/components/SearchInput';
import CommandList from '@/components/CommandList';
import NoMatch from '@/components/NoMatch';

const EXAMPLE_PILLS = [
  'undo last commit',
  'kill process on a port',
  'extract a tar file'
];

const VALUE_PROPS = [
  {
    kicker: '01 / search',
    title: 'Intent, not jargon.',
    body: 'Type what you want to do. Results rank against human-readable tags, not man-page flags.'
  },
  {
    kicker: '02 / privacy',
    title: 'Stays in your tab.',
    body: 'No login. No analytics. No server. Your queries never leave the browser.'
  },
  {
    kicker: '03 / safety',
    title: 'Read before you run.',
    body: 'One click copies the command. Anything destructive is flagged in red — you see it before you paste it.'
  }
];

function scrollToSearch() {
  const el = document.getElementById('cmd-search');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  el?.focus({ preventScroll: true });
}

function FadeUp({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { query, setQuery, inputRef, hasQuery } = useSearchQuery();

  const fuse = useMemo(() => new Fuse(commands, fuseOptions), []);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q).map((r) => r.item);
  }, [query, fuse]);

  const runPill = (text) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <Navbar />
      <main>
        <section
          id="hero"
          className="px-5 pb-16 pt-12 sm:px-7 sm:pb-20 sm:pt-20 lg:pt-24"
        >
          <div className="mx-auto max-w-page">
            <div className="max-w-3xl">
              <p className="kicker mb-4 sm:mb-5">command search</p>

              <h1
                className="font-display font-medium leading-[1.04] tracking-tight text-ink"
                style={{ fontSize: 'clamp(2rem, 4.5vw + 1rem, 4.5rem)' }}
              >
                The shell command on the{' '}
                <span className="italic text-accent-deep">tip of your tongue</span>.
              </h1>

              <p className="mt-4 max-w-xl text-[15px] text-muted sm:mt-5 sm:text-lg">
                Search by intent. Not by flag name.
              </p>

              <div className="mt-7 max-w-2xl sm:mt-9">
                <SearchInput
                  id="cmd-search"
                  inputRef={inputRef}
                  value={query}
                  onChange={setQuery}
                  onClear={() => setQuery('')}
                  placeholder="describe what you want to do…"
                  label="Search commands"
                  size="lg"
                  autoFocus
                />
              </div>

              <div className="mt-4 flex max-w-2xl flex-wrap items-center gap-x-2 gap-y-2 sm:mt-5">
                <span className="font-mono text-[11px] uppercase tracking-kicker text-muted">
                  try
                </span>
                {EXAMPLE_PILLS.map((p) => (
                  <button
                    key={p}
                    onClick={() => runPill(p)}
                    className="rounded-full border border-hairline px-3 py-1 font-mono text-[11px] text-muted transition-colors hover:border-ink hover:text-ink sm:text-[12px]"
                  >
                    {p}
                  </button>
                ))}
                <span className="hidden font-mono text-[12px] text-muted lg:inline">
                  · press{' '}
                  <kbd className="border border-hairline bg-paper-2 px-1.5 py-0.5 font-mono text-[10px] text-ink">
                    /
                  </kbd>{' '}
                  anywhere
                </span>
              </div>
            </div>
          </div>
        </section>

        {hasQuery ? (
          <section className="mx-auto max-w-page px-5 sm:px-7 pb-24">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-kicker text-muted">
              {`${results.length} match${results.length === 1 ? '' : 'es'} for "${query.trim()}"`}
            </p>
            {results.length === 0 ? (
              <NoMatch className="text-center" />
            ) : (
              <CommandList commands={results} />
            )}
          </section>
        ) : (
          <>
            <hr className="section-rule mx-auto max-w-page" />

            <TerminalDemo />

            <hr className="section-rule mx-auto max-w-page" />

            <section
              className="mx-auto max-w-page px-5 py-16 sm:px-7 sm:py-24 lg:py-28"
              aria-label="What you get"
            >
              <FadeUp>
                <p className="kicker mb-8">what you get</p>
              </FadeUp>
              <ul className="grid grid-cols-1 gap-7 sm:grid-cols-3 sm:gap-10">
                {VALUE_PROPS.map((v, i) => (
                  <li key={v.kicker}>
                    <FadeUp delay={i * 0.08}>
                      <div className="h-full border-2 border-ink bg-paper-2 p-6 shadow-block-sm">
                        <p className="font-mono text-[11px] uppercase tracking-kicker text-accent-deep">
                          {v.kicker}
                        </p>
                        <h3 className="mt-3 font-display text-2xl font-medium leading-snug tracking-tight text-ink">
                          {v.title}
                        </h3>
                        <p className="mt-3 text-[15px] text-muted">{v.body}</p>
                      </div>
                    </FadeUp>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mx-auto max-w-page px-5 pb-20 sm:px-7 sm:pb-28 lg:pb-32">
              <FadeUp>
                <div className="border-2 border-ink bg-ink text-paper shadow-block">
                  <div className="flex flex-col gap-7 px-6 py-10 sm:flex-row sm:items-center sm:gap-12 sm:px-14 sm:py-16">
                    <div className="flex-1">
                      <p className="kicker kicker--invert mb-4">ready?</p>
                      <h3 className="font-display text-3xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
                        The box is already focused.
                      </h3>
                      <p className="mt-4 text-[15px] text-hairline">
                        Press{' '}
                        <kbd className="border border-hairline bg-transparent px-1.5 py-0.5 font-mono text-[11px] text-paper">
                          /
                        </kbd>{' '}
                        anywhere. Or scroll up.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={scrollToSearch}
                      className="self-start border-2 border-accent bg-accent px-6 py-3 font-mono text-sm uppercase tracking-kicker text-paper transition-[transform,background-color,color,border-color] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-paper hover:bg-paper hover:text-accent-deep sm:self-auto"
                    >
                      Try the search ↑
                    </button>
                  </div>
                </div>
              </FadeUp>
            </section>
          </>
        )}
      </main>
    </MotionConfig>
  );
}
