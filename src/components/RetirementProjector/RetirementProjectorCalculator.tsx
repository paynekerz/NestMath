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
import { FAQSection, type FAQItem } from '../ui/FAQSection';

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

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'Am I saving enough for retirement?',
    a: "A common benchmark: save at least 15% of your gross income for retirement (including employer match). At 30, aim to have 1× your salary saved; at 40, 3×; at 50, 6×; at 60, 8×. These are rough guides — the 25× rule (you need 25 times your annual expenses to retire) is more precise because it's based on your actual spending needs, not income.",
  },
  {
    q: 'What is the 4% rule?',
    a: "The 4% rule (also called the Bengen Rule) says you can safely withdraw 4% of your retirement portfolio in year one, then adjust for inflation each year — and statistically, your money should last 30+ years. It's based on historical stock and bond returns. To use it as a savings target: divide your annual retirement spending by 0.04, or multiply by 25. If you need $60,000/year, you need $1.5 million saved.",
  },
  {
    q: 'How does employer 401(k) match work?',
    a: "An employer match is free money added to your 401(k) — the most valuable benefit most employees leave on the table. A typical match: \"We'll match 100% of your contributions up to 4% of your salary.\" On a $75,000 salary, that's $3,000/year added by your employer if you contribute at least $3,000. Always contribute at least enough to get the full match — it's an instant 100% return on that portion of your savings.",
  },
  {
    q: 'What is a good 401(k) balance by age?',
    a: "Fidelity's benchmarks: by 30, aim for 1× your salary; by 40, 3×; by 50, 6×; by 60, 8×; by retirement (67), 10×. These are medians — many Americans fall short. What matters more: are you contributing consistently, capturing the full employer match, and keeping fees low? Consistent contributions compounded over decades are more powerful than any single-year boost.",
  },
  {
    q: 'Should I increase my 401(k) contribution?',
    a: "Yes, if you're not yet at the full employer match — capturing that first. After that, contributions reduce your taxable income now (traditional 401k) or grow tax-free (Roth 401k). The 2024 employee contribution limit is $23,000 ($30,500 if you're 50+). Even small increases compound significantly: an extra $100/month at 7% return over 30 years adds roughly $120,000 to your balance.",
  },
];

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
          <p className="text-body-md text-on-surface-variant mt-1">Project your retirement balance, see the value of your employer match, and check whether you're on track.</p>
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
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
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

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
