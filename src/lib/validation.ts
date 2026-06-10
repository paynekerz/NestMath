import type { AffordabilityInputs } from './affordability';
import type { BuyInputs, RentInputs, Assumptions, PayoffInputs, RefinanceInputs } from './calculator';
import type { SavingsPlannerInputs } from './savings';
import type { RaiseVsJobHopInputs } from './raise-vs-job-hop';
import type { CarLeaseVsBuyInputs } from './car-lease-vs-buy';
import type { RenovationROIInputs } from './renovation-roi';
import type { InvestmentFeesInputs } from './investment-fees';
import type { HYSAInputs } from './hysa';
import type { EffectiveHourlyInputs } from './effective-hourly';
import type { CreditCardPayoffInputs } from './credit-card-payoff';
import type { StudentLoanPayoffInputs } from './student-loan-payoff';
import type { DebtItem } from './debt-payoff';
import type { EmergencyFundInputs } from './emergency-fund';
import type { NetWorthInputs } from './net-worth';
import type { RetirementProjectorInputs } from './retirement-projector';
import type { RothVsTraditionalInputs } from './roth-vs-traditional';
import type { SocialSecurityInputs } from './social-security';
import type { TaxWithholdingInputs } from './tax-withholding';
import type { SideIncomeInputs } from './side-income';

export type ValidationErrors = Partial<Record<string, string>>;

interface Bounds {
  min: number;
  max: number;
  label: string;
}

function checkRange(value: number, bounds: Bounds): string | undefined {
  if (!Number.isFinite(value)) return `${bounds.label} must be a number.`;
  if (value < bounds.min) return `${bounds.label} must be at least ${bounds.min}.`;
  if (value > bounds.max) return `${bounds.label} must be at most ${bounds.max}.`;
  return undefined;
}

const AFFORDABILITY_BOUNDS: Record<keyof AffordabilityInputs, Bounds> = {
  grossMonthlyIncome: { min: 500,   max: 5_000_000, label: 'Monthly income' },
  monthlyDebts:       { min: 0,     max: 100_000,   label: 'Monthly debts' },
  frontEndDTI:        { min: 0.05,  max: 0.50,      label: 'Front-end DTI' },
  backEndDTI:         { min: 0.05,  max: 0.50,      label: 'Back-end DTI' },
  mortgageRate:       { min: 0.001, max: 0.30,      label: 'Mortgage rate' },
  loanTermYears:      { min: 1,     max: 50,        label: 'Loan term' },
  downPaymentPct:     { min: 0,     max: 1,         label: 'Down payment' },
  propertyTaxRate:    { min: 0,     max: 0.10,      label: 'Property tax' },
  insuranceRate:      { min: 0,     max: 0.05,      label: 'Insurance' },
  monthlyHOA:         { min: 0,     max: 10_000,    label: 'HOA / Maintenance' },
  closingCostsPct:    { min: 0,     max: 0.10,      label: 'Closing costs' },
};

