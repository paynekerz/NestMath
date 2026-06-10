import type { TaxWithholdingResult } from '../../lib/tax-withholding';

interface Props {
  result: TaxWithholdingResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function TaxWithholdingChart({ result }: Props) {
  const max = Math.max(result.estimatedTaxOwed, result.currentWithholding, 1);
  const taxPct = (result.estimatedTaxOwed / max) * 100;
  const withheldPct = (result.currentWithholding / max) * 100;

  const isRefund = result.difference > 0;
  const isOnTrack = Math.abs(result.difference) < 100;

  const taxColor = 'oklch(55% 0.18 250)';
  const withheldColor = isOnTrack
    ? 'oklch(55% 0.15 150)'
    : isRefund
      ? 'oklch(55% 0.15 150)'
      : 'oklch(65% 0.18 30)';

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <h2 className="text-label-md font-semibold text-on-surface mb-4">Tax Owed vs. Withheld</h2>

      <div className="flex flex-col gap-5">
        {/* Tax owed bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">Estimated tax owed</span>
            <span className="text-body-md font-bold font-mono-data tabular-nums text-on-surface">
              {cur.format(result.estimatedTaxOwed)}
            </span>
          </div>
          <div className="h-9 rounded-lg overflow-hidden bg-surface-container">
            <div
              className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
              style={{ width: `${Math.max(taxPct, 2)}%`, background: taxColor }}
            >
              {taxPct > 20 && (
                <span className="text-label-sm font-semibold text-white">{cur.format(result.estimatedTaxOwed)}</span>
              )}
            </div>
          </div>
          <p className="text-label-sm text-on-surface-variant">
            {(result.estimatedTaxOwed / Math.max(result.adjustedGrossIncome, 1) * 100).toFixed(1)}% effective rate on {cur.format(result.adjustedGrossIncome)} AGI
          </p>
        </div>

        {/* Withheld bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">Current withholding</span>
            <span className="text-body-md font-bold font-mono-data tabular-nums" style={{ color: withheldColor }}>
              {cur.format(result.currentWithholding)}
            </span>
          </div>
          <div className="h-9 rounded-lg overflow-hidden bg-surface-container">
            <div
              className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
              style={{ width: `${Math.max(withheldPct, 2)}%`, background: withheldColor }}
            >
              {withheldPct > 20 && (
                <span className="text-label-sm font-semibold text-white">{cur.format(result.currentWithholding)}</span>
              )}
            </div>
          </div>
          <p className="text-label-sm" style={{ color: withheldColor }}>
            {isOnTrack
              ? 'On track: matches estimated tax'
              : isRefund
                ? `Over-withheld by ${cur.format(result.difference)}: expect a refund`
                : `Under-withheld by ${cur.format(-result.difference)}: you may owe at filing`}
          </p>
        </div>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-6">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Taxable income</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {cur.format(result.taxableIncome)}
          </p>
          <p className="text-label-sm text-on-surface-variant">after {cur.format(result.standardDeduction)} deduction</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Effective rate</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {(result.effectiveTaxRate * 100).toFixed(1)}%
          </p>
          <p className="text-label-sm text-on-surface-variant">average across all income</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Marginal rate</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {(result.marginalRate * 100).toFixed(0)}%
          </p>
          <p className="text-label-sm text-on-surface-variant">on your last dollar</p>
        </div>
      </div>
    </div>
  );
}
