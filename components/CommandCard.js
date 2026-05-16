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
    <article className="border border-hairline bg-paper-2 p-4 transition-colors hover:border-ink">
      <div className="flex items-start gap-3">
        <button
          onClick={copy}
          title="Copy command"
          className="flex-1 break-all text-left font-mono text-sm text-ink hover:text-accent-deep sm:text-base"
        >
          {cmd.command}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {cmd.danger && (
            <span
              title="This command can destroy data — read the description before running"
              className="border border-accent-deep px-2 py-0.5 font-mono text-[10px] uppercase tracking-kicker text-accent-deep"
            >
              danger
            </span>
          )}
          <span className="bg-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-kicker text-ink">
            {cmd.tool}
          </span>
          <button
            onClick={copy}
            aria-label="Copy command"
            className={`border px-2 py-1 font-mono text-[11px] uppercase tracking-kicker transition-colors ${
              copied
                ? 'border-moss text-moss'
                : 'border-hairline text-muted hover:border-ink hover:text-ink'
            }`}
          >
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{cmd.description}</p>
    </article>
  );
}
