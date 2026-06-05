import type { TaxEstimate } from '../../lib/budget';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface Props {
  annualIncome: number;
  onChange: (v: number) => void;
  tax: TaxEstimate;
}

export function IncomePanel({ annualIncome, onChange, tax }: Props) {
  return (
    <div className="bg-surface-elevated border border-border-subtle rounded-xl p-[24px] flex flex-col gap-[16px]">
      <div className="flex items-center gap-[10px] pb-[12px] border-b border-border-subtle">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-container/20">
          <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">payments</span>
        </div>
        <h2 className="text-label-md font-semibold text-primary uppercase tracking-widest">Income</h2>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="budget-income" className="text-label-sm text-on-surface-variant">
          Annual pre-tax income
        </label>
        <div className="flex items-center gap-[4px] rounded-lg border border-border-subtle bg-surface-container-low px-[12px] py-[8px] focus-within:border-primary-accent focus-within:ring-1 focus-within:ring-primary-accent transition-all">
          <span className="text-on-surface-variant text-label-sm select-none">$</span>
          <input
            id="budget-income"
            type="number"
            value={annualIncome}
            step={1000}
            min={0}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            className="flex-1 min-w-0 bg-transparent outline-none text-body-sm font-mono-data text-right text-on-surface"
          />
          <span className="text-on-surface-variant text-label-sm select-none">/yr</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[16px]">
        <div className="flex flex-col gap-[4px]">
          <span className="text-label-sm text-on-surface-variant">Est. federal tax</span>
          <span className="text-body-sm font-semibold font-mono-data text-on-surface">{cur.format(tax.federalTax)}</span>
        </div>
        <div className="flex flex-col gap-[4px]">
          <span className="text-label-sm text-on-surface-variant">Effective rate</span>
          <span className="text-body-sm font-semibold font-mono-data text-on-surface">{pct.format(tax.effectiveRate)}</span>
        </div>
        <div className="flex flex-col gap-[4px]">
          <span className="text-label-sm text-on-surface-variant">Annual take-home</span>
          <span className="text-body-sm font-semibold font-mono-data text-primary">{cur.format(tax.annualTakeHome)}</span>
        </div>
        <div className="flex flex-col gap-[4px]">
          <span className="text-label-sm text-on-surface-variant">Monthly take-home</span>
          <span className="text-body-sm font-semibold font-mono-data text-primary">{cur.format(tax.monthlyTakeHome)}</span>
        </div>
      </div>

      <p className="text-label-sm text-on-surface-variant/50">
        Federal income tax estimate only — 2024 brackets, single filer, standard deduction. State taxes, FICA, and benefits not included.
      </p>
    </div>
  );
}
