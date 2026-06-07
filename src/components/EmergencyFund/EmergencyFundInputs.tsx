import type { EmergencyFundInputs } from '../../lib/emergency-fund';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: EmergencyFundInputs;
  onChange: (key: keyof EmergencyFundInputs, value: number) => void;
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

export function EmergencyFundInputs({ inputs, onChange, errors }: Props) {
  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Situation panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>home</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">YOUR SITUATION</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="ef-monthlyExpenses"
            label="Monthly essential expenses"
            value={inputs.monthlyExpenses}
            onChange={v => onChange('monthlyExpenses', v)}
            prefix="$"
            step={100}
            tooltip="Your true monthly essentials: rent or mortgage, food, utilities, insurance, and minimum debt payments. Exclude discretionary spending — this is your floor if income stopped."
            error={errors.monthlyExpenses}
          />
          <Field
            id="ef-currentSavings"
            label="Current emergency savings"
            value={inputs.currentSavings}
            onChange={v => onChange('currentSavings', v)}
            prefix="$"
            step={500}
            tooltip="Cash you already have set aside for emergencies — money in a savings account you could access quickly. Don't include investments or retirement accounts."
            error={errors.currentSavings}
          />
        </div>
      </div>

      {/* Savings rate panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>trending_up</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">SAVINGS RATE</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="ef-monthlySavings"
            label="Monthly savings toward fund"
            value={inputs.monthlySavings}
            onChange={v => onChange('monthlySavings', v)}
            prefix="$"
            step={50}
            tooltip="How much you can add to your emergency fund each month. Even $100/month makes a meaningful difference — consistency matters more than the amount."
            error={errors.monthlySavings}
          />
          <Field
            id="ef-hysaAPY"
            label="HYSA APY"
            value={pct(inputs.hysaAPY)}
            onChange={v => onChange('hysaAPY', v / 100)}
            suffix="%"
            step={0.1}
            tooltip="The annual percentage yield on your high-yield savings account. Keeping your emergency fund in a HYSA at 4–5% APY means your money earns interest while it waits. Top HYSAs currently offer around 4–5%."
            error={errors.hysaAPY}
          />

          <div className="mt-auto pt-4 border-t border-border-subtle">
            <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-1">
              <p className="text-label-sm text-on-surface-variant">Annual savings rate</p>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                ${(inputs.monthlySavings * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-label-sm text-on-surface-variant">per year toward your fund</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
