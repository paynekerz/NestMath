import { useEffect, type ReactNode } from 'react';

interface QuickEditModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSave: () => void;
  fullBreakdownHref?: string;
  fullBreakdownLabel?: string;
  children: ReactNode;
}

export function QuickEditModal({
  title,
  subtitle,
  onClose,
  onSave,
  fullBreakdownHref,
  fullBreakdownLabel = 'Create Detailed Breakdown',
  children,
}: QuickEditModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qem-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-surface border border-border-subtle rounded-2xl shadow-2xl w-full max-w-[440px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h2 id="qem-title" className="text-headline-md font-semibold text-on-surface">{title}</h2>
            {subtitle && <p className="text-body-sm text-on-surface-variant mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors rounded-lg p-1 hover:bg-surface-container-high shrink-0 ml-4 mt-0.5"
            style={{ fontSize: '20px' }}
          >
            close
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4 flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 pb-6 pt-4 border-t border-border-subtle flex flex-col gap-3">
          {fullBreakdownHref && (
            <a
              href={fullBreakdownHref}
              className="flex items-center gap-1 text-label-md text-primary-accent hover:underline w-fit"
            >
              {fullBreakdownLabel}
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                arrow_forward
              </span>
            </a>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border-subtle text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-label-md font-semibold hover:brightness-110 transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
