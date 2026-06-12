export interface Expense {
  id: string;
  label: string;
  amount: number;
}

// Shared 2026 federal tax config (single filer) — single source of truth
import { getStandardDeduction, calcFederalIncomeTax } from './tax-withholding';

export interface TaxEstimate {
  federalTax: number;
  effectiveRate: number;
  annualTakeHome: number;
  monthlyTakeHome: number;
}

export function estimateFederalTax(grossAnnual: number): TaxEstimate {
  if (grossAnnual <= 0) {
    return { federalTax: 0, effectiveRate: 0, annualTakeHome: 0, monthlyTakeHome: 0 };
  }
  const taxable = Math.max(0, grossAnnual - getStandardDeduction('single'));
  const tax = calcFederalIncomeTax(taxable, 'single');
  const effectiveRate = tax / grossAnnual;
  const annualTakeHome = grossAnnual - tax;
  return {
    federalTax: tax,
    effectiveRate,
    annualTakeHome,
    monthlyTakeHome: annualTakeHome / 12,
  };
}

export interface SavingsPoint {
  month: number;
  cumulative: number;
}

export function calcSavingsAccumulation(monthlyNet: number, months: number): SavingsPoint[] {
  const pts: SavingsPoint[] = [];
  for (let m = 0; m <= months; m++) {
    pts.push({ month: m, cumulative: monthlyNet * m });
  }
  return pts;
}

export interface YearRow {
  year: number;
  annualSavings: number;
  cumulative: number;
}

export function calcYearlyBreakdown(monthlyNet: number, years: number): YearRow[] {
  const rows: YearRow[] = [];
  for (let y = 1; y <= years; y++) {
    rows.push({
      year: y,
      annualSavings: monthlyNet * 12,
      cumulative: monthlyNet * 12 * y,
    });
  }
  return rows;
}

export const DEFAULT_EXPENSES: Expense[] = [
  { id: 'e1', label: 'Housing / Rent', amount: 1500 },
  { id: 'e2', label: 'Food & Groceries', amount: 400 },
  { id: 'e3', label: 'Transportation', amount: 300 },
  { id: 'e4', label: 'Utilities', amount: 150 },
  { id: 'e5', label: 'Insurance', amount: 200 },
  { id: 'e6', label: 'Subscriptions', amount: 50 },
  { id: 'e7', label: 'Other', amount: 100 },
];
