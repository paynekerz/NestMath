export interface EffectiveHourlyInputs {
  annualGrossSalary: number;
  federalTaxRate: number;
  stateTaxRate: number;
  weeklyHoursWorked: number;
  weeklyUnpaidOvertime: number;
  weeklyCommuteHours: number;
  weeklyPrepDecompression: number;
  monthlyWorkExpenses: number;
  weeksWorkedPerYear: number;
}

export const DEFAULT_EFFECTIVE_HOURLY_INPUTS: EffectiveHourlyInputs = {
  annualGrossSalary: 75_000,
  federalTaxRate: 0.22,
  stateTaxRate: 0.05,
  weeklyHoursWorked: 40,
  weeklyUnpaidOvertime: 5,
  weeklyCommuteHours: 5,
  weeklyPrepDecompression: 3,
  monthlyWorkExpenses: 200,
  weeksWorkedPerYear: 50,
};

export interface EffectiveHourlyResult {
  annualTakeHome: number;
  annualWorkExpenses: number;
  adjustedTakeHome: number;
  statedHourlyGross: number;
  effectiveHourlyNet: number;
  hiddenHoursPerWeek: number;
  totalRealHoursPerWeek: number;
  contractedHoursPerWeek: number;
  annualHiddenHours: number;
  delta: number;
}

const FICA_RATE = 0.0765;

export function calcEffectiveHourly(inputs: EffectiveHourlyInputs): EffectiveHourlyResult {
  const {
    annualGrossSalary,
    federalTaxRate,
    stateTaxRate,
    weeklyHoursWorked,
    weeklyUnpaidOvertime,
    weeklyCommuteHours,
    weeklyPrepDecompression,
    monthlyWorkExpenses,
    weeksWorkedPerYear,
  } = inputs;

  const totalTaxRate = federalTaxRate + stateTaxRate + FICA_RATE;
  const annualTakeHome = annualGrossSalary * (1 - totalTaxRate);
  const annualWorkExpenses = monthlyWorkExpenses * 12;
  const adjustedTakeHome = annualTakeHome - annualWorkExpenses;

  const contractedHoursPerYear = weeklyHoursWorked * weeksWorkedPerYear;
  const statedHourlyGross = contractedHoursPerYear > 0
    ? annualGrossSalary / contractedHoursPerYear
    : 0;

  const hiddenHoursPerWeek = weeklyUnpaidOvertime + weeklyCommuteHours + weeklyPrepDecompression;
  const totalRealHoursPerWeek = weeklyHoursWorked + hiddenHoursPerWeek;
  const totalRealHoursPerYear = totalRealHoursPerWeek * weeksWorkedPerYear;

  const effectiveHourlyNet = totalRealHoursPerYear > 0
    ? adjustedTakeHome / totalRealHoursPerYear
    : 0;

  const delta = statedHourlyGross - effectiveHourlyNet;

  return {
    annualTakeHome: Math.round(annualTakeHome),
    annualWorkExpenses: Math.round(annualWorkExpenses),
    adjustedTakeHome: Math.round(adjustedTakeHome),
    statedHourlyGross: Math.round(statedHourlyGross * 100) / 100,
    effectiveHourlyNet: Math.round(effectiveHourlyNet * 100) / 100,
    hiddenHoursPerWeek,
    totalRealHoursPerWeek,
    contractedHoursPerWeek: weeklyHoursWorked,
    annualHiddenHours: hiddenHoursPerWeek * weeksWorkedPerYear,
    delta: Math.round(delta * 100) / 100,
  };
}
