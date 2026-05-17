'use client';

import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { fuseOptions } from '@/lib/searchConfig';
import useSearchQuery from '@/hooks/useSearchQuery';
import SearchInput from './SearchInput';
import CommandList from './CommandList';
import CategorizedCommandList from './CategorizedCommandList';
import NoMatch from './NoMatch';

export default function ToolBrowser({ tool, commands }) {
  const { query, setQuery, inputRef, hasQuery } = useSearchQuery();

  const fuse = useMemo(() => new Fuse(commands, fuseOptions), [commands]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q).map((r) => r.item);
  }, [query, fuse]);

  const inputId = `${tool}-search`;

  return (
    <section className="mx-auto max-w-page px-5 py-14 sm:px-7 sm:py-20">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <SearchInput
          id={inputId}
          inputRef={inputRef}
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder={`search ${commands.length} ${tool} commands…`}
          label={`Search ${tool} commands`}
          size="md"
        />
        {hasQuery && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-kicker text-muted">
            {results.length}{' '}
            {results.length === 1 ? 'match' : 'matches'} for &ldquo;{query.trim()}&rdquo;
          </p>
        )}
      </div>

      {hasQuery ? (
        results.length === 0 ? (
          <NoMatch className="max-w-2xl" />
        ) : (
          <CommandList commands={results} />
        )
      ) : (
        <CategorizedCommandList commands={commands} />
      )}
    </section>
  );
}
