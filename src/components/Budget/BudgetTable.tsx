import { useState } from 'react';
import type { YearRow } from '../../lib/budget';

interface Props {
  rows: YearRow[];
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function projectedYear(yearsOut: number): number {
  return new Date().getFullYear() + yearsOut;
}

export function BudgetTable({ rows }: Props) {
  const [open, setOpen] = useState(false);

  if (rows.length === 0) return null;

  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-[24px] py-[14px] text-label-md font-semibold text-on-surface hover:bg-surface-container-high transition-colors rounded-xl"
      >
        <span>Year-by-Year Breakdown</span>
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]" aria-hidden="true">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div data-print="table-container" className="overflow-x-auto">
        <table data-print="table" className="w-full text-body-sm border-t border-border-subtle">
          <thead>
            <tr className="bg-surface-container-high text-on-surface-variant text-label-sm uppercase tracking-wider">
              <th className="px-[24px] py-[10px] text-left font-semibold">Year</th>
              <th className="px-[24px] py-[10px] text-right font-semibold">Calendar year</th>
              <th className="px-[24px] py-[10px] text-right font-semibold">Annual savings</th>
              <th className="px-[24px] py-[10px] text-right font-semibold">Cumulative savings</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.year} className="zebra-row border-t border-border-subtle hover:bg-surface-container-high/50 transition-colors">
                <td className="px-[24px] py-[10px] font-semibold text-on-surface">{row.year}</td>
                <td className="px-[24px] py-[10px] text-right text-on-surface-variant font-mono-data">{projectedYear(row.year)}</td>
                <td className="px-[24px] py-[10px] text-right font-mono-data text-success-emerald">+{cur.format(row.annualSavings)}</td>
                <td className="px-[24px] py-[10px] text-right font-semibold font-mono-data text-primary">{cur.format(row.cumulative)}</td>
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
