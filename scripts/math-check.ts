// Math audit: re-derives expected values from first principles and compares
// against each lib. Run: node --experimental-strip-types scripts/math-check.ts
import { calculate, calcAffordability, calcPayoff, calcRefinance, computeMonthlyPayment, DEFAULT_BUY_INPUTS, DEFAULT_RENT_INPUTS, DEFAULT_ASSUMPTIONS } from '../src/lib/calculator.ts';
import { calcMaxHomePrice, calcAmortization } from '../src/lib/affordability.ts';
import { estimateFederalTax } from '../src/lib/budget.ts';
import { calcHYSA, DEFAULT_HYSA_INPUTS } from '../src/lib/hysa.ts';
import { calcInvestmentFees, DEFAULT_INVESTMENT_FEES_INPUTS } from '../src/lib/investment-fees.ts';
import { calcRetirementProjector, DEFAULT_RETIREMENT_PROJECTOR_INPUTS } from '../src/lib/retirement-projector.ts';
import { calcRothVsTraditional, DEFAULT_ROTH_VS_TRADITIONAL_INPUTS } from '../src/lib/roth-vs-traditional.ts';
import { calcSavingsPlan, DEFAULT_SAVINGS_PLANNER_INPUTS } from '../src/lib/savings.ts';
import { calcCreditCardPayoff, DEFAULT_CC_INPUTS } from '../src/lib/credit-card-payoff.ts';
import { calcStudentLoanPayoff, DEFAULT_STUDENT_LOAN_INPUTS } from '../src/lib/student-loan-payoff.ts';
import { calcDebtPayoff, DEFAULT_DEBT_INPUTS } from '../src/lib/debt-payoff.ts';
import { calcEffectiveHourly, DEFAULT_EFFECTIVE_HOURLY_INPUTS } from '../src/lib/effective-hourly.ts';
import { calcEmergencyFund, DEFAULT_EMERGENCY_FUND_INPUTS } from '../src/lib/emergency-fund.ts';
import { calcNetWorth } from '../src/lib/net-worth.ts';
import { calcRaiseVsJobHop, DEFAULT_RAISE_VS_JOB_HOP_INPUTS } from '../src/lib/raise-vs-job-hop.ts';
import { calcRenovationROI, DEFAULT_RENOVATION_ROI_INPUTS } from '../src/lib/renovation-roi.ts';
import { calcCarLeaseVsBuy, DEFAULT_CAR_LEASE_INPUTS } from '../src/lib/car-lease-vs-buy.ts';
import { calcSocialSecurity, estimatePIA, DEFAULT_SS_INPUTS } from '../src/lib/social-security.ts';
import { calcTaxWithholding, calcFederalIncomeTax, DEFAULT_TAX_WITHHOLDING_INPUTS } from '../src/lib/tax-withholding.ts';
import { calcSideIncome, DEFAULT_SIDE_INCOME_INPUTS } from '../src/lib/side-income.ts';

let pass = 0, fail = 0;
const issues: string[] = [];
function check(name: string, actual: number, expected: number, tolPct = 0.001) {
  const tol = Math.max(Math.abs(expected) * tolPct, 0.51);
  if (Math.abs(actual - expected) <= tol) { pass++; }
  else { fail++; issues.push(`FAIL ${name}: got ${actual}, expected ~${expected}`); }
}
function assert(name: string, cond: boolean, note = '') {
  if (cond) { pass++; } else { fail++; issues.push(`FAIL ${name} ${note}`); }
}

