import type { ReactNode } from 'react';

function fmtUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

interface DashboardSectionProps {
  icon: string;
  title: string;
  headlineStat: string;
  headlineLabel: string;
  verdict: string;
  linkHref: string;
  linkLabel: string;
  children?: ReactNode;
  accent?: 'primary' | 'success' | 'error';
  updatedAt?: string;
  onEdit?: () => void;
}

export function DashboardSection({
  icon,
  title,
  headlineStat,
  headlineLabel,
  verdict,
  linkHref,
  linkLabel,
  children,
  accent = 'primary',
  updatedAt,
  onEdit,
}: DashboardSectionProps) {
  const statColor =
    accent === 'success'
      ? 'var(--color-success-emerald)'
      : accent === 'error'
        ? 'var(--color-error)'
        : 'var(--color-primary-accent)';

  return (
    <div className="glass-card p-lg rounded-xl flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined shrink-0"
            style={{ fontSize: '20px', color: 'var(--color-primary-accent)' }}
          >
            {icon}
          </span>
          <h2 className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {updatedAt && (
            <span className="text-label-sm text-on-surface-variant text-right">
              {fmtUpdated(updatedAt)}
            </span>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${title}`}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors rounded-lg p-0.5 hover:bg-surface-container-high"
              style={{ fontSize: '16px' }}
            >
              edit
            </button>
          )}
        </div>
      </div>

      {/* Headline stat */}
      <div>
        <p className="text-headline-lg font-bold font-mono-data" style={{ color: statColor }}>
          {headlineStat}
        </p>
        <p className="text-label-sm text-on-surface-variant mt-0.5">{headlineLabel}</p>
      </div>

      {/* Verdict */}
      <p className="text-body-sm text-on-surface">{verdict}</p>

      {/* Optional slot (e.g. progress bar) */}
      {children}

      {/* Footer link */}
      <div className="pt-2 border-t border-border-subtle mt-auto">
        <a
          href={linkHref}
          className="flex items-center gap-1 text-label-md text-primary-accent hover:underline"
        >
          {linkLabel}
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
