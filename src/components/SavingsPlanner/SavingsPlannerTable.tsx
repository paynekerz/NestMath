import type { SavingsPlannerResult } from '../../lib/savings';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: SavingsPlannerResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function SavingsPlannerTable({ result }: Props) {
  if (result.months.length === 0) return null;

  return (
    <div className="overflow-x-auto border-t border-border-subtle" data-print="table-container">
      <table className="w-full text-left" data-print="table">
        <thead>
          <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide">
            <th className="px-4 py-2.5 font-semibold">Month</th>
            <th className="px-4 py-2.5 font-semibold text-right">
              <span className="inline-flex items-center justify-end gap-1.5">
                Contribution
                <InfoTooltip text="How much you added to savings this month." />
              </span>
            </th>
            <th className="px-4 py-2.5 font-semibold text-right">
              <span className="inline-flex items-center justify-end gap-1.5">
                Return Earned
                <InfoTooltip text="Interest or investment gains on your existing balance this month." />
              </span>
            </th>
            <th className="px-4 py-2.5 font-semibold text-right">
              <span className="inline-flex items-center justify-end gap-1.5">
                Cumulative Savings
                <InfoTooltip text="Total savings balance at the end of this month." />
              </span>
            </th>
            <th className="px-4 py-2.5 font-semibold text-right">
              <span className="inline-flex items-center justify-end gap-1.5">
                Remaining to Goal
                <InfoTooltip text="How much more you need to reach your cash-to-close target." />
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="text-body-sm font-mono-data">
          {result.months.map(m => (
            <tr key={m.month} className="zebra-row border-b border-border-subtle/30">
              <td className="px-4 py-2 font-semibold text-on-surface">{m.month}</td>
              <td className="px-4 py-2 text-right text-on-surface">{cur.format(m.contribution)}</td>
              <td className="px-4 py-2 text-right text-success-emerald">
                {m.returnEarned >= 0 ? '+' : ''}{cur.format(m.returnEarned)}
              </td>
              <td className="px-4 py-2 text-right text-on-surface">{cur.format(m.cumulativeSavings)}</td>
              <td className={`px-4 py-2 text-right ${m.remainingToGoal === 0 ? 'text-success-emerald' : 'text-on-surface-variant'}`}>
                {m.remainingToGoal === 0 ? 'Goal reached' : cur.format(m.remainingToGoal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
