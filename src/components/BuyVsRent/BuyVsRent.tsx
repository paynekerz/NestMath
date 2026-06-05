import { useState, useMemo } from "react";
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

function pct(v: number): number {
  return parseFloat((v * 100).toFixed(4));
}

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
    [
      monthlyMortgage,
      monthlyPropertyTax,
      buy.homePrice,
      buy.insuranceRate,
      buy.monthlyHOA,
    ],
  );
  const yr5Equity = useMemo(() => result.years[4]?.equity ?? 0, [result.years]);

  const buyWins = result.breakEvenYear !== null;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      {/* ── Mobile layout ──────────────────────────── */}
      <div className="block lg:hidden space-y-[16px] pb-[96px] animate-slide-up">
        {/* Strategy Header Card */}
        <section className="bg-surface-elevated border border-border-subtle rounded-xl p-[16px]">
          <div className="flex justify-between items-center mb-[4px]">
            <h1 className="text-headline-md-mobile font-semibold text-on-surface">
              Buy vs. Rent
            </h1>
            {result.years.length > 0 && (
              <span
                className={`text-label-sm px-[8px] py-[4px] rounded-full flex items-center gap-[4px] ${
                  buyWins
                    ? "bg-primary-accent/10 text-primary-accent"
                    : "bg-success-emerald/10 text-success-emerald"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  trending_up
                </span>
                {buyWins ? "Buying Recommended" : "Renting Wins"}
              </span>
            )}
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Precision analysis for long-term equity growth.
          </p>
        </section>

        {/* Mini stat bento — only when results exist */}
        {result.years.length > 0 && (
          <section className="grid grid-cols-2 gap-[12px]">
            <div className="bg-surface-container p-[16px] rounded-xl border border-border-subtle">
              <p className="text-label-sm text-on-surface-variant mb-[8px]">
                EST. MONTHLY COST
              </p>
              <p className="text-headline-md font-bold text-primary">
                {fmt.format(totalMonthlyCost)}
              </p>
              <div className="mt-[4px] h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.min((totalMonthlyCost / 6000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="bg-surface-container p-[16px] rounded-xl border border-border-subtle">
              <p className="text-label-sm text-on-surface-variant mb-[8px]">
                EQUITY IN 5 YRS
              </p>
              <p className="text-headline-md font-bold text-success-emerald">
                {fmt.format(yr5Equity)}
              </p>
              <div className="mt-[4px] h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-success-emerald transition-all duration-300"
                  style={{
                    width: `${Math.min((yr5Equity / buy.homePrice) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Mobile input section */}
        <div className="space-y-[12px]">
          <h2 className="text-label-md uppercase tracking-widest text-on-surface-variant">
            Input Parameters
          </h2>

          {/* Purchase Price slider card */}
          <div className="bg-surface-elevated border border-border-subtle rounded-xl p-[16px] space-y-[12px]">
            <div className="flex justify-between items-end">
              <label
                className="text-label-md text-on-surface"
                htmlFor="m-homePrice"
              >
                Purchase Price
              </label>
              <span className="text-headline-md-mobile font-mono-data text-primary">
                {fmt.format(buy.homePrice)}
              </span>
            </div>
            <input
              id="m-homePrice"
              type="range"
              min={50_000}
              max={2_500_000}
              step={5_000}
              value={buy.homePrice}
              onChange={(e) =>
                handleBuyChange("homePrice", parseFloat(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-label-sm text-on-surface-variant/50">
              <span>$50k</span>
              <span>$2.5M</span>
            </div>
          </div>

          {/* Down Payment + Interest Rate — 2-col compact */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div className="bg-surface-elevated border border-border-subtle rounded-xl p-[16px] space-y-[8px]">
              <label
                className="text-label-sm text-on-surface-variant"
                htmlFor="m-downPayment"
              >
                Down Payment
              </label>
              <div className="flex items-center gap-[4px]">
                <input
                  id="m-downPayment"
                  type="number"
                  value={pct(buy.downPaymentPct).toFixed(0)}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) =>
                    handleBuyChange(
                      "downPaymentPct",
                      (parseFloat(e.target.value) || 0) / 100,
                    )
                  }
                  className="w-full bg-transparent outline-none text-body-md font-mono-data text-on-surface"
                />
                <span className="text-on-surface-variant text-body-md shrink-0">
                  %
                </span>
              </div>
            </div>
            <div className="bg-surface-elevated border border-border-subtle rounded-xl p-[16px] space-y-[8px]">
              <label
                className="text-label-sm text-on-surface-variant"
                htmlFor="m-mortgageRate"
              >
                Interest Rate
              </label>
              <div className="flex items-center gap-[4px]">
                <input
                  id="m-mortgageRate"
                  type="number"
                  value={pct(buy.mortgageRate).toFixed(2)}
                  min={0.1}
                  max={15}
                  step={0.125}
                  onChange={(e) =>
                    handleBuyChange(
                      "mortgageRate",
                      (parseFloat(e.target.value) || 0) / 100,
                    )
                  }
                  className="w-full bg-transparent outline-none text-body-md font-mono-data text-on-surface"
                />
                <span className="text-on-surface-variant text-body-md shrink-0">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Comparison Card */}
          <div className="bg-surface-container-low border border-border-subtle rounded-xl overflow-hidden">
            <div className="p-[12px] border-b border-border-subtle bg-surface-container-high/30">
              <h3 className="text-label-md text-on-surface">
                Monthly Comparison
              </h3>
            </div>
            <div className="p-[16px] space-y-[16px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-2 h-10 rounded-full bg-primary-accent shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">
                    Mortgage P&amp;I
                  </p>
                  <p className="text-body-md font-mono-data text-on-surface">
                    {fmt.format(monthlyMortgage)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-2 h-10 rounded-full bg-secondary shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">
                    Property Taxes
                  </p>
                  <p className="text-body-md font-mono-data text-on-surface">
                    {fmt.format(monthlyPropertyTax)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-2 h-10 rounded-full bg-outline shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">
                    HOA / Maintenance
                  </p>
                  <p className="text-body-md font-mono-data text-on-surface">
                    {fmt.format(buy.monthlyHOA)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA — triggers PDF export */}
          <button
            onClick={() => window.print()}
            className="w-full h-14 bg-primary text-on-primary rounded-xl text-label-md font-semibold flex items-center justify-center gap-[12px] active:scale-95 transition-all shadow-lg"
            data-print="hide"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              insights
            </span>
            Generate Detailed Report
          </button>
        </div>

        {/* Info callout */}
        {result.years.length > 0 && (
          <div className="bg-surface-container-lowest border border-border-subtle p-[16px] rounded-xl flex items-start gap-[16px]">
            <span className="material-symbols-outlined text-primary-accent shrink-0">
              lightbulb
            </span>
            <p className="text-body-sm text-on-surface-variant">
              {result.breakEvenYear ? (
                <>
                  In this market, the breakeven point occurs at{" "}
                  <strong className="text-on-surface">
                    Year {result.breakEvenYear}
                  </strong>
                  . Consider a shorter mortgage term for faster equity
                  acceleration.
                </>
              ) : (
                <>
                  Renting and investing currently leads over your{" "}
                  {assumptions.yearsToModel}-year horizon. Adjust your inputs to
                  explore break-even scenarios.
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* ── Desktop layout ─────────────────────────── */}
      <div className="hidden lg:block">
        {/* Page header */}
        <header className="mb-[32px]" data-print="hide">
          <div className="flex items-start justify-between flex-wrap gap-[16px]">
            <div>
              <h1 className="text-headline-xl font-bold text-on-surface">
                DRAFT - Buy vs. Rent Decision Engine
              </h1>
              <p className="text-body-md text-on-surface-variant mt-[8px]">
                DRAFT - High-precision financial forecasting for long-term
                equity growth.
              </p>
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
        </header>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-[24px]">
          {/* Input aside */}
          <aside
            className="col-span-4 flex flex-col gap-[24px]"
            data-print="hide"
          >
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

          {/* Results main */}
          <main className="col-span-8 flex flex-col gap-[24px]">
            <SummaryVerdict
              result={result}
              yearsToModel={assumptions.yearsToModel}
            />

            <div
              data-print="title"
              data-print-title="Buy vs. Rent Analysis"
              data-date={today}
            >
              <NetWorthChart
                years={result.years}
                breakEvenYear={result.breakEvenYear}
                yearsToModel={assumptions.yearsToModel}
              />
            </div>

            {/* Break-even stats row */}
            <div className="grid grid-cols-3 gap-[24px]">
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

            <p
              data-print="hide"
              className="text-body-sm text-center text-on-surface-variant"
            >
              If this helped you think through a six-figure decision,{" "}
              <KofiButton label="☕ a coffee seems fair." />
            </p>

            <YearTable years={result.years} />
          </main>
        </div>
      </div>
    </div>
  );
}
