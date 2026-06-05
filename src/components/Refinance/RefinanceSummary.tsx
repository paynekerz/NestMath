import type { RefinanceResult } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RefinanceResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function formatMonths(months: number): string {
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  if (yrs === 0) return `${mo} mo`;
  if (mo === 0) return `${yrs} yr`;
  return `${yrs} yr ${mo} mo`;
}

function breakEvenDateStr(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function RefinanceSummary({ result }: Props) {
  const hasPositiveSavings = result ? result.monthlySavings > 0 : false;

  return (
    <div className="bg-surface-elevated rounded-xl border border-success-emerald/30 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-lg py-sm flex items-center justify-between border-b border-success-emerald/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '18px' }}>check_circle</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">VERDICT</span>
        </div>
        {result?.worthIt && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold bg-success-emerald/10 text-success-emerald border border-success-emerald/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse inline-block" />
            DRAFT - High Opportunity
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Monthly savings hero */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Monthly Savings</p>
            <p className={`text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 ${hasPositiveSavings ? 'text-success-emerald' : 'text-error'}`}>
              {result.monthlySavings >= 0
                ? cur.format(result.monthlySavings)
                : `-${cur.format(Math.abs(result.monthlySavings))}`}
            </p>
          </div>

          {/* 2-col stats */}
          <div className="grid grid-cols-2 gap-4 px-lg pb-lg border-t border-border-subtle pt-lg">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-label-sm text-on-surface-variant">Lifetime Savings</p>
                <InfoTooltip text="Total interest saved by refinancing, after deducting closing costs." />
              </div>
              <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.netSavings >= 0 ? 'text-on-surface' : 'text-error'}`}>
                {result.netSavings >= 0
                  ? cur.format(result.netSavings)
                  : `-${cur.format(Math.abs(result.netSavings))}`}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-label-sm text-on-surface-variant">Break-Even</p>
                <InfoTooltip text="Months until monthly savings have fully paid back the closing costs." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {result.breakEvenMonths !== null ? formatMonths(result.breakEvenMonths) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Footer recommendation */}
          <div className="bg-success-emerald/5 border-t border-success-emerald/10 px-lg py-sm">
            <p className="text-body-sm text-on-surface-variant">
              {!hasPositiveSavings
                ? 'DRAFT - The new rate does not lower your monthly payment. Refinancing is not recommended with these numbers.'
                : result.worthIt
                ? `DRAFT - Break-even by ${breakEvenDateStr(result.breakEvenMonths!)} — refinancing saves money before your loan ends.`
                : `DRAFT - Break-even falls after your loan ends. These terms do not justify the closing costs.`}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>calculate</span>
          <p className="text-body-sm text-on-surface-variant">Fill in your loan details and click Calculate Verdict to see your refinance analysis.</p>
        </div>
      )}
    </div>
  );
}
