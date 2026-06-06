import type { RenovationROIInputs } from '../../lib/renovation-roi';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: RenovationROIInputs;
  onChange: (key: keyof RenovationROIInputs, value: number) => void;
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

export function RenovationROIInputs({ inputs, onChange, errors }: Props) {
  const renoValueAdd = inputs.homeValue * inputs.valueIncreasePct;
  const postRenoValue = inputs.homeValue + renoValueAdd;

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Renovation panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>home_repair_service</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">RENOVATION</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="reno-renovationCost"
            label="Renovation cost"
            value={inputs.renovationCost}
            onChange={v => onChange('renovationCost', v)}
            prefix="$"
            step={1000}
            min={0}
            tooltip="How much you plan to spend on the renovation project."
            error={errors.renovationCost}
          />
          <Field
            id="reno-homeValue"
            label="Current home value"
            value={inputs.homeValue}
            onChange={v => onChange('homeValue', v)}
            prefix="$"
            step={5000}
            min={0}
            tooltip="What your home is worth today before the renovation."
            error={errors.homeValue}
          />
          <Field
            id="reno-valueIncreasePct"
            label="Expected value increase"
            value={pct(inputs.valueIncreasePct)}
            onChange={v => onChange('valueIncreasePct', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="How much the renovation is expected to increase your home's value, as a percentage of the current value. A kitchen remodel might add 5–10%."
            error={errors.valueIncreasePct}
          />
          {/* Post-reno value preview */}
          <div className="flex flex-col gap-1.5">
            <span className="text-label-sm text-on-surface-variant">Post-renovation value</span>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container border border-border-subtle">
              <span className="text-label-sm text-on-surface-variant">Estimated</span>
              <span className="text-body-sm font-bold tabular-nums text-on-surface">{cur.format(postRenoValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth assumptions panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>trending_up</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">GROWTH ASSUMPTIONS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="reno-yearsUntilSale"
            label="Years until planned sale"
            value={inputs.yearsUntilSale}
            onChange={v => onChange('yearsUntilSale', Math.round(v))}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="How many years you plan to stay before selling. The longer you hold, the more time both paths have to grow."
            error={errors.yearsUntilSale}
          />
          <Field
            id="reno-annualAppreciation"
            label="Annual home appreciation"
            value={pct(inputs.annualAppreciation)}
            onChange={v => onChange('annualAppreciation', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="How much your home's value is expected to grow each year. The renovation premium grows at this same rate. U.S. homes have averaged about 3–4% historically."
            error={errors.annualAppreciation}
          />
          <Field
            id="reno-annualInvestReturn"
            label="Annual investment return"
            value={pct(inputs.annualInvestReturn)}
            onChange={v => onChange('annualInvestReturn', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="The annual return you'd expect if you invested the renovation money in the stock market instead. A broad index fund has historically returned about 7% after inflation."
            error={errors.annualInvestReturn}
          />
          {/* Value add preview */}
          <div className="flex flex-col gap-1.5">
            <span className="text-label-sm text-on-surface-variant">Immediate value added</span>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container border border-border-subtle">
              <span className="text-label-sm text-on-surface-variant">From renovation</span>
              <span className="text-body-sm font-bold tabular-nums text-primary">{cur.format(renoValueAdd)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
