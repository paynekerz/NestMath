import { useState, useMemo, useRef } from 'react';
import {
  DEFAULT_SAVINGS_PLANNER_INPUTS,
  calcSavingsPlan,
  type SavingsPlannerInputs,
  type SavingsPlannerResult,
} from '../../lib/savings';
import { validateSavingsPlannerInputs, hasErrors } from '../../lib/validation';
import { SavingsPlannerInputs as SavingsPlannerInputsPanel } from './SavingsPlannerInputs';
import { SavingsPlannerSummary } from './SavingsPlannerSummary';
import { SavingsPlannerChart } from './SavingsPlannerChart';
import { SavingsPlannerTable } from './SavingsPlannerTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function projectedDateStr(months: number | null): string {
  if (months === null) return 'Not reached in 30 years';
  if (months === 0) return 'Now';
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildCsv(inputs: SavingsPlannerInputs, result: SavingsPlannerResult): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Down Payment Savings Plan', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Target home price', cur.format(inputs.targetHomePrice));
  row('Down payment', `${(inputs.downPaymentPct * 100).toFixed(1)}%`);
  row('Closing costs', `${(inputs.closingCostsPct * 100).toFixed(1)}%`);
  row('Current savings', cur.format(inputs.currentSavings));
  row('Monthly savings', cur.format(inputs.monthlySavings));
  row('Annual return on savings', `${(inputs.annualReturn * 100).toFixed(2)}%`);
  row('', '');
  row('--- Summary ---', '');
  row('Cash needed to close', cur.format(result.cashToClose));
  row('Down payment (dollar)', cur.format(result.downPayment));
  row('Closing costs (dollar)', cur.format(result.closingCosts));
  row('Months to goal', result.monthsToGoal !== null ? String(result.monthsToGoal) : 'Not reached in 30 years');
  row('Projected date', projectedDateStr(result.monthsToGoal));
  row('Total saved at goal', cur.format(result.totalSaved));
  row('Growth from returns', cur.format(result.growthFromReturns));

  if (result.months.length > 0) {
    row('', '');
    row('Month', 'Monthly Contribution', 'Return Earned', 'Cumulative Savings', 'Remaining to Goal');
    for (const m of result.months) {
      row(
        String(m.month),
        cur.format(m.contribution),
        cur.format(m.returnEarned),
        cur.format(m.cumulativeSavings),
        m.remainingToGoal === 0 ? 'Goal reached' : cur.format(m.remainingToGoal),
      );
    }
  }

  return rows.join('\n');
}

type MilestoneStatus = 'COMPLETED' | 'ON_TRACK' | 'PENDING';

interface Milestone {
  label: string;
  targetValue: number;
  date: string | null;
  status: MilestoneStatus;
}

function buildMilestones(result: SavingsPlannerResult, currentSavings: number): Milestone[] {
  const thresholds = [
    { label: '25% Saved', value: result.cashToClose * 0.25 },
    { label: '50% Saved', value: result.cashToClose * 0.5 },
    { label: 'Down Payment', value: result.downPayment },
    { label: 'Cash to Close', value: result.cashToClose },
  ];

  return thresholds.map(({ label, value }) => {
    if (currentSavings >= value) {
      return { label, targetValue: value, date: 'Now', status: 'COMPLETED' as const };
    }
    const reachMonth = result.months.find(m => m.cumulativeSavings >= value);
    if (reachMonth) {
      const d = new Date();
      d.setMonth(d.getMonth() + reachMonth.month);
      return {
        label,
        targetValue: value,
        date: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        status: 'ON_TRACK' as const,
      };
    }
    return { label, targetValue: value, date: null, status: 'PENDING' as const };
  });
}

function MilestoneStatusChip({ status }: { status: MilestoneStatus }) {
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-semibold bg-success-emerald/10 text-success-emerald">
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span>
        COMPLETED
      </span>
    );
  }
  if (status === 'ON_TRACK') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-semibold bg-primary/10 text-primary">
        ON TRACK
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm text-on-surface-variant bg-surface-container-highest">
      PENDING
    </span>
  );
}

