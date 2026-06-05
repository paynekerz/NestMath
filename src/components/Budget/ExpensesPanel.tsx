import type { Expense } from '../../lib/budget';

interface Props {
  expenses: Expense[];
  onChangeLabel: (id: string, label: string) => void;
  onChangeAmount: (id: string, amount: number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function ExpensesPanel({ expenses, onChangeLabel, onChangeAmount, onAdd, onRemove }: Props) {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-[24px] flex flex-col gap-[16px]">
      <div className="flex items-center gap-[10px] pb-[12px] border-b border-border-subtle">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-container">
          <span className="material-symbols-outlined text-on-secondary-container text-[18px]" aria-hidden="true">receipt_long</span>
        </div>
        <h2 className="text-label-md font-semibold text-primary uppercase tracking-widest">Monthly Expenses</h2>
      </div>

      <div className="flex flex-col gap-[8px]">
        {expenses.map(exp => (
          <div key={exp.id} className="flex items-center gap-[8px]">
            <input
              type="text"
              value={exp.label}
              onChange={e => onChangeLabel(exp.id, e.target.value)}
              placeholder="Expense name"
              className="flex-1 min-w-0 rounded-lg border border-border-subtle bg-surface-container-low px-[12px] py-[8px] text-body-sm text-on-surface outline-none focus:border-primary-accent focus:ring-1 focus:ring-primary-accent transition-all"
            />
            <div className="flex items-center gap-[4px] rounded-lg border border-border-subtle bg-surface-container-low px-[12px] py-[8px] focus-within:border-primary-accent focus-within:ring-1 focus-within:ring-primary-accent transition-all w-32 shrink-0">
              <span className="text-on-surface-variant text-label-sm select-none">$</span>
              <input
                type="number"
                value={exp.amount}
                min={0}
                step={10}
                onChange={e => onChangeAmount(exp.id, parseFloat(e.target.value) || 0)}
                className="flex-1 min-w-0 bg-transparent outline-none text-body-sm font-mono-data text-right text-on-surface"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(exp.id)}
              aria-label={`Remove ${exp.label}`}
              className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-error transition-colors shrink-0"
            >
              remove_circle
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-[6px] text-label-md text-primary hover:brightness-110 transition-colors self-start"
      >
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Add expense
      </button>
    </div>
  );
}
