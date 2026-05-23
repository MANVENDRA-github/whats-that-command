import { TOOL_META } from '@/lib/tools';

const TOOL_DOT = { git: 'bg-git', docker: 'bg-docker', bash: 'bg-bash' };
const TOOL_TEXT = { git: 'text-git', docker: 'text-docker', bash: 'text-bash' };

export default function ToolHero({ tool, commandCount, categoryCount }) {
  const meta = TOOL_META[tool];
  if (!meta) return null;

  return (
    <section className="mx-auto max-w-page px-5 pb-12 pt-12 sm:px-7 sm:pb-16 sm:pt-20 lg:pt-24">
      <div className="max-w-3xl">
        <p className="kicker mb-5">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 ${TOOL_DOT[tool] ?? 'bg-accent'}`}
          />
          command catalog
        </p>
        <h1
          className="font-display font-medium leading-[1.04] tracking-tight text-ink"
          style={{ fontSize: 'clamp(2.5rem, 5.5vw + 1rem, 5rem)' }}
        >
          {meta.title}
          <span className={TOOL_TEXT[tool] ?? 'text-accent'}>.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
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
