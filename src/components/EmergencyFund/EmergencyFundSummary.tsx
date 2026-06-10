import type { EmergencyFundResult } from '../../lib/emergency-fund';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: EmergencyFundResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function coverageColor(months: number): { text: string; bg: string; border: string; badge: string; label: string } {
  if (months < 1) return {
    text: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    label: 'CRITICAL',
  };
  if (months < 3) return {
    text: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    label: 'BUILDING',
  };
  return {
    text: 'text-success-emerald',
    bg: 'bg-success-emerald/10',
    border: 'border-success-emerald/20',
    badge: 'bg-success-emerald/10 text-success-emerald border-success-emerald/20',
    label: 'FUNDED',
  };
}

function formatMonths(m: number): string {
  if (m === 0) return 'Already there';
  if (m >= 240) return '20+ years';
  const years = Math.floor(m / 12);
  const mo = m % 12;
  if (years === 0) return `${m} mo`;
  if (mo === 0) return `${years} yr`;
  return `${years} yr ${mo} mo`;
}

function ProgressBar({ label, current, target, tooltip }: { label: string; current: number; target: number; tooltip: string }) {
  const pct = Math.min(current / target * 100, 100);
  const color = pct >= 100 ? 'bg-success-emerald' : pct >= 50 ? 'bg-primary' : 'bg-amber-500';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-label-sm text-on-surface-variant">{label}</span>
          <InfoTooltip text={tooltip} />
        </div>
        <span className="text-label-sm font-semibold font-mono-data text-on-surface">{cur.format(target)}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-container overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-label-sm text-on-surface-variant text-right">{pct.toFixed(0)}% funded</p>
    </div>
  );
}

export function EmergencyFundSummary({ result }: Props) {
  if (!result) {
    return (
      <div className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border border-border-subtle">
        <div className="px-lg py-sm flex items-center gap-2 border-b border-border-subtle">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>calculate</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">EMERGENCY FUND</span>
        </div>
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>shield</span>
          <p className="text-body-sm text-on-surface-variant">Enter your expenses and savings to see your coverage.</p>
        </div>
      </div>
    );
  }

  const { text, bg, border, badge, label } = coverageColor(result.currentMonthsCoverage);
  const coverageDisplay = result.currentMonthsCoverage.toFixed(1);

  return (
    <div className={`bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border ${border}`}>
      {/* Header */}
      <div className={`px-lg py-sm flex items-center justify-between ${bg} border-b ${border}`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined ${text}`} style={{ fontSize: '18px' }}>shield</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">EMERGENCY FUND</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border ${badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse inline-block ${text.replace('text-', 'bg-')}`} />
          {label}
        </span>
      </div>

      {/* Hero: current coverage */}
      <div className={`flex flex-col items-center justify-center gap-1 px-lg pt-lg pb-md text-center ${bg}`}>
        <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Current Coverage</p>
        <p className={`text-[48px] font-bold font-mono-data tabular-nums leading-none mt-1 ${text}`}>
          {coverageDisplay}
        </p>
        <p className="text-body-sm text-on-surface-variant">months of expenses covered</p>
      </div>

      {/* Progress bars */}
      <div className="px-lg py-md flex flex-col gap-4 border-t border-border-subtle/50">
        <ProgressBar
          label="3-month goal"
          current={result.months[0].savings}
          target={result.threeMonthTarget}
          tooltip="A 3-month emergency fund covers most job losses and unexpected expenses. Financial experts recommend this as the minimum target."
        />
        <ProgressBar
          label="6-month goal"
          current={result.months[0].savings}
          target={result.sixMonthTarget}
          tooltip="A 6-month emergency fund covers a serious illness, job loss, or major unexpected expense without going into debt."
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
        <div className="px-sm py-md flex flex-col items-center text-center gap-1">
          <div className="flex items-center gap-1">
            <p className="text-label-sm text-on-surface-variant">To 3-month goal</p>
            <InfoTooltip text="Months until your savings reach the 3-month target, factoring in your monthly contributions and HYSA interest." />
          </div>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {formatMonths(result.monthsToThree)}
          </p>
        </div>
        <div className="px-sm py-md flex flex-col items-center text-center gap-1">
          <div className="flex items-center gap-1">
            <p className="text-label-sm text-on-surface-variant">To 6-month goal</p>
            <InfoTooltip text="Months until your savings reach the 6-month target, factoring in your monthly contributions and HYSA interest." />
          </div>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {formatMonths(result.monthsToSix)}
          </p>
        </div>
      </div>

      {/* Footer: interest earned */}
      <div className={`border-t ${border} ${bg} px-lg py-sm`}>
        <div className="flex items-center gap-1">
          <p className="text-label-sm text-on-surface-variant">Interest earned along the way</p>
          <InfoTooltip text="Total HYSA interest earned between now and hitting the 6-month goal, just from keeping funds in a high-yield account." />
        </div>
        <p className="text-body-md font-bold font-mono-data tabular-nums text-success-emerald mt-0.5">
          {cur.format(result.interestEarned)}
        </p>
      </div>
    </div>
  );
}
