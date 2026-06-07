import type { NetWorthResult } from '../../lib/net-worth';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: NetWorthResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function netWorthLabel(nw: number): { label: string; text: string; bg: string; border: string } {
  if (nw > 0) return { label: 'POSITIVE', text: 'text-success-emerald', bg: 'bg-success-emerald/10', border: 'border-success-emerald/20' };
  if (nw === 0) return { label: 'ZERO', text: 'text-on-surface-variant', bg: 'bg-surface-container', border: 'border-border-subtle' };
  return { label: 'NEGATIVE', text: 'text-error', bg: 'bg-error/10', border: 'border-error/20' };
}

export function NetWorthSummary({ result }: Props) {
  const { label, text, bg, border } = netWorthLabel(result.netWorth);
  const isNegative = result.netWorth < 0;
  const yoyPositive = result.yoyDelta !== null && result.yoyDelta >= 0;

  return (
    <div className={`bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border ${border}`}>
      {/* Header */}
      <div className={`px-lg py-sm flex items-center justify-between ${bg} border-b ${border}`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined ${text}`} style={{ fontSize: '18px' }}>account_balance</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">NET WORTH</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border ${bg} ${text} ${border}`}>
          {label}
        </span>
      </div>

      {/* Hero: net worth number */}
      <div className={`flex flex-col items-center justify-center gap-1 px-lg pt-lg pb-md text-center ${bg}`}>
        <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Your Net Worth</p>
        <p className={`text-[48px] font-bold font-mono-data tabular-nums leading-none mt-1 ${text}`}>
          {cur.format(result.netWorth)}
        </p>
        {/* YOY delta chip */}
        {result.yoyDelta !== null && (
          <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-semibold border ${yoyPositive ? 'bg-success-emerald/10 text-success-emerald border-success-emerald/20' : 'bg-error/10 text-error border-error/20'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {yoyPositive ? 'trending_up' : 'trending_down'}
            </span>
            {yoyPositive ? '+' : ''}{cur.format(result.yoyDelta)} vs last year
          </div>
        )}
      </div>

      {/* Assets vs Liabilities breakdown */}
      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
        <div className="px-sm py-md flex flex-col items-center text-center gap-1">
          <div className="flex items-center gap-1">
            <p className="text-label-sm text-on-surface-variant">Total Assets</p>
            <InfoTooltip text="The sum of everything you own that has monetary value." />
          </div>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-success-emerald">
            {cur.format(result.totalAssets)}
          </p>
        </div>
        <div className="px-sm py-md flex flex-col items-center text-center gap-1">
          <div className="flex items-center gap-1">
            <p className="text-label-sm text-on-surface-variant">Total Liabilities</p>
            <InfoTooltip text="The sum of all outstanding debts and obligations you owe." />
          </div>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
            {cur.format(result.totalLiabilities)}
          </p>
        </div>
      </div>

      {/* Debt-to-asset ratio */}
      {result.totalAssets > 0 && (
        <div className="border-t border-border-subtle px-lg py-sm">
          <div className="flex items-center gap-1 mb-1.5">
            <p className="text-label-sm text-on-surface-variant">Debt-to-asset ratio</p>
            <InfoTooltip text="Total liabilities divided by total assets. Lower is better — below 50% means more than half your assets are unencumbered by debt." />
          </div>
          <div className="h-2 rounded-full bg-surface-container overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isNegative ? 'bg-error' : result.totalLiabilities / result.totalAssets > 0.5 ? 'bg-amber-500' : 'bg-success-emerald'}`}
              style={{ width: `${Math.min(result.totalAssets > 0 ? (result.totalLiabilities / result.totalAssets) * 100 : 0, 100)}%` }}
            />
          </div>
          <p className="text-label-sm text-on-surface-variant text-right">
            {result.totalAssets > 0 ? ((result.totalLiabilities / result.totalAssets) * 100).toFixed(1) : '0.0'}%
          </p>
        </div>
      )}
    </div>
  );
}
