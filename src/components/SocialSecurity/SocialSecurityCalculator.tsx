import { useState, useMemo } from 'react';
import {
  DEFAULT_SS_INPUTS,
  calcSocialSecurity,
  type SocialSecurityInputs,
} from '../../lib/social-security';
import { validateSocialSecurityInputs, hasErrors } from '../../lib/validation';
import { SocialSecurityInputs as SocialSecurityInputsPanel } from './SocialSecurityInputs';
import { SocialSecuritySummary } from './SocialSecuritySummary';
import { SocialSecurityChart } from './SocialSecurityChart';
import { KofiButton } from '../ui/KofiButton';
import { ToolDisclaimer } from '../ui/ToolDisclaimer';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: SocialSecurityInputs, result: ReturnType<typeof calcSocialSecurity>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Social Security Break-Even Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Annual income', cur.format(inputs.annualIncome));
  row('Current age', String(inputs.currentAge));
  row('Life expectancy', String(inputs.lifeExpectancy));
  row('Apply 25% reduction scenario', inputs.applyReduction ? 'Yes' : 'No');
  row('', '');
  row('--- Estimated Monthly Benefits ---', '');
  row('Claim at 62', cur.format(result.monthlyBenefitAt62) + '/mo');
  row('Claim at 67 (FRA)', cur.format(result.monthlyBenefitAt67) + '/mo');
  row('Claim at 70', cur.format(result.monthlyBenefitAt70) + '/mo');
  row('', '');
  row('--- Break-Even Analysis ---', '');
  row('62 vs. 67 break-even age', result.breakEvenAge_62vs67 !== null ? String(result.breakEvenAge_62vs67) : 'Never');
  row('67 vs. 70 break-even age', result.breakEvenAge_67vs70 !== null ? String(result.breakEvenAge_67vs70) : 'Never');
  row('Recommended strategy', `Claim at ${result.recommendedStrategy}`);
  row('', '');
  row('--- Lifetime Totals ---', '');
  row('Lifetime total at 62', cur.format(result.lifetimeTotalAt62));
  row('Lifetime total at 67', cur.format(result.lifetimeTotalAt67));
  row('Lifetime total at 70', cur.format(result.lifetimeTotalAt70));
  row('', '');
  row('Age', 'Cumulative (Claim at 62)', 'Cumulative (Claim at 67)', 'Cumulative (Claim at 70)');
  for (const r of result.chartRows) {
    row(String(r.age), cur.format(r.total62), cur.format(r.total67), cur.format(r.total70));
  }

  return rows.join('\n');
}

export function SocialSecurityCalculator() {
  const [inputs, setInputs] = useState<SocialSecurityInputs>(DEFAULT_SS_INPUTS);

  function handleChange(key: keyof SocialSecurityInputs, value: number | boolean) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateSocialSecurityInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcSocialSecurity(inputs)),
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
    a.download = `social-security-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Social Security Break-Even Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter your income and planned claiming age to compare cumulative lifetime Social Security benefits at 62, 67, and 70, and see the break-even ages that determine when delayed claiming pays off.</p>
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
        data-print-title="Social Security Break-Even Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <SocialSecurityInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <SocialSecuritySummary result={result} applyReduction={inputs.applyReduction} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <SocialSecurityChart result={result} />
          </div>
        )}
      </div>

      {result && <ToolDisclaimer note="A simplified estimate based on the 2026 bend-point formula and your stated income, not your actual earnings record. Get your official benefit from your SSA.gov account, and remember that claiming age is a permanent, one-time decision." />}

      {result && <KofiButton message="If this helped you think through your Social Security strategy," />}

    </div>
  );
}
