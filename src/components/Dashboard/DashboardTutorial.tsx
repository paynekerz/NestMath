import { useState, useEffect, useCallback } from 'react';

export const TUTORIAL_STORAGE_KEY = 'nestmath_dashboard_tutorial_v1';

interface TutorialStep {
  target: string;
  title: string;
  body: string;
}

const STEPS: TutorialStep[] = [
  {
    target: 'budget',
    title: 'Monthly Budget',
    body: 'Your income, expenses, savings, and 50/30/20 breakdown at a glance. Click "Set up your budget" or the edit icon to fill in your numbers.',
  },
  {
    target: 'netWorth',
    title: 'Net Worth',
    body: 'Total assets minus total liabilities. Add balances here and track how it changes over time.',
  },
  {
    target: 'housing',
    title: 'Housing',
    body: 'Monthly housing cost and your buy vs. rent break-even year. Run the Buy vs. Rent calculator for the full analysis.',
  },
  {
    target: 'debt',
    title: 'Debt',
    body: 'Total debt balance, monthly payments, and your projected debt-free date. Data comes from the Debt Payoff Planner.',
  },
  {
    target: 'income',
    title: 'Income',
    body: 'Your effective hourly rate: what you earn per hour after taxes, commute time, and work-related expenses. Data comes from the Effective Hourly Rate calculator.',
  },
  {
    target: 'savings',
    title: 'Savings & Growth',
    body: 'Projected retirement balance and estimated monthly income using the 4% rule, in both nominal and inflation-adjusted terms. Data comes from the Retirement Projector.',
  },
  {
    target: 'goals',
    title: 'Emergency Fund',
    body: 'How many months of expenses you have covered. 3 months is a safety net; 6 months is fully funded. Data comes from the Emergency Fund calculator.',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface DashboardTutorialProps {
  active: boolean;
  onStop: () => void;
}

export function DashboardTutorial({ active, onStop }: DashboardTutorialProps) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = STEPS[step];

  const measureTarget = useCallback((target: string) => {
    const wrapper = document.querySelector(`[data-tutorial="${target}"]`);
    if (!wrapper) { setRect(null); return; }
    // display:contents wrappers have no box; measure the first child card instead
    const el = wrapper.firstElementChild ?? wrapper;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  // Reset step when tutorial activates; clear rect when it deactivates
  useEffect(() => {
    if (active) setStep(0);
    else setRect(null);
  }, [active]);

  // Scroll to target then measure
  useEffect(() => {
    if (!active) return;
    const wrapper = document.querySelector(`[data-tutorial="${current.target}"]`);
    const el = wrapper?.firstElementChild ?? wrapper;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = setTimeout(() => measureTarget(current.target), 520);
    return () => clearTimeout(t);
  }, [active, step, current.target, measureTarget]);

  // Re-measure on resize or scroll
  useEffect(() => {
    if (!active) return;
    const handle = () => measureTarget(current.target);
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, { passive: true });
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle);
    };
  }, [active, current.target, measureTarget]);

  if (!active) return null;

  const isLast = step === STEPS.length - 1;
  const PAD = 10;

  return (
    <>
      {/* Click-blocker backdrop — clicking outside the modal stops the tutorial */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 50 }}
        onClick={onStop}
      />

      {/* Spotlight — box-shadow darkens everything outside the target card */}
      {rect && (
        <div
          className="fixed pointer-events-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.68)',
            borderRadius: '14px',
            zIndex: 51,
            outline: '2px solid oklch(55% 0.18 250)',
            outlineOffset: '2px',
          }}
        />
      )}

      {/* Tutorial modal — fixed at bottom-center */}
      <div
        className="fixed"
        style={{
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(460px, calc(100vw - 2rem))',
          zIndex: 60,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="glass-card rounded-2xl p-6" style={{ border: '1px solid var(--color-border-subtle)' }}>
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-label-sm text-on-surface-variant">
              {step + 1} of {STEPS.length}
            </span>
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    height: '5px',
                    width: i === step ? '22px' : '5px',
                    background:
                      i === step
                        ? 'var(--color-primary-accent)'
                        : i < step
                          ? 'oklch(55% 0.18 250 / 0.5)'
                          : 'var(--color-surface-container-highest)',
                  }}
                />
              ))}
            </div>
          </div>

          <h3 className="text-headline-md font-bold text-on-surface mb-1.5">{current.title}</h3>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">{current.body}</p>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={onStop}
              className="text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Stop tutorial
            </button>
            <button
              type="button"
              onClick={() => (isLast ? onStop() : setStep(s => s + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-label-md font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'var(--color-primary-accent)', color: 'var(--color-on-primary)' }}
            >
              {isLast ? 'Done' : 'Next'}
              {!isLast && (
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  arrow_forward
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
