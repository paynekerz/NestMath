import { useState, useMemo } from 'react';
import {
  DEFAULT_HYSA_INPUTS,
  calcHYSA,
  type HYSAInputs,
} from '../../lib/hysa';
import { validateHYSAInputs, hasErrors } from '../../lib/validation';
import { HYSAInputs as HYSAInputsPanel } from './HYSAInputs';
import { HYSASummary } from './HYSASummary';
import { HYSAChart } from './HYSAChart';
import { HYSATable } from './HYSATable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: HYSAInputs, result: ReturnType<typeof calcHYSA>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('HYSA Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Initial deposit', cur.format(inputs.initialDeposit));
  row('Monthly contribution', cur.format(inputs.monthlyContribution));
  row('HYSA APY', `${(inputs.hysaAPY * 100).toFixed(2)}%`);
  row('Traditional savings APY', `${(inputs.traditionalAPY * 100).toFixed(2)}%`);
  row('Years to model', String(inputs.yearsToModel));
  row('', '');
  row('--- Summary ---', '');
  row('Final balance (HYSA)', cur.format(result.finalBalanceHYSA));
  row('Final balance (traditional)', cur.format(result.finalBalanceTraditional));
  row('Total contributions', cur.format(result.totalContributions));
  row('Interest earned (HYSA)', cur.format(result.interestEarnedHYSA));
  row('Interest earned (traditional)', cur.format(result.interestEarnedTraditional));
  row('Extra earned vs. traditional', cur.format(result.extraEarned));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Balance (HYSA)', 'Balance (Traditional)', 'Interest (HYSA)', 'Interest (Traditional)', 'Delta');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.balanceHYSA),
        cur.format(y.balanceTraditional),
        cur.format(y.interestHYSA),
        cur.format(y.interestTraditional),
        cur.format(y.delta),
      );
    }
  }

  return rows.join('\n');
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'What is a high-yield savings account?',
    a: "A high-yield savings account (HYSA) is a savings account that pays a significantly higher interest rate than a traditional bank savings account. HYSAs are typically offered by online banks and credit unions, which have lower overhead costs than brick-and-mortar banks and pass those savings along as higher APYs. They are FDIC-insured up to $250,000 — just like a regular savings account — so your money is protected.",
  },
  {
    q: 'What is a good APY for a high-yield savings account?',
    a: "In mid-2024 to 2025, top HYSAs were offering APYs between 4% and 5.5%, compared to the national average of around 0.45% for traditional savings accounts. A good HYSA APY is anything meaningfully above the national average — 4%+ is excellent. Rates fluctuate with the Federal Reserve's benchmark rate, so the best rate today may be different in a year. Always compare current rates from multiple providers.",
  },
  {
    q: 'How much can you earn in a high-yield savings account?',
    a: "It depends on your balance, your monthly contributions, and the APY. At 4.5% APY with a $5,000 starting balance and $300/month in contributions, you'd have about $26,700 after 5 years — earning roughly $3,900 in interest. A traditional savings account at 0.45% APY would only earn about $400 in interest over the same period. The difference compounds over time, making HYSAs especially valuable for emergency funds or short-to-medium-term savings goals.",
  },
  {
    q: 'Is a high-yield savings account worth it?',
    a: "Yes, for money you need to keep liquid — emergency funds, short-term savings goals, or cash you're waiting to deploy. The downside: HYSA rates are variable and will drop if the Fed cuts rates. For money you won't need for 5+ years, investing in index funds typically outperforms even the best HYSA over the long run. The HYSA is the right tool for savings you might need within 1–3 years.",
  },
  {
    q: 'How is HYSA interest calculated?',
    a: "HYSA interest is calculated using APY (Annual Percentage Yield), which already accounts for compounding. Most HYSAs compound daily but pay interest monthly. This calculator uses monthly compounding, which is a very close approximation. The formula is: balance × (1 + APY/12) each month, plus any new contributions. The key insight is that interest earns interest — so the longer your money sits in the account, the faster it grows.",
  },
];

export function HYSACalculator() {
  const [inputs, setInputs] = useState<HYSAInputs>(DEFAULT_HYSA_INPUTS);

  function handleChange(key: keyof HYSAInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateHYSAInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcHYSA(inputs)),
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
    a.download = `hysa-calculator-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">High-Yield Savings Account Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">See how much more your money earns in a HYSA vs. a traditional savings account.</p>
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
        data-print-title="High-Yield Savings Account Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <HYSAInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <HYSASummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <HYSAChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this helped you find a better place for your savings,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <HYSATable result={result} />
        </div>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
