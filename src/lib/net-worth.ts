export interface NetWorthInputs {
  checkingSavings: number;
  investments: number;
  retirement: number;
  homeEquity: number;
  vehicleValue: number;
  otherAssets: number;
  mortgageBalance: number;
  carLoans: number;
  creditCardBalances: number;
  studentLoans: number;
  otherDebt: number;
  lastYearNetWorth: number | null;
}

export type NetWorthAssetKey = 'checkingSavings' | 'investments' | 'retirement' | 'homeEquity' | 'vehicleValue' | 'otherAssets';
export type NetWorthLiabilityKey = 'mortgageBalance' | 'carLoans' | 'creditCardBalances' | 'studentLoans' | 'otherDebt';

export interface NetWorthSlice {
  name: string;
  value: number;
}

export interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  yoyDelta: number | null;
  assetBreakdown: NetWorthSlice[];
  liabilityBreakdown: NetWorthSlice[];
}

export const DEFAULT_NET_WORTH_INPUTS: NetWorthInputs = {
  checkingSavings: 0,
  investments: 0,
  retirement: 0,
  homeEquity: 0,
  vehicleValue: 0,
  otherAssets: 0,
  mortgageBalance: 0,
  carLoans: 0,
  creditCardBalances: 0,
  studentLoans: 0,
  otherDebt: 0,
  lastYearNetWorth: null,
};

export function calcNetWorth(inputs: NetWorthInputs): NetWorthResult {
  const totalAssets =
    inputs.checkingSavings +
    inputs.investments +
    inputs.retirement +
    inputs.homeEquity +
    inputs.vehicleValue +
    inputs.otherAssets;

  const totalLiabilities =
    inputs.mortgageBalance +
    inputs.carLoans +
    inputs.creditCardBalances +
    inputs.studentLoans +
    inputs.otherDebt;

  const netWorth = totalAssets - totalLiabilities;

  const yoyDelta = inputs.lastYearNetWorth !== null ? netWorth - inputs.lastYearNetWorth : null;

  const assetBreakdown: NetWorthSlice[] = [
    { name: 'Checking / Savings', value: inputs.checkingSavings },
    { name: 'Investments', value: inputs.investments },
    { name: 'Retirement', value: inputs.retirement },
    { name: 'Home Equity', value: inputs.homeEquity },
    { name: 'Vehicle', value: inputs.vehicleValue },
    { name: 'Other', value: inputs.otherAssets },
  ].filter(s => s.value > 0);

  const liabilityBreakdown: NetWorthSlice[] = [
    { name: 'Mortgage', value: inputs.mortgageBalance },
    { name: 'Car Loans', value: inputs.carLoans },
    { name: 'Credit Cards', value: inputs.creditCardBalances },
    { name: 'Student Loans', value: inputs.studentLoans },
    { name: 'Other Debt', value: inputs.otherDebt },
  ].filter(s => s.value > 0);

  return { totalAssets, totalLiabilities, netWorth, yoyDelta, assetBreakdown, liabilityBreakdown };
}
