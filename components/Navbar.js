'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOLS, toolHref } from '@/lib/tools';

const TOOL_DOT = { git: 'bg-git', docker: 'bg-docker', bash: 'bg-bash' };

export default function Navbar() {
  const pathname = usePathname() ?? '/';

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-30 border-b border-ink bg-paper [will-change:transform]"
    >
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-5 sm:px-7">
        <Link
          href="/"
          aria-label="What's that command — home"
          className="group flex items-center gap-2.5"
        >
          <span aria-hidden="true" className="font-mono text-base font-medium text-accent">
            $
          </span>
          <span className="whitespace-nowrap font-display text-[15px] font-medium tracking-tight text-ink transition-colors group-hover:text-accent-deep sm:text-lg">
            What&apos;s{' '}
            <span className="italic text-accent-deep">that</span>{' '}
            command?
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {TOOLS.map((tool) => {
            const href = toolHref(tool);
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={tool}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 px-2 py-1 font-mono text-[12px] uppercase tracking-kicker transition-colors sm:text-[13px] ${
                  active ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 ${active ? TOOL_DOT[tool] : 'bg-hairline'}`}
                />
                {tool}
                {active && (
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-[15px] left-2 right-2 h-[2px] ${TOOL_DOT[tool]}`}
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
