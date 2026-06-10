import { useState } from 'react';
import type { RenovationROIResult } from '../../lib/renovation-roi';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RenovationROIResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function RenovationROITable({ result }: Props) {
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

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="overflow-x-auto border-t border-border-subtle" data-print="table-container">
          <table className="w-full text-left" data-print="table">
            <thead>
              <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Year</th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Home Value (w/ Reno)
                    <InfoTooltip text="What the renovated home is worth after appreciation is applied for each year." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Reno Gain
                    <InfoTooltip text="The extra value the renovation adds at sale, after it compounds with annual home appreciation." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Reno Net Gain
                    <InfoTooltip text="Renovation gain minus the original renovation cost. Positive means the renovation has paid off." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Investment Value
                    <InfoTooltip text="What the renovation money would be worth if invested in the market at the specified annual return rate." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Delta
                    <InfoTooltip text="Renovation net gain minus investment net gain. Positive means renovation is ahead that year; negative means investing is ahead." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-mono-data">
              {result.years.map(y => (
                <tr key={y.year} className="zebra-row border-b border-border-subtle/30">
                  <td className="px-4 py-2.5 font-semibold text-on-surface">{y.year}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(y.homeValueWithReno)}</td>
                  <td className="px-4 py-2.5 text-right text-primary">{cur.format(y.renovationGain)}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${y.renovationNetGain >= 0 ? 'text-primary' : 'text-error'}`}>
                    {y.renovationNetGain >= 0
                      ? `+${cur.format(y.renovationNetGain)}`
                      : cur.format(y.renovationNetGain)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(y.investmentValue)}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${y.delta >= 0 ? 'text-primary' : 'text-success-emerald'}`}>
                    {y.delta >= 0
                      ? `+${cur.format(y.delta)}`
                      : cur.format(y.delta)}
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
