import type { SideIncomeResult } from '../../lib/side-income';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: SideIncomeResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function SideIncomeSummary({ result }: Props) {
  const rate = result?.effectiveTaxRate ?? 0;
  const takeHomeColor = rate <= 0.25
    ? 'oklch(55% 0.15 150)'
    : rate <= 0.40
      ? 'oklch(65% 0.18 50)'
      : 'oklch(55% 0.20 20)';
  const takeBg = rate <= 0.25
    ? 'oklch(55% 0.15 150 / 0.08)'
    : rate <= 0.40
      ? 'oklch(65% 0.18 50 / 0.08)'
      : 'oklch(55% 0.20 20 / 0.08)';
  const takeBorder = rate <= 0.25
    ? 'oklch(55% 0.15 150 / 0.35)'
    : rate <= 0.40
      ? 'oklch(65% 0.18 50 / 0.35)'
      : 'oklch(55% 0.20 20 / 0.35)';

  return (
    <div
      className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full"
      style={{ border: `1px solid ${result ? takeBorder : 'oklch(25% 0.02 260)'}` }}
    >
      {/* Header */}
      <div
        className="px-lg py-sm flex items-center gap-2"
        style={{
          background: result ? takeBg : 'transparent',
          borderBottom: '1px solid oklch(25% 0.02 260)',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '18px', color: result ? takeHomeColor : 'oklch(55% 0.01 260)' }}
        >
          {result ? 'account_balance_wallet' : 'calculate'}
        </span>
        <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">TAKE-HOME BREAKDOWN</span>
      </div>

      {result ? (
        <>
          {/* Hero: true take-home */}
          <div
            className="flex flex-col items-center justify-center gap-1 px-lg pt-lg pb-md text-center"
            style={{ background: takeBg }}
          >
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">True take-home</p>
            <p className="text-display font-bold font-mono-data tabular-nums" style={{ color: takeHomeColor }}>
              {cur.format(Math.max(0, result.trueTakeHome))}
            </p>
            <p className="text-label-sm text-on-surface-variant">
              out of {cur.format(result.grossSideIncome)} gross · {pct(1 - result.effectiveTaxRate)} kept
            </p>

            {result.quarterlyEstimatedPayment !== null && (
              <div
                className="rounded-lg border px-md py-sm mt-2 w-full"
                style={{ background: takeBg, borderColor: takeBorder }}
              >
                <p className="text-label-sm text-on-surface-variant">Suggested quarterly estimated payment</p>
                <p className="text-headline-md font-bold font-mono-data tabular-nums mt-0.5" style={{ color: takeHomeColor }}>
                  {cur.format(result.quarterlyEstimatedPayment)}
                </p>
                <p className="text-label-sm text-on-surface-variant mt-0.5">due Apr 15 · Jun 15 · Sep 15 · Jan 15</p>
              </div>
            )}
          </div>

          {/* SE Tax | Income Tax pair */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">SE tax</p>
                <InfoTooltip text="Self-employment tax covers Social Security (12.4%) and Medicare (2.9%) for people who work for themselves. Employees split this with their employer; you pay both sides." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(result.selfEmploymentTax)}
              </p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Income tax</p>
                <InfoTooltip text="Federal income tax on your side income, applied at your marginal rate: the rate on your highest dollars given your total income." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(result.incomeTaxOnSideIncome)}
              </p>
            </div>
          </div>

          {/* Calculation walkthrough */}
          <div className="border-t border-border-subtle px-lg py-sm flex flex-col gap-2">
            <p className="text-label-sm text-on-surface-variant mb-0.5 font-medium">How it's calculated</p>
            {[
              {
                label: 'Gross side income',
                value: cur.format(result.grossSideIncome),
                tooltip: 'Total revenue before any deductions.',
              },
              {
                label: '− Business expenses',
                value: cur.format(result.businessExpenses),
                tooltip: 'Deductible costs of running your side business. Reduces the base SE tax is calculated on.',
              },
              {
                label: 'Net SE income',
                value: cur.format(result.netSEIncome),
                tooltip: 'Gross minus deductible expenses. This is your profit, and the starting point for all tax calculations.',
              },
              {
                label: 'SE tax base (× 92.35%)',
                value: cur.format(result.seTaxBase),
                tooltip: "The IRS treats 7.65% of net SE income as the employer's share, so SE tax is computed on 92.35% of net income, not the full amount.",
              },
              {
                label: 'Self-employment tax',
                value: cur.format(result.selfEmploymentTax),
                tooltip: '15.3% of the SE tax base (12.4% Social Security + 2.9% Medicare), up to the $176,100 Social Security wage base for 2025.',
              },
              {
                label: 'SE tax deduction (÷ 2)',
                value: `− ${cur.format(result.seTaxDeduction)}`,
                tooltip: 'The IRS lets you deduct half of SE tax from gross income before computing income tax, equivalent to the employer half an employee would not pay.',
              },
              {
                label: 'Taxable SE income',
                value: cur.format(result.taxableSEIncome),
                tooltip: 'Net SE income minus the SE tax deduction. This is what gets layered on top of your W-2 income to determine your income tax bracket.',
              },
              {
                label: 'Federal income tax on side income',
                value: cur.format(result.incomeTaxOnSideIncome),
                tooltip: 'The additional federal income tax caused by your side income, calculated at your marginal rate given your total income.',
              },
            ].map(({ label, value, tooltip }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-label-sm text-on-surface-variant truncate">{label}</span>
                  <InfoTooltip text={tooltip} />
                </div>
                <span className="font-mono-data text-label-sm tabular-nums text-on-surface font-semibold shrink-0">{value}</span>
              </div>
            ))}
          </div>

          {/* Effective tax rate */}
          <div className="border-t border-border-subtle px-lg py-sm flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-label-sm text-on-surface-variant">Effective tax rate on side income</span>
              <InfoTooltip text="Total tax (SE + income) as a percentage of your net self-employment income. This is your real combined tax burden on this income." />
            </div>
            <span className="font-mono-data text-body-sm tabular-nums font-bold" style={{ color: takeHomeColor }}>
              {pct(result.effectiveTaxRate)}
            </span>
          </div>

          {/* Disclaimer */}
          <div
            className="mx-lg mb-lg mt-2 rounded-lg px-md py-sm flex items-start gap-2"
            style={{ background: 'oklch(75% 0.12 60 / 0.06)', border: '1px solid oklch(70% 0.12 60 / 0.20)' }}
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px', color: 'oklch(60% 0.12 60)', marginTop: '1px' }}>info</span>
            <p className="text-label-sm text-on-surface-variant leading-relaxed">
              Federal tax only. Does not include state taxes, additional Medicare tax (0.9% above $200k), or self-employed health insurance deductions.
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>calculate</span>
          <p className="text-body-sm text-on-surface-variant">Enter your side income and W-2 income to see your true take-home.</p>
        </div>
      )}
    </div>
  );
}
