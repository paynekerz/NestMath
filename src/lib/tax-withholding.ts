// 2025 federal income tax brackets and standard deductions
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

const TAX_CONFIG_2025: Record<FilingStatus, FilingConfig> = {
  single: {
    standardDeduction: 15_000,
    brackets: [
      { rate: 0.10, min: 0,       max: 11_925 },
      { rate: 0.12, min: 11_925,  max: 48_475 },
      { rate: 0.22, min: 48_475,  max: 103_350 },
      { rate: 0.24, min: 103_350, max: 197_300 },
      { rate: 0.32, min: 197_300, max: 250_525 },
      { rate: 0.35, min: 250_525, max: 626_350 },
      { rate: 0.37, min: 626_350, max: Infinity },
    ],
  },
  mfj: {
    standardDeduction: 30_000,
    brackets: [
      { rate: 0.10, min: 0,       max: 23_850 },
      { rate: 0.12, min: 23_850,  max: 96_950 },
      { rate: 0.22, min: 96_950,  max: 206_700 },
      { rate: 0.24, min: 206_700, max: 394_600 },
      { rate: 0.32, min: 394_600, max: 501_050 },
      { rate: 0.35, min: 501_050, max: 751_600 },
      { rate: 0.37, min: 751_600, max: Infinity },
    ],
  },
  hoh: {
    standardDeduction: 22_500,
    brackets: [
      { rate: 0.10, min: 0,       max: 17_000 },
      { rate: 0.12, min: 17_000,  max: 64_850 },
      { rate: 0.22, min: 64_850,  max: 103_350 },
      { rate: 0.24, min: 103_350, max: 197_300 },
      { rate: 0.32, min: 197_300, max: 250_500 },
      { rate: 0.35, min: 250_500, max: 626_350 },
      { rate: 0.37, min: 626_350, max: Infinity },
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
  return TAX_CONFIG_2025[filingStatus].standardDeduction;
}

export function calcFederalIncomeTax(taxableIncome: number, filingStatus: FilingStatus): number {
  const { total } = applyBrackets(taxableIncome, TAX_CONFIG_2025[filingStatus].brackets);
  return Math.round(total);
}

export function calcTaxWithholding(inputs: TaxWithholdingInputs): TaxWithholdingResult {
  const config = TAX_CONFIG_2025[inputs.filingStatus];
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
