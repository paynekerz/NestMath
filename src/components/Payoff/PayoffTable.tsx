import { useState } from 'react';
import type { PayoffResult } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: PayoffResult;
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function PayoffTable({ result }: Props) {
  const [open, setOpen] = useState(false);

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
                  Balance (original)
                  <InfoTooltip text="Remaining loan balance with standard monthly payments only." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Balance (with extra)
                  <InfoTooltip text="Remaining loan balance when extra monthly payments and any lump sum are applied." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Cumulative interest (original)
                  <InfoTooltip text="Total interest paid so far with standard payments only." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Cumulative interest (with extra)
                  <InfoTooltip text="Total interest paid so far when extra payments are applied." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {result.years.map(yr => (
              <tr key={yr.year} className="border-t border-border hover:bg-border/30 transition-colors">
                <td className="px-4 py-1.5 text-muted">{yr.year}</td>
                <td className="px-4 py-1.5 text-right">{fmt.format(yr.balanceOriginal)}</td>
                <td className={`px-4 py-1.5 text-right font-medium ${yr.balanceExtra < yr.balanceOriginal ? 'text-[#4ade80]' : ''}`}>
                  {fmt.format(yr.balanceExtra)}
                </td>
                <td className="px-4 py-1.5 text-right text-muted">{fmt.format(yr.cumulativeInterestOriginal)}</td>
                <td className={`px-4 py-1.5 text-right ${yr.cumulativeInterestExtra < yr.cumulativeInterestOriginal ? 'text-[#4ade80]' : 'text-muted'}`}>
                  {fmt.format(yr.cumulativeInterestExtra)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
