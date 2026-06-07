import { computeMonthlyPayment, amortizeYear } from './calculator';

export interface StudentLoanPayoffInputs {
  loanBalance: number;
  interestRate: number;
  standardTermYears: number;
  extraMonthly: number;
}

export const DEFAULT_STUDENT_LOAN_INPUTS: StudentLoanPayoffInputs = {
  loanBalance: 35_000,
  interestRate: 0.065,
  standardTermYears: 10,
  extraMonthly: 0,
};

export interface StudentLoanYearResult {
  year: number;
  balanceStandard: number;
  balanceAccelerated: number;
  cumulativeInterestStandard: number;
  cumulativeInterestAccelerated: number;
}

export interface StudentLoanPayoffResult {
  initialBalance: number;
  monthlyPayment: number;
  standardPayoffMonths: number;
  acceleratedPayoffMonths: number;
  monthsSaved: number;
  totalInterestStandard: number;
  totalInterestAccelerated: number;
  interestSaved: number;
  years: StudentLoanYearResult[];
}

export function calcStudentLoanPayoff(inputs: StudentLoanPayoffInputs): StudentLoanPayoffResult {
  const { loanBalance, interestRate, standardTermYears, extraMonthly } = inputs;
  const monthlyRate = interestRate / 12;
  const monthlyPayment = computeMonthlyPayment(loanBalance, interestRate, standardTermYears);
  const standardPayoffMonths = standardTermYears * 12;

  let accBalance = loanBalance;
  let accPayoffMonth = standardPayoffMonths;
  for (let m = 1; m <= standardPayoffMonths; m++) {
    if (accBalance <= 0) { accPayoffMonth = m - 1; break; }
    const interest = accBalance * monthlyRate;
    const principal = Math.min(monthlyPayment + extraMonthly - interest, accBalance);
    accBalance = Math.max(0, accBalance - principal);
    if (accBalance <= 0) { accPayoffMonth = m; break; }
  }

  let balStd = loanBalance;
  let balAcc = loanBalance;
  let cumIStd = 0;
  let cumIAcc = 0;
  const years: StudentLoanYearResult[] = [];

  for (let year = 1; year <= standardTermYears; year++) {
    const std = amortizeYear(balStd, monthlyPayment, monthlyRate);
    const acc = amortizeYear(balAcc, monthlyPayment, monthlyRate, extraMonthly);
    balStd = std.endBalance;
    balAcc = acc.endBalance;
    cumIStd += std.annualInterest;
    cumIAcc += acc.annualInterest;

    years.push({
      year,
      balanceStandard: Math.round(balStd),
      balanceAccelerated: Math.round(balAcc),
      cumulativeInterestStandard: Math.round(cumIStd),
      cumulativeInterestAccelerated: Math.round(cumIAcc),
    });
  }

  return {
    initialBalance: loanBalance,
    monthlyPayment,
    standardPayoffMonths,
    acceleratedPayoffMonths: accPayoffMonth,
    monthsSaved: standardPayoffMonths - accPayoffMonth,
    totalInterestStandard: Math.round(cumIStd),
    totalInterestAccelerated: Math.round(cumIAcc),
    interestSaved: Math.round(cumIStd - cumIAcc),
    years,
  };
}
