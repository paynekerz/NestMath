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
import { FAQSection, type FAQItem } from '../ui/FAQSection';

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

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'Is it better to get a raise or switch jobs?',
    a: "Switching jobs typically produces larger immediate salary gains — often 10–20% vs. 3–5% for an internal raise. But a higher starting salary at a new job with a lower raise rate can be overtaken by staying put over a decade. The key variable is how aggressively each path compounds. This calculator shows you the break-even year so you can weigh the financial tradeoff against non-financial factors like job satisfaction and stability.",
  },
  {
    q: 'How much of a raise is worth switching jobs for?',
    a: "There's no universal threshold, but a common rule of thumb is 15–20% — enough to meaningfully outpace what you'd earn by staying and accumulating raises. A 5% bump rarely justifies the switching costs and uncertainty. Run your actual numbers: if the new offer leads on cumulative earnings within 2–3 years, it's likely worth it. If break-even is 8+ years out, the raise rate advantage of staying may matter more.",
  },
  {
    q: 'Does job hopping increase salary?',
    a: "Historically, yes — workers who change jobs frequently earn 10–15% more on average than those who stay. But this comes with tradeoffs: lower raise rates at each new job, gaps in tenure, and potential loss of vesting. The cumulative picture depends heavily on how much the raise rate differs between paths. High raise rates at your current employer can outpace a big initial bump elsewhere over a 10-year horizon.",
  },
  {
    q: 'How do I calculate the financial impact of switching jobs?',
    a: "Model cumulative earnings across both paths: current salary growing at your expected raise rate vs. the new offer growing at its raise rate. Add each year's salary to a running total. The year the hop path's cumulative total exceeds the stay path's is your break-even year. After that point, every year adds more to the gap in the winner's favor. This calculator does that math for you.",
  },
  {
    q: 'When does staying at my current job pay off more than switching?',
    a: "Staying wins when: (1) your current raise rate is significantly higher than what the new employer offers, (2) you have unvested equity or bonuses that would be forfeited, or (3) the salary bump isn't large enough to overcome the compounding advantage of a higher raise rate. Staying often wins in the long run even when the hop salary is higher — if the hop raise rate is much lower.",
  },
];

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
          <p className="text-body-md text-on-surface-variant mt-1">Model cumulative earnings across both paths and find the year switching jobs pays off.</p>
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

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this helped you make your career decision,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RaiseVsJobHopTable result={result} />
        </div>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
