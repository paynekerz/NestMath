import { computeMonthlyPayment } from './calculator';

export interface CarLeaseVsBuyInputs {
  carPrice: number;
  downPaymentPct: number;
  loanRate: number;
  loanTermMonths: number;
  monthlyLeasePayment: number;
  leaseTermMonths: number;
  leaseUpfrontCost: number;
  annualDepreciation: number;
  annualInvestReturn: number;
  yearsToModel: number;
}

export const DEFAULT_CAR_LEASE_INPUTS: CarLeaseVsBuyInputs = {
  carPrice: 35_000,
  downPaymentPct: 0.10,
  loanRate: 0.065,
  loanTermMonths: 60,
  monthlyLeasePayment: 450,
  leaseTermMonths: 36,
  leaseUpfrontCost: 2_500,
  annualDepreciation: 0.15,
  annualInvestReturn: 0.07,
  yearsToModel: 5,
};

export interface CarLeaseVsBuyYearRow {
  year: number;
  cumulativeCostLease: number;
  cumulativeNetCostBuy: number;
  carValueBuy: number;
  investValue: number;
  netCostInvestPath: number;
}

export interface CarLeaseVsBuyResult {
  totalCostLease: number;
  totalPaidBuy: number;
  carValueAtEnd: number;
  netCostBuy: number;
  investValue: number;
  netCostInvestPath: number;
  winner: 'lease' | 'buy' | 'invest';
  monthlyBuyPayment: number;
  years: CarLeaseVsBuyYearRow[];
}

export function calcCarLeaseVsBuy(inputs: CarLeaseVsBuyInputs): CarLeaseVsBuyResult {
  const {
    carPrice, downPaymentPct, loanRate, loanTermMonths,
    monthlyLeasePayment, leaseTermMonths, leaseUpfrontCost,
    annualDepreciation, annualInvestReturn, yearsToModel,
  } = inputs;

  const totalMonths = yearsToModel * 12;
  const monthlyReturn = annualInvestReturn / 12;
  const downPayment = carPrice * downPaymentPct;
  const loanAmount = carPrice * (1 - downPaymentPct);
  const monthlyBuyPayment = loanAmount > 0
    ? computeMonthlyPayment(loanAmount, loanRate, loanTermMonths / 12)
    : 0;

  let cumulativeLeaseCost = leaseUpfrontCost;
  let cumulativeBuyPaid = downPayment;
  // Invest portfolio starts with delta between the two upfront costs at month 0.
  let investPortfolio = Math.abs(leaseUpfrontCost - downPayment);
  let leaseMonthInCycle = 0;
  const years: CarLeaseVsBuyYearRow[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    leaseMonthInCycle++;

    let leaseThisMonth = monthlyLeasePayment;
    if (leaseMonthInCycle > leaseTermMonths) {
      // New lease cycle: pay upfront again
      leaseMonthInCycle = 1;
      cumulativeLeaseCost += leaseUpfrontCost;
      leaseThisMonth += leaseUpfrontCost;
    }
    cumulativeLeaseCost += monthlyLeasePayment;

    const buyThisMonth = month <= loanTermMonths ? monthlyBuyPayment : 0;
    cumulativeBuyPaid += buyThisMonth;

    // Compound existing portfolio and add this month's delta
    const delta = Math.abs(leaseThisMonth - buyThisMonth);
    investPortfolio = investPortfolio * (1 + monthlyReturn) + delta;

    if (month % 12 === 0) {
      const year = month / 12;
      const carValue = carPrice * Math.pow(1 - annualDepreciation, year);
      const netCostBuy = cumulativeBuyPaid - carValue;
      const moreExpensiveNetCost = Math.max(cumulativeLeaseCost, netCostBuy);
      const netCostInvestPath = moreExpensiveNetCost - investPortfolio;
      years.push({
        year,
        cumulativeCostLease: cumulativeLeaseCost,
        cumulativeNetCostBuy: netCostBuy,
        carValueBuy: carValue,
        investValue: investPortfolio,
        netCostInvestPath,
      });
    }
  }

  const last = years[years.length - 1];
  const candidates: [CarLeaseVsBuyResult['winner'], number][] = [
    ['lease', last.cumulativeCostLease],
    ['buy', last.cumulativeNetCostBuy],
    ['invest', last.netCostInvestPath],
  ];
  const winner = candidates.reduce((a, b) => b[1] < a[1] ? b : a)[0];

  return {
    totalCostLease: cumulativeLeaseCost,
    totalPaidBuy: cumulativeBuyPaid,
    carValueAtEnd: last.carValueBuy,
    netCostBuy: last.cumulativeNetCostBuy,
    investValue: investPortfolio,
    netCostInvestPath: last.netCostInvestPath,
    winner,
    monthlyBuyPayment,
    years,
  };
}
