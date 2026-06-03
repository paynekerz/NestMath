import type { SavingsPlannerResult } from '../../lib/savings';
import { StatCard } from '../ui/StatCard';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: SavingsPlannerResult;
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

export function SavingsPlannerSummary({ result }: Props) {
  const alreadyThere = result.monthsToGoal === 0;
  const reachable = result.monthsToGoal !== null;

  let headlineValue: string;
  let headlineLabel: string;
  let subtext: string;

  if (alreadyThere) {
    headlineValue = 'Ready now';
    headlineLabel = 'Time to goal';
    subtext = `You already have ${cur.format(result.totalSaved)} saved — enough to cover ${cur.format(result.cashToClose)} in cash needed to close.`;
  } else if (reachable) {
    headlineValue = formatMonths(result.monthsToGoal!);
    headlineLabel = 'Time to goal';
    subtext = `Projected date: ${projectedDate(result.monthsToGoal!)} · Cash needed to close: ${cur.format(result.cashToClose)}`;
  } else {
    headlineValue = '30+ years';
    headlineLabel = 'Time to goal';
    subtext = `At this savings rate you won't reach ${cur.format(result.cashToClose)} within 30 years. Try increasing your monthly savings.`;
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6 flex flex-col gap-4">
      <div className={`rounded-lg p-4 border ${reachable ? 'border-accent/30 bg-accent/10' : 'border-border bg-background'}`}>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted uppercase tracking-wide">{headlineLabel}</p>
          <InfoTooltip text="How long until your savings cover the full cash needed to close — down payment plus closing costs." />
        </div>
        <p className="text-3xl font-bold mt-1 tabular-nums">{headlineValue}</p>
        <p className="text-sm text-muted mt-2">{subtext}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Cash needed to close"
          value={cur.format(result.cashToClose)}
          tooltip="Down payment plus closing costs — the total cash you need on hand to finalize the purchase."
        />
        <StatCard
          label="Down payment"
          value={cur.format(result.downPayment)}
          tooltip="The upfront cash portion of the home price you pay before borrowing the rest."
        />
        <StatCard
          label="Closing costs"
          value={cur.format(result.closingCosts)}
          tooltip="Fees paid at closing — title, escrow, lender fees. Usually 2–5% of the purchase price."
        />
        <StatCard
          label="Total saved at goal"
          value={cur.format(result.totalSaved)}
          tooltip="Your total savings balance when you reach the down payment and closing cost target."
        />
        <StatCard
          label="Growth from returns"
          value={cur.format(result.growthFromReturns)}
          tooltip="How much your savings grew from interest or investment returns — money earned without additional contributions."
        />
        <StatCard
          label="Projected date"
          value={result.monthsToGoal !== null ? projectedDate(result.monthsToGoal) : '—'}
          tooltip="The calendar month when your savings are projected to reach the cash-to-close target."
        />
      </div>
    </div>
  );
}
