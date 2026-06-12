// 2026 federal income tax brackets and standard deductions (Rev. Proc. 2025-32)
// Update annually when IRS publishes inflation adjustments

export type FilingStatus = 'single' | 'mfj' | 'hoh';

interface TaxBracket {
  rate: number;
  min: number;
  max: number;
}

interface FilingConfig {
  standardDeduction: number;
  brackets: TaxBracket[];
}

const TAX_CONFIG_2026: Record<FilingStatus, FilingConfig> = {
  single: {
    standardDeduction: 16_100,
    brackets: [
      { rate: 0.10, min: 0,       max: 12_400 },
      { rate: 0.12, min: 12_400,  max: 50_400 },
      { rate: 0.22, min: 50_400,  max: 105_700 },
      { rate: 0.24, min: 105_700, max: 201_775 },
      { rate: 0.32, min: 201_775, max: 256_225 },
      { rate: 0.35, min: 256_225, max: 640_600 },
      { rate: 0.37, min: 640_600, max: Infinity },
    ],
  },
  mfj: {
    standardDeduction: 32_200,
    brackets: [
      { rate: 0.10, min: 0,       max: 24_800 },
      { rate: 0.12, min: 24_800,  max: 100_800 },
      { rate: 0.22, min: 100_800, max: 211_400 },
      { rate: 0.24, min: 211_400, max: 403_550 },
      { rate: 0.32, min: 403_550, max: 512_450 },
      { rate: 0.35, min: 512_450, max: 768_700 },
      { rate: 0.37, min: 768_700, max: Infinity },
    ],
  },
  hoh: {
    standardDeduction: 24_150,
    brackets: [
      { rate: 0.10, min: 0,       max: 17_700 },
      { rate: 0.12, min: 17_700,  max: 67_450 },
      { rate: 0.22, min: 67_450,  max: 105_700 },
      { rate: 0.24, min: 105_700, max: 201_775 },
      { rate: 0.32, min: 201_775, max: 256_200 },
      { rate: 0.35, min: 256_200, max: 640_600 },
      { rate: 0.37, min: 640_600, max: Infinity },
    ],
  },
};

export interface TaxWithholdingInputs {
  filingStatus: FilingStatus;
  grossW2Income: number;
  currentWithholding: number;
  otherIncome: number;
  preTaxDeductions: number;
}

export const DEFAULT_TAX_WITHHOLDING_INPUTS: TaxWithholdingInputs = {
  filingStatus: 'single',
  grossW2Income: 75_000,
  currentWithholding: 10_000,
  otherIncome: 0,
  preTaxDeductions: 6_500,
};

export interface BracketBreakdown {
  rate: number;
  taxableInBracket: number;
  taxInBracket: number;
}

export interface TaxWithholdingResult {
  standardDeduction: number;
  adjustedGrossIncome: number;
  taxableIncome: number;
  estimatedTaxOwed: number;
  currentWithholding: number;
  difference: number;
  quarterlyEstimatedPayment: number | null;
  verdict: string;
  effectiveTaxRate: number;
  marginalRate: number;
  bracketBreakdown: BracketBreakdown[];
}

function applyBrackets(taxableIncome: number, brackets: TaxBracket[]): { total: number; marginalRate: number; breakdown: BracketBreakdown[] } {
  let total = 0;
  let marginalRate = brackets[0].rate;
  const breakdown: BracketBreakdown[] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const taxInBracket = taxableInBracket * bracket.rate;
    total += taxInBracket;
    marginalRate = bracket.rate;
    if (taxableInBracket > 0) {
      breakdown.push({ rate: bracket.rate, taxableInBracket, taxInBracket });
    }
  }

  return { total, marginalRate, breakdown };
}

export function getStandardDeduction(filingStatus: FilingStatus): number {
  return TAX_CONFIG_2026[filingStatus].standardDeduction;
}

export function calcFederalIncomeTax(taxableIncome: number, filingStatus: FilingStatus): number {
  const { total } = applyBrackets(taxableIncome, TAX_CONFIG_2026[filingStatus].brackets);
  return Math.round(total);
}

export function calcTaxWithholding(inputs: TaxWithholdingInputs): TaxWithholdingResult {
  const config = TAX_CONFIG_2026[inputs.filingStatus];
  const adjustedGrossIncome = Math.max(0, inputs.grossW2Income + inputs.otherIncome - inputs.preTaxDeductions);
  const taxableIncome = Math.max(0, adjustedGrossIncome - config.standardDeduction);

  const { total: estimatedTaxOwed, marginalRate, breakdown } = applyBrackets(taxableIncome, config.brackets);
  const roundedTax = Math.round(estimatedTaxOwed);

  const difference = inputs.currentWithholding - roundedTax;
  const underWithheld = roundedTax - inputs.currentWithholding;

  const quarterlyEstimatedPayment = underWithheld > 1_000
    ? Math.ceil(underWithheld / 4)
    : null;

  let verdict: string;
  if (Math.abs(difference) < 100) {
    verdict = 'On track: your withholding closely matches your estimated tax.';
  } else if (difference > 0) {
    verdict = `Expect a refund of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(difference)}.`;
  } else {
    verdict = `You may owe ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(-difference)}; consider adjusting your W-4.`;
  }

  const effectiveTaxRate = adjustedGrossIncome > 0 ? roundedTax / adjustedGrossIncome : 0;

  return {
    standardDeduction: config.standardDeduction,
    adjustedGrossIncome,
    taxableIncome,
    estimatedTaxOwed: roundedTax,
    currentWithholding: inputs.currentWithholding,
    difference,
    quarterlyEstimatedPayment,
    verdict,
    effectiveTaxRate,
    marginalRate,
    bracketBreakdown: breakdown,
  };
}
