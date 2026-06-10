import { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_RETIREMENT_PROJECTOR_INPUTS,
  calcRetirementProjector,
  type RetirementProjectorInputs,
} from '../../lib/retirement-projector';
import { validateRetirementProjectorInputs, hasErrors } from '../../lib/validation';
import { RetirementProjectorInputs as RetirementProjectorInputsPanel } from './RetirementProjectorInputs';
import { RetirementProjectorSummary } from './RetirementProjectorSummary';
import { RetirementProjectorChart } from './RetirementProjectorChart';
import { RetirementProjectorTable } from './RetirementProjectorTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: RetirementProjectorInputs, result: ReturnType<typeof calcRetirementProjector>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('401(k) / Retirement Projector', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Current age', String(inputs.currentAge));
  row('Retirement age', String(inputs.retirementAge));
  row('Current balance', cur.format(inputs.currentBalance));
  row('Annual contribution', cur.format(inputs.annualContribution));
  row('Employer match', `${(inputs.employerMatchPct * 100).toFixed(1)}%`);
  row('Match limit', `${(inputs.matchLimitPct * 100).toFixed(1)}% of salary`);
  row('Annual salary', cur.format(inputs.annualSalary));
  row('Expected annual return', `${(inputs.expectedAnnualReturn * 100).toFixed(1)}%`);
  row('Expected inflation', `${(inputs.expectedInflation * 100).toFixed(1)}%`);
  if (inputs.targetAnnualExpenses > 0) {
    row('Annual expenses (retirement)', cur.format(inputs.targetAnnualExpenses));
  }
  row('', '');
  row('--- Summary ---', '');
  row('Projected balance (nominal)', cur.format(result.projectedBalance));
  row('Inflation-adjusted balance', cur.format(result.inflationAdjustedBalance));
  row('Estimated monthly income (4% rule)', cur.format(result.estimatedMonthlyIncome));
  row('Retirement target (25× expenses)', cur.format(result.targetBalance));
  row('Shortfall / surplus', (result.shortfallOrSurplus >= 0 ? '+' : '') + cur.format(result.shortfallOrSurplus));
  row('Employer match total', cur.format(result.totalEmployerMatchContributed));
  row('Employer match per year', cur.format(result.annualEmployerMatch));

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Age', 'Your Contribution', 'Employer Match', 'Year-End Balance');
    for (const y of result.years) {
      row(
        String(y.year),
        String(y.age),
        cur.format(y.annualContribution),
        cur.format(y.employerMatch),
        cur.format(y.yearEndBalance),
      );
    }
  }

  return rows.join('\n');
}

export function RetirementProjectorCalculator() {
  const [inputs, setInputs] = useState<RetirementProjectorInputs>(DEFAULT_RETIREMENT_PROJECTOR_INPUTS);

  function handleChange(key: keyof RetirementProjectorInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateRetirementProjectorInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRetirementProjector(inputs)),
    [inputs, errors],
  );

  useEffect(() => {
    if (!result) return;
    try {
      localStorage.setItem('nm_savings', JSON.stringify({
        projectedBalance: result.projectedBalance,
        inflationAdjustedBalance: result.inflationAdjustedBalance,
        estimatedMonthlyIncome: result.estimatedMonthlyIncome,
        yearsToRetirement: result.yearsToRetirement,
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage may be unavailable
    }
  }, [result]);

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv(inputs, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retirement-projector-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">401(k) / Retirement Projector</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Project your 401(k) or IRA balance at retirement, see what your employer match is worth in lifetime dollars, and find out whether you're on track to retire at your target age, with inflation-adjusted results in today's dollars.</p>
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
        data-print-title="401(k) / Retirement Projector"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <RetirementProjectorInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <RetirementProjectorSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <RetirementProjectorChart result={result} currentAge={inputs.currentAge} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you think through your retirement,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RetirementProjectorTable result={result} />
        </div>
      )}

    </div>
  );
}
