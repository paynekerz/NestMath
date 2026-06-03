import type { PayoffResult } from '../../lib/calculator';
import { StatCard } from '../ui/StatCard';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: PayoffResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function payoffDate(months: number): string {
  if (months <= 0) return 'Already paid off';
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

export function PayoffSummary({ result }: Props) {
  const hasSavings = result.monthsSaved > 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-6 flex flex-col gap-4">
      <div className={`rounded-lg p-4 border ${hasSavings ? 'border-accent/30 bg-accent/10' : 'border-border bg-background'}`}>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted uppercase tracking-wide">Interest saved</p>
          <InfoTooltip text="The total interest you avoid paying by making extra payments. This is real money that stays in your pocket." />
        </div>
        <p className="text-3xl font-bold mt-1 tabular-nums">{cur.format(result.interestSaved)}</p>
        {hasSavings && (
          <p className="text-sm text-muted mt-2">
            Payoff {formatMonths(result.monthsSaved)} sooner
            &nbsp;·&nbsp;
            New payoff: <span className="font-medium">{payoffDate(result.extraPayoffMonths)}</span>
          </p>
        )}
        {!hasSavings && (
          <p className="text-sm text-muted mt-2">Add extra payments to see how much you save.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Monthly payment"
          value={cur.format(result.monthlyPayment)}
          tooltip="Your standard monthly mortgage payment — principal plus interest. Does not include taxes, insurance, or HOA."
        />
        <StatCard
          label="Original payoff date"
          value={payoffDate(result.originalPayoffMonths)}
          tooltip="When your loan is fully paid off with no extra payments."
        />
        <StatCard
          label="New payoff date"
          value={payoffDate(result.extraPayoffMonths)}
          tooltip="When your loan is fully paid off with your extra payments applied."
        />
        <StatCard
          label="Months saved"
          value={String(result.monthsSaved)}
          tooltip="How many fewer monthly payments you make by adding extra principal payments."
        />
        <StatCard
          label="Total interest (original)"
          value={cur.format(result.totalInterestOriginal)}
          tooltip="The total interest you pay over the full loan term with no extra payments."
        />
        <StatCard
          label="Total interest (with extra)"
          value={cur.format(result.totalInterestExtra)}
          tooltip="The total interest you pay when extra payments are applied."
        />
      </div>
    </div>
  );
}
