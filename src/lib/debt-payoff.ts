export interface DebtItem {
  id: string;
  name: string;
  balance: number;    // e.g. 5000
  apr: number;        // decimal, e.g. 0.22
  minPayment: number; // e.g. 100
}

export interface DebtPayoffInputs {
  debts: DebtItem[];
  extraBudget: number; // monthly extra above all minimums
}

export interface DebtPayoffOrderEntry {
  id: string;
  name: string;
  initialBalance: number;
  apr: number;
  payoffMonth: number;
}

export interface DebtMonthPoint {
  month: number;
  remaining: number;
}

export interface DebtStrategyResult {
  months: number;
  totalInterest: number;
  payoffOrder: DebtPayoffOrderEntry[];
  chartData: DebtMonthPoint[];
}

export interface DebtPayoffResult {
  avalanche: DebtStrategyResult;
  snowball: DebtStrategyResult;
  interestSavedByAvalanche: number;
}

interface SimDebt {
  id: string;
  name: string;
  initialBalance: number;
  apr: number;
  minPayment: number;
  remaining: number;
}

function simulate(
  debts: DebtItem[],
  extraBudget: number,
  strategy: 'avalanche' | 'snowball',
): DebtStrategyResult {
  const active: SimDebt[] = debts
    .filter(d => d.balance > 0)
    .map(d => ({
      id: d.id,
      name: d.name,
      initialBalance: d.balance,
      apr: d.apr,
      minPayment: d.minPayment,
      remaining: d.balance,
    }));

  if (active.length === 0) {
    return { months: 0, totalInterest: 0, payoffOrder: [], chartData: [] };
  }

  // Sorted target priority order — never re-sorted after first pay-off (cascade)
  const targetQueue: string[] = [...active]
    .sort((a, b) =>
      strategy === 'avalanche' ? b.apr - a.apr : a.remaining - b.remaining,
    )
    .map(d => d.id);

  const payoffOrder: DebtPayoffOrderEntry[] = [];
  const chartData: DebtMonthPoint[] = [
    { month: 0, remaining: active.reduce((s, d) => s + d.remaining, 0) },
  ];

  let totalInterest = 0;
  let availableExtra = extraBudget;
  let month = 0;

  while (active.length > 0 && month < 600) {
    month++;

    // Apply interest + minimum payments to all active debts
    for (const debt of active) {
      const interest = debt.remaining * (debt.apr / 12);
      totalInterest += interest;
      debt.remaining += interest;
      const paid = Math.min(debt.minPayment, debt.remaining);
      debt.remaining -= paid;
      debt.remaining = Math.max(0, Math.round(debt.remaining * 100) / 100);
    }

    // Apply extra budget to the current priority target
    const currentTargetId = targetQueue.find(id =>
      active.some(d => d.id === id && d.remaining > 0.005),
    );
    if (currentTargetId !== undefined) {
      const target = active.find(d => d.id === currentTargetId)!;
      const applied = Math.min(availableExtra, target.remaining);
      target.remaining = Math.max(0, Math.round((target.remaining - applied) * 100) / 100);
    }

    // Collect paid-off debts and free their minimums
    const justPaid = active.filter(d => d.remaining <= 0.005);
    for (const debt of justPaid) {
      debt.remaining = 0;
      payoffOrder.push({
        id: debt.id,
        name: debt.name,
        initialBalance: debt.initialBalance,
        apr: debt.apr,
        payoffMonth: month,
      });
      availableExtra += debt.minPayment;
    }

    // Remove paid-off debts
    for (const debt of justPaid) {
      const idx = active.indexOf(debt);
      if (idx >= 0) active.splice(idx, 1);
    }

    chartData.push({
      month,
      remaining: active.reduce((s, d) => s + d.remaining, 0),
    });
  }

  return { months: month, totalInterest, payoffOrder, chartData };
}

export function calcDebtPayoff(inputs: DebtPayoffInputs): DebtPayoffResult {
  const { debts, extraBudget } = inputs;

  const avalanche = simulate(debts, extraBudget, 'avalanche');
  const snowball = simulate(debts, extraBudget, 'snowball');

  return {
    avalanche,
    snowball,
    interestSavedByAvalanche: snowball.totalInterest - avalanche.totalInterest,
  };
}

export const DEFAULT_DEBT_INPUTS: DebtPayoffInputs = {
  debts: [
    { id: '1', name: 'Credit Card', balance: 5_000, apr: 0.22, minPayment: 100 },
    { id: '2', name: 'Car Loan',    balance: 12_000, apr: 0.07, minPayment: 250 },
    { id: '3', name: 'Student Loan', balance: 20_000, apr: 0.065, minPayment: 200 },
  ],
  extraBudget: 200,
};
