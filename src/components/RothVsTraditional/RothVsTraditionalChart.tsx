import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RothVsTraditionalResult } from '../../lib/roth-vs-traditional';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: RothVsTraditionalResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const ROTH_COLOR = 'oklch(55% 0.18 250)';
const TRAD_AFTER_COLOR = 'oklch(55% 0.15 150)';
const TRAD_AFTER_FILL = 'oklch(55% 0.15 150 / 0.3)';
const TAX_FILL = 'oklch(55% 0.2 25 / 0.25)';
const TAX_COLOR = 'oklch(55% 0.2 25 / 0.7)';

export function RothVsTraditionalChart({ result }: Props) {
  const chartRef = usePrintChart();

  const data = result.chartRows.map(r => ({
    year: r.year,
    'Roth (after-tax)': r.rothBalance,
    'Trad. after-tax': r.tradAfterTax,
    'Trad. tax owed': r.tradTaxOwed,
  }));

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Balance Growth Over Time</h2>
      </div>

      {/* Legend pills */}
      <div className="flex flex-wrap items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: ROTH_COLOR }} />
          Roth balance (after-tax)
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-sm" style={{ height: '8px', background: TRAD_AFTER_FILL, border: `1px solid ${TRAD_AFTER_COLOR}` }} />
          Traditional after-tax value
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-sm" style={{ height: '8px', background: TAX_FILL, border: `1px solid ${TAX_COLOR}` }} />
          Tax owed at withdrawal
        </span>
      </div>

      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
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
              formatter={(v: unknown, name: string) => [cur.format(v as number), name]}
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
            {/* Traditional: stacked area — after-tax portion + tax owed portion */}
            <Area
              type="monotone"
              dataKey="Trad. after-tax"
              stackId="trad"
              stroke={TRAD_AFTER_COLOR}
              fill={TRAD_AFTER_FILL}
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="Trad. tax owed"
              stackId="trad"
              stroke={TAX_COLOR}
              fill={TAX_FILL}
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            {/* Roth: line on top */}
            <Line
              type="monotone"
              dataKey="Roth (after-tax)"
              stroke={ROTH_COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: ROTH_COLOR }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Roth final value</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums" style={{ color: ROTH_COLOR }}>
            {cur.format(result.rothFinalBalance)}
          </p>
          <p className="text-label-sm text-on-surface-variant">100% yours, tax-free</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Traditional after-tax</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums" style={{ color: TRAD_AFTER_COLOR }}>
            {cur.format(result.tradFinalAfterTaxValue)}
          </p>
          <p className="text-label-sm text-on-surface-variant">after retirement taxes</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Tax owed at withdrawal</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums" style={{ color: '#f87171' }}>
            {cur.format(result.taxOwedAtRetirement)}
          </p>
          <p className="text-label-sm text-on-surface-variant">Traditional tax bill</p>
        </div>
      </div>
    </div>
  );
}
