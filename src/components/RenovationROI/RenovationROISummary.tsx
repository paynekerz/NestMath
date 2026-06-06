import type { RenovationROIResult } from '../../lib/renovation-roi';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RenovationROIResult | null;
  yearsUntilSale: number;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

function recommendation(result: RenovationROIResult, years: number): string {
  if (result.renoWins) {
    if (result.renoROIPct <= 0) {
      return `The renovation loses money but still outperforms investing over ${years} years. Both paths are negative — the market return is worse in this scenario.`;
    }
    return `The renovation returns more than investing the same cash over ${years} years. The compounding appreciation premium outpaces the market in this scenario.`;
  }
  if (result.renoNetGain >= 0) {
    return `The renovation is profitable, but putting that money in the market would grow it more over ${years} years. Consider investing instead.`;
  }
  return `The renovation costs more than it gains at sale over ${years} years, and the market would grow that cash faster. Investing is the stronger financial move here.`;
}

export function RenovationROISummary({ result, yearsUntilSale }: Props) {
  const renoWins = result?.renoWins ?? false;
  const borderColor = renoWins ? 'border-primary-accent/40' : 'border-success-emerald/30';
  const headerBorderColor = renoWins ? 'border-primary-accent/20' : 'border-success-emerald/10';
  const headerBg = renoWins ? 'bg-primary-container/10' : 'bg-success-emerald/5';
  const iconColor = renoWins ? 'text-primary-accent' : 'text-success-emerald';
  const iconName = renoWins ? 'home_repair_service' : 'trending_up';
  const heroColor = renoWins ? 'text-primary' : 'text-success-emerald';
  const footerBg = renoWins
    ? 'bg-primary-accent/5 border-t border-primary-accent/10'
    : 'bg-success-emerald/5 border-t border-success-emerald/10';

  return (
    <div className={`bg-surface-elevated rounded-xl border ${borderColor} overflow-hidden flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-lg py-sm flex items-center justify-between border-b ${headerBorderColor} ${headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined ${iconColor}`} style={{ fontSize: '18px' }}>{iconName}</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">VERDICT</span>
        </div>
        {result && (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border ${renoWins ? 'bg-primary-accent/10 text-primary border-primary-accent/20' : 'bg-success-emerald/10 text-success-emerald border-success-emerald/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse inline-block ${renoWins ? 'bg-primary-accent' : 'bg-success-emerald'}`} />
            {renoWins ? 'Renovate' : 'Invest'}
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero stat — ROI % */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">renovation ROI</p>
            <p className={`text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 ${heroColor}`}>
              {pct(result.renoROIPct)}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-1">over {yearsUntilSale} years</p>
          </div>

          {/* 2-col stats */}
          <div className="grid grid-cols-2 gap-4 px-lg pb-lg border-t border-border-subtle pt-lg">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-label-sm text-on-surface-variant">Reno Net Gain</p>
                <InfoTooltip text="How much more you'll get at sale from the renovation, minus what the renovation cost." />
              </div>
              <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.renoNetGain >= 0 ? 'text-primary' : 'text-error'}`}>
                {result.renoNetGain >= 0 ? `+${cur.format(result.renoNetGain)}` : cur.format(result.renoNetGain)}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-0.5">vs. renovation cost</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-label-sm text-on-surface-variant">Invest Net Gain</p>
                <InfoTooltip text="How much the renovation money would grow if invested in the market instead, minus the original investment." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                +{cur.format(result.investNetGain)}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-0.5">if invested instead</p>
            </div>
          </div>

          {/* Delta stat */}
          <div className="px-lg pb-lg">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container border border-border-subtle">
              <div className="flex items-center gap-1">
                <span className="text-label-sm text-on-surface-variant">Winner advantage</span>
                <InfoTooltip text="The dollar difference between the better path's net gain and the other path's net gain at the planned sale date." />
              </div>
              <span className={`text-body-sm font-bold tabular-nums ${renoWins ? 'text-primary' : 'text-success-emerald'}`}>
                +{cur.format(result.delta)} ({renoWins ? 'reno' : 'invest'})
              </span>
            </div>
          </div>

          {/* Footer recommendation */}
          <div className={`${footerBg} px-lg py-sm`}>
            <p className="text-body-sm text-on-surface-variant">
              {recommendation(result, yearsUntilSale)}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>calculate</span>
          <p className="text-body-sm text-on-surface-variant">Enter your renovation details to compare returns against investing the same cash.</p>
        </div>
      )}
    </div>
  );
}
