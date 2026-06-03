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
import type { SavingsPlannerResult } from '../../lib/savings';

interface Props {
  result: SavingsPlannerResult;
  currentSavings: number;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const fmtTooltip = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function SavingsPlannerChart({ result, currentSavings }: Props) {
  const data = [
    { month: 0, 'Cumulative Savings': currentSavings },
    ...result.months.map(m => ({
      month: m.month,
      'Cumulative Savings': m.cumulativeSavings,
    })),
  ];

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-accent uppercase tracking-wide mb-4">Savings Progress</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.02 260)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
            axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
            tickLine={false}
            tickCount={7}
            label={{ value: 'Month', position: 'insideBottom', offset: -8, fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
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
            labelFormatter={(v: unknown) => `Month ${v}`}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <ReferenceLine
            y={result.cashToClose}
            stroke="oklch(55% 0.01 260)"
            strokeDasharray="4 4"
            label={{ value: 'Target', position: 'insideTopRight', fill: 'oklch(55% 0.01 260)', fontSize: 10 }}
          />
          {result.monthsToGoal !== null && result.monthsToGoal > 0 && (
            <ReferenceLine
              x={result.monthsToGoal}
              stroke="oklch(55% 0.01 260)"
              strokeDasharray="4 4"
              label={{ value: 'Goal reached', position: 'top', fill: 'oklch(55% 0.01 260)', fontSize: 10 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="Cumulative Savings"
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
