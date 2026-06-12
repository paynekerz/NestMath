// 2026 SSA bend points (monthly AIME) — update annually
const BP1 = 1_286;
const BP2 = 7_749;

export interface SocialSecurityInputs {
  annualIncome: number;
  currentAge: number;
  lifeExpectancy: number;
  applyReduction: boolean;
}

export const DEFAULT_SS_INPUTS: SocialSecurityInputs = {
  annualIncome: 75_000,
  currentAge: 40,
  lifeExpectancy: 85,
  applyReduction: false,
};

export interface SocialSecurityChartRow {
  age: number;
  total62: number;
  total67: number;
  total70: number;
}

export interface SocialSecurityResult {
  monthlyBenefitAt62: number;
  monthlyBenefitAt67: number;
  monthlyBenefitAt70: number;
  lifetimeTotalAt62: number;
  lifetimeTotalAt67: number;
  lifetimeTotalAt70: number;
  breakEvenAge_62vs67: number | null;
  breakEvenAge_67vs70: number | null;
  recommendedStrategy: '62' | '67' | '70';
  chartRows: SocialSecurityChartRow[];
}

export function estimatePIA(annualIncome: number): number {
  const aime = annualIncome / 12;
  if (aime <= BP1) return 0.90 * aime;
  if (aime <= BP2) return 0.90 * BP1 + 0.32 * (aime - BP1);
  return 0.90 * BP1 + 0.32 * (BP2 - BP1) + 0.15 * (aime - BP2);
}

export function calcSocialSecurity(inputs: SocialSecurityInputs): SocialSecurityResult {
  const { annualIncome, lifeExpectancy, applyReduction } = inputs;

  // FRA = 67 for anyone born after 1960
  // Claiming at 62: 30% reduction (5 years early, 5/9% × 36mo + 5/12% × 24mo)
  // Claiming at 70: 24% increase (8%/yr × 3 years delay past FRA)
  const pia = estimatePIA(annualIncome) * (applyReduction ? 0.75 : 1.0);
  const monthly62 = Math.round(pia * 0.70);
  const monthly67 = Math.round(pia);
  const monthly70 = Math.round(pia * 1.24);

  const chartRows: SocialSecurityChartRow[] = [];
  let total62 = 0;
  let total67 = 0;
  let total70 = 0;
  let breakEven_62_67: number | null = null;
  let breakEven_67_70: number | null = null;

  for (let age = 62; age <= lifeExpectancy; age++) {
    total62 += monthly62 * 12;
    if (age >= 67) total67 += monthly67 * 12;
    if (age >= 70) total70 += monthly70 * 12;

    if (breakEven_62_67 === null && total67 > total62) {
      breakEven_62_67 = age;
    }
    if (breakEven_67_70 === null && total70 > total67) {
      breakEven_67_70 = age;
    }

    chartRows.push({ age, total62, total67, total70 });
  }

  let recommendedStrategy: '62' | '67' | '70';
  if (breakEven_62_67 === null || lifeExpectancy < breakEven_62_67) {
    recommendedStrategy = '62';
  } else if (breakEven_67_70 === null || lifeExpectancy < breakEven_67_70) {
    recommendedStrategy = '67';
  } else {
    recommendedStrategy = '70';
  }

  return {
    monthlyBenefitAt62: monthly62,
    monthlyBenefitAt67: monthly67,
    monthlyBenefitAt70: monthly70,
    lifetimeTotalAt62: total62,
    lifetimeTotalAt67: total67,
    lifetimeTotalAt70: total70,
    breakEvenAge_62vs67: breakEven_62_67,
    breakEvenAge_67vs70: breakEven_67_70,
    recommendedStrategy,
    chartRows,
  };
}
