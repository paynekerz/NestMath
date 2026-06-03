import { useState, useMemo } from 'react';
import {
  DEFAULT_SAVINGS_PLANNER_INPUTS,
  calcSavingsPlan,
  type SavingsPlannerInputs,
} from '../../lib/savings';
import { validateSavingsPlannerInputs, hasErrors } from '../../lib/validation';
import { SavingsPlannerInputs as SavingsPlannerInputsPanel } from './SavingsPlannerInputs';
import { SavingsPlannerSummary } from './SavingsPlannerSummary';
import { SavingsPlannerChart } from './SavingsPlannerChart';
import { SavingsPlannerTable } from './SavingsPlannerTable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function projectedDateStr(months: number | null): string {
  if (months === null) return 'Not reached in 30 years';
  if (months === 0) return 'Now';
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildCsv(inputs: SavingsPlannerInputs, result: ReturnType<typeof calcSavingsPlan>): string {
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

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How long does it take to save for a down payment?',
    a: 'It depends on the home price, your down payment target, and how much you save each month. On a $400,000 home with a 20% down payment and $1,000 saved per month in a 4.5% HYSA, it takes roughly 9–10 years. Saving more each month or choosing a smaller down payment significantly cuts that timeline. Use the calculator above to model your specific numbers.',
  },
  {
    q: 'How much should I save each month for a house?',
    a: "Figure out your cash-to-close target (down payment + closing costs), subtract what you already have, then work backward from your target date. If you want to buy in 5 years and need $92,000, you need to save roughly $1,400 per month before interest. A higher-yield account shortens the timeline. The calculator shows the exact monthly savings needed for any goal date.",
  },
  {
    q: 'Should I invest my down payment savings?',
    a: "It depends on your timeline. If you're buying in under 3 years, keep savings in a high-yield savings account (HYSA) — the stock market can drop 30–40% in a bad year and you can't afford to wait out a recovery. If you have 5+ years, investing in index funds at 7% average return will likely beat a HYSA. The annual return input lets you model both scenarios.",
  },
  {
    q: 'How do I save for a house while renting?',
    a: 'Start with a dedicated savings account separate from your regular checking account so the money stays put. Automate a fixed transfer on payday. Look for ways to cut recurring costs — subscriptions, dining out, car expenses. Any windfall (bonus, tax refund) goes straight to the house fund. The biggest lever is your savings rate, not the return on the account.',
  },
  {
    q: 'What is the 20% down payment rule?',
    a: "Putting 20% down lets you avoid private mortgage insurance (PMI), which costs 0.5–1.5% of the loan per year. It also means a smaller loan and lower monthly payments. That said, 20% is not required — many loan programs allow 3–10% down. The tradeoff is paying PMI until you reach 20% equity, which can add hundreds per month to your payment.",
  },
];

export function SavingsPlannerCalculator() {
  const [inputs, setInputs] = useState<SavingsPlannerInputs>(DEFAULT_SAVINGS_PLANNER_INPUTS);

  function handleChange(key: keyof SavingsPlannerInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateSavingsPlannerInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcSavingsPlan(inputs)),
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
    a.download = `savings-plan-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <SavingsPlannerInputsPanel inputs={inputs} onChange={handleChange} errors={errors} />

      <div data-print="title" data-print-title="Down Payment Savings Planner" data-date={today} className="flex flex-col gap-4">
        {result && (
          <>
            <SavingsPlannerSummary result={result} />

            <p data-print="hide" className="text-sm text-center text-muted">
              If this helped you plan your path to homeownership,{' '}
              <KofiButton label="☕ a coffee seems fair." />
            </p>

            <AdSlot format="auto" className="w-full" />

            {result.months.length > 0 && (
              <SavingsPlannerChart result={result} currentSavings={inputs.currentSavings} />
            )}

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

            <SavingsPlannerTable result={result} />
          </>
        )}
      </div>
      <div data-print="hide">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
