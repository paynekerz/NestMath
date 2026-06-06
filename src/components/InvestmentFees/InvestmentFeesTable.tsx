import { useState } from 'react';
import type { InvestmentFeesResult } from '../../lib/investment-fees';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: InvestmentFeesResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function InvestmentFeesTable({ result }: Props) {
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
                    Portfolio (Current Fees)
                    <InfoTooltip text="Your portfolio value at the end of this year with the higher expense ratio applied annually." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Portfolio (Low-Cost)
                    <InfoTooltip text="Your portfolio value at the end of this year with the low-cost expense ratio applied annually." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Annual Fee Drag
                    <InfoTooltip text="The additional drag added this year alone — the gap that grew between the two portfolios during this year." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Cumulative Fee Drag
                    <InfoTooltip text="Total dollars lost to the higher expense ratio from year 1 through this year." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-mono-data">
              {result.years.map(y => (
                <tr key={y.year} className="zebra-row border-b border-border-subtle/30">
                  <td className="px-4 py-2.5 font-semibold text-on-surface">{y.year}</td>
                  <td className="px-4 py-2.5 text-right text-[#f59e0b]">{cur.format(y.portfolioCurrentFees)}</td>
                  <td className="px-4 py-2.5 text-right text-success-emerald">{cur.format(y.portfolioLowCost)}</td>
                  <td className="px-4 py-2.5 text-right text-error">{cur.format(y.annualFeeDrag)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-error">{cur.format(y.cumulativeFeeDrag)}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
