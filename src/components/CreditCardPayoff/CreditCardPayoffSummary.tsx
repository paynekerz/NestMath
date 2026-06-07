import type { CreditCardPayoffResult } from '../../lib/credit-card-payoff';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: CreditCardPayoffResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function getPayoffDate(monthsFromNow: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function fmtMonths(n: number): string {
  const y = Math.floor(n / 12);
  const m = n % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} yr${y !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mo`);
  return parts.join(', ');
}

export function CreditCardPayoffSummary({ result }: Props) {
  return (
    <div className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border border-success-emerald/30">
      {/* Header */}
      <div className="px-lg py-sm flex items-center justify-between bg-success-emerald/5 border-b border-success-emerald/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '18px' }}>
            {result ? 'task_alt' : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">PAYOFF PLAN</span>
        </div>
        {result && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border bg-success-emerald/10 text-success-emerald border-success-emerald/20">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block bg-success-emerald" />
            SAVING
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: interest saved vs. minimum */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Interest Saved vs. Minimum</p>
            <p className="text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 text-success-emerald">
              {cur.format(result.interestSaved)}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              by paying {cur.format(result.effectivePayment)}/mo instead of minimum
            </p>
          </div>

          {/* Two-col: payoff date | total interest */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Debt-free</p>
                <InfoTooltip text="The month and year your balance reaches zero at your chosen payment amount." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                {getPayoffDate(result.payoffMonths)}
              </p>
              <p className="text-label-sm text-on-surface-variant">{fmtMonths(result.payoffMonths)}</p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Total interest</p>
                <InfoTooltip text="Total interest charges you'll pay over the life of the payoff plan." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
                {cur.format(result.totalInterest)}
              </p>
              <p className="text-label-sm text-on-surface-variant">{cur.format(result.totalPaid)} total paid</p>
            </div>
          </div>

          {/* Minimum payment row */}
          <div className="border-t border-success-emerald/10 bg-success-emerald/5 px-lg py-sm">
            <p className="text-label-sm text-on-surface-variant mb-1">Minimum payment path</p>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-on-surface-variant">{fmtMonths(result.minPayoffMonths)}</span>
              <span className="text-body-sm font-bold font-mono-data tabular-nums text-error">{cur.format(result.minTotalInterest)} interest</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>credit_card</span>
          <p className="text-body-sm text-on-surface-variant">Enter your balance and APR to see your payoff plan.</p>
        </div>
      )}
    </div>
  );
}
