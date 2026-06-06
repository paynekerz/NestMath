import type { InvestmentFeesInputs } from '../../lib/investment-fees';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: InvestmentFeesInputs;
  onChange: (key: keyof InvestmentFeesInputs, value: number) => void;
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

export function InvestmentFeesInputs({ inputs, onChange, errors }: Props) {
  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Portfolio panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>savings</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">PORTFOLIO</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="if-initialInvestment"
            label="Initial investment"
            value={inputs.initialInvestment}
            onChange={v => onChange('initialInvestment', v)}
            prefix="$"
            step={1000}
            tooltip="The lump sum you're starting with — your current portfolio balance or an initial deposit."
            error={errors.initialInvestment}
          />
          <Field
            id="if-monthlyContribution"
            label="Monthly contribution"
            value={inputs.monthlyContribution}
            onChange={v => onChange('monthlyContribution', v)}
            prefix="$"
            step={50}
            tooltip="How much you add to the portfolio each month. Even small regular contributions compound significantly over decades."
            error={errors.monthlyContribution}
          />
          <Field
            id="if-annualGrossReturn"
            label="Annual gross return"
            value={pct(inputs.annualGrossReturn)}
            onChange={v => onChange('annualGrossReturn', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="The portfolio's total return before any fees are deducted. A broad U.S. stock index has historically returned around 8% annually."
            error={errors.annualGrossReturn}
          />
          <Field
            id="if-yearsToModel"
            label="Years to model"
            value={inputs.yearsToModel}
            onChange={v => onChange('yearsToModel', Math.round(v))}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="How many years to project into the future. The fee drag compounds every year — the longer the horizon, the bigger the gap."
            error={errors.yearsToModel}
          />
        </div>
      </div>

      {/* Expense ratio panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>percent</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">EXPENSE RATIOS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="if-currentExpenseRatio"
            label="Current expense ratio"
            value={pct(inputs.currentExpenseRatio)}
            onChange={v => onChange('currentExpenseRatio', v / 100)}
            suffix="%"
            step={0.1}
            tooltip="The annual fee charged by your current fund, expressed as a percentage of assets. Actively managed funds often charge 0.5–1.5%. This fee is deducted from your returns every year."
            error={errors.currentExpenseRatio}
          />
          <Field
            id="if-lowCostExpenseRatio"
            label="Low-cost expense ratio"
            value={pct(inputs.lowCostExpenseRatio)}
            onChange={v => onChange('lowCostExpenseRatio', v / 100)}
            suffix="%"
            step={0.01}
            tooltip="The annual fee of a low-cost index fund alternative. Vanguard VTSAX charges 0.04%, Fidelity ZERO charges 0%. These funds track the same market — you keep more of every dollar."
            error={errors.lowCostExpenseRatio}
          />

          <div className="mt-auto pt-4 border-t border-border-subtle">
            <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-1">
              <p className="text-label-sm text-on-surface-variant">Expense ratio difference</p>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                {(Math.abs(inputs.currentExpenseRatio - inputs.lowCostExpenseRatio) * 100).toFixed(2)}%
              </p>
              <p className="text-label-sm text-on-surface-variant">per year difference on your balance</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
