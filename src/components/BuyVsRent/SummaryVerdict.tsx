import type { CalculationResult } from '../../lib/calculator';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: CalculationResult;
  yearsToModel: number;
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function SummaryVerdict({ result, yearsToModel }: Props) {
  const finalYear = result.years[result.years.length - 1];

  return (
    <div className="grid grid-cols-2 gap-[24px]">
      {/* Buy Net Worth card */}
      <div className="glass-card p-[24px] rounded-xl relative overflow-hidden group">
        <div
          className="absolute top-0 right-0 p-[12px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[80px]">account_balance</span>
        </div>
        <p className="text-label-md uppercase tracking-wider text-on-surface-variant mb-[4px] flex items-center gap-[4px]">
          Buy Net Worth (yr {yearsToModel})
          <InfoTooltip text="Home value minus remaining loan balance." />
        </p>
        <h3 className="text-headline-md sm:text-headline-lg font-bold font-mono-data text-primary-accent mb-[4px]">
          {finalYear ? fmt.format(finalYear.buyNetWorth) : '—'}
        </h3>
        <p className="text-body-sm text-on-surface-variant">Projected equity + home appreciation</p>
      </div>

      {/* Rent Net Worth card */}
      <div className="glass-card p-[24px] rounded-xl relative overflow-hidden group">
        <div
          className="absolute top-0 right-0 p-[12px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-[80px]">trending_up</span>
        </div>
        <p className="text-label-md uppercase tracking-wider text-on-surface-variant mb-[4px] flex items-center gap-[4px]">
          Rent Net Worth (yr {yearsToModel})
          <InfoTooltip text="Total value of savings and investments, compounded." />
        </p>
        <h3 className="text-headline-md sm:text-headline-lg font-bold font-mono-data text-success-emerald mb-[4px]">
          {finalYear ? fmt.format(finalYear.rentNetWorth) : '—'}
        </h3>
        <p className="text-body-sm text-on-surface-variant">Projected portfolio value (compounded)</p>
      </div>
    </div>
  );
}
