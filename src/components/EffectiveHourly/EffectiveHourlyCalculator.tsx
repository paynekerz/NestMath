import { useState, useMemo } from 'react';
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
import { FAQSection, type FAQItem } from '../ui/FAQSection';

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

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How do I calculate my effective hourly rate?',
    a: "Your effective hourly rate is your adjusted take-home pay divided by your total real hours worked. To get adjusted take-home: subtract all taxes (federal, state, FICA at 7.65%) and annual work-related expenses from your gross salary. To get total real hours: add contracted hours + unpaid overtime + commute time + prep/decompression time. The result is often 30–50% lower than your stated salary would suggest.",
  },
  {
    q: 'What is my real hourly rate after taxes and commute?',
    a: "Most people are surprised. A $75,000 salary sounds like about $36/hr, but after 22% federal tax, 5% state tax, and 7.65% FICA, you're taking home around $49,000. Subtract $2,400/year in work expenses and divide by 53 real hours per week (40 + 5 unpaid overtime + 5 commute + 3 prep), and you're looking at around $18–20/hr — roughly half the stated rate.",
  },
  {
    q: 'How much does commuting cost in time per year?',
    a: "A 1-hour daily round-trip commute (conservative) equals 5 hours per week × 50 weeks = 250 unpaid hours per year. At an effective rate of $20/hr, that's $5,000 worth of your time annually. This doesn't include out-of-pocket costs like gas, tolls, transit passes, or car maintenance — those belong in your monthly work expenses.",
  },
  {
    q: 'Is my salary worth it after commute and expenses?',
    a: "That depends on your effective hourly rate vs. your alternatives. The calculator surfaces the real number so you can compare: a remote job paying $65,000 with no commute, no work wardrobe, and no daily lunch costs might have a higher effective rate than a $75,000 in-office job. Compare the effective rates, not the stated salaries.",
  },
  {
    q: 'How do I compare two job offers on a true hourly basis?',
    a: "Run each offer through the calculator separately with its own tax situation, commute hours, and work expenses. Compare the effective hourly rates. A job with a higher salary but longer commute, fewer remote days, or mandatory professional dues may actually pay less per real hour than a lower-paying offer. The delta stat shows exactly how much ground the higher salary needs to make up.",
  },
];

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
          <p className="text-body-md text-on-surface-variant mt-1">What are you actually making per hour after taxes, commute, and all the hours your job really takes?</p>
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

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this changed how you think about your job,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
