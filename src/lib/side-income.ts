// 2026 Social Security wage base — update annually
const SS_WAGE_BASE = 184_500;

import { type FilingStatus, getStandardDeduction, calcFederalIncomeTax } from './tax-withholding';
export type { FilingStatus };

export interface SideIncomeInputs {
  grossSideIncome: number;
  businessExpenses: number;
  primaryW2Income: number;
  filingStatus: FilingStatus;
}

export const DEFAULT_SIDE_INCOME_INPUTS: SideIncomeInputs = {
  grossSideIncome: 20_000,
  businessExpenses: 2_000,
  primaryW2Income: 60_000,
  filingStatus: 'single',
};

export interface SideIncomeResult {
  grossSideIncome: number;
  businessExpenses: number;
  netSEIncome: number;
  seTaxBase: number;
  selfEmploymentTax: number;
  seTaxDeduction: number;
  taxableSEIncome: number;
  incomeTaxOnSideIncome: number;
  trueTakeHome: number;
  totalTaxOnSideIncome: number;
  quarterlyEstimatedPayment: number | null;
  effectiveTaxRate: number;
}

export function calcSideIncome(inputs: SideIncomeInputs): SideIncomeResult {
  const { grossSideIncome, businessExpenses, primaryW2Income, filingStatus } = inputs;

  const netSEIncome = Math.max(0, grossSideIncome - businessExpenses);
  const seTaxBase = netSEIncome * 0.9235;

  // SE tax: 15.3% up to SS wage base ($176,100 in 2025), 2.9% Medicare-only above
  const ssTaxable = Math.min(seTaxBase, SS_WAGE_BASE);
  const selfEmploymentTax = ssTaxable * 0.153 + Math.max(0, seTaxBase - SS_WAGE_BASE) * 0.029;

  const seTaxDeduction = selfEmploymentTax / 2;
  const taxableSEIncome = Math.max(0, netSEIncome - seTaxDeduction);

  const standardDeduction = getStandardDeduction(filingStatus);
  const w2Taxable = Math.max(0, primaryW2Income - standardDeduction);
  const totalTaxable = Math.max(0, primaryW2Income + taxableSEIncome - standardDeduction);

  const taxOnW2 = calcFederalIncomeTax(w2Taxable, filingStatus);
  const taxOnTotal = calcFederalIncomeTax(totalTaxable, filingStatus);
  const incomeTaxOnSideIncome = Math.max(0, taxOnTotal - taxOnW2);

  const roundedSETax = Math.round(selfEmploymentTax);
  const roundedIncomeTax = Math.round(incomeTaxOnSideIncome);
  const totalTaxOnSideIncome = roundedSETax + roundedIncomeTax;
  const trueTakeHome = Math.round(netSEIncome) - totalTaxOnSideIncome;

  const quarterlyEstimatedPayment = totalTaxOnSideIncome > 1_000
    ? Math.ceil(totalTaxOnSideIncome / 4)
    : null;

  const effectiveTaxRate = netSEIncome > 0 ? totalTaxOnSideIncome / netSEIncome : 0;

  return {
    grossSideIncome,
    businessExpenses,
    netSEIncome: Math.round(netSEIncome),
    seTaxBase: Math.round(seTaxBase),
    selfEmploymentTax: roundedSETax,
    seTaxDeduction: Math.round(seTaxDeduction),
    taxableSEIncome: Math.round(taxableSEIncome),
    incomeTaxOnSideIncome: roundedIncomeTax,
    trueTakeHome,
    totalTaxOnSideIncome,
    quarterlyEstimatedPayment,
    effectiveTaxRate,
  };
}
