import type { HYSAInputs } from '../../lib/hysa';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: HYSAInputs;
  onChange: (key: keyof HYSAInputs, value: number) => void;
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

export function HYSAInputs({ inputs, onChange, errors }: Props) {
  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Savings panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>savings</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">SAVINGS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="hysa-initialDeposit"
            label="Initial deposit"
            value={inputs.initialDeposit}
            onChange={v => onChange('initialDeposit', v)}
            prefix="$"
            step={500}
            tooltip="The amount you're starting with: your current savings balance or a lump sum deposit."
            error={errors.initialDeposit}
          />
          <Field
            id="hysa-monthlyContribution"
            label="Monthly contribution"
            value={inputs.monthlyContribution}
            onChange={v => onChange('monthlyContribution', v)}
            prefix="$"
            step={50}
            tooltip="How much you add to the account each month. Regular contributions compound significantly over time."
            error={errors.monthlyContribution}
          />
          <Field
            id="hysa-yearsToModel"
            label="Years to model"
            value={inputs.yearsToModel}
            onChange={v => onChange('yearsToModel', Math.round(v))}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="How many years you want to project your savings growth. The HYSA advantage compounds every year."
            error={errors.yearsToModel}
          />
        </div>
      </div>

      {/* APY panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>percent</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">INTEREST RATES</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="hysa-hysaAPY"
            label="HYSA APY"
            value={pct(inputs.hysaAPY)}
            onChange={v => onChange('hysaAPY', v / 100)}
            suffix="%"
            step={0.1}
            tooltip="The annual percentage yield on your high-yield savings account. APY includes compounding; it's the real annual return on your deposit. Top HYSAs currently offer around 4–5%."
            error={errors.hysaAPY}
          />
          <Field
            id="hysa-traditionalAPY"
            label="Traditional savings APY"
            value={pct(inputs.traditionalAPY)}
            onChange={v => onChange('traditionalAPY', v / 100)}
            suffix="%"
            step={0.05}
            tooltip="The APY on a typical bank savings account. The national average is around 0.45%, far below what HYSAs offer. This is the baseline you're comparing against."
            error={errors.traditionalAPY}
          />

          <div className="mt-auto pt-4 border-t border-border-subtle">
            <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-1">
              <p className="text-label-sm text-on-surface-variant">APY advantage</p>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                {(Math.abs(inputs.hysaAPY - inputs.traditionalAPY) * 100).toFixed(2)}%
              </p>
              <p className="text-label-sm text-on-surface-variant">more per year in a HYSA</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
