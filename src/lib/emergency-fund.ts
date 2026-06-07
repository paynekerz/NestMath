export interface EmergencyFundInputs {
  monthlyExpenses: number;
  currentSavings: number;
  monthlySavings: number;
  hysaAPY: number;  // decimal, e.g. 0.045
}

export interface EmergencyFundMonthPoint {
  month: number;
  savings: number;
}

export interface EmergencyFundResult {
  currentMonthsCoverage: number;
  threeMonthTarget: number;
  sixMonthTarget: number;
  monthsToThree: number;  // 0 = already met
  monthsToSix: number;    // 0 = already met
  interestEarned: number;
  months: EmergencyFundMonthPoint[];
}

export const DEFAULT_EMERGENCY_FUND_INPUTS: EmergencyFundInputs = {
  monthlyExpenses: 3_500,
  currentSavings: 2_000,
  monthlySavings: 300,
  hysaAPY: 0.045,
};

const MAX_MONTHS = 240;

export function calcEmergencyFund(inputs: EmergencyFundInputs): EmergencyFundResult {
  const { monthlyExpenses, currentSavings, monthlySavings, hysaAPY } = inputs;
  const monthlyRate = hysaAPY / 12;

  const threeMonthTarget = monthlyExpenses * 3;
  const sixMonthTarget = monthlyExpenses * 6;
  const currentMonthsCoverage = monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0;

  let monthsToThree = currentSavings >= threeMonthTarget ? 0 : -1;
  let monthsToSix = currentSavings >= sixMonthTarget ? 0 : -1;

  const months: EmergencyFundMonthPoint[] = [{ month: 0, savings: currentSavings }];
  let savings = currentSavings;
  let interestEarned = 0;

  // If already at 6-month goal, project 12 months for the chart only.
  // Otherwise, run until 6-month goal is reached or MAX_MONTHS.
  const limit = monthsToSix === 0 ? 12 : MAX_MONTHS;

  for (let m = 1; m <= limit; m++) {
    const interest = savings * monthlyRate;
    savings = savings + interest + monthlySavings;
    months.push({ month: m, savings });

    if (monthsToSix === -1) {
      interestEarned += interest;
      if (monthsToThree === -1 && savings >= threeMonthTarget) monthsToThree = m;
      if (savings >= sixMonthTarget) {
        monthsToSix = m;
        break;
      }
    }
  }

  if (monthsToThree === -1) monthsToThree = MAX_MONTHS;
  if (monthsToSix === -1) monthsToSix = MAX_MONTHS;

  return {
    currentMonthsCoverage,
    threeMonthTarget,
    sixMonthTarget,
    monthsToThree,
    monthsToSix,
    interestEarned,
    months,
  };
}
