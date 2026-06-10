import type { RaiseVsJobHopResult } from '../../lib/raise-vs-job-hop';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: RaiseVsJobHopResult | null;
  yearsToModel: number;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function heroLabel(result: RaiseVsJobHopResult, yearsToModel: number): string {
  if (!result.hopWins) {
    return `Stay wins over ${yearsToModel} yrs`;
  }
  if (result.breakEvenYear === 1) {
    return 'Hop wins from Year 1';
  }
  return `Year ${result.breakEvenYear}`;
}

function heroSubLabel(result: RaiseVsJobHopResult): string {
  if (!result.hopWins) {
    return 'cumulative earnings advantage';
  }
  if (result.breakEvenYear === 1) {
    return 'cumulative earnings advantage';
  }
  return 'break-even year';
}

function recommendation(result: RaiseVsJobHopResult, yearsToModel: number): string {
  if (!result.hopWins) {
    return `Staying pays off more over ${yearsToModel} years. Your current raise rate outpaces the new offer's compounding growth.`;
  }
  if (result.breakEvenYear === 1) {
    return 'The new offer pays off immediately and leads in every year modeled.';
  }
  return `The new offer takes ${result.breakEvenYear} year${result.breakEvenYear === 1 ? '' : 's'} to pull ahead on cumulative earnings. Worth it if you plan to stay beyond that.`;
}

export function RaiseVsJobHopSummary({ result, yearsToModel }: Props) {
  const hopWins = result?.hopWins ?? false;
  const borderColor = hopWins ? 'border-primary-accent/40' : 'border-success-emerald/30';
  const headerBorderColor = hopWins ? 'border-primary-accent/20' : 'border-success-emerald/10';
  const headerBg = hopWins ? 'bg-primary-container/10' : 'bg-success-emerald/5';
  const iconColor = hopWins ? 'text-primary-accent' : 'text-success-emerald';
  const iconName = hopWins ? 'trending_up' : 'trending_flat';
  const heroColor = hopWins ? 'text-primary' : 'text-success-emerald';
  const footerBg = hopWins ? 'bg-primary-accent/5 border-t border-primary-accent/10' : 'bg-success-emerald/5 border-t border-success-emerald/10';

  const last = result?.years[result.years.length - 1];

  return (
    <div className={`bg-surface-elevated rounded-xl border ${borderColor} overflow-hidden flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-lg py-sm flex items-center justify-between border-b ${headerBorderColor} ${headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined ${iconColor}`} style={{ fontSize: '18px' }}>{iconName}</span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">VERDICT</span>
        </div>
        {result && (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border ${hopWins ? 'bg-primary-accent/10 text-primary border-primary-accent/20' : 'bg-success-emerald/10 text-success-emerald border-success-emerald/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse inline-block ${hopWins ? 'bg-primary-accent' : 'bg-success-emerald'}`} />
            {hopWins ? 'Job Hop' : 'Stay'}
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Hero stat */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">
              {heroSubLabel(result)}
            </p>
            <p className={`text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 ${heroColor}`}>
              {heroLabel(result, yearsToModel)}
            </p>
          </div>

          {/* 2-col stats */}
          <div className="grid grid-cols-2 gap-4 px-lg pb-lg border-t border-border-subtle pt-lg">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-label-sm text-on-surface-variant">Lifetime Delta</p>
                <InfoTooltip text={`Total cumulative earnings difference over ${yearsToModel} years; positive means the hop earns more in total.`} />
              </div>
              <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.lifetimeDelta >= 0 ? 'text-primary' : 'text-success-emerald'}`}>
                {result.lifetimeDelta >= 0
                  ? `+${cur.format(result.lifetimeDelta)}`
                  : cur.format(result.lifetimeDelta)}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-0.5">
                {result.lifetimeDelta >= 0 ? 'more by hopping' : 'more by staying'}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <p className="text-label-sm text-on-surface-variant">Year {yearsToModel} Salary</p>
                <InfoTooltip text={`Annual salary in year ${yearsToModel} for each path after compounding raises.`} />
              </div>
              <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
                {last ? cur.format(Math.max(last.salaryStay, last.salaryHop)) : '—'}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-0.5">
                {last && last.salaryHop >= last.salaryStay ? 'via hop' : 'via stay'}
              </p>
            </div>
          </div>

          {/* Footer recommendation */}
          <div className={`${footerBg} px-lg py-sm`}>
            <p className="text-body-sm text-on-surface-variant">
              {recommendation(result, yearsToModel)}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>calculate</span>
          <p className="text-body-sm text-on-surface-variant">Enter your salary details to see whether staying or switching pays off more over time.</p>
        </div>
      )}
    </div>
  );
}
