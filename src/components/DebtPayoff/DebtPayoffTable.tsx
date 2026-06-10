import { useState } from 'react';
import type { DebtPayoffResult, DebtStrategyResult } from '../../lib/debt-payoff';

interface Props {
  result: DebtPayoffResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function getPayoffDate(monthsFromNow: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function fmtMonths(n: number): string {
  const y = Math.floor(n / 12);
  const m = n % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y}y`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '< 1m';
}

function StrategyTable({ strategy, label }: { strategy: DebtStrategyResult; label: string }) {
  return (
    <div>
      <h4 className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-widest px-4 py-2 bg-surface-container/50 border-b border-border-subtle">
        {label}
      </h4>
      <table className="w-full text-left" data-print="table">
        <thead>
          <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide bg-surface-container">
            <th className="px-4 py-2.5 font-semibold">Order</th>
            <th className="px-4 py-2.5 font-semibold">Debt</th>
            <th className="px-4 py-2.5 font-semibold text-right">Balance</th>
            <th className="px-4 py-2.5 font-semibold text-right">APR</th>
            <th className="px-4 py-2.5 font-semibold text-right">Paid Off</th>
            <th className="px-4 py-2.5 font-semibold text-right">Timeline</th>
          </tr>
        </thead>
        <tbody className="text-body-sm font-mono-data">
          {strategy.payoffOrder.map((entry, i) => (
            <tr key={entry.id} className="zebra-row border-b border-border-subtle/30">
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container/30 text-primary text-label-sm font-bold">
                  {i + 1}
                </span>
              </td>
              <td className="px-4 py-2.5 font-semibold text-on-surface">{entry.name}</td>
              <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(entry.initialBalance)}</td>
              <td className="px-4 py-2.5 text-right text-on-surface">{(entry.apr * 100).toFixed(2)}%</td>
              <td className="px-4 py-2.5 text-right text-primary font-semibold">{getPayoffDate(entry.payoffMonth)}</td>
              <td className="px-4 py-2.5 text-right text-on-surface-variant">{fmtMonths(entry.payoffMonth)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DebtPayoffTable({ result }: Props) {
  const [open, setOpen] = useState(false);

  if (result.avalanche.payoffOrder.length === 0) return null;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        data-print="hide"
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-container-high transition-colors"
      >
        <h3 className="text-label-md font-semibold text-on-surface">Payoff Order by Strategy</h3>
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-border-subtle" data-print="table-container">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
          <StrategyTable strategy={result.avalanche} label="Avalanche: Highest APR First" />
          <StrategyTable strategy={result.snowball}  label="Snowball: Lowest Balance First" />
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
