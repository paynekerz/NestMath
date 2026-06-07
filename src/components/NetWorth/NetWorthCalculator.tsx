import { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_NET_WORTH_INPUTS,
  calcNetWorth,
  type NetWorthInputs,
} from '../../lib/net-worth';
import { validateNetWorthInputs, hasErrors } from '../../lib/validation';
import { NetWorthInputs as NetWorthInputsPanel } from './NetWorthInputs';
import { NetWorthSummary } from './NetWorthSummary';
import { NetWorthChart } from './NetWorthChart';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: NetWorthInputs, result: ReturnType<typeof calcNetWorth>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Net Worth Snapshot', `Generated: ${today}`);
  row('', '');
  row('--- Assets ---', '');
  row('Checking / savings',              cur.format(inputs.checkingSavings));
  row('Investments / brokerage',         cur.format(inputs.investments));
  row('Retirement accounts',             cur.format(inputs.retirement));
  row('Home equity',                     cur.format(inputs.homeEquity));
  row('Vehicle value',                   cur.format(inputs.vehicleValue));
  row('Other assets',                    cur.format(inputs.otherAssets));
  row('Total assets',                    cur.format(result.totalAssets));
  row('', '');
  row('--- Liabilities ---', '');
  row('Mortgage balance',                cur.format(inputs.mortgageBalance));
  row('Car loans',                       cur.format(inputs.carLoans));
  row('Credit card balances',            cur.format(inputs.creditCardBalances));
  row('Student loans',                   cur.format(inputs.studentLoans));
  row('Other debt',                      cur.format(inputs.otherDebt));
  row('Total liabilities',              cur.format(result.totalLiabilities));
  row('', '');
  row('--- Summary ---', '');
  row('Net worth',                       cur.format(result.netWorth));
  if (result.yoyDelta !== null) {
    row('Last year\'s net worth',        cur.format(inputs.lastYearNetWorth!));
    row('Year-over-year change',         (result.yoyDelta >= 0 ? '+' : '') + cur.format(result.yoyDelta));
  }
  if (result.totalAssets > 0) {
    row('Debt-to-asset ratio',           `${((result.totalLiabilities / result.totalAssets) * 100).toFixed(1)}%`);
  }

  return rows.join('\n');
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'What is net worth and how is it calculated?',
    a: 'Net worth is the difference between everything you own (assets) and everything you owe (liabilities). Assets include cash, investments, retirement accounts, home equity, and the value of vehicles or other property. Liabilities include mortgage balances, car loans, credit card debt, student loans, and any other money you owe. Net worth = total assets − total liabilities.',
  },
  {
    q: 'What is a good net worth by age?',
    a: "There's no universal answer, but a common benchmark is: by 30, aim for 1× your annual income; by 40, 3× your income; by 50, 6×; by 60, 10×. The Federal Reserve\'s Survey of Consumer Finances shows the median net worth for Americans under 35 is around $39,000, rising to roughly $1.2 million for those 65–74. These are medians — if you're below them, focus on the trend, not the absolute number.",
  },
  {
    q: 'Should I include my home equity in net worth?',
    a: 'Yes — home equity (current market value minus outstanding mortgage) is a real asset. Use a realistic estimate of your home\'s current value, not what you paid for it. Keep in mind that home equity is illiquid: you can\'t spend it without selling, refinancing, or taking out a HELOC. Some people calculate their net worth both ways to see their "liquid" vs. total net worth.',
  },
  {
    q: 'How often should I calculate my net worth?',
    a: 'Once or twice a year is the sweet spot for most people. More frequent tracking can cause anxiety over short-term fluctuations (especially in investment accounts). An annual snapshot — ideally on the same date each year — makes year-over-year comparisons meaningful and helps you spot trends without obsessing over daily market moves.',
  },
  {
    q: 'Is it OK to have a negative net worth?',
    a: 'Yes — a negative net worth is common and often expected, especially when you\'re young, have student loans, or recently bought a home with a small down payment. What matters is the trend. If your net worth is improving over time — even from very negative to less negative — you\'re moving in the right direction. Focus on increasing assets (saving, investing) and reducing liabilities (paying down debt) simultaneously.',
  },
];

export function NetWorthCalculator() {
  const [inputs, setInputs] = useState<NetWorthInputs>(DEFAULT_NET_WORTH_INPUTS);
  const [showYoy, setShowYoy] = useState(false);

  function handleChange(key: keyof NetWorthInputs, value: number | null) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function handleToggleYoy() {
    setShowYoy(prev => {
      if (prev) {
        setInputs(p => ({ ...p, lastYearNetWorth: null }));
      } else {
        setInputs(p => ({ ...p, lastYearNetWorth: 0 }));
      }
      return !prev;
    });
  }

  const errors = useMemo(() => validateNetWorthInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcNetWorth(inputs)),
    [inputs, errors],
  );

  useEffect(() => {
    if (!result) return;
    try {
      localStorage.setItem('nm_networth', JSON.stringify({
        totalAssets: result.totalAssets,
        totalLiabilities: result.totalLiabilities,
        netWorth: result.netWorth,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage may be unavailable
    }
  }, [result]);

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `net-worth-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Net Worth Snapshot</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Add up everything you own and everything you owe to see where you stand.</p>
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
        data-print-title="Net Worth Snapshot"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8">
          <NetWorthInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
            showYoy={showYoy}
            onToggleYoy={handleToggleYoy}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          {result ? (
            <NetWorthSummary result={result} />
          ) : (
            <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px] h-full">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>account_balance</span>
              <p className="text-body-sm text-on-surface-variant">Fix the validation errors to see your net worth.</p>
            </div>
          )}
        </div>

        {/* Donut charts — full width */}
        {result && (
          <div className="lg:col-span-12">
            <NetWorthChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this helped you get a clear picture of where you stand,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
