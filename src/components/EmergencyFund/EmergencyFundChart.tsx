import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { EmergencyFundResult } from '../../lib/emergency-fund';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: EmergencyFundResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const SAVINGS_COLOR = 'oklch(55% 0.18 250)';
const THREE_MO_COLOR = 'oklch(70% 0.18 60)';   // amber
const SIX_MO_COLOR = 'oklch(55% 0.18 150)';    // green

// Downsample for chart readability when there are many months
function sampleData(months: EmergencyFundResult['months']): EmergencyFundResult['months'] {
  if (months.length <= 25) return months;
  const step = months.length <= 60 ? 3 : 6;
  return months.filter((_, i) => i === 0 || (i + 1) % step === 0 || i === months.length - 1);
}

function xLabel(month: number): string {
  if (month === 0) return 'Now';
  const years = month / 12;
  if (Number.isInteger(years)) return `Yr ${years}`;
  return `Mo ${month}`;
}

export function EmergencyFundChart({ result }: Props) {
  const chartRef = usePrintChart();
  const data = sampleData(result.months).map(p => ({
    month: p.month,
    Savings: Math.round(p.savings),
    label: xLabel(p.month),
  }));

  const maxSavings = Math.max(...result.months.map(p => p.savings), result.sixMonthTarget);

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Savings Growth to Goal</h2>
      </div>

      {/* Legend pills */}
      <div className="flex flex-wrap items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: SAVINGS_COLOR }} />
          Your savings
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: THREE_MO_COLOR, borderTop: '2px dashed ' + THREE_MO_COLOR }} />
          3-month target ({cur.format(result.threeMonthTarget)})
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: SIX_MO_COLOR, borderTop: '2px dashed ' + SIX_MO_COLOR }} />
          6-month target ({cur.format(result.sixMonthTarget)})
        </span>
      </div>

      <div ref={chartRef} role="img" aria-label="Savings Growth to Goal chart">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 80, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.02 260)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
              axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
              tickLine={false}
              label={{ value: 'Time', position: 'insideBottom', offset: -8, fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
            />
            <YAxis
              domain={[0, Math.ceil(maxSavings * 1.05)]}
              tickFormatter={fmtAxis}
              tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
              axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(v: unknown) => [cur.format(v as number), 'Savings']}
              contentStyle={{
                background: 'oklch(17% 0.025 260)',
                border: '1px solid oklch(25% 0.02 260)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'oklch(90% 0.01 260)',
              }}
              labelStyle={{ color: 'oklch(90% 0.01 260)', marginBottom: '4px' }}
              itemStyle={{ color: 'oklch(90% 0.01 260)' }}
            />
            <ReferenceLine
              y={result.threeMonthTarget}
              stroke={THREE_MO_COLOR}
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: '3 mo', position: 'right', fill: THREE_MO_COLOR, fontSize: 11 }}
            />
            <ReferenceLine
              y={result.sixMonthTarget}
              stroke={SIX_MO_COLOR}
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: '6 mo', position: 'right', fill: SIX_MO_COLOR, fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="Savings"
              stroke={SAVINGS_COLOR}
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
          <p className="text-label-sm text-on-surface-variant mb-1">Current coverage</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {result.currentMonthsCoverage.toFixed(1)} mo
          </p>
          <p className="text-label-sm text-on-surface-variant">of expenses covered now</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">3-month target</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
            {cur.format(result.threeMonthTarget)}
          </p>
          <p className="text-label-sm text-on-surface-variant">minimum recommended</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">6-month target</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-success-emerald">
            {cur.format(result.sixMonthTarget)}
          </p>
          <p className="text-label-sm text-on-surface-variant">gold standard</p>
        </div>
      </div>
    </div>
  );
}
