export default function NoMatch({ className = '' }) {
  return (
    <div
      className={`border-2 border-ink bg-paper-2 p-8 shadow-card ${className}`}
    >
      <p className="font-display text-2xl text-ink">No match.</p>
      <p className="mt-2 text-muted">
        Try different words. Describe what you want to do, not the command name.
      </p>
    </div>
  );
}
