import type { SocialSecurityResult } from '../../lib/social-security';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: SocialSecurityResult | null;
  applyReduction: boolean;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const STRATEGY_LABELS: Record<'62' | '67' | '70', { label: string; color: string; bg: string; border: string }> = {
  '62': {
    label: 'Claim at 62',
    color: '#f87171',
    bg: 'oklch(55% 0.2 25 / 0.08)',
    border: 'oklch(55% 0.2 25 / 0.35)',
  },
  '67': {
    label: 'Claim at 67 (FRA)',
    color: 'oklch(55% 0.18 250)',
    bg: 'oklch(55% 0.18 250 / 0.08)',
    border: 'oklch(55% 0.18 250 / 0.35)',
  },
  '70': {
    label: 'Claim at 70',
    color: 'oklch(55% 0.15 150)',
    bg: 'oklch(55% 0.15 150 / 0.08)',
    border: 'oklch(55% 0.15 150 / 0.35)',
  },
};

export function SocialSecuritySummary({ result, applyReduction }: Props) {
  const strategy = result ? STRATEGY_LABELS[result.recommendedStrategy] : null;

  return (
    <div
      className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full"
      style={{ border: `1px solid ${strategy ? strategy.border : 'oklch(25% 0.02 260)'}` }}
    >
      {/* Header */}
      <div
        className="px-lg py-sm flex items-center justify-between"
        style={{
          background: strategy ? strategy.bg : 'transparent',
          borderBottom: '1px solid oklch(25% 0.02 260)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: strategy ? strategy.color : 'oklch(55% 0.01 260)' }}
          >
            {result ? 'event_available' : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">BREAK-EVEN</span>
        </div>
        {result && (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border"
            style={{ background: strategy!.bg, color: strategy!.color, border: `1px solid ${strategy!.border}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: strategy!.color }} />
            {strategy!.label}
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: recommended strategy */}
          <div
            className="flex flex-col items-center justify-center gap-1 px-lg pt-lg pb-md text-center"
            style={{ background: strategy!.bg }}
          >
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Recommended Strategy</p>
            <p className="text-[44px] font-bold font-mono-data tabular-nums leading-none mt-1" style={{ color: strategy!.color }}>
              Age {result.recommendedStrategy}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-1">
              {result.recommendedStrategy === '62'
                ? 'Maximizes lifetime total given your life expectancy'
                : result.recommendedStrategy === '67'
                  ? 'Beats claiming at 62 before your life expectancy'
                  : 'Beats both earlier strategies before your life expectancy'}
            </p>
            {applyReduction && (
              <p className="text-label-sm mt-1" style={{ color: 'oklch(65% 0.14 60)' }}>
                ⚠ Based on 75% of scheduled benefits
              </p>
            )}
          </div>

          {/* Break-even ages */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">62 vs. 67 break-even</p>
                <InfoTooltip text="The age at which cumulative lifetime benefits from claiming at 67 overtake cumulative benefits from claiming at 62. If you live past this age, waiting until 67 pays off." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {result.breakEvenAge_62vs67 !== null ? `Age ${result.breakEvenAge_62vs67}` : 'Never'}
              </p>
              <p className="text-label-sm text-on-surface-variant">
                {result.breakEvenAge_62vs67 !== null ? 'live past this to benefit' : 'claiming 62 always wins'}
              </p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">67 vs. 70 break-even</p>
                <InfoTooltip text="The age at which cumulative lifetime benefits from claiming at 70 overtake cumulative benefits from claiming at 67. If you live past this age, delaying to 70 pays off." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {result.breakEvenAge_67vs70 !== null ? `Age ${result.breakEvenAge_67vs70}` : 'Never'}
              </p>
              <p className="text-label-sm text-on-surface-variant">
                {result.breakEvenAge_67vs70 !== null ? 'live past this to benefit' : 'claiming 67 always wins'}
              </p>
            </div>
          </div>

          {/* Lifetime totals */}
          <div className="border-t border-border-subtle px-lg py-sm flex flex-col gap-2">
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-label-sm text-on-surface-variant">Lifetime totals through age {result.chartRows.at(-1)?.age}</p>
              <InfoTooltip text="Total cumulative benefits received from each claiming age through your life expectancy. Does not account for investment returns, inflation, or COLA adjustments." />
            </div>
            {(['62', '67', '70'] as const).map(age => {
              const style = STRATEGY_LABELS[age];
              const total = age === '62' ? result.lifetimeTotalAt62 : age === '67' ? result.lifetimeTotalAt67 : result.lifetimeTotalAt70;
              const isWinner = result.recommendedStrategy === age;
              return (
                <div key={age} className="flex items-center justify-between">
                  <span className="text-label-sm" style={{ color: isWinner ? style.color : 'oklch(55% 0.01 260)' }}>
                    {isWinner ? '▶ ' : ''}Claim at {age}
                  </span>
                  <span
                    className="font-mono-data text-body-sm tabular-nums font-semibold"
                    style={{ color: isWinner ? style.color : 'oklch(55% 0.01 260)' }}
                  >
                    {cur.format(total)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>event_available</span>
          <p className="text-body-sm text-on-surface-variant">Enter your income and life expectancy to see the optimal Social Security claiming strategy.</p>
        </div>
      )}
    </div>
  );
}
