'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import CommandCard from './CommandCard';

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

function groupByCategory(commands) {
  const acc = {};
  for (const cmd of commands) {
    (acc[cmd.category] ??= []).push(cmd);
  }
  return Object.entries(acc).sort(([a], [b]) => a.localeCompare(b));
}

export default function ToolBrowser({ tool, commands }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const fuse = useMemo(() => new Fuse(commands, fuseOptions), [commands]);

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

  const hasQuery = query.trim().length > 0;

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q).map((r) => r.item);
  }, [query, fuse]);

  const groups = useMemo(() => groupByCategory(commands), [commands]);

  const inputId = `${tool}-search`;

  return (
    <section className="mx-auto max-w-page px-5 py-14 sm:px-7 sm:py-20">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <label htmlFor={inputId} className="sr-only">
          Search {tool} commands
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-base text-muted sm:left-4"
          >
            ›
          </span>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('');
            }}
            placeholder={`search ${commands.length} ${tool} commands…`}
            spellCheck={false}
            autoComplete="off"
            className="w-full border-2 border-ink bg-paper py-3 pl-9 pr-10 font-mono text-[15px] text-ink shadow-card placeholder:text-muted focus:shadow-[4px_4px_0_var(--accent)] focus:outline-none sm:py-3.5 sm:pl-10 sm:pr-12 sm:text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 font-mono text-xl text-muted hover:text-accent-deep sm:right-3"
            >
              ×
            </button>
          )}
        </div>
        {hasQuery && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-kicker text-muted">
            {results.length}{' '}
            {results.length === 1 ? 'match' : 'matches'} for &ldquo;{query.trim()}&rdquo;
          </p>
        )}
      </div>

      {hasQuery ? (
        results.length === 0 ? (
          <div className="max-w-2xl border-2 border-ink bg-paper-2 p-8 shadow-card">
            <p className="font-display text-2xl text-ink">No match.</p>
            <p className="mt-2 text-muted">
              Try different words. Describe what you want to do, not the command name.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {results.map((cmd) => (
              <li key={cmd.id}>
                <CommandCard cmd={cmd} />
              </li>
            ))}
          </ul>
        )
      ) : (
        groups.map(([cat, cmds]) => (
          <div key={cat} className="mb-14 last:mb-0">
            <p className="kicker mb-5">{cat}</p>
            <ul className="space-y-3">
              {cmds.map((cmd) => (
                <li key={cmd.id}>
                  <CommandCard cmd={cmd} />
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
