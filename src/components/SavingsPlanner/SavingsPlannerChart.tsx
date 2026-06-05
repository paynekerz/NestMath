import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import type { SavingsPlannerResult, SavingsPlannerMonthResult } from '../../lib/savings';

interface Props {
  result: SavingsPlannerResult;
  currentSavings: number;
  bullCaseMonths?: SavingsPlannerMonthResult[];
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const fmtTooltip = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

function dateRange(result: SavingsPlannerResult): string {
  const nowYear = new Date().getFullYear();
  const lastMonth = result.months[result.months.length - 1];
  if (!lastMonth) return String(nowYear);
  const end = new Date();
  end.setMonth(end.getMonth() + lastMonth.month);
  return `${nowYear} — ${end.getFullYear()}`;
}

export function SavingsPlannerChart({ result, currentSavings, bullCaseMonths }: Props) {
  const data = [
    {
      month: 0,
      'Base Case': currentSavings,
      ...(bullCaseMonths ? { 'Bull Case': currentSavings } : {}),
    },
    ...result.months.map(m => {
      const bull = bullCaseMonths?.find(b => b.month === m.month);
      return {
        month: m.month,
        'Base Case': m.cumulativeSavings,
        ...(bull ? { 'Bull Case': bull.cumulativeSavings } : {}),
      };
    }),
  ];

  const crossoverMonth = result.monthsToGoal !== null && result.monthsToGoal > 0
    ? result.monthsToGoal
    : null;

  return (
    <div className="glass-card p-xl rounded-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-xs">
        <div>
          <h2 className="text-headline-md text-primary font-semibold">Growth Trajectory</h2>
          <p className="text-label-sm text-on-surface-variant mt-0.5">{dateRange(result)}</p>
        </div>
        {/* Legend pills */}
        <div className="flex items-center gap-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-medium bg-primary/10 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary-accent inline-block" />
            Base Case
          </span>
          {bullCaseMonths && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-medium bg-success-emerald/10 text-success-emerald">
              <span className="w-2 h-2 rounded-full bg-success-emerald inline-block" />
              Bull Case
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.01 240)" />
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
            formatter={(v: unknown, name: string) => [fmtTooltip(v as number), name]}
            contentStyle={{
              background: 'oklch(17% 0.025 260)',
              border: '1px solid oklch(25% 0.02 260)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'oklch(90% 0.01 260)',
            }}
            labelStyle={{ color: 'oklch(90% 0.01 260)', marginBottom: '4px', fontWeight: 600 }}
            itemStyle={{ color: 'oklch(90% 0.01 260)' }}
            labelFormatter={(v: unknown) => `Month ${v}`}
          />
          {/* Target dashed line */}
          <ReferenceLine
            y={result.cashToClose}
            stroke="oklch(55% 0.01 260)"
            strokeDasharray="4 4"
            label={{ value: 'Target', position: 'insideTopRight', fill: 'oklch(55% 0.01 260)', fontSize: 10 }}
          />
          {/* Crossover vertical marker */}
          {crossoverMonth !== null && (
            <ReferenceLine
              x={crossoverMonth}
              stroke="oklch(70% 0.15 150)"
              strokeDasharray="4 4"
            />
          )}
          {/* Annotated crossover dot */}
          {crossoverMonth !== null && (
            <ReferenceDot
              x={crossoverMonth}
              y={result.cashToClose}
              r={6}
              fill="oklch(70% 0.15 150)"
              stroke="oklch(15% 0.01 240)"
              strokeWidth={2}
              label={{
                value: 'DRAFT - Milestone Reached',
                position: 'top',
                fill: 'oklch(70% 0.15 150)',
                fontSize: 10,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="Base Case"
            stroke="oklch(55% 0.18 250)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: 'oklch(55% 0.18 250)' }}
          />
          {bullCaseMonths && (
            <Line
              type="monotone"
              dataKey="Bull Case"
              stroke="oklch(70% 0.15 150)"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 4, fill: 'oklch(70% 0.15 150)' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
