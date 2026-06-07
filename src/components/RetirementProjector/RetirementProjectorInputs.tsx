import type { RetirementProjectorInputs } from '../../lib/retirement-projector';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: RetirementProjectorInputs;
  onChange: (key: keyof RetirementProjectorInputs, value: number) => void;
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
  placeholder?: string;
}

function Field({ id, label, value, onChange, prefix, suffix, step = 1, min = 0, tooltip, error, placeholder }: FieldProps) {
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
          placeholder={placeholder}
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

export function RetirementProjectorInputs({ inputs, onChange, errors }: Props) {
  const impliedTarget = inputs.annualSalary * 25;

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* YOUR ACCOUNT panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>savings</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">YOUR ACCOUNT</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <Field
              id="rp-currentAge"
              label="Current age"
              value={inputs.currentAge}
              onChange={v => onChange('currentAge', Math.round(v))}
              suffix="yrs"
              step={1}
              min={18}
              tooltip="Your current age. This determines how many years you have to save before retirement."
              error={errors.currentAge}
            />
            <Field
              id="rp-retirementAge"
              label="Retirement age"
              value={inputs.retirementAge}
              onChange={v => onChange('retirementAge', Math.round(v))}
              suffix="yrs"
              step={1}
              min={19}
              tooltip="The age at which you plan to retire. 65 is the traditional full Social Security retirement age for most Americans."
              error={errors.retirementAge}
            />
          </div>
          <Field
            id="rp-currentBalance"
            label="Current balance"
            value={inputs.currentBalance}
            onChange={v => onChange('currentBalance', v)}
            prefix="$"
            step={1000}
            tooltip="Your current 401(k) or retirement account balance. Include all employer-sponsored retirement accounts combined."
            error={errors.currentBalance}
          />
          <Field
            id="rp-annualContribution"
            label="Your annual contribution"
            value={inputs.annualContribution}
            onChange={v => onChange('annualContribution', v)}
            prefix="$"
            step={500}
            tooltip="How much you contribute each year to your retirement account. The 2024 401(k) limit is $23,000 ($30,500 if 50+). The IRA limit is $7,000."
            error={errors.annualContribution}
          />
          <Field
            id="rp-targetAnnualExpenses"
            label="Annual expenses in retirement"
            value={inputs.targetAnnualExpenses}
            onChange={v => onChange('targetAnnualExpenses', v)}
            prefix="$"
            step={1000}
            placeholder="0"
            tooltip="Your estimated annual spending in retirement. Used to calculate your target balance via the 25× rule. Leave at 0 to default to 25× your current salary."
            error={errors.targetAnnualExpenses}
          />
          {inputs.targetAnnualExpenses === 0 && (
            <p className="text-label-sm text-on-surface-variant -mt-2">
              Defaulting to 25× salary: <span className="font-mono-data text-primary">{cur.format(impliedTarget)}</span>
            </p>
          )}
        </div>
      </div>

      {/* EMPLOYER & RETURNS panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>business_center</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">EMPLOYER & RETURNS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="rp-annualSalary"
            label="Annual salary"
            value={inputs.annualSalary}
            onChange={v => onChange('annualSalary', v)}
            prefix="$"
            step={1000}
            tooltip="Your gross annual salary. Used only to calculate the employer match dollar amount — it doesn't affect the contribution growth calculation."
            error={errors.annualSalary}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              id="rp-employerMatchPct"
              label="Employer match"
              value={pct(inputs.employerMatchPct)}
              onChange={v => onChange('employerMatchPct', v / 100)}
              suffix="%"
              step={0.5}
              tooltip="The percentage of your salary your employer contributes as a match. If they match 100% up to 4% of salary, enter 4%. This free money compounds just like your own contributions."
              error={errors.employerMatchPct}
            />
            <Field
              id="rp-matchLimitPct"
              label="Match limit"
              value={pct(inputs.matchLimitPct)}
              onChange={v => onChange('matchLimitPct', v / 100)}
              suffix="% salary"
              step={0.5}
              tooltip="The cap on what portion of your salary triggers the employer match. If you must contribute at least 4% of salary to get the full match, enter 4%."
              error={errors.matchLimitPct}
            />
          </div>

          {/* Computed employer match insight */}
          <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-1">
            <p className="text-label-sm text-on-surface-variant">Employer match per year</p>
            <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
              {cur.format(
                Math.min(inputs.annualContribution / (inputs.matchLimitPct * inputs.annualSalary || 1), 1) *
                inputs.employerMatchPct * inputs.annualSalary
              )}
            </p>
            <p className="text-label-sm text-on-surface-variant">added to your balance annually</p>
          </div>

          <Field
            id="rp-expectedAnnualReturn"
            label="Expected annual return"
            value={pct(inputs.expectedAnnualReturn)}
            onChange={v => onChange('expectedAnnualReturn', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="The average annual investment return before inflation. A diversified stock portfolio has historically returned about 7% after inflation, or 10% nominal. 7% is a conservative real-return estimate."
            error={errors.expectedAnnualReturn}
          />
          <Field
            id="rp-expectedInflation"
            label="Expected inflation"
            value={pct(inputs.expectedInflation)}
            onChange={v => onChange('expectedInflation', v / 100)}
            suffix="%"
            step={0.25}
            tooltip="Used to convert your projected balance into today's dollars so you can understand its real purchasing power. The Fed targets 2% inflation; 2.5% is a slightly conservative assumption."
            error={errors.expectedInflation}
          />
        </div>
      </div>

    </div>
  );
}
