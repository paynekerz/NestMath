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
          <p className="text-body-md text-on-surface-variant mt-1">Add up your assets and liabilities to calculate your current net worth, with a visual category breakdown and optional year-over-year comparison to track whether your financial position is improving.</p>
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
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you get a clear picture of where you stand,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

    </div>
  );
}
