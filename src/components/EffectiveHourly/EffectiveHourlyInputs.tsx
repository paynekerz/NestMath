import type { EffectiveHourlyInputs } from '../../lib/effective-hourly';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: EffectiveHourlyInputs;
  onChange: (key: keyof EffectiveHourlyInputs, value: number) => void;
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

export function EffectiveHourlyInputs({ inputs, onChange, errors }: Props) {
  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Compensation panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>payments</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">COMPENSATION</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="eh-annualGrossSalary"
            label="Annual gross salary"
            value={inputs.annualGrossSalary}
            onChange={v => onChange('annualGrossSalary', v)}
            prefix="$"
            step={1000}
            tooltip="Your total annual salary before taxes and deductions — the number on your offer letter."
            error={errors.annualGrossSalary}
          />
          <Field
            id="eh-federalTaxRate"
            label="Federal tax rate"
            value={pct(inputs.federalTaxRate)}
            onChange={v => onChange('federalTaxRate', v / 100)}
            suffix="%"
            step={1}
            tooltip="Your federal marginal tax bracket. For 2024: 22% for $47k–$100k, 24% for $100k–$191k. Use your marginal rate to see the true tax bite."
            error={errors.federalTaxRate}
          />
          <Field
            id="eh-stateTaxRate"
            label="State tax rate"
            value={pct(inputs.stateTaxRate)}
            onChange={v => onChange('stateTaxRate', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="Your effective state income tax rate. Set to 0% if you live in a no-income-tax state (TX, FL, WA, NV, etc.)."
            error={errors.stateTaxRate}
          />
          <Field
            id="eh-weeksWorkedPerYear"
            label="Weeks worked per year"
            value={inputs.weeksWorkedPerYear}
            onChange={v => onChange('weeksWorkedPerYear', Math.round(v))}
            suffix="wks"
            step={1}
            min={1}
            tooltip="How many weeks per year you actually work, accounting for vacation, holidays, and sick time. 50 weeks = 2 weeks off."
            error={errors.weeksWorkedPerYear}
          />
          <Field
            id="eh-monthlyWorkExpenses"
            label="Monthly work expenses"
            value={inputs.monthlyWorkExpenses}
            onChange={v => onChange('monthlyWorkExpenses', v)}
            prefix="$"
            step={25}
            tooltip="Out-of-pocket costs you pay just to hold this job: commute costs, work clothes, lunches, tools, parking, professional memberships, etc."
            error={errors.monthlyWorkExpenses}
          />
        </div>
      </div>

      {/* Hours panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>schedule</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">REAL HOURS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="eh-weeklyHoursWorked"
            label="Weekly hours worked"
            value={inputs.weeklyHoursWorked}
            onChange={v => onChange('weeklyHoursWorked', v)}
            suffix="hrs"
            step={0.5}
            min={1}
            tooltip="Your contracted or standard work hours per week — what you're technically paid to work."
            error={errors.weeklyHoursWorked}
          />
          <Field
            id="eh-weeklyUnpaidOvertime"
            label="Weekly unpaid overtime"
            value={inputs.weeklyUnpaidOvertime}
            onChange={v => onChange('weeklyUnpaidOvertime', v)}
            suffix="hrs"
            step={0.5}
            tooltip="Extra hours you work beyond your contract with no additional pay — early starts, late finishes, weekend check-ins."
            error={errors.weeklyUnpaidOvertime}
          />
          <Field
            id="eh-weeklyCommuteHours"
            label="Weekly commute hours"
            value={inputs.weeklyCommuteHours}
            onChange={v => onChange('weeklyCommuteHours', v)}
            suffix="hrs"
            step={0.5}
            tooltip="Total weekly round-trip commute time. This is time you spend on your job that isn't counted in your paid hours."
            error={errors.weeklyCommuteHours}
          />
          <Field
            id="eh-weeklyPrepDecompression"
            label="Weekly prep & decompression"
            value={inputs.weeklyPrepDecompression}
            onChange={v => onChange('weeklyPrepDecompression', v)}
            suffix="hrs"
            step={0.5}
            tooltip="Time spent getting ready for work and unwinding after — shower, coffee, changing, mentally checking out. These hours belong to the job."
            error={errors.weeklyPrepDecompression}
          />

          <div className="mt-auto pt-4 border-t border-border-subtle">
            <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-1">
              <p className="text-label-sm text-on-surface-variant">Hidden hours per week</p>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                {inputs.weeklyUnpaidOvertime + inputs.weeklyCommuteHours + inputs.weeklyPrepDecompression} hrs
              </p>
              <p className="text-label-sm text-on-surface-variant">unpaid vs. {inputs.weeklyHoursWorked} hrs contracted</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
