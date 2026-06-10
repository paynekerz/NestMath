import { type FilingStatus, type SideIncomeInputs } from '../../lib/side-income';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: SideIncomeInputs;
  onChange: (key: keyof SideIncomeInputs, value: number | FilingStatus) => void;
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

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string; desc: string }[] = [
  { value: 'single', label: 'Single', desc: 'Unmarried or legally separated' },
  { value: 'mfj',    label: 'Married Filing Jointly', desc: 'Married, filing one return together' },
  { value: 'hoh',    label: 'Head of Household', desc: 'Unmarried with a qualifying dependent' },
];

export function SideIncomeInputs({ inputs, onChange, errors }: Props) {
  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* SIDE INCOME */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>work</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">SIDE INCOME</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="si-grossSideIncome"
            label="Gross annual side income"
            value={inputs.grossSideIncome}
            onChange={v => onChange('grossSideIncome', v)}
            prefix="$"
            step={1000}
            tooltip="Total revenue from freelance work, consulting, gig work, or any self-employment before deducting any business expenses."
            error={errors.grossSideIncome}
          />
          <Field
            id="si-businessExpenses"
            label="Deductible business expenses"
            value={inputs.businessExpenses}
            onChange={v => onChange('businessExpenses', v)}
            prefix="$"
            step={100}
            tooltip="Ordinary and necessary costs of running your side business: software subscriptions, equipment, home office, professional fees, advertising, etc. These reduce your taxable self-employment income."
            error={errors.businessExpenses}
          />
          <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-0.5">
            <p className="text-label-sm text-on-surface-variant">Net self-employment income</p>
            <p className="text-body-md font-bold font-mono-data tabular-nums text-on-surface">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
                Math.max(0, inputs.grossSideIncome - inputs.businessExpenses)
              )}
            </p>
            <p className="text-label-sm text-on-surface-variant">gross minus expenses</p>
          </div>
        </div>
      </div>

      {/* YOUR TAX SITUATION */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>manage_accounts</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">YOUR TAX SITUATION</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="si-primaryW2Income"
            label="Primary W-2 annual income"
            value={inputs.primaryW2Income}
            onChange={v => onChange('primaryW2Income', v)}
            prefix="$"
            step={1000}
            tooltip="Your regular salary or wages before any deductions. This determines which tax bracket your side income falls into. Side income is taxed at your marginal rate on top of your W-2 income."
            error={errors.primaryW2Income}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-label-sm text-on-surface-variant">Filing status</span>
              <InfoTooltip text="Your filing status sets your standard deduction and which tax brackets apply. Single if unmarried, MFJ if married filing jointly, or Head of Household if unmarried with a qualifying dependent child." />
            </div>
            <div className="flex flex-col gap-2">
              {FILING_STATUS_OPTIONS.map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`flex items-start gap-3 rounded-lg border px-md py-sm cursor-pointer transition-colors ${
                    inputs.filingStatus === value
                      ? 'border-primary-accent/60 bg-primary-container/10'
                      : 'border-border-subtle hover:border-border-subtle/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="siFilingStatus"
                    value={value}
                    checked={inputs.filingStatus === value}
                    onChange={() => onChange('filingStatus', value)}
                    className="mt-0.5 w-4 h-4 accent-primary-accent shrink-0"
                  />
                  <div>
                    <p className={`text-label-sm font-medium ${inputs.filingStatus === value ? 'text-primary' : 'text-on-surface'}`}>{label}</p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
