interface Props {
  /** Tool-specific caveat sentence. Keep it to one line. */
  note: string;
  className?: string;
}

/**
 * Subtle, result-adjacent disclaimer for higher-stakes calculators where a
 * user might act on the number directly (tax, Social Security, affordability).
 */
export function ToolDisclaimer({ note, className = 'mt-6' }: Props) {
  return (
    <p
      data-print="hide"
      role="note"
      className={`flex items-start gap-2 text-label-sm text-on-surface-variant/80 leading-relaxed max-w-[640px] mx-auto text-center justify-center ${className}`}
    >
      <span
        className="material-symbols-outlined shrink-0"
        style={{ fontSize: '15px', lineHeight: '18px', color: 'var(--color-on-surface-variant)' }}
        aria-hidden="true"
      >
        info
      </span>
      <span>{note}</span>
    </p>
  );
}
