import { useState } from 'react';
import type { YearResult } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  years: YearResult[];
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function YearTable({ years }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-lg py-sm text-body-sm font-medium hover:bg-surface-container-high transition-colors rounded-xl"
      >
        <span className="text-on-surface">Year-by-Year Breakdown</span>
        <span className="text-on-surface-variant text-label-sm">{open ? '▲' : '▼'}</span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div data-print="table-container" className="overflow-x-auto">
          <table data-print="table" className="w-full text-body-sm font-mono-data border-t border-border-subtle">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                <th className="px-lg py-xs text-left font-semibold">Year</th>
                <th className="px-lg py-xs text-right font-semibold">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Home Value
                    <InfoTooltip text="The estimated market value of the home in this year, based on the appreciation rate you set." />
                  </span>
                </th>
                <th className="px-lg py-xs text-right font-semibold">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Equity
                    <InfoTooltip text="How much of the home you actually own. It grows as you pay off your loan and as the home rises in value." />
                  </span>
                </th>
                <th className="px-lg py-xs text-right font-semibold">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Buy Net Worth
                    <InfoTooltip text="Home value minus remaining loan balance." />
                  </span>
                </th>
                <th className="px-lg py-xs text-right font-semibold">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Rent Net Worth
                    <InfoTooltip text="Total value of savings and investments, compounded." />
                  </span>
                </th>
                <th className="px-lg py-xs text-right font-semibold">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Buy Cost/yr
                    <InfoTooltip text="Total spent on the home this year: mortgage, taxes, insurance, HOA, and maintenance." />
                  </span>
                </th>
                <th className="px-lg py-xs text-right font-semibold">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Rent Cost/yr
                    <InfoTooltip text="Total spent on renting this year: monthly rent plus renter's insurance." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {years.map((yr, i) => (
                <tr
                  key={yr.year}
                  className={`border-t border-border-subtle hover:bg-surface-container-high/30 transition-colors ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
                >
                  <td className="px-lg py-1.5 font-semibold text-on-surface">{yr.year}</td>
                  <td className="px-lg py-1.5 text-right text-on-surface">{fmt.format(yr.homeValue)}</td>
                  <td className="px-lg py-1.5 text-right text-primary">{fmt.format(yr.equity)}</td>
                  <td className={`px-lg py-1.5 text-right font-medium ${yr.buyNetWorth > yr.rentNetWorth ? 'text-primary-accent' : 'text-on-surface'}`}>
                    {fmt.format(yr.buyNetWorth)}
                  </td>
                  <td className={`px-lg py-1.5 text-right font-medium ${yr.rentNetWorth >= yr.buyNetWorth ? 'text-success-emerald' : 'text-on-surface'}`}>
                    {fmt.format(yr.rentNetWorth)}
                  </td>
                  <td className="px-lg py-1.5 text-right text-on-surface-variant">{fmt.format(yr.annualBuyCost)}</td>
                  <td className="px-lg py-1.5 text-right text-on-surface-variant">{fmt.format(yr.annualRentCost)}</td>
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
