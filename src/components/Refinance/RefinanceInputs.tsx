import type { RefinanceInputs } from '../../lib/calculator';
import { computeMonthlyPayment } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: RefinanceInputs;
  onChange: (key: keyof RefinanceInputs, value: number) => void;
  onToggleCostMode: () => void;
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

export function RefinanceInputs({ inputs, onChange, onToggleCostMode, errors }: Props) {
  const currentMonthlyPI = computeMonthlyPayment(inputs.currentBalance, inputs.currentRate, inputs.remainingTermYears);

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">

      {/* Current Loan panel */}
      <div className="bg-surface-elevated rounded-xl border border-border-subtle overflow-hidden flex flex-col">
        <div className="border-b border-border-subtle px-lg py-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>history</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">CURRENT LOAN</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          <Field
            id="rf-currentBalance"
            label="Principal remaining"
            value={inputs.currentBalance}
            onChange={v => onChange('currentBalance', v)}
            prefix="$"
            step={1000}
            min={1000}
            tooltip="How much you still owe on your current mortgage."
            error={errors.currentBalance}
          />
          <Field
            id="rf-currentRate"
            label="Interest rate"
            value={pct(inputs.currentRate)}
            onChange={v => onChange('currentRate', v / 100)}
            suffix="%"
            step={0.125}
            tooltip="The annual interest rate on your current mortgage."
            error={errors.currentRate}
          />
          <Field
            id="rf-remainingTermYears"
            label="Years left"
            value={inputs.remainingTermYears}
            onChange={v => onChange('remainingTermYears', v)}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="How many years are left on your current mortgage."
            error={errors.remainingTermYears}
          />
          {/* Monthly P&I read-only */}
          <div className="flex flex-col gap-1.5">
            <span className="text-label-sm text-on-surface-variant">Monthly P&amp;I</span>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container border border-border-subtle">
              <span className="text-label-sm text-on-surface-variant">Calculated</span>
              <span className="text-body-sm font-bold tabular-nums text-on-surface">{cur.format(currentMonthlyPI)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Loan Terms panel */}
      <div
        className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col"
        style={{
          border: '1px solid oklch(55% 0.18 250 / 0.4)',
          boxShadow: '0 0 20px rgba(21,84,212,0.1)',
        }}
      >
        <div className="border-b border-primary-accent/20 px-lg py-sm flex items-center gap-2 bg-primary-container/10">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>new_releases</span>
          <span className="text-label-md uppercase tracking-widest text-primary font-semibold">NEW LOAN TERMS</span>
        </div>
        <div className="p-lg flex flex-col gap-4 flex-1">
          {/* Market Refi Rate — large display */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="rf-newRate" className="text-label-sm text-on-surface-variant">Market refi rate</label>
              <InfoTooltip text="The annual interest rate you'd get on the refinanced loan." />
            </div>
            <div className={`flex items-center gap-1 rounded-lg border bg-surface-container px-3 py-2 focus-within:border-primary-accent transition-colors ${errors.newRate ? 'border-error/70' : 'border-border-subtle'}`}>
              <input
                id="rf-newRate"
                type="number"
                value={pct(inputs.newRate)}
                step={0.125}
                min={0}
                onChange={e => onChange('newRate', (parseFloat(e.target.value) || 0) / 100)}
                className="flex-1 min-w-0 bg-transparent outline-none text-right tabular-nums text-primary font-bold"
                style={{ fontSize: 'var(--text-headline-md-size, 1.25rem)' }}
              />
              <span className="text-on-surface-variant text-body-sm select-none">%</span>
            </div>
            {errors.newRate && <p className="text-label-sm text-error">{errors.newRate}</p>}
          </div>

          <Field
            id="rf-newTermYears"
            label="New term"
            value={inputs.newTermYears}
            onChange={v => onChange('newTermYears', v)}
            suffix="yrs"
            step={1}
            min={1}
            tooltip="Length of the new mortgage. Shorter term means higher payments but less total interest paid."
            error={errors.newTermYears}
          />

          {/* Closing Costs with toggle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <label htmlFor="rf-closingCosts" className="text-label-sm text-on-surface-variant">Closing costs</label>
                <InfoTooltip text="Fees to close the new loan: lender fees, title insurance, appraisal. Usually 2–5% of the loan balance." />
              </div>
              <button
                type="button"
                onClick={onToggleCostMode}
                className="text-label-sm text-primary hover:underline"
              >
                {inputs.usesFlatClosingCost ? 'Switch to %' : 'Switch to $'}
              </button>
            </div>
            {inputs.usesFlatClosingCost ? (
              <div className={`flex items-center gap-1 rounded-lg border bg-surface-container px-3 py-2 focus-within:border-primary-accent transition-colors ${errors.closingCostsDollar ? 'border-error/70' : 'border-border-subtle'}`}>
                <span className="text-on-surface-variant text-body-sm select-none">$</span>
                <input
                  id="rf-closingCosts"
                  type="number"
                  value={inputs.closingCostsDollar}
                  step={100}
                  min={0}
                  onChange={e => onChange('closingCostsDollar', parseFloat(e.target.value) || 0)}
                  className="flex-1 min-w-0 bg-transparent outline-none text-body-sm text-right tabular-nums text-on-surface"
                />
              </div>
            ) : (
              <div className={`flex items-center gap-1 rounded-lg border bg-surface-container px-3 py-2 focus-within:border-primary-accent transition-colors ${errors.closingCostsPct ? 'border-error/70' : 'border-border-subtle'}`}>
                <input
                  id="rf-closingCosts"
                  type="number"
                  value={pct(inputs.closingCostsPct)}
                  step={0.25}
                  min={0}
                  onChange={e => onChange('closingCostsPct', (parseFloat(e.target.value) || 0) / 100)}
                  className="flex-1 min-w-0 bg-transparent outline-none text-body-sm text-right tabular-nums text-on-surface"
                />
                <span className="text-on-surface-variant text-body-sm select-none">%</span>
              </div>
            )}
            {(errors.closingCostsDollar || errors.closingCostsPct) && (
              <p className="text-label-sm text-error">{errors.closingCostsDollar || errors.closingCostsPct}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
