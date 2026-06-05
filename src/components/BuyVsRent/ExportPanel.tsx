import { calcAffordability, type BuyInputs, type RentInputs, type Assumptions, type YearResult } from '../../lib/calculator';

interface Props {
  buy: BuyInputs;
  rent: RentInputs;
  assumptions: Assumptions;
  years: YearResult[];
  breakEvenYear: number | null;
  disabled?: boolean;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (v: number) => `${parseFloat((v * 100).toFixed(4))}%`;

function csvCell(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

function csvRow(...cells: string[]) {
  return cells.map(csvCell).join(',');
}

function buildCsv(
  buy: BuyInputs,
  rent: RentInputs,
  assumptions: Assumptions,
  years: YearResult[],
  breakEvenYear: number | null,
): string {
  const today = new Date().toISOString().split('T')[0];

  const loanAmount = buy.homePrice * (1 - buy.downPaymentPct);
  const r = buy.mortgageRate / 12;
  const n = buy.loanTermYears * 12;
  const monthly = r === 0 ? loanAmount / n : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const annualMortgagePayment = monthly * 12;

  const lines = [
    csvRow('Buy vs. Rent Analysis', `Generated: ${today}`),
    csvRow('', ''),
    csvRow('--- Inputs: Buying ---', ''),
    csvRow('Home Price', cur.format(buy.homePrice)),
    csvRow('Down Payment', pct(buy.downPaymentPct)),
    csvRow('Mortgage Rate', pct(buy.mortgageRate)),
    csvRow('Loan Term', `${buy.loanTermYears} years`),
    csvRow('Property Tax', pct(buy.propertyTaxRate) + ' / yr'),
    csvRow('Insurance', pct(buy.insuranceRate) + ' / yr'),
    csvRow('HOA / Maintenance', cur.format(buy.monthlyHOA) + ' / mo'),
    csvRow('Closing Costs', pct(buy.closingCostsPct)),
    csvRow('', ''),
    csvRow('--- Inputs: Renting ---', ''),
    csvRow('Monthly Rent', cur.format(rent.monthlyRent)),
    csvRow('Annual Rent Increase', pct(rent.annualRentIncrease)),
    csvRow("Renter's Insurance", cur.format(rent.monthlyInsurance) + ' / mo'),
    csvRow('', ''),
    csvRow('--- Assumptions ---', ''),
    csvRow('Home Appreciation', pct(assumptions.appreciation) + ' / yr'),
    csvRow('Investment Return', pct(assumptions.investmentReturn) + ' / yr'),
    csvRow('Marginal Tax Rate', pct(assumptions.marginalTaxRate)),
    csvRow('Years to Model', String(assumptions.yearsToModel)),
    csvRow('', ''),
    csvRow('--- Results ---', ''),
    csvRow(
      'Break-Even Year',
      breakEvenYear !== null
        ? `Year ${breakEvenYear}`
        : `Does not break even within ${assumptions.yearsToModel} years`,
    ),
    csvRow('', ''),
    csvRow('--- Affordability Snapshot ---', ''),
    ...(() => {
      const aff = calcAffordability(buy);
      return [
        csvRow('Required Household Income', cur.format(aff.requiredAnnualIncome)),
        csvRow('Cash Needed to Close', cur.format(aff.cashToClose)),
        csvRow('  Down Payment', cur.format(aff.downPayment)),
        csvRow('  Closing Costs', cur.format(aff.closingCosts)),
        csvRow('Monthly PITI', cur.format(aff.monthlyPITI)),
      ];
    })(),
    csvRow('', ''),
    csvRow(
      'Year', 'Home Value', 'Equity', 'Mortgage Balance',
      'Annual Mortgage Payment', 'Buy Net Worth',
      'Rent Cumulative Invested', 'Rent Net Worth', 'Winner',
    ),
    ...years.map(yr =>
      csvRow(
        String(yr.year),
        cur.format(yr.homeValue),
        cur.format(yr.equity),
        cur.format(yr.remainingBalance),
        cur.format(Math.round(yr.remainingBalance) > 0 ? annualMortgagePayment : 0),
        cur.format(yr.buyNetWorth),
        cur.format(yr.investedDownPayment + yr.cumulativeInvested),
        cur.format(yr.rentNetWorth),
        yr.buyNetWorth > yr.rentNetWorth ? 'Buy' : 'Rent',
      ),
    ),
  ];

  return lines.join('\n');
}

export function ExportPanel({ buy, rent, assumptions, years, breakEvenYear, disabled }: Props) {
  function handleCsv() {
    const today = new Date().toISOString().split('T')[0];
    const csv = buildCsv(buy, rent, assumptions, years, breakEvenYear);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buy-vs-rent-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div data-print="hide" className="flex gap-2 shrink-0">
      <button
        type="button"
        onClick={handleCsv}
        disabled={disabled}
        className="flex items-center gap-1.5 px-md py-xs rounded-lg border border-border-subtle text-label-md text-on-surface-variant hover:border-primary-accent hover:text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
        Download CSV
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-1.5 px-md py-xs rounded-lg border border-border-subtle text-label-md text-on-surface-variant hover:border-primary-accent hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
        Print / Save PDF
      </button>
    </div>
  );
}
