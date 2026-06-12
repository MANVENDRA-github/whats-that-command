'use client';

const SIZE_CLASSES = {
  lg: {
    input:
      'py-3.5 pl-9 pr-10 text-[15px] sm:py-4 sm:pl-10 sm:pr-12 sm:text-lg',
    prompt: 'left-3 sm:left-4 text-base sm:text-lg'
  },
  md: {
    input:
      'py-3 pl-9 pr-10 text-[15px] sm:py-3.5 sm:pl-10 sm:pr-12 sm:text-base',
    prompt: 'left-3 sm:left-4 text-base'
  }
};

export default function SearchInput({
  id,
  inputRef,
  value,
  onChange,
  onClear,
  placeholder,
  label,
  size = 'md',
  autoFocus = false
}) {
  const sizes = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <div className="relative mt-6">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {/* drawer label — terminal pane tag */}
      <span className="absolute -top-[18px] left-5 z-10 flex items-center border border-b-0 border-accent/60 bg-paper px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-kicker text-accent">
        stdin
      </span>
      <span
        aria-hidden="true"
        className={`glow pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 font-mono text-accent ${sizes.prompt}`}
      >
        ❯
      </span>
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClear();
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        spellCheck={false}
        autoComplete="off"
        className={`w-full border border-hairline bg-paper-2 font-mono text-ink shadow-stack transition-shadow placeholder:text-muted/80 focus:border-accent focus:shadow-glow focus:outline-none ${sizes.input}`}
      />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 font-mono text-xl text-muted hover:text-accent sm:right-3"
        >
          ×
        </button>
      )}
    </div>
  );
}
