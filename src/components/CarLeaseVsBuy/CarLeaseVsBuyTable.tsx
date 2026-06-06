import { useState } from 'react';
import type { CarLeaseVsBuyResult } from '../../lib/car-lease-vs-buy';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: CarLeaseVsBuyResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function CarLeaseVsBuyTable({ result }: Props) {
  const [open, setOpen] = useState(false);

  if (result.years.length === 0) return null;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-container-high transition-colors"
      >
        <h3 className="text-label-md font-semibold text-on-surface">Year-by-Year Breakdown</h3>
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      <div className={`overflow-x-auto border-t border-border-subtle${open ? '' : ' hidden'}`} data-print="table-container">
          <table className="w-full text-left" data-print="table">
            <thead>
              <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide bg-surface-container">
                <th className="px-4 py-2.5 font-semibold">Year</th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Cumul. Cost (Lease)
                    <InfoTooltip text="Total spent on all lease payments and upfront costs to date." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Net Cost (Buy)
                    <InfoTooltip text="Total paid toward buying minus the car's current resale value." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Car Value
                    <InfoTooltip text="Estimated resale value of the car after depreciation." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Invest Portfolio
                    <InfoTooltip text="Value of the investment portfolio from compounding the monthly payment delta." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Net Cost (Invest Path)
                    <InfoTooltip text="More expensive path net cost minus the investment portfolio. The true cost of the invest-the-delta strategy." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-mono-data">
              {result.years.map(y => (
                <tr key={y.year} className="zebra-row border-b border-border-subtle/30">
                  <td className="px-4 py-2.5 font-semibold text-on-surface">{y.year}</td>
                  <td className="px-4 py-2.5 text-right text-[#f59e0b]">{cur.format(y.cumulativeCostLease)}</td>
                  <td className="px-4 py-2.5 text-right text-primary">{cur.format(y.cumulativeNetCostBuy)}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(y.carValueBuy)}</td>
                  <td className="px-4 py-2.5 text-right text-success-emerald">{cur.format(y.investValue)}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${y.netCostInvestPath <= Math.min(y.cumulativeCostLease, y.cumulativeNetCostBuy) ? 'text-success-emerald' : 'text-on-surface'}`}>
                    {cur.format(y.netCostInvestPath)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
