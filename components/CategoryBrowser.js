'use client';

import { useEffect, useMemo, useState } from 'react';
import { groupByCategory } from '@/lib/commands';
import CategoryRail from './CategoryRail';
import CategoryChips from './CategoryChips';
import CommandRow from './CommandRow';

const SECTION_PREFIX = 'cat-';

export default function CategoryBrowser({ commands }) {
  const groups = useMemo(() => groupByCategory(commands), [commands]);
  const [activeId, setActiveId] = useState(groups[0]?.[0] ?? null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (groups.length === 0) return;

    // Trigger band: just below the 56px navbar down to roughly the upper
    // third of the viewport. Whichever section's top edge is currently
    // inside that band counts as "active".
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({
            id: e.target.id.slice(SECTION_PREFIX.length),
            top: e.boundingClientRect.top
          }));
        if (visible.length === 0) return;
        visible.sort((a, b) => a.top - b.top);
        setActiveId(visible[0].id);
      },
      { rootMargin: '-72px 0px -60% 0px', threshold: 0 }
    );

    groups.forEach(([cat]) => {
      const el = document.getElementById(SECTION_PREFIX + cat);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [groups]);

  return (
    <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
      <CategoryRail
        groups={groups}
        sectionPrefix={SECTION_PREFIX}
        activeId={activeId}
      />
      <div className="min-w-0">
        <CategoryChips
          groups={groups}
          sectionPrefix={SECTION_PREFIX}
          activeId={activeId}
        />
        {groups.map(([cat, items]) => {
          const headingId = `${SECTION_PREFIX}${cat}-heading`;
          return (
            <section
              key={cat}
              id={SECTION_PREFIX + cat}
              aria-labelledby={headingId}
              className="mb-12 scroll-mt-32 last:mb-0 lg:scroll-mt-20"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id={headingId} className="kicker">
                  {cat}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-kicker text-muted">
                  {items.length} {items.length === 1 ? 'cmd' : 'cmds'}
                </span>
              </div>
              <ul className="border border-hairline bg-paper-2">
                {items.map((cmd) => (
                  <CommandRow
                    key={cmd.id}
                    cmd={cmd}
                    isExpanded={expandedId === cmd.id}
                    onToggle={() =>
                      setExpandedId((prev) => (prev === cmd.id ? null : cmd.id))
                    }
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
