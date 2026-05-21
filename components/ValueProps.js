'use client';

import FadeUp from './FadeUp';

const VALUE_PROPS = [
  {
    kicker: '01 / search',
    title: 'Intent, not jargon.',
    body: 'Type what you want to do. Results rank against human-readable tags, not man-page flags.'
  },
  {
    kicker: '02 / privacy',
    title: 'Stays in your tab.',
    body: 'No login. No analytics. No server. Your queries never leave the browser.'
  },
  {
    kicker: '03 / safety',
    title: 'Read before you run.',
    body: 'One click copies the command. Anything destructive is flagged in red — you see it before you paste it.'
  }
];

export default function ValueProps() {
  return (
    <section
      className="mx-auto max-w-page px-5 py-16 sm:px-7 sm:py-24 lg:py-28"
      aria-label="What you get"
    >
      <FadeUp>
        <p className="kicker mb-8">what you get</p>
      </FadeUp>
      <ul className="grid grid-cols-1 gap-7 sm:grid-cols-3 sm:gap-10">
        {VALUE_PROPS.map((v, i) => (
          <li key={v.kicker}>
            <FadeUp delay={i * 0.08}>
              <div className="h-full border border-ink bg-paper-2 p-6 shadow-stack">
                <p className="font-mono text-[11px] uppercase tracking-kicker text-accent-deep">
                  {v.kicker}
                </p>
                <h3 className="mt-3 font-display text-2xl font-medium leading-snug tracking-tight text-ink">
                  {v.title}
                </h3>
                <p className="mt-3 text-[15px] text-muted">{v.body}</p>
              </div>
            </FadeUp>
          </li>
        ))}
      </ul>
    </section>
  );
}
