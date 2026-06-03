import type { SavingsPlannerInputs } from '../../lib/savings';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: SavingsPlannerInputs;
  onChange: (key: keyof SavingsPlannerInputs, value: number) => void;
  errors: ValidationErrors;
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-xs text-muted">{label}</label>
        <InfoTooltip text={tooltip} />
      </div>
      <div className={`flex items-center gap-1 rounded border bg-background px-2.5 py-1.5 focus-within:border-accent transition-colors ${error ? 'border-red-500/70' : 'border-border'}`}>
        {prefix && <span className="text-muted text-sm select-none">{prefix}</span>}
        <input
          id={id}
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-right tabular-nums"
        />
        {suffix && <span className="text-muted text-sm select-none">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function pct(v: number): number {
  return parseFloat((v * 100).toFixed(4));
}

export function SavingsPlannerInputs({ inputs, onChange, errors }: Props) {
  return (
    <div data-print="hide" className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Target Purchase</h2>
        <Field
          id="sp-targetHomePrice"
          label="Target home price"
          value={inputs.targetHomePrice}
          onChange={v => onChange('targetHomePrice', v)}
          prefix="$"
          step={5000}
          min={10000}
          tooltip="The price of the home you want to buy."
          error={errors.targetHomePrice}
        />
        <Field
          id="sp-downPaymentPct"
          label="Down payment"
          value={pct(inputs.downPaymentPct)}
          onChange={v => onChange('downPaymentPct', v / 100)}
          suffix="%"
          step={1}
          tooltip="The percentage of the home price you pay upfront. A higher down payment means a smaller loan and lower monthly payments."
          error={errors.downPaymentPct}
        />
        <Field
          id="sp-closingCostsPct"
          label="Closing costs"
          value={pct(inputs.closingCostsPct)}
          onChange={v => onChange('closingCostsPct', v / 100)}
          suffix="%"
          step={0.25}
          tooltip="Extra fees you pay when you finalize the home purchase — paperwork, bank fees, title checks. Usually 2–5% of the purchase price."
          error={errors.closingCostsPct}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Your Savings</h2>
        <Field
          id="sp-currentSavings"
          label="Current savings"
          value={inputs.currentSavings}
          onChange={v => onChange('currentSavings', v)}
          prefix="$"
          step={500}
          tooltip="How much you've already saved toward your down payment and closing costs."
          error={errors.currentSavings}
        />
        <Field
          id="sp-monthlySavings"
          label="Monthly savings"
          value={inputs.monthlySavings}
          onChange={v => onChange('monthlySavings', v)}
          prefix="$"
          step={50}
          min={1}
          tooltip="How much you add to your savings each month."
          error={errors.monthlySavings}
        />
        <Field
          id="sp-annualReturn"
          label="Annual return on savings"
          value={pct(inputs.annualReturn)}
          onChange={v => onChange('annualReturn', v / 100)}
          suffix="%"
          step={0.25}
          min={-10}
          tooltip="The yearly return on your savings. Use 4–5% for a high-yield savings account, or 7% if you plan to invest in index funds. Set to 0 for a regular savings account."
          error={errors.annualReturn}
        />
      </div>
    </div>
  );
}
