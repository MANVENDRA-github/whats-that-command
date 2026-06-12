export default function NoMatch({ className = '' }) {
  return (
    <div
      className={`output-in relative mt-6 border border-accent-deep/40 bg-paper-2 shadow-stack ${className}`}
    >
      <span className="glow-amber absolute -top-[18px] left-5 flex items-center border border-b-0 border-accent-deep/60 bg-paper px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-kicker text-accent-deep">
        stderr
      </span>
      <div className="p-6 pt-7">
        <p className="glow-amber font-display text-3xl text-accent-deep">
          command not found
        </p>
        <p className="mt-2 text-muted">
          Try different words. Describe what you want to do, not the command name.
        </p>
      </div>
    </div>
  );
}
