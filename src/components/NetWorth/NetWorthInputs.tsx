import type { NetWorthInputs } from '../../lib/net-worth';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: NetWorthInputs;
  onChange: (key: keyof NetWorthInputs, value: number | null) => void;
  errors: ValidationErrors;
  showYoy: boolean;
  onToggleYoy: () => void;
}

interface FieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  tooltip: string;
  error?: string;
}

function Field({ id, label, value, onChange, tooltip, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-label-sm text-on-surface-variant">{label}</label>
        <InfoTooltip text={tooltip} />
      </div>
      <div className={`flex items-center gap-1 rounded-lg border bg-surface-container px-3 py-2 focus-within:border-primary-accent transition-colors ${error ? 'border-error/70' : 'border-border-subtle'}`}>
        <span className="text-on-surface-variant text-body-sm select-none">$</span>
        <input
          id={id}
          type="number"
          value={value}
          min={0}
          step={1000}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 min-w-0 bg-transparent outline-none text-body-sm text-right tabular-nums text-on-surface"
        />
      </div>
      {error && <p className="text-label-sm text-error">{error}</p>}
    </div>
  );
}

export function NetWorthInputs({ inputs, onChange, errors, showYoy, onToggleYoy }: Props) {
  return (
    <div data-print="hide" className="flex flex-col gap-4">

      {/* Two-column asset / liability grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Assets */}
        <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
          <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
            <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '18px' }}>account_balance_wallet</span>
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">ASSETS</span>
          </div>
          <div className="p-lg flex flex-col gap-4">
            <Field
              id="nw-checkingSavings"
              label="Checking / savings"
              value={inputs.checkingSavings}
              onChange={v => onChange('checkingSavings', v)}
              tooltip="Cash in your checking and savings accounts — money you can access right now."
              error={errors.checkingSavings}
            />
            <Field
              id="nw-investments"
              label="Investments / brokerage"
              value={inputs.investments}
              onChange={v => onChange('investments', v)}
              tooltip="Taxable brokerage accounts, stocks, bonds, ETFs, or mutual funds held outside of retirement accounts."
              error={errors.investments}
            />
            <Field
              id="nw-retirement"
              label="Retirement accounts (401k, IRA)"
              value={inputs.retirement}
              onChange={v => onChange('retirement', v)}
              tooltip="Your 401(k), IRA, Roth IRA, 403(b), or other tax-advantaged retirement account balances. Use the current market value."
              error={errors.retirement}
            />
            <Field
              id="nw-homeEquity"
              label="Home equity"
              value={inputs.homeEquity}
              onChange={v => onChange('homeEquity', v)}
              tooltip="Estimated current market value of your home minus what you still owe on your mortgage. If you don't own a home, leave this at $0."
              error={errors.homeEquity}
            />
            <Field
              id="nw-vehicleValue"
              label="Vehicle value"
              value={inputs.vehicleValue}
              onChange={v => onChange('vehicleValue', v)}
              tooltip="Current market value of your car(s) — check Kelley Blue Book or a similar source. Don't subtract the loan balance here; enter that under liabilities."
              error={errors.vehicleValue}
            />
            <Field
              id="nw-otherAssets"
              label="Other assets"
              value={inputs.otherAssets}
              onChange={v => onChange('otherAssets', v)}
              tooltip="Anything else with real monetary value: rental property equity, business ownership stake, valuable collectibles, or cash value life insurance."
              error={errors.otherAssets}
            />
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-surface-elevated rounded-xl border border-border-subtle flex flex-col">
          <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2 rounded-t-xl">
            <span className="material-symbols-outlined text-error" style={{ fontSize: '18px' }}>credit_card</span>
            <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">LIABILITIES</span>
          </div>
          <div className="p-lg flex flex-col gap-4">
            <Field
              id="nw-mortgageBalance"
              label="Mortgage balance"
              value={inputs.mortgageBalance}
              onChange={v => onChange('mortgageBalance', v)}
              tooltip="The remaining principal balance on your mortgage(s). Check your most recent mortgage statement."
              error={errors.mortgageBalance}
            />
            <Field
              id="nw-carLoans"
              label="Car loans"
              value={inputs.carLoans}
              onChange={v => onChange('carLoans', v)}
              tooltip="Outstanding balance on any auto loans. Check your lender's website or your most recent statement."
              error={errors.carLoans}
            />
            <Field
              id="nw-creditCardBalances"
              label="Credit card balances"
              value={inputs.creditCardBalances}
              onChange={v => onChange('creditCardBalances', v)}
              tooltip="Total balances across all credit cards — use the statement balance or current balance, not the credit limit."
              error={errors.creditCardBalances}
            />
            <Field
              id="nw-studentLoans"
              label="Student loans"
              value={inputs.studentLoans}
              onChange={v => onChange('studentLoans', v)}
              tooltip="Remaining balance on all student loans — both federal and private. Check your loan servicer's dashboard."
              error={errors.studentLoans}
            />
            <Field
              id="nw-otherDebt"
              label="Other debt"
              value={inputs.otherDebt}
              onChange={v => onChange('otherDebt', v)}
              tooltip="Any other money you owe: personal loans, medical debt, money owed to family, or any other outstanding obligation."
              error={errors.otherDebt}
            />
          </div>
        </div>
      </div>

      {/* Year-over-year toggle */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>calendar_today</span>
            <span className="text-label-md text-on-surface-variant font-semibold">Year-over-year comparison</span>
            <InfoTooltip text="Enter last year's net worth to see how much you've grown. Leave this off if you just want a snapshot." />
          </div>
          <button
            type="button"
            onClick={onToggleYoy}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${showYoy ? 'bg-primary' : 'bg-border-subtle'}`}
            role="switch"
            aria-checked={showYoy}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${showYoy ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>
        </div>
        {showYoy && (
          <Field
            id="nw-lastYearNetWorth"
            label="Last year's net worth"
            value={inputs.lastYearNetWorth ?? 0}
            onChange={v => onChange('lastYearNetWorth', v)}
            tooltip="Your total net worth from 12 months ago. This enables the year-over-year delta display in the summary."
            error={errors.lastYearNetWorth}
          />
        )}
      </div>
    </div>
  );
}
