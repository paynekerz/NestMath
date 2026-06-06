import type { EffectiveHourlyResult } from '../../lib/effective-hourly';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: EffectiveHourlyResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const curLarge = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function EffectiveHourlySummary({ result }: Props) {
  return (
    <div className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border border-primary/20">
      {/* Header */}
      <div className="px-lg py-sm flex items-center justify-between bg-primary-container/10 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>
            {result ? 'real_estate_agent' : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">TRUE RATE</span>
        </div>
        {result && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border bg-error/10 text-error border-error/20">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block bg-error" />
            REALITY CHECK
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: effective rate */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Effective Hourly Rate</p>
            <p className="text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 text-primary">
              {cur.format(result.effectiveHourlyNet)}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              after taxes, expenses & all real hours
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-label-sm text-on-surface-variant">vs. stated</span>
              <span className="text-body-md font-bold font-mono-data tabular-nums text-on-surface">{cur.format(result.statedHourlyGross)}/hr gross</span>
            </div>
          </div>

          {/* Two-col: delta + hidden hours */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-error" style={{ fontSize: '16px' }}>arrow_downward</span>
                <p className="text-label-sm text-on-surface-variant">You lose</p>
                <InfoTooltip text="The gap between what your employer says you earn per hour and what you actually take home per real hour worked." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
                {cur.format(result.delta)}
              </p>
              <p className="text-label-sm text-on-surface-variant">per stated hour</p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>schedule</span>
                <p className="text-label-sm text-on-surface-variant">Hidden hours</p>
                <InfoTooltip text="Hours you spend on work that aren't included in your contracted work time: unpaid overtime, commute, prep, and decompression." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {result.hiddenHoursPerWeek} hrs
              </p>
              <p className="text-label-sm text-on-surface-variant">per week unpaid</p>
            </div>
          </div>

          {/* Footer: adjusted take-home */}
          <div className="border-t border-primary/10 bg-primary-container/10 px-lg py-sm">
            <div className="flex items-center gap-1">
              <p className="text-label-sm text-on-surface-variant">Adjusted annual take-home</p>
              <InfoTooltip text="Your after-tax income minus all annual work-related expenses." />
            </div>
            <p className="text-body-md font-bold font-mono-data tabular-nums text-on-surface mt-0.5">
              {curLarge.format(result.adjustedTakeHome)}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>work</span>
          <p className="text-body-sm text-on-surface-variant">Enter your salary and hours to see your true effective rate.</p>
        </div>
      )}
    </div>
  );
}
