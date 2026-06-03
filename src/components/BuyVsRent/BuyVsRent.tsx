import { useState, useMemo } from 'react';
import {
  DEFAULT_BUY_INPUTS,
  DEFAULT_RENT_INPUTS,
  DEFAULT_ASSUMPTIONS,
  calculate,
  computeMonthlyPayment,
  type BuyInputs,
  type RentInputs,
  type Assumptions,
} from '../../lib/calculator';
import {
  validateBuyInputs,
  validateRentInputs,
  validateAssumptions,
  hasErrors,
} from '../../lib/validation';
import { InputPanel } from './InputPanel';
import { AssumptionsPanel } from './AssumptionsPanel';
import { SummaryVerdict } from './SummaryVerdict';
import { AffordabilitySnapshot } from './AffordabilitySnapshot';
import { NetWorthChart } from './NetWorthChart';
import { ExportPanel } from './ExportPanel';
import { YearTable } from './YearTable';
import { KofiButton } from '../ui/KofiButton';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function BuyVsRent() {
  const [buy, setBuy] = useState<BuyInputs>(DEFAULT_BUY_INPUTS);
  const [rent, setRent] = useState<RentInputs>(DEFAULT_RENT_INPUTS);
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);

  function handleBuyChange(key: keyof BuyInputs, value: number) {
    setBuy(prev => ({ ...prev, [key]: value }));
  }

  function handleRentChange(key: keyof RentInputs, value: number) {
    setRent(prev => ({ ...prev, [key]: value }));
  }

  function handleAssumptionsChange(key: keyof Assumptions, value: number) {
    setAssumptions(prev => ({ ...prev, [key]: value }));
  }

  const buyErrors = useMemo(() => validateBuyInputs(buy), [buy]);
  const rentErrors = useMemo(() => validateRentInputs(rent), [rent]);
  const assumptionErrors = useMemo(() => validateAssumptions(assumptions), [assumptions]);

  const result = useMemo(() => {
    if (hasErrors(buyErrors) || hasErrors(rentErrors) || hasErrors(assumptionErrors)) {
      return { years: [], breakEvenYear: null };
    }
    return calculate(buy, rent, assumptions);
  }, [buy, rent, assumptions, buyErrors, rentErrors, assumptionErrors]);

  const loanAmount = useMemo(
    () => buy.homePrice * (1 - buy.downPaymentPct),
    [buy.homePrice, buy.downPaymentPct],
  );
  const monthlyMortgage = useMemo(
    () => computeMonthlyPayment(loanAmount, buy.mortgageRate, buy.loanTermYears),
    [loanAmount, buy.mortgageRate, buy.loanTermYears],
  );
  const totalInterest = useMemo(
    () => monthlyMortgage * buy.loanTermYears * 12 - loanAmount,
    [monthlyMortgage, loanAmount, buy.loanTermYears],
  );
  const monthlyDelta = useMemo(
    () => monthlyMortgage - rent.monthlyRent,
    [monthlyMortgage, rent.monthlyRent],
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Page header */}
      <header className="mb-[32px]" data-print="hide">
        <div className="flex items-start justify-between flex-wrap gap-[16px]">
          <div>
            <p className="text-label-sm text-on-surface-variant mb-[6px]">
              <a href="/" className="hover:text-primary transition-colors">Calculators</a>
              <span className="mx-[6px]">›</span>
              <span>Buy vs. Rent</span>
            </p>
            <h1 className="text-headline-xl font-bold text-on-surface">
              DRAFT - Buy vs. Rent Decision Engine
            </h1>
            <p className="text-body-md text-on-surface-variant mt-[8px]">
              DRAFT - High-precision financial forecasting for long-term equity growth.
            </p>
          </div>
          <div className="flex items-center gap-[8px] self-end shrink-0" data-print="hide">
            <span className="text-label-sm text-on-surface-variant px-[12px] py-[6px] rounded-lg border border-border-subtle hover:border-primary/40 transition-colors cursor-default select-none">
              Export
            </span>
            <span className="text-label-sm text-on-surface-variant px-[12px] py-[6px] rounded-lg border border-border-subtle hover:border-primary/40 transition-colors cursor-default select-none">
              Share
            </span>
          </div>
        </div>
      </header>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-[24px]">

        {/* Input aside */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-[24px]" data-print="hide">
          <InputPanel
            buy={buy}
            rent={rent}
            investmentReturn={assumptions.investmentReturn}
            onBuyChange={handleBuyChange}
            onRentChange={handleRentChange}
            onInvestmentReturnChange={v => handleAssumptionsChange('investmentReturn', v)}
            buyErrors={buyErrors}
            rentErrors={rentErrors}
          />
          <AssumptionsPanel
            assumptions={assumptions}
            onAssumptionsChange={handleAssumptionsChange}
            errors={assumptionErrors}
          />
        </aside>

        {/* Results main */}
        <main className="col-span-12 lg:col-span-8 flex flex-col gap-[24px]">

          <SummaryVerdict result={result} yearsToModel={assumptions.yearsToModel} />

          <div data-print="title" data-print-title="Buy vs. Rent Analysis" data-date={today}>
            <NetWorthChart
              years={result.years}
              breakEvenYear={result.breakEvenYear}
              yearsToModel={assumptions.yearsToModel}
            />
          </div>

          {/* Break-even stats row */}
          <div className="grid grid-cols-3 gap-[24px]">
            <div className="glass-card p-[16px] rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-[8px]">Break-even Year</p>
              <p className="text-headline-md font-semibold text-on-surface">
                {result.breakEvenYear
                  ? `Year ${result.breakEvenYear}`
                  : result.years.length > 0
                    ? `> ${assumptions.yearsToModel} yr`
                    : '—'}
              </p>
            </div>
            <div className="glass-card p-[16px] rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-[8px]">Total Interest Cost</p>
              <p className="text-headline-md font-semibold text-error">
                {result.years.length > 0 ? fmt.format(totalInterest) : '—'}
              </p>
            </div>
            <div className="glass-card p-[16px] rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-[8px]">Monthly Delta</p>
              <p className="text-headline-md font-semibold text-primary-accent">
                {result.years.length > 0
                  ? `${monthlyDelta >= 0 ? '+' : ''}${fmt.format(monthlyDelta)}`
                  : '—'}
              </p>
            </div>
          </div>

          {result.years.length > 0 && <AffordabilitySnapshot buy={buy} />}

          <p data-print="hide" className="text-body-sm text-center text-on-surface-variant">
            If this helped you think through a six-figure decision,{' '}
            <KofiButton label="☕ a coffee seems fair." />
          </p>


          {result.years.length > 0 && (
            <ExportPanel
              buy={buy}
              rent={rent}
              assumptions={assumptions}
              years={result.years}
              breakEvenYear={result.breakEvenYear}
            />
          )}

          <YearTable years={result.years} />


        </main>
      </div>
    </div>
  );
}
