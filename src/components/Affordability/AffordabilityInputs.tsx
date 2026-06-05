import type { AffordabilityInputs } from '../../lib/affordability';
import type { ValidationErrors } from '../../lib/validation';
import { InfoTooltip } from '../ui/InfoTooltip';
import { NumericInput } from '../ui/NumericInput';

interface Props {
  inputs: AffordabilityInputs;
  onChange: (key: keyof AffordabilityInputs, value: number) => void;
  errors: ValidationErrors;
}

export function AffordabilityInputs({ inputs, onChange, errors }: Props) {
  const annualIncome = Math.round(inputs.grossMonthlyIncome * 12);
  const downPct = Math.round(inputs.downPaymentPct * 100);
  const mortgageRatePct = parseFloat((inputs.mortgageRate * 100).toFixed(3));
  const frontEndPct = Math.round(inputs.frontEndDTI * 100);
  const backEndPct = Math.round(inputs.backEndDTI * 100);
  const propTaxPct = parseFloat((inputs.propertyTaxRate * 100).toFixed(2));
  const insurancePct = parseFloat((inputs.insuranceRate * 100).toFixed(2));
  const closingCostsPct = parseFloat((inputs.closingCostsPct * 100).toFixed(1));

  return (
    <div data-print="hide" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Annual Household Income — full width */}
      <div className="md:col-span-2 glass-panel p-6 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">payments</span>
          <div className="flex items-center gap-1.5">
            <h3 className="text-label-md text-on-surface">Annual Household Income</h3>
            <InfoTooltip text="Your total yearly income before taxes are taken out. Use combined income if applying with a co-borrower." />
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant select-none">$</span>
          <NumericInput
            id="aff-annualIncome"
            value={annualIncome}
            step={5000}
            min={0}
            onChange={v => onChange('grossMonthlyIncome', v / 12)}
            className={`w-full bg-surface-container border rounded-lg py-4 pl-10 pr-4 text-headline-md font-mono-data focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all ${errors.grossMonthlyIncome ? 'border-red-500/70' : 'border-border-subtle'}`}
          />
        </div>
        {errors.grossMonthlyIncome && (
          <p className="text-xs text-red-400">{errors.grossMonthlyIncome}</p>
        )}
      </div>

      {/* Down Payment */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-label-md text-on-surface">Down Payment</h3>
          <InfoTooltip text="The upfront cash you pay before borrowing the rest. A bigger down payment means a smaller loan and no PMI at 20% or more." />
        </div>
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
        <div className="flex items-center gap-1.5">
          <h3 className="text-label-md text-on-surface">Monthly Debts</h3>
          <InfoTooltip text="Monthly payments you already owe — car loans, student loans, and credit card minimums. Do not include housing costs here." />
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant select-none">$</span>
          <NumericInput
            id="aff-monthlyDebts"
            value={inputs.monthlyDebts}
            step={50}
            min={0}
            onChange={v => onChange('monthlyDebts', v)}
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

      {/* Loan Parameters — full width */}
      <div className="md:col-span-2 glass-panel p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label htmlFor="aff-mortgageRate" className="text-label-sm text-on-surface-variant">
              Interest Rate (%)
            </label>
            <InfoTooltip text="The interest rate on your home loan. The higher this is, the more you pay each month." />
          </div>
          <NumericInput
            id="aff-mortgageRate"
            value={mortgageRatePct}
            step={0.125}
            min={0}
            onChange={v => onChange('mortgageRate', v / 100)}
            className={`bg-surface-container border rounded-lg p-4 text-body-md font-mono-data focus:border-primary-accent outline-none transition-all ${errors.mortgageRate ? 'border-red-500/70' : 'border-border-subtle'}`}
          />
          {errors.mortgageRate && (
            <p className="text-xs text-red-400">{errors.mortgageRate}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label htmlFor="aff-loanTermYears" className="text-label-sm text-on-surface-variant">
              Loan Term
            </label>
            <InfoTooltip text="How many years you have to pay off the loan. A 30-year term has lower monthly payments but more total interest." />
          </div>
          <select
            id="aff-loanTermYears"
            value={inputs.loanTermYears}
            onChange={e => onChange('loanTermYears', parseInt(e.target.value, 10))}
            className="bg-surface-container border border-border-subtle rounded-lg p-4 text-body-md focus:border-primary-accent outline-none appearance-none transition-all"
          >
            <option value={50}>50 Year Fixed</option>
            <option value={30}>30 Year Fixed</option>
            <option value={20}>20 Year Fixed</option>
            <option value={15}>15 Year Fixed</option>
          </select>
        </div>
      </div>

      {/* DTI Limits */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>balance</span>
          <h3 className="text-label-md text-on-surface">DTI Limits</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="aff-frontEndDTI" className="text-label-sm text-on-surface-variant">
                Front-End DTI (%)
              </label>
              <InfoTooltip text="The max percentage of your monthly income that can go toward housing costs. Most lenders want this at 28% or below." />
            </div>
            <NumericInput
              id="aff-frontEndDTI"
              value={frontEndPct}
              step={1}
              min={5}
              max={50}
              onChange={v => onChange('frontEndDTI', v / 100)}
              className={`bg-surface-container border rounded-lg p-3 text-body-md font-mono-data focus:border-primary-accent outline-none transition-all ${errors.frontEndDTI ? 'border-red-500/70' : 'border-border-subtle'}`}
            />
            {errors.frontEndDTI && <p className="text-xs text-red-400">{errors.frontEndDTI}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="aff-backEndDTI" className="text-label-sm text-on-surface-variant">
                Back-End DTI (%)
              </label>
              <InfoTooltip text="The max percentage of your income that can go toward all debt payments combined — housing plus car loans, student loans, and credit cards." />
            </div>
            <NumericInput
              id="aff-backEndDTI"
              value={backEndPct}
              step={1}
              min={5}
              max={50}
              onChange={v => onChange('backEndDTI', v / 100)}
              className={`bg-surface-container border rounded-lg p-3 text-body-md font-mono-data focus:border-primary-accent outline-none transition-all ${errors.backEndDTI ? 'border-red-500/70' : 'border-border-subtle'}`}
            />
            {errors.backEndDTI && <p className="text-xs text-red-400">{errors.backEndDTI}</p>}
          </div>
        </div>
      </div>

      {/* Property Costs */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>home</span>
          <h3 className="text-label-md text-on-surface">Property Costs</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="aff-propertyTax" className="text-label-sm text-on-surface-variant">
                Property Tax (% / yr)
              </label>
              <InfoTooltip text="A yearly fee your local government charges for owning a home. Typically 0.5–2% of the home's value each year." />
            </div>
            <NumericInput
              id="aff-propertyTax"
              value={propTaxPct}
              step={0.1}
              min={0}
              onChange={v => onChange('propertyTaxRate', v / 100)}
              className="bg-surface-container border border-border-subtle rounded-lg p-3 text-body-md font-mono-data focus:border-primary-accent outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="aff-insurance" className="text-label-sm text-on-surface-variant">
                Insurance (% / yr)
              </label>
              <InfoTooltip text="Homeowner's insurance as a percentage of the home's value each year. Protects against fire, storms, and other damage." />
            </div>
            <NumericInput
              id="aff-insurance"
              value={insurancePct}
              step={0.05}
              min={0}
              onChange={v => onChange('insuranceRate', v / 100)}
              className="bg-surface-container border border-border-subtle rounded-lg p-3 text-body-md font-mono-data focus:border-primary-accent outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="aff-hoa" className="text-label-sm text-on-surface-variant">
                HOA / Maintenance ($/mo)
              </label>
              <InfoTooltip text="HOA fees are monthly dues for shared community spaces. Maintenance is a budget for things that break or wear out in the home." />
            </div>
            <NumericInput
              id="aff-hoa"
              value={inputs.monthlyHOA}
              step={25}
              min={0}
              onChange={v => onChange('monthlyHOA', v)}
              className="bg-surface-container border border-border-subtle rounded-lg p-3 text-body-md font-mono-data focus:border-primary-accent outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <label htmlFor="aff-closingCosts" className="text-label-sm text-on-surface-variant">
                Closing Costs (% of price)
              </label>
              <InfoTooltip text="Extra fees you pay when finalizing the purchase — paperwork, bank fees, and title checks. Usually 2–5% of the price." />
            </div>
            <NumericInput
              id="aff-closingCosts"
              value={closingCostsPct}
              step={0.5}
              min={0}
              onChange={v => onChange('closingCostsPct', v / 100)}
              className="bg-surface-container border border-border-subtle rounded-lg p-3 text-body-md font-mono-data focus:border-primary-accent outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
