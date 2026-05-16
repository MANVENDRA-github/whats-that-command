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
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 font-mono text-muted ${sizes.prompt}`}
      >
        ›
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
        className={`w-full border-2 border-ink bg-paper font-mono text-ink shadow-card placeholder:text-muted focus:shadow-[4px_4px_0_var(--accent)] focus:outline-none ${sizes.input}`}
      />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 font-mono text-xl text-muted hover:text-accent-deep sm:right-3"
        >
          ×
        </button>
      )}
    </div>
  );
}
