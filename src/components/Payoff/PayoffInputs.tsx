import type { PayoffInputs } from '../../lib/calculator';
import { computeMonthlyPayment } from '../../lib/calculator';
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

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Field({ id, label, value, onChange, prefix, suffix, step = 1, min = 0, tooltip, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
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

function pct(v: number): number {
  return parseFloat((v * 100).toFixed(4));
}

export function PayoffInputs({ inputs, onChange, errors }: Props) {
  const monthlyPI = computeMonthlyPayment(inputs.loanAmount, inputs.annualRate, inputs.loanTermYears);

  return (
    <div data-print="hide" className="flex flex-col gap-4">

      {/* Parameters card */}
      <div className="bg-surface-container-low border border-border-subtle rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>tune</span>
          <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wide">Parameters</h2>
        </div>

        {/* Loan amount */}
        <Field
          id="payoff-loanAmount"
          label="Current balance"
          value={inputs.loanAmount}
          onChange={v => onChange('loanAmount', v)}
          prefix="$"
          step={5000}
          min={1000}
          tooltip="The remaining balance on your mortgage: not the original loan amount."
          error={errors.loanAmount}
        />

        {/* 2-col: Rate + Term */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="payoff-annualRate"
            label="Interest rate"
            value={pct(inputs.annualRate)}
            onChange={v => onChange('annualRate', v / 100)}
            suffix="%"
            step={0.125}
            tooltip="The fixed annual interest rate on your mortgage."
            error={errors.annualRate}
          />
          <Field
            id="payoff-loanTermYears"
            label="Remaining term"
            value={inputs.loanTermYears}
            onChange={v => onChange('loanTermYears', Math.round(v))}
            suffix="yrs"
            min={1}
            tooltip="The number of years left on your loan."
            error={errors.loanTermYears}
          />
        </div>

        {/* Monthly P&I read-only */}
        <div className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">Monthly P&I</span>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container border border-border-subtle">
            <span className="text-label-sm text-on-surface-variant">Calculated</span>
            <span className="text-body-sm font-bold tabular-nums text-primary">{cur.format(monthlyPI)}</span>
          </div>
        </div>

        {/* Extra payment: slider + number input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label htmlFor="payoff-extraMonthly" className="text-label-sm text-on-surface-variant">Extra monthly payment</label>
            <InfoTooltip text="An additional amount paid toward principal each month on top of your regular payment." />
          </div>
          <div className="p-md rounded-lg bg-surface-container-high border border-primary-accent/20 flex flex-col gap-3">
            <input
              type="range"
              min={0}
              max={5000}
              step={50}
              value={inputs.extraMonthly}
              onChange={e => onChange('extraMonthly', parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant text-body-sm select-none">$</span>
              <input
                id="payoff-extraMonthly"
                type="number"
                value={inputs.extraMonthly}
                min={0}
                step={50}
                onChange={e => onChange('extraMonthly', parseFloat(e.target.value) || 0)}
                className="flex-1 min-w-0 bg-transparent outline-none text-body-sm tabular-nums text-on-surface border-b border-border-subtle pb-0.5 focus:border-primary-accent transition-colors"
              />
              <span className="text-label-sm text-on-surface-variant">/mo</span>
            </div>
            {errors.extraMonthly && <p className="text-label-sm text-error">{errors.extraMonthly}</p>}
          </div>
        </div>

        {/* Lump sum */}
        <Field
          id="payoff-lumpSum"
          label="One-time lump sum"
          value={inputs.lumpSum}
          onChange={v => onChange('lumpSum', v)}
          prefix="$"
          step={1000}
          tooltip="A one-time extra payment applied to your principal now. A bonus, inheritance, or any windfall."
          error={errors.lumpSum}
        />
      </div>

    </div>
  );
}
