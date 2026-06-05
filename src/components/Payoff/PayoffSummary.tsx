import type { PayoffResult } from '../../lib/calculator';

interface Props {
  result: PayoffResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function formatMonths(months: number): string {
  if (months <= 0) return '—';
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  if (yrs === 0) return `${mo} mo`;
  if (mo === 0) return `${yrs} yr`;
  return `${yrs} yr ${mo} mo`;
}

function payoffDate(months: number): string {
  if (months <= 0) return 'Already paid off';
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function PayoffSummary({ result }: Props) {
  const hasSavings = result.monthsSaved > 0;
  const interestReductionPct = result.totalInterestOriginal > 0
    ? Math.round((result.interestSaved / result.totalInterestOriginal) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

      {/* Time Saved */}
      <div className="glass-panel p-4 rounded-xl flex flex-col gap-1">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Time Saved</p>
        <p className="text-headline-md font-bold tabular-nums text-primary">
          {hasSavings ? formatMonths(result.monthsSaved) : '—'}
        </p>
        <p className="text-label-sm text-on-surface-variant">
          {hasSavings
            ? `New payoff: ${payoffDate(result.extraPayoffMonths)}`
            : 'Add extra payments to see savings'}
        </p>
      </div>

      {/* Interest Saved */}
      <div className="glass-panel p-4 rounded-xl flex flex-col gap-1 border-l-4 border-l-success-emerald">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Interest Saved</p>
        <p className="text-headline-md font-bold tabular-nums text-success-emerald">
          {cur.format(result.interestSaved)}
        </p>
        {hasSavings && interestReductionPct > 0 && (
          <span className="self-start text-label-sm font-semibold text-success-emerald bg-success-emerald/10 rounded-full px-2 py-0.5">
            −{interestReductionPct}% interest
          </span>
        )}
      </div>

      {/* Total Cost */}
      <div className="glass-panel p-4 rounded-xl flex flex-col gap-1">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">Total Cost</p>
        <p className="text-headline-md font-bold tabular-nums text-on-surface">
          {cur.format(result.totalInterestExtra + result.initialBalanceExtra)}
        </p>
        <p className="text-label-sm text-on-surface-variant">
          {cur.format(result.totalInterestOriginal + result.initialBalance)} without extra
        </p>
      </div>

    </div>
  );
}
