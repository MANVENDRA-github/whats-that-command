export default function StatusBar({ commandCount }) {
  return (
    <footer
      aria-label="Site status"
      className="border-t border-hairline bg-paper-2"
    >
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2 font-mono text-[11px] uppercase tracking-kicker text-muted sm:px-7">
        <span className="flex items-center gap-2">
          <span className="glow text-accent">--</span>
          <span className="glow text-accent">ready</span>
          <span className="glow text-accent">--</span>
        </span>
        <span className="hidden sm:inline">{commandCount} commands indexed</span>
        <span className="hidden md:inline">100% client-side · zero tracking</span>
        <span>
          <kbd className="border border-hairline px-1.5 py-0.5 text-[10px] text-accent">/</kbd>
          {' '}to search
        </span>
      </div>
    </footer>
  );
}
