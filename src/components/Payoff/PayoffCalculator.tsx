import { useState, useMemo } from 'react';
import {
  DEFAULT_PAYOFF_INPUTS,
  calcPayoff,
  type PayoffInputs,
} from '../../lib/calculator';
import { validatePayoffInputs, hasErrors } from '../../lib/validation';
import { PayoffInputs as PayoffInputsPanel } from './PayoffInputs';
import { PayoffSummary } from './PayoffSummary';
import { PayoffChart } from './PayoffChart';
import { PayoffTable } from './PayoffTable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function payoffDate(months: number): string {
  if (months <= 0) return 'Already paid off';
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildCsv(inputs: PayoffInputs, result: ReturnType<typeof calcPayoff>): string {
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

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How much do extra mortgage payments save?',
    a: 'It depends on your loan balance, rate, and how much extra you pay. On a $320,000 loan at 6.75%, paying an extra $200 per month saves roughly $70,000 in interest and cuts about 6 years off a 30-year loan. Use the calculator above to model your exact numbers.',
  },
  {
    q: 'Is it worth paying extra on your mortgage?',
    a: 'Usually yes — especially when your mortgage rate is higher than what you can safely earn investing. If your rate is 6.75%, paying down the loan gives you a guaranteed 6.75% return. If you expect to earn more than that investing, you might be better off investing the difference. The right answer depends on your rate, tax situation, and risk tolerance.',
  },
  {
    q: 'What happens if I pay an extra $500 a month on my mortgage?',
    a: 'On a $320,000 loan at 6.75% with a 30-year term, an extra $500 per month saves over $140,000 in interest and pays off the loan about 10 years early. Enter your numbers in the calculator to see exactly what $500 extra does for your specific loan.',
  },
  {
    q: 'How do I pay off my mortgage in 15 years instead of 30?',
    a: 'Calculate the monthly payment for a 15-year loan at your current rate, then subtract your current payment — the difference is the extra amount you need to add each month. The calculator above shows you the payoff date for any extra payment amount. You can work backwards: increase the extra payment until the new payoff date hits your 15-year target.',
  },
  {
    q: 'Does paying extra principal reduce monthly payment?',
    a: 'No — for a standard fixed-rate mortgage, your required monthly payment stays the same regardless of extra principal you pay. What changes is the payoff date and total interest. The extra principal reduces your balance faster, which cuts interest charges, but your bank still expects the same minimum payment each month.',
  },
];

export function PayoffCalculator() {
  const [inputs, setInputs] = useState<PayoffInputs>(DEFAULT_PAYOFF_INPUTS);

  function handleChange(key: keyof PayoffInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validatePayoffInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcPayoff(inputs)),
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
    a.download = `mortgage-payoff-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <PayoffInputsPanel inputs={inputs} onChange={handleChange} errors={errors} />

      <div data-print="title" data-print-title="Mortgage Payoff Calculator" data-date={today} className="flex flex-col gap-4">
        {result && (
          <>
            <PayoffSummary result={result} />

            <p data-print="hide" className="text-sm text-center text-muted">
              If this helped you figure out your payoff strategy,{' '}
              <KofiButton label="☕ a coffee seems fair." />
            </p>

            <PayoffChart result={result} />

            <div data-print="hide" className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCsv}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-border transition-colors"
              >
                Download CSV
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-border transition-colors"
              >
                Print / Save PDF
              </button>
            </div>

            <PayoffTable result={result} />
          </>
        )}
      </div>
      <div data-print="hide">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
