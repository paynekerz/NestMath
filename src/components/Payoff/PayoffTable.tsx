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
    <div className="rounded-xl border border-border-subtle bg-surface">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-label-sm font-medium hover:bg-surface-container-high transition-colors rounded-t-xl"
      >
        <span>Year-by-Year Breakdown</span>
        <span className="text-on-surface-variant text-label-sm">{open ? '▲' : '▼'}</span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div data-print="table-container" className="overflow-x-auto">
        <table data-print="table" className="w-full text-label-sm tabular-nums border-t border-border-subtle">
          <thead>
            <tr className="text-on-surface-variant">
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
              <tr key={yr.year} className="border-t border-border-subtle hover:bg-surface-container transition-colors">
                <td className="px-4 py-1.5 text-on-surface-variant">{yr.year}</td>
                <td className="px-4 py-1.5 text-right">{fmt.format(yr.balanceOriginal)}</td>
                <td className={`px-4 py-1.5 text-right font-medium ${yr.balanceExtra < yr.balanceOriginal ? 'text-success-emerald' : ''}`}>
                  {fmt.format(yr.balanceExtra)}
                </td>
                <td className="px-4 py-1.5 text-right text-on-surface-variant">{fmt.format(yr.cumulativeInterestOriginal)}</td>
                <td className={`px-4 py-1.5 text-right ${yr.cumulativeInterestExtra < yr.cumulativeInterestOriginal ? 'text-success-emerald' : 'text-on-surface-variant'}`}>
                  {fmt.format(yr.cumulativeInterestExtra)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
      </div>
    </div>
  );
}
