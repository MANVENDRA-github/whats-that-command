'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import commands from '@/commands.json';
import CommandCard from '@/components/CommandCard';

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

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return commands;
    return fuse.search(q).map((r) => r.item);
  }, [query, fuse]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          What&apos;s that command?
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">
          Search shell commands by what you want to do — not what they&apos;re called.
        </p>
      </header>

      <div className="relative mb-8">
        <label htmlFor="cmd-search" className="sr-only">Search commands</label>
        <input
          id="cmd-search"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQuery('');
          }}
          placeholder='Try "undo last commit" or "delete branch" — press / to focus'
          autoFocus
          spellCheck={false}
          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3 text-base outline-none focus:border-[color:var(--accent)] placeholder:text-[color:var(--muted)]"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--text)]"
          >
            ×
          </button>
        )}
      </div>

      <div className="mb-3 text-sm text-[color:var(--muted)]">
        {query.trim() ? `${results.length} match${results.length === 1 ? '' : 'es'}` : `${commands.length} commands`}
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
    </main>
  );
}
