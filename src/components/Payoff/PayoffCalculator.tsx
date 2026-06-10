import { useState, useMemo, useRef } from 'react';
import {
  DEFAULT_PAYOFF_INPUTS,
  calcPayoff,
  type PayoffInputs,
  type PayoffResult,
} from '../../lib/calculator';
import { validatePayoffInputs, hasErrors } from '../../lib/validation';
import { PayoffInputs as PayoffInputsPanel } from './PayoffInputs';
import { PayoffSummary } from './PayoffSummary';
import { PayoffChart } from './PayoffChart';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function payoffDate(months: number): string {
  if (months <= 0) return 'Already paid off';
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildCsv(inputs: PayoffInputs, result: PayoffResult): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Mortgage Payoff Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Loan amount', cur.format(inputs.loanAmount));
  row('Annual interest rate', `${(inputs.annualRate * 100).toFixed(3)}%`);
  row('Loan term', `${inputs.loanTermYears} years`);
  row('Extra monthly payment', cur.format(inputs.extraMonthly));
  row('One-time lump sum', cur.format(inputs.lumpSum));
  row('', '');
  row('--- Summary ---', '');
  row('Monthly payment', cur.format(result.monthlyPayment));
  row('Original payoff date', payoffDate(result.originalPayoffMonths));
  row('New payoff date', payoffDate(result.extraPayoffMonths));
  row('Months saved', String(result.monthsSaved));
  row('Total interest (original)', cur.format(result.totalInterestOriginal));
  row('Total interest (with extra)', cur.format(result.totalInterestExtra));
  row('Interest saved', cur.format(result.interestSaved));
  row('', '');
  row('Year', 'Balance (Original)', 'Balance (With Extra)', 'Cumulative Interest (Original)', 'Cumulative Interest (With Extra)');
  for (const yr of result.years) {
    row(
      String(yr.year),
      cur.format(yr.balanceOriginal),
      cur.format(yr.balanceExtra),
      cur.format(yr.cumulativeInterestOriginal),
      cur.format(yr.cumulativeInterestExtra),
    );
  }

  return rows.join('\n');
}

function TaxAdvantageCard({ result }: { result: PayoffResult }) {
  const firstYearInterest = result.years[0]?.cumulativeInterestOriginal ?? 0;
  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '20px' }}>verified_user</span>
        <h3 className="text-label-md font-semibold text-on-surface">Tax Advantage</h3>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        In your first year, approximately {cur.format(firstYearInterest)} in mortgage interest may be tax-deductible. Accelerating payoff reduces this deduction over time as interest costs drop.
      </p>
    </div>
  );
}

function StrategyCard({ result, extraMonthly, onApply }: { result: PayoffResult; extraMonthly: number; onApply: () => void }) {
  const interestPct = result.totalInterestOriginal > 0
    ? Math.round((result.interestSaved / result.totalInterestOriginal) * 100)
    : 0;
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4" data-print="hide">
      <div>
        <span className="inline-flex items-center gap-1.5 text-label-sm font-bold text-primary uppercase tracking-widest border border-primary/30 rounded-full px-3 py-1 mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>tips_and_updates</span>
          Expert Recommendation
        </span>
        <h2 className="text-headline-md text-on-surface mb-2">
          A small lump sum now accelerates your payoff.
        </h2>
        <p className="text-body-md text-on-surface-variant">
          {extraMonthly > 0
            ? `With ${cur.format(extraMonthly)}/mo extra, you're already saving ${interestPct}% in interest. Adding a one-time lump sum on top of that has an outsized effect: every dollar paid early eliminates all the future interest that would have accrued on it.`
            : `Mortgage interest compounds on your remaining balance. A single extra payment of $5,000 today eliminates far more than $5,000 in lifetime interest cost. Start with a lump sum, then layer in monthly extra payments to maximize savings.`}
        </p>
      </div>
      <button
        type="button"
        onClick={onApply}
        className="self-start px-md py-xs rounded-lg bg-primary-accent text-white font-label-md hover:opacity-90 active:scale-95 transition-all"
      >
        Apply Strategy
      </button>
    </div>
  );
}

interface ProjectionRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  extraPaid: number;
  endBalance: number;
}

