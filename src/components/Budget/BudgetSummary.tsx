const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface Props {
  monthlyTakeHome: number;
  totalExpenses: number;
  monthlyNet: number;
}

export function BudgetSummary({ monthlyTakeHome, totalExpenses, monthlyNet }: Props) {
  const surplus = monthlyNet >= 0;
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-[24px] flex flex-col gap-[16px]">
      <div className="flex items-center gap-[10px] pb-[12px] border-b border-border-subtle">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-container">
          <span className="material-symbols-outlined text-on-secondary-container text-[18px]" aria-hidden="true">balance</span>
        </div>
        <h2 className="text-label-md font-semibold text-primary uppercase tracking-widest">Monthly Summary</h2>
      </div>

      <div className="flex flex-col gap-[8px]">
        <div className="flex items-center justify-between py-[8px] border-b border-border-subtle">
          <span className="text-body-sm text-on-surface-variant">Take-home</span>
          <span className="text-body-sm font-semibold font-mono-data text-on-surface">{cur.format(monthlyTakeHome)}</span>
        </div>
        <div className="flex items-center justify-between py-[8px] border-b border-border-subtle">
          <span className="text-body-sm text-on-surface-variant">Total expenses</span>
          <span className="text-body-sm font-semibold font-mono-data text-error">− {cur.format(totalExpenses)}</span>
        </div>
        <div className="flex items-center justify-between py-[8px]">
          <span className="text-body-sm font-semibold text-on-surface">Net / month</span>
          <span className={`text-headline-md font-bold font-mono-data ${surplus ? 'text-success-emerald' : 'text-error'}`}>
            {surplus ? '' : '− '}{cur.format(Math.abs(monthlyNet))}
          </span>
        </div>
      </div>

      {surplus ? (
        <div className="rounded-xl bg-success-emerald/5 border border-success-emerald/20 p-[16px] flex flex-col gap-[4px]">
          <span className="text-label-sm text-on-surface-variant">Annual savings</span>
          <span className="text-headline-lg font-bold font-mono-data text-success-emerald">{cur.format(monthlyNet * 12)}</span>
        </div>
      ) : (
        <div className="rounded-xl bg-error/5 border border-error/20 p-[16px]">
          <p className="text-label-sm text-error">
            Expenses exceed take-home by {cur.format(Math.abs(monthlyNet))}/mo. Reduce expenses or increase income to see savings projections.
          </p>
        </div>
      )}
    </div>
  );
}
