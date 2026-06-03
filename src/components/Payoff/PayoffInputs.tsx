import type { PayoffInputs } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: PayoffInputs;
  onChange: (key: keyof PayoffInputs, value: number) => void;
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

export function PayoffInputs({ inputs, onChange, errors }: Props) {
  return (
    <div data-print="hide" className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Loan Details</h2>
        <Field
          id="payoff-loanAmount"
          label="Loan amount"
          value={inputs.loanAmount}
          onChange={v => onChange('loanAmount', v)}
          prefix="$"
          step={5000}
          min={1000}
          tooltip="The original amount you borrowed — your home price minus the down payment."
          error={errors.loanAmount}
        />
        <Field
          id="payoff-annualRate"
          label="Annual interest rate"
          value={pct(inputs.annualRate)}
          onChange={v => onChange('annualRate', v / 100)}
          suffix="%"
          step={0.125}
          tooltip="The fixed annual interest rate on your mortgage. This is the rate in your loan documents, not the APR."
          error={errors.annualRate}
        />
        <Field
          id="payoff-loanTermYears"
          label="Loan term"
          value={inputs.loanTermYears}
          onChange={v => onChange('loanTermYears', Math.round(v))}
          suffix="yrs"
          min={1}
          tooltip="The original number of years for the loan. Most mortgages are 30 or 15 years."
          error={errors.loanTermYears}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Extra Payments</h2>
        <Field
          id="payoff-extraMonthly"
          label="Extra monthly payment"
          value={inputs.extraMonthly}
          onChange={v => onChange('extraMonthly', v)}
          prefix="$"
          step={50}
          tooltip="An additional amount you pay toward principal each month on top of your regular mortgage payment."
          error={errors.extraMonthly}
        />
        <Field
          id="payoff-lumpSum"
          label="One-time lump sum"
          value={inputs.lumpSum}
          onChange={v => onChange('lumpSum', v)}
          prefix="$"
          step={1000}
          tooltip="A one-time extra payment applied to your principal at the start of the loan. Can be a bonus, inheritance, or any windfall."
          error={errors.lumpSum}
        />
      </div>
    </div>
  );
}
