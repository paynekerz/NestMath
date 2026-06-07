import type { DebtPayoffResult } from '../../lib/debt-payoff';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: DebtPayoffResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function fmtMonths(n: number): string {
  const y = Math.floor(n / 12);
  const m = n % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} yr${y !== 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mo`);
  return parts.join(', ') || '< 1 mo';
}

function getDebtFreeDate(monthsFromNow: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function DebtPayoffSummary({ result }: Props) {
  const avalancheSaves = result ? result.interestSavedByAvalanche : 0;
  const winner: 'avalanche' | 'snowball' | 'tie' =
    !result
      ? 'avalanche'
      : avalancheSaves > 0.5
        ? 'avalanche'
        : avalancheSaves < -0.5
          ? 'snowball'
          : 'tie';

  return (
    <div className="bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full border border-primary/20">
      {/* Header */}
      <div className="px-lg py-sm flex items-center justify-between bg-primary-container/10 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>
            {result ? 'emoji_events' : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">PAYOFF PLAN</span>
        </div>
        {result && winner !== 'tie' && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border bg-primary-container/20 text-primary border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block bg-primary" />
            {winner === 'avalanche' ? 'AVALANCHE WINS' : 'SNOWBALL WINS'}
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero: interest saved by choosing avalanche */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">
              {winner === 'avalanche' ? 'Saved by Avalanche Method' : winner === 'snowball' ? 'Saved by Snowball Method' : 'Methods Are Equal'}
            </p>
            <p className="text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 text-primary">
              {cur.format(Math.abs(avalancheSaves))}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {winner === 'tie'
                ? 'Both strategies cost the same'
                : `in interest vs. ${winner === 'avalanche' ? 'snowball' : 'avalanche'} method`}
            </p>
          </div>

          {/* Two-col: avalanche | snowball */}
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            {/* Avalanche */}
            <div className={`px-sm py-md flex flex-col gap-2 ${winner === 'avalanche' ? 'bg-primary-container/5' : ''}`}>
              <div className="flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>trending_down</span>
                <p className="text-label-sm font-semibold text-primary uppercase tracking-wide">Avalanche</p>
                <InfoTooltip text="Pay the highest APR debt first. Minimizes total interest paid." />
              </div>
              <div className="text-center">
                <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                  {fmtMonths(result.avalanche.months)}
                </p>
                <p className="text-label-sm text-on-surface-variant">to debt-free</p>
              </div>
              <div className="text-center">
                <p className="text-body-md font-bold font-mono-data tabular-nums text-error">
                  {cur.format(result.avalanche.totalInterest)}
                </p>
                <p className="text-label-sm text-on-surface-variant">total interest</p>
              </div>
              <p className="text-label-sm text-center text-on-surface-variant">{getDebtFreeDate(result.avalanche.months)}</p>
            </div>

            {/* Snowball */}
            <div className={`px-sm py-md flex flex-col gap-2 ${winner === 'snowball' ? 'bg-primary-container/5' : ''}`}>
              <div className="flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '14px' }}>ac_unit</span>
                <p className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wide">Snowball</p>
                <InfoTooltip text="Pay the lowest balance debt first. Builds momentum with quick wins." />
              </div>
              <div className="text-center">
                <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                  {fmtMonths(result.snowball.months)}
                </p>
                <p className="text-label-sm text-on-surface-variant">to debt-free</p>
              </div>
              <div className="text-center">
                <p className="text-body-md font-bold font-mono-data tabular-nums text-error">
                  {cur.format(result.snowball.totalInterest)}
                </p>
                <p className="text-label-sm text-on-surface-variant">total interest</p>
              </div>
              <p className="text-label-sm text-center text-on-surface-variant">{getDebtFreeDate(result.snowball.months)}</p>
            </div>
          </div>

          {/* Months difference footer */}
          {result.avalanche.months !== result.snowball.months && (
            <div className="border-t border-border-subtle/50 bg-surface-container/30 px-lg py-sm text-center">
              <p className="text-label-sm text-on-surface-variant">
                Methods differ by{' '}
                <span className="font-semibold text-on-surface">
                  {Math.abs(result.avalanche.months - result.snowball.months)} month{Math.abs(result.avalanche.months - result.snowball.months) !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>credit_score</span>
          <p className="text-body-sm text-on-surface-variant">Enter your debts to compare payoff strategies.</p>
        </div>
      )}
    </div>
  );
}
