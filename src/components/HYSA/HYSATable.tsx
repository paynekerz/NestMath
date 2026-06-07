import { useState } from 'react';
import type { HYSAResult } from '../../lib/hysa';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: HYSAResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function HYSATable({ result }: Props) {
  const [open, setOpen] = useState(false);

  if (result.years.length === 0) return null;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        data-print="hide"
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
                    Balance (HYSA)
                    <InfoTooltip text="Your total savings balance at year end in the high-yield savings account." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Balance (Traditional)
                    <InfoTooltip text="Your total savings balance at year end in a regular savings account at the national average APY." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Interest (HYSA)
                    <InfoTooltip text="Total interest earned so far in the HYSA — balance minus all contributions made through this year." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Interest (Traditional)
                    <InfoTooltip text="Total interest earned so far in a traditional savings account through this year." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Delta
                    <InfoTooltip text="The extra amount you have by choosing the HYSA over a traditional account through this year." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-mono-data">
              {result.years.map(y => (
                <tr key={y.year} className="zebra-row border-b border-border-subtle/30">
                  <td className="px-4 py-2.5 font-semibold text-on-surface">{y.year}</td>
                  <td className="px-4 py-2.5 text-right text-primary">{cur.format(y.balanceHYSA)}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface-variant">{cur.format(y.balanceTraditional)}</td>
                  <td className="px-4 py-2.5 text-right text-success-emerald">{cur.format(y.interestHYSA)}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface-variant">{cur.format(y.interestTraditional)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-success-emerald">{cur.format(y.delta)}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
