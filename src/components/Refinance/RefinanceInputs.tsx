import type { RefinanceInputs } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: RefinanceInputs;
  onChange: (key: keyof RefinanceInputs, value: number) => void;
  onToggleCostMode: () => void;
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

export function RefinanceInputs({ inputs, onChange, onToggleCostMode, errors }: Props) {
  return (
    <div data-print="hide" className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Current Loan</h2>
        <Field
          id="rf-currentBalance"
          label="Current loan balance"
          value={inputs.currentBalance}
          onChange={v => onChange('currentBalance', v)}
          prefix="$"
          step={1000}
          min={1000}
          tooltip="How much you still owe on your current mortgage."
          error={errors.currentBalance}
        />
        <Field
          id="rf-currentRate"
          label="Current interest rate"
          value={pct(inputs.currentRate)}
          onChange={v => onChange('currentRate', v / 100)}
          suffix="%"
          step={0.125}
          tooltip="The annual interest rate on your current mortgage."
          error={errors.currentRate}
        />
        <Field
          id="rf-remainingTermYears"
          label="Remaining term"
          value={inputs.remainingTermYears}
          onChange={v => onChange('remainingTermYears', v)}
          suffix="yrs"
          step={1}
          min={1}
          tooltip="How many years are left on your current mortgage."
          error={errors.remainingTermYears}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">New Loan</h2>
        <Field
          id="rf-newRate"
          label="New interest rate"
          value={pct(inputs.newRate)}
          onChange={v => onChange('newRate', v / 100)}
          suffix="%"
          step={0.125}
          tooltip="The annual interest rate you'd get on the refinanced loan."
          error={errors.newRate}
        />
        <Field
          id="rf-newTermYears"
          label="New loan term"
          value={inputs.newTermYears}
          onChange={v => onChange('newTermYears', v)}
          suffix="yrs"
          step={1}
          min={1}
          tooltip="The length of the new mortgage. Common choices are 15 or 30 years. A shorter term means higher monthly payments but less total interest."
          error={errors.newTermYears}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="rf-closingCosts" className="text-xs text-muted">Refinance closing costs</label>
              <InfoTooltip text="Fees charged to close the new loan — lender fees, title insurance, appraisal. Usually 2–5% of the loan balance." />
            </div>
            <button
              type="button"
              onClick={onToggleCostMode}
              className="text-xs text-accent hover:underline"
            >
              {inputs.usesFlatClosingCost ? 'Switch to %' : 'Switch to $'}
            </button>
          </div>
          {inputs.usesFlatClosingCost ? (
            <div className={`flex items-center gap-1 rounded border bg-background px-2.5 py-1.5 focus-within:border-accent transition-colors ${errors.closingCostsDollar ? 'border-red-500/70' : 'border-border'}`}>
              <span className="text-muted text-sm select-none">$</span>
              <input
                id="rf-closingCosts"
                type="number"
                value={inputs.closingCostsDollar}
                step={100}
                min={0}
                onChange={e => onChange('closingCostsDollar', parseFloat(e.target.value) || 0)}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-right tabular-nums"
              />
            </div>
          ) : (
            <div className={`flex items-center gap-1 rounded border bg-background px-2.5 py-1.5 focus-within:border-accent transition-colors ${errors.closingCostsPct ? 'border-red-500/70' : 'border-border'}`}>
              <input
                id="rf-closingCosts"
                type="number"
                value={pct(inputs.closingCostsPct)}
                step={0.25}
                min={0}
                onChange={e => onChange('closingCostsPct', (parseFloat(e.target.value) || 0) / 100)}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-right tabular-nums"
              />
              <span className="text-muted text-sm select-none">%</span>
            </div>
          )}
          {(errors.closingCostsDollar || errors.closingCostsPct) && (
            <p className="text-xs text-red-400">{errors.closingCostsDollar || errors.closingCostsPct}</p>
          )}
        </div>
      </div>
    </div>
  );
}
