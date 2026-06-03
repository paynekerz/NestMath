export interface AffordabilityInputs {
  grossMonthlyIncome: number;
  monthlyDebts: number;
  frontEndDTI: number;      // decimal, e.g. 0.28
  backEndDTI: number;       // decimal, e.g. 0.36
  mortgageRate: number;     // annual decimal, e.g. 0.0675
  loanTermYears: number;
  downPaymentPct: number;   // decimal, e.g. 0.20
  propertyTaxRate: number;  // annual decimal of home value, e.g. 0.012
  insuranceRate: number;    // annual decimal of home value, e.g. 0.005
  monthlyHOA: number;
  closingCostsPct: number;  // decimal, e.g. 0.03
}

export interface AffordabilityCalcResult {
  maxHomePrice: number;
  maxLoanAmount: number;
  maxMonthlyPayment: number;
  monthlyPI: number;
  monthlyPITI: number;
  frontEndDTIActual: number;
  backEndDTIActual: number;
  cashToClose: number;
  downPayment: number;
  closingCosts: number;
  backEndExceeded: boolean;
}

export interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export const DEFAULT_AFFORDABILITY_INPUTS: AffordabilityInputs = {
  grossMonthlyIncome: 8_000,
  monthlyDebts: 400,
  frontEndDTI: 0.28,
  backEndDTI: 0.36,
  mortgageRate: 0.0675,
  loanTermYears: 30,
  downPaymentPct: 0.20,
  propertyTaxRate: 0.012,
  insuranceRate: 0.005,
  monthlyHOA: 200,
  closingCostsPct: 0.03,
};

function computeMonthlyPI(loanAmount: number, annualRate: number, termYears: number): number {
  const r = annualRate / 12;
  const n = termYears * 12;
  if (r === 0) return loanAmount / n;
  return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function pitiForPrice(homePrice: number, inputs: AffordabilityInputs): number {
  const loanAmount = homePrice * (1 - inputs.downPaymentPct);
  const monthlyPI = computeMonthlyPI(loanAmount, inputs.mortgageRate, inputs.loanTermYears);
  const monthlyTax = (homePrice * inputs.propertyTaxRate) / 12;
  const monthlyIns = (homePrice * inputs.insuranceRate) / 12;
  return monthlyPI + monthlyTax + monthlyIns + inputs.monthlyHOA;
}

export function calcMaxHomePrice(inputs: AffordabilityInputs): AffordabilityCalcResult {
  const targetPITI = inputs.grossMonthlyIncome * inputs.frontEndDTI;

  let lo = 0;
  let hi = 50_000_000;
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2;
    if (pitiForPrice(mid, inputs) < targetPITI) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const maxHomePrice = lo;
  const maxLoanAmount = maxHomePrice * (1 - inputs.downPaymentPct);
  const monthlyPI = computeMonthlyPI(maxLoanAmount, inputs.mortgageRate, inputs.loanTermYears);
  const monthlyPITI = pitiForPrice(maxHomePrice, inputs);
  const downPayment = maxHomePrice * inputs.downPaymentPct;
  const closingCosts = maxHomePrice * inputs.closingCostsPct;

  return {
    maxHomePrice,
    maxLoanAmount,
    maxMonthlyPayment: targetPITI,
    monthlyPI,
    monthlyPITI,
    frontEndDTIActual: monthlyPITI / inputs.grossMonthlyIncome,
    backEndDTIActual: (monthlyPITI + inputs.monthlyDebts) / inputs.grossMonthlyIncome,
    cashToClose: downPayment + closingCosts,
    downPayment,
    closingCosts,
    backEndExceeded: (monthlyPITI + inputs.monthlyDebts) / inputs.grossMonthlyIncome > inputs.backEndDTI,
  };
}

export function calcAmortization(
  loanAmount: number,
  annualRate: number,
  termYears: number,
): AmortizationYear[] {
  const r = annualRate / 12;
  const n = termYears * 12;
  const monthlyPI = r === 0 ? loanAmount / n : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const startYear = new Date().getFullYear();
  let balance = loanAmount;
  const rows: AmortizationYear[] = [];

  for (let y = 1; y <= termYears; y++) {
    let principalPaid = 0;
    let interestPaid = 0;
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const principal = monthlyPI - interest;
      interestPaid += interest;
      principalPaid += principal;
      balance -= principal;
    }
    rows.push({
      year: startYear + y - 1,
      principalPaid,
      interestPaid,
      remainingBalance: Math.max(0, balance),
    });
  }
  return rows;
}
