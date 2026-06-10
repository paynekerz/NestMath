[![Buy me a coffee](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/paynekerz)

# NestMath.app

Free financial calculators that answer the questions most people Google. Every calculator runs client-side — no account, no server, no tracking. Your data stays on your device.

Built with Astro 6, React 19, and Tailwind v4. Deployed as a static site on Vercel.

---

## Table of Contents

1. [What is NestMath?](#what-is-nestmath)
2. [Live Demo](#live-demo)
3. [Tools](#tools)
4. [File Structure](#file-structure)
5. [How the Calculators Work](#how-the-calculators-work)
   - [Buy vs. Rent](#buy-vs-rent)
   - [Home Affordability](#home-affordability)
   - [Mortgage Payoff](#mortgage-payoff)
   - [Down Payment Savings Planner](#down-payment-savings-planner)
   - [Refinance Break-Even](#refinance-break-even)
   - [Raise vs. Job Hop](#raise-vs-job-hop)
   - [Renovation ROI vs. Investing](#renovation-roi-vs-investing)
   - [Car Lease vs. Buy vs. Invest](#car-lease-vs-buy-vs-invest)
   - [Investment Fee Impact](#investment-fee-impact)
   - [Effective Hourly Rate](#effective-hourly-rate)
   - [HYSA Calculator](#hysa-calculator)
   - [Credit Card Payoff](#credit-card-payoff)
   - [Student Loan Payoff](#student-loan-payoff)
   - [Debt Payoff Planner](#debt-payoff-planner)
   - [Emergency Fund](#emergency-fund)
   - [Net Worth Snapshot](#net-worth-snapshot)
   - [Retirement Projector](#retirement-projector)
   - [Roth vs. Traditional IRA](#roth-vs-traditional-ira)
   - [Social Security Break-Even](#social-security-break-even)
   - [Tax Withholding Estimator](#tax-withholding-estimator)
   - [Side Income After-Tax](#side-income-after-tax)
6. [Component Reference](#component-reference)
7. [Running Locally](#running-locally)
8. [Stack](#stack)
9. [License](#license)

---

## What is NestMath?

NestMath is a free suite of financial calculators. Every tool answers a specific question — what month buying beats renting, how much house your income supports, what a 1% fund fee costs over 30 years. No account. No ads. No server.

---

## Live Demo

[nestmath.app](https://nestmath.app)

---

## Tools

| Tool | Route | Question answered |
|---|---|---|
| Buy vs. Rent | `/buy-vs-rent` | Should I buy or rent? |
| Home Affordability | `/affordability` | How much house can I afford? |
| Mortgage Payoff | `/payoff` | What if I pay extra each month? |
| Down Payment Savings Planner | `/savings-planner` | How long until I can afford to buy? |
| Refinance Break-Even | `/refinance` | Is refinancing worth it? |
| Raise vs. Job Hop | `/raise-vs-job-hop` | Should I stay or switch jobs? |
| Renovation ROI vs. Investing | `/renovation-roi` | Is renovating worth it? |
| Car Lease vs. Buy vs. Invest | `/car-lease-vs-buy` | Should I lease or buy my next car? |
| Investment Fee Impact | `/investment-fees` | How much do my fund fees cost me? |
| Effective Hourly Rate | `/effective-hourly` | What am I actually making per hour? |
| HYSA Calculator | `/hysa-calculator` | How much will my HYSA actually earn? |
| Credit Card Payoff | `/credit-card-payoff` | How long until my card is paid off? |
| Student Loan Payoff | `/student-loan-payoff` | What does paying extra save me? |
| Debt Payoff Planner | `/debt-payoff-planner` | Avalanche vs. snowball — which saves more? |
| Emergency Fund | `/emergency-fund` | How long until my emergency fund is funded? |
| Net Worth Snapshot | `/net-worth` | What am I actually worth right now? |
| Retirement Projector | `/retirement-projector` | Am I on track to retire? |
| Roth vs. Traditional IRA | `/roth-vs-traditional` | Which IRA saves me more in taxes? |
| Social Security Break-Even | `/social-security-break-even` | When should I claim Social Security? |
| Tax Withholding Estimator | `/tax-withholding` | Am I over- or under-withholding? |
| Side Income After-Tax | `/side-income` | What does my freelance income net after taxes? |

---

## File Structure

```
src/
├── components/
│   ├── Affordability/
│   ├── BuyVsRent/
│   ├── CarLeaseVsBuy/
│   ├── CreditCardPayoff/
│   ├── DebtPayoff/
│   ├── EffectiveHourly/
│   ├── EmergencyFund/
│   ├── HYSA/
│   ├── InvestmentFees/
│   ├── NetWorth/
│   ├── Payoff/
│   ├── RaiseVsJobHop/
│   ├── Refinance/
│   ├── RenovationROI/
│   ├── RetirementProjector/
│   ├── RothVsTraditional/
│   ├── SavingsPlanner/
│   ├── SideIncome/
│   ├── SocialSecurity/
│   ├── StudentLoanPayoff/
│   ├── TaxWithholding/
│   └── ui/
│       ├── Breadcrumb.tsx
│       ├── DTIGauge.tsx
│       ├── ExportPanel.tsx
│       ├── FAQSection.tsx
│       ├── InfoTooltip.tsx
│       ├── KofiButton.tsx
│       ├── Nav.tsx
│       ├── ProgressBar.tsx
│       ├── SideNav.tsx
│       └── StatCard.tsx
├── layouts/
│   └── Base.astro
├── lib/
│   ├── affordability.ts
│   ├── calculator.ts
│   ├── car-lease-vs-buy.ts
│   ├── credit-card-payoff.ts
│   ├── dashboard.ts
│   ├── debt-payoff.ts
│   ├── effective-hourly.ts
│   ├── emergency-fund.ts
│   ├── hysa.ts
│   ├── investment-fees.ts
│   ├── net-worth.ts
│   ├── raise-vs-job-hop.ts
│   ├── renovation-roi.ts
│   ├── retirement-projector.ts
│   ├── roth-vs-traditional.ts
│   ├── savings.ts
│   ├── side-income.ts
│   ├── social-security.ts
│   ├── student-loan-payoff.ts
│   ├── tax-withholding.ts
│   └── validation.ts
├── pages/
│   ├── index.astro
│   ├── affordability.astro
│   ├── buy-vs-rent.astro
│   ├── car-lease-vs-buy.astro
│   ├── credit-card-payoff.astro
│   ├── debt-payoff-planner.astro
│   ├── effective-hourly.astro
│   ├── emergency-fund.astro
│   ├── hysa-calculator.astro
│   ├── investment-fees.astro
│   ├── net-worth.astro
│   ├── payoff.astro
│   ├── raise-vs-job-hop.astro
│   ├── refinance.astro
│   ├── renovation-roi.astro
│   ├── retirement-projector.astro
│   ├── roth-vs-traditional.astro
│   ├── savings-planner.astro
│   ├── side-income.astro
│   ├── social-security-break-even.astro
│   ├── student-loan-payoff.astro
│   └── tax-withholding.astro
└── styles/
    └── global.css
public/
├── llms.txt
├── robots.txt
└── sitemap.xml
```

---

## How the Calculators Work

All calculation logic lives in pure TypeScript functions under `src/lib/`. No side effects, no React — just input → output. Components call these functions on every state change and render the results.

---

### Buy vs. Rent

**Source:** `src/lib/calculator.ts` → `calculate()`

Answers: Should I buy or rent over a given horizon?

Runs a year-by-year loop from year 1 to `yearsToModel`. Each iteration computes the buyer's net worth and the renter's net worth. Break-even is the first year where the buyer's net worth exceeds the renter's.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Monthly P&I payment | `P` | `L × [r(1+r)^n] / [(1+r)^n − 1]` |
| Home value at year Y | `HV_Y` | `HomePrice × (1 + a)^Y` |
| Annual mortgage interest deduction | `D_Y` | `annualInterest_Y × marginalTaxRate` |
| Annual buy cost | `BC_Y` | `effectivePayment_Y − D_Y + HV_Y × (propertyTaxRate + insuranceRate) + HOA × 12` |
| Annual rent cost | `RC_Y` | `monthlyRent_Y × 12 + rentersInsurance × 12` |
| Invested down payment (renter) | `IDP_Y` | `(DownPayment + ClosingCosts) × (1 + i)^Y` |
| Renter's cumulative invested | `CI_Y` | `CI_{Y-1} × (1 + i) + max(0, BC_Y − RC_Y)` |
| Buy net worth | `BNW_Y` | `(HV_Y − RemainingBalance_Y) − ClosingCosts` |
| Rent net worth | `RNW_Y` | `IDP_Y + CI_Y` |
| Break-even year | — | First Y where `BNW_Y > RNW_Y` |

**Variable definitions:**

| Symbol | Meaning |
|---|---|
| `L` | Loan amount (`HomePrice × (1 − downPaymentPct)`) |
| `r` | Monthly interest rate (`annualRate / 12`) |
| `n` | Total loan months (`loanTermYears × 12`) |
| `a` | Annual home appreciation rate |
| `i` | Annual investment return rate |

When buying costs more than renting in a given year (`BC_Y > RC_Y`), the surplus is added to the renter's investment portfolio and compounds at the investment return rate. This is the mechanism that lets renting win in high-cost markets.

---

### Home Affordability

**Source:** `src/lib/affordability.ts` → `calcMaxHomePrice()`

Answers: How much house can I afford?

Works backward from income using the front-end DTI limit. Because property tax and insurance are percentages of home price, PITI is non-linear with respect to price — a 64-iteration binary search finds the exact maximum price.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Monthly P&I | `P&I` | `computeMonthlyPayment(loanAmount, mortgageRate, loanTermYears)` |
| Monthly property tax | `Tax` | `HomePrice × propertyTaxRate / 12` |
| Monthly insurance | `Ins` | `HomePrice × insuranceRate / 12` |
| PITI | — | `P&I + Tax + Ins + monthlyHOA` |
| Max monthly payment target | `MaxPITI` | `grossMonthlyIncome × frontEndDTI` |
| Max home price | — | Binary search: largest `HomePrice` where `PITI(HomePrice) ≤ MaxPITI` |
| Front-end DTI | — | `PITI / grossMonthlyIncome` |
| Back-end DTI | — | `(PITI + monthlyDebts) / grossMonthlyIncome` |
| Cash to close | — | `HomePrice × downPaymentPct + HomePrice × closingCostsPct` |

---

### Mortgage Payoff

**Source:** `src/lib/calculator.ts` → `calcPayoff()` and `amortizeYear()`

Answers: What if I pay extra each month?

Both the base path and the extra-payment path use `amortizeYear()`, which applies 12 monthly amortization steps and returns end balance, annual interest, and total payment. Extra payoff month is found via a separate monthly simulation loop.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Monthly P&I payment | `P` | `L × [r(1+r)^n] / [(1+r)^n − 1]` |
| Monthly interest | `I_m` | `Balance_{m-1} × r` |
| Monthly principal | `Prin_m` | `min(P + extraPayment − I_m, Balance_{m-1})` |
| New balance | `Bal_m` | `max(0, Balance_{m-1} − Prin_m)` |
| Months saved | — | `originalPayoffMonths − extraPayoffMonths` |
| Interest saved | — | `totalInterestOriginal − totalInterestExtra` |

---

### Down Payment Savings Planner

**Source:** `src/lib/savings.ts` → `calcSavingsPlan()`

Answers: How long until I can afford to buy?

Runs a month-by-month savings loop with HYSA-style monthly compounding until the balance reaches the cash-to-close target (capped at 360 months / 30 years).

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Cash to close (savings target) | `CTC` | `HomePrice × (downPaymentPct + closingCostsPct)` |
| Savings at month m | `S_m` | `S_{m-1} × (1 + annualReturn/12) + monthlySavings` |
| Growth from returns | — | `totalSaved − (currentSavings + monthlySavings × months)` |
| Months to goal | — | First m where `S_m ≥ CTC` |

---

### Refinance Break-Even

**Source:** `src/lib/calculator.ts` → `calcRefinance()`

Answers: Should I refinance?

Computes the monthly payment on both the current loan and the proposed new loan, then divides closing costs by the monthly savings to find break-even.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Current monthly payment | — | `computeMonthlyPayment(balance, currentRate, remainingTerm)` |
| New monthly payment | — | `computeMonthlyPayment(balance, newRate, newTerm)` |
| Monthly savings | — | `currentPayment − newPayment` |
| Closing costs | — | `balance × closingCostsPct` (or flat dollar) |
| Break-even months | — | `⌈closingCosts / monthlySavings⌉` |
| Net savings | — | `totalInterestCurrent − totalInterestRefinanced − closingCosts` |
| Verdict | — | Worth it if `breakEvenMonths ≤ remainingTermMonths` |

---

### Raise vs. Job Hop

**Source:** `src/lib/raise-vs-job-hop.ts` → `calcRaiseVsJobHop()`

Answers: Should I stay or switch jobs?

Two compounding salary paths. Cumulative earnings are the running total of all annual salaries paid — not just the current year's salary — so the break-even year reflects when you've actually earned more in total by switching.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Annual salary (stay), year n | `Salary_n^{stay}` | `currentSalary × (1 + stayRaise)^n` |
| Annual salary (hop), year n | `Salary_n^{hop}` | `hopSalary × (1 + hopRaise)^n` |
| Cumulative earnings (stay) | `C_n^{stay}` | `∑ Salary_i^{stay}` for i = 1 to n |
| Cumulative earnings (hop) | `C_n^{hop}` | `∑ Salary_i^{hop}` for i = 1 to n |
| Break-even year | — | First n where `C_n^{hop} > C_n^{stay}` |
| Lifetime delta | — | `C_N^{hop} − C_N^{stay}` at final year N |

---

### Renovation ROI vs. Investing

**Source:** `src/lib/renovation-roi.ts` → `calcRenovationROI()`

Answers: Is renovating worth it — or should I invest the money?

The renovation premium compounds with home appreciation each year (the added value grows at the same rate as the rest of the home). The investment path compounds the same dollar amount at the market return rate.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Home value with reno, year n | `HV_n` | `homeValue × (1 + valueIncreasePct) × (1 + appreciation)^n` |
| Renovation gain, year n | `Gain_n` | `homeValue × valueIncreasePct × (1 + appreciation)^n` |
| Renovation net gain (at sale) | — | `Gain_N − renovationCost` |
| Investment value, year n | `IV_n` | `renovationCost × (1 + investReturn)^n` |
| Investment net gain (at sale) | — | `IV_N − renovationCost` |
| Renovation ROI % | — | `renoNetGain / renovationCost × 100` |
| Winner | — | Higher net gain between the two paths |

---

### Car Lease vs. Buy vs. Invest

**Source:** `src/lib/car-lease-vs-buy.ts` → `calcCarLeaseVsBuy()`

Answers: Should I lease, buy, or buy cheaper and invest the difference?

Three-way net cost comparison. The "invest the delta" path takes the absolute monthly payment difference between the lease and buy paths, compounds it monthly at the investment return rate, and subtracts that portfolio value from the more-expensive path's net cost.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Monthly loan payment | — | `computeMonthlyPayment(loanAmount, loanRate, loanTermMonths/12)` |
| Car value at year n | `V_n` | `carPrice × (1 − annualDepreciation)^n` |
| Net cost (buy) at year n | — | `cumBuyPaid_n − V_n` |
| Invest-the-delta portfolio, month m | `Port_m` | `Port_{m-1} × (1 + annualReturn/12) + |lease_m − buy_m|` |
| Net cost (invest path) at year n | — | `max(cumulativeLease_n, netCostBuy_n) − Port_n` |
| Winner | — | Lowest net cost among all three paths at the model horizon |

---

### Investment Fee Impact

**Source:** `src/lib/investment-fees.ts` → `calcInvestmentFees()`

Answers: How much does my expense ratio cost me over time?

Both portfolios grow with the same contribution schedule. The only difference is the net return after fees. The compounding divergence grows exponentially — the fee drag at year 30 far exceeds the sum of annual fees paid.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Net monthly return (current fees) | `r_high` | `(grossReturn − currentExpenseRatio) / 12` |
| Net monthly return (low-cost) | `r_low` | `(grossReturn − lowCostExpenseRatio) / 12` |
| Portfolio at month m | `FV_m` | `FV_{m-1} × (1 + r) + monthlyContribution` |
| Cumulative fee drag | — | `portfolioLowCost − portfolioCurrentFees` |
| Fee drag % | — | `feeDragDollar / portfolioLowCost × 100` |

Closed-form equivalent: `FV = PV × (1+r)^n + PMT × ((1+r)^n − 1) / r`, where `r` is the monthly net return and `n` is total months. The loop matches this exactly.

---

### Effective Hourly Rate

**Source:** `src/lib/effective-hourly.ts` → `calcEffectiveHourly()`

Answers: What am I actually making per hour?

Adjusts gross salary for taxes (including fixed 7.65% FICA), annual work expenses, and total real hours — which includes contracted hours plus unpaid overtime, commute, and prep/decompression time.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Annual take-home | — | `gross × (1 − federalRate − stateRate − 0.0765)` |
| Adjusted take-home | — | `annualTakeHome − monthlyExpenses × 12` |
| Stated gross hourly | — | `gross / (weeklyHoursWorked × weeksPerYear)` |
| Hidden hours per week | — | `unpaidOvertime + commuteHours + prepDecompression` |
| Total real hours per week | — | `weeklyHoursWorked + hiddenHoursPerWeek` |
| Effective net hourly | — | `adjustedTakeHome / (totalRealHoursPerWeek × weeksPerYear)` |
| Delta | — | `statedGrossHourly − effectiveNetHourly` |

FICA (Social Security + Medicare) is fixed at 7.65% and not exposed as an input — it is a constant employee-side rate.

---

### HYSA Calculator

**Source:** `src/lib/hysa.ts` → `calcHYSA()`

Answers: How much will my HYSA earn compared to a traditional savings account?

Both accounts run the same compound-interest formula; only the APY differs. Monthly compounding is used — the difference from daily compounding is negligible at typical consumer HYSA rates.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Balance at month m | `B_m` | `B_{m-1} × (1 + APY/12) + monthlyContribution` |
| Interest earned | — | `finalBalance − totalContributions` |
| Extra earned vs. traditional | — | `finalBalanceHYSA − finalBalanceTraditional` |

Closed-form: `FV = PV × (1+r)^n + PMT × ((1+r)^n − 1) / r` where `r = APY/12` and `n` = total months.

---

### Credit Card Payoff

**Source:** `src/lib/credit-card-payoff.ts` → `calcCreditCardPayoff()`

Answers: How long until my credit card is paid off?

Runs two month-by-month simulations — one at the user's payment, one at the minimum payment — and compares total interest and payoff time. When the user enters a desired payoff timeline instead of a payment, the required payment is back-calculated from the annuity formula.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Monthly interest | `I_m` | `Balance_{m-1} × APR/12` |
| Principal paid | `Prin_m` | `payment − I_m` |
| Required payment for N months | `PMT` | `(balance × r) / (1 − (1+r)^{−N})` where `r = APR/12` |
| Minimum payment | — | `max(balance × 0.02, $25)` |

---

### Student Loan Payoff

**Source:** `src/lib/student-loan-payoff.ts` → `calcStudentLoanPayoff()`

Answers: What does paying extra on my student loans actually save?

Uses the same `amortizeYear()` helper as Mortgage Payoff. Two amortization paths — standard term vs. accelerated with extra monthly payments — are compared for interest paid and payoff date.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Monthly payment | `P` | `L × [r(1+r)^n] / [(1+r)^n − 1]` |
| Monthly interest | `I_m` | `Balance_{m-1} × r` |
| Monthly principal | `Prin_m` | `min(P + extraPayment − I_m, Balance_{m-1})` |
| Months saved | — | `standardPayoffMonths − acceleratedPayoffMonths` |
| Interest saved | — | `totalInterestStandard − totalInterestAccelerated` |

Same amortization logic as Mortgage Payoff — see that section for variable definitions.

---

### Debt Payoff Planner

**Source:** `src/lib/debt-payoff.ts` → `calcDebtPayoff()`

Answers: Which payoff order saves the most — avalanche or snowball?

Runs two monthly simulations across up to 6 debts. Each month, minimum payments are applied to all active debts, then the extra budget targets the priority debt. When a debt reaches zero, its freed minimum cascades to the next target (the "debt avalanche" or "debt snowball" acceleration).

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Monthly interest per debt | `I_m` | `balance_m × (APR/12)` |
| Avalanche priority | — | Highest APR debt with remaining balance > 0 |
| Snowball priority | — | Lowest remaining balance debt |
| Freed minimum cascade | — | When a debt hits $0, its `minPayment` is added to `availableExtra` for the next target |
| Interest saved by avalanche | — | `snowball.totalInterest − avalanche.totalInterest` |

---

### Emergency Fund

**Source:** `src/lib/emergency-fund.ts` → `calcEmergencyFund()`

Answers: How long until my emergency fund is funded?

Runs a month-by-month savings loop with HYSA compounding. Finds separate crossing points for the 3-month and 6-month targets.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| 3-month target | — | `monthlyExpenses × 3` |
| 6-month target | — | `monthlyExpenses × 6` |
| Current months of coverage | — | `currentSavings / monthlyExpenses` |
| Savings at month m | `S_m` | `S_{m-1} + S_{m-1} × APY/12 + monthlySavings` |
| Months to target | — | First m where `S_m ≥ target` (computed for each target separately) |

---

### Net Worth Snapshot

**Source:** `src/lib/net-worth.ts` → `calcNetWorth()`

Answers: What am I actually worth right now?

Pure arithmetic — no compounding or iteration. Sums assets and liabilities across all categories, subtracts to produce net worth, and optionally computes year-over-year change.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Total assets | — | `checkingSavings + investments + retirement + homeEquity + vehicleValue + otherAssets` |
| Total liabilities | — | `mortgage + carLoans + creditCards + studentLoans + otherDebt` |
| Net worth | — | `totalAssets − totalLiabilities` |
| Year-over-year change | — | `netWorth − lastYearNetWorth` (shown only when prior year value is entered) |

---

### Retirement Projector

**Source:** `src/lib/retirement-projector.ts` → `calcRetirementProjector()`

Answers: Am I on track to retire?

Year-by-year compound growth with employer match. Inflation adjustment converts the nominal projected balance into today's dollars. Target balance derived from the 4% safe withdrawal rule.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Annual employer match | — | `min(annualContribution / (matchLimitPct × salary), 1) × employerMatchPct × salary` |
| Year-end balance | `B_i` | `B_{i-1} × (1 + r) + (annualContribution + employerMatch)` |
| Inflation-adjusted balance | — | `projectedBalance / (1 + inflation)^yearsToRetirement` |
| Monthly income (4% rule) | — | `inflationAdjustedBalance × 0.04 / 12` |
| Target balance (25× rule) | — | `25 × annualExpenses` |
| Shortfall / surplus | — | `inflationAdjustedBalance − targetBalance` |

The 25× target is the inverse of the 4% rule: if you withdraw 4% per year, you need `income / 0.04 = 25 × income` saved.

---

### Roth vs. Traditional IRA

**Source:** `src/lib/roth-vs-traditional.ts` → `calcRothVsTraditional()`

Answers: Which IRA saves me more in taxes over my lifetime?

Both account types grow identically — same contribution, same return. The difference is when taxes apply: Roth uses after-tax dollars and withdrawals are tax-free; Traditional defers tax until withdrawal at the retirement rate.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Balance at year i (both) | `B_i` | `B_{i-1} × (1 + r) + annualContribution` |
| Roth final value | — | `B_N` (no withdrawal tax) |
| Traditional after-tax value | — | `B_N × (1 − retirementTaxRate)` |
| Annual tax savings now (Traditional) | — | `annualContribution × currentTaxRate` |
| Tax owed at retirement (Traditional) | — | `grossBalance × retirementTaxRate` |
| Net advantage | — | `|rothFinal − tradAfterTax|` |

Roth wins when `currentTaxRate > retirementTaxRate`. Traditional wins when you expect to be in a lower bracket in retirement.

---

### Social Security Break-Even

**Source:** `src/lib/social-security.ts` → `calcSocialSecurity()`

Answers: When should I start claiming Social Security?

Estimates your PIA using the SSA's bend-point formula (2024 values), then computes cumulative lifetime benefits for each claiming age, finding the crossover points.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| AIME | — | `annualIncome / 12` |
| PIA (bend-point formula) | — | `0.90 × min(AIME, $1,174) + 0.32 × (min(AIME, $7,078) − $1,174)⁺ + 0.15 × (AIME − $7,078)⁺` |
| Monthly benefit at 62 | — | `PIA × 0.70` |
| Monthly benefit at 67 (FRA) | — | `PIA` |
| Monthly benefit at 70 | — | `PIA × 1.24` |
| Lifetime total at claim age A | — | `monthly_A × 12 × (lifeExpectancy − A)` |
| Break-even age (62 vs. 67) | — | First age where `cumulativeAt67 > cumulativeAt62` |
| Break-even age (67 vs. 70) | — | First age where `cumulativeAt70 > cumulativeAt67` |

`(x)⁺` denotes `max(0, x)`. Bend points are 2024 SSA values; update annually.

---

### Tax Withholding Estimator

**Source:** `src/lib/tax-withholding.ts` → `calcTaxWithholding()`

Answers: Am I over- or under-withholding?

Applies 2025 federal tax brackets progressively to estimate the year's tax liability, then compares it to current withholding. Does not account for credits, AMT, or state taxes — see IRS withholding estimator for exact figures.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Adjusted gross income | `AGI` | `grossW2 + otherIncome − preTaxDeductions` |
| Taxable income | — | `max(0, AGI − standardDeduction)` |
| Federal tax | — | Progressive bracket computation on taxable income |
| Difference | — | `currentWithholding − estimatedFederalTax` (positive = refund; negative = owed) |
| Quarterly estimate | — | `totalTaxOwed / 4` (shown if under-withheld by > $1,000) |

**2025 federal tax brackets:**

| Rate | Single | Married Filing Jointly | Head of Household |
|---|---|---|---|
| 10% | $0 – $11,925 | $0 – $23,850 | $0 – $17,000 |
| 12% | $11,926 – $48,475 | $23,851 – $96,950 | $17,001 – $64,850 |
| 22% | $48,476 – $103,350 | $96,951 – $206,700 | $64,851 – $103,350 |
| 24% | $103,351 – $197,300 | $206,701 – $394,600 | $103,351 – $197,300 |
| 32% | $197,301 – $250,525 | $394,601 – $501,050 | $197,301 – $250,500 |
| 35% | $250,526 – $626,350 | $501,051 – $751,600 | $250,501 – $626,350 |
| 37% | $626,351+ | $751,601+ | $626,351+ |

Standard deductions (2025): $15,000 (single), $30,000 (MFJ), $22,500 (HOH).

---

### Side Income After-Tax

**Source:** `src/lib/side-income.ts` → `calcSideIncome()`

Answers: What does my freelance income net after self-employment tax and income tax?

Applies the IRS Schedule C self-employment tax formula, then calculates the marginal federal income tax by comparing total income (W-2 + side income) against W-2 income alone.

**Core equations:**

| Output | Symbol | Formula |
|---|---|---|
| Net SE income | — | `grossSideIncome − businessExpenses` |
| SE tax base | — | `netSEIncome × 0.9235` |
| Self-employment tax | — | `min(seTaxBase, $176,100) × 0.153 + max(0, seTaxBase − $176,100) × 0.029` |
| SE tax deduction | — | `selfEmploymentTax / 2` |
| Taxable SE income | — | `netSEIncome − seTaxDeduction` |
| Income tax on side income | — | `calcFederalIncomeTax(W2 + SEincome) − calcFederalIncomeTax(W2)` |
| True take-home | — | `netSEIncome − selfEmploymentTax − incomeTaxOnSideIncome` |
| Quarterly estimated payment | — | `totalTax / 4` (shown if total tax > $1,000) |

The SE tax rate is 15.3% (12.4% Social Security + 2.9% Medicare) up to the 2025 SS wage base of $176,100. Above that, only the 2.9% Medicare portion applies. The 92.35% factor reduces the base because the employer half of SE tax is notionally deducted before tax is calculated.

---

## Component Reference

| Component | File | Purpose |
|---|---|---|
| `BuyVsRent` | `src/components/BuyVsRent/BuyVsRent.tsx` | Root island — owns all state, runs `calculate()` on every input change |
| `InputPanel` | `src/components/BuyVsRent/InputPanel.tsx` | Two-column buy/rent input form with range sliders and tooltips |
| `AssumptionsPanel` | `src/components/BuyVsRent/AssumptionsPanel.tsx` | Collapsible advanced inputs (appreciation, investment return, tax rate) |
| `AffordabilitySnapshot` | `src/components/BuyVsRent/AffordabilitySnapshot.tsx` | Inline affordability check using current buy inputs |
| `SummaryVerdict` | `src/components/BuyVsRent/SummaryVerdict.tsx` | Break-even year card and recommendation prose |
| `NetWorthChart` | `src/components/BuyVsRent/NetWorthChart.tsx` | Buy vs. rent net worth line chart (Recharts) |
| `ExportPanel` | `src/components/BuyVsRent/ExportPanel.tsx` | CSV download and print-to-PDF buttons |
| `YearTable` | `src/components/BuyVsRent/YearTable.tsx` | Collapsible year-by-year breakdown table |
| `FAQSection` | `src/components/ui/FAQSection.tsx` | Collapsible `<details>/<summary>` FAQ — no JS |
| `InfoTooltip` | `src/components/ui/InfoTooltip.tsx` | `(i)` icon with hover/click tooltip — keyboard accessible |
| `KofiButton` | `src/components/ui/KofiButton.tsx` | Ko-fi donation link with badge |
| `StatCard` | `src/components/ui/StatCard.tsx` | Labeled stat display card |
| `Nav` | `src/components/ui/Nav.tsx` | Sticky top nav with desktop hover dropdowns and mobile Calculate menu |
| `SideNav` | `src/components/ui/SideNav.tsx` | Desktop-only fixed side nav on tool pages |
| `DTIGauge` | `src/components/ui/DTIGauge.tsx` | Segmented horizontal progress bar for DTI display |
| `ProgressBar` | `src/components/ui/ProgressBar.tsx` | Cobalt gradient progress bar with configurable fill |

---

## Running Locally

```powershell
npm install
npm run dev
```

Requires Node.js `>=22.12.0`. No server, no database, no environment variables needed.

---

## Stack

| Package | Version | Role |
|---|---|---|
| Astro | ^6.3.1 | Framework, routing, static build |
| React | ^19.2.6 | Interactive calculator islands (`client:load`) |
| Tailwind CSS | ^4.3.0 | Utility CSS — v4, CSS-first, no `tailwind.config.ts` |
| Recharts | — | Line charts and donut charts |
| Vercel | — | Static hosting (`output: 'static'`) |

---

## License

MIT License

Copyright (c) 2025 Payne

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
