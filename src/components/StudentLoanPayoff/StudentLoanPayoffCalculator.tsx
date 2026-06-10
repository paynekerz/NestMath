import { useState, useMemo } from 'react';
import {
  DEFAULT_STUDENT_LOAN_INPUTS,
  calcStudentLoanPayoff,
  type StudentLoanPayoffInputs,
} from '../../lib/student-loan-payoff';
import { validateStudentLoanPayoffInputs, hasErrors } from '../../lib/validation';
import { StudentLoanPayoffInputs as SLInputsPanel } from './StudentLoanPayoffInputs';
import { StudentLoanPayoffSummary } from './StudentLoanPayoffSummary';
import { StudentLoanPayoffChart } from './StudentLoanPayoffChart';
import { StudentLoanPayoffTable } from './StudentLoanPayoffTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cur2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildCsv(inputs: StudentLoanPayoffInputs, result: ReturnType<typeof calcStudentLoanPayoff>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Student Loan Payoff Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Loan balance', cur.format(inputs.loanBalance));
  row('Interest rate', `${(inputs.interestRate * 100).toFixed(2)}%`);
  row('Standard term', `${inputs.standardTermYears} years`);
  row('Extra monthly payment', cur.format(inputs.extraMonthly));
  row('', '');
  row('--- Summary ---', '');
  row('Standard monthly payment', cur2.format(result.monthlyPayment));
  row('Standard payoff', `${result.standardPayoffMonths} months`);
  row('Accelerated payoff', `${result.acceleratedPayoffMonths} months`);
  row('Months saved', String(result.monthsSaved));
  row('Total interest (standard)', cur.format(result.totalInterestStandard));
  row('Total interest (accelerated)', cur.format(result.totalInterestAccelerated));
  row('Interest saved', cur.format(result.interestSaved));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Balance (Standard)', 'Balance (Accelerated)', 'Cumul. Interest (Standard)', 'Cumul. Interest (Accelerated)');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.balanceStandard),
        cur.format(y.balanceAccelerated),
        cur.format(y.cumulativeInterestStandard),
        cur.format(y.cumulativeInterestAccelerated),
      );
    }
  }

  return rows.join('\n');
}

export function StudentLoanPayoffCalculator() {
  const [inputs, setInputs] = useState<StudentLoanPayoffInputs>(DEFAULT_STUDENT_LOAN_INPUTS);

  function handleChange(key: keyof StudentLoanPayoffInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateStudentLoanPayoffInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcStudentLoanPayoff(inputs)),
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
    a.download = `student-loan-payoff-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Student Loan Payoff Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your loan balance, interest rate, and an extra monthly payment to see exactly how much faster you'll be debt-free and how much interest you'll save compared to the standard repayment schedule.</p>
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
        data-print-title="Student Loan Payoff Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <SLInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <StudentLoanPayoffSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <StudentLoanPayoffChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you plan your path to debt freedom,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <StudentLoanPayoffTable result={result} />
        </div>
      )}

    </div>
  );
}
