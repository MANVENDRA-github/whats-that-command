'use client';

import { useState } from 'react';

export default function CommandRow({ cmd, isExpanded, onToggle }) {
  const [copied, setCopied] = useState(false);

  async function copy(e) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(cmd.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard may be unavailable — fail quietly
    }
  }

  const panelId = `row-panel-${cmd.id}`;

  return (
    <li
      className={`group relative border-b border-hairline last:border-b-0 border-l-2 transition-colors ${
        cmd.danger ? 'border-l-accent-deep' : 'border-l-transparent'
      } ${isExpanded ? 'bg-paper/50' : 'hover:bg-paper/40'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="block w-full py-3.5 pl-4 pr-20 text-left focus:outline-none focus-visible:bg-paper-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-[15px] leading-snug text-ink">
            {cmd.description}
          </span>
          {cmd.danger && (
            <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-kicker text-accent-deep">
              danger
            </span>
          )}
        </div>
        <code className="mt-1 block break-all font-mono text-[12.5px] leading-snug text-ink/80">
          {cmd.command}
        </code>
      </button>

      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${cmd.command}`}
        className={`absolute right-3 top-3 inline-flex border px-2 py-1 font-mono text-[10px] uppercase tracking-kicker transition-colors ${
          copied
            ? 'border-moss text-moss'
            : 'border-hairline text-muted hover:border-ink hover:bg-ink hover:text-paper'
        }`}
      >
        {copied ? 'copied' : 'copy'}
      </button>

      {isExpanded && (
        <div
          id={panelId}
          className="space-y-2 pb-4 pl-4 pr-4 pt-1 font-mono text-[11.5px] text-muted"
        >
          {cmd.example && cmd.example !== cmd.command && (
            <div className="break-all">
              <span className="text-ink/70">example · </span>
              <code className="text-ink">{cmd.example}</code>
            </div>
          )}
          {Array.isArray(cmd.related) && cmd.related.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
              <span className="text-ink/70">related ·</span>
              {cmd.related.map((id) => (
                <span
                  key={id}
                  className="border border-hairline px-1.5 py-0.5 text-ink/80"
                >
                  {id}
                </span>
              ))}
            </div>
          )}
          {Array.isArray(cmd.tags) && cmd.tags.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
              <span className="text-ink/70">tags ·</span>
              {cmd.tags.map((tag) => (
                <span key={tag} className="text-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
