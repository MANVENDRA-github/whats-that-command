'use client';

import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { MotionConfig } from 'framer-motion';
import commands from '@/commands.json';
import { fuseOptions } from '@/lib/searchConfig';
import { mergeResults } from '@/lib/mergeSearch';
import useSearchQuery from '@/hooks/useSearchQuery';
import useSemanticSearch from '@/hooks/useSemanticSearch';
import Navbar from '@/components/Navbar';
import HomeHero from '@/components/HomeHero';
import TerminalDemo from '@/components/TerminalDemo';
import CommandList from '@/components/CommandList';
import NoMatch from '@/components/NoMatch';
import ValueProps from '@/components/ValueProps';
import CallToAction from '@/components/CallToAction';

export default function Home() {
  const { query, setQuery, inputRef, hasQuery } = useSearchQuery();
  const { status: semStatus, search: runSemantic } = useSemanticSearch();
  const [semanticRanked, setSemanticRanked] = useState([]);

  const fuse = useMemo(() => new Fuse(commands, fuseOptions), []);

  const fuseRanked = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q);
  }, [query, fuse]);

  useEffect(() => {
    const q = query.trim();
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
  }, [query, semStatus, runSemantic]);

  const results = useMemo(
    () => mergeResults(fuseRanked, semanticRanked, commands),
    [fuseRanked, semanticRanked]
  );

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
            <ValueProps />
            <CallToAction />
          </>
        )}
      </main>
    </MotionConfig>
  );
}
