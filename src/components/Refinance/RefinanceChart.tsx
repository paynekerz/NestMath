import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { RefinanceResult } from '../../lib/calculator';

interface Props {
  result: RefinanceResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const fmtTooltip = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function RefinanceChart({ result }: Props) {
  const data = [
    { year: 0, 'Current Path': 0, 'Refinanced': 0 },
    ...result.years.map(y => ({
      year: y.year,
      'Current Path': y.cumulativeInterestCurrent,
      'Refinanced': y.cumulativeInterestRefinanced,
    })),
  ];

  // Snap to the first full year at or after break-even so the reference line
  // lands on an integer data point (Recharts drops fractional x values on numeric axes).
  const breakEvenYear = result.breakEvenMonths !== null
    ? Math.ceil(result.breakEvenMonths / 12)
    : null;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-accent uppercase tracking-wide mb-4">Cumulative Interest Paid</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 16 }}>
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
            formatter={(v: unknown) => fmtTooltip(v as number)}
            contentStyle={{
              background: 'oklch(17% 0.025 260)',
              border: '1px solid oklch(25% 0.02 260)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'oklch(90% 0.01 260)',
            }}
            labelStyle={{ color: 'oklch(90% 0.01 260)', marginBottom: '4px' }}
            itemStyle={{ color: 'oklch(90% 0.01 260)' }}
            labelFormatter={(v: unknown) => `Year ${v}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          {breakEvenYear !== null && (
            <ReferenceLine
              x={breakEvenYear}
              stroke="oklch(55% 0.01 260)"
              strokeDasharray="4 4"
              label={{ value: 'Break-even', position: 'top', fill: 'oklch(55% 0.01 260)', fontSize: 10 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="Current Path"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Refinanced"
            stroke="#4ade80"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
