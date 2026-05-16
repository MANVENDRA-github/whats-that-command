import Link from 'next/link';

const GITHUB_URL = 'https://github.com/MANVENDRA-github/whats-that-command';

const TOOL_LINKS = [
  { href: '/git', label: 'git' },
  { href: '/docker', label: 'docker' },
  { href: '/bash', label: 'bash' }
];

export default function Navbar() {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg)]/70"
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-[color:var(--text)] hover:text-[color:var(--accent)]"
        >
          <span className="text-[color:var(--muted)]">$</span>{' '}
          <span>what&apos;s-that-command</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {TOOL_LINKS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded px-2 py-1 font-mono text-xs text-[color:var(--muted)] hover:text-[color:var(--text)] sm:text-sm"
            >
              {t.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="ml-1 rounded p-1.5 text-[color:var(--muted)] hover:text-[color:var(--text)]"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.02c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.19-3.07-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.17.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.48 3.17-1.17 3.17-1.17.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.07 0 4.4-2.7 5.36-5.27 5.65.41.36.78 1.06.78 2.13v3.16c0 .31.21.66.79.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
