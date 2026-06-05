import type { SavingsPlannerResult } from '../../lib/savings';
import { ProgressBar } from '../ui/ProgressBar';

interface Props {
  result: SavingsPlannerResult;
  currentSavings: number;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function projectedDate(months: number): string {
  if (months <= 0) return 'Now';
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatMonths(months: number): string {
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  if (yrs === 0) return `${mo} mo`;
  if (mo === 0) return `${yrs} yr`;
  return `${yrs} yr ${mo} mo`;
}

export function SavingsPlannerSummary({ result, currentSavings }: Props) {
  const progressPct = result.cashToClose > 0
    ? Math.min(100, (currentSavings / result.cashToClose) * 100)
    : 100;

  const subText = result.monthsToGoal === null
    ? 'Not reachable in 30 years — increase monthly savings'
    : result.monthsToGoal === 0
    ? 'You already have enough to close'
    : `${formatMonths(result.monthsToGoal)} to goal · On track for ${projectedDate(result.monthsToGoal)}`;

  return (
    <div className="flex flex-col gap-lg">
      {/* Cash to Close */}
      <div className="glass-card p-lg rounded-xl border-l-4 border-l-primary flex flex-col gap-sm">
        <p className="text-label-md text-on-surface-variant uppercase tracking-wide">Cash Needed to Close</p>
        <p className="text-headline-xl font-mono-data font-bold text-on-surface tabular-nums">
          {cur.format(result.cashToClose)}
        </p>
        <ProgressBar pct={progressPct} />
        <p className="text-label-sm text-on-surface-variant">{subText}</p>
      </div>

      {/* Growth From Returns */}
      <div className="glass-card p-lg rounded-xl border-l-4 border-l-success-emerald flex flex-col gap-sm">
        <p className="text-label-md text-on-surface-variant uppercase tracking-wide">Growth From Returns</p>
        <div className="flex items-center gap-xs">
          <p className="text-headline-xl font-mono-data font-bold text-success-emerald tabular-nums">
            {cur.format(result.growthFromReturns)}
          </p>
          <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '20px' }}>
            trending_up
          </span>
        </div>
        <p className="text-label-sm text-on-surface-variant">
          Money earned without additional contributions
        </p>
      </div>
    </div>
  );
}
