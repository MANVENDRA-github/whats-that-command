'use client';

import SearchInput from '@/components/search/SearchInput';
import HeroHeadline from './HeroHeadline';

const EXAMPLE_PILLS = [
  'undo last commit',
  'kill process on a port',
  'extract a tar file'
];

export default function HomeHero({ query, setQuery, inputRef, onPillClick }) {
  return (
    <section
      id="hero"
      className="px-5 pb-16 pt-12 sm:px-7 sm:pb-20 sm:pt-20 lg:pt-24"
    >
      <div className="mx-auto max-w-page">
        <div className="max-w-3xl">
          <p className="kicker mb-4 sm:mb-5">command search</p>

          <HeroHeadline />

          <p className="mt-4 max-w-xl font-mono text-[14px] text-muted sm:mt-5 sm:text-base">
            <span className="select-none text-hairline"># </span>
            search by intent, not by flag name
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
                onClick={() => onPillClick(p)}
                className="group border border-hairline bg-paper-2 px-3 py-1 font-mono text-[11px] text-muted transition-all hover:border-accent hover:text-accent hover:shadow-glow-soft sm:text-[12px]"
              >
                <span className="select-none text-hairline transition-colors group-hover:text-accent">
                  [
                </span>
                {p}
                <span className="select-none text-hairline transition-colors group-hover:text-accent">
                  ]
                </span>
              </button>
            ))}
            <span className="hidden font-mono text-[12px] text-muted lg:inline">
              · press{' '}
              <kbd className="border border-hairline bg-paper-2 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                /
              </kbd>{' '}
              anywhere
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
