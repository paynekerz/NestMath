import type { EffectiveHourlyResult } from '../../lib/effective-hourly';

interface Props {
  result: EffectiveHourlyResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function EffectiveHourlyBar({ result }: Props) {
  const max = result.statedHourlyGross;
  const effectivePct = max > 0 ? (result.effectiveHourlyNet / max) * 100 : 0;
  const statedPct = 100;

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg">
      <h2 className="text-label-md font-semibold text-on-surface mb-4">Stated vs. Effective Hourly Rate</h2>

      <div className="flex flex-col gap-5">
        {/* Stated gross */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">Stated gross hourly</span>
            <span className="text-body-md font-bold font-mono-data tabular-nums text-on-surface">{cur.format(result.statedHourlyGross)}/hr</span>
          </div>
          <div className="h-8 rounded-lg overflow-hidden bg-surface-container">
            <div
              className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
              style={{
                width: `${statedPct}%`,
                background: 'oklch(55% 0.18 250)',
              }}
            >
              <span className="text-label-sm font-semibold text-white">{cur.format(result.statedHourlyGross)}</span>
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant">{result.contractedHoursPerWeek} contracted hrs/wk · gross, before taxes</p>
        </div>

        {/* Effective net */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">Effective net hourly</span>
            <span className="text-body-md font-bold font-mono-data tabular-nums text-error">{cur.format(result.effectiveHourlyNet)}/hr</span>
          </div>
          <div className="h-8 rounded-lg overflow-hidden bg-surface-container">
            <div
              className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
              style={{
                width: `${Math.min(Math.max(effectivePct, 2), 100)}%`,
                background: 'oklch(50% 0.20 20)',
              }}
            >
              <span className="text-label-sm font-semibold text-white">{cur.format(result.effectiveHourlyNet)}</span>
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant">{result.totalRealHoursPerWeek} real hrs/wk · after taxes & expenses</p>
        </div>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-6">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">You lose</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
            {cur.format(result.delta)}/hr
          </p>
          <p className="text-label-sm text-on-surface-variant">stated vs. effective</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Hidden hours/yr</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {result.annualHiddenHours}
          </p>
          <p className="text-label-sm text-on-surface-variant">unpaid per year</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Work expenses/yr</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(result.annualWorkExpenses)}
          </p>
          <p className="text-label-sm text-on-surface-variant">out of pocket</p>
        </div>
      </div>
    </div>
  );
}
