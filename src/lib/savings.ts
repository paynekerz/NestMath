export interface SavingsPlannerInputs {
  targetHomePrice: number;
  downPaymentPct: number;     // decimal, e.g. 0.20
  closingCostsPct: number;    // decimal, e.g. 0.03
  currentSavings: number;
  monthlySavings: number;
  annualReturn: number;       // annual decimal, e.g. 0.045
}

export interface SavingsPlannerMonthResult {
  month: number;
  contribution: number;
  returnEarned: number;
  cumulativeSavings: number;
  remainingToGoal: number;
}

export interface SavingsPlannerResult {
  cashToClose: number;
  downPayment: number;
  closingCosts: number;
  monthsToGoal: number | null;  // null = not reached in 360 months; 0 = already at goal
  totalSaved: number;
  growthFromReturns: number;
  months: SavingsPlannerMonthResult[];
}

export const DEFAULT_SAVINGS_PLANNER_INPUTS: SavingsPlannerInputs = {
  targetHomePrice: 400_000,
  downPaymentPct: 0.20,
  closingCostsPct: 0.03,
  currentSavings: 10_000,
  monthlySavings: 1_000,
  annualReturn: 0.045,
};

export function calcSavingsPlan(inputs: SavingsPlannerInputs): SavingsPlannerResult {
  const downPayment = inputs.targetHomePrice * inputs.downPaymentPct;
  const closingCosts = inputs.targetHomePrice * inputs.closingCostsPct;
  const cashToClose = downPayment + closingCosts;

  const monthlyRate = inputs.annualReturn / 12;
  const MAX_MONTHS = 360;

  let savings = inputs.currentSavings;
  let monthsToGoal: number | null = null;
  const months: SavingsPlannerMonthResult[] = [];

  if (savings >= cashToClose) {
    monthsToGoal = 0;
  } else {
    for (let m = 1; m <= MAX_MONTHS; m++) {
      const returnEarned = savings * monthlyRate;
      savings = savings * (1 + monthlyRate) + inputs.monthlySavings;

      months.push({
        month: m,
        contribution: inputs.monthlySavings,
        returnEarned,
        cumulativeSavings: savings,
        remainingToGoal: Math.max(0, cashToClose - savings),
      });

      if (savings >= cashToClose) {
        monthsToGoal = m;
        break;
      }
    }
  }

  const totalSaved = monthsToGoal === 0 ? inputs.currentSavings : savings;
  const monthsElapsed = monthsToGoal ?? MAX_MONTHS;
  const contributedTotal = inputs.currentSavings + inputs.monthlySavings * monthsElapsed;
  const growthFromReturns = Math.max(0, totalSaved - contributedTotal);

  return {
    cashToClose,
    downPayment,
    closingCosts,
    monthsToGoal,
    totalSaved,
    growthFromReturns,
    months,
  };
}
