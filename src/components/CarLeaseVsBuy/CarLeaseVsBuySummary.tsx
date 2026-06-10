import type { CarLeaseVsBuyResult } from '../../lib/car-lease-vs-buy';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: CarLeaseVsBuyResult | null;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const WINNER_CONFIG = {
  lease: {
    label: 'LEASE WINS',
    icon: 'directions_car',
    color: 'text-[#f59e0b]',
    border: 'border-[#f59e0b]/30',
    bg: 'bg-[#f59e0b]/5',
    headerBg: 'bg-[#f59e0b]/10',
    headerBorder: 'border-[#f59e0b]/10',
    chipBg: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
  },
  buy: {
    label: 'BUY WINS',
    icon: 'account_balance',
    color: 'text-primary-accent',
    border: 'border-primary-accent/30',
    bg: 'bg-primary-accent/5',
    headerBg: 'bg-primary-container/10',
    headerBorder: 'border-primary-accent/20',
    chipBg: 'bg-primary-accent/10 text-primary border-primary/20',
  },
  invest: {
    label: 'INVEST THE DELTA WINS',
    icon: 'trending_up',
    color: 'text-success-emerald',
    border: 'border-success-emerald/30',
    bg: 'bg-success-emerald/5',
    headerBg: 'bg-success-emerald/10',
    headerBorder: 'border-success-emerald/10',
    chipBg: 'bg-success-emerald/10 text-success-emerald border-success-emerald/20',
  },
} as const;

export function CarLeaseVsBuySummary({ result }: Props) {
  const cfg = result ? WINNER_CONFIG[result.winner] : WINNER_CONFIG.invest;

  return (
    <div className={`bg-surface-elevated rounded-xl overflow-hidden flex flex-col h-full ${result ? cfg.border : 'border-border-subtle'} border`}>
      {/* Header */}
      <div className={`px-lg py-sm flex items-center justify-between ${result ? `${cfg.headerBorder} ${cfg.headerBg}` : 'border-b border-border-subtle'}`}>
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined ${result ? cfg.color : 'text-on-surface-variant'}`}
            style={{ fontSize: '18px' }}
          >
            {result ? cfg.icon : 'calculate'}
          </span>
          <span className="text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">VERDICT</span>
        </div>
        {result && (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-semibold border ${cfg.chipBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse inline-block ${result.winner === 'lease' ? 'bg-[#f59e0b]' : result.winner === 'buy' ? 'bg-primary-accent' : 'bg-success-emerald'}`} />
            {cfg.label}
          </span>
        )}
      </div>

      {result ? (
        <>
          {/* Winner net cost hero */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 px-lg py-xl text-center">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Lowest Net Cost</p>
            <p className={`text-[48px] font-bold font-mono-data tabular-nums leading-none mt-2 ${cfg.color}`}>
              {cur.format(
                result.winner === 'lease' ? result.totalCostLease :
                result.winner === 'buy' ? result.netCostBuy :
                result.netCostInvestPath
              )}
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {result.winner === 'buy' ? 'after car residual value' : 'total out-of-pocket'}
            </p>
          </div>

          {/* 3-col net cost breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle border-t border-border-subtle">
            {/* Lease */}
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-[#f59e0b]" style={{ fontSize: '16px' }}>directions_car</span>
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Lease</p>
                <InfoTooltip text="Total of all lease payments and upfront costs. No car to show for it at the end." />
              </div>
              <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.winner === 'lease' ? 'text-[#f59e0b]' : 'text-on-surface'}`}>
                {cur.format(result.totalCostLease)}
              </p>
              {result.winner === 'lease' && (
                <span className="text-label-sm text-[#f59e0b] font-semibold">LOWEST</span>
              )}
            </div>

            {/* Buy */}
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>account_balance</span>
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Buy</p>
                <InfoTooltip text="Total paid (down + loan) minus the car's value at the end of your model period." />
              </div>
              <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.winner === 'buy' ? 'text-primary-accent' : 'text-on-surface'}`}>
                {cur.format(result.netCostBuy)}
              </p>
              {result.winner === 'buy' && (
                <span className="text-label-sm text-primary font-semibold">LOWEST</span>
              )}
            </div>

            {/* Invest the delta */}
            <div className="px-sm py-md flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: '16px' }}>trending_up</span>
              <div className="flex items-center gap-1">
                <p className="text-label-sm text-on-surface-variant">Invest</p>
                <InfoTooltip text="Take the cheaper option and invest the monthly savings. Net cost = more expensive path − investment portfolio." />
              </div>
              <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.winner === 'invest' ? 'text-success-emerald' : 'text-on-surface'}`}>
                {cur.format(result.netCostInvestPath)}
              </p>
              {result.winner === 'invest' && (
                <span className="text-label-sm text-success-emerald font-semibold">LOWEST</span>
              )}
            </div>
          </div>

          {/* Footer: car value + invest portfolio */}
          <div className={`grid grid-cols-2 divide-x divide-border-subtle border-t ${cfg.headerBorder} ${cfg.headerBg} px-0`}>
            <div className="px-lg py-sm">
              <p className="text-label-sm text-on-surface-variant">Car value at end</p>
              <p className="text-body-md font-bold font-mono-data tabular-nums text-primary mt-0.5">
                {cur.format(result.carValueAtEnd)}
              </p>
            </div>
            <div className="px-lg py-sm">
              <p className="text-label-sm text-on-surface-variant">Invest portfolio</p>
              <p className="text-body-md font-bold font-mono-data tabular-nums text-success-emerald mt-0.5">
                {cur.format(result.investValue)}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-xl text-center gap-3 min-h-[300px]">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>directions_car</span>
          <p className="text-body-sm text-on-surface-variant">Fill in your lease and buy details to see the three-way comparison.</p>
        </div>
      )}
    </div>
  );
}
