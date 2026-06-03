export interface BuyInputs {
  homePrice: number;
  downPaymentPct: number;    // decimal, e.g. 0.20
  mortgageRate: number;      // annual decimal, e.g. 0.0675
  loanTermYears: number;
  propertyTaxRate: number;   // annual decimal of home value, e.g. 0.012
  insuranceRate: number;     // annual decimal of home value, e.g. 0.005
  monthlyHOA: number;
  closingCostsPct: number;   // decimal, e.g. 0.03
}

export interface RentInputs {
  monthlyRent: number;
  annualRentIncrease: number; // decimal, e.g. 0.03
  monthlyInsurance: number;
}

export interface Assumptions {
  appreciation: number;       // annual decimal, e.g. 0.03
  investmentReturn: number;   // annual decimal, e.g. 0.07
  marginalTaxRate: number;    // decimal, e.g. 0.22
  yearsToModel: number;
}

export interface YearResult {
  year: number;
  homeValue: number;
  equity: number;
  remainingBalance: number;
  buyNetWorth: number;
  rentNetWorth: number;
  investedDownPayment: number;
  cumulativeInvested: number;
  annualBuyCost: number;
  annualRentCost: number;
}

export interface CalculationResult {
  years: YearResult[];
  breakEvenYear: number | null;
}

export interface AffordabilityResult {
  monthlyPITI: number;
  requiredAnnualIncome: number;
  cashToClose: number;
  downPayment: number;
  closingCosts: number;
}

export interface PayoffInputs {
  loanAmount: number;
  annualRate: number;      // decimal, e.g. 0.0675
  loanTermYears: number;
  extraMonthly: number;
  lumpSum: number;
}

export interface PayoffYearResult {
  year: number;
  balanceOriginal: number;
  balanceExtra: number;
  cumulativeInterestOriginal: number;
  cumulativeInterestExtra: number;
}

export interface PayoffResult {
  monthlyPayment: number;
  initialBalance: number;
  initialBalanceExtra: number;
  originalPayoffMonths: number;
  extraPayoffMonths: number;
  monthsSaved: number;
  totalInterestOriginal: number;
  totalInterestExtra: number;
  interestSaved: number;
  years: PayoffYearResult[];
}

export const DEFAULT_BUY_INPUTS: BuyInputs = {
  homePrice: 400_000,
  downPaymentPct: 0.20,
  mortgageRate: 0.0675,
  loanTermYears: 30,
  propertyTaxRate: 0.012,
  insuranceRate: 0.005,
  monthlyHOA: 200,
  closingCostsPct: 0.03,
};

export const DEFAULT_RENT_INPUTS: RentInputs = {
  monthlyRent: 2_000,
  annualRentIncrease: 0.03,
  monthlyInsurance: 20,
};

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  appreciation: 0.03,
  investmentReturn: 0.07,
  marginalTaxRate: 0.22,
  yearsToModel: 30,
};

export const DEFAULT_PAYOFF_INPUTS: PayoffInputs = {
  loanAmount: 320_000,
  annualRate: 0.0675,
  loanTermYears: 30,
  extraMonthly: 0,
  lumpSum: 0,
};

export function computeMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const r = annualRate / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function amortizeYear(
  startBalance: number,
  monthlyPayment: number,
  monthlyRate: number,
  extraMonthly = 0,
): { endBalance: number; annualInterest: number; effectiveAnnualPayment: number } {
  let balance = startBalance;
  let annualInterest = 0;
  let effectiveAnnualPayment = 0;
  for (let m = 0; m < 12; m++) {
    if (balance <= 0) break;
    const monthInterest = balance * monthlyRate;
    const monthPrincipal = Math.min(monthlyPayment + extraMonthly - monthInterest, balance);
    annualInterest += monthInterest;
    effectiveAnnualPayment += monthInterest + monthPrincipal;
    balance = Math.max(0, balance - monthPrincipal);
  }
  return { endBalance: balance, annualInterest, effectiveAnnualPayment };
}

export function calcAffordability(buy: BuyInputs): AffordabilityResult {
  const downPayment = buy.homePrice * buy.downPaymentPct;
  const loanAmount = buy.homePrice - downPayment;
  const closingCosts = buy.homePrice * buy.closingCostsPct;

  const monthlyPI = computeMonthlyPayment(loanAmount, buy.mortgageRate, buy.loanTermYears);
  const monthlyTax = (buy.homePrice * buy.propertyTaxRate) / 12;
  const monthlyInsurance = (buy.homePrice * buy.insuranceRate) / 12;

  const monthlyPITI = monthlyPI + monthlyTax + monthlyInsurance + buy.monthlyHOA;
  const requiredAnnualIncome = (monthlyPITI / 0.28) * 12;
  const cashToClose = downPayment + closingCosts;

  return { monthlyPITI, requiredAnnualIncome, cashToClose, downPayment, closingCosts };
}

