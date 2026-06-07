import type { RetirementProjectorResult } from '../../lib/retirement-projector';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RetirementProjectorResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function RetirementProjectorSummary({ result }: Props) {
  const hasSurplus = result ? result.shortfallOrSurplus >= 0 : false;

  return (
    <div
      className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full"
      style={{ border: `1px solid ${hasSurplus && result ? 'oklch(55% 0.15 150 / 0.4)' : 'oklch(55% 0.2 25 / 0.35)'}` }}
    >
      {/* Header */}
      <div
        className="px-lg py-sm flex items-center justify-between"
        style={{ background: hasSurplus && result ? 'oklch(55% 0.15 150 / 0.08)' : 'oklch(55% 0.2 25 / 0.06)', borderBottom: '1px solid oklch(25% 0.02 260)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px', color: !result ? 'oklch(55% 0.01 260)' : hasSurplus ? 'oklch(55% 0.15 150)' : '#f87171' }}
          >
            {result ? (hasSurplus ? 'savings' : 'warning') : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">RETIREMENT OUTLOOK</span>
        </div>
        {result && (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border"
            style={hasSurplus
              ? { background: 'oklch(55% 0.15 150 / 0.12)', color: 'oklch(55% 0.15 150)', border: '1px solid oklch(55% 0.15 150 / 0.25)' }
              : { background: 'oklch(55% 0.2 25 / 0.1)', color: '#f87171', border: '1px solid oklch(55% 0.2 25 / 0.25)' }
            }
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: hasSurplus ? 'oklch(55% 0.15 150)' : '#f87171' }} />
            {hasSurplus ? 'ON TRACK' : 'SHORTFALL'}
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: inflation-adjusted balance */}
          <div className="flex flex-col items-center justify-center gap-1 px-lg pt-lg pb-md text-center"
            style={{ background: hasSurplus ? 'oklch(55% 0.15 150 / 0.05)' : 'oklch(55% 0.2 25 / 0.04)' }}
          >
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">In Today's Dollars</p>
            <p
              className="text-[44px] font-bold font-mono-data tabular-nums leading-none mt-1"
              style={{ color: hasSurplus ? 'oklch(55% 0.15 150)' : '#f87171' }}
            >
              {cur.format(result.inflationAdjustedBalance)}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-1">
              {cur.format(result.projectedBalance)} nominal at retirement
            </p>
          </div>

          {/* Two-col: monthly income + target */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Monthly Income</p>
                <InfoTooltip text="Estimated monthly income using the 4% rule — a common guideline suggesting you can safely withdraw 4% of your inflation-adjusted balance each year without running out of money." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(result.estimatedMonthlyIncome)}
              </p>
              <p className="text-label-sm text-on-surface-variant">4% rule / yr</p>
            </div>
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Target Balance</p>
                <InfoTooltip text="Your retirement savings goal using the 25× rule — you need 25 times your annual expenses to sustain withdrawals indefinitely at 4% per year." />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(result.targetBalance)}
              </p>
              <p className="text-label-sm text-on-surface-variant">25× expenses</p>
            </div>
          </div>

          {/* Shortfall / surplus */}
          <div className="border-t border-border-subtle px-lg py-sm">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-label-sm text-on-surface-variant">{hasSurplus ? 'Surplus vs. target' : 'Shortfall vs. target'}</p>
              <InfoTooltip text={hasSurplus
                ? "Your inflation-adjusted projected balance exceeds your 25× target — you're on track."
                : "Your projected balance falls short of your 25× target in today's dollars. Consider increasing contributions or adjusting retirement age."
              } />
            </div>
            <p
              className="text-headline-md font-bold font-mono-data tabular-nums"
              style={{ color: hasSurplus ? 'oklch(55% 0.15 150)' : '#f87171' }}
            >
              {hasSurplus ? '+' : ''}{cur.format(result.shortfallOrSurplus)}
            </p>
          </div>

          {/* Employer match total */}
          <div
            className="border-t border-border-subtle px-lg py-sm"
            style={{ background: 'oklch(55% 0.18 250 / 0.05)' }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-label-sm text-on-surface-variant">Total employer match contributed</p>
              <InfoTooltip text="The total dollars your employer will have contributed over your career. This is free money that compounds alongside your own contributions." />
            </div>
            <p className="text-body-md font-bold font-mono-data tabular-nums text-primary">
              {cur.format(result.totalEmployerMatchContributed)}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              {result.yearsToRetirement} years × {cur.format(result.annualEmployerMatch)}/yr
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>savings</span>
          <p className="text-body-sm text-on-surface-variant">Enter your retirement details to see your projected balance and outlook.</p>
        </div>
      )}
    </div>
  );
}
