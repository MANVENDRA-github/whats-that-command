import { TOOL_META, toolBgClass, toolTextClass } from '@/lib/tools';

export default function ToolHero({ tool, commandCount, categoryCount }) {
  const meta = TOOL_META[tool];
  if (!meta) return null;

  return (
    <section className="mx-auto max-w-page px-5 pb-12 pt-12 sm:px-7 sm:pb-16 sm:pt-20 lg:pt-24">
      <div className="max-w-3xl">
        <p className="kicker mb-5">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 ${toolBgClass(tool, 'bg-accent')}`}
          />
          command catalog
        </p>
        <h1
          className="glow font-display leading-[1.02] text-ink"
          style={{ fontSize: 'clamp(3rem, 6vw + 1rem, 6rem)' }}
        >
          <span aria-hidden="true" className="mr-3 select-none text-accent">$</span>
          {meta.title}
          <span className={toolTextClass(tool, 'text-accent')}>_</span>
        </h1>
        <p className="mt-4 max-w-xl font-mono text-[14px] text-muted sm:text-base">
          <span className="select-none text-hairline"># </span>
          {meta.blurb}
        </p>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-kicker text-muted">
          {commandCount} commands · {categoryCount}{' '}
          {categoryCount === 1 ? 'category' : 'categories'}
        </p>
      </div>
    </section>
  );
}
