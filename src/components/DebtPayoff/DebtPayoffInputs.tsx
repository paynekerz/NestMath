import type { DebtItem } from '../../lib/debt-payoff';
import type { DebtPayoffErrors } from '../../lib/validation';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  debts: DebtItem[];
  extraBudget: number;
  onDebtChange: (index: number, key: keyof DebtItem, value: string | number) => void;
  onAddDebt: () => void;
  onRemoveDebt: (index: number) => void;
  onExtraChange: (value: number) => void;
  errors: DebtPayoffErrors;
}

interface FieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  tooltip: string;
  error?: string;
}

function Field({ id, label, value, onChange, prefix, suffix, step = 1, min = 0, tooltip, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className="text-label-sm text-on-surface-variant">{label}</label>
        <InfoTooltip text={tooltip} />
      </div>
      <div className={`flex items-center gap-1 rounded-lg border bg-surface-container px-3 py-2 focus-within:border-primary-accent transition-colors ${error ? 'border-error/70' : 'border-border-subtle'}`}>
        {prefix && <span className="text-on-surface-variant text-body-sm select-none">{prefix}</span>}
        <input
          id={id}
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 min-w-0 bg-transparent outline-none text-body-sm text-right tabular-nums text-on-surface"
        />
        {suffix && <span className="text-on-surface-variant text-body-sm select-none">{suffix}</span>}
      </div>
      {error && <p className="text-label-sm text-error">{error}</p>}
    </div>
  );
}

function pct(v: number) { return parseFloat((v * 100).toFixed(4)); }

export function DebtPayoffInputs({ debts, extraBudget, onDebtChange, onAddDebt, onRemoveDebt, onExtraChange, errors }: Props) {
  return (
    <div data-print="hide" className="flex flex-col gap-4">

      {/* Debt rows */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center justify-between bg-surface-container/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>credit_score</span>
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">YOUR DEBTS</span>
          </div>
          {debts.length < 10 && (
            <button
              type="button"
              onClick={onAddDebt}
              className="flex items-center gap-1 text-label-sm text-primary hover:text-primary/80 transition-colors font-semibold"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              Add Debt
            </button>
          )}
        </div>

        <div className="divide-y divide-border-subtle/60">
          {debts.map((debt, i) => {
            const debtErrors = errors.debts[i] ?? {};
            return (
              <div key={debt.id} className="p-lg flex flex-col gap-4">
                {/* Name row + remove button */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <label htmlFor={`debt-name-${i}`} className="text-label-sm text-on-surface-variant">Debt name</label>
                    <input
                      id={`debt-name-${i}`}
                      type="text"
                      value={debt.name}
                      onChange={e => onDebtChange(i, 'name', e.target.value)}
                      placeholder="e.g. Visa, Car Loan…"
                      className={`rounded-lg border bg-surface-container px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary-accent transition-colors ${debtErrors.name ? 'border-error/70' : 'border-border-subtle'}`}
                    />
                    {debtErrors.name && <p className="text-label-sm text-error">{debtErrors.name}</p>}
                  </div>
                  {debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveDebt(i)}
                      aria-label={`Remove ${debt.name}`}
                      className="mt-6 text-on-surface-variant hover:text-error transition-colors rounded-lg p-1 hover:bg-error/10"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  )}
                </div>

                {/* Three fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field
                    id={`debt-balance-${i}`}
                    label="Balance"
                    value={debt.balance}
                    onChange={v => onDebtChange(i, 'balance', v)}
                    prefix="$"
                    step={100}
                    tooltip="How much you currently owe on this debt."
                    error={debtErrors.balance}
                  />
                  <Field
                    id={`debt-apr-${i}`}
                    label="APR"
                    value={pct(debt.apr)}
                    onChange={v => onDebtChange(i, 'apr', v / 100)}
                    suffix="%"
                    step={0.1}
                    min={0}
                    tooltip="Annual percentage rate. Higher APR means more interest accrues each month."
                    error={debtErrors.apr}
                  />
                  <Field
                    id={`debt-min-${i}`}
                    label="Min. Payment"
                    value={debt.minPayment}
                    onChange={v => onDebtChange(i, 'minPayment', v)}
                    prefix="$"
                    step={10}
                    min={1}
                    tooltip="The minimum required payment per month on this debt."
                    error={debtErrors.minPayment}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra budget panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>payments</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">EXTRA BUDGET</span>
        </div>
        <div className="p-lg">
          <Field
            id="extra-budget"
            label="Extra monthly payment"
            value={extraBudget}
            onChange={onExtraChange}
            prefix="$"
            step={50}
            min={0}
            tooltip="How much extra you can put toward debt each month, above all your minimum payments combined. This extra rolls to the next debt once one is paid off."
            error={errors.extraBudget}
          />
          <p className="text-label-sm text-on-surface-variant mt-3">
            Total monthly commitment:{' '}
            <span className="font-semibold text-on-surface font-mono-data">
              ${(debts.reduce((s, d) => s + d.minPayment, 0) + extraBudget).toLocaleString()}
            </span>
            {' '}({debts.length} debt{debts.length !== 1 ? 's' : ''} + extra)
          </p>
        </div>
      </div>

    </div>
  );
}
