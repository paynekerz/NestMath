import type { RothVsTraditionalInputs } from '../../lib/roth-vs-traditional';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: RothVsTraditionalInputs;
  onChange: (key: keyof RothVsTraditionalInputs, value: number) => void;
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
          value={value || ''}
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
  return parseFloat((v * 100).toFixed(2));
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function RothVsTraditionalInputs({ inputs, onChange, errors }: Props) {
  const rothFinalEst = (() => {
    const r = inputs.expectedAnnualReturn;
    const n = inputs.yearsToRetirement;
    const pmt = inputs.annualContribution;
    if (r <= 0 || n <= 0 || pmt <= 0) return 0;
    return Math.round(pmt * ((Math.pow(1 + r, n) - 1) / r));
  })();

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* CONTRIBUTION & TIMELINE panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>savings</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">CONTRIBUTION & TIMELINE</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="rvt-annualContribution"
            label="Annual contribution"
            value={inputs.annualContribution}
            onChange={v => onChange('annualContribution', v)}
            prefix="$"
            step={500}
            tooltip="How much you plan to contribute each year. The 2024 IRA limit is $7,000 ($8,000 if you're 50+). Same amount is modeled for both Roth and Traditional."
            error={errors.annualContribution}
          />
          <Field
            id="rvt-yearsToRetirement"
            label="Years until retirement"
            value={inputs.yearsToRetirement}
            onChange={v => onChange('yearsToRetirement', Math.round(v))}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="How many years you have to let the account grow before you start withdrawing in retirement."
            error={errors.yearsToRetirement}
          />
          <Field
            id="rvt-expectedAnnualReturn"
            label="Expected annual return"
            value={pct(inputs.expectedAnnualReturn)}
            onChange={v => onChange('expectedAnnualReturn', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="The average annual investment return. A diversified stock index fund has historically returned about 7% after inflation (10% nominal). 7% is a common conservative real-return estimate."
            error={errors.expectedAnnualReturn}
          />

          {rothFinalEst > 0 && (
            <div className="rounded-lg bg-surface-container px-md py-sm">
              <p className="text-label-sm text-on-surface-variant">Estimated gross balance at retirement</p>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary mt-0.5">
                {cur.format(rothFinalEst)}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-0.5">before any taxes on withdrawal</p>
            </div>
          )}
        </div>
      </div>

      {/* TAX RATES panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>account_balance</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">TAX RATES</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="rvt-currentTaxRate"
            label="Current marginal tax rate"
            value={pct(inputs.currentTaxRate)}
            onChange={v => onChange('currentTaxRate', v / 100)}
            suffix="%"
            step={1}
            tooltip="Your marginal federal income tax bracket today. Traditional IRA contributions reduce your taxable income at this rate: it's your upfront tax break per dollar contributed."
            error={errors.currentTaxRate}
          />
          <Field
            id="rvt-retirementTaxRate"
            label="Expected retirement tax rate"
            value={pct(inputs.retirementTaxRate)}
            onChange={v => onChange('retirementTaxRate', v / 100)}
            suffix="%"
            step={1}
            tooltip="The marginal tax rate you expect to pay when withdrawing from a Traditional IRA in retirement. If this is lower than your current rate, Traditional saves money overall."
            error={errors.retirementTaxRate}
          />

          {/* Tax rate comparison insight */}
          <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-1">
            <p className="text-label-sm text-on-surface-variant">Tax rate direction</p>
            {inputs.currentTaxRate > inputs.retirementTaxRate ? (
              <>
                <p className="text-label-md font-semibold text-success-emerald">Going down in retirement</p>
                <p className="text-label-sm text-on-surface-variant">
                  Traditional saves you {pct(inputs.currentTaxRate - inputs.retirementTaxRate)}% on every withdrawal; you pay taxes when cheaper.
                </p>
              </>
            ) : inputs.currentTaxRate < inputs.retirementTaxRate ? (
              <>
                <p className="text-label-md font-semibold" style={{ color: '#f87171' }}>Going up in retirement</p>
                <p className="text-label-sm text-on-surface-variant">
                  Roth locks in your current {pct(inputs.currentTaxRate)}% rate; you avoid the higher future rate entirely.
                </p>
              </>
            ) : (
              <>
                <p className="text-label-md font-semibold text-on-surface">Same rate</p>
                <p className="text-label-sm text-on-surface-variant">
                  At identical rates, Roth wins; the after-tax value is identical in theory but Roth offers more flexibility.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
