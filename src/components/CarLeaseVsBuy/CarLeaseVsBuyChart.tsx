import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CarLeaseVsBuyResult } from '../../lib/car-lease-vs-buy';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: CarLeaseVsBuyResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtTooltip = (v: number) => cur.format(v);

const LEASE_COLOR = '#f59e0b';
const BUY_COLOR = 'oklch(55% 0.18 250)';
const INVEST_COLOR = 'oklch(70% 0.15 150)';

export function CarLeaseVsBuyChart({ result }: Props) {
  const chartRef = usePrintChart();
  const data = [
    { year: 0, 'Lease': 0, 'Buy': 0, 'Invest Delta': 0 },
    ...result.years.map(y => ({
      year: y.year,
      'Lease': Math.round(y.cumulativeCostLease),
      'Buy': Math.round(y.cumulativeNetCostBuy),
      'Invest Delta': Math.round(y.netCostInvestPath),
    })),
  ];

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Cumulative Net Cost Over Time</h2>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: LEASE_COLOR }} />
          Lease
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: BUY_COLOR }} />
          Buy (net)
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: INVEST_COLOR }} />
          Invest the Delta
        </span>
      </div>

      <div ref={chartRef} role="img" aria-label="Cumulative Net Cost Over Time chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.02 260)" />
          <XAxis
            dataKey="year"
            tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
            axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
            tickLine={false}
            label={{ value: 'Year', position: 'insideBottom', offset: -8, fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
            axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(v: unknown, name: string) => [fmtTooltip(v as number), name]}
            contentStyle={{
              background: 'oklch(17% 0.025 260)',
              border: '1px solid oklch(25% 0.02 260)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'oklch(90% 0.01 260)',
            }}
            labelStyle={{ color: 'oklch(90% 0.01 260)', marginBottom: '4px' }}
            itemStyle={{ color: 'oklch(90% 0.01 260)' }}
            labelFormatter={(v: unknown) => `Year ${v}`}
          />
          <Legend wrapperStyle={{ display: 'none' }} />
          <Line
            type="monotone"
            dataKey="Lease"
            stroke={LEASE_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Buy"
            stroke={BUY_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Invest Delta"
            stroke={INVEST_COLOR}
            strokeWidth={2.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Monthly buy payment</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
            {cur.format(result.monthlyBuyPayment)}
          </p>
          <p className="text-label-sm text-on-surface-variant">until loan payoff</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Car value at end</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {cur.format(result.carValueAtEnd)}
          </p>
          <p className="text-label-sm text-on-surface-variant">after depreciation</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Invest portfolio</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-success-emerald">
            {cur.format(result.investValue)}
          </p>
          <p className="text-label-sm text-on-surface-variant">delta invested at return rate</p>
        </div>
      </div>
    </div>
  );
}
