import { useState, useMemo } from 'react';
import {
  DEFAULT_INVESTMENT_FEES_INPUTS,
  calcInvestmentFees,
  type InvestmentFeesInputs,
} from '../../lib/investment-fees';
import { validateInvestmentFeesInputs, hasErrors } from '../../lib/validation';
import { InvestmentFeesInputs as InvestmentFeesInputsPanel } from './InvestmentFeesInputs';
import { InvestmentFeesSummary } from './InvestmentFeesSummary';
import { InvestmentFeesChart } from './InvestmentFeesChart';
import { InvestmentFeesTable } from './InvestmentFeesTable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: InvestmentFeesInputs, result: ReturnType<typeof calcInvestmentFees>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Investment Fee Impact Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Initial investment', cur.format(inputs.initialInvestment));
  row('Monthly contribution', cur.format(inputs.monthlyContribution));
  row('Annual gross return', `${(inputs.annualGrossReturn * 100).toFixed(1)}%`);
  row('Current expense ratio', `${(inputs.currentExpenseRatio * 100).toFixed(3)}%`);
  row('Low-cost expense ratio', `${(inputs.lowCostExpenseRatio * 100).toFixed(3)}%`);
  row('Years to model', String(inputs.yearsToModel));
  row('', '');
  row('--- Summary ---', '');
  row('Portfolio value (current fees)', cur.format(result.portfolioCurrentFees));
  row('Portfolio value (low-cost)', cur.format(result.portfolioLowCost));
  row('Fee drag ($)', cur.format(result.feeDragDollar));
  row('Fee drag (%)', `${result.feeDragPct.toFixed(2)}%`);
  row('Total contributions', cur.format(result.totalContributions));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Portfolio (Current Fees)', 'Portfolio (Low-Cost)', 'Annual Fee Drag', 'Cumulative Fee Drag');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.portfolioCurrentFees),
        cur.format(y.portfolioLowCost),
        cur.format(y.annualFeeDrag),
        cur.format(y.cumulativeFeeDrag),
      );
    }
  }

  return rows.join('\n');
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'How much does a 1% expense ratio cost over 30 years?',
    a: "A lot more than you'd think. On a $50,000 starting investment with $500/month contributions at 8% gross return, a 1% expense ratio can cost over $250,000 compared to a 0.04% index fund over 30 years. This happens because fees compound just like returns do — every dollar taken as a fee is a dollar that can't grow. The longer your horizon, the more devastating the drag.",
  },
  {
    q: 'What is a good expense ratio for an index fund?',
    a: "For broad market index funds, anything under 0.10% is excellent. Vanguard VTSAX charges 0.04%, Schwab SWTSX charges 0.03%, and Fidelity ZERO funds charge 0%. Most actively managed funds charge 0.5–1.5%, and hedge funds or complex products can charge 2%+ plus performance fees. For most long-term investors, a low-cost index fund outperforms the average actively managed fund after fees — not because the manager is worse, but because the fee hurdle is nearly impossible to consistently clear.",
  },
  {
    q: 'How do investment fees affect long-term returns?',
    a: "Fees reduce your net return every year. If your fund earns 8% gross but charges 1%, your net return is 7%. That 1% gap compounds against you — each year you earn less, which means the next year's compounding base is smaller. Over 20–30 years, this creates a large and growing gap. It's often called the \"tyranny of compounding costs\" — the same math that makes investing powerful also makes fees destructive over time.",
  },
  {
    q: 'What is the difference between an expense ratio and a management fee?',
    a: "An expense ratio is the all-in annual cost of owning a mutual fund or ETF, expressed as a percentage of your assets. It typically covers the fund manager's salary, administrative costs, marketing (12b-1 fees), and trading costs — all rolled into one number that's deducted from the fund's assets daily. A management fee is the specific slice going to the portfolio manager, and it's usually a component inside the broader expense ratio. When comparing funds, the expense ratio is the number that matters.",
  },
  {
    q: 'Is a 0.5% expense ratio too high?',
    a: "It depends on what you're getting. For a simple broad market index fund, 0.5% is 10–12x what Vanguard or Fidelity charge for the same exposure — so yes, it's too high for a passive fund. For a specialized or actively managed fund, 0.5% is actually below average. The real question is: does the fund's after-fee performance justify the cost? Studies consistently show that most actively managed funds underperform a low-cost index fund after fees over long periods.",
  },
];

export function InvestmentFeesCalculator() {
  const [inputs, setInputs] = useState<InvestmentFeesInputs>(DEFAULT_INVESTMENT_FEES_INPUTS);

  function handleChange(key: keyof InvestmentFeesInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateInvestmentFeesInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcInvestmentFees(inputs)),
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
    a.download = `investment-fees-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Investment Fee Impact Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">See the long-term dollar cost of your expense ratio vs. a low-cost index fund alternative.</p>
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
        data-print-title="Investment Fee Impact Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <InvestmentFeesInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <InvestmentFeesSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <InvestmentFeesChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this helped you rethink your fund fees,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <InvestmentFeesTable result={result} />
        </div>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
