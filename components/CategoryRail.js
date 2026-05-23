'use client';

export default function CategoryRail({ groups, sectionPrefix, activeId }) {
  return (
    <aside className="hidden lg:block">
      <nav
        aria-label="Categories"
        className="sticky top-20 max-h-[calc(100vh-96px)] overflow-y-auto pr-2"
      >
        <p className="kicker mb-5">categories</p>
        <ul className="border border-ink bg-paper shadow-stack">
          {groups.map(([cat, items]) => {
            const isActive = activeId === cat;
            return (
              <li key={cat}>
                <a
                  href={`#${sectionPrefix}${cat}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`-ml-px flex items-baseline justify-between gap-3 border-l-2 py-1.5 pl-4 pr-2 font-mono text-[11px] uppercase tracking-kicker transition-colors ${
                    isActive
                      ? 'border-accent text-ink'
                      : 'border-transparent text-ink/70 hover:border-ink hover:text-ink'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span className="tabular-nums text-[10px] text-ink/55">
                    {items.length}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