export function validateAffordabilityInputs(inputs: AffordabilityInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(AFFORDABILITY_BOUNDS) as Array<keyof AffordabilityInputs>) {
    const err = checkRange(inputs[key], AFFORDABILITY_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const PAYOFF_BOUNDS: Record<keyof PayoffInputs, Bounds> = {
  loanAmount:    { min: 1_000,       max: 50_000_000, label: 'Loan amount' },
  annualRate:    { min: 0.001,       max: 0.30,       label: 'Interest rate' },
  loanTermYears: { min: 1,           max: 50,         label: 'Loan term' },
  extraMonthly:  { min: 0,           max: 100_000,    label: 'Extra monthly payment' },
  lumpSum:       { min: 0,           max: 10_000_000, label: 'Lump sum' },
};

export function validatePayoffInputs(inputs: PayoffInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(PAYOFF_BOUNDS) as Array<keyof PayoffInputs>) {
    const err = checkRange(inputs[key], PAYOFF_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const SAVINGS_PLANNER_BOUNDS: Record<keyof SavingsPlannerInputs, Bounds> = {
  targetHomePrice: { min: 10_000,    max: 50_000_000, label: 'Target home price' },
  downPaymentPct:  { min: 0,         max: 1,          label: 'Down payment' },
  closingCostsPct: { min: 0,         max: 0.10,       label: 'Closing costs' },
  currentSavings:  { min: 0,         max: 10_000_000, label: 'Current savings' },
  monthlySavings:  { min: 1,         max: 100_000,    label: 'Monthly savings' },
  annualReturn:    { min: -0.10,     max: 0.30,       label: 'Annual return' },
};

export function validateSavingsPlannerInputs(inputs: SavingsPlannerInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(SAVINGS_PLANNER_BOUNDS) as Array<keyof SavingsPlannerInputs>) {
    const err = checkRange(inputs[key], SAVINGS_PLANNER_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const REFINANCE_BOUNDS = {
  currentBalance:     { min: 1_000,   max: 50_000_000, label: 'Loan balance' },
  currentRate:        { min: 0.001,   max: 0.30,       label: 'Current rate' },
  remainingTermYears: { min: 1,       max: 50,         label: 'Remaining term' },
  newRate:            { min: 0.001,   max: 0.30,       label: 'New rate' },
  newTermYears:       { min: 1,       max: 50,         label: 'New loan term' },
  closingCostsPct:    { min: 0,       max: 0.10,       label: 'Closing costs' },
  closingCostsDollar: { min: 0,       max: 100_000,    label: 'Closing costs' },
};

export function validateRefinanceInputs(inputs: RefinanceInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  const numericKeys = ['currentBalance', 'currentRate', 'remainingTermYears', 'newRate', 'newTermYears'] as const;
  for (const key of numericKeys) {
    const err = checkRange(inputs[key], REFINANCE_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  if (inputs.usesFlatClosingCost) {
    const err = checkRange(inputs.closingCostsDollar, REFINANCE_BOUNDS.closingCostsDollar);
    if (err) errors['closingCostsDollar'] = err;
  } else {
    const err = checkRange(inputs.closingCostsPct, REFINANCE_BOUNDS.closingCostsPct);
    if (err) errors['closingCostsPct'] = err;
  }
  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

const BUY_INPUTS_BOUNDS: Record<keyof BuyInputs, Bounds> = {
  homePrice:       { min: 10_000,  max: 50_000_000, label: 'Home price' },
  downPaymentPct:  { min: 0,       max: 1,           label: 'Down payment' },
  mortgageRate:    { min: 0.001,   max: 0.30,        label: 'Mortgage rate' },
  loanTermYears:   { min: 1,       max: 50,          label: 'Loan term' },
  propertyTaxRate: { min: 0,       max: 0.10,        label: 'Property tax' },
  insuranceRate:   { min: 0,       max: 0.05,        label: 'Insurance' },
  monthlyHOA:      { min: 0,       max: 10_000,      label: 'HOA / maintenance' },
  closingCostsPct: { min: 0,       max: 0.10,        label: 'Closing costs' },
};

const RENT_INPUTS_BOUNDS: Record<keyof RentInputs, Bounds> = {
  monthlyRent:        { min: 1, max: 100_000, label: 'Monthly rent' },
  annualRentIncrease: { min: 0, max: 0.20,    label: 'Annual rent increase' },
  monthlyInsurance:   { min: 0, max: 1_000,   label: "Renter's insurance" },
};

const ASSUMPTIONS_BOUNDS: Record<keyof Assumptions, Bounds> = {
  appreciation:    { min: -0.20, max: 0.30, label: 'Home appreciation' },
  investmentReturn:{ min: -0.20, max: 0.50, label: 'Investment return' },
  marginalTaxRate: { min: 0,     max: 0.50, label: 'Marginal tax rate' },
  yearsToModel:    { min: 1,     max: 50,   label: 'Years to model' },
};

export function validateBuyInputs(inputs: BuyInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(BUY_INPUTS_BOUNDS) as Array<keyof BuyInputs>) {
    const err = checkRange(inputs[key], BUY_INPUTS_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

export function validateRentInputs(inputs: RentInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(RENT_INPUTS_BOUNDS) as Array<keyof RentInputs>) {
    const err = checkRange(inputs[key], RENT_INPUTS_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

export function validateAssumptions(inputs: Assumptions): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(ASSUMPTIONS_BOUNDS) as Array<keyof Assumptions>) {
    const err = checkRange(inputs[key], ASSUMPTIONS_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

export function sanitizeCurrency(raw: string): number {
  return parseFloat(raw.replace(/[$,\s]/g, '')) || 0;
}

const RAISE_VS_JOB_HOP_BOUNDS: Record<keyof RaiseVsJobHopInputs, Bounds> = {
  currentSalary: { min: 10_000,  max: 5_000_000, label: 'Current salary' },
  stayRaise:     { min: -0.10,   max: 1.00,      label: 'Stay raise rate' },
  hopSalary:     { min: 10_000,  max: 5_000_000, label: 'New offer salary' },
  hopRaise:      { min: -0.10,   max: 1.00,      label: 'Hop raise rate' },
  yearsToModel:  { min: 1,       max: 50,         label: 'Years to model' },
};

export function validateRaiseVsJobHopInputs(inputs: RaiseVsJobHopInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(RAISE_VS_JOB_HOP_BOUNDS) as Array<keyof RaiseVsJobHopInputs>) {
    const err = checkRange(inputs[key], RAISE_VS_JOB_HOP_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const CAR_LEASE_BOUNDS: Record<keyof CarLeaseVsBuyInputs, Bounds> = {
  carPrice:             { min: 1_000,    max: 500_000,  label: 'Car price' },
  downPaymentPct:       { min: 0,        max: 1,        label: 'Down payment' },
  loanRate:             { min: 0.001,    max: 0.30,     label: 'Loan rate' },
  loanTermMonths:       { min: 12,       max: 120,      label: 'Loan term' },
  monthlyLeasePayment:  { min: 50,       max: 10_000,   label: 'Monthly lease payment' },
  leaseTermMonths:      { min: 12,       max: 60,       label: 'Lease term' },
  leaseUpfrontCost:     { min: 0,        max: 50_000,   label: 'Lease upfront cost' },
  annualDepreciation:   { min: 0,        max: 0.50,     label: 'Annual depreciation' },
  annualInvestReturn:   { min: -0.20,    max: 0.50,     label: 'Annual investment return' },
  yearsToModel:         { min: 1,        max: 10,       label: 'Years to model' },
};

export function validateCarLeaseVsBuyInputs(inputs: CarLeaseVsBuyInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(CAR_LEASE_BOUNDS) as Array<keyof CarLeaseVsBuyInputs>) {
    const err = checkRange(inputs[key], CAR_LEASE_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  if (inputs.yearsToModel * 12 < inputs.leaseTermMonths) {
    errors['yearsToModel'] = 'Years to model must be at least as long as the lease term.';
  }
  return errors;
}

const RENOVATION_ROI_BOUNDS: Record<keyof RenovationROIInputs, Bounds> = {
  renovationCost:     { min: 100,       max: 5_000_000, label: 'Renovation cost' },
  homeValue:          { min: 10_000,    max: 50_000_000, label: 'Home value' },
  valueIncreasePct:   { min: 0,         max: 2.0,        label: 'Value increase' },
  yearsUntilSale:     { min: 1,         max: 50,         label: 'Years until sale' },
  annualAppreciation: { min: -0.20,     max: 0.50,       label: 'Annual appreciation' },
  annualInvestReturn: { min: -0.20,     max: 0.50,       label: 'Annual investment return' },
};

export function validateRenovationROIInputs(inputs: RenovationROIInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(RENOVATION_ROI_BOUNDS) as Array<keyof RenovationROIInputs>) {
    const err = checkRange(inputs[key], RENOVATION_ROI_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const INVESTMENT_FEES_BOUNDS: Record<keyof InvestmentFeesInputs, Bounds> = {
  initialInvestment:   { min: 0,      max: 100_000_000, label: 'Initial investment' },
  monthlyContribution: { min: 0,      max: 1_000_000,   label: 'Monthly contribution' },
  annualGrossReturn:   { min: -0.20,  max: 0.50,        label: 'Annual gross return' },
  currentExpenseRatio: { min: 0,      max: 0.05,        label: 'Current expense ratio' },
  lowCostExpenseRatio: { min: 0,      max: 0.05,        label: 'Low-cost expense ratio' },
  yearsToModel:        { min: 1,      max: 50,          label: 'Years to model' },
};

export function validateInvestmentFeesInputs(inputs: InvestmentFeesInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(INVESTMENT_FEES_BOUNDS) as Array<keyof InvestmentFeesInputs>) {
    const err = checkRange(inputs[key], INVESTMENT_FEES_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  if (inputs.lowCostExpenseRatio > inputs.currentExpenseRatio) {
    errors['lowCostExpenseRatio'] = 'Low-cost ratio must be less than or equal to the current expense ratio.';
  }
  return errors;
}

const HYSA_BOUNDS: Record<keyof HYSAInputs, Bounds> = {
  initialDeposit:       { min: 0,     max: 10_000_000, label: 'Initial deposit' },
  monthlyContribution:  { min: 0,     max: 100_000,    label: 'Monthly contribution' },
  hysaAPY:              { min: 0,     max: 0.20,       label: 'HYSA APY' },
  traditionalAPY:       { min: 0,     max: 0.10,       label: 'Traditional savings APY' },
  yearsToModel:         { min: 1,     max: 30,         label: 'Years to model' },
};

export function validateHYSAInputs(inputs: HYSAInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(HYSA_BOUNDS) as Array<keyof HYSAInputs>) {
    const err = checkRange(inputs[key], HYSA_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const EFFECTIVE_HOURLY_BOUNDS: Record<keyof EffectiveHourlyInputs, Bounds> = {
  annualGrossSalary:       { min: 10_000,  max: 5_000_000, label: 'Annual salary' },
  federalTaxRate:          { min: 0,       max: 0.50,      label: 'Federal tax rate' },
  stateTaxRate:            { min: 0,       max: 0.50,      label: 'State tax rate' },
  weeklyHoursWorked:       { min: 1,       max: 120,       label: 'Weekly hours worked' },
  weeklyUnpaidOvertime:    { min: 0,       max: 80,        label: 'Weekly unpaid overtime' },
  weeklyCommuteHours:      { min: 0,       max: 80,        label: 'Weekly commute hours' },
  weeklyPrepDecompression: { min: 0,       max: 40,        label: 'Weekly prep/decompression' },
  monthlyWorkExpenses:     { min: 0,       max: 10_000,    label: 'Monthly work expenses' },
  weeksWorkedPerYear:      { min: 1,       max: 52,        label: 'Weeks worked per year' },
};

export function validateEffectiveHourlyInputs(inputs: EffectiveHourlyInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(EFFECTIVE_HOURLY_BOUNDS) as Array<keyof EffectiveHourlyInputs>) {
    const err = checkRange(inputs[key], EFFECTIVE_HOURLY_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const CC_PAYOFF_BOUNDS = {
  balance:        { min: 1,     max: 500_000, label: 'Balance' },
  apr:            { min: 0.001, max: 0.60,    label: 'APR' },
  monthlyPayment: { min: 1,     max: 100_000, label: 'Monthly payment' },
  desiredMonths:  { min: 1,     max: 600,     label: 'Desired payoff months' },
};

export function validateCreditCardPayoffInputs(inputs: CreditCardPayoffInputs): ValidationErrors {
  const errors: ValidationErrors = {};

  const balanceErr = checkRange(inputs.balance, CC_PAYOFF_BOUNDS.balance);
  if (balanceErr) errors['balance'] = balanceErr;

  const aprErr = checkRange(inputs.apr, CC_PAYOFF_BOUNDS.apr);
  if (aprErr) errors['apr'] = aprErr;

  if (inputs.paymentMode === 'payment') {
    const pmtErr = checkRange(inputs.monthlyPayment, CC_PAYOFF_BOUNDS.monthlyPayment);
    if (pmtErr) {
      errors['monthlyPayment'] = pmtErr;
    } else if (!errors['balance'] && !errors['apr']) {
      const monthlyInterest = inputs.balance * (inputs.apr / 12);
      if (inputs.monthlyPayment <= monthlyInterest) {
        errors['monthlyPayment'] = `Payment must exceed monthly interest to reduce the balance.`;
      }
    }
  } else {
    const moErr = checkRange(inputs.desiredMonths, CC_PAYOFF_BOUNDS.desiredMonths);
    if (moErr) errors['desiredMonths'] = moErr;
  }

  return errors;
}

const STUDENT_LOAN_BOUNDS: Record<keyof StudentLoanPayoffInputs, Bounds> = {
  loanBalance:       { min: 100,   max: 2_000_000, label: 'Loan balance' },
  interestRate:      { min: 0.001, max: 0.30,      label: 'Interest rate' },
  standardTermYears: { min: 1,     max: 30,        label: 'Standard term' },
  extraMonthly:      { min: 0,     max: 50_000,    label: 'Extra monthly payment' },
};

export function validateStudentLoanPayoffInputs(inputs: StudentLoanPayoffInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(STUDENT_LOAN_BOUNDS) as Array<keyof StudentLoanPayoffInputs>) {
    const err = checkRange(inputs[key], STUDENT_LOAN_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

export type DebtPayoffErrors = {
  debts: Array<Partial<Record<'name' | 'balance' | 'apr' | 'minPayment', string>>>;
  extraBudget?: string;
};

const DEBT_ITEM_BOUNDS = {
  balance:    { min: 1,     max: 1_000_000, label: 'Balance' },
  apr:        { min: 0,     max: 0.60,      label: 'APR' },
  minPayment: { min: 1,     max: 10_000,    label: 'Minimum payment' },
};

export function validateDebtPayoffInputs(
  debts: DebtItem[],
  extraBudget: number,
): DebtPayoffErrors {
  const errors: DebtPayoffErrors = { debts: debts.map(() => ({})) };

  for (let i = 0; i < debts.length; i++) {
    const d = debts[i];
    if (!d.name.trim()) errors.debts[i].name = 'Name is required.';

    const balErr = checkRange(d.balance, DEBT_ITEM_BOUNDS.balance);
    if (balErr) errors.debts[i].balance = balErr;

    const aprErr = checkRange(d.apr, DEBT_ITEM_BOUNDS.apr);
    if (aprErr) errors.debts[i].apr = aprErr;

    const minErr = checkRange(d.minPayment, DEBT_ITEM_BOUNDS.minPayment);
    if (minErr) errors.debts[i].minPayment = minErr;
  }

  const extraErr = checkRange(extraBudget, { min: 0, max: 50_000, label: 'Extra budget' });
  if (extraErr) errors.extraBudget = extraErr;

  return errors;
}

export function hasDebtErrors(errors: DebtPayoffErrors): boolean {
  if (errors.extraBudget) return true;
  return errors.debts.some(d => Object.keys(d).length > 0);
}

const EMERGENCY_FUND_BOUNDS: Record<keyof EmergencyFundInputs, Bounds> = {
  monthlyExpenses: { min: 100,       max: 100_000,    label: 'Monthly expenses' },
  currentSavings:  { min: 0,         max: 10_000_000, label: 'Current savings' },
  monthlySavings:  { min: 0,         max: 50_000,     label: 'Monthly savings' },
  hysaAPY:         { min: 0,         max: 0.20,       label: 'HYSA APY' },
};

export function validateEmergencyFundInputs(inputs: EmergencyFundInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(EMERGENCY_FUND_BOUNDS) as Array<keyof EmergencyFundInputs>) {
    const err = checkRange(inputs[key], EMERGENCY_FUND_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

type NetWorthNumericKey = Exclude<keyof NetWorthInputs, 'lastYearNetWorth'>;

const NET_WORTH_BOUNDS: Record<NetWorthNumericKey, Bounds> = {
  checkingSavings:     { min: 0, max: 100_000_000, label: 'Checking / savings' },
  investments:         { min: 0, max: 100_000_000, label: 'Investments' },
  retirement:          { min: 0, max: 100_000_000, label: 'Retirement accounts' },
  homeEquity:          { min: 0, max: 100_000_000, label: 'Home equity' },
  vehicleValue:        { min: 0, max: 100_000_000, label: 'Vehicle value' },
  otherAssets:         { min: 0, max: 100_000_000, label: 'Other assets' },
  mortgageBalance:     { min: 0, max: 100_000_000, label: 'Mortgage balance' },
  carLoans:            { min: 0, max: 100_000_000, label: 'Car loans' },
  creditCardBalances:  { min: 0, max: 100_000_000, label: 'Credit card balances' },
  studentLoans:        { min: 0, max: 100_000_000, label: 'Student loans' },
  otherDebt:           { min: 0, max: 100_000_000, label: 'Other debt' },
};

export function validateNetWorthInputs(inputs: NetWorthInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(NET_WORTH_BOUNDS) as NetWorthNumericKey[]) {
    const err = checkRange(inputs[key] as number, NET_WORTH_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  if (inputs.lastYearNetWorth !== null) {
    const err = checkRange(inputs.lastYearNetWorth, { min: -100_000_000, max: 100_000_000, label: 'Last year net worth' });
    if (err) errors['lastYearNetWorth'] = err;
  }
  return errors;
}

const RETIREMENT_PROJECTOR_BOUNDS: Record<keyof RetirementProjectorInputs, Bounds> = {
  currentAge:           { min: 18,    max: 79,          label: 'Current age' },
  retirementAge:        { min: 19,    max: 80,          label: 'Retirement age' },
  currentBalance:       { min: 0,     max: 100_000_000, label: 'Current balance' },
  annualContribution:   { min: 0,     max: 100_000,     label: 'Annual contribution' },
  employerMatchPct:     { min: 0,     max: 1,           label: 'Employer match' },
  matchLimitPct:        { min: 0,     max: 1,           label: 'Match limit' },
  annualSalary:         { min: 0,     max: 10_000_000,  label: 'Annual salary' },
  expectedAnnualReturn: { min: -0.20, max: 0.30,        label: 'Annual return' },
  expectedInflation:    { min: 0,     max: 0.15,        label: 'Inflation rate' },
  targetAnnualExpenses: { min: 0,     max: 10_000_000,  label: 'Annual expenses' },
};

export function validateRetirementProjectorInputs(inputs: RetirementProjectorInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(RETIREMENT_PROJECTOR_BOUNDS) as Array<keyof RetirementProjectorInputs>) {
    const err = checkRange(inputs[key], RETIREMENT_PROJECTOR_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  if (!errors.currentAge && !errors.retirementAge && inputs.retirementAge <= inputs.currentAge) {
    errors['retirementAge'] = 'Retirement age must be greater than current age.';
  }
  return errors;
}

const ROTH_VS_TRADITIONAL_BOUNDS: Record<keyof RothVsTraditionalInputs, Bounds> = {
  annualContribution:    { min: 1,     max: 100_000, label: 'Annual contribution' },
  yearsToRetirement:     { min: 1,     max: 50,      label: 'Years to retirement' },
  currentTaxRate:        { min: 0,     max: 0.50,    label: 'Current tax rate' },
  retirementTaxRate:     { min: 0,     max: 0.50,    label: 'Retirement tax rate' },
  expectedAnnualReturn:  { min: -0.20, max: 0.30,    label: 'Annual return' },
};

export function validateRothVsTraditionalInputs(inputs: RothVsTraditionalInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(ROTH_VS_TRADITIONAL_BOUNDS) as Array<keyof RothVsTraditionalInputs>) {
    const err = checkRange(inputs[key], ROTH_VS_TRADITIONAL_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const SS_BOUNDS = {
  annualIncome:    { min: 0,   max: 10_000_000, label: 'Annual income' },
  currentAge:      { min: 18,  max: 80,         label: 'Current age' },
  lifeExpectancy:  { min: 63,  max: 110,        label: 'Life expectancy' },
};

export function validateSocialSecurityInputs(inputs: SocialSecurityInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(SS_BOUNDS) as Array<keyof typeof SS_BOUNDS>) {
    const err = checkRange(inputs[key as keyof SocialSecurityInputs] as number, SS_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  if (!errors.currentAge && !errors.lifeExpectancy && inputs.lifeExpectancy <= inputs.currentAge) {
    errors['lifeExpectancy'] = 'Life expectancy must be greater than current age.';
  }
  return errors;
}

const TAX_WITHHOLDING_BOUNDS = {
  grossW2Income:      { min: 0, max: 10_000_000, label: 'Gross W-2 income' },
  currentWithholding: { min: 0, max: 5_000_000,  label: 'Current withholding' },
  otherIncome:        { min: 0, max: 10_000_000, label: 'Other income' },
  preTaxDeductions:   { min: 0, max: 500_000,    label: 'Pre-tax deductions' },
};

export function validateTaxWithholdingInputs(inputs: TaxWithholdingInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(TAX_WITHHOLDING_BOUNDS) as Array<keyof typeof TAX_WITHHOLDING_BOUNDS>) {
    const err = checkRange(inputs[key], TAX_WITHHOLDING_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

const SIDE_INCOME_BOUNDS = {
  grossSideIncome: { min: 1,         max: 2_000_000,  label: 'Gross side income' },
  businessExpenses: { min: 0,        max: 500_000,    label: 'Business expenses' },
  primaryW2Income:  { min: 0,        max: 10_000_000, label: 'Primary W-2 income' },
};

export function validateSideIncomeInputs(inputs: SideIncomeInputs): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const key of Object.keys(SIDE_INCOME_BOUNDS) as Array<keyof typeof SIDE_INCOME_BOUNDS>) {
    const err = checkRange(inputs[key], SIDE_INCOME_BOUNDS[key]);
    if (err) errors[key] = err;
  }
  if (!errors.businessExpenses && !errors.grossSideIncome && inputs.businessExpenses > inputs.grossSideIncome) {
    errors['businessExpenses'] = 'Business expenses cannot exceed gross income.';
  }
  return errors;
}
