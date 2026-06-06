import type { CarLeaseVsBuyInputs } from '../../lib/car-lease-vs-buy';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: CarLeaseVsBuyInputs;
  onChange: (key: keyof CarLeaseVsBuyInputs, value: number) => void;
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

export function CarLeaseVsBuyInputs({ inputs, onChange, errors }: Props) {
  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Lease panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>directions_car</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">LEASE</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="clvb-monthlyLeasePayment"
            label="Monthly payment"
            value={inputs.monthlyLeasePayment}
            onChange={v => onChange('monthlyLeasePayment', v)}
            prefix="$"
            step={10}
            tooltip="Your monthly lease payment from the dealer quote. This is the core recurring cost of leasing."
            error={errors.monthlyLeasePayment}
          />
          <Field
            id="clvb-leaseTermMonths"
            label="Lease term"
            value={inputs.leaseTermMonths}
            onChange={v => onChange('leaseTermMonths', v)}
            suffix="mo"
            step={12}
            min={12}
            tooltip="How many months the lease runs — typically 24, 36, or 48 months."
            error={errors.leaseTermMonths}
          />
          <Field
            id="clvb-leaseUpfrontCost"
            label="Upfront cost"
            value={inputs.leaseUpfrontCost}
            onChange={v => onChange('leaseUpfrontCost', v)}
            prefix="$"
            step={100}
            tooltip="All money due at signing: cap cost reduction, first month's payment, acquisition fee, and taxes/registration."
            error={errors.leaseUpfrontCost}
          />
        </div>
      </div>

      {/* Buy panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>account_balance</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">BUY (FINANCE)</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="clvb-carPrice"
            label="Car price (MSRP)"
            value={inputs.carPrice}
            onChange={v => onChange('carPrice', v)}
            prefix="$"
            step={500}
            tooltip="The sticker price of the car. Used to calculate the loan amount and depreciation value."
            error={errors.carPrice}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              id="clvb-downPaymentPct"
              label="Down payment"
              value={pct(inputs.downPaymentPct)}
              onChange={v => onChange('downPaymentPct', v / 100)}
              suffix="%"
              step={1}
              tooltip="Cash paid upfront toward the purchase price. Reduces the loan amount and monthly payment."
              error={errors.downPaymentPct}
            />
            <Field
              id="clvb-loanRate"
              label="Loan rate"
              value={pct(inputs.loanRate)}
              onChange={v => onChange('loanRate', v / 100)}
              suffix="%"
              step={0.25}
              tooltip="The annual percentage rate (APR) on your auto loan."
              error={errors.loanRate}
            />
          </div>
          <Field
            id="clvb-loanTermMonths"
            label="Loan term"
            value={inputs.loanTermMonths}
            onChange={v => onChange('loanTermMonths', v)}
            suffix="mo"
            step={12}
            min={12}
            tooltip="How many months until the loan is fully paid off. Common terms are 48, 60, or 72 months."
            error={errors.loanTermMonths}
          />
        </div>
      </div>

      {/* Shared assumptions */}
      <div className="md:col-span-2 bg-surface-elevated rounded-xl border border-border-subtle">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>tune</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">ASSUMPTIONS</span>
        </div>
        <div className="p-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            id="clvb-annualDepreciation"
            label="Annual depreciation"
            value={pct(inputs.annualDepreciation)}
            onChange={v => onChange('annualDepreciation', v / 100)}
            suffix="%"
            step={1}
            tooltip="How much the car's value drops each year as a percentage. New cars typically lose 15–20% per year."
            error={errors.annualDepreciation}
          />
          <Field
            id="clvb-annualInvestReturn"
            label="Investment return"
            value={pct(inputs.annualInvestReturn)}
            onChange={v => onChange('annualInvestReturn', v / 100)}
            suffix="%"
            step={0.5}
            tooltip="Annual return on the money you'd invest instead of spending on the more expensive option. A broad index fund has historically returned ~7% annually."
            error={errors.annualInvestReturn}
          />
          <Field
            id="clvb-yearsToModel"
            label="Years to model"
            value={inputs.yearsToModel}
            onChange={v => onChange('yearsToModel', Math.round(v))}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="How many years to project the comparison. Must be at least as long as the lease term."
            error={errors.yearsToModel}
          />
        </div>
      </div>

    </div>
  );
}
