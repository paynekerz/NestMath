import { useState } from 'react';

interface PrivacyBarProps {
  onClear: () => void;
}

export function PrivacyBar({ onClear }: PrivacyBarProps) {
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    setConfirming(false);
    onClear();
  }

  return (
    <>
      <div
        data-print="hide"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-container-low border border-border-subtle rounded-xl px-md py-xs mb-6"
      >
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px', color: 'var(--color-primary-accent)' }}>
            lock
          </span>
          <span>
            Your data stays in this browser only. Nothing is sent to any server.{' '}
            <span className="text-label-sm text-on-surface-variant/70">
              (Browser extensions with broad permissions may have access to locally stored data.)
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="shrink-0 text-label-md text-error hover:underline self-start sm:self-auto"
        >
          Clear all data
        </button>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-clear-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirming(false)}
            aria-hidden="true"
          />
          <div className="relative bg-surface border border-border-subtle rounded-2xl shadow-2xl w-full max-w-[400px] p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span
                className="material-symbols-outlined shrink-0 mt-0.5"
                style={{ fontSize: '22px', color: 'var(--color-error)' }}
              >
                warning
              </span>
              <div>
                <h2 id="confirm-clear-title" className="text-headline-md font-semibold text-on-surface">
                  Clear all data?
                </h2>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  This permanently deletes all dashboard data from this browser.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-subtle text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-on-error text-label-md font-semibold hover:brightness-110 transition-all active:scale-95"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-error), black 28%)' }}
              >
                Delete all data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
