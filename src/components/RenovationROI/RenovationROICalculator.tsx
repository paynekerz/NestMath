import { useState, useMemo } from 'react';
import {
  DEFAULT_RENOVATION_ROI_INPUTS,
  calcRenovationROI,
  type RenovationROIInputs,
} from '../../lib/renovation-roi';
import { validateRenovationROIInputs, hasErrors } from '../../lib/validation';
import { RenovationROIInputs as RenovationROIInputsPanel } from './RenovationROIInputs';
import { RenovationROISummary } from './RenovationROISummary';
import { RenovationROIChart } from './RenovationROIChart';
import { RenovationROITable } from './RenovationROITable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: RenovationROIInputs, result: ReturnType<typeof calcRenovationROI>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Renovation ROI vs. Investing Analysis', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Renovation cost', cur.format(inputs.renovationCost));
  row('Current home value', cur.format(inputs.homeValue));
  row('Expected value increase', `${(inputs.valueIncreasePct * 100).toFixed(2)}%`);
  row('Years until planned sale', String(inputs.yearsUntilSale));
  row('Annual home appreciation', `${(inputs.annualAppreciation * 100).toFixed(2)}%`);
  row('Annual investment return', `${(inputs.annualInvestReturn * 100).toFixed(2)}%`);
  row('', '');
  row('--- Summary ---', '');
  row('Renovation ROI %', `${result.renoROIPct.toFixed(1)}%`);
  row('Renovation net gain', result.renoNetGain >= 0 ? `+${cur.format(result.renoNetGain)}` : cur.format(result.renoNetGain));
  row('Investment net gain', `+${cur.format(result.investNetGain)}`);
  row('Winner', result.renoWins ? 'Renovation' : 'Invest');
  row('Winner advantage', `+${cur.format(result.delta)}`);

  if (result.years.length > 0) {
    row('', '');
    row('Year', 'Home Value (w/ Reno)', 'Renovation Gain', 'Reno Net Gain', 'Investment Value', 'Invest Net Gain', 'Delta');
    for (const y of result.years) {
      row(
        String(y.year),
        cur.format(y.homeValueWithReno),
        cur.format(y.renovationGain),
        y.renovationNetGain >= 0 ? `+${cur.format(y.renovationNetGain)}` : cur.format(y.renovationNetGain),
        cur.format(y.investmentValue),
        `+${cur.format(y.investmentNetGain)}`,
        y.delta >= 0 ? `+${cur.format(y.delta)}` : cur.format(y.delta),
      );
    }
  }

  return rows.join('\n');
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'Is home renovation a good investment?',
    a: "It depends on the renovation and your hold period. High-ROI projects like kitchen and bathroom updates typically recoup 60–80% of cost at resale — but that means they lose money in isolation. The real question is whether the compounding appreciation on that added value beats what you'd earn investing the same cash in the market. This calculator shows you the crossover point.",
  },
  {
    q: 'What home improvements have the best ROI?',
    a: "According to Remodeling Magazine's annual Cost vs. Value report, top performers include garage door replacements (~100% cost recoup), minor kitchen remodels (~80%), and manufactured stone veneer (~90%). Major additions and luxury upgrades tend to recoup 50–60%. Projects that add functional space or curb appeal consistently outperform purely cosmetic updates.",
  },
  {
    q: 'Is it better to renovate or invest the money?',
    a: "Investing in a broad index fund has historically returned 7–10% annually, which compounds aggressively over a decade. Most home renovations return less than the renovation cost at resale, and the appreciation premium only compounds at the home's appreciation rate (typically 3–4%). For shorter hold periods, investing usually wins. For longer holds in appreciating markets, the renovation can catch up.",
  },
  {
    q: 'How do I calculate the return on a home renovation?',
    a: "Start with the value the renovation adds to your home (a real estate agent or appraiser can estimate this). That premium compounds with your home's annual appreciation until you sell. At sale, subtract the original renovation cost from the appreciated premium to get net gain. Divide by renovation cost for ROI %. Compare that net gain against what the cash would grow to if invested at market rates.",
  },
  {
    q: 'Does renovating your home increase its value?',
    a: "Usually, but rarely dollar-for-dollar. Most renovations recoup 50–80% of their cost at resale — meaning a $50,000 kitchen remodel might add $30,000–$40,000 in home value. Exceptions exist in hot markets or for specific high-demand improvements. The added value also compounds with home appreciation over time, which is why hold period matters: the longer you stay, the more the renovation premium grows.",
  },
];

export function RenovationROICalculator() {
  const [inputs, setInputs] = useState<RenovationROIInputs>(DEFAULT_RENOVATION_ROI_INPUTS);

  function handleChange(key: keyof RenovationROIInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateRenovationROIInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRenovationROI(inputs)),
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
    a.download = `renovation-roi-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Renovation ROI vs. Investing Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Compare the return on a home renovation against investing the same cash in the market.</p>
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
        data-print-title="Renovation ROI vs. Investing Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panels — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <RenovationROIInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Verdict panel — col-span-4 */}
        <div className="lg:col-span-4">
          <RenovationROISummary result={result} yearsUntilSale={inputs.yearsUntilSale} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <RenovationROIChart result={result} yearsUntilSale={inputs.yearsUntilSale} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this helped you make your renovation decision,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RenovationROITable result={result} />
        </div>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
