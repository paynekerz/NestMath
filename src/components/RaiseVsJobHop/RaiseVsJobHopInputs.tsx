import type { RaiseVsJobHopInputs } from '../../lib/raise-vs-job-hop';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: RaiseVsJobHopInputs;
  onChange: (key: keyof RaiseVsJobHopInputs, value: number) => void;
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

export function RaiseVsJobHopInputs({ inputs, onChange, errors }: Props) {
  const year1Stay = inputs.currentSalary * (1 + inputs.stayRaise);
  const year1Hop = inputs.hopSalary * (1 + inputs.hopRaise);

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Current Job panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>work_history</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">CURRENT JOB</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="rvjh-currentSalary"
            label="Current annual salary"
            value={inputs.currentSalary}
            onChange={v => onChange('currentSalary', v)}
            prefix="$"
            step={1000}
            min={0}
            tooltip="Your current total annual compensation before taxes."
            error={errors.currentSalary}
          />
          <Field
            id="rvjh-stayRaise"
            label="Expected annual raise (stay)"
            value={pct(inputs.stayRaise)}
            onChange={v => onChange('stayRaise', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="The average annual raise you expect to receive if you stay at your current job."
            error={errors.stayRaise}
          />
          {/* Year 1 preview */}
          <div className="flex flex-col gap-1.5">
            <span className="text-label-sm text-on-surface-variant">Year 1 salary (stay)</span>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container border border-border-subtle">
              <span className="text-label-sm text-on-surface-variant">After raise</span>
              <span className="text-body-sm font-bold tabular-nums text-on-surface">{cur.format(year1Stay)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Offer panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>trending_up</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">NEW OFFER</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          {/* Offer salary — large display */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="rvjh-hopSalary" className="text-label-sm text-on-surface-variant">New job offer salary</label>
              <InfoTooltip text="The annual compensation offered by the new employer." />
            </div>
            <div className={`flex items-center gap-1 rounded-lg border bg-surface-container px-3 py-2 focus-within:border-primary-accent transition-colors ${errors.hopSalary ? 'border-error/70' : 'border-border-subtle'}`}>
              <span className="text-on-surface-variant text-body-sm select-none">$</span>
              <input
                id="rvjh-hopSalary"
                type="number"
                value={inputs.hopSalary}
                step={1000}
                min={0}
                onChange={e => onChange('hopSalary', parseFloat(e.target.value) || 0)}
                className="flex-1 min-w-0 bg-transparent outline-none text-right tabular-nums text-primary font-bold"
                style={{ fontSize: 'var(--text-headline-md-size, 1.25rem)' }}
              />
            </div>
            {errors.hopSalary && <p className="text-label-sm text-error">{errors.hopSalary}</p>}
          </div>

          <Field
            id="rvjh-hopRaise"
            label="Expected annual raise (hop)"
            value={pct(inputs.hopRaise)}
            onChange={v => onChange('hopRaise', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="The average annual raise you expect at the new job, after your starting salary."
            error={errors.hopRaise}
          />
          <Field
            id="rvjh-yearsToModel"
            label="Years to model"
            value={inputs.yearsToModel}
            onChange={v => onChange('yearsToModel', Math.round(v))}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="How many years of cumulative earnings to compare between staying and switching."
            error={errors.yearsToModel}
          />
          {/* Year 1 preview */}
          <div className="flex flex-col gap-1.5">
            <span className="text-label-sm text-on-surface-variant">Year 1 salary (hop)</span>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container border border-border-subtle">
              <span className="text-label-sm text-on-surface-variant">After raise</span>
              <span className="text-body-sm font-bold tabular-nums text-primary">{cur.format(year1Hop)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
