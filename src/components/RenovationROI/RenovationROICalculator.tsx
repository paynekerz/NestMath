import { useState, useMemo } from 'react';
import {
  DEFAULT_RENOVATION_ROI_INPUTS,
  calcRenovationROI,
  type RenovationROIInputs,
} from '../../lib/renovation-roi';
import { validateRenovationROIInputs, hasErrors } from '../../lib/validation';
import { RenovationROIInputs as RenovationROIInputsPanel } from './RenovationROIInputs';
import { RenovationROISummary } from './RenovationROISummary';
import { RenovationROIChart } from './RenovationROIChart';
import { RenovationROITable } from './RenovationROITable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: RenovationROIInputs, result: ReturnType<typeof calcRenovationROI>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Renovation ROI vs. Investing Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Renovation cost', cur.format(inputs.renovationCost));
  row('Current home value', cur.format(inputs.homeValue));
  row('Expected value increase', `${(inputs.valueIncreasePct * 100).toFixed(2)}%`);
  row('Years until planned sale', String(inputs.yearsUntilSale));
  row('Annual home appreciation', `${(inputs.annualAppreciation * 100).toFixed(2)}%`);
  row('Annual investment return', `${(inputs.annualInvestReturn * 100).toFixed(2)}%`);
  row('', '');
  row('--- Summary ---', '');
  row('Renovation ROI %', `${result.renoROIPct.toFixed(1)}%`);
  row('Renovation net gain', result.renoNetGain >= 0 ? `+${cur.format(result.renoNetGain)}` : cur.format(result.renoNetGain));
  row('Investment net gain', `+${cur.format(result.investNetGain)}`);
  row('Winner', result.renoWins ? 'Renovation' : 'Invest');
  row('Winner advantage', `+${cur.format(result.delta)}`);

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Home Value (w/ Reno)', 'Renovation Gain', 'Reno Net Gain', 'Investment Value', 'Invest Net Gain', 'Delta');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.homeValueWithReno),
        cur.format(y.renovationGain),
        y.renovationNetGain >= 0 ? `+${cur.format(y.renovationNetGain)}` : cur.format(y.renovationNetGain),
        cur.format(y.investmentValue),
        `+${cur.format(y.investmentNetGain)}`,
        y.delta >= 0 ? `+${cur.format(y.delta)}` : cur.format(y.delta),
      );
    }
  }

  return rows.join('\n');
}

export function RenovationROICalculator() {
  const [inputs, setInputs] = useState<RenovationROIInputs>(DEFAULT_RENOVATION_ROI_INPUTS);

  function handleChange(key: keyof RenovationROIInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateRenovationROIInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRenovationROI(inputs)),
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
    a.download = `renovation-roi-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Renovation ROI vs. Investing Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your renovation cost, the expected value increase to your home, and your planned years until sale to see whether the renovation outperforms putting that same cash in the market, with a year-by-year comparison of both paths.</p>
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
        data-print-title="Renovation ROI vs. Investing Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <RenovationROIInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <RenovationROISummary result={result} yearsUntilSale={inputs.yearsUntilSale} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <RenovationROIChart result={result} yearsUntilSale={inputs.yearsUntilSale} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you make your renovation decision,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RenovationROITable result={result} />
        </div>
      )}

    </div>
  );
}
