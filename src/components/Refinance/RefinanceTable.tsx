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
                    Balance (current)
                    <InfoTooltip text="Remaining mortgage balance on your current loan at year end." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Balance (refinanced)
                    <InfoTooltip text="Remaining mortgage balance on the new refinanced loan at year end." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Cum. interest (current)
                    <InfoTooltip text="Total interest paid to date on the current loan." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Cum. interest (refinanced)
                    <InfoTooltip text="Total interest paid to date on the refinanced loan." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Cumulative savings
                    <InfoTooltip text="Interest saved by refinancing minus closing costs. Positive means you've recouped the closing costs." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-mono-data">
              {result.years.map(y => (
                <tr key={y.year} className="zebra-row border-b border-border-subtle/30">
                  <td className="px-4 py-2.5 font-semibold text-on-surface">{y.year}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface">{y.balanceCurrent === 0 ? '—' : cur.format(y.balanceCurrent)}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface">{y.balanceRefinanced === 0 ? '—' : cur.format(y.balanceRefinanced)}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(y.cumulativeInterestCurrent)}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(y.cumulativeInterestRefinanced)}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${y.cumulativeSavings >= 0 ? 'text-success-emerald' : 'text-error'}`}>
                    {y.cumulativeSavings >= 0
                      ? cur.format(y.cumulativeSavings)
                      : `-${cur.format(Math.abs(y.cumulativeSavings))}`}
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
