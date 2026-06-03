import type { RefinanceResult } from '../../lib/calculator';
import { StatCard } from '../ui/StatCard';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RefinanceResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function breakEvenDateStr(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatMonths(months: number): string {
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  if (yrs === 0) return `${mo} month${mo !== 1 ? 's' : ''}`;
  if (mo === 0) return `${yrs} yr${yrs !== 1 ? 's' : ''}`;
  return `${yrs} yr ${mo} mo`;
}

export function RefinanceSummary({ result }: Props) {
  const hasPositiveSavings = result.monthlySavings > 0;

  let verdictValue: string;
  let verdictLabel: string;
  let verdictSubtext: string;
  let verdictPositive: boolean;

  if (!hasPositiveSavings) {
    verdictValue = 'Not worth it';
    verdictLabel = 'Verdict';
    verdictSubtext = 'The new rate does not reduce your monthly payment, so there is no break-even point.';
    verdictPositive = false;
  } else if (result.worthIt) {
    verdictValue = `${formatMonths(result.breakEvenMonths!)}`;
    verdictLabel = 'Break-even — worth it';
    verdictSubtext = `You recoup ${cur.format(result.closingCostsDollar)} in closing costs by ${breakEvenDateStr(result.breakEvenMonths!)} — before your remaining term ends.`;
    verdictPositive = true;
  } else {
    verdictValue = `${formatMonths(result.breakEvenMonths!)}`;
    verdictLabel = 'Break-even — not worth it';
    verdictSubtext = `Break-even falls after your remaining loan term ends. You'd pay ${cur.format(result.closingCostsDollar)} in closing costs without recouping them.`;
    verdictPositive = false;
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6 flex flex-col gap-4">
      <div className={`rounded-lg p-4 border ${verdictPositive ? 'border-accent/30 bg-accent/10' : 'border-border bg-background'}`}>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted uppercase tracking-wide">{verdictLabel}</p>
          <InfoTooltip text="The number of months until your monthly savings have fully paid back the refinance closing costs." />
        </div>
        <p className="text-3xl font-bold mt-1 tabular-nums">{verdictValue}</p>
        <p className="text-sm text-muted mt-2">{verdictSubtext}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Current monthly payment"
          value={cur.format(result.currentMonthlyPayment)}
          tooltip="Your principal and interest payment on the current mortgage each month."
        />
        <StatCard
          label="New monthly payment"
          value={cur.format(result.newMonthlyPayment)}
          tooltip="Your principal and interest payment on the refinanced mortgage each month."
        />
        <StatCard
          label="Monthly savings"
          value={result.monthlySavings >= 0 ? cur.format(result.monthlySavings) : `-${cur.format(Math.abs(result.monthlySavings))}`}
          tooltip="How much less (or more) you'd pay each month after refinancing."
        />
        <StatCard
          label="Closing costs"
          value={cur.format(result.closingCostsDollar)}
          tooltip="The upfront fees you pay to close the new loan — what you need to recoup through monthly savings."
        />
        <StatCard
          label="Total interest — current"
          value={cur.format(result.totalInterestCurrent)}
          tooltip="Total interest you'll pay over the remaining life of your current loan."
        />
        <StatCard
          label="Total interest — refinanced"
          value={cur.format(result.totalInterestRefinanced)}
          tooltip="Total interest you'll pay over the full term of the new refinanced loan."
        />
        <StatCard
          label="Net savings"
          value={result.netSavings >= 0 ? cur.format(result.netSavings) : `-${cur.format(Math.abs(result.netSavings))}`}
          tooltip="Interest saved on the current path minus the new path, minus closing costs. Positive means refinancing saves money overall."
        />
      </div>
    </div>
  );
}
