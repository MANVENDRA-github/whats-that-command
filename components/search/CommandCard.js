'use client';

import { useState } from 'react';
import { toolBgClass, toolTextClass } from '@/lib/tools';

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
    <article className="relative mt-6 border border-ink bg-paper-2 shadow-stack hover:shadow-[7px_7px_0_var(--hairline)]">
      {/* folder tab — tool name, color-coded */}
      <span
        className={`absolute -top-[18px] left-5 flex items-center rounded-t-[3px] border border-b-0 border-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-kicker text-paper ${
          toolBgClass(cmd.tool)
        }`}
      >
        {cmd.tool}
      </span>

      <div className="p-4 pt-5">
        {/* catalog number + actions */}
        <div className="flex items-start justify-between gap-3">
          <span className="break-all font-mono text-[11px] text-muted">
            <span className={toolTextClass(cmd.tool)}>№</span>{' '}
            {cmd.id}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {cmd.danger && (
              <span
                title="This command can destroy data — read the description before running"
                className="inline-flex items-center gap-1 border border-accent-deep px-2 py-1 font-mono text-[10px] uppercase tracking-kicker text-accent-deep"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-2.5 w-2.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 1.5L15 14.5H1L8 1.5ZM7 5.5h2v4.25H7V5.5Zm0 5.25h2v1.75H7v-1.75Z"
                  />
                </svg>
                danger
              </span>
            )}
            <button
              onClick={copy}
              aria-label="Copy command"
              className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-kicker transition-colors ${
                copied
                  ? 'border-moss text-moss'
                  : 'border-ink text-ink hover:bg-ink hover:text-paper'
              }`}
            >
              {copied ? 'copied' : 'copy'}
            </button>
          </div>
        </div>

        {/* the command */}
        <button
          onClick={copy}
          title="Copy command"
          className="mt-2 block w-full break-all text-left font-mono text-[15px] text-ink transition-colors hover:text-accent-deep sm:text-base"
        >
          {cmd.command}
        </button>

        {/* description on catalog ruling */}
        <p className="mt-3 border-y border-dotted border-hairline py-2.5 text-sm text-muted">
          {cmd.description}
        </p>

        {/* footer meta */}
        <div className="mt-2.5 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-kicker text-muted">
          <span>{cmd.category}</span>
          {Array.isArray(cmd.related) && cmd.related.length > 0 && (
            <span>related · {cmd.related.length}</span>
          )}
        </div>
      </div>
    </article>
  );
}
