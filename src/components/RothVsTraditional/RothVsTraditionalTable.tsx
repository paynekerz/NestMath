import { useState } from 'react';
import type { RothVsTraditionalResult } from '../../lib/roth-vs-traditional';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RothVsTraditionalResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function RothVsTraditionalTable({ result }: Props) {
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
                  Roth Balance
                  <InfoTooltip text="Your Roth IRA balance at year end. This is your full after-tax value — no taxes owed at withdrawal." />
                </span>
              </th>
              <th className="px-4 py-2.5 font-semibold text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Trad. Gross Balance
                  <InfoTooltip text="Your Traditional IRA gross balance before any retirement taxes. Same as Roth gross — both receive the same contribution and earn the same return." />
                </span>
              </th>
              <th className="px-4 py-2.5 font-semibold text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Trad. After-Tax Value
                  <InfoTooltip text="Traditional gross balance minus estimated taxes at your expected retirement rate. This is what you'd actually keep after paying taxes on withdrawal." />
                </span>
              </th>
              <th className="px-4 py-2.5 font-semibold text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Delta
                  <InfoTooltip text="Roth balance minus Traditional after-tax value. Positive means Roth is ahead; this gap grows as the tax owed on the Traditional account compounds." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="text-body-sm font-mono-data">
            {result.years.map(y => (
              <tr key={y.year} className="zebra-row border-b border-border-subtle/30">
                <td className="px-4 py-2.5 font-semibold text-on-surface">{y.year}</td>
                <td className="px-4 py-2.5 text-right text-primary">{cur.format(y.rothBalance)}</td>
                <td className="px-4 py-2.5 text-right text-on-surface-variant">{cur.format(y.tradGrossBalance)}</td>
                <td className="px-4 py-2.5 text-right text-success-emerald">{cur.format(y.tradAfterTaxValue)}</td>
                <td className="px-4 py-2.5 text-right font-semibold" style={{ color: y.delta >= 0 ? 'oklch(55% 0.18 250)' : 'oklch(55% 0.15 150)' }}>
                  {y.delta >= 0 ? '+' : ''}{cur.format(y.delta)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
