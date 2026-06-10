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
import type { InvestmentFeesResult } from '../../lib/investment-fees';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: InvestmentFeesResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtTooltip = (v: number) => cur.format(v);

const HIGH_FEE_COLOR = '#f59e0b';
const LOW_COST_COLOR = 'oklch(70% 0.15 150)';

export function InvestmentFeesChart({ result }: Props) {
  const chartRef = usePrintChart();
  const data = [
    { year: 0, 'Current Fees': result.initialInvestment, 'Low-Cost Fund': result.initialInvestment },
    ...result.years.map(y => ({
      year: y.year,
      'Current Fees': y.portfolioCurrentFees,
      'Low-Cost Fund': y.portfolioLowCost,
    })),
  ];

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Portfolio Value Over Time</h2>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: HIGH_FEE_COLOR }} />
          Current fees ({cur.format(result.feeDragDollar)} drag)
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: LOW_COST_COLOR }} />
          Low-cost fund
        </span>
      </div>

      <div ref={chartRef} role="img" aria-label="Portfolio Value Over Time chart">
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
            dataKey="Current Fees"
            stroke={HIGH_FEE_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Low-Cost Fund"
            stroke={LOW_COST_COLOR}
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
          <p className="text-label-sm text-on-surface-variant mb-1">Fee drag (total)</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
            {cur.format(result.feeDragDollar)}
          </p>
          <p className="text-label-sm text-on-surface-variant">lost to fees</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Fee drag (%)</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
            {result.feeDragPct.toFixed(1)}%
          </p>
          <p className="text-label-sm text-on-surface-variant">of low-cost portfolio</p>
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
