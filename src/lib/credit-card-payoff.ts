export type CCPaymentMode = 'payment' | 'months';

export interface CreditCardPayoffInputs {
  balance: number;        // current balance, e.g. 5000
  apr: number;            // annual APR as decimal, e.g. 0.22
  monthlyPayment: number; // used when paymentMode = 'payment', e.g. 150
  desiredMonths: number;  // used when paymentMode = 'months', e.g. 24
  paymentMode: CCPaymentMode;
}

export const DEFAULT_CC_INPUTS: CreditCardPayoffInputs = {
  balance: 5_000,
  apr: 0.22,
  monthlyPayment: 150,
  desiredMonths: 24,
  paymentMode: 'payment',
};

export interface CCPayoffMonth {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface CreditCardPayoffResult {
  initialBalance: number;
  effectivePayment: number;
  payoffMonths: number;
  totalInterest: number;
  totalPaid: number;
  months: CCPayoffMonth[];

  minPayoffMonths: number;
  minTotalInterest: number;
  interestSaved: number;
  minMonths: CCPayoffMonth[];
}

function simulateFixed(balance: number, monthlyRate: number, payment: number): CCPayoffMonth[] {
  const months: CCPayoffMonth[] = [];
  let remaining = balance;

  for (let m = 1; m <= 600; m++) {
    const interest = Math.round(remaining * monthlyRate * 100) / 100;
    const actualPayment = Math.min(payment, remaining + interest);
    const principal = actualPayment - interest;
    remaining = Math.max(0, remaining - principal);

    months.push({ month: m, payment: actualPayment, principal, interest, balance: remaining });
    if (remaining <= 0.005) break;
  }

  return months;
}

function simulateMinimum(balance: number, monthlyRate: number): CCPayoffMonth[] {
  const months: CCPayoffMonth[] = [];
  let remaining = balance;

  for (let m = 1; m <= 1200; m++) {
    const interest = Math.round(remaining * monthlyRate * 100) / 100;
    const minPayment = Math.max(remaining * 0.02, 25);
    const actualPayment = Math.min(minPayment, remaining + interest);
    const principal = actualPayment - interest;
    remaining = Math.max(0, remaining - principal);

    months.push({ month: m, payment: actualPayment, principal, interest, balance: remaining });
    if (remaining <= 0.005) break;
  }

  return months;
}

export function backCalcPayment(balance: number, apr: number, months: number): number {
  const r = apr / 12;
  return (balance * r) / (1 - Math.pow(1 + r, -months));
}

export function calcCreditCardPayoff(inputs: CreditCardPayoffInputs): CreditCardPayoffResult {
  const { balance, apr, monthlyPayment, desiredMonths, paymentMode } = inputs;
  const monthlyRate = apr / 12;

  const effectivePayment =
    paymentMode === 'months'
      ? backCalcPayment(balance, apr, desiredMonths)
      : monthlyPayment;

  const months = simulateFixed(balance, monthlyRate, effectivePayment);
  const totalInterest = months.reduce((s, m) => s + m.interest, 0);
  const totalPaid = months.reduce((s, m) => s + m.payment, 0);

  const minMonths = simulateMinimum(balance, monthlyRate);
  const minTotalInterest = minMonths.reduce((s, m) => s + m.interest, 0);

  return {
    initialBalance: balance,
    effectivePayment,
    payoffMonths: months.length,
    totalInterest,
    totalPaid,
    months,
    minPayoffMonths: minMonths.length,
    minTotalInterest,
    interestSaved: minTotalInterest - totalInterest,
    minMonths,
  };
}