export function calculate(
  buyInputs: BuyInputs,
  rentInputs: RentInputs,
  assumptions: Assumptions,
): CalculationResult {
  const all = { ...buyInputs, ...rentInputs, ...assumptions };
  for (const [k, v] of Object.entries(all)) {
    if (typeof v === 'number' && !Number.isFinite(v)) {
      throw new Error(`calculate: ${k} must be a finite number (got ${v})`);
    }
  }

  const downPayment = buyInputs.homePrice * buyInputs.downPaymentPct;
  const loanAmount = buyInputs.homePrice - downPayment;
  const closingCosts = buyInputs.homePrice * buyInputs.closingCostsPct;
  const monthlyPayment = computeMonthlyPayment(loanAmount, buyInputs.mortgageRate, buyInputs.loanTermYears);

  const monthlyRate = buyInputs.mortgageRate / 12;
  let remainingBalance = loanAmount;
  let cumulativeInvested = 0;
  let currentMonthlyRent = rentInputs.monthlyRent;

  const years: YearResult[] = [];
  let breakEvenYear: number | null = null;

  for (let year = 1; year <= assumptions.yearsToModel; year++) {
    const { endBalance, annualInterest, effectiveAnnualPayment } = amortizeYear(remainingBalance, monthlyPayment, monthlyRate);
    remainingBalance = endBalance;
    const newBalance = endBalance;

    const homeValue = buyInputs.homePrice * Math.pow(1 + assumptions.appreciation, year);
    const equity = homeValue - newBalance;
    const interestDeduction = annualInterest * assumptions.marginalTaxRate;
    // Bug 3: renter foregoes downPayment + closingCosts upfront, so both compound
    const investedDownPayment = (downPayment + closingCosts) * Math.pow(1 + assumptions.investmentReturn, year);

    // Subtract tax savings from annualBuyCost so the surplus mechanism compounds the benefit
    const annualBuyCost =
      effectiveAnnualPayment - interestDeduction +
      homeValue * buyInputs.propertyTaxRate +
      homeValue * buyInputs.insuranceRate +
      buyInputs.monthlyHOA * 12;

    const annualRentCost = currentMonthlyRent * 12 + rentInputs.monthlyInsurance * 12;

    // Renter invests the surplus when buying costs more; grows at investment return
    const annualSurplus = Math.max(0, annualBuyCost - annualRentCost);
    cumulativeInvested = cumulativeInvested * (1 + assumptions.investmentReturn) + annualSurplus;

    const buyNetWorth = equity - closingCosts;
    const rentNetWorth = investedDownPayment + cumulativeInvested;

    years.push({
      year,
      homeValue,
      equity,
      remainingBalance: newBalance,
      buyNetWorth,
      rentNetWorth,
      investedDownPayment,
      cumulativeInvested,
      annualBuyCost,
      annualRentCost,
    });

    if (breakEvenYear === null && buyNetWorth > rentNetWorth) {
      breakEvenYear = year;
    }

    currentMonthlyRent *= 1 + rentInputs.annualRentIncrease;
  }

  return { years, breakEvenYear };
}

export interface RefinanceInputs {
  currentBalance: number;
  currentRate: number;         // annual decimal, e.g. 0.075
  remainingTermYears: number;
  newRate: number;             // annual decimal, e.g. 0.065
  newTermYears: number;
  closingCostsPct: number;     // decimal of balance, e.g. 0.02
  closingCostsDollar: number;  // flat dollar alternative
  usesFlatClosingCost: boolean;
}

export interface RefinanceYearResult {
  year: number;
  balanceCurrent: number;
  balanceRefinanced: number;
  cumulativeInterestCurrent: number;
  cumulativeInterestRefinanced: number;
  cumulativeSavings: number;
}

export interface RefinanceResult {
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlySavings: number;
  closingCostsDollar: number;
  breakEvenMonths: number | null;
  worthIt: boolean;
  totalInterestCurrent: number;
  totalInterestRefinanced: number;
  netSavings: number;
  years: RefinanceYearResult[];
}

export const DEFAULT_REFINANCE_INPUTS: RefinanceInputs = {
  currentBalance: 300_000,
  currentRate: 0.075,
  remainingTermYears: 27,
  newRate: 0.065,
  newTermYears: 30,
  closingCostsPct: 0.02,
  closingCostsDollar: 6_000,
  usesFlatClosingCost: false,
};

