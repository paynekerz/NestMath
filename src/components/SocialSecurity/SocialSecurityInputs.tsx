import { estimatePIA, type SocialSecurityInputs } from '../../lib/social-security';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: SocialSecurityInputs;
  onChange: (key: keyof SocialSecurityInputs, value: number | boolean) => void;
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

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function pctOfPIA(multiplier: number): string {
  return `${Math.round(multiplier * 100)}% of FRA benefit`;
}

export function SocialSecurityInputs({ inputs, onChange, errors }: Props) {
  const pia = estimatePIA(inputs.annualIncome) * (inputs.applyReduction ? 0.75 : 1.0);
  const monthly62 = Math.round(pia * 0.70);
  const monthly67 = Math.round(pia);
  const monthly70 = Math.round(pia * 1.24);

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* YOUR PROFILE */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>person</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">YOUR PROFILE</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="ss-annualIncome"
            label="Annual income"
            value={inputs.annualIncome}
            onChange={v => onChange('annualIncome', v)}
            prefix="$"
            step={1000}
            tooltip="Your current gross annual income. Used to estimate your Social Security benefit via the SSA's bend-point formula, which approximates your career-average monthly earnings."
            error={errors.annualIncome}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              id="ss-currentAge"
              label="Current age"
              value={inputs.currentAge}
              onChange={v => onChange('currentAge', Math.round(v))}
              suffix="yrs"
              step={1}
              min={18}
              tooltip="Your current age. Used to show how many years until each claiming age."
              error={errors.currentAge}
            />
            <Field
              id="ss-lifeExpectancy"
              label="Life expectancy"
              value={inputs.lifeExpectancy}
              onChange={v => onChange('lifeExpectancy', Math.round(v))}
              suffix="yrs"
              step={1}
              min={63}
              tooltip="How long you expect to live. This determines whether waiting to claim pays off. The average American who reaches 65 lives to ~85. Adjust if your health or family history suggests otherwise."
              error={errors.lifeExpectancy}
            />
          </div>

          {/* Context note */}
          <div className="rounded-lg bg-surface-container px-md py-sm">
            <p className="text-label-sm text-on-surface-variant">
              Years until claiming ages:{' '}
              <span className="font-mono-data text-on-surface">
                {Math.max(0, 62 - inputs.currentAge)} yrs to 62 &middot; {Math.max(0, 67 - inputs.currentAge)} yrs to 67 &middot; {Math.max(0, 70 - inputs.currentAge)} yrs to 70
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* BENEFIT SETTINGS */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>payments</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">ESTIMATED BENEFITS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">

          {/* Estimated monthly benefits — read-only display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Claim at 62', amount: monthly62, note: pctOfPIA(0.70) },
              { label: 'Claim at 67', amount: monthly67, note: 'Full Retirement Age' },
              { label: 'Claim at 70', amount: monthly70, note: pctOfPIA(1.24) },
            ].map(({ label, amount, note }) => (
              <div key={label} className="rounded-lg bg-surface-container px-sm py-sm flex flex-col items-center text-center gap-0.5">
                <p className="text-label-sm text-on-surface-variant">{label}</p>
                <p className="text-body-md font-bold font-mono-data tabular-nums text-primary">{cur.format(amount)}</p>
                <p className="text-label-sm text-on-surface-variant leading-tight">{note}</p>
              </div>
            ))}
          </div>

          {/* Reduction scenario toggle */}
          <div className="rounded-lg border border-border-subtle p-md">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inputs.applyReduction}
                onChange={e => onChange('applyReduction', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary-accent shrink-0"
              />
              <div>
                <p className="text-label-sm text-on-surface font-medium">Apply 25% trust fund reduction</p>
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  Model the conservative scenario where Congress doesn't act before reserves are depleted (~2033–2035)
                </p>
              </div>
            </label>
          </div>

          {/* Disclaimer */}
          <div
            className="rounded-lg px-md py-sm flex items-start gap-2"
            style={{ background: 'oklch(75% 0.12 60 / 0.08)', border: '1px solid oklch(70% 0.12 60 / 0.25)' }}
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px', color: 'oklch(65% 0.14 60)' }}>info</span>
            <div className="flex flex-col gap-1">
              <p className="text-label-sm text-on-surface-variant leading-relaxed">
                The Social Security trust fund is projected to be depleted by ~2033–2035. Without legislative action, benefits could be cut to approximately 75–80% of scheduled levels. No COLA modeled.
              </p>
              <p className="text-label-sm text-on-surface-variant">
                For your actual benefit statement, visit{' '}
                <a
                  href="https://www.ssa.gov/myaccount"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  ssa.gov/myaccount
                </a>.
              </p>
            </div>
          </div>

          <p className="text-label-sm text-on-surface-variant">
            Estimated using the 2024 SSA bend-point formula, assuming career earnings match current income. Actual benefits depend on your full earnings history.
          </p>
        </div>
      </div>

    </div>
  );
}
