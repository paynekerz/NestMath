import { useState, useMemo } from 'react';
import {
  DEFAULT_CC_INPUTS,
  calcCreditCardPayoff,
  type CreditCardPayoffInputs,
  type CCPaymentMode,
} from '../../lib/credit-card-payoff';
import { validateCreditCardPayoffInputs, hasErrors } from '../../lib/validation';
import { CreditCardPayoffInputs as CCInputsPanel } from './CreditCardPayoffInputs';
import { CreditCardPayoffSummary } from './CreditCardPayoffSummary';
import { CreditCardPayoffChart } from './CreditCardPayoffChart';
import { CreditCardPayoffTable } from './CreditCardPayoffTable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cur2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildCsv(inputs: CreditCardPayoffInputs, result: ReturnType<typeof calcCreditCardPayoff>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Credit Card Payoff Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Current balance', cur.format(inputs.balance));
  row('Annual APR', `${(inputs.apr * 100).toFixed(2)}%`);
  if (inputs.paymentMode === 'payment') {
    row('Monthly payment', cur.format(inputs.monthlyPayment));
  } else {
    row('Target payoff months', String(inputs.desiredMonths));
    row('Required monthly payment', cur2.format(result.effectivePayment));
  }
  row('', '');
  row('--- Summary ---', '');
  row('Monthly payment used', cur2.format(result.effectivePayment));
  row('Payoff months', String(result.payoffMonths));
  row('Total interest paid', cur.format(result.totalInterest));
  row('Total paid', cur.format(result.totalPaid));
  row('Minimum payment: months', String(result.minPayoffMonths));
  row('Minimum payment: total interest', cur.format(result.minTotalInterest));
  row('Interest saved vs. minimum', cur.format(result.interestSaved));

  if (result.months.length > 0) {
    row('', '');
    row('Month', 'Payment', 'Principal', 'Interest', 'Remaining Balance');
    for (const m of result.months) {
      row(
        String(m.month),
        cur2.format(m.payment),
        cur2.format(m.principal),
        cur2.format(m.interest),
        cur2.format(m.balance),
      );
    }
  }

  return rows.join('\n');
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How long will it take to pay off my credit card?',
    a: "It depends on your balance, interest rate, and monthly payment. At the national average APR of around 22%, a $5,000 balance paid with $150/month takes about 42 months and costs roughly $1,300 in interest. This calculator shows you the exact timeline and total cost for your numbers — and compares it against what minimum payments would cost.",
  },
  {
    q: 'How much does the minimum payment really cost me?',
    a: "A lot more than you think. Minimum payments are typically 2% of your remaining balance, which shrinks as the balance drops — so you pay very little principal each month. On a $5,000 balance at 22% APR, paying minimums can take over 20 years and cost more in interest than your original debt. Even a small increase above the minimum makes a significant difference.",
  },
  {
    q: 'What is the fastest way to pay off credit card debt?',
    a: "The fastest way is to pay as much as you can afford above the minimum each month. If you have multiple cards, the avalanche method (highest APR first) minimizes total interest paid — and the snowball method (smallest balance first) gives faster psychological wins. Either way, stop adding new charges to the card while paying it off.",
  },
  {
    q: 'Is it better to pay off credit card debt or invest?',
    a: "If your credit card APR is higher than your expected investment return, pay off the debt first. At 22% APR, the guaranteed 'return' of eliminating that interest beats typical market returns of 7–10%. Once high-APR debt is gone, redirect those payments toward investing. Low-rate debt (below 5%) is a closer call — investing may win there.",
  },
  {
    q: 'How is credit card interest calculated?',
    a: "Credit card interest accrues daily but is typically charged monthly. The daily rate is your APR divided by 365. Each day, interest is added to your average daily balance. This calculator simplifies to monthly compounding — the difference is negligible for planning purposes. The key insight: interest is charged on your entire remaining balance, so every dollar of principal you pay down reduces next month's interest charge.",
  },
];

export function CreditCardPayoffCalculator() {
  const [inputs, setInputs] = useState<CreditCardPayoffInputs>(DEFAULT_CC_INPUTS);

  function handleChange(key: keyof CreditCardPayoffInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function handleModeChange(mode: CCPaymentMode) {
    setInputs(prev => ({ ...prev, paymentMode: mode }));
  }

  const errors = useMemo(() => validateCreditCardPayoffInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcCreditCardPayoff(inputs)),
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
    a.download = `credit-card-payoff-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Credit Card Payoff Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">See when you'll be debt-free and how much interest you'll save vs. paying minimums.</p>
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
        data-print-title="Credit Card Payoff Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <CCInputsPanel
            inputs={inputs}
            onChange={handleChange}
            onModeChange={handleModeChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <CreditCardPayoffSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <CreditCardPayoffChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this helped you tackle your debt,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Month-by-month table */}
      {result && (
        <div className="mt-6">
          <CreditCardPayoffTable result={result} />
        </div>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
