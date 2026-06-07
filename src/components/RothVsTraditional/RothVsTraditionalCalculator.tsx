import { useState, useMemo } from 'react';
import {
  DEFAULT_ROTH_VS_TRADITIONAL_INPUTS,
  calcRothVsTraditional,
  type RothVsTraditionalInputs,
} from '../../lib/roth-vs-traditional';
import { validateRothVsTraditionalInputs, hasErrors } from '../../lib/validation';
import { RothVsTraditionalInputs as RothVsTraditionalInputsPanel } from './RothVsTraditionalInputs';
import { RothVsTraditionalSummary } from './RothVsTraditionalSummary';
import { RothVsTraditionalChart } from './RothVsTraditionalChart';
import { RothVsTraditionalTable } from './RothVsTraditionalTable';
import { KofiButton } from '../ui/KofiButton';
import { FAQSection, type FAQItem } from '../ui/FAQSection';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: RothVsTraditionalInputs, result: ReturnType<typeof calcRothVsTraditional>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Roth vs. Traditional IRA Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Inputs ---', '');
  row('Annual contribution', cur.format(inputs.annualContribution));
  row('Years to retirement', String(inputs.yearsToRetirement));
  row('Current marginal tax rate', `${(inputs.currentTaxRate * 100).toFixed(1)}%`);
  row('Expected retirement tax rate', `${(inputs.retirementTaxRate * 100).toFixed(1)}%`);
  row('Expected annual return', `${(inputs.expectedAnnualReturn * 100).toFixed(1)}%`);
  row('', '');
  row('--- Summary ---', '');
  row('Roth after-tax value', cur.format(result.rothFinalBalance));
  row('Traditional gross balance', cur.format(result.tradFinalGrossBalance));
  row('Traditional after-tax value', cur.format(result.tradFinalAfterTaxValue));
  row('Winner', result.winner === 'roth' ? 'Roth IRA' : 'Traditional IRA');
  row('Net advantage', cur.format(result.netAdvantage));
  row('Tax savings now (annual)', cur.format(result.taxSavingsNowAnnual));
  row('Tax savings now (total career)', cur.format(result.taxSavingsNowTotal));
  row('Tax owed at retirement (Traditional)', cur.format(result.taxOwedAtRetirement));
  row('', '');
  row('Year', 'Roth Balance', 'Traditional Gross Balance', 'Traditional After-Tax Value', 'Delta (Roth - Trad After-Tax)');
  for (const y of result.years) {
    row(
      String(y.year),
      cur.format(y.rothBalance),
      cur.format(y.tradGrossBalance),
      cur.format(y.tradAfterTaxValue),
      (y.delta >= 0 ? '+' : '') + cur.format(y.delta),
    );
  }

  return rows.join('\n');
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'What is the difference between a Roth and Traditional IRA?',
    a: "Both are individual retirement accounts with the same $7,000 annual contribution limit (2024). The difference is tax timing. Traditional IRA: you deduct contributions now (pre-tax), the money grows untaxed, and you pay ordinary income tax when you withdraw in retirement. Roth IRA: you contribute after-tax dollars, the money grows untaxed, and qualified withdrawals in retirement are completely tax-free — including all the growth.",
  },
  {
    q: 'Which is better — Roth or Traditional IRA?',
    a: "It depends almost entirely on whether you expect to be in a higher or lower tax bracket in retirement. If you expect your tax rate to be lower in retirement than it is today, Traditional usually wins — you defer taxes until you're in a cheaper bracket. If you expect your tax rate to be the same or higher, Roth wins — you pay taxes now at the lower rate and everything after grows tax-free. Young people early in their careers generally favor Roth; high earners at peak income often lean Traditional.",
  },
  {
    q: 'Who qualifies to contribute to a Roth IRA?',
    a: "For 2024, you can contribute the full $7,000 ($8,000 if 50+) if your modified AGI is under $146,000 (single) or $230,000 (married filing jointly). The contribution phases out above those limits and disappears at $161,000 (single) / $240,000 (married). There's no income limit for Traditional IRA contributions, though the deductibility phases out if you or your spouse has a workplace retirement plan. If you earn too much for Roth, look into the backdoor Roth IRA strategy.",
  },
  {
    q: 'What is the 2024 IRA contribution limit?',
    a: "$7,000 per year ($8,000 if you're 50 or older — the extra $1,000 is the catch-up contribution). This limit is shared across all your IRAs — you can split it between Roth and Traditional in any proportion, but the total can't exceed $7,000. If you're also contributing to a 401(k), that has a separate, higher limit ($23,000 in 2024), and it doesn't affect what you can put in your IRA.",
  },
  {
    q: 'Can I convert a Traditional IRA to a Roth IRA?',
    a: "Yes — a Roth conversion lets you move money from a Traditional to a Roth IRA at any time. You pay income tax on the converted amount in the year you convert, then that money grows tax-free forever. Conversions are often worth considering in low-income years (job transition, early retirement, temporary gap) when your marginal tax rate is unusually low. There's no income limit on conversions — this is also the mechanism behind the 'backdoor Roth IRA' strategy for high earners.",
  },
];

export function RothVsTraditionalCalculator() {
  const [inputs, setInputs] = useState<RothVsTraditionalInputs>(DEFAULT_ROTH_VS_TRADITIONAL_INPUTS);

  function handleChange(key: keyof RothVsTraditionalInputs, value: number) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  const errors = useMemo(() => validateRothVsTraditionalInputs(inputs), [inputs]);
  const result = useMemo(
    () => (hasErrors(errors) ? null : calcRothVsTraditional(inputs)),
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
    a.download = `roth-vs-traditional-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Roth vs. Traditional IRA</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Compare after-tax retirement wealth under both account types given your current and expected future tax rates.</p>
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
        data-print-title="Roth vs. Traditional IRA Calculator"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panel — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <RothVsTraditionalInputsPanel
            inputs={inputs}
            onChange={handleChange}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <RothVsTraditionalSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <RothVsTraditionalChart result={result} />
          </div>
        )}
      </div>

      {/* Ko-fi nudge */}
      {result && (
        <p data-print="hide" className="text-sm text-center text-on-surface-variant mt-6">
          If this helped you think through your IRA strategy,{' '}
          <KofiButton label="☕ a coffee seems fair." />
        </p>
      )}

      {/* Year-by-year table */}
      {result && (
        <div className="mt-6">
          <RothVsTraditionalTable result={result} />
        </div>
      )}

      <div data-print="hide" className="mt-4">
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </div>
  );
}
