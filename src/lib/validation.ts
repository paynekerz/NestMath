import type { AffordabilityInputs } from './affordability';
import type { BuyInputs, RentInputs, Assumptions, PayoffInputs, RefinanceInputs } from './calculator';
import type { SavingsPlannerInputs } from './savings';
import type { RaiseVsJobHopInputs } from './raise-vs-job-hop';
import type { CarLeaseVsBuyInputs } from './car-lease-vs-buy';
import type { RenovationROIInputs } from './renovation-roi';
import type { InvestmentFeesInputs } from './investment-fees';
import type { HYSAInputs } from './hysa';
import type { EffectiveHourlyInputs } from './effective-hourly';

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
