'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import commands from '@/commands.json';
import CommandCard from '@/components/CommandCard';
import Navbar from '@/components/Navbar';

const fuseOptions = {
  keys: [
    { name: 'tags', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'command', weight: 0.2 },
    { name: 'tool', weight: 0.1 }
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true
};

const EXAMPLE_PILLS = [
  'undo last commit',
  'kill process on a port',
  'extract a tar file'
];

export default function Home() {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const fuse = useMemo(() => new Fuse(commands, fuseOptions), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const ae = document.activeElement;
      const tag = ae?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || ae?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get('q') || '');
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      const next = url.pathname + url.search + url.hash;
      const current = window.location.pathname + window.location.search + window.location.hash;
      if (next !== current) {
        window.history.replaceState(null, '', next);
      }
    }, 120);
    return () => clearTimeout(id);
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q).map((r) => r.item);
  }, [query, fuse]);

  const runPill = (text) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  const hasQuery = query.trim().length > 0;

  return (
    <>
      <Navbar />
      <main>
        <section
          id="hero"
          className="flex min-h-[calc(100svh-3rem)] flex-col items-center justify-center px-5 py-8 sm:py-12"
        >
          <div className="w-full max-w-2xl">
            <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-5xl">
              Find the shell command you forgot.
            </h1>
            <p className="mt-3 text-center text-sm text-[color:var(--muted)] sm:mt-4 sm:text-base">
              Search by what you want to do — not what it&apos;s called.
            </p>

            <div className="relative mt-7 sm:mt-10">
              <label htmlFor="cmd-search" className="sr-only">Search commands</label>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[color:var(--muted)] sm:text-base"
              >
                ›
              </span>
              <input
                id="cmd-search"
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setQuery('');
                }}
                placeholder='describe what you want to do…'
                autoFocus
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] py-3.5 pl-9 pr-10 font-mono text-base outline-none transition-colors focus:border-[color:var(--accent)] placeholder:text-[color:var(--muted)] sm:py-4 sm:text-lg"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[color:var(--muted)] hover:text-[color:var(--text)]"
                >
                  ×
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-[color:var(--muted)]">try</span>
              {EXAMPLE_PILLS.map((p) => (
                <button
                  key={p}
                  onClick={() => runPill(p)}
                  className="rounded-full border border-[color:var(--border)] px-3 py-1 font-mono text-[color:var(--muted)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  {p}
                </button>
              ))}
              <span className="hidden text-[color:var(--muted)] sm:inline">
                · press{' '}
                <kbd className="rounded border border-[color:var(--border)] bg-[color:var(--panel)] px-1.5 py-0.5 font-mono text-[10px]">
                  /
                </kbd>{' '}
                anywhere to focus
              </span>
            </div>
          </div>
        </section>

        {hasQuery && (
          <section className="mx-auto max-w-3xl px-5 pb-10">
            <div className="mb-3 text-sm text-[color:var(--muted)]">
              {`${results.length} match${results.length === 1 ? '' : 'es'} for "${query.trim()}"`}
            </div>
            {results.length === 0 ? (
              <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-6 text-center text-[color:var(--muted)]">
                No match. Try different words — describe what you want to do, not the command name.
              </div>
            ) : (
              <ul className="space-y-3">
                {results.map((cmd) => (
                  <li key={cmd.id}>
                    <CommandCard cmd={cmd} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </>
  );
}