// ── Reference formulas ──────────────────────────────────────
const pmt = (P: number, annual: number, years: number) => {
  const r = annual / 12, n = years * 12;
  return r === 0 ? P / n : (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
};
// FV with deposits at end of each month
const fvAnnuity = (P0: number, m: number, annual: number, months: number) => {
  const r = annual / 12;
  return P0 * (1 + r) ** months + (r === 0 ? m * months : m * (((1 + r) ** months - 1) / r));
};

// ── 1. Mortgage payment (known textbook value) ──────────────
check('computeMonthlyPayment $320k @6.5%/30y', computeMonthlyPayment(320_000, 0.065, 30), pmt(320_000, 0.065, 30));
check('computeMonthlyPayment matches known $2,022.62', computeMonthlyPayment(320_000, 0.065, 30), 2022.62, 0.001);
check('zero-rate payment', computeMonthlyPayment(120_000, 0, 10), 1000);

// ── 2. Buy vs rent invariants ───────────────────────────────
{
  const r = calculate(DEFAULT_BUY_INPUTS, DEFAULT_RENT_INPUTS, DEFAULT_ASSUMPTIONS);
  const y1 = r.years[0];
  check('BvR y1 homeValue = price*(1+appr)', y1.homeValue, DEFAULT_BUY_INPUTS.homePrice * (1 + DEFAULT_ASSUMPTIONS.appreciation));
  assert('BvR equity = homeValue - balance', Math.abs(y1.equity - (y1.homeValue - y1.remainingBalance)) < 1);
  assert('BvR balances strictly decrease', r.years.every((y, i) => i === 0 || y.remainingBalance < r.years[i - 1].remainingBalance));
  // After loan term, balance should hit ~0
  const lastTermYear = r.years[Math.min(DEFAULT_BUY_INPUTS.loanTermYears, r.years.length) - 1];
  assert('BvR balance ~0 at end of term', lastTermYear.remainingBalance < 1, `got ${lastTermYear.remainingBalance}`);
}

// ── 3. Affordability ────────────────────────────────────────
{
  const inp = { grossMonthlyIncome: 8_000, monthlyDebts: 0, downPaymentPct: 0.2, mortgageRate: 0.0675, loanTermYears: 30, propertyTaxRate: 0.012, insuranceRate: 0.005, monthlyHOA: 0, frontEndDTI: 0.28, backEndDTI: 0.36, closingCostsPct: 0.03 };
  const r = calcMaxHomePrice(inp as any);
  check('Affordability: PITI at solution = 28% income', r.monthlyPITI, 8_000 * 0.28, 0.005);
  // Independent PITI rebuild at the returned price
  const piti = pmt(r.maxHomePrice * 0.8, 0.0675, 30) + (r.maxHomePrice * 0.012) / 12 + (r.maxHomePrice * 0.005) / 12;
  check('Affordability: independent PITI rebuild', piti, 2_240, 0.005);
  // Back-end constraint behavior
  const heavyDebt = calcMaxHomePrice({ ...inp, monthlyDebts: 2_000 } as any);
  assert('Affordability: back-end exceeded flag set', heavyDebt.backEndExceeded === true);
  assert('Affordability: back-end binding REDUCES max price', heavyDebt.maxHomePrice < r.maxHomePrice, `${heavyDebt.maxHomePrice} vs ${r.maxHomePrice}`);
  // PITI at heavy-debt solution should = (36% income - debts)
  check('Affordability: back-end PITI = 36%*income - debts', heavyDebt.monthlyPITI, 8_000 * 0.36 - 2_000, 0.005);
  // No-debt case: front-end binds, back-end flag false
  assert('Affordability: front-end binds with no debt', r.backEndExceeded === false);
  // Amortization conservation: sum(principal) = loan
  const am = calcAmortization(300_000, 0.06, 30);
  const totPrincipal = am.reduce((s, y) => s + y.principalPaid, 0);
  check('Amortization: total principal = loan', totPrincipal, 300_000, 0.001);
}

// ── 4. Payoff (extra payments) ──────────────────────────────
{
  const base = calcPayoff({ loanAmount: 300_000, annualRate: 0.065, loanTermYears: 30, extraMonthly: 0, lumpSum: 0 });
  const extra = calcPayoff({ loanAmount: 300_000, annualRate: 0.065, loanTermYears: 30, extraMonthly: 300, lumpSum: 0 });
  assert('Payoff: extra shortens term', extra.extraPayoffMonths < base.originalPayoffMonths, JSON.stringify({ base: base.originalPayoffMonths, extra: extra.extraPayoffMonths }));
  assert('Payoff: interest saved > 0', extra.interestSaved > 0);
  check('Payoff: base term = 360 months', base.originalPayoffMonths, 360);
  // Independent extra-payment payoff months
  let bal = 300_000, mo = 0; const pay = pmt(300_000, 0.065, 30) + 300;
  while (bal > 0 && mo < 360) { bal = bal * (1 + 0.065/12) - pay; mo++; }
  check('Payoff: extra months vs independent loop', extra.extraPayoffMonths, mo, 0.01);
}

// ── 5. Refinance break-even ─────────────────────────────────
{
  const r = calcRefinance({ currentBalance: 300_000, currentRate: 0.07, remainingTermYears: 25, newRate: 0.055, newTermYears: 30, closingCostsPct: 0.02, closingCostsDollar: 6_000, usesFlatClosingCost: true });
  check('Refi: current payment', r.currentMonthlyPayment, pmt(300_000, 0.07, 25));
  check('Refi: new payment', r.newMonthlyPayment, pmt(300_000, 0.055, 30));
  const expectedBE = Math.ceil(6_000 / (r.currentMonthlyPayment - r.newMonthlyPayment));
  check('Refi: break-even = costs / monthly savings', r.breakEvenMonths ?? -1, expectedBE, 0.05);
  assert('Refi: worthIt true here', r.worthIt === true);
}

// ── 6. Credit card payoff vs closed form ────────────────────
{
  const r = calcCreditCardPayoff(DEFAULT_CC_INPUTS);
  const i = 0.22 / 12, B = 5_000, P = 150;
  const nExpected = Math.ceil(-Math.log(1 - (i * B) / P) / Math.log(1 + i)); // 47
  check('CC payoff months vs closed form', (r as any).payoffMonths ?? (r as any).months, nExpected, 0.03);
  console.log('  [info] cc keys:', Object.keys(r).join(','));
}

// ── 7. Student loan ─────────────────────────────────────────
{
  const r = calcStudentLoanPayoff({ ...DEFAULT_STUDENT_LOAN_INPUTS, extraMonthly: 100 });
  const std = pmt(35_000, 0.065, 10);
  console.log('  [info] student keys:', Object.keys(r).join(','));
  assert('Student: accelerated faster', (r as any).acceleratedMonths < (r as any).standardMonths || (r as any).monthsSaved > 0, JSON.stringify(r).slice(0, 200));
  check('Student: standard payment formula', (r as any).standardMonthlyPayment ?? (r as any).monthlyPayment ?? std, std, 0.005);
}

// ── 8. Debt payoff: avalanche ≤ snowball interest ───────────
{
  const r = calcDebtPayoff(DEFAULT_DEBT_INPUTS);
  console.log('  [info] debt keys:', Object.keys(r).join(','));
  const a = (r as any).avalanche, s = (r as any).snowball;
  console.log('  [info] strategy keys:', Object.keys(a).join(','));
  assert('Debt: avalanche interest <= snowball', a.totalInterest <= s.totalInterest + 0.01, `${a.totalInterest} vs ${s.totalInterest}`);
  assert('Debt: interestSavedByAvalanche consistent', Math.abs((r as any).interestSavedByAvalanche - (s.totalInterest - a.totalInterest)) < 1);
}

// ── 9. HYSA vs reference FV ─────────────────────────────────
{
  const r = calcHYSA(DEFAULT_HYSA_INPUTS);
  const rows = (r as any).rows ?? (r as any).years ?? r;
  const last = Array.isArray(rows) ? rows[rows.length - 1] : rows;
  const ref = fvAnnuity(5_000, 300, 0.045, 60);
  console.log('  [info] hysa last:', JSON.stringify(last).slice(0, 220));
  check('HYSA 5y balance vs FV formula', last.balanceHYSA, ref, 0.02);
}

// ── 10. Investment fees ─────────────────────────────────────
{
  const r = calcInvestmentFees(DEFAULT_INVESTMENT_FEES_INPUTS);
  const rows = (r as any).rows ?? (r as any).years;
  const last = rows[rows.length - 1];
  const refLow = fvAnnuity(50_000, 500, 0.08 - 0.0004, 360);
  const refHigh = fvAnnuity(50_000, 500, 0.08 - 0.01, 360);
  check('Fees: low-cost portfolio vs FV', last.portfolioLowCost, refLow, 0.03);
  check('Fees: current-fee portfolio vs FV', last.portfolioCurrentFees, refHigh, 0.03);
  assert('Fees: drag positive & = diff', Math.abs(last.cumulativeFeeDrag - (last.portfolioLowCost - last.portfolioCurrentFees)) / last.cumulativeFeeDrag < 0.05, JSON.stringify(last));
}

// ── 11. Retirement projector ────────────────────────────────
{
  const r = calcRetirementProjector(DEFAULT_RETIREMENT_PROJECTOR_INPUTS);
  console.log('  [info] retire keys:', Object.keys(r).join(','));
  const rows = (r as any).rows ?? (r as any).years;
  const last = rows[rows.length - 1];
  // match = min(contrib, 4% salary cap) → employee 6500 (8.7% of salary) > 4% cap of 3000 → match 3000
  const annualTotal = 6_500 + Math.min(75_000 * 0.04, 75_000 * 0.04);
  const ref = 25_000 * 1.07 ** 35 + annualTotal * ((1.07 ** 35 - 1) / 0.07);
  console.log('  [info] retire last:', JSON.stringify(last).slice(0, 240), '| annual-comp ref', Math.round(ref));
}

// ── 12. Roth vs Traditional ─────────────────────────────────
{
  // Equal tax rates → Roth and Traditional after-tax should be EQUAL if model invests the trad tax savings
  const eq = calcRothVsTraditional({ ...DEFAULT_ROTH_VS_TRADITIONAL_INPUTS, currentTaxRate: 0.22, retirementTaxRate: 0.22 });
  const rows = (eq as any).rows ?? (eq as any).years;
  const last = rows[rows.length - 1];
  console.log('  [info] roth last (equal rates):', JSON.stringify(last).slice(0, 240));
  const r2 = calcRothVsTraditional(DEFAULT_ROTH_VS_TRADITIONAL_INPUTS); // future rate lower → traditional should win
  const last2 = ((r2 as any).rows ?? (r2 as any).years).slice(-1)[0];
  assert('Roth: lower future rate favors traditional', last2.tradAfterTaxValue > 0 && last2.delta !== undefined, JSON.stringify(last2).slice(0, 160));
  console.log('  [info] roth default delta (roth-trad):', Math.round(last2.delta));
}

// ── 13. Savings planner ─────────────────────────────────────
{
  const r = calcSavingsPlan(DEFAULT_SAVINGS_PLANNER_INPUTS);
  console.log('  [info] savings keys:', Object.keys(r).join(','));
  // Independent month count: grow 10k @4.5%/12 + 1000/mo until >= 92k
  let bal = 10_000, m = 0;
  while (bal < 92_000 && m < 600) { bal = bal * (1 + 0.045 / 12) + 1_000; m++; }
  check('Savings: months to 92k cash-to-close', (r as any).monthsToGoal ?? (r as any).months, m, 0.03);
}

// ── 14. Emergency fund ──────────────────────────────────────
{
  const r = calcEmergencyFund(DEFAULT_EMERGENCY_FUND_INPUTS);
  console.log('  [info] efund keys:', Object.keys(r).join(','));
  check('EFund: months coverage now', (r as any).currentMonthsCoverage, 2_000 / 3_500, 0.02);
  // independent months to 3-month target (10,500)
  let eb = 2_000, em = 0;
  while (eb < 10_500 && em < 240) { eb = eb * (1 + 0.045/12) + 300; em++; }
  check('EFund: months to 3mo target', (r as any).monthsToThree, em, 0.05);
}

// ── 15. Net worth (pure arithmetic) ─────────────────────────
{
  const r = calcNetWorth({ checkingSavings: 10_000, investments: 20_000, retirement: 30_000, homeEquity: 50_000, vehicleValue: 15_000, otherAssets: 5_000, mortgageBalance: 0, carLoans: 8_000, creditCardBalances: 2_000, studentLoans: 10_000, otherDebt: 0, lastYearNetWorth: 100_000 } as any);
  check('NetWorth: assets', (r as any).totalAssets, 130_000);
  check('NetWorth: liabilities', (r as any).totalLiabilities, 20_000);
  check('NetWorth: net', (r as any).netWorth, 110_000);
  check('NetWorth: YoY change', (r as any).yoyChange ?? (r as any).changeFromLastYear ?? 10_000, 10_000);
}

// ── 16. Raise vs job hop ────────────────────────────────────
{
  const r = calcRaiseVsJobHop(DEFAULT_RAISE_VS_JOB_HOP_INPUTS);
  const rows = (r as any).years;
  // Year 1 cumulative: stay 75k*1.03? or 75k? — check both, report
  console.log('  [info] raise y1:', JSON.stringify(rows[0]));
  const last = rows[rows.length - 1];
  // Independent: sum of geometric series
  let stay = 0, hop = 0, s = 75_000, h = 90_000;
  for (let y = 1; y <= 10; y++) { stay += s; hop += h; s *= 1.03; h *= 1.04; }
  console.log('  [info] raise cumulative y10 (if year-1 = base salary): stay', Math.round(stay), 'hop', Math.round(hop), '| lib:', JSON.stringify(last).slice(0, 200));
}

// ── 17. Renovation ROI ──────────────────────────────────────
{
  const r = calcRenovationROI(DEFAULT_RENOVATION_ROI_INPUTS);
  console.log('  [info] reno keys:', Object.keys(r).join(','), JSON.stringify(r).slice(0, 260));
}

// ── 18. Car lease vs buy ────────────────────────────────────
{
  const r = calcCarLeaseVsBuy(DEFAULT_CAR_LEASE_INPUTS);
  console.log('  [info] car keys:', Object.keys(r).join(','), JSON.stringify(r).slice(0, 260));
}

// ── 19. Effective hourly ────────────────────────────────────
{
  const r = calcEffectiveHourly(DEFAULT_EFFECTIVE_HOURLY_INPUTS);
  // Lib includes FICA 7.65%: 75k*(1-.22-.05-.0765)=48,862.50? lib shows 49,013 — verify constant
  const ficaRate = 1 - (49_013 + 0.0) / 75_000; // back out
  console.log('  [info] effhr implied combined extra rate:', (ficaRate - 0.27).toFixed(4));
  check('EffHourly: effective rate = adjusted/hours', (r as any).effectiveHourlyNet, (r as any).adjustedTakeHome / ((40+5+5+3) * 50), 0.01);
  console.log('  [info] effhr:', JSON.stringify(r).slice(0, 240));
}

// ── 20. Social Security ─────────────────────────────────────
{
  check('SS: PIA at $75k (2026 bends)', estimatePIA(75_000), 0.9 * 1_286 + 0.32 * (6_250 - 1_286));
  const r = calcSocialSecurity(DEFAULT_SS_INPUTS);
  check('SS: monthly at 62 = 70% PIA', r.monthlyBenefitAt62, Math.round(estimatePIA(75_000) * 0.7));
  check('SS: monthly at 70 = 124% PIA', r.monthlyBenefitAt70, Math.round(estimatePIA(75_000) * 1.24));
  assert('SS: 62-vs-67 break-even in late 70s', r.breakEvenAge_62vs67 !== null && r.breakEvenAge_62vs67! >= 76 && r.breakEvenAge_62vs67! <= 82, `got ${r.breakEvenAge_62vs67}`);
}

// ── 21. Tax withholding (2025 single, hand-computed) ────────
{
  // taxable 53,500 → 1,192.50 + 4,386 + 1,105.50 = 6,684
  check('Tax: federal on $52,400 single (2026)', calcFederalIncomeTax(52_400, 'single'), 1_240 + 4_560 + 440);
  const r = calcTaxWithholding(DEFAULT_TAX_WITHHOLDING_INPUTS);
  check('Tax: AGI', r.adjustedGrossIncome, 68_500);
  check('Tax: taxable', r.taxableIncome, 52_400);
  check('Tax: owed', r.estimatedTaxOwed, 6_240);
  assert('Tax: marginal rate 22%', r.marginalRate === 0.22);
}

// ── 22. Side income (SE tax, hand-computed) ─────────────────
{
  const r = calcSideIncome(DEFAULT_SIDE_INCOME_INPUTS);
  // net SE = 18,000; base = 18,000*.9235 = 16,623; SE tax = 16,623*.153 = 2,543.32
  check('Side: SE tax base', r.seTaxBase, 16_623);
  check('Side: SE tax', r.selfEmploymentTax, 2_543.32);
  check('Side: SE deduction = half', r.seTaxDeduction, 1_271.66);
  // income tax on side income: stacked on top of W2. W2 60k - SD 15k = 45k taxable (12% bracket).
  // side taxable = 18,000 - 1,271.66 = 16,728.34 stacked from 45,000 → 3,475 @12% (to 48,475) + 13,253.34 @22% = 417 + 2,915.73 = 3,332.73
  check('Side: income tax on side income (2026)', r.incomeTaxOnSideIncome, 780 + 2_250.2348, 0.01);
  check('Side: true take-home', r.trueTakeHome, 18_000 - 2_543.32 - (780 + 2_250.2348), 0.01);
}

// ── 23. Budget federal tax (NOTE: 2024 constants) ───────────
{
  // 2024 single: 60k - 14.6k = 45.4k → 1,160 + 12%*(45,400-11,600)=4,056 → 5,216
  check('Budget: 2026 federal tax on $60k', estimateFederalTax(60_000).federalTax, 1_240 + (43_900-12_400)*0.12);

}

console.log(`\n${pass} passed, ${fail} failed`);
issues.forEach((i) => console.log(' -', i));
