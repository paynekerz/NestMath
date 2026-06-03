import { useState } from 'react';
import type { RefinanceResult } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RefinanceResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function RefinanceTable({ result }: Props) {
  const [open, setOpen] = useState(false);

  if (result.years.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-border transition-colors rounded-lg"
      >
        <span>Year-by-Year Breakdown</span>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>
      <div
        data-print="table-container"
        className="overflow-x-auto"
        style={open ? undefined : { display: 'none' }}
      >
        <table data-print="table" className="w-full text-xs tabular-nums border-t border-border">
          <thead>
            <tr className="text-muted">
              <th className="px-4 py-2 text-left font-medium">Year</th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Balance (current)
                  <InfoTooltip text="Remaining mortgage balance on your current loan at year end." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Balance (refinanced)
                  <InfoTooltip text="Remaining mortgage balance on the new refinanced loan at year end." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Cum. interest (current)
                  <InfoTooltip text="Total interest paid to date on the current loan." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Cum. interest (refinanced)
                  <InfoTooltip text="Total interest paid to date on the refinanced loan." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Cumulative savings
                  <InfoTooltip text="Interest saved by refinancing minus closing costs. Positive means you've recouped the closing costs." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {result.years.map(y => (
              <tr key={y.year} className="border-t border-border hover:bg-border/30 transition-colors">
                <td className="px-4 py-1.5 text-muted">{y.year}</td>
                <td className="px-4 py-1.5 text-right">{y.balanceCurrent === 0 ? '—' : cur.format(y.balanceCurrent)}</td>
                <td className="px-4 py-1.5 text-right">{y.balanceRefinanced === 0 ? '—' : cur.format(y.balanceRefinanced)}</td>
                <td className="px-4 py-1.5 text-right">{cur.format(y.cumulativeInterestCurrent)}</td>
                <td className="px-4 py-1.5 text-right">{cur.format(y.cumulativeInterestRefinanced)}</td>
                <td className={`px-4 py-1.5 text-right font-medium ${y.cumulativeSavings >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                  {y.cumulativeSavings >= 0 ? cur.format(y.cumulativeSavings) : `-${cur.format(Math.abs(y.cumulativeSavings))}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
