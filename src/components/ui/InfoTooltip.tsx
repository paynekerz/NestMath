import { useState, useId } from 'react';

interface Props {
  text: string;
}

export function InfoTooltip({ text }: Props) {
  const [focused, setFocused] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex items-center group">
      <button
        type="button"
        aria-describedby={id}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={e => e.key === 'Escape' && setFocused(false)}
        className="flex items-center justify-center w-3.5 h-3.5 text-outline hover:text-primary transition-colors cursor-help shrink-0"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-full h-full" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="5.5" r="1" fill="currentColor" />
          <rect x="7" y="8" width="2" height="4" rx="1" fill="currentColor" />
        </svg>
      </button>
      <span
        id={id}
        role="tooltip"
        className={`absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-56 rounded-xl bg-surface-container border border-border-subtle text-body-sm text-on-surface px-3 py-2 shadow-lg z-50 pointer-events-none transition-opacity duration-150
          ${focused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-subtle" />
      </span>
    </span>
  );
}
