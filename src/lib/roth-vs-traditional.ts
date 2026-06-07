export interface RothVsTraditionalInputs {
  annualContribution: number;
  yearsToRetirement: number;
  currentTaxRate: number;
  retirementTaxRate: number;
  expectedAnnualReturn: number;
}

export const DEFAULT_ROTH_VS_TRADITIONAL_INPUTS: RothVsTraditionalInputs = {
  annualContribution: 7_000,
  yearsToRetirement: 30,
  currentTaxRate: 0.22,
  retirementTaxRate: 0.15,
  expectedAnnualReturn: 0.07,
};

export interface RothVsTraditionalYearRow {
  year: number;
  rothBalance: number;
  tradGrossBalance: number;
  tradAfterTaxValue: number;
  delta: number; // rothBalance - tradAfterTaxValue (positive = Roth ahead)
}

export interface RothVsTraditionalChartRow {
  year: number;
  rothBalance: number;
  tradAfterTax: number;
  tradTaxOwed: number;
}

export interface RothVsTraditionalResult {
  rothFinalBalance: number;
  tradFinalGrossBalance: number;
  tradFinalAfterTaxValue: number;
  winner: 'roth' | 'traditional';
  taxSavingsNowAnnual: number;
  taxSavingsNowTotal: number;
  taxOwedAtRetirement: number;
  netAdvantage: number;
  years: RothVsTraditionalYearRow[];
  chartRows: RothVsTraditionalChartRow[];
}

export function calcRothVsTraditional(inputs: RothVsTraditionalInputs): RothVsTraditionalResult {
  const {
    annualContribution,
    yearsToRetirement,
    currentTaxRate,
    retirementTaxRate,
    expectedAnnualReturn: r,
  } = inputs;

  const years: RothVsTraditionalYearRow[] = [];
  const chartRows: RothVsTraditionalChartRow[] = [
    { year: 0, rothBalance: 0, tradAfterTax: 0, tradTaxOwed: 0 },
  ];

  let balance = 0;

  for (let i = 1; i <= yearsToRetirement; i++) {
    balance = balance * (1 + r) + annualContribution;

    const gross = Math.round(balance);
    const tradAfterTax = Math.round(balance * (1 - retirementTaxRate));
    const tradTaxOwed = gross - tradAfterTax;
    const delta = gross - tradAfterTax;

    years.push({
      year: i,
      rothBalance: gross,
      tradGrossBalance: gross,
      tradAfterTaxValue: tradAfterTax,
      delta,
    });

    chartRows.push({
      year: i,
      rothBalance: gross,
      tradAfterTax,
      tradTaxOwed,
    });
  }

  const rothFinalBalance = Math.round(balance);
  const tradFinalGrossBalance = rothFinalBalance;
  const tradFinalAfterTaxValue = Math.round(balance * (1 - retirementTaxRate));
  const winner: 'roth' | 'traditional' =
    rothFinalBalance >= tradFinalAfterTaxValue ? 'roth' : 'traditional';
  const taxSavingsNowAnnual = Math.round(annualContribution * currentTaxRate);
  const taxSavingsNowTotal = taxSavingsNowAnnual * yearsToRetirement;
  const taxOwedAtRetirement = tradFinalGrossBalance - tradFinalAfterTaxValue;
  const netAdvantage = Math.abs(rothFinalBalance - tradFinalAfterTaxValue);

  return {
    rothFinalBalance,
    tradFinalGrossBalance,
    tradFinalAfterTaxValue,
    winner,
    taxSavingsNowAnnual,
    taxSavingsNowTotal,
    taxOwedAtRetirement,
    netAdvantage,
    years,
    chartRows,
  };
}
