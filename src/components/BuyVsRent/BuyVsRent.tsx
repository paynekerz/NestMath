import { useState, useMemo, useEffect } from "react";
import {
  DEFAULT_BUY_INPUTS,
  DEFAULT_RENT_INPUTS,
  DEFAULT_ASSUMPTIONS,
  calculate,
  computeMonthlyPayment,
  type BuyInputs,
  type RentInputs,
  type Assumptions,
} from "../../lib/calculator";
import {
  validateBuyInputs,
  validateRentInputs,
  validateAssumptions,
  hasErrors,
} from "../../lib/validation";
import { InputPanel } from "./InputPanel";
import { AssumptionsPanel } from "./AssumptionsPanel";
import { SummaryVerdict } from "./SummaryVerdict";
import { AffordabilitySnapshot } from "./AffordabilitySnapshot";
import { NetWorthChart } from "./NetWorthChart";
import { ExportPanel } from "./ExportPanel";
import { YearTable } from "./YearTable";
import { KofiButton } from "../ui/KofiButton";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function BuyVsRent() {
  const [buy, setBuy] = useState<BuyInputs>(DEFAULT_BUY_INPUTS);
  const [rent, setRent] = useState<RentInputs>(DEFAULT_RENT_INPUTS);
  const [assumptions, setAssumptions] =
    useState<Assumptions>(DEFAULT_ASSUMPTIONS);

  function handleBuyChange(key: keyof BuyInputs, value: number) {
    setBuy((prev) => ({ ...prev, [key]: value }));
    if (key === "loanTermYears") {
      setAssumptions((prev) => ({ ...prev, yearsToModel: Math.round(value) }));
    }
  }

  function handleRentChange(key: keyof RentInputs, value: number) {
    setRent((prev) => ({ ...prev, [key]: value }));
  }

  function handleAssumptionsChange(key: keyof Assumptions, value: number) {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }

  const buyErrors = useMemo(() => validateBuyInputs(buy), [buy]);
  const rentErrors = useMemo(() => validateRentInputs(rent), [rent]);
  const assumptionErrors = useMemo(
    () => validateAssumptions(assumptions),
    [assumptions],
  );

  const result = useMemo(() => {
    if (
      hasErrors(buyErrors) ||
      hasErrors(rentErrors) ||
      hasErrors(assumptionErrors)
    ) {
      return { years: [], breakEvenYear: null };
    }
    return calculate(buy, rent, assumptions);
  }, [buy, rent, assumptions, buyErrors, rentErrors, assumptionErrors]);

  const loanAmount = useMemo(
    () => buy.homePrice * (1 - buy.downPaymentPct),
    [buy.homePrice, buy.downPaymentPct],
  );
  const monthlyMortgage = useMemo(
    () =>
      computeMonthlyPayment(loanAmount, buy.mortgageRate, buy.loanTermYears),
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
  const monthlyPropertyTax = useMemo(
    () => (buy.homePrice * buy.propertyTaxRate) / 12,
    [buy.homePrice, buy.propertyTaxRate],
  );
  const totalMonthlyCost = useMemo(
    () =>
      monthlyMortgage +
      monthlyPropertyTax +
      (buy.homePrice * buy.insuranceRate) / 12 +
      buy.monthlyHOA,
    [monthlyMortgage, monthlyPropertyTax, buy.homePrice, buy.insuranceRate, buy.monthlyHOA],
  );
  const yr5Equity = useMemo(() => result.years[4]?.equity ?? 0, [result.years]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (result.years.length === 0) return;
    try {
      localStorage.setItem("nm_housing", JSON.stringify({
        monthlyCost: totalMonthlyCost,
        breakEvenYear: result.breakEvenYear,
        equity: yr5Equity,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage may be unavailable
    }
  }, [totalMonthlyCost, result.breakEvenYear, result.years.length, yr5Equity]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Buy vs. Rent Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Model the full financial impact of buying vs. renting, including mortgage amortization, home appreciation, opportunity cost, and taxes, and find the exact year buying breaks even with renting and investing the difference.</p>
        </div>
        <ExportPanel
          buy={buy}
          rent={rent}
          assumptions={assumptions}
          years={result.years}
          breakEvenYear={result.breakEvenYear}
          disabled={result.years.length === 0}
        />
      </div>

      {/* Main grid */}
      <div
        data-print="title"
        data-print-title="Buy vs. Rent Analysis"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Inputs column */}
        <aside className="lg:col-span-4 flex flex-col gap-6" data-print="hide">
          <InputPanel
            buy={buy}
            rent={rent}
            investmentReturn={assumptions.investmentReturn}
            onBuyChange={handleBuyChange}
            onRentChange={handleRentChange}
            onInvestmentReturnChange={(v) =>
              handleAssumptionsChange("investmentReturn", v)
            }
            buyErrors={buyErrors}
            rentErrors={rentErrors}
          />
          <AssumptionsPanel
            assumptions={assumptions}
            onAssumptionsChange={handleAssumptionsChange}
            errors={assumptionErrors}
          />
        </aside>

        {/* Results column */}
        <main className="lg:col-span-8 flex flex-col gap-6" data-print="results-main">
          <SummaryVerdict
            result={result}
            yearsToModel={assumptions.yearsToModel}
          />

          <NetWorthChart
            years={result.years}
            breakEvenYear={result.breakEvenYear}
            yearsToModel={assumptions.yearsToModel}
          />

          {/* Break-even stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="glass-card p-[16px] rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-[8px]">
                Break-even Year
              </p>
              <p className="text-headline-md font-semibold text-on-surface">
                {result.breakEvenYear
                  ? `Year ${result.breakEvenYear}`
                  : result.years.length > 0
                    ? `> ${assumptions.yearsToModel} yr`
                    : "—"}
              </p>
            </div>
            <div className="glass-card p-[16px] rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-[8px]">
                Total Interest Cost
              </p>
              <p className="text-headline-md font-semibold text-error">
                {result.years.length > 0 ? fmt.format(totalInterest) : "—"}
              </p>
            </div>
            <div className="glass-card p-[16px] rounded-xl">
              <p className="text-label-sm text-on-surface-variant mb-[8px]">
                Monthly Delta
              </p>
              <p className="text-headline-md font-semibold text-primary-accent">
                {result.years.length > 0
                  ? `${monthlyDelta >= 0 ? "+" : ""}${fmt.format(monthlyDelta)}`
                  : "—"}
              </p>
            </div>
          </div>

          {result.years.length > 0 && <AffordabilitySnapshot buy={buy} />}

          <YearTable years={result.years} />
        </main>
      </div>

      {result.years.length > 0 && <KofiButton message="If this helped you think through a six-figure decision," />}
    </div>
  );
}
