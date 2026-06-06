export interface HYSAInputs {
  initialDeposit: number;
  monthlyContribution: number;
  hysaAPY: number;
  traditionalAPY: number;
  yearsToModel: number;
}

export const DEFAULT_HYSA_INPUTS: HYSAInputs = {
  initialDeposit: 5_000,
  monthlyContribution: 300,
  hysaAPY: 0.045,
  traditionalAPY: 0.0045,
  yearsToModel: 5,
};

export interface HYSAYearRow {
  year: number;
  balanceHYSA: number;
  balanceTraditional: number;
  interestHYSA: number;
  interestTraditional: number;
  delta: number;
}

export interface HYSAResult {
  finalBalanceHYSA: number;
  finalBalanceTraditional: number;
  totalContributions: number;
  interestEarnedHYSA: number;
  interestEarnedTraditional: number;
  extraEarned: number;
  initialDeposit: number;
  years: HYSAYearRow[];
}

export function calcHYSA(inputs: HYSAInputs): HYSAResult {
  const { initialDeposit, monthlyContribution, hysaAPY, traditionalAPY, yearsToModel } = inputs;

  const rHYSA = hysaAPY / 12;
  const rTrad = traditionalAPY / 12;

  let pvHYSA = initialDeposit;
  let pvTrad = initialDeposit;
  const totalMonths = yearsToModel * 12;
  const years: HYSAYearRow[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    pvHYSA = pvHYSA * (1 + rHYSA) + monthlyContribution;
    pvTrad = pvTrad * (1 + rTrad) + monthlyContribution;

    if (month % 12 === 0) {
      const contribSoFar = initialDeposit + monthlyContribution * month;
      years.push({
        year: month / 12,
        balanceHYSA: Math.round(pvHYSA),
        balanceTraditional: Math.round(pvTrad),
        interestHYSA: Math.round(pvHYSA - contribSoFar),
        interestTraditional: Math.round(pvTrad - contribSoFar),
        delta: Math.round(pvHYSA - pvTrad),
      });
    }
  }

  const totalContributions = initialDeposit + monthlyContribution * totalMonths;

  return {
    finalBalanceHYSA: Math.round(pvHYSA),
    finalBalanceTraditional: Math.round(pvTrad),
    totalContributions: Math.round(totalContributions),
    interestEarnedHYSA: Math.round(pvHYSA - totalContributions),
    interestEarnedTraditional: Math.round(pvTrad - totalContributions),
    extraEarned: Math.round(pvHYSA - pvTrad),
    initialDeposit,
    years,
  };
}
