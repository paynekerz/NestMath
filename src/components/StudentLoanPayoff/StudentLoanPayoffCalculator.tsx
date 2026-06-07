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
import { FAQSection, type FAQItem } from '../ui/FAQSection';

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

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How long does it take to pay off student loans?',
    a: "The standard federal student loan repayment plan is 10 years. Income-driven repayment plans can extend this to 20–25 years (with loan forgiveness at the end, which may be taxable). Private loans vary by lender — terms typically range from 5 to 20 years. The fastest payoff happens when you make extra payments toward principal whenever you can.",
  },
  {
    q: 'How much do extra student loan payments save?',
    a: "Extra payments go directly toward reducing your principal balance, which cuts future interest charges. On a $35,000 loan at 6.5% over 10 years, adding just $100/month extra saves over $1,200 in interest and pays off the loan about 14 months early. The effect compounds — earlier principal reduction means less interest accruing every month going forward.",
  },
  {
    q: 'Should I pay extra on my student loans?',
    a: "It depends on your interest rate and your alternatives. If your student loan rate is above 5–6%, paying it down is often a better guaranteed return than investing. If your rate is low (3–4%) and you have a 401(k) match you're not maxing, the match typically wins. Also, make sure you have a 3–6 month emergency fund before aggressively paying down student loans.",
  },
  {
    q: 'Is it better to pay off student loans or invest?',
    a: "Compare your loan's interest rate to your expected investment return. If your loan rate is 7% and the market returns 8%, the math slightly favors investing — but the loan payoff is risk-free. At rates above 7–8%, paying off student loans first is typically the better financial move. Always capture employer 401(k) match before either, since that's an instant 50–100% return.",
  },
  {
    q: 'What is the fastest way to pay off student loans?',
    a: "The fastest legal strategy: make extra principal payments whenever possible. Refinancing to a lower rate can help if your credit score qualifies. If you have multiple loans, target the highest-interest loan first (avalanche method) to minimize total interest paid. Avoid income-driven repayment plans unless you genuinely need lower payments — they extend your payoff timeline significantly.",
  },
];

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
          <p className="text-body-md text-on-surface-variant mt-1">See when you'll be debt-free and how much extra payments save you in interest.</p>
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
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
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

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
