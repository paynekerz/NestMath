import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PayoffResult } from '../../lib/calculator';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: PayoffResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const fmtTooltip = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export function PayoffChart({ result }: Props) {
  const chartRef = usePrintChart();
  const data = result.years.map((yr, i) => {
    const prevCumOrig = i === 0 ? 0 : result.years[i - 1].cumulativeInterestOriginal;
    const prevCumExtra = i === 0 ? 0 : result.years[i - 1].cumulativeInterestExtra;
    return {
      year: `Yr ${yr.year}`,
      'Standard': Math.max(0, yr.cumulativeInterestOriginal - prevCumOrig),
      'Accelerated': Math.max(0, yr.cumulativeInterestExtra - prevCumExtra),
    };
  });

  const extraPayoffYear = result.monthsSaved > 0
    ? `Yr ${Math.ceil(result.extraPayoffMonths / 12)}`
    : null;

  return (
    <div ref={chartRef} data-print="chart" className="glass-panel p-4 rounded-xl">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Annual Interest Cost</h2>
        <span className="text-label-sm text-on-surface-variant px-2 py-0.5 rounded bg-surface-container-high">Interest View</span>
      </div>
      <p className="text-label-sm text-on-surface-variant mb-4">
        Interest paid each year: standard schedule vs. accelerated payoff
      </p>
      <div role="img" aria-label="Annual Interest Cost chart">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.01 240)" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
            axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
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
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={(value) => (
              <span style={{ color: 'oklch(75% 0.01 260)' }}>{value}</span>
            )}
          />
          {extraPayoffYear && (
            <ReferenceLine
              x={extraPayoffYear}
              stroke="oklch(70% 0.15 150)"
              strokeDasharray="4 4"
              label={{ value: 'Paid off', position: 'top', fill: 'oklch(70% 0.15 150)', fontSize: 10 }}
            />
          )}
          <Bar dataKey="Standard" fill="oklch(50% 0.01 260)" opacity={0.35} radius={[2, 2, 0, 0]} />
          <Bar dataKey="Accelerated" fill="oklch(55% 0.18 250)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
