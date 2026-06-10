import { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_EFFECTIVE_HOURLY_INPUTS,
  calcEffectiveHourly,
  type EffectiveHourlyInputs,
} from '../../lib/effective-hourly';
import { validateEffectiveHourlyInputs, hasErrors } from '../../lib/validation';
import { EffectiveHourlyInputs as EffectiveHourlyInputsPanel } from './EffectiveHourlyInputs';
import { EffectiveHourlySummary } from './EffectiveHourlySummary';
import { EffectiveHourlyBar } from './EffectiveHourlyBar';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const curH = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildCsv(inputs: EffectiveHourlyInputs, result: ReturnType<typeof calcEffectiveHourly>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Effective Hourly Rate Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Annual gross salary', cur.format(inputs.annualGrossSalary));
  row('Federal tax rate', `${(inputs.federalTaxRate * 100).toFixed(1)}%`);
  row('State tax rate', `${(inputs.stateTaxRate * 100).toFixed(1)}%`);
  row('FICA rate (fixed)', '7.65%');
  row('Weekly hours worked', String(inputs.weeklyHoursWorked));
  row('Weekly unpaid overtime', String(inputs.weeklyUnpaidOvertime));
  row('Weekly commute hours', String(inputs.weeklyCommuteHours));
  row('Weekly prep & decompression', String(inputs.weeklyPrepDecompression));
  row('Monthly work expenses', cur.format(inputs.monthlyWorkExpenses));
  row('Weeks worked per year', String(inputs.weeksWorkedPerYear));
  row('', '');
  row('--- Results ---', '');
  row('Annual take-home (after tax)', cur.format(result.annualTakeHome));
  row('Annual work expenses', cur.format(result.annualWorkExpenses));
  row('Adjusted take-home', cur.format(result.adjustedTakeHome));
  row('Stated hourly (gross)', `${curH.format(result.statedHourlyGross)}/hr`);
  row('Effective hourly (net)', `${curH.format(result.effectiveHourlyNet)}/hr`);
  row('Hidden hours per week', String(result.hiddenHoursPerWeek));
  row('Total real hours per week', String(result.totalRealHoursPerWeek));
  row('Annual hidden hours', String(result.annualHiddenHours));
  row('Delta (stated − effective)', `${curH.format(result.delta)}/hr`);

  return rows.join('\n');
}

export function EffectiveHourlyCalculator() {
  const [inputs, setInputs] = useState<EffectiveHourlyInputs>(DEFAULT_EFFECTIVE_HOURLY_INPUTS);

  function handleChange(key: keyof EffectiveHourlyInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateEffectiveHourlyInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcEffectiveHourly(inputs)),
    [inputs, errors],
  );

  useEffect(() => {
    if (!result) return;
    try {
      localStorage.setItem('nm_income', JSON.stringify({
        effectiveHourlyRate: result.effectiveHourlyNet,
        annualTakeHome: result.adjustedTakeHome,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage may be unavailable
    }
  }, [result]);

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `effective-hourly-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Effective Hourly Rate Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your salary, tax rates, real hours worked per week, and work-related expenses to find your true effective hourly rate, and see exactly how much the commute, unpaid overtime, and job expenses reduce what you actually earn per hour of your life.</p>
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
        data-print-title="Effective Hourly Rate Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <EffectiveHourlyInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <EffectiveHourlySummary result={result} />
        </div>

        {/* Bar comparison — full width */}
        {result && (
          <div className="lg:col-span-12">
            <EffectiveHourlyBar result={result} />
          </div>
        )}
      </div>

      {result && <KofiButton message="If this changed how you think about your job," />}

    </div>
  );
}
