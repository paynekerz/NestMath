export interface DashboardNetWorth {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  updatedAt: string;
}

export interface DashboardHousing {
  monthlyCost: number;
  breakEvenYear: number | null;
  equity: number;
  updatedAt: string;
}

export interface DashboardDebt {
  totalDebt: number;
  monthsToDebtFree: number;
  monthlyPayment: number;
  updatedAt: string;
}

export interface DashboardSavings {
  projectedBalance: number;
  inflationAdjustedBalance: number;
  estimatedMonthlyIncome: number;
  yearsToRetirement: number;
  updatedAt: string;
}

export interface DashboardIncome {
  effectiveHourlyRate: number;
  annualTakeHome: number;
  updatedAt: string;
}

export interface DashboardGoals {
  monthsCoverage: number;
  threeMonthTarget: number;
  sixMonthTarget: number;
  projectedDateThree: string;
  projectedDateSix: string;
  updatedAt: string;
}

export interface DashboardBudget {
  monthlyTakeHome: number;
  monthlySideIncome: number;
  housing: number;
  transportation: number;
  food: number;
  utilities: number;
  subscriptions: number;
  debtPayments: number;
  savings: number;
  other: number;
  updatedAt: string;
}

export interface DashboardData {
  netWorth: DashboardNetWorth | null;
  housing: DashboardHousing | null;
  debt: DashboardDebt | null;
  savings: DashboardSavings | null;
  income: DashboardIncome | null;
  goals: DashboardGoals | null;
  budget: DashboardBudget | null;
}

const KEYS = ['nm_networth', 'nm_housing', 'nm_debt', 'nm_savings', 'nm_income', 'nm_goals', 'nm_budget'] as const;
const MAX_PAYLOAD_BYTES = 10 * 1024;

export function saveToDashboard(key: string, data: Record<string, unknown>): boolean {
  try {
    const payload = JSON.stringify({ ...data, _ts: Date.now() });
    if (payload.length > MAX_PAYLOAD_BYTES) return false;
    localStorage.setItem(key, payload);
    return true;
  } catch {
    return false;
  }
}

function parseKey<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadDashboard(): DashboardData {
  return {
    netWorth: parseKey<DashboardNetWorth>('nm_networth'),
    housing: parseKey<DashboardHousing>('nm_housing'),
    debt: parseKey<DashboardDebt>('nm_debt'),
    savings: parseKey<DashboardSavings>('nm_savings'),
    income: parseKey<DashboardIncome>('nm_income'),
    goals: parseKey<DashboardGoals>('nm_goals'),
    budget: parseKey<DashboardBudget>('nm_budget'),
  };
}

export function clearDashboard(): void {
  try {
    for (const k of KEYS) localStorage.removeItem(k);
  } catch {
    // localStorage may be unavailable
  }
}
