import { useState } from 'react';
import type { SavingsPlannerResult } from '../../lib/savings';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: SavingsPlannerResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function SavingsPlannerTable({ result }: Props) {
  const [open, setOpen] = useState(false);

  if (result.months.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-border transition-colors rounded-lg"
      >
        <span>Month-by-Month Breakdown</span>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>
      <div
        data-print="table-container"
        className="overflow-x-auto"
        style={open ? undefined : { display: 'none' }}
      >
        <table data-print="table" className="w-full text-xs tabular-nums border-t border-border">
          <thead>
            <tr className="text-muted">
              <th className="px-4 py-2 text-left font-medium">Month</th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Monthly contribution
                  <InfoTooltip text="How much you added to savings this month." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Return earned
                  <InfoTooltip text="Interest or investment gains on your existing balance this month." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Cumulative savings
                  <InfoTooltip text="Total savings balance at the end of this month." />
                </span>
              </th>
              <th className="px-4 py-2 text-right font-medium">
                <span className="inline-flex items-center justify-end gap-1.5">
                  Remaining to goal
                  <InfoTooltip text="How much more you need to reach your cash-to-close target." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {result.months.map(m => (
              <tr key={m.month} className="border-t border-border hover:bg-border/30 transition-colors">
                <td className="px-4 py-1.5 text-muted">{m.month}</td>
                <td className="px-4 py-1.5 text-right">{cur.format(m.contribution)}</td>
                <td className="px-4 py-1.5 text-right text-[#4ade80]">
                  {m.returnEarned >= 0 ? '+' : ''}{cur.format(m.returnEarned)}
                </td>
                <td className="px-4 py-1.5 text-right font-medium">{cur.format(m.cumulativeSavings)}</td>
                <td className={`px-4 py-1.5 text-right ${m.remainingToGoal === 0 ? 'text-[#4ade80]' : 'text-muted'}`}>
                  {m.remainingToGoal === 0 ? 'Goal reached' : cur.format(m.remainingToGoal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
