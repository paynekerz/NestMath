export interface RetirementProjectorInputs {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualContribution: number;
  employerMatchPct: number;
  matchLimitPct: number;
  annualSalary: number;
  expectedAnnualReturn: number;
  expectedInflation: number;
  targetAnnualExpenses: number; // 0 = auto (25× annualSalary)
}

export const DEFAULT_RETIREMENT_PROJECTOR_INPUTS: RetirementProjectorInputs = {
  currentAge: 30,
  retirementAge: 65,
  currentBalance: 25_000,
  annualContribution: 6_500,
  employerMatchPct: 0.04,
  matchLimitPct: 0.04,
  annualSalary: 75_000,
  expectedAnnualReturn: 0.07,
  expectedInflation: 0.025,
  targetAnnualExpenses: 0,
};

export interface RetirementProjectorYearRow {
  year: number;
  age: number;
  annualContribution: number;
  employerMatch: number;
  yearEndBalance: number;
}

export interface RetirementProjectorChartRow {
  year: number;
  age: number;
  ownBalance: number;
  matchBonus: number;
}

export interface RetirementProjectorResult {
  projectedBalance: number;
  inflationAdjustedBalance: number;
  estimatedMonthlyIncome: number;
  targetBalance: number;
  shortfallOrSurplus: number;
  totalEmployerMatchContributed: number;
  annualEmployerMatch: number;
  yearsToRetirement: number;
  years: RetirementProjectorYearRow[];
  chartRows: RetirementProjectorChartRow[];
}

export function calcRetirementProjector(inputs: RetirementProjectorInputs): RetirementProjectorResult {
  const {
    currentAge, retirementAge, currentBalance, annualContribution,
    employerMatchPct, matchLimitPct, annualSalary,
    expectedAnnualReturn, expectedInflation, targetAnnualExpenses,
  } = inputs;

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const r = expectedAnnualReturn;

  const limitAmount = matchLimitPct * annualSalary;
  const matchFraction = limitAmount > 0 ? Math.min(annualContribution / limitAmount, 1) : 0;
  const annualEmployerMatch = matchFraction * employerMatchPct * annualSalary;
  const totalAnnualDeposit = annualContribution + annualEmployerMatch;

  const years: RetirementProjectorYearRow[] = [];
  const chartRows: RetirementProjectorChartRow[] = [
    { year: 0, age: currentAge, ownBalance: Math.round(currentBalance), matchBonus: 0 },
  ];

  let balance = currentBalance;
  let balanceNoMatch = currentBalance;
  let totalMatchContributed = 0;

  for (let i = 1; i <= yearsToRetirement; i++) {
    balance = balance * (1 + r) + totalAnnualDeposit;
    balanceNoMatch = balanceNoMatch * (1 + r) + annualContribution;
    totalMatchContributed += annualEmployerMatch;

    years.push({
      year: i,
      age: currentAge + i,
      annualContribution: Math.round(annualContribution),
      employerMatch: Math.round(annualEmployerMatch),
      yearEndBalance: Math.round(balance),
    });

    chartRows.push({
      year: i,
      age: currentAge + i,
      ownBalance: Math.round(balanceNoMatch),
      matchBonus: Math.round(balance - balanceNoMatch),
    });
  }

  const projectedBalance = Math.round(balance);
  const inflationFactor = Math.pow(1 + expectedInflation, yearsToRetirement);
  const inflationAdjustedBalance = Math.round(balance / inflationFactor);
  const estimatedMonthlyIncome = Math.round(inflationAdjustedBalance * 0.04 / 12);

  const baseExpenses = targetAnnualExpenses > 0 ? targetAnnualExpenses : annualSalary;
  const targetBalance = Math.round(25 * baseExpenses);
  const shortfallOrSurplus = inflationAdjustedBalance - targetBalance;

  return {
    projectedBalance,
    inflationAdjustedBalance,
    estimatedMonthlyIncome,
    targetBalance,
    shortfallOrSurplus,
    totalEmployerMatchContributed: Math.round(totalMatchContributed),
    annualEmployerMatch: Math.round(annualEmployerMatch),
    yearsToRetirement,
    years,
    chartRows,
  };
}
