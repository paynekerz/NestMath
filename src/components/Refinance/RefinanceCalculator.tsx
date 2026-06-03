import { useState, useMemo } from 'react';
import {
  DEFAULT_REFINANCE_INPUTS,
  calcRefinance,
  type RefinanceInputs,
} from '../../lib/calculator';
import { validateRefinanceInputs, hasErrors } from '../../lib/validation';
import { RefinanceInputs as RefinanceInputsPanel } from './RefinanceInputs';
import { RefinanceSummary } from './RefinanceSummary';
import { RefinanceChart } from './RefinanceChart';
import { RefinanceTable } from './RefinanceTable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: RefinanceInputs, result: ReturnType<typeof calcRefinance>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  const closingCostsLabel = inputs.usesFlatClosingCost
    ? 'Closing costs (flat)'
    : `Closing costs (${(inputs.closingCostsPct * 100).toFixed(2)}% of balance)`;

  row('Refinance Break-Even Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Current loan balance', cur.format(inputs.currentBalance));
  row('Current interest rate', `${(inputs.currentRate * 100).toFixed(3)}%`);
  row('Remaining term', `${inputs.remainingTermYears} years`);
  row('New interest rate', `${(inputs.newRate * 100).toFixed(3)}%`);
  row('New loan term', `${inputs.newTermYears} years`);
  row(closingCostsLabel, cur.format(result.closingCostsDollar));
  row('', '');
  row('--- Summary ---', '');
  row('Current monthly payment', cur.format(result.currentMonthlyPayment));
  row('New monthly payment', cur.format(result.newMonthlyPayment));
  row('Monthly savings', cur.format(result.monthlySavings));
  row('Closing costs', cur.format(result.closingCostsDollar));
  row('Break-even', result.breakEvenMonths !== null ? `${result.breakEvenMonths} months` : 'N/A');
  row('Worth it?', result.worthIt ? 'Yes' : 'No');
  row('Total interest (current path)', cur.format(result.totalInterestCurrent));
  row('Total interest (refinanced)', cur.format(result.totalInterestRefinanced));
  row('Net savings', cur.format(result.netSavings));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Balance (current)', 'Balance (refinanced)', 'Cum. interest (current)', 'Cum. interest (refinanced)', 'Cumulative savings');
    for (const y of result.years) {
      row(
        String(y.year),
        y.balanceCurrent === 0 ? '—' : cur.format(y.balanceCurrent),
        y.balanceRefinanced === 0 ? '—' : cur.format(y.balanceRefinanced),
        cur.format(y.cumulativeInterestCurrent),
        cur.format(y.cumulativeInterestRefinanced),
        cur.format(y.cumulativeSavings),
      );
    }
  }

  return rows.join('\n');
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How do I know if refinancing is worth it?',
    a: 'Refinancing is worth it when the break-even point — the month you recoup closing costs through lower payments — falls before you plan to sell or pay off the home. If you break even in 24 months and plan to stay 10 more years, refinancing makes sense. If break-even is 60 months and you might move in 3 years, it probably does not.',
  },
  {
    q: 'What is the break-even point for refinancing?',
    a: 'The break-even point is when your cumulative monthly savings equal the closing costs you paid to refinance. For example: $6,000 in closing costs ÷ $200 monthly savings = 30 months. After month 30, every payment is money you keep. The calculator shows this date precisely based on your numbers.',
  },
  {
    q: 'Is it worth refinancing for 1% lower interest rate?',
    a: "A 1% rate drop is a common rule of thumb but it depends on your loan size and how long you'll stay. On a $300,000 balance, 1% lower saves roughly $170/month. With $6,000 in closing costs, you break even in about 35 months. If you're staying longer than that, refinancing makes financial sense regardless of the 1% rule.",
  },
  {
    q: 'How much does refinancing save over the life of a loan?',
    a: 'It depends on the rate difference, loan balance, and terms. Dropping from 7.5% to 6.5% on a $300,000 balance with 27 years remaining saves roughly $50,000 in total interest — even after accounting for closing costs on a new 30-year loan. The net savings stat above shows the exact figure for your inputs.',
  },
  {
    q: 'What are typical refinancing closing costs?',
    a: 'Closing costs for a refinance typically run 2–5% of the loan balance. On a $300,000 loan, expect $6,000–$15,000. The main components are origination fees, appraisal, title insurance, and prepaid items like property taxes and insurance. Some lenders offer no-closing-cost refinances, but those fees are rolled into a slightly higher rate.',
  },
];

export function RefinanceCalculator() {
  const [inputs, setInputs] = useState<RefinanceInputs>(DEFAULT_REFINANCE_INPUTS);

  function handleChange(key: keyof RefinanceInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function handleToggleCostMode() {
    setInputs(prev => {
      const switching = !prev.usesFlatClosingCost;
      if (switching) {
        // switching to flat dollar — derive from current pct
        return {
          ...prev,
          usesFlatClosingCost: true,
          closingCostsDollar: Math.round(prev.currentBalance * prev.closingCostsPct),
        };
      } else {
        // switching back to pct — derive from current dollar
        return {
          ...prev,
          usesFlatClosingCost: false,
          closingCostsPct: prev.currentBalance > 0
            ? parseFloat((prev.closingCostsDollar / prev.currentBalance).toFixed(4))
            : prev.closingCostsPct,
        };
      }
    });
  }

  const errors = useMemo(() => validateRefinanceInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRefinance(inputs)),
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
    a.download = `refinance-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <RefinanceInputsPanel
        inputs={inputs}
        onChange={handleChange}
        onToggleCostMode={handleToggleCostMode}
        errors={errors}
      />

      <div data-print="title" data-print-title="Refinance Break-Even Calculator" data-date={today} className="flex flex-col gap-4">
        {result && (
          <>
            <RefinanceSummary result={result} />

            <p data-print="hide" className="text-sm text-center text-muted">
              If this helped you decide on your refinance,{' '}
              <KofiButton label="☕ a coffee seems fair." />
            </p>

            <AdSlot format="auto" className="w-full" />

            <RefinanceChart result={result} />

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

            <RefinanceTable result={result} />
          </>
        )}
      </div>
      <div data-print="hide">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
