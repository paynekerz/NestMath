import type { StudentLoanPayoffResult } from '../../lib/student-loan-payoff';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: StudentLoanPayoffResult | null;
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
  return parts.join(', ') || '0 mo';
}

export function StudentLoanPayoffSummary({ result }: Props) {
  const hasExtra = result !== null && result.monthsSaved > 0;

  return (
    <div className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border border-success-emerald/30">
      {/* Header */}
      <div className="px-lg py-sm flex items-center justify-between bg-success-emerald/5 border-b border-success-emerald/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '18px' }}>
            {result ? 'task_alt' : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">PAYOFF SUMMARY</span>
        </div>
        {result && hasExtra && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border bg-success-emerald/10 text-success-emerald border-success-emerald/20">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block bg-success-emerald" />
            SAVING
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: interest saved */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Interest Saved</p>
            <p className={`text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 ${hasExtra ? 'text-success-emerald' : 'text-on-surface-variant'}`}>
              {cur.format(result.interestSaved)}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {hasExtra
                ? `by paying ${cur.format(result.monthlyPayment + (result.interestSaved > 0 ? 0 : 0))}/mo extra`
                : 'add extra payments above to see savings'}
            </p>
          </div>

          {/* Two-col: standard payoff | accelerated payoff */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Standard payoff</p>
                <InfoTooltip text="When you'll pay off your loan with your standard monthly payment and no extra." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {getPayoffDate(result.standardPayoffMonths)}
              </p>
              <p className="text-label-sm text-on-surface-variant">{fmtMonths(result.standardPayoffMonths)}</p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">
                  {hasExtra ? 'New payoff date' : 'Total interest'}
                </p>
                <InfoTooltip text={hasExtra ? "When you'll pay off your loan with your extra monthly payment applied." : "Total interest you'll pay over the full loan term."} />
              </div>
              {hasExtra ? (
                <>
                  <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                    {getPayoffDate(result.acceleratedPayoffMonths)}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">{fmtMonths(result.acceleratedPayoffMonths)}</p>
                </>
              ) : (
                <>
                  <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
                    {cur.format(result.totalInterestStandard)}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">over {fmtMonths(result.standardPayoffMonths)}</p>
                </>
              )}
            </div>
          </div>

          {/* Footer stats row */}
          {hasExtra && (
            <div className="border-t border-success-emerald/10 bg-success-emerald/5 px-lg py-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-label-sm text-on-surface-variant">Months saved</p>
                  <p className="text-body-md font-bold font-mono-data tabular-nums text-success-emerald">
                    {result.monthsSaved} mo
                  </p>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant">Interest (with extra)</p>
                  <p className="text-body-md font-bold font-mono-data tabular-nums text-error">
                    {cur.format(result.totalInterestAccelerated)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>school</span>
          <p className="text-body-sm text-on-surface-variant">Enter your loan balance and interest rate to see your payoff plan.</p>
        </div>
      )}
    </div>
  );
}
