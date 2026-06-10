import { useState, useMemo } from 'react';
import {
  DEFAULT_HYSA_INPUTS,
  calcHYSA,
  type HYSAInputs,
} from '../../lib/hysa';
import { validateHYSAInputs, hasErrors } from '../../lib/validation';
import { HYSAInputs as HYSAInputsPanel } from './HYSAInputs';
import { HYSASummary } from './HYSASummary';
import { HYSAChart } from './HYSAChart';
import { HYSATable } from './HYSATable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: HYSAInputs, result: ReturnType<typeof calcHYSA>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('HYSA Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Initial deposit', cur.format(inputs.initialDeposit));
  row('Monthly contribution', cur.format(inputs.monthlyContribution));
  row('HYSA APY', `${(inputs.hysaAPY * 100).toFixed(2)}%`);
  row('Traditional savings APY', `${(inputs.traditionalAPY * 100).toFixed(2)}%`);
  row('Years to model', String(inputs.yearsToModel));
  row('', '');
  row('--- Summary ---', '');
  row('Final balance (HYSA)', cur.format(result.finalBalanceHYSA));
  row('Final balance (traditional)', cur.format(result.finalBalanceTraditional));
  row('Total contributions', cur.format(result.totalContributions));
  row('Interest earned (HYSA)', cur.format(result.interestEarnedHYSA));
  row('Interest earned (traditional)', cur.format(result.interestEarnedTraditional));
  row('Extra earned vs. traditional', cur.format(result.extraEarned));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Balance (HYSA)', 'Balance (Traditional)', 'Interest (HYSA)', 'Interest (Traditional)', 'Delta');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.balanceHYSA),
        cur.format(y.balanceTraditional),
        cur.format(y.interestHYSA),
        cur.format(y.interestTraditional),
        cur.format(y.delta),
      );
    }
  }

  return rows.join('\n');
}

export function HYSACalculator() {
  const [inputs, setInputs] = useState<HYSAInputs>(DEFAULT_HYSA_INPUTS);

  function handleChange(key: keyof HYSAInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateHYSAInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcHYSA(inputs)),
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
    a.download = `hysa-calculator-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">High-Yield Savings Account Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Compare how much your savings grow in a high-yield savings account versus a traditional bank account. Enter your deposit, monthly contributions, and APY to see the balance difference and extra interest earned over time.</p>
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
        data-print-title="High-Yield Savings Account Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <HYSAInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <HYSASummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <HYSAChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you find a better place for your savings,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <HYSATable result={result} />
        </div>
      )}

    </div>
  );
}