export function calcRefinance(inputs: RefinanceInputs): RefinanceResult {
  const closingCostsDollar = inputs.usesFlatClosingCost
    ? inputs.closingCostsDollar
    : inputs.currentBalance * inputs.closingCostsPct;

  const currentMonthlyPayment = computeMonthlyPayment(
    inputs.currentBalance, inputs.currentRate, inputs.remainingTermYears,
  );
  const newMonthlyPayment = computeMonthlyPayment(
    inputs.currentBalance, inputs.newRate, inputs.newTermYears,
  );
  const monthlySavings = currentMonthlyPayment - newMonthlyPayment;

  const breakEvenMonths = monthlySavings > 0
    ? Math.ceil(closingCostsDollar / monthlySavings)
    : null;

  const worthIt = breakEvenMonths !== null && breakEvenMonths <= inputs.remainingTermYears * 12;

  const currentMonthlyRate = inputs.currentRate / 12;
  const newMonthlyRate = inputs.newRate / 12;

  // Year-by-year table data (chart view spans max of both terms)
  const maxYears = Math.max(inputs.remainingTermYears, inputs.newTermYears);
  let balCurr = inputs.currentBalance;
  let balRefin = inputs.currentBalance;
  let cumICurr = 0;
  let cumIRefin = 0;
  const years: RefinanceYearResult[] = [];

  for (let year = 1; year <= maxYears; year++) {
    if (balCurr > 0) {
      const r = amortizeYear(balCurr, currentMonthlyPayment, currentMonthlyRate);
      balCurr = r.endBalance;
      cumICurr += r.annualInterest;
    }
    if (balRefin > 0) {
      const r = amortizeYear(balRefin, newMonthlyPayment, newMonthlyRate);
      balRefin = r.endBalance;
      cumIRefin += r.annualInterest;
    }
    years.push({
      year,
      balanceCurrent: Math.round(balCurr),
      balanceRefinanced: Math.round(balRefin),
      cumulativeInterestCurrent: Math.round(cumICurr),
      cumulativeInterestRefinanced: Math.round(cumIRefin),
      cumulativeSavings: Math.round(cumICurr - cumIRefin - closingCostsDollar),
    });
  }

  // Total interest over each path's own term
  let totalInterestCurrent = 0;
  let totalInterestRefinanced = 0;
  let b = inputs.currentBalance;
  for (let year = 1; year <= inputs.remainingTermYears; year++) {
    const r = amortizeYear(b, currentMonthlyPayment, currentMonthlyRate);
    totalInterestCurrent += r.annualInterest;
    b = r.endBalance;
  }
  b = inputs.currentBalance;
  for (let year = 1; year <= inputs.newTermYears; year++) {
    const r = amortizeYear(b, newMonthlyPayment, newMonthlyRate);
    totalInterestRefinanced += r.annualInterest;
    b = r.endBalance;
  }

  return {
    currentMonthlyPayment,
    newMonthlyPayment,
    monthlySavings,
    closingCostsDollar,
    breakEvenMonths,
    worthIt,
    totalInterestCurrent: Math.round(totalInterestCurrent),
    totalInterestRefinanced: Math.round(totalInterestRefinanced),
    netSavings: Math.round(totalInterestCurrent - totalInterestRefinanced - closingCostsDollar),
    years,
  };
}

export function calcPayoff(inputs: PayoffInputs): PayoffResult {
  const monthlyRate = inputs.annualRate / 12;
  const monthlyPayment = computeMonthlyPayment(inputs.loanAmount, inputs.annualRate, inputs.loanTermYears);
  const originalPayoffMonths = inputs.loanTermYears * 12;

  // Find exact extra-payment payoff month via monthly loop
  const initialBalanceExtra = Math.max(0, inputs.loanAmount - inputs.lumpSum);
  let extraBalanceMo = initialBalanceExtra;
  let extraPayoffMonth = initialBalanceExtra <= 0 ? 0 : originalPayoffMonths;
  for (let m = 1; m <= originalPayoffMonths; m++) {
    if (extraBalanceMo <= 0) break;
    const interest = extraBalanceMo * monthlyRate;
    const principal = Math.min(monthlyPayment + inputs.extraMonthly - interest, extraBalanceMo);
    extraBalanceMo = Math.max(0, extraBalanceMo - principal);
    if (extraBalanceMo <= 0) { extraPayoffMonth = m; break; }
  }

  // Year-by-year data via amortizeYear()
  let balanceOrig = inputs.loanAmount;
  let balanceExtra = initialBalanceExtra;
  let cumInterestOrig = 0;
  let cumInterestExtra = 0;
  const years: PayoffYearResult[] = [];

  for (let year = 1; year <= inputs.loanTermYears; year++) {
    const orig = amortizeYear(balanceOrig, monthlyPayment, monthlyRate);
    const extra = amortizeYear(balanceExtra, monthlyPayment, monthlyRate, inputs.extraMonthly);

    balanceOrig = orig.endBalance;
    balanceExtra = extra.endBalance;
    cumInterestOrig += orig.annualInterest;
    cumInterestExtra += extra.annualInterest;

    years.push({
      year,
      balanceOriginal: Math.round(balanceOrig),
      balanceExtra: Math.round(balanceExtra),
      cumulativeInterestOriginal: Math.round(cumInterestOrig),
      cumulativeInterestExtra: Math.round(cumInterestExtra),
    });
  }

  return {
    monthlyPayment,
    initialBalance: inputs.loanAmount,
    initialBalanceExtra,
    originalPayoffMonths,
    extraPayoffMonths: extraPayoffMonth,
    monthsSaved: originalPayoffMonths - extraPayoffMonth,
    totalInterestOriginal: Math.round(cumInterestOrig),
    totalInterestExtra: Math.round(cumInterestExtra),
    interestSaved: Math.round(cumInterestOrig - cumInterestExtra),
    years,
  };
}
