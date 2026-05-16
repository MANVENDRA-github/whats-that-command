'use client';

import { useState } from 'react';

export default function CommandCard({ cmd }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cmd.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard may be unavailable (non-HTTPS, denied permission) — fail quietly
    }
  }

  return (
    <article className="group rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-4 transition hover:border-[color:var(--accent)]">
      <div className="flex items-start gap-3">
        <button
          onClick={copy}
          title="Copy command"
          className="flex-1 text-left font-mono text-sm sm:text-base text-[color:var(--accent)] break-all"
        >
          {cmd.command}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {cmd.danger && (
            <span
              title="This command can destroy data — read the description before running"
              className="rounded border border-[color:var(--danger)] px-2 py-0.5 text-xs font-medium text-[color:var(--danger)]"
            >
              danger
            </span>
          )}
          <span className="rounded bg-[color:var(--border)] px-2 py-0.5 text-xs text-[color:var(--muted)]">
            {cmd.tool}
          </span>
          <button
            onClick={copy}
            aria-label="Copy command"
            className="rounded border border-[color:var(--border)] px-2 py-1 text-xs text-[color:var(--muted)] hover:text-[color:var(--text)] hover:border-[color:var(--accent)]"
          >
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{cmd.description}</p>
    </article>
  );
}
