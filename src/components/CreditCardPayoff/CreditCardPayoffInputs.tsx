import type { CreditCardPayoffInputs, CCPaymentMode } from '../../lib/credit-card-payoff';
import { backCalcPayment } from '../../lib/credit-card-payoff';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: CreditCardPayoffInputs;
  onChange: (key: keyof CreditCardPayoffInputs, value: number) => void;
  onModeChange: (mode: CCPaymentMode) => void;
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

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function pct(v: number) { return parseFloat((v * 100).toFixed(4)); }

export function CreditCardPayoffInputs({ inputs, onChange, onModeChange, errors }: Props) {
  const computedPayment =
    inputs.paymentMode === 'months' && inputs.balance > 0 && inputs.apr > 0 && inputs.desiredMonths > 0
      ? backCalcPayment(inputs.balance, inputs.apr, inputs.desiredMonths)
      : null;

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Debt details panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>credit_card</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">DEBT DETAILS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="cc-balance"
            label="Current balance"
            value={inputs.balance}
            onChange={v => onChange('balance', v)}
            prefix="$"
            step={100}
            tooltip="The amount you currently owe on your credit card."
            error={errors.balance}
          />
          <Field
            id="cc-apr"
            label="Annual APR"
            value={pct(inputs.apr)}
            onChange={v => onChange('apr', v / 100)}
            suffix="%"
            step={0.1}
            tooltip="The annual percentage rate on your credit card. This is the interest rate you pay if you carry a balance. The national average is around 20–24%."
            error={errors.apr}
          />

          <div className="mt-auto pt-4 border-t border-border-subtle">
            <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-1">
              <p className="text-label-sm text-on-surface-variant">Monthly interest charge</p>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
                {cur.format(inputs.balance * inputs.apr / 12)}
              </p>
              <p className="text-label-sm text-on-surface-variant">at {pct(inputs.apr)}% APR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment strategy panel */}
      <div
        className="bg-surface-elevated rounded-xl flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10 rounded-t-xl">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>payments</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">PAYMENT STRATEGY</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">

          {/* Mode toggle */}
          <div>
            <p className="text-label-sm text-on-surface-variant mb-2">Payment mode</p>
            <div className="flex rounded-lg border border-border-subtle overflow-hidden">
              <button
                type="button"
                onClick={() => onModeChange('payment')}
                className={`flex-1 px-md py-xs text-label-sm font-semibold transition-colors ${inputs.paymentMode === 'payment' ? 'bg-primary-container/30 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                Fixed Payment
              </button>
              <button
                type="button"
                onClick={() => onModeChange('months')}
                className={`flex-1 px-md py-xs text-label-sm font-semibold transition-colors border-l border-border-subtle ${inputs.paymentMode === 'months' ? 'bg-primary-container/30 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                Target Date
              </button>
            </div>
          </div>

          {inputs.paymentMode === 'payment' ? (
            <Field
              id="cc-monthlyPayment"
              label="Monthly payment"
              value={inputs.monthlyPayment}
              onChange={v => onChange('monthlyPayment', v)}
              prefix="$"
              step={10}
              tooltip="How much you plan to pay toward your credit card each month. Higher payments mean less interest and a faster payoff."
              error={errors.monthlyPayment}
            />
          ) : (
            <>
              <Field
                id="cc-desiredMonths"
                label="Pay off in"
                value={inputs.desiredMonths}
                onChange={v => onChange('desiredMonths', Math.round(v))}
                suffix="mo"
                step={1}
                min={1}
                tooltip="The number of months in which you want to be debt-free. The calculator will find the monthly payment required to hit this target."
                error={errors.desiredMonths}
              />
              {computedPayment !== null && (
                <div className="rounded-lg bg-primary-container/10 border border-primary/20 px-md py-sm flex flex-col gap-1">
                  <p className="text-label-sm text-on-surface-variant">Required monthly payment</p>
                  <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                    {cur.format(computedPayment)}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">to pay off in {inputs.desiredMonths} months</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
