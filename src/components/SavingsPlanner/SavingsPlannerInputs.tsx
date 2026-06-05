import type { SavingsPlannerInputs } from '../../lib/savings';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: SavingsPlannerInputs;
  onChange: (key: keyof SavingsPlannerInputs, value: number) => void;
  errors: ValidationErrors;
  onCalculate?: () => void;
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

export function SavingsPlannerInputs({ inputs, onChange, errors, onCalculate }: Props) {
  return (
    <div data-print="hide" className="bg-surface-container-low border border-border-subtle rounded-xl p-lg flex flex-col gap-lg">
      {/* Header */}
      <div className="flex items-center gap-2 pb-sm border-b border-border-subtle">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>tune</span>
        <h2 className="text-label-md font-semibold text-on-surface uppercase tracking-wide">Simulation Controls</h2>
      </div>

      {/* Monthly Contribution slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <label htmlFor="sp-monthlySavings" className="text-label-sm text-on-surface-variant">Monthly Contribution</label>
          <InfoTooltip text="How much you add to your savings each month." />
        </div>
        <div className="p-md rounded-lg bg-surface-container-high border border-primary-accent/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">$100</span>
            <span className="text-label-sm font-bold text-primary tabular-nums">${inputs.monthlySavings.toLocaleString()}/mo</span>
            <span className="text-label-sm text-on-surface-variant">$5,000</span>
          </div>
          <input
            type="range"
            min={100}
            max={5000}
            step={50}
            value={inputs.monthlySavings}
            onChange={e => onChange('monthlySavings', parseInt(e.target.value, 10))}
            className="w-full"
          />
          {errors.monthlySavings && <p className="text-label-sm text-error">{errors.monthlySavings}</p>}
        </div>
      </div>

      {/* Annual Return APY slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <label htmlFor="sp-annualReturn" className="text-label-sm text-on-surface-variant">Annual Return on Savings</label>
          <InfoTooltip text="The yearly return on your savings. Use 4–5% for a HYSA, or 7% if you plan to invest in index funds." />
        </div>
        <div className="p-md rounded-lg bg-surface-container-high border border-primary-accent/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">0%</span>
            <span className="text-label-sm font-bold text-primary tabular-nums">{pct(inputs.annualReturn).toFixed(2)}% APY</span>
            <span className="text-label-sm text-on-surface-variant">12%</span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={0.25}
            value={pct(inputs.annualReturn)}
            onChange={e => onChange('annualReturn', parseFloat(e.target.value) / 100)}
            className="w-full"
          />
          {errors.annualReturn && <p className="text-label-sm text-error">{errors.annualReturn}</p>}
        </div>
      </div>

      {/* Remaining inputs */}
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
      <div className="grid grid-cols-2 gap-3">
        <Field
          id="sp-downPaymentPct"
          label="Down payment"
          value={pct(inputs.downPaymentPct)}
          onChange={v => onChange('downPaymentPct', v / 100)}
          suffix="%"
          step={1}
          tooltip="The percentage of the home price you pay upfront."
          error={errors.downPaymentPct}
        />
        <Field
          id="sp-closingCostsPct"
          label="Closing costs"
          value={pct(inputs.closingCostsPct)}
          onChange={v => onChange('closingCostsPct', v / 100)}
          suffix="%"
          step={0.25}
          tooltip="Extra fees at closing — paperwork, bank fees, title checks. Usually 2–5% of the purchase price."
          error={errors.closingCostsPct}
        />
      </div>
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

      {/* Info box */}
      <div className="flex items-start gap-sm p-md rounded-lg bg-primary-container/10 border border-primary/20 text-label-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: '16px' }}>lightbulb</span>
        <span>DRAFT - Increasing your monthly contribution by even $200 can shave years off your timeline. Combine it with a high-yield account to maximize compounding.</span>
      </div>

      {/* Calculate CTA */}
      <button
        type="button"
        onClick={onCalculate}
        className="w-full py-sm rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Calculate
      </button>
    </div>
  );
}
