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
import type { DebtPayoffResult } from '../../lib/debt-payoff';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: DebtPayoffResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const AVALANCHE_COLOR = 'oklch(55% 0.18 250)';
const SNOWBALL_COLOR  = 'oklch(55% 0.14 160)';

export function DebtPayoffChart({ result }: Props) {
  const chartRef = usePrintChart();
  const maxMonths = Math.max(result.avalanche.months, result.snowball.months);

  const avalancheMap = new Map(result.avalanche.chartData.map(p => [p.month, p.remaining]));
  const snowballMap  = new Map(result.snowball.chartData.map(p  => [p.month, p.remaining]));

  const data: { month: number; avalanche: number; snowball: number }[] = [];
  for (let m = 0; m <= maxMonths; m++) {
    data.push({
      month: m,
      avalanche: avalancheMap.get(m) ?? 0,
      snowball: snowballMap.get(m) ?? 0,
    });
  }

  const xTickInterval = Math.max(1, Math.floor(maxMonths / 8));
  const interestSaved = result.interestSavedByAvalanche;

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <h2 className="text-label-md font-semibold text-on-surface mb-1">Total Remaining Debt Over Time</h2>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: AVALANCHE_COLOR }} />
          Avalanche (highest APR first)
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: SNOWBALL_COLOR }} />
          Snowball (lowest balance first)
        </span>
      </div>

      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.02 260)" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
              axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
              tickLine={false}
              interval={xTickInterval}
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
              formatter={(v: unknown, name: string) => [
                cur.format(v as number),
                name === 'avalanche' ? 'Avalanche' : 'Snowball',
              ]}
              contentStyle={{
                background: 'oklch(17% 0.025 260)',
                border: '1px solid oklch(25% 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'oklch(90% 0.01 260)',
              }}
              labelStyle={{ color: 'oklch(90% 0.01 260)', marginBottom: '4px' }}
              itemStyle={{ color: 'oklch(90% 0.01 260)' }}
              labelFormatter={(v: unknown) => `Month ${v}`}
            />
            <Legend wrapperStyle={{ display: 'none' }} />
            <Line
              type="monotone"
              dataKey="avalanche"
              stroke={AVALANCHE_COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="snowball"
              stroke={SNOWBALL_COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              strokeDasharray="6 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight row */}
      <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Interest saved</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
            {cur.format(Math.abs(interestSaved))}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            by choosing {interestSaved >= 0 ? 'avalanche' : 'snowball'}
          </p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Avalanche total</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {result.avalanche.months} mo
          </p>
          <p className="text-label-sm text-on-surface-variant">{cur.format(result.avalanche.totalInterest)} interest</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Snowball total</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {result.snowball.months} mo
          </p>
          <p className="text-label-sm text-on-surface-variant">{cur.format(result.snowball.totalInterest)} interest</p>
        </div>
      </div>
    </div>
  );
}
