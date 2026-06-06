import type { InvestmentFeesResult } from '../../lib/investment-fees';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: InvestmentFeesResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function InvestmentFeesSummary({ result }: Props) {
  return (
    <div className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border border-error/30">
      {/* Header */}
      <div className="px-lg py-sm flex items-center justify-between bg-error/5 border-b border-error/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error" style={{ fontSize: '18px' }}>
            {result ? 'money_off' : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">FEE DRAG</span>
        </div>
        {result && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border bg-error/10 text-error border-error/20">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block bg-error" />
            COST OF FEES
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: fee drag in dollars */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Lost to Fees</p>
            <p className="text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 text-error">
              {cur.format(result.feeDragDollar)}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {result.feeDragPct.toFixed(1)}% of your low-cost portfolio value
            </p>
          </div>

          {/* Two-col portfolio values */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-[#f59e0b]" style={{ fontSize: '16px' }}>trending_flat</span>
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">With current fees</p>
                <InfoTooltip text="Your portfolio value after all those years with your current expense ratio deducted each year." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-[#f59e0b]">
                {cur.format(result.portfolioCurrentFees)}
              </p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '16px' }}>trending_up</span>
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Low-cost fund</p>
                <InfoTooltip text="Your portfolio value with the low-cost expense ratio. The difference is what you give up by staying in the high-fee fund." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-success-emerald">
                {cur.format(result.portfolioLowCost)}
              </p>
            </div>
          </div>

          {/* Footer: total contributions */}
          <div className="border-t border-error/10 bg-error/5 px-lg py-sm">
            <p className="text-label-sm text-on-surface-variant">Total contributions</p>
            <p className="text-body-md font-bold font-mono-data tabular-nums text-on-surface mt-0.5">
              {cur.format(result.totalContributions)}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>savings</span>
          <p className="text-body-sm text-on-surface-variant">Enter your portfolio details to see the long-term cost of your expense ratio.</p>
        </div>
      )}
    </div>
  );
}
