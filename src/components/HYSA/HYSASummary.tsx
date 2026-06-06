import type { HYSAResult } from '../../lib/hysa';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: HYSAResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function HYSASummary({ result }: Props) {
  return (
    <div className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border border-success-emerald/30">
      {/* Header */}
      <div className="px-lg py-sm flex items-center justify-between bg-success-emerald/5 border-b border-success-emerald/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '18px' }}>
            {result ? 'account_balance' : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">HYSA GROWTH</span>
        </div>
        {result && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border bg-success-emerald/10 text-success-emerald border-success-emerald/20">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block bg-success-emerald" />
            EARNING MORE
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: extra earned */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Extra Earned vs. Traditional</p>
            <p className="text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 text-success-emerald">
              {cur.format(result.extraEarned)}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              more interest than a regular savings account
            </p>
          </div>

          {/* Two-col balances */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>trending_up</span>
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">HYSA balance</p>
                <InfoTooltip text="Your final savings balance after all years in a high-yield savings account." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                {cur.format(result.finalBalanceHYSA)}
              </p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>trending_flat</span>
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Traditional balance</p>
                <InfoTooltip text="Your final savings balance after all years in a regular savings account at the national average APY." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface-variant">
                {cur.format(result.finalBalanceTraditional)}
              </p>
            </div>
          </div>

          {/* Footer: total contributions */}
          <div className="border-t border-success-emerald/10 bg-success-emerald/5 px-lg py-sm">
            <p className="text-label-sm text-on-surface-variant">Total contributions</p>
            <p className="text-body-md font-bold font-mono-data tabular-nums text-on-surface mt-0.5">
              {cur.format(result.totalContributions)}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>savings</span>
          <p className="text-body-sm text-on-surface-variant">Enter your deposit and APY to see how much more a HYSA earns.</p>
        </div>
      )}
    </div>
  );
}
