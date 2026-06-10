import { useState } from 'react';
import type { RetirementProjectorResult } from '../../lib/retirement-projector';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RetirementProjectorResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function RetirementProjectorTable({ result }: Props) {
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
            <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide bg-surface-container">
              <th className="px-4 py-2.5 font-semibold">Year</th>
              <th className="px-4 py-2.5 font-semibold">Age</th>
              <th className="px-4 py-2.5 font-semibold text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Your Contribution
                  <InfoTooltip text="The amount you contributed to your account this year." />
                </span>
              </th>
              <th className="px-4 py-2.5 font-semibold text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Employer Match
                  <InfoTooltip text="The employer match contribution added this year: free money that compounds alongside your own savings." />
                </span>
              </th>
              <th className="px-4 py-2.5 font-semibold text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Year-End Balance
                  <InfoTooltip text="Your total account balance at the end of this year, including all contributions and investment growth." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="text-body-sm font-mono-data">
            {result.years.map(y => (
              <tr key={y.year} className="zebra-row border-b border-border-subtle/30">
                <td className="px-4 py-2.5 font-semibold text-on-surface">{y.year}</td>
                <td className="px-4 py-2.5 text-on-surface-variant">{y.age}</td>
                <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(y.annualContribution)}</td>
                <td className="px-4 py-2.5 text-right text-success-emerald">{cur.format(y.employerMatch)}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-primary">{cur.format(y.yearEndBalance)}</td>
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
