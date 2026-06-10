import {
  getStandardDeduction,
  type FilingStatus,
  type TaxWithholdingInputs,
} from '../../lib/tax-withholding';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: TaxWithholdingInputs;
  onChange: (key: keyof TaxWithholdingInputs, value: string | number) => void;
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
  { value: 'mfj', label: 'Married Filing Jointly', desc: 'Married, filing one return together' },
  { value: 'hoh', label: 'Head of Household', desc: 'Unmarried with a qualifying dependent' },
];

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function TaxWithholdingInputs({ inputs, onChange, errors }: Props) {
  const standardDeduction = getStandardDeduction(inputs.filingStatus);

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* INCOME */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>payments</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">INCOME</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="tw-grossW2Income"
            label="Gross annual W-2 income"
            value={inputs.grossW2Income}
            onChange={v => onChange('grossW2Income', v)}
            prefix="$"
            step={1000}
            tooltip="Your total wages before any taxes or deductions are taken out. Found on your pay stub as 'Gross Pay' or on your W-2 in Box 1."
            error={errors.grossW2Income}
          />
          <Field
            id="tw-otherIncome"
            label="Other annual income"
            value={inputs.otherIncome}
            onChange={v => onChange('otherIncome', v)}
            prefix="$"
            step={500}
            tooltip="Income not subject to withholding: freelance work, side business, dividends, rental income, etc. This income won't have taxes withheld, so it increases what you may owe."
            error={errors.otherIncome}
          />
          <Field
            id="tw-preTaxDeductions"
            label="Pre-tax deductions"
            value={inputs.preTaxDeductions}
            onChange={v => onChange('preTaxDeductions', v)}
            prefix="$"
            step={500}
            tooltip="Contributions that reduce your taxable income before tax is calculated: 401(k), 403(b), HSA, FSA, and traditional IRA. Does not include Roth contributions."
            error={errors.preTaxDeductions}
          />

          <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-0.5">
            <p className="text-label-sm text-on-surface-variant">2025 standard deduction</p>
            <p className="text-body-md font-bold font-mono-data tabular-nums text-on-surface">{cur.format(standardDeduction)}</p>
            <p className="text-label-sm text-on-surface-variant">for {FILING_STATUS_OPTIONS.find(o => o.value === inputs.filingStatus)?.label}</p>
          </div>
        </div>
      </div>

      {/* FILING & WITHHOLDING */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>manage_accounts</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">FILING & WITHHOLDING</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">

          {/* Filing status selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-label-sm text-on-surface-variant">Filing status</span>
              <InfoTooltip text="Your tax filing status determines your standard deduction and which tax brackets apply. Use Single if unmarried, MFJ if married and filing one return, or Head of Household if you're unmarried with a qualifying dependent child." />
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
                    name="filingStatus"
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

          <Field
            id="tw-currentWithholding"
            label="Current annual withholding"
            value={inputs.currentWithholding}
            onChange={v => onChange('currentWithholding', v)}
            prefix="$"
            step={500}
            tooltip="Total federal income tax withheld so far this year, annualized. Check your most recent pay stub: find the 'Federal Income Tax' YTD amount and multiply by (12 ÷ pay periods elapsed)."
            error={errors.currentWithholding}
          />
        </div>
      </div>
    </div>
  );
}
