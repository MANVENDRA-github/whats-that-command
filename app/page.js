'use client';

import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { MotionConfig } from 'framer-motion';
import commands from '@/commands.json';
import { fuseOptions } from '@/lib/searchConfig';
import { mergeResults } from '@/lib/mergeSearch';
import useSearchQuery from '@/hooks/useSearchQuery';
import useSemanticSearch from '@/hooks/useSemanticSearch';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import Navbar from '@/components/nav/Navbar';
import HomeHero from '@/components/landing/HomeHero';
import TerminalDemo from '@/components/landing/TerminalDemo';
import CommandList from '@/components/search/CommandList';
import NoMatch from '@/components/search/NoMatch';
import ValueProps from '@/components/landing/ValueProps';
import CallToAction from '@/components/landing/CallToAction';
import StatusBar from '@/components/landing/StatusBar';

export default function Home() {
  const { query, setQuery, inputRef, hasQuery } = useSearchQuery();
  // The input binds to `query` for instant feedback; the actual search runs on
  // the debounced value so a fast typist triggers one search, not one per key.
  const debouncedQuery = useDebouncedValue(query, 150);
  const { status: semStatus, search: runSemantic } = useSemanticSearch();
  const [semanticRanked, setSemanticRanked] = useState([]);

  const fuse = useMemo(() => new Fuse(commands, fuseOptions), []);

  const fuseRanked = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return [];
    return fuse.search(q);
  }, [debouncedQuery, fuse]);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || semStatus !== 'ready') {
      setSemanticRanked([]);
      return;
    }
    let cancelled = false;
    runSemantic(q).then((r) => {
      if (!cancelled) setSemanticRanked(r);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, semStatus, runSemantic]);

  const results = useMemo(
    () => mergeResults(fuseRanked, semanticRanked, commands),
    [fuseRanked, semanticRanked]
  );

  // True while the debounce hasn't caught up with the latest keystroke.
  const settling = query.trim() !== debouncedQuery.trim();

  const handlePillClick = (text) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <Navbar />
      <main>
        <HomeHero
          query={query}
          setQuery={setQuery}
          inputRef={inputRef}
          onPillClick={handlePillClick}
        />

        {hasQuery ? (
          <section className="mx-auto max-w-page px-5 pb-24 sm:px-7">
            {settling && results.length === 0 ? (
              <p className="font-mono text-[11px] uppercase tracking-kicker text-muted">
                Searching…
              </p>
            ) : (
              <>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-kicker text-muted">
                  {`${results.length} match${results.length === 1 ? '' : 'es'} for "${debouncedQuery.trim()}"`}
                </p>
                {results.length === 0 ? (
                  <NoMatch className="text-center" />
                ) : (
                  <CommandList commands={results} />
                )}
              </>
            )}
          </section>
        ) : (
          <>
            <hr className="section-rule mx-auto max-w-page" />
            <TerminalDemo />
            <hr className="section-rule mx-auto max-w-page" />
            <ValueProps />
            <CallToAction />
          </>
        )}
      </main>
      <StatusBar commandCount={commands.length} />
    </MotionConfig>
  );
}
