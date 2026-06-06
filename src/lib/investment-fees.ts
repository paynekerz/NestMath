export interface InvestmentFeesInputs {
  initialInvestment: number;
  monthlyContribution: number;
  annualGrossReturn: number;
  currentExpenseRatio: number;
  lowCostExpenseRatio: number;
  yearsToModel: number;
}

export const DEFAULT_INVESTMENT_FEES_INPUTS: InvestmentFeesInputs = {
  initialInvestment: 50_000,
  monthlyContribution: 500,
  annualGrossReturn: 0.08,
  currentExpenseRatio: 0.01,
  lowCostExpenseRatio: 0.0004,
  yearsToModel: 30,
};

export interface InvestmentFeesYearRow {
  year: number;
  portfolioCurrentFees: number;
  portfolioLowCost: number;
  annualFeeDrag: number;
  cumulativeFeeDrag: number;
}

export interface InvestmentFeesResult {
  portfolioCurrentFees: number;
  portfolioLowCost: number;
  feeDragDollar: number;
  feeDragPct: number;
  totalContributions: number;
  initialInvestment: number;
  years: InvestmentFeesYearRow[];
}

export function calcInvestmentFees(inputs: InvestmentFeesInputs): InvestmentFeesResult {
  const {
    initialInvestment, monthlyContribution, annualGrossReturn,
    currentExpenseRatio, lowCostExpenseRatio, yearsToModel,
  } = inputs;

  const rHigh = (annualGrossReturn - currentExpenseRatio) / 12;
  const rLow  = (annualGrossReturn - lowCostExpenseRatio) / 12;

  let pvHigh = initialInvestment;
  let pvLow  = initialInvestment;
  let prevDrag = 0;
  const totalMonths = yearsToModel * 12;
  const years: InvestmentFeesYearRow[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    pvHigh = pvHigh * (1 + rHigh) + monthlyContribution;
    pvLow  = pvLow  * (1 + rLow)  + monthlyContribution;

    if (month % 12 === 0) {
      const cumulativeFeeDrag = pvLow - pvHigh;
      const annualFeeDrag = cumulativeFeeDrag - prevDrag;
      prevDrag = cumulativeFeeDrag;

      years.push({
        year: month / 12,
        portfolioCurrentFees: Math.round(pvHigh),
        portfolioLowCost: Math.round(pvLow),
        annualFeeDrag: Math.round(annualFeeDrag),
        cumulativeFeeDrag: Math.round(cumulativeFeeDrag),
      });
    }
  }

  const feeDragDollar = pvLow - pvHigh;
  const feeDragPct = pvLow > 0 ? (feeDragDollar / pvLow) * 100 : 0;
  const totalContributions = initialInvestment + monthlyContribution * totalMonths;

  return {
    portfolioCurrentFees: Math.round(pvHigh),
    portfolioLowCost: Math.round(pvLow),
    feeDragDollar: Math.round(feeDragDollar),
    feeDragPct,
    totalContributions: Math.round(totalContributions),
    initialInvestment,
    years,
  };
}