export function SavingsPlannerCalculator() {
  const [inputs, setInputs] = useState<SavingsPlannerInputs>(DEFAULT_SAVINGS_PLANNER_INPUTS);
  const [tableOpen, setTableOpen] = useState(false);
  const inputsRef = useRef<HTMLDivElement>(null);

  function handleChange(key: keyof SavingsPlannerInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateSavingsPlannerInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcSavingsPlan(inputs)),
    [inputs, errors],
  );

  const bullCaseResult = useMemo(() => {
    if (hasErrors(errors)) return null;
    return calcSavingsPlan({ ...inputs, annualReturn: Math.min(inputs.annualReturn + 0.02, 0.30) });
  }, [inputs, errors]);

  const milestones = useMemo(
    () => result ? buildMilestones(result, inputs.currentSavings) : [],
    [result, inputs.currentSavings],
  );

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savings-plan-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function scrollToInputs() {
    inputsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Down Payment Savings Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your target home price, down payment percentage, current savings, and monthly contribution to find out exactly when you'll have enough cash to close, including a month-by-month savings chart showing your progress.</p>
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
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main bento grid */}
      <div
        data-print="title"
        data-print-title="Down Payment Savings Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Row 1: Chart (col 1-8) + Stats (col 9-12) */}
        {result ? (
          <>
            <div className="lg:col-span-8">
              <SavingsPlannerChart
                result={result}
                currentSavings={inputs.currentSavings}
                bullCaseMonths={bullCaseResult?.months}
              />
            </div>
            <div className="lg:col-span-4">
              <SavingsPlannerSummary result={result} currentSavings={inputs.currentSavings} />
            </div>

            {/* Row 2: Milestones (col 1-7) */}
            <div className="lg:col-span-7">
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                  <h3 className="text-label-md font-semibold text-on-surface">Goal Milestones</h3>
                  <div className="flex items-center gap-1" data-print="hide">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>filter_list</span>
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>more_horiz</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide border-b border-border-subtle">
                        <th className="px-4 py-2.5 font-semibold">Target Goal</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Value</th>
                        <th className="px-4 py-2.5 font-semibold">Date</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-sm">
                      {milestones.map(m => (
                        <tr key={m.label} className="zebra-row border-b border-border-subtle/30">
                          <td className="px-4 py-2.5 font-medium text-on-surface">{m.label}</td>
                          <td className="px-4 py-2.5 text-right font-mono-data text-on-surface tabular-nums">{cur.format(m.targetValue)}</td>
                          <td className="px-4 py-2.5 text-on-surface-variant">{m.date ?? '—'}</td>
                          <td className="px-4 py-2.5"><MilestoneStatusChip status={m.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-7 glass-panel p-8 rounded-xl flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>savings</span>
            <p className="text-body-sm text-on-surface-variant">Enter your savings details to see your path to homeownership.</p>
          </div>
        )}

        {/* Simulation Controls — col-span-5 when result exists, full-width otherwise */}
        <div
          ref={inputsRef}
          className={result ? 'lg:col-span-5' : 'lg:col-span-12'}
        >
          <SavingsPlannerInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
            onCalculate={scrollToInputs}
          />
        </div>
      </div>

      {result && <KofiButton message="If this helped you plan your path to homeownership," />}

      {/* Month-by-month breakdown */}
      {result && result.months.length > 0 && (
        <div className="glass-panel rounded-xl overflow-hidden mt-6">
          <button
            type="button"
            onClick={() => setTableOpen(o => !o)}
            aria-expanded={tableOpen}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-container-high transition-colors"
          >
            <h3 className="text-label-md font-semibold text-on-surface">Month-by-Month Breakdown</h3>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
              {tableOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {tableOpen && <SavingsPlannerTable result={result} />}
        </div>
      )}

    </div>
  );
}
