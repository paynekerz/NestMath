import { useState, useMemo } from 'react';
import {
  DEFAULT_REFINANCE_INPUTS,
  calcRefinance,
  type RefinanceInputs,
} from '../../lib/calculator';
import { validateRefinanceInputs, hasErrors } from '../../lib/validation';
import { RefinanceInputs as RefinanceInputsPanel } from './RefinanceInputs';
import { RefinanceSummary } from './RefinanceSummary';
import { RefinanceChart } from './RefinanceChart';
import { RefinanceTable } from './RefinanceTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: RefinanceInputs, result: ReturnType<typeof calcRefinance>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  const closingCostsLabel = inputs.usesFlatClosingCost
    ? 'Closing costs (flat)'
    : `Closing costs (${(inputs.closingCostsPct * 100).toFixed(2)}% of balance)`;

  row('Refinance Break-Even Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Current loan balance', cur.format(inputs.currentBalance));
  row('Current interest rate', `${(inputs.currentRate * 100).toFixed(3)}%`);
  row('Remaining term', `${inputs.remainingTermYears} years`);
  row('New interest rate', `${(inputs.newRate * 100).toFixed(3)}%`);
  row('New loan term', `${inputs.newTermYears} years`);
  row(closingCostsLabel, cur.format(result.closingCostsDollar));
  row('', '');
  row('--- Summary ---', '');
  row('Current monthly payment', cur.format(result.currentMonthlyPayment));
  row('New monthly payment', cur.format(result.newMonthlyPayment));
  row('Monthly savings', cur.format(result.monthlySavings));
  row('Closing costs', cur.format(result.closingCostsDollar));
  row('Break-even', result.breakEvenMonths !== null ? `${result.breakEvenMonths} months` : 'N/A');
  row('Worth it?', result.worthIt ? 'Yes' : 'No');
  row('Total interest (current path)', cur.format(result.totalInterestCurrent));
  row('Total interest (refinanced)', cur.format(result.totalInterestRefinanced));
  row('Net savings', cur.format(result.netSavings));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Balance (current)', 'Balance (refinanced)', 'Cum. interest (current)', 'Cum. interest (refinanced)', 'Cumulative savings');
    for (const y of result.years) {
      row(
        String(y.year),
        y.balanceCurrent === 0 ? '—' : cur.format(y.balanceCurrent),
        y.balanceRefinanced === 0 ? '—' : cur.format(y.balanceRefinanced),
        cur.format(y.cumulativeInterestCurrent),
        cur.format(y.cumulativeInterestRefinanced),
        cur.format(y.cumulativeSavings),
      );
    }
  }

  return rows.join('\n');
}

export function RefinanceCalculator() {
  const [inputs, setInputs] = useState<RefinanceInputs>(DEFAULT_REFINANCE_INPUTS);
  function handleChange(key: keyof RefinanceInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function handleToggleCostMode() {
    setInputs(prev => {
      const switching = !prev.usesFlatClosingCost;
      if (switching) {
        return {
          ...prev,
          usesFlatClosingCost: true,
          closingCostsDollar: Math.round(prev.currentBalance * prev.closingCostsPct),
        };
      } else {
        return {
          ...prev,
          usesFlatClosingCost: false,
          closingCostsPct: prev.currentBalance > 0
            ? parseFloat((prev.closingCostsDollar / prev.currentBalance).toFixed(4))
            : prev.closingCostsPct,
        };
      }
    });
  }

  const errors = useMemo(() => validateRefinanceInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRefinance(inputs)),
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
    a.download = `refinance-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Refinance Break-Even Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Find out whether refinancing your mortgage makes financial sense. Enter your current loan, the new rate and term, and estimated closing costs to see your break-even month, monthly savings, and total interest difference over the life of the loan.</p>
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
        data-print-title="Refinance Break-Even Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <RefinanceInputsPanel
            inputs={inputs}
            onChange={handleChange}
            onToggleCostMode={handleToggleCostMode}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <RefinanceSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <RefinanceChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you decide on your refinance,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RefinanceTable result={result} />
        </div>
      )}

    </div>
  );
}
