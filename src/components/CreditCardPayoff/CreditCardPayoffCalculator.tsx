import { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_CC_INPUTS,
  calcCreditCardPayoff,
  type CreditCardPayoffInputs,
  type CCPaymentMode,
} from '../../lib/credit-card-payoff';
import { validateCreditCardPayoffInputs, hasErrors } from '../../lib/validation';
import { CreditCardPayoffInputs as CCInputsPanel } from './CreditCardPayoffInputs';
import { CreditCardPayoffSummary } from './CreditCardPayoffSummary';
import { CreditCardPayoffChart } from './CreditCardPayoffChart';
import { CreditCardPayoffTable } from './CreditCardPayoffTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cur2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildCsv(inputs: CreditCardPayoffInputs, result: ReturnType<typeof calcCreditCardPayoff>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Credit Card Payoff Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Current balance', cur.format(inputs.balance));
  row('Annual APR', `${(inputs.apr * 100).toFixed(2)}%`);
  if (inputs.paymentMode === 'payment') {
    row('Monthly payment', cur.format(inputs.monthlyPayment));
  } else {
    row('Target payoff months', String(inputs.desiredMonths));
    row('Required monthly payment', cur2.format(result.effectivePayment));
  }
  row('', '');
  row('--- Summary ---', '');
  row('Monthly payment used', cur2.format(result.effectivePayment));
  row('Payoff months', String(result.payoffMonths));
  row('Total interest paid', cur.format(result.totalInterest));
  row('Total paid', cur.format(result.totalPaid));
  row('Minimum payment: months', String(result.minPayoffMonths));
  row('Minimum payment: total interest', cur.format(result.minTotalInterest));
  row('Interest saved vs. minimum', cur.format(result.interestSaved));

  if (result.months.length > 0) {
    row('', '');
    row('Month', 'Payment', 'Principal', 'Interest', 'Remaining Balance');
    for (const m of result.months) {
      row(
        String(m.month),
        cur2.format(m.payment),
        cur2.format(m.principal),
        cur2.format(m.interest),
        cur2.format(m.balance),
      );
    }
  }

  return rows.join('\n');
}

export function CreditCardPayoffCalculator() {
  const [inputs, setInputs] = useState<CreditCardPayoffInputs>(DEFAULT_CC_INPUTS);

  function handleChange(key: keyof CreditCardPayoffInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function handleModeChange(mode: CCPaymentMode) {
    setInputs(prev => ({ ...prev, paymentMode: mode }));
  }

  const errors = useMemo(() => validateCreditCardPayoffInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcCreditCardPayoff(inputs)),
    [inputs, errors],
  );

  useEffect(() => {
    if (!result) return;
    try {
      localStorage.setItem('nm_debt', JSON.stringify({
        totalDebt: inputs.balance,
        monthsToDebtFree: result.payoffMonths,
        monthlyPayment: result.effectivePayment,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage may be unavailable
    }
  }, [result, inputs.balance]);

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-card-payoff-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Credit Card Payoff Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your balance, APR, and monthly payment to see your exact payoff date and total interest paid, plus a side-by-side comparison showing how much faster and cheaper your plan is compared to making minimum payments only.</p>
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
        data-print-title="Credit Card Payoff Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <CCInputsPanel
            inputs={inputs}
            onChange={handleChange}
            onModeChange={handleModeChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <CreditCardPayoffSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <CreditCardPayoffChart result={result} />
          </div>
        )}
      </div>

      {result && <KofiButton message="If this helped you tackle your debt," />}

      {/* Month-by-month table */}
      {result && (
        <div className="mt-6">
          <CreditCardPayoffTable result={result} />
        </div>
      )}

    </div>
  );
}
