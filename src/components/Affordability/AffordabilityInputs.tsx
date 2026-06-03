import type { AffordabilityInputs } from '../../lib/affordability';
import type { ValidationErrors } from '../../lib/validation';

interface Props {
  inputs: AffordabilityInputs;
  onChange: (key: keyof AffordabilityInputs, value: number) => void;
  errors: ValidationErrors;
}

export function AffordabilityInputs({ inputs, onChange, errors }: Props) {
  const annualIncome = Math.round(inputs.grossMonthlyIncome * 12);
  const downPct = Math.round(inputs.downPaymentPct * 100);
  const mortgageRatePct = parseFloat((inputs.mortgageRate * 100).toFixed(3));

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Annual Household Income — full width */}
      <div className="md:col-span-2 glass-panel p-6 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">payments</span>
          <h3 className="text-label-md text-on-surface">Annual Household Income</h3>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant select-none">$</span>
          <input
            id="aff-annualIncome"
            type="number"
            value={annualIncome}
            step={5000}
            min={0}
            onChange={e => onChange('grossMonthlyIncome', (parseFloat(e.target.value) || 0) / 12)}
            className={`w-full bg-surface-container border rounded-lg py-4 pl-10 pr-4 text-headline-md font-mono-data focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all ${errors.grossMonthlyIncome ? 'border-red-500/70' : 'border-border-subtle'}`}
          />
        </div>
        {errors.grossMonthlyIncome && (
          <p className="text-xs text-red-400">{errors.grossMonthlyIncome}</p>
        )}
      </div>

      {/* Down Payment */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
        <h3 className="text-label-md text-on-surface">Down Payment</h3>
        <div className="flex justify-between items-baseline">
          <span className="text-headline-md font-mono-data text-on-surface">{downPct}%</span>
          <span className="text-label-sm text-on-surface-variant">of max home price</span>
        </div>
        <input
          id="aff-downPaymentPct"
          type="range"
          min={0}
          max={50}
          step={1}
          value={downPct}
          onChange={e => onChange('downPaymentPct', parseInt(e.target.value, 10) / 100)}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-on-surface-variant">
          <span>0%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Monthly Debts */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
        <h3 className="text-label-md text-on-surface">Monthly Debts</h3>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant select-none">$</span>
          <input
            id="aff-monthlyDebts"
            type="number"
            value={inputs.monthlyDebts}
            step={50}
            min={0}
            onChange={e => onChange('monthlyDebts', parseFloat(e.target.value) || 0)}
            className={`w-full bg-surface-container border rounded-lg py-4 pl-10 pr-4 text-body-lg font-mono-data focus:border-primary-accent outline-none transition-all ${errors.monthlyDebts ? 'border-red-500/70' : 'border-border-subtle'}`}
          />
        </div>
        <p className="text-label-sm text-on-surface-variant">
          Include car loans, student loans, and credit card minimums.
        </p>
        {errors.monthlyDebts && (
          <p className="text-xs text-red-400">{errors.monthlyDebts}</p>
        )}
      </div>

      {/* Parameters — full width */}
      <div className="md:col-span-2 glass-panel p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <label htmlFor="aff-mortgageRate" className="text-label-sm text-on-surface-variant">
            Interest Rate (%)
          </label>
          <input
            id="aff-mortgageRate"
            type="number"
            value={mortgageRatePct}
            step={0.125}
            min={0}
            onChange={e => onChange('mortgageRate', (parseFloat(e.target.value) || 0) / 100)}
            className={`bg-surface-container border rounded-lg p-4 text-body-md font-mono-data focus:border-primary-accent outline-none transition-all ${errors.mortgageRate ? 'border-red-500/70' : 'border-border-subtle'}`}
          />
          {errors.mortgageRate && (
            <p className="text-xs text-red-400">{errors.mortgageRate}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="aff-loanTermYears" className="text-label-sm text-on-surface-variant">
            Loan Term
          </label>
          <select
            id="aff-loanTermYears"
            value={inputs.loanTermYears}
            onChange={e => onChange('loanTermYears', parseInt(e.target.value, 10))}
            className="bg-surface-container border border-border-subtle rounded-lg p-4 text-body-md focus:border-primary-accent outline-none appearance-none transition-all"
          >
            <option value={30}>30 Year Fixed</option>
            <option value={20}>20 Year Fixed</option>
            <option value={15}>15 Year Fixed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
