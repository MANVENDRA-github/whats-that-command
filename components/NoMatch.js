export default function NoMatch({ className = '' }) {
  return (
    <div
      className={`relative mt-6 border border-ink bg-paper-2 shadow-stack ${className}`}
    >
      <span className="absolute -top-[18px] left-5 flex items-center rounded-t-[3px] border border-b-0 border-ink bg-ink px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-kicker text-paper">
        empty
      </span>
      <div className="p-6 pt-7">
        <p className="font-display text-2xl text-ink">No entry found.</p>
        <p className="mt-2 text-muted">
          Try different words. Describe what you want to do, not the command name.
        </p>
      </div>
    </div>
  );
}
