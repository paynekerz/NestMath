import type { RothVsTraditionalResult } from '../../lib/roth-vs-traditional';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RothVsTraditionalResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const ROTH = {
  color:  'oklch(55% 0.18 250)',
  bg:     'oklch(55% 0.18 250 / 0.08)',
  border: 'oklch(55% 0.18 250 / 0.4)',
  chip:   'oklch(55% 0.18 250 / 0.12)',
  chipBorder: 'oklch(55% 0.18 250 / 0.3)',
};

const TRAD = {
  color:  'oklch(55% 0.15 150)',
  bg:     'oklch(55% 0.15 150 / 0.08)',
  border: 'oklch(55% 0.15 150 / 0.4)',
  chip:   'oklch(55% 0.15 150 / 0.12)',
  chipBorder: 'oklch(55% 0.15 150 / 0.3)',
};

export function RothVsTraditionalSummary({ result }: Props) {
  const isRoth = result ? result.winner === 'roth' : true;

  const w = isRoth ? ROTH : TRAD;
  const winnerColor = w.color;
  const winnerBg = w.bg;
  const winnerBorder = w.border;

  return (
    <div
      className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full"
      style={{ border: `1px solid ${result ? winnerBorder : 'oklch(25% 0.02 260)'}` }}
    >
      {/* Header */}
      <div
        className="px-lg py-sm flex items-center justify-between"
        style={{ background: result ? winnerBg : 'transparent', borderBottom: '1px solid oklch(25% 0.02 260)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: !result ? 'oklch(55% 0.01 260)' : winnerColor }}
          >
            {result ? 'account_balance' : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">IRA COMPARISON</span>
        </div>
        {result && (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold"
            style={{ background: w.chip, color: winnerColor, border: `1px solid ${w.chipBorder}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: winnerColor }} />
            {isRoth ? 'ROTH WINS' : 'TRAD WINS'}
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: winner after-tax value */}
          <div
            className="flex flex-col items-center justify-center gap-1 px-lg pt-lg pb-md text-center"
            style={{ background: `${winnerColor.replace(')', ' / 0.05)').replace('oklch(', 'oklch(')}` }}
          >
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">
              {isRoth ? 'Roth After-Tax Value' : 'Traditional After-Tax Value'}
            </p>
            <p
              className="text-[44px] font-bold font-mono-data tabular-nums leading-none mt-1"
              style={{ color: winnerColor }}
            >
              {cur.format(isRoth ? result.rothFinalBalance : result.tradFinalAfterTaxValue)}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-1">
              vs. {cur.format(isRoth ? result.tradFinalAfterTaxValue : result.rothFinalBalance)} for {isRoth ? 'Traditional' : 'Roth'}
            </p>
          </div>

          {/* Net advantage + tax savings */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Net Advantage</p>
                <InfoTooltip text="The dollar difference in after-tax retirement value between Roth and Traditional. This is how much more the winner provides after accounting for taxes." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(result.netAdvantage)}
              </p>
              <p className="text-label-sm text-on-surface-variant">{isRoth ? 'Roth' : 'Trad'} advantage</p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Tax Savings Now</p>
                <InfoTooltip text="Annual tax savings from Traditional IRA contributions: your contribution × current marginal rate. This money comes back to you as a reduced tax bill or larger refund each year." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(result.taxSavingsNowAnnual)}<span className="text-body-sm font-normal text-on-surface-variant">/yr</span>
              </p>
              <p className="text-label-sm text-on-surface-variant">Traditional deduction</p>
            </div>
          </div>

          {/* Tax owed at retirement */}
          <div className="border-t border-border-subtle px-lg py-sm">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-label-sm text-on-surface-variant">Tax owed at retirement (Traditional)</p>
              <InfoTooltip text="The total taxes you would pay on Traditional IRA withdrawals: the full gross balance taxed at your expected retirement rate. Roth owes $0 at withdrawal." />
            </div>
            <p className="text-headline-md font-bold font-mono-data tabular-nums" style={{ color: '#f87171' }}>
              {cur.format(result.taxOwedAtRetirement)}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              Roth owes $0 at withdrawal
            </p>
          </div>

          {/* Total career tax savings */}
          <div
            className="border-t border-border-subtle px-lg py-sm"
            style={{ background: 'oklch(55% 0.18 250 / 0.04)' }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-label-sm text-on-surface-variant">Total Traditional tax savings (career)</p>
              <InfoTooltip text="The sum of all upfront tax deductions over your contribution years. This cash stays in your pocket each year; it can be invested elsewhere or used however you want." />
            </div>
            <p className="text-body-md font-bold font-mono-data tabular-nums text-primary">
              {cur.format(result.taxSavingsNowTotal)}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>account_balance</span>
          <p className="text-body-sm text-on-surface-variant">Enter your contribution and tax rates to compare Roth vs. Traditional after-tax wealth.</p>
        </div>
      )}
    </div>
  );
}
