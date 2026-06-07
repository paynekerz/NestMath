import { useState } from 'react';
import type { CreditCardPayoffResult } from '../../lib/credit-card-payoff';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: CreditCardPayoffResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function CreditCardPayoffTable({ result }: Props) {
  const [open, setOpen] = useState(false);

  if (result.months.length === 0) return null;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        data-print="hide"
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-container-high transition-colors"
      >
        <h3 className="text-label-md font-semibold text-on-surface">Month-by-Month Breakdown</h3>
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      <div className={`overflow-x-auto border-t border-border-subtle${open ? '' : ' hidden'}`} data-print="table-container">
          <table className="w-full text-left" data-print="table">
            <thead>
              <tr className="text-on-surface-variant text-label-sm uppercase tracking-wide bg-surface-container">
                <th className="px-4 py-2.5 font-semibold">Month</th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Payment
                    <InfoTooltip text="The amount paid this month (may be smaller in the final month)." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Principal
                    <InfoTooltip text="The portion of the payment that reduces your balance." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Interest
                    <InfoTooltip text="The interest charged this month on your remaining balance." />
                  </span>
                </th>
                <th className="px-4 py-2.5 font-semibold text-right">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Remaining Balance
                    <InfoTooltip text="Your balance at the end of the month after the payment is applied." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-body-sm font-mono-data">
              {result.months.map(m => (
                <tr key={m.month} className="zebra-row border-b border-border-subtle/30">
                  <td className="px-4 py-2.5 font-semibold text-on-surface">{m.month}</td>
                  <td className="px-4 py-2.5 text-right text-on-surface">{cur.format(m.payment)}</td>
                  <td className="px-4 py-2.5 text-right text-primary">{cur.format(m.principal)}</td>
                  <td className="px-4 py-2.5 text-right text-error">{cur.format(m.interest)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-on-surface">{cur.format(m.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
