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
import type { HYSAResult } from '../../lib/hysa';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: HYSAResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtTooltip = (v: number) => cur.format(v);

const HYSA_COLOR = 'oklch(55% 0.18 250)';
const TRAD_COLOR = 'oklch(55% 0.01 260)';

export function HYSAChart({ result }: Props) {
  const chartRef = usePrintChart();
  const data = [
    { year: 0, 'HYSA': result.initialDeposit, 'Traditional': result.initialDeposit },
    ...result.years.map(y => ({
      year: y.year,
      'HYSA': y.balanceHYSA,
      'Traditional': y.balanceTraditional,
    })),
  ];

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Balance Over Time</h2>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: HYSA_COLOR }} />
          HYSA ({cur.format(result.extraEarned)} extra)
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: TRAD_COLOR }} />
          Traditional savings
        </span>
      </div>

      <div ref={chartRef} role="img" aria-label="Balance Over Time chart">
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
            dataKey="HYSA"
            stroke={HYSA_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Traditional"
            stroke={TRAD_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Extra earned</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-success-emerald">
            {cur.format(result.extraEarned)}
          </p>
          <p className="text-label-sm text-on-surface-variant">vs. traditional savings</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">HYSA interest</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
            {cur.format(result.interestEarnedHYSA)}
          </p>
          <p className="text-label-sm text-on-surface-variant">total interest earned</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Total contributed</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {cur.format(result.totalContributions)}
          </p>
          <p className="text-label-sm text-on-surface-variant">initial + monthly</p>
        </div>
      </div>
    </div>
  );
}
