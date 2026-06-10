import { useMemo } from 'react';
import type { StudentLoanPayoffInputs } from '../../lib/student-loan-payoff';
import { computeMonthlyPayment } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: StudentLoanPayoffInputs;
  onChange: (key: keyof StudentLoanPayoffInputs, value: number) => void;
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

export function StudentLoanPayoffInputs({ inputs, onChange, errors }: Props) {
  const baseMonthlyPayment = useMemo(() => {
    if (inputs.loanBalance > 0 && inputs.interestRate > 0 && inputs.standardTermYears > 0) {
      return computeMonthlyPayment(inputs.loanBalance, inputs.interestRate, inputs.standardTermYears);
    }
    return null;
  }, [inputs.loanBalance, inputs.interestRate, inputs.standardTermYears]);

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Loan details panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>school</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">LOAN DETAILS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="sl-balance"
            label="Loan balance"
            value={inputs.loanBalance}
            onChange={v => onChange('loanBalance', v)}
            prefix="$"
            step={1000}
            tooltip="The total amount you currently owe on your student loan."
            error={errors.loanBalance}
          />
          <Field
            id="sl-rate"
            label="Interest rate"
            value={pct(inputs.interestRate)}
            onChange={v => onChange('interestRate', v / 100)}
            suffix="%"
            step={0.1}
            tooltip="The annual interest rate on your student loan. Federal loan rates range from about 5% to 9% depending on the loan type and year it was issued."
            error={errors.interestRate}
          />
          <Field
            id="sl-term"
            label="Standard term"
            value={inputs.standardTermYears}
            onChange={v => onChange('standardTermYears', Math.round(v))}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="The number of years in your standard repayment plan. The standard federal repayment plan is 10 years."
            error={errors.standardTermYears}
          />

          {baseMonthlyPayment !== null && (
            <div className="mt-auto pt-4 border-t border-border-subtle">
              <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-1">
                <p className="text-label-sm text-on-surface-variant">Standard monthly payment</p>
                <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                  {cur.format(baseMonthlyPayment)}
                </p>
                <p className="text-label-sm text-on-surface-variant">over {inputs.standardTermYears} years</p>
              </div>
            </div>
          )}
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
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">EXTRA PAYMENTS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="sl-extra"
            label="Extra monthly payment"
            value={inputs.extraMonthly}
            onChange={v => onChange('extraMonthly', v)}
            prefix="$"
            step={25}
            tooltip="Any amount you pay above your standard monthly payment goes directly toward reducing your principal, which cuts the total interest you pay and shortens your payoff timeline."
            error={errors.extraMonthly}
          />

          <div className="mt-auto">
            {inputs.extraMonthly > 0 && baseMonthlyPayment !== null ? (
              <div className="rounded-lg bg-primary-container/10 border border-primary/20 px-md py-sm flex flex-col gap-1">
                <p className="text-label-sm text-on-surface-variant">New total monthly payment</p>
                <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
                  {cur.format(baseMonthlyPayment + inputs.extraMonthly)}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {cur.format(baseMonthlyPayment)} standard + {cur.format(inputs.extraMonthly)} extra
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-surface-container px-md py-sm flex flex-col gap-2">
                <p className="text-label-sm text-on-surface-variant">
                  Add an extra monthly payment above to see how much time and interest you'll save.
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  Even $50–$100 extra per month can save thousands in interest.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
