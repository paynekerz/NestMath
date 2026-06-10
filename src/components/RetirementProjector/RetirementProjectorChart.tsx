import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RetirementProjectorResult } from '../../lib/retirement-projector';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: RetirementProjectorResult;
  currentAge: number;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtTooltip = (v: number) => cur.format(v);

const OWN_COLOR = 'oklch(55% 0.18 250)';
const OWN_FILL = 'oklch(55% 0.18 250 / 0.35)';
const MATCH_COLOR = 'oklch(55% 0.15 150)';
const MATCH_FILL = 'oklch(55% 0.15 150 / 0.35)';

export function RetirementProjectorChart({ result, currentAge }: Props) {
  const chartRef = usePrintChart();

  const data = result.chartRows.map(r => ({
    age: r.age,
    'Your Contributions': r.ownBalance,
    'Employer Match': r.matchBonus,
    total: r.ownBalance + r.matchBonus,
  }));

  const hasMatch = result.annualEmployerMatch > 0;

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Balance Growth Over Time</h2>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: OWN_COLOR }} />
          Your contributions
        </span>
        {hasMatch && (
          <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
            <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: MATCH_COLOR }} />
            Employer match portion
          </span>
        )}
      </div>

      <div ref={chartRef} role="img" aria-label="Balance Growth Over Time chart">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.02 260)" />
            <XAxis
              dataKey="age"
              tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
              axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
              tickLine={false}
              label={{ value: 'Age', position: 'insideBottom', offset: -8, fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
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
              labelFormatter={(v: unknown) => `Age ${v}`}
            />
            <Area
              type="monotone"
              dataKey="Your Contributions"
              stackId="a"
              stroke={OWN_COLOR}
              fill={OWN_FILL}
              strokeWidth={2}
            />
            {hasMatch && (
              <Area
                type="monotone"
                dataKey="Employer Match"
                stackId="a"
                stroke={MATCH_COLOR}
                fill={MATCH_FILL}
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Projected balance</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums" style={{ color: OWN_COLOR }}>
            {cur.format(result.projectedBalance)}
          </p>
          <p className="text-label-sm text-on-surface-variant">nominal at retirement</p>
        </div>
        {hasMatch && (
          <div>
            <p className="text-label-sm text-on-surface-variant mb-1">Employer match total</p>
            <p className="text-headline-md font-bold font-mono-data tabular-nums" style={{ color: MATCH_COLOR }}>
              {cur.format(result.totalEmployerMatchContributed)}
            </p>
            <p className="text-label-sm text-on-surface-variant">contributed by employer</p>
          </div>
        )}
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">In today's dollars</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {cur.format(result.inflationAdjustedBalance)}
          </p>
          <p className="text-label-sm text-on-surface-variant">inflation-adjusted</p>
        </div>
      </div>
    </div>
  );
}
