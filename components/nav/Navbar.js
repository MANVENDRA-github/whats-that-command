'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS, toolHref, toolBgClass } from '@/lib/tools';

export default function Navbar() {
  const pathname = usePathname() ?? '/';

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-30 border-b border-hairline bg-paper/95 backdrop-blur-sm [will-change:transform]"
    >
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-5 sm:px-7">
        <Link
          href="/"
          aria-label="What's that command — home"
          className="group flex min-w-0 items-center gap-2.5"
        >
          {/* window dots — terminal chrome */}
          <span aria-hidden="true" className="hidden items-center gap-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-accent-deep/80" />
            <span className="h-2 w-2 rounded-full bg-moss/70" />
            <span className="h-2 w-2 rounded-full bg-accent/80" />
          </span>
          <span
            aria-hidden="true"
            className="glow font-mono text-base font-medium text-accent"
          >
            $
          </span>
          <span className="truncate whitespace-nowrap font-mono text-[13px] font-medium tracking-tight text-ink transition-colors group-hover:text-accent sm:text-[14px]">
            <span className="sm:hidden">wtc</span>
            <span className="hidden sm:inline">whats-that-command</span>
            <span className="hidden text-muted lg:inline"> — tty1</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {TOOLS.map((tool) => {
            const href = toolHref(tool);
            const active = pathname === href || pathname.startsWith(href + '/');
            const bg = toolBgClass(tool);
            return (
              <Link
                key={tool}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-1 px-1.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors sm:gap-1.5 sm:px-2 sm:text-[13px] sm:tracking-kicker ${
                  active ? 'glow text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 ${active ? bg : 'bg-hairline'}`}
                />
                {tool}
                {active && (
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-[15px] left-2 right-2 h-[2px] ${bg} shadow-glow-soft`}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
