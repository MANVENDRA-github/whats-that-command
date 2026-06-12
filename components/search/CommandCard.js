'use client';

import { useState } from 'react';
import { toolBgClass, toolTextClass } from '@/lib/tools';

export default function CommandCard({ cmd, style }) {
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
    <article
      style={style}
      className="output-in relative mt-6 border border-hairline bg-paper-2 shadow-stack transition-[border-color,box-shadow] duration-200 hover:border-accent/50 hover:shadow-glow-soft"
    >
      {/* pane tab — tool name, color-coded */}
      <span
        className={`absolute -top-[18px] left-5 flex items-center px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-kicker text-paper ${
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
                className="glow-amber inline-flex items-center gap-1 border border-accent-deep/70 px-2 py-1 font-mono text-[10px] uppercase tracking-kicker text-accent-deep"
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
                  ? 'border-moss text-moss shadow-glow-soft'
                  : 'border-hairline text-muted hover:border-accent hover:text-accent'
              }`}
            >
              {copied ? 'copied ✓' : 'copy'}
            </button>
          </div>
        </div>

        {/* the command — rendered as a prompt line */}
        <button
          onClick={copy}
          title="Copy command"
          className="group mt-2 block w-full break-all text-left font-mono text-[15px] text-ink transition-colors hover:text-accent sm:text-base"
        >
          <span aria-hidden="true" className="glow mr-2 select-none text-accent">
            $
          </span>
          {cmd.command}
        </button>

        {/* description on output ruling */}
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
