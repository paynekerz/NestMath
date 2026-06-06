export interface RenovationROIInputs {
  renovationCost: number;
  homeValue: number;
  valueIncreasePct: number;
  yearsUntilSale: number;
  annualAppreciation: number;
  annualInvestReturn: number;
}

export interface RenovationROIYear {
  year: number;
  homeValueWithReno: number;
  renovationGain: number;
  renovationNetGain: number;
  investmentValue: number;
  investmentNetGain: number;
  delta: number;
}

export interface RenovationROIResult {
  years: RenovationROIYear[];
  renoNetGain: number;
  renoROIPct: number;
  investNetGain: number;
  renoWins: boolean;
  delta: number;
}

export const DEFAULT_RENOVATION_ROI_INPUTS: RenovationROIInputs = {
  renovationCost: 30_000,
  homeValue: 400_000,
  valueIncreasePct: 0.05,
  yearsUntilSale: 7,
  annualAppreciation: 0.03,
  annualInvestReturn: 0.07,
};

export function calcRenovationROI(inputs: RenovationROIInputs): RenovationROIResult {
  const { renovationCost, homeValue, valueIncreasePct, yearsUntilSale, annualAppreciation, annualInvestReturn } = inputs;

  const years: RenovationROIYear[] = [];

  for (let n = 1; n <= yearsUntilSale; n++) {
    const appreciationFactor = Math.pow(1 + annualAppreciation, n);
    const homeValueWithReno = homeValue * (1 + valueIncreasePct) * appreciationFactor;
    const renovationGain = homeValue * valueIncreasePct * appreciationFactor;
    const renovationNetGain = renovationGain - renovationCost;

    const investmentValue = renovationCost * Math.pow(1 + annualInvestReturn, n);
    const investmentNetGain = investmentValue - renovationCost;

    const delta = renovationNetGain - investmentNetGain;

    years.push({
      year: n,
      homeValueWithReno,
      renovationGain,
      renovationNetGain,
      investmentValue,
      investmentNetGain,
      delta,
    });
  }

  const last = years[years.length - 1];
  const renoNetGain = last?.renovationNetGain ?? 0;
  const investNetGain = last?.investmentNetGain ?? 0;
  const renoROIPct = renovationCost > 0 ? (renoNetGain / renovationCost) * 100 : 0;
  const renoWins = renoNetGain >= investNetGain;
  const delta = Math.abs(renoNetGain - investNetGain);

  return { years, renoNetGain, renoROIPct, investNetGain, renoWins, delta };
}
