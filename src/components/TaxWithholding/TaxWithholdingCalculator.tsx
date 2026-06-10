import { useState, useMemo } from 'react';
import {
  DEFAULT_TAX_WITHHOLDING_INPUTS,
  calcTaxWithholding,
  type TaxWithholdingInputs,
  type FilingStatus,
} from '../../lib/tax-withholding';
import { validateTaxWithholdingInputs, hasErrors } from '../../lib/validation';
import { TaxWithholdingInputs as TaxWithholdingInputsPanel } from './TaxWithholdingInputs';
import { TaxWithholdingSummary } from './TaxWithholdingSummary';
import { TaxWithholdingChart } from './TaxWithholdingChart';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const FILING_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  mfj: 'Married Filing Jointly',
  hoh: 'Head of Household',
};

function buildCsv(inputs: TaxWithholdingInputs, result: ReturnType<typeof calcTaxWithholding>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Tax Withholding Estimator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Filing status', FILING_LABELS[inputs.filingStatus]);
  row('Gross annual W-2 income', cur.format(inputs.grossW2Income));
  row('Other annual income', cur.format(inputs.otherIncome));
  row('Pre-tax deductions', cur.format(inputs.preTaxDeductions));
  row('Current annual withholding', cur.format(inputs.currentWithholding));
  row('', '');
  row('--- Results ---', '');
  row('Standard deduction', cur.format(result.standardDeduction));
  row('Adjusted gross income', cur.format(result.adjustedGrossIncome));
  row('Taxable income', cur.format(result.taxableIncome));
  row('Estimated federal tax owed', cur.format(result.estimatedTaxOwed));
  row('Current withholding', cur.format(result.currentWithholding));
  row('Difference (+ = refund, - = owed)', cur.format(result.difference));
  row('Effective tax rate', pct(result.effectiveTaxRate));
  row('Marginal rate', pct(result.marginalRate));
  if (result.quarterlyEstimatedPayment !== null) {
    row('Quarterly estimated payment', cur.format(result.quarterlyEstimatedPayment));
  }
  row('Verdict', result.verdict);
  row('', '');
  row('--- Bracket Breakdown ---', '');
  row('Rate', 'Income in Bracket', 'Tax in Bracket');
  for (const b of result.bracketBreakdown) {
    row(pct(b.rate), cur.format(b.taxableInBracket), cur.format(b.taxInBracket));
  }

  return rows.join('\n');
}

export function TaxWithholdingCalculator() {
  const [inputs, setInputs] = useState<TaxWithholdingInputs>(DEFAULT_TAX_WITHHOLDING_INPUTS);

  function handleChange(key: keyof TaxWithholdingInputs, value: string | number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateTaxWithholdingInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcTaxWithholding(inputs)),
    [inputs, errors],
  );

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-withholding-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Tax Withholding Estimator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your annual income, filing status, and year-to-date withholding to see your estimated 2025 federal tax bill, including whether you'll get a refund, owe at filing, or need to make quarterly estimated payments.</p>
        </div>
        <div data-print="hide" className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCsv}
            disabled={!result}
            className="flex items-center gap-1.5 px-md py-xs rounded-lg border border-border-subtle text-label-md text-on-surface-variant hover:border-primary-accent hover:text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-md py-xs rounded-lg border border-border-subtle text-label-md text-on-surface-variant hover:border-primary-accent hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Main bento grid */}
      <div
        data-print="title"
        data-print-title="Tax Withholding Estimator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <TaxWithholdingInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <TaxWithholdingSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <TaxWithholdingChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you sort out your withholding,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

    </div>
  );
}
