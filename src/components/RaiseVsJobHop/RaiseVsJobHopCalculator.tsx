import { useState, useMemo } from 'react';
import {
  DEFAULT_RAISE_VS_JOB_HOP_INPUTS,
  calcRaiseVsJobHop,
  type RaiseVsJobHopInputs,
} from '../../lib/raise-vs-job-hop';
import { validateRaiseVsJobHopInputs, hasErrors } from '../../lib/validation';
import { RaiseVsJobHopInputs as RaiseVsJobHopInputsPanel } from './RaiseVsJobHopInputs';
import { RaiseVsJobHopSummary } from './RaiseVsJobHopSummary';
import { RaiseVsJobHopChart } from './RaiseVsJobHopChart';
import { RaiseVsJobHopTable } from './RaiseVsJobHopTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: RaiseVsJobHopInputs, result: ReturnType<typeof calcRaiseVsJobHop>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Raise vs. Job Hop Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Current annual salary', cur.format(inputs.currentSalary));
  row('Expected annual raise (stay)', `${(inputs.stayRaise * 100).toFixed(2)}%`);
  row('New job offer salary', cur.format(inputs.hopSalary));
  row('Expected annual raise (hop)', `${(inputs.hopRaise * 100).toFixed(2)}%`);
  row('Years to model', String(inputs.yearsToModel));
  row('', '');
  row('--- Summary ---', '');
  row('Break-even year', result.breakEvenYear !== null ? `Year ${result.breakEvenYear}` : 'Never (stay wins)');
  row('Lifetime delta', result.lifetimeDelta >= 0 ? `+${cur.format(result.lifetimeDelta)} (hop)` : `${cur.format(Math.abs(result.lifetimeDelta))} (stay)`);
  row('Winner', result.hopWins ? 'Job Hop' : 'Stay');

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Salary (Stay)', 'Salary (Hop)', 'Cumulative (Stay)', 'Cumulative (Hop)', 'Delta');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.salaryStay),
        cur.format(y.salaryHop),
        cur.format(y.cumulativeStay),
        cur.format(y.cumulativeHop),
        y.delta >= 0 ? `+${cur.format(y.delta)}` : cur.format(y.delta),
      );
    }
  }

  return rows.join('\n');
}

export function RaiseVsJobHopCalculator() {
  const [inputs, setInputs] = useState<RaiseVsJobHopInputs>(DEFAULT_RAISE_VS_JOB_HOP_INPUTS);

  function handleChange(key: keyof RaiseVsJobHopInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateRaiseVsJobHopInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRaiseVsJobHop(inputs)),
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
    a.download = `raise-vs-job-hop-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Raise vs. Job Hop Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your current salary with expected raise rate and a competing offer with its own raise trajectory. See the cumulative earnings for both paths over time, the year the job hop pays off, and which option puts more money in your pocket over your career.</p>
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
        data-print-title="Raise vs. Job Hop Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <RaiseVsJobHopInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <RaiseVsJobHopSummary result={result} yearsToModel={inputs.yearsToModel} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <RaiseVsJobHopChart result={result} yearsToModel={inputs.yearsToModel} />
          </div>
        )}
      </div>

      {result && <KofiButton message="If this helped you make your career decision," />}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RaiseVsJobHopTable result={result} />
        </div>
      )}

    </div>
  );
}
