'use client';

export default function CategoryChips({ groups, sectionPrefix, activeId }) {
  return (
    <div className="sticky top-14 z-20 -mx-5 mb-6 border-b border-hairline bg-paper/95 backdrop-blur-sm sm:-mx-7 lg:hidden">
      <div className="flex gap-1.5 overflow-x-auto px-5 py-2.5 sm:px-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map(([cat, items]) => {
          const isActive = activeId === cat;
          return (
            <a
              key={cat}
              href={`#${sectionPrefix}${cat}`}
              aria-current={isActive ? 'true' : undefined}
              className={`flex shrink-0 items-baseline gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-kicker transition-colors ${
                isActive
                  ? 'border-ink bg-ink text-paper'
                  : 'border-hairline text-muted hover:border-ink hover:text-ink'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`tabular-nums ${
                  isActive ? 'text-paper/70' : 'text-muted/70'
                }`}
              >
                {items.length}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
