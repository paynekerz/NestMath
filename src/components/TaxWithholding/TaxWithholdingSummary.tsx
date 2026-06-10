import type { TaxWithholdingResult } from '../../lib/tax-withholding';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: TaxWithholdingResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

function verdictStyle(result: TaxWithholdingResult): { color: string; bg: string; border: string; icon: string } {
  if (Math.abs(result.difference) < 100) {
    return {
      color: 'oklch(55% 0.15 150)',
      bg: 'oklch(55% 0.15 150 / 0.08)',
      border: 'oklch(55% 0.15 150 / 0.35)',
      icon: 'check_circle',
    };
  }
  if (result.difference > 0) {
    return {
      color: 'oklch(55% 0.18 250)',
      bg: 'oklch(55% 0.18 250 / 0.08)',
      border: 'oklch(55% 0.18 250 / 0.35)',
      icon: 'savings',
    };
  }
  return {
    color: 'oklch(65% 0.18 30)',
    bg: 'oklch(65% 0.18 30 / 0.08)',
    border: 'oklch(65% 0.18 30 / 0.35)',
    icon: 'warning',
  };
}

export function TaxWithholdingSummary({ result }: Props) {
  const style = result ? verdictStyle(result) : null;

  return (
    <div
      className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full"
      style={{ border: `1px solid ${style ? style.border : 'oklch(25% 0.02 260)'}` }}
    >
      {/* Header */}
      <div
        className="px-lg py-sm flex items-center justify-between"
        style={{
          background: style ? style.bg : 'transparent',
          borderBottom: '1px solid oklch(25% 0.02 260)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: style ? style.color : 'oklch(55% 0.01 260)' }}
          >
            {result ? style!.icon : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">WITHHOLDING CHECK</span>
        </div>
      </div>

      {result ? (
        <>
          {/* Verdict hero */}
          <div
            className="flex flex-col items-center justify-center gap-2 px-lg pt-lg pb-md text-center"
            style={{ background: style!.bg }}
          >
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Result</p>
            <p className="text-body-lg font-semibold leading-snug text-center px-sm" style={{ color: style!.color }}>
              {result.verdict}
            </p>
            {result.quarterlyEstimatedPayment !== null && (
              <div className="rounded-lg border px-md py-sm mt-1" style={{ background: style!.bg, borderColor: style!.border }}>
                <p className="text-label-sm text-on-surface-variant">Suggested quarterly estimated payment</p>
                <p className="text-headline-md font-bold font-mono-data tabular-nums mt-0.5" style={{ color: style!.color }}>
                  {cur.format(result.quarterlyEstimatedPayment)}
                </p>
                <p className="text-label-sm text-on-surface-variant mt-0.5">due Apr 15 · Jun 15 · Sep 15 · Jan 15</p>
              </div>
            )}
          </div>

          {/* Tax vs. Withholding pair */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Tax owed</p>
                <InfoTooltip text="Estimated federal income tax based on 2025 brackets applied to your taxable income after standard deduction." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(result.estimatedTaxOwed)}
              </p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Withheld</p>
                <InfoTooltip text="The federal income tax you expect your employer to withhold for the full year, based on your current W-4 settings." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(result.currentWithholding)}
              </p>
            </div>
          </div>

          {/* Income breakdown */}
          <div className="border-t border-border-subtle px-lg py-sm flex flex-col gap-2">
            <p className="text-label-sm text-on-surface-variant mb-0.5 font-medium">Income breakdown</p>
            {[
              { label: 'Adjusted gross income', value: cur.format(result.adjustedGrossIncome), tooltip: 'Total income minus pre-tax deductions like 401(k) and HSA contributions.' },
              { label: 'Standard deduction', value: `− ${cur.format(result.standardDeduction)}`, tooltip: 'The flat deduction the IRS allows based on your filing status. You deduct this from your AGI to get taxable income.' },
              { label: 'Taxable income', value: cur.format(result.taxableIncome), tooltip: 'AGI minus your standard deduction. This is the amount your tax brackets are applied to.' },
            ].map(({ label, value, tooltip }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-label-sm text-on-surface-variant">{label}</span>
                  <InfoTooltip text={tooltip} />
                </div>
                <span className="font-mono-data text-body-sm tabular-nums text-on-surface font-semibold">{value}</span>
              </div>
            ))}
          </div>

          {/* Effective + marginal rates */}
          <div className="border-t border-border-subtle px-lg py-sm flex flex-col gap-2">
            <p className="text-label-sm text-on-surface-variant mb-0.5 font-medium">Tax rates</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-label-sm text-on-surface-variant">Effective tax rate</span>
                <InfoTooltip text="Total tax owed divided by adjusted gross income. This is your real average rate, lower than your marginal rate." />
              </div>
              <span className="font-mono-data text-body-sm tabular-nums text-on-surface font-semibold">{pct(result.effectiveTaxRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-label-sm text-on-surface-variant">Marginal rate</span>
                <InfoTooltip text="The tax rate applied to your last dollar of income. Only income in this bracket is taxed at this rate; lower income is taxed at lower rates." />
              </div>
              <span className="font-mono-data text-body-sm tabular-nums text-on-surface font-semibold">{pct(result.marginalRate)}</span>
            </div>
          </div>

          {/* Bracket breakdown */}
          {result.bracketBreakdown.length > 0 && (
            <div className="border-t border-border-subtle px-lg py-sm flex flex-col gap-1.5">
              <p className="text-label-sm text-on-surface-variant mb-0.5 font-medium">By bracket</p>
              {result.bracketBreakdown.map(({ rate, taxableInBracket, taxInBracket }) => (
                <div key={rate} className="flex items-center justify-between gap-2">
                  <span className="text-label-sm text-on-surface-variant">{pct(rate)} bracket</span>
                  <span className="font-mono-data text-label-sm tabular-nums text-on-surface-variant">
                    {cur.format(taxableInBracket)} × {pct(rate)} = {cur.format(taxInBracket)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div
            className="mx-lg mb-lg mt-2 rounded-lg px-md py-sm flex items-start gap-2"
            style={{ background: 'oklch(75% 0.12 60 / 0.06)', border: '1px solid oklch(70% 0.12 60 / 0.20)' }}
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px', color: 'oklch(60% 0.12 60)', marginTop: '1px' }}>info</span>
            <p className="text-label-sm text-on-surface-variant leading-relaxed">
              Estimate only. Does not account for credits, AMT, or state taxes.{' '}
              <a
                href="https://www.irs.gov/individuals/tax-withholding-estimator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                IRS withholding estimator
              </a>{' '}
              for exact figures.
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>receipt_long</span>
          <p className="text-body-sm text-on-surface-variant">Enter your income and withholding to see your estimated tax picture.</p>
        </div>
      )}
    </div>
  );
}
