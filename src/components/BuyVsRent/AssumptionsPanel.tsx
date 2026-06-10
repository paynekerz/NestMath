import { useState } from 'react';
import type { Assumptions } from '../../lib/calculator';
import type { ValidationErrors } from '../../lib/validation';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  assumptions: Assumptions;
  onAssumptionsChange: (key: keyof Assumptions, value: number) => void;
  errors?: ValidationErrors;
}

interface FieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
  error?: string;
}

function Field({ id, label, value, onChange, suffix, step = 1, min = 0, max, tooltip, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-label-sm text-on-surface-variant">{label}</label>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className={`flex items-center gap-1 rounded-lg border bg-surface-container-low px-md py-sm focus-within:border-primary-accent focus-within:ring-1 focus-within:ring-primary-accent transition-all outline-none ${error ? 'border-error' : 'border-border-subtle'}`}>
        <input
          id={id}
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 min-w-0 bg-transparent outline-none text-body-sm text-right font-mono-data text-on-surface"
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

export function AssumptionsPanel({ assumptions, onAssumptionsChange, errors = {} }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-lg py-sm text-body-sm font-medium hover:bg-surface-container-high transition-colors rounded-xl"
      >
        <span className="text-on-surface">Advanced Assumptions</span>
        <span className="text-on-surface-variant text-label-sm">{open ? '▲' : '▼'}</span>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="grid gap-3 px-lg pb-lg grid-cols-1 sm:grid-cols-3 border-t border-border-subtle pt-md">
            <Field
              id="assump-appreciation"
              label="Home appreciation"
              value={pct(assumptions.appreciation)}
              onChange={v => onAssumptionsChange('appreciation', v / 100)}
              suffix="% / yr"
              step={0.5}
              tooltip="How much the home's value is expected to grow each year. Homes have historically gone up about 3% per year on average."
              error={errors['appreciation']}
            />
            <Field
              id="assump-marginalTaxRate"
              label="Marginal tax rate"
              value={pct(assumptions.marginalTaxRate)}
              onChange={v => onAssumptionsChange('marginalTaxRate', v / 100)}
              suffix="%"
              step={1}
              tooltip="The percentage of your income that goes to federal taxes. Homeowners can sometimes reduce their tax bill by deducting mortgage interest."
              error={errors['marginalTaxRate']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
