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
          <p className="text-body-md text-on-surface-variant mt-1">Enter your car price, loan terms, lease payment, and depreciation assumptions to compare leasing, buying, and investing the monthly payment difference, and see which path costs you the least over your ownership period.</p>
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

      {result && <KofiButton message="If this helped you think through a five-figure vehicle decision," />}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <CarLeaseVsBuyTable result={result} />
        </div>
      )}

    </div>
  );
}
