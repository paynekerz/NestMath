import { useState, useMemo } from 'react';
import {
  DEFAULT_INVESTMENT_FEES_INPUTS,
  calcInvestmentFees,
  type InvestmentFeesInputs,
} from '../../lib/investment-fees';
import { validateInvestmentFeesInputs, hasErrors } from '../../lib/validation';
import { InvestmentFeesInputs as InvestmentFeesInputsPanel } from './InvestmentFeesInputs';
import { InvestmentFeesSummary } from './InvestmentFeesSummary';
import { InvestmentFeesChart } from './InvestmentFeesChart';
import { InvestmentFeesTable } from './InvestmentFeesTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: InvestmentFeesInputs, result: ReturnType<typeof calcInvestmentFees>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Investment Fee Impact Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Initial investment', cur.format(inputs.initialInvestment));
  row('Monthly contribution', cur.format(inputs.monthlyContribution));
  row('Annual gross return', `${(inputs.annualGrossReturn * 100).toFixed(1)}%`);
  row('Current expense ratio', `${(inputs.currentExpenseRatio * 100).toFixed(3)}%`);
  row('Low-cost expense ratio', `${(inputs.lowCostExpenseRatio * 100).toFixed(3)}%`);
  row('Years to model', String(inputs.yearsToModel));
  row('', '');
  row('--- Summary ---', '');
  row('Portfolio value (current fees)', cur.format(result.portfolioCurrentFees));
  row('Portfolio value (low-cost)', cur.format(result.portfolioLowCost));
  row('Fee drag ($)', cur.format(result.feeDragDollar));
  row('Fee drag (%)', `${result.feeDragPct.toFixed(2)}%`);
  row('Total contributions', cur.format(result.totalContributions));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Portfolio (Current Fees)', 'Portfolio (Low-Cost)', 'Annual Fee Drag', 'Cumulative Fee Drag');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.portfolioCurrentFees),
        cur.format(y.portfolioLowCost),
        cur.format(y.annualFeeDrag),
        cur.format(y.cumulativeFeeDrag),
      );
    }
  }

  return rows.join('\n');
}

export function InvestmentFeesCalculator() {
  const [inputs, setInputs] = useState<InvestmentFeesInputs>(DEFAULT_INVESTMENT_FEES_INPUTS);

  function handleChange(key: keyof InvestmentFeesInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateInvestmentFeesInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcInvestmentFees(inputs)),
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
    a.download = `investment-fees-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Investment Fee Impact Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your portfolio balance, monthly contributions, gross return rate, and two expense ratios to see the dollar cost of fees over time, including total fee drag and the portfolio value you're giving up to higher costs.</p>
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
        data-print-title="Investment Fee Impact Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <InvestmentFeesInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <InvestmentFeesSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <InvestmentFeesChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you rethink your fund fees,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <InvestmentFeesTable result={result} />
        </div>
      )}

    </div>
  );
}
