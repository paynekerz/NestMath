import { useState, useMemo } from 'react';
import {
  DEFAULT_AFFORDABILITY_INPUTS,
  calcMaxHomePrice,
  calcAmortization,
  type AffordabilityInputs,
  type AffordabilityCalcResult,
} from '../../lib/affordability';
import { validateAffordabilityInputs, hasErrors } from '../../lib/validation';
import { AffordabilityInputs as AffordabilityInputsPanel } from './AffordabilityInputs';
import { AffordabilityResult } from './AffordabilityResult';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pctFmt = (v: number) => `${(v * 100).toFixed(0)}%`;

function buildCsv(inputs: AffordabilityInputs, result: AffordabilityCalcResult): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Home Affordability Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Gross monthly income', cur.format(inputs.grossMonthlyIncome));
  row('Monthly debt payments', cur.format(inputs.monthlyDebts));
  row('Front-end DTI limit', pctFmt(inputs.frontEndDTI));
  row('Back-end DTI limit', pctFmt(inputs.backEndDTI));
  row('Mortgage rate', `${(inputs.mortgageRate * 100).toFixed(3)}%`);
  row('Loan term', `${inputs.loanTermYears} years`);
  row('Down payment', pctFmt(inputs.downPaymentPct));
  row('Property tax', `${(inputs.propertyTaxRate * 100).toFixed(3)}% / yr`);
  row('Insurance', `${(inputs.insuranceRate * 100).toFixed(3)}% / yr`);
  row('HOA / maintenance', `${cur.format(inputs.monthlyHOA)} / mo`);
  row('Closing costs', pctFmt(inputs.closingCostsPct));
  row('', '');
  row('--- Results ---', '');
  row('Max home price', cur.format(result.maxHomePrice));
  row('Max loan amount', cur.format(result.maxLoanAmount));
  row('Max monthly payment', cur.format(result.maxMonthlyPayment));
  row('Monthly PITI', cur.format(result.monthlyPITI));
  row('Front-end DTI (actual)', `${(result.frontEndDTIActual * 100).toFixed(1)}%`);
  row('Back-end DTI (actual)', `${(result.backEndDTIActual * 100).toFixed(1)}%`);
  row('Cash to close', cur.format(result.cashToClose));
  row('Down payment', cur.format(result.downPayment));
  row('Closing costs', cur.format(result.closingCosts));

  return rows.join('\n');
}

function buildProInsight(inputs: AffordabilityInputs, result: AffordabilityCalcResult): string {
  const dti = result.backEndDTIActual;

  if (dti > 0.43) {
    const debtReduction = Math.ceil(((dti - 0.36) * inputs.grossMonthlyIncome) / 10) * 10;
    return `Your back-end DTI is too high for most lenders. Reducing monthly debts by ${cur.format(debtReduction)} brings you under the 36% threshold and may qualify you for lower rates.`;
  }

  if (inputs.downPaymentPct < 0.20) {
    const targetPct = 0.20;
    const extraLoan = result.maxHomePrice * (targetPct - inputs.downPaymentPct);
    const r = inputs.mortgageRate / 12;
    const n = inputs.loanTermYears * 12;
    const currentPI = result.monthlyPI;
    const newLoan = result.maxLoanAmount - extraLoan;
    const newPI = newLoan > 0
      ? r === 0 ? newLoan / n : (newLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : 0;
    const savings = Math.round(currentPI - newPI);
    return `A 20% down payment cuts your monthly P&I by ${cur.format(savings)} and eliminates PMI.`;
  }

  return `At ${(dti * 100).toFixed(1)}% DTI, you qualify for most conventional loan programs. A 15-year term builds equity faster, roughly double the principal paid in the first 5 years.`;
}

export function AffordabilityCalculator() {
  const [inputs, setInputs] = useState<AffordabilityInputs>(DEFAULT_AFFORDABILITY_INPUTS);

  function handleChange(key: keyof AffordabilityInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateAffordabilityInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcMaxHomePrice(inputs)),
    [inputs, errors],
  );
  const amortization = useMemo(
    () => (result ? calcAmortization(result.maxLoanAmount, inputs.mortgageRate, inputs.loanTermYears) : []),
    [result, inputs.mortgageRate, inputs.loanTermYears],
  );
  const proInsight = useMemo(
    () => (result ? buildProInsight(inputs, result) : ''),
    [inputs, result],
  );

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affordability-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-8">

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">How Much House Can I Afford?</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Work backward from your income to find the maximum home price you can afford under standard mortgage lending guidelines, including front-end and back-end debt-to-income ratio limits, closing costs, and cash needed to close.</p>
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
            Print / Save PDF
          </button>
        </div>
      </div>

      <div
        data-print="title"
        data-print-title="Home Affordability Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
      >
        {/* Inputs column */}
        <div className="lg:col-span-7">
          <AffordabilityInputsPanel inputs={inputs} onChange={handleChange} errors={errors} />
        </div>

        {/* Results column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {result ? (
            <AffordabilityResult
              result={result}
              backEndDTILimit={inputs.backEndDTI}
              proInsight={proInsight}
            />
          ) : (
            <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>
                calculate
              </span>
              <p className="text-body-sm text-on-surface-variant">
                Enter your income and debts above to see your home budget.
              </p>
            </div>
          )}
        </div>
      </div>

      {result && <KofiButton message="If this helped you figure out your home budget," />}

      {/* Cost Breakdown Table */}
      {result && amortization.length > 0 && (
        <section className="mt-4 glass-panel rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h3 className="text-label-md font-bold text-on-surface">Cost Breakdown Projections</h3>
          </div>
          <div className="px-6 py-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-label-sm uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Year</th>
                  <th className="pb-3 font-semibold">Principal Paid</th>
                  <th className="pb-3 font-semibold">Interest Paid</th>
                  <th className="pb-3 font-semibold">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="text-body-sm font-mono-data">
                {amortization.map(row => (
                  <tr key={row.year} className="zebra-row border-b border-border-subtle/30">
                    <td className="py-3 text-on-surface font-semibold">{row.year}</td>
                    <td className="py-3">{cur.format(row.principalPaid)}</td>
                    <td className="py-3 text-error">{cur.format(row.interestPaid)}</td>
                    <td className="py-3 text-primary">{cur.format(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}