function buildProjectionRows(result: PayoffResult, extraMonthly: number): ProjectionRow[] {
  return result.years.map((yr, i) => {
    const prevCumInterest = i === 0 ? 0 : result.years[i - 1].cumulativeInterestExtra;
    const prevBalance = i === 0 ? result.initialBalanceExtra : result.years[i - 1].balanceExtra;
    const interestPaid = yr.cumulativeInterestExtra - prevCumInterest;
    const balanceDrop = prevBalance - yr.balanceExtra;
    const extraPaid = yr.balanceExtra === 0
      ? Math.max(0, balanceDrop - (result.monthlyPayment * 12 - interestPaid))
      : extraMonthly * 12;
    const principalPaid = Math.max(0, balanceDrop - extraPaid);
    return { year: yr.year, principalPaid, interestPaid, extraPaid, endBalance: yr.balanceExtra };
  });
}

export function PayoffCalculator() {
  const [inputs, setInputs] = useState<PayoffInputs>(DEFAULT_PAYOFF_INPUTS);
  const [tableOpen, setTableOpen] = useState(true);
  const inputsRef = useRef<HTMLDivElement>(null);

  function handleChange(key: keyof PayoffInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validatePayoffInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcPayoff(inputs)),
    [inputs, errors],
  );
  const projectionRows = useMemo(
    () => (result ? buildProjectionRows(result, inputs.extraMonthly) : []),
    [result, inputs.extraMonthly],
  );

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortgage-payoff-${today}.csv`;
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
          <h1 className="text-headline-lg text-on-surface font-bold">Mortgage Payoff Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your loan details and an extra monthly payment or lump sum to see the exact payoff date, months saved, and total interest avoided, with a year-by-year breakdown of the accelerated vs. standard repayment paths.</p>
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
        data-print-title="Mortgage Payoff Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left column — inputs + tax advantage + ko-fi */}
        <div ref={inputsRef} className="lg:col-span-4 flex flex-col gap-4">
          <PayoffInputsPanel inputs={inputs} onChange={handleChange} errors={errors} />
          {result && <TaxAdvantageCard result={result} />}
          {result && (
            <p data-print="hide" className="text-body-sm text-center text-on-surface-variant">
              If this helped you figure out your payoff strategy,{' '}
              <KofiButton label="☕ a coffee seems fair." />
            </p>
          )}
        </div>

        {/* Right column — results */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {result ? (
            <>
              <PayoffSummary result={result} />

              <PayoffChart result={result} />

              <StrategyCard
                result={result}
                extraMonthly={inputs.extraMonthly}
                onApply={scrollToInputs}
              />
            </>
          ) : (
            <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>
                schedule
              </span>
              <p className="text-body-sm text-on-surface-variant">
                Enter your loan details to see your payoff strategy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Yearly Projection — full-width, collapsible, default open */}
      {result && (
        <div className="glass-panel rounded-xl overflow-hidden mt-6">
          <button
            type="button"
            onClick={() => setTableOpen(o => !o)}
            aria-expanded={tableOpen}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-container-high transition-colors"
          >
            <h3 className="text-label-md font-semibold text-on-surface">Yearly Projection</h3>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
              {tableOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {tableOpen && (
            <div className="overflow-x-auto border-t border-border-subtle" data-print="table-container">
              <table className="w-full text-left" data-print="table">
                <thead>
                  <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide">
                    <th className="px-4 py-2.5 font-semibold">Year</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Principal</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Interest</th>
                    {inputs.extraMonthly > 0 && (
                      <th className="px-4 py-2.5 font-semibold text-right">Extra Paid</th>
                    )}
                    <th className="px-4 py-2.5 font-semibold text-right">Year-End Balance</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm font-mono-data">
                  {projectionRows.map(row => (
                    <tr key={row.year} className="zebra-row border-b border-border-subtle/30">
                      <td className="px-4 py-2.5 font-semibold text-on-surface">{row.year}</td>
                      <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(row.principalPaid)}</td>
                      <td className="px-4 py-2.5 text-right text-error">{cur.format(row.interestPaid)}</td>
                      {inputs.extraMonthly > 0 && (
                        <td className="px-4 py-2.5 text-right text-success-emerald">{cur.format(row.extraPaid)}</td>
                      )}
                      <td className="px-4 py-2.5 text-right text-primary">
                        {row.endBalance <= 0 ? '—' : cur.format(row.endBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
