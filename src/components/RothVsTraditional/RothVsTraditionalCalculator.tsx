import { useState, useMemo } from 'react';
import {
  DEFAULT_ROTH_VS_TRADITIONAL_INPUTS,
  calcRothVsTraditional,
  type RothVsTraditionalInputs,
} from '../../lib/roth-vs-traditional';
import { validateRothVsTraditionalInputs, hasErrors } from '../../lib/validation';
import { RothVsTraditionalInputs as RothVsTraditionalInputsPanel } from './RothVsTraditionalInputs';
import { RothVsTraditionalSummary } from './RothVsTraditionalSummary';
import { RothVsTraditionalChart } from './RothVsTraditionalChart';
import { RothVsTraditionalTable } from './RothVsTraditionalTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: RothVsTraditionalInputs, result: ReturnType<typeof calcRothVsTraditional>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Roth vs. Traditional IRA Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Annual contribution', cur.format(inputs.annualContribution));
  row('Years to retirement', String(inputs.yearsToRetirement));
  row('Current marginal tax rate', `${(inputs.currentTaxRate * 100).toFixed(1)}%`);
  row('Expected retirement tax rate', `${(inputs.retirementTaxRate * 100).toFixed(1)}%`);
  row('Expected annual return', `${(inputs.expectedAnnualReturn * 100).toFixed(1)}%`);
  row('', '');
  row('--- Summary ---', '');
  row('Roth after-tax value', cur.format(result.rothFinalBalance));
  row('Traditional gross balance', cur.format(result.tradFinalGrossBalance));
  row('Traditional after-tax value', cur.format(result.tradFinalAfterTaxValue));
  row('Winner', result.winner === 'roth' ? 'Roth IRA' : 'Traditional IRA');
  row('Net advantage', cur.format(result.netAdvantage));
  row('Tax savings now (annual)', cur.format(result.taxSavingsNowAnnual));
  row('Tax savings now (total career)', cur.format(result.taxSavingsNowTotal));
  row('Tax owed at retirement (Traditional)', cur.format(result.taxOwedAtRetirement));
  row('', '');
  row('Year', 'Roth Balance', 'Traditional Gross Balance', 'Traditional After-Tax Value', 'Delta (Roth - Trad After-Tax)');
  for (const y of result.years) {
    row(
      String(y.year),
      cur.format(y.rothBalance),
      cur.format(y.tradGrossBalance),
      cur.format(y.tradAfterTaxValue),
      (y.delta >= 0 ? '+' : '') + cur.format(y.delta),
    );
  }

  return rows.join('\n');
}

export function RothVsTraditionalCalculator() {
  const [inputs, setInputs] = useState<RothVsTraditionalInputs>(DEFAULT_ROTH_VS_TRADITIONAL_INPUTS);

  function handleChange(key: keyof RothVsTraditionalInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateRothVsTraditionalInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRothVsTraditional(inputs)),
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
    a.download = `roth-vs-traditional-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Roth vs. Traditional IRA</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your contribution amount, years to retirement, and tax rates to see which IRA account type produces more after-tax wealth, and by how much. The answer depends entirely on whether your tax rate is higher now or in retirement.</p>
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
        data-print-title="Roth vs. Traditional IRA Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panel — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <RothVsTraditionalInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <RothVsTraditionalSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <RothVsTraditionalChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you think through your IRA strategy,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RothVsTraditionalTable result={result} />
        </div>
      )}

    </div>
  );
}
