'use client';

import CRTReveal from '@/components/ui/CRTReveal';
import DecodeText from '@/components/ui/DecodeText';
import Tilt3D from '@/components/ui/Tilt3D';

function scrollToSearch() {
  const el = document.getElementById('cmd-search');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  el?.focus({ preventScroll: true });
}

export default function CallToAction() {
  return (
    <section className="mx-auto max-w-page px-5 pb-20 sm:px-7 sm:pb-28 lg:pb-32">
      <CRTReveal>
        {/* inverted phosphor block — the one full-brightness moment on the page */}
        <Tilt3D max={2.5} glare={false}>
          <div className="border border-accent bg-ink text-paper shadow-glow-soft">
            <div className="flex flex-col gap-7 px-6 py-10 sm:flex-row sm:items-center sm:gap-12 sm:px-14 sm:py-16">
              <div className="flex-1">
                <p className="kicker kicker--invert mb-4">
                  <DecodeText text="ready?" />
                </p>
                <h3 className="font-display text-4xl leading-[1.02] sm:text-6xl">
                  The box is already focused.
                </h3>
                <p className="mt-4 font-mono text-[14px] text-paper/75">
                  Press{' '}
                  <kbd className="border border-paper/40 bg-transparent px-1.5 py-0.5 font-mono text-[11px] text-paper">
                    /
                  </kbd>{' '}
                  anywhere. Or scroll up.
                </p>
              </div>
              <button
                type="button"
                onClick={scrollToSearch}
                className="self-start border-2 border-paper bg-paper px-6 py-3 font-mono text-sm uppercase tracking-kicker text-accent transition-[transform,background-color,color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-ink hover:text-paper hover:shadow-none sm:self-auto"
              >
                Try the search ↑
              </button>
            </div>
          </div>
        </Tilt3D>
      </CRTReveal>
    </section>
  );
}
