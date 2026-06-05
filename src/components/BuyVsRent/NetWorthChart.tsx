import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { YearResult } from '../../lib/calculator';

interface Props {
  years: YearResult[];
  breakEvenYear: number | null;
  yearsToModel: number;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const fmtTooltip = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const BUY_COLOR  = 'oklch(55% 0.18 250)';
const RENT_COLOR = 'oklch(70% 0.15 150)';

export function NetWorthChart({ years, breakEvenYear, yearsToModel }: Props) {
  const data = years.map(yr => ({
    year: yr.year,
    'Buy Net Worth': Math.round(yr.buyNetWorth),
    'Rent Net Worth': Math.round(yr.rentNetWorth),
  }));

  const finalYear = years[years.length - 1];
  const buyWins = breakEvenYear !== null;

  return (
    <div className="glass-card rounded-xl p-[24px] flex flex-col gap-[24px] min-w-0">
      {/* Chart header */}
      <div className="flex items-center justify-between">
        <h2 className="text-headline-md font-semibold text-on-surface">
          DRAFT - Equity Trajectory Over {yearsToModel} Years
        </h2>
        <div className="flex items-center gap-[16px]">
          <span className="flex items-center gap-[6px] text-label-sm text-on-surface-variant">
            <span className="w-3 h-3 rounded-full bg-primary-accent inline-block" aria-hidden="true" />
            Buy
          </span>
          <span className="flex items-center gap-[6px] text-label-sm text-on-surface-variant">
            <span className="w-3 h-3 rounded-full bg-success-emerald inline-block" aria-hidden="true" />
            Rent
          </span>
        </div>
      </div>

      {years.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.01 240)" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#c3c6d7', fontSize: 11, fontFamily: 'monospace' }}
              axisLine={{ stroke: 'oklch(25% 0.01 240)' }}
              tickLine={false}
              label={{ value: 'Year', position: 'insideBottom', offset: -8, fill: '#c3c6d7', fontSize: 11 }}
            />
            <YAxis
              tickFormatter={fmtAxis}
              tick={{ fill: '#c3c6d7', fontSize: 11, fontFamily: 'monospace' }}
              axisLine={{ stroke: 'oklch(25% 0.01 240)' }}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(v: unknown) => fmtTooltip(v as number)}
              contentStyle={{
                background: '#1b2027',
                border: '1px solid oklch(25% 0.01 240)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#dee3ec',
              }}
              labelStyle={{ color: '#dee3ec', marginBottom: '4px' }}
              itemStyle={{ color: '#dee3ec' }}
            />
            <Line type="monotone" dataKey="Buy Net Worth"  stroke={BUY_COLOR}  strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="Rent Net Worth" stroke={RENT_COLOR} strokeWidth={2.5} dot={false} strokeDasharray="5 3" activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-on-surface-variant text-body-sm">
          Enter your numbers to see the chart.
        </div>
      )}

      {/* Recommendation box */}
      {finalYear && (
        <div className="p-[16px] bg-surface-container-low rounded-lg border border-border-subtle">
          <div className="flex items-start gap-[12px]">
            <span
              className={`material-symbols-outlined text-[18px] shrink-0 mt-[2px] ${buyWins ? 'text-primary-accent' : 'text-success-emerald'}`}
              aria-hidden="true"
            >verified</span>
            <p className="text-body-sm text-on-surface">
              <span className={`font-bold ${buyWins ? 'text-primary-accent' : 'text-success-emerald'}`}>
                Recommendation:{' '}
              </span>
              {buyWins ? (
                <>
                  Buying breaks even in year {breakEvenYear}. By year {yearsToModel}, buying leads by{' '}
                  <span className="font-bold">{fmt.format(finalYear.buyNetWorth - finalYear.rentNetWorth)}</span> in net worth.
                </>
              ) : (
                <>
                  Renting and investing the down payment delta currently yields a{' '}
                  <span className="font-bold">{fmt.format(finalYear.rentNetWorth - finalYear.buyNetWorth)}</span>{' '}
                  advantage over {yearsToModel} years given the current mortgage environment.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
