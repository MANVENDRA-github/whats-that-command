'use client';

import FadeUp from './FadeUp';

function scrollToSearch() {
  const el = document.getElementById('cmd-search');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  el?.focus({ preventScroll: true });
}

export default function CallToAction() {
  return (
    <section className="mx-auto max-w-page px-5 pb-20 sm:px-7 sm:pb-28 lg:pb-32">
      <FadeUp>
        <div className="border border-ink bg-ink text-paper shadow-stack">
          <div className="flex flex-col gap-7 px-6 py-10 sm:flex-row sm:items-center sm:gap-12 sm:px-14 sm:py-16">
            <div className="flex-1">
              <p className="kicker kicker--invert mb-4">ready?</p>
              <h3 className="font-display text-3xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
                The box is already focused.
              </h3>
              <p className="mt-4 text-[15px] text-hairline">
                Press{' '}
                <kbd className="border border-hairline bg-transparent px-1.5 py-0.5 font-mono text-[11px] text-paper">
                  /
                </kbd>{' '}
                anywhere. Or scroll up.
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToSearch}
              className="self-start border-2 border-accent bg-accent px-6 py-3 font-mono text-sm uppercase tracking-kicker text-paper transition-[transform,background-color,color,border-color] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-paper hover:bg-paper hover:text-accent-deep sm:self-auto"
            >
              Try the search ↑
            </button>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
