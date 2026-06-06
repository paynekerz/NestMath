import { useState, useMemo } from 'react';
import {
  DEFAULT_CAR_LEASE_INPUTS,
  calcCarLeaseVsBuy,
  type CarLeaseVsBuyInputs,
} from '../../lib/car-lease-vs-buy';
import { validateCarLeaseVsBuyInputs, hasErrors } from '../../lib/validation';
import { CarLeaseVsBuyInputs as CarLeaseVsBuyInputsPanel } from './CarLeaseVsBuyInputs';
import { CarLeaseVsBuySummary } from './CarLeaseVsBuySummary';
import { CarLeaseVsBuyChart } from './CarLeaseVsBuyChart';
import { CarLeaseVsBuyTable } from './CarLeaseVsBuyTable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: CarLeaseVsBuyInputs, result: ReturnType<typeof calcCarLeaseVsBuy>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Car Lease vs. Buy Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Car price (MSRP)', cur.format(inputs.carPrice));
  row('Down payment', `${(inputs.downPaymentPct * 100).toFixed(1)}%`);
  row('Loan interest rate', `${(inputs.loanRate * 100).toFixed(3)}%`);
  row('Loan term', `${inputs.loanTermMonths} months`);
  row('Monthly lease payment', cur.format(inputs.monthlyLeasePayment));
  row('Lease term', `${inputs.leaseTermMonths} months`);
  row('Lease upfront cost', cur.format(inputs.leaseUpfrontCost));
  row('Annual depreciation', `${(inputs.annualDepreciation * 100).toFixed(1)}%`);
  row('Annual investment return', `${(inputs.annualInvestReturn * 100).toFixed(1)}%`);
  row('Years to model', String(inputs.yearsToModel));
  row('', '');
  row('--- Summary ---', '');
  row('Winner', result.winner === 'lease' ? 'Lease' : result.winner === 'buy' ? 'Buy' : 'Invest the Delta');
  row('Total cost: Lease', cur.format(result.totalCostLease));
  row('Total paid: Buy', cur.format(result.totalPaidBuy));
  row('Car value at end', cur.format(result.carValueAtEnd));
  row('Net cost: Buy', cur.format(result.netCostBuy));
  row('Invest portfolio', cur.format(result.investValue));
  row('Net cost: Invest path', cur.format(result.netCostInvestPath));
  row('Monthly buy payment', cur.format(result.monthlyBuyPayment));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Cumul. Cost (Lease)', 'Net Cost (Buy)', 'Car Value', 'Invest Portfolio', 'Net Cost (Invest Path)');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.cumulativeCostLease),
        cur.format(y.cumulativeNetCostBuy),
        cur.format(y.carValueBuy),
        cur.format(y.investValue),
        cur.format(y.netCostInvestPath),
      );
    }
  }

  return rows.join('\n');
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'Is it better to lease or buy a car?',
    a: "It depends on how long you keep the car and what you'd do with the monthly savings. Leasing typically has lower monthly payments and lets you drive a new car every few years, but you never build equity. Buying costs more upfront and in the first few years, but you own an asset. The \"invest the delta\" path is often the mathematical winner — take the cheaper monthly option and put the difference in the market.",
  },
  {
    q: 'Should I lease or buy a car in 2025?',
    a: "With car prices elevated and loan rates near 6–7%, leasing has become more competitive. If you value predictable low monthly payments, don't drive over the mileage limit, and plan to swap cars in 3 years, leasing can make sense. If you drive a lot, customize your vehicle, or want to stop payments eventually, buying is usually better financially over the long run.",
  },
  {
    q: 'What is the true cost of leasing vs. buying a car?',
    a: "Leasing costs are simple to track: upfront fees plus monthly payments. Buying looks more expensive upfront, but you end up with a car worth money when the loan is paid off. The true cost comparison is: lease total cost vs. (total buy payments minus residual car value). This calculator shows both net costs side by side so you can see the real financial difference.",
  },
  {
    q: 'Is it ever smarter to lease a car instead of buying?',
    a: "Yes. If your monthly buy payment is significantly higher than the lease payment and you invest the difference consistently, leasing can win. Leasing also wins when you factor in that you avoid the risk of a depreciating asset — a car that drops 50% in value over 5 years is a liability, not an investment. Leasing essentially transfers that depreciation risk back to the dealer.",
  },
  {
    q: 'What happens if I invest what I would have spent on a car?',
    a: "The \"invest the delta\" strategy means: take the cheaper monthly payment option and invest the monthly difference at a market return. Over 5 years with a $200/month delta and 7% annual return, you'd accumulate roughly $14,400. That investment portfolio reduces the true cost of whichever path you chose, and in many scenarios it makes the overall \"invest the delta\" strategy the winner — lower net cost than either pure lease or pure buy.",
  },
];

export function CarLeaseVsBuyCalculator() {
  const [inputs, setInputs] = useState<CarLeaseVsBuyInputs>(DEFAULT_CAR_LEASE_INPUTS);

  function handleChange(key: keyof CarLeaseVsBuyInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateCarLeaseVsBuyInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcCarLeaseVsBuy(inputs)),
    [inputs, errors],
  );

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `car-lease-vs-buy-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Car Lease vs. Buy Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Compare the true financial cost of leasing, buying, and investing the monthly difference.</p>
        </div>
        <div data-print="hide" className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCsv}
            disabled={!result}
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
            Export PDF
          </button>
        </div>
      </div>

      {/* Main bento grid */}
      <div
        data-print="title"
        data-print-title="Car Lease vs. Buy Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <CarLeaseVsBuyInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <CarLeaseVsBuySummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <CarLeaseVsBuyChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this helped you think through a five-figure vehicle decision,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <CarLeaseVsBuyTable result={result} />
        </div>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
