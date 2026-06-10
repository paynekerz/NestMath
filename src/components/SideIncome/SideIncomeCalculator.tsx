import { useState, useMemo } from 'react';
import {
  DEFAULT_SIDE_INCOME_INPUTS,
  calcSideIncome,
  type SideIncomeInputs,
  type FilingStatus,
} from '../../lib/side-income';
import { validateSideIncomeInputs, hasErrors } from '../../lib/validation';
import { SideIncomeInputs as SideIncomeInputsPanel } from './SideIncomeInputs';
import { SideIncomeSummary } from './SideIncomeSummary';
import { SideIncomeChart } from './SideIncomeChart';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const FILING_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  mfj:    'Married Filing Jointly',
  hoh:    'Head of Household',
};

function buildCsv(inputs: SideIncomeInputs, result: ReturnType<typeof calcSideIncome>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Side Income After-Tax Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Gross annual side income', cur.format(inputs.grossSideIncome));
  row('Deductible business expenses', cur.format(inputs.businessExpenses));
  row('Primary W-2 annual income', cur.format(inputs.primaryW2Income));
  row('Filing status', FILING_LABELS[inputs.filingStatus]);
  row('', '');
  row('--- Results ---', '');
  row('Net self-employment income', cur.format(result.netSEIncome));
  row('SE tax base (net × 92.35%)', cur.format(result.seTaxBase));
  row('Self-employment tax', cur.format(result.selfEmploymentTax));
  row('SE tax deduction (÷ 2)', cur.format(result.seTaxDeduction));
  row('Taxable SE income', cur.format(result.taxableSEIncome));
  row('Federal income tax on side income', cur.format(result.incomeTaxOnSideIncome));
  row('Total tax on side income', cur.format(result.totalTaxOnSideIncome));
  row('True take-home', cur.format(Math.max(0, result.trueTakeHome)));
  row('Effective tax rate on side income', pct(result.effectiveTaxRate));
  if (result.quarterlyEstimatedPayment !== null) {
    row('Suggested quarterly estimated payment', cur.format(result.quarterlyEstimatedPayment));
    row('Quarterly due dates', 'Apr 15 · Jun 15 · Sep 15 · Jan 15');
  }

  return rows.join('\n');
}

export function SideIncomeCalculator() {
  const [inputs, setInputs] = useState<SideIncomeInputs>(DEFAULT_SIDE_INCOME_INPUTS);

  function handleChange(key: keyof SideIncomeInputs, value: number | FilingStatus) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateSideIncomeInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcSideIncome(inputs)),
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
    a.download = `side-income-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Side Income After-Tax Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your gross side income, deductible business expenses, and your W-2 salary to see your true after-tax take-home from freelance or gig work, including self-employment tax, marginal income tax, and quarterly payment amounts.</p>
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
        data-print-title="Side Income After-Tax Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels */}
        <div className="lg:col-span-8 h-full">
          <SideIncomeInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-4">
          <SideIncomeSummary result={result} />
        </div>

        {/* Chart — full width, gated on result */}
        {result && (
          <div className="lg:col-span-12">
            <SideIncomeChart result={result} />
          </div>
        )}
      </div>

      {result && <KofiButton message="If this helped you understand your side income taxes," />}

    </div>
  );
}
