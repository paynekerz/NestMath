import { useState } from 'react';
import type { StudentLoanPayoffResult } from '../../lib/student-loan-payoff';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: StudentLoanPayoffResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function StudentLoanPayoffTable({ result }: Props) {
  const [open, setOpen] = useState(false);
  const hasExtra = result.monthsSaved > 0;

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

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="overflow-x-auto border-t border-border-subtle" data-print="table-container">
        <table className="w-full text-left" data-print="table">
          <thead>
            <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide bg-surface-container">
              <th className="px-4 py-2.5 font-semibold">Year</th>
              <th className="px-4 py-2.5 font-semibold text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Balance (Standard)
                  <InfoTooltip text="Remaining loan balance at end of year with standard payment only." />
                </span>
              </th>
              {hasExtra && (
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Balance (Accelerated)
                    <InfoTooltip text="Remaining loan balance at end of year with extra monthly payment applied." />
                  </span>
                </th>
              )}
              <th className="px-4 py-2.5 font-semibold text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Cumul. Interest (Std)
                  <InfoTooltip text="Total interest paid from the start of the loan through this year on the standard plan." />
                </span>
              </th>
              {hasExtra && (
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Cumul. Interest (Accel)
                    <InfoTooltip text="Total interest paid from the start of the loan through this year on the accelerated plan." />
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="text-body-sm font-mono-data">
            {result.years.map(y => (
              <tr key={y.year} className="zebra-row border-b border-border-subtle/30">
                <td className="px-4 py-2.5 font-semibold text-on-surface">{y.year}</td>
                <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(y.balanceStandard)}</td>
                {hasExtra && (
                  <td className="px-4 py-2.5 text-right text-primary">{cur.format(y.balanceAccelerated)}</td>
                )}
                <td className="px-4 py-2.5 text-right text-error">{cur.format(y.cumulativeInterestStandard)}</td>
                {hasExtra && (
                  <td className="px-4 py-2.5 text-right text-success-emerald">{cur.format(y.cumulativeInterestAccelerated)}</td>
                )}
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
