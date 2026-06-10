import { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_EMERGENCY_FUND_INPUTS,
  calcEmergencyFund,
  type EmergencyFundInputs,
} from '../../lib/emergency-fund';
import { validateEmergencyFundInputs, hasErrors } from '../../lib/validation';
import { EmergencyFundInputs as EmergencyFundInputsPanel } from './EmergencyFundInputs';
import { EmergencyFundSummary } from './EmergencyFundSummary';
import { EmergencyFundChart } from './EmergencyFundChart';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function fmtMonths(m: number): string {
  if (m === 0) return 'Already funded';
  if (m >= 240) return '20+ years';
  const years = Math.floor(m / 12);
  const mo = m % 12;
  if (years === 0) return `${m} months`;
  if (mo === 0) return `${years} years`;
  return `${years} yr ${mo} mo`;
}

function projectedDate(monthsFromNow: number): string {
  if (monthsFromNow === 0) return 'Now';
  if (monthsFromNow >= 240) return '20+ years from now';
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function buildCsv(inputs: EmergencyFundInputs, result: ReturnType<typeof calcEmergencyFund>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Emergency Fund Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Monthly essential expenses', cur.format(inputs.monthlyExpenses));
  row('Current emergency savings', cur.format(inputs.currentSavings));
  row('Monthly savings toward fund', cur.format(inputs.monthlySavings));
  row('HYSA APY', `${(inputs.hysaAPY * 100).toFixed(2)}%`);
  row('', '');
  row('--- Summary ---', '');
  row('Current months of coverage', result.currentMonthsCoverage.toFixed(2));
  row('3-month target', cur.format(result.threeMonthTarget));
  row('6-month target', cur.format(result.sixMonthTarget));
  row('Months to 3-month goal', fmtMonths(result.monthsToThree));
  row('Months to 6-month goal', fmtMonths(result.monthsToSix));
  row('Projected date (3-month goal)', projectedDate(result.monthsToThree));
  row('Projected date (6-month goal)', projectedDate(result.monthsToSix));
  row('Interest earned along the way', cur.format(result.interestEarned));
  row('', '');
  row('Month', 'Savings Balance');
  for (const p of result.months) {
    row(String(p.month), cur.format(p.savings));
  }

  return rows.join('\n');
}

export function EmergencyFundCalculator() {
  const [inputs, setInputs] = useState<EmergencyFundInputs>(DEFAULT_EMERGENCY_FUND_INPUTS);

  function handleChange(key: keyof EmergencyFundInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateEmergencyFundInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcEmergencyFund(inputs)),
    [inputs, errors],
  );

  // Save to Dashboard localStorage on result
  useEffect(() => {
    if (!result) return;
    try {
      localStorage.setItem('nm_goals', JSON.stringify({
        monthsCoverage: result.currentMonthsCoverage,
        threeMonthTarget: result.threeMonthTarget,
        sixMonthTarget: result.sixMonthTarget,
        projectedDateThree: projectedDate(result.monthsToThree),
        projectedDateSix: projectedDate(result.monthsToSix),
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
    a.download = `emergency-fund-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Emergency Fund Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your monthly essential expenses, current savings, and monthly contribution to see how many months of coverage you have now and exactly when you'll reach your 3-month and 6-month emergency fund targets.</p>
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
        data-print-title="Emergency Fund Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <EmergencyFundInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <EmergencyFundSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <EmergencyFundChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-body-sm text-center text-on-surface-variant mt-6">
          If this helped you plan your safety net,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

    </div>
  );
}
