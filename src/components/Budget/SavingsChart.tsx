import { useMemo } from 'react';
import { usePrintChart } from '../../lib/usePrintChart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { calcSavingsAccumulation } from '../../lib/budget';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

export const HORIZONS = [
  { label: '1 yr',  months: 12  },
  { label: '3 yr',  months: 36  },
  { label: '5 yr',  months: 60  },
  { label: '10 yr', months: 120 },
  { label: '15 yr', months: 180 },
  { label: '20 yr', months: 240 },
  { label: '30 yr', months: 360 },
] as const;

interface Props {
  monthlyNet: number;
  horizonMonths: number;
  onHorizonChange: (months: number) => void;
}

export function SavingsChart({ monthlyNet, horizonMonths, onHorizonChange }: Props) {
  const chartRef = usePrintChart();
  const data = useMemo(
    () => calcSavingsAccumulation(monthlyNet, horizonMonths),
    [monthlyNet, horizonMonths],
  );

  const yearTicks = useMemo(
    () => data.filter(p => p.month % 12 === 0).map(p => p.month),
    [data],
  );

  if (monthlyNet <= 0) return null;

  return (
    <div ref={chartRef} data-print="chart" className="bg-surface-elevated border border-border-subtle rounded-xl p-[24px] flex flex-col gap-[16px]">
      <div className="flex items-center justify-between flex-wrap gap-[12px]">
        <div className="flex items-center gap-[10px]">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-container">
            <span className="material-symbols-outlined text-on-secondary-container text-[18px]" aria-hidden="true">trending_up</span>
          </div>
          <h2 className="text-label-md font-semibold text-primary uppercase tracking-widest">Savings Over Time</h2>
        </div>
        <div className="flex flex-wrap gap-[4px]">
          {HORIZONS.map(h => (
            <button
              key={h.months}
              type="button"
              onClick={() => onHorizonChange(h.months)}
              className={
                'px-[12px] py-[4px] rounded-lg text-label-sm font-medium transition-colors ' +
                (horizonMonths === h.months
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high')
              }
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>
      <div role="img" aria-label="Savings Over Time chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.01 240)" />
          <XAxis
            dataKey="month"
            ticks={yearTicks}
            tickFormatter={m => `Yr ${(m as number) / 12}`}
            tick={{ fill: '#c3c6d7', fontSize: 11 }}
            axisLine={{ stroke: 'oklch(25% 0.01 240)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fill: '#c3c6d7', fontSize: 11 }}
            axisLine={{ stroke: 'oklch(25% 0.01 240)' }}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(v: unknown) => [cur.format(v as number), 'Cumulative Savings']}
            labelFormatter={(m: unknown) => {
              const mo = m as number;
              const yr = Math.floor(mo / 12);
              const rem = mo % 12;
              return rem === 0 ? `Year ${yr}` : `Month ${mo} (Yr ${yr}, Mo ${rem})`;
            }}
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
          <Line
            type="monotone"
            dataKey="cumulative"
            name="Cumulative Savings"
            stroke="oklch(70% 0.15 150)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
