import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { NetWorthResult, NetWorthSlice } from '../../lib/net-worth';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: NetWorthResult;
}

const ASSET_COLORS = [
  'oklch(55% 0.18 250)',   // blue
  'oklch(55% 0.18 200)',   // teal
  'oklch(55% 0.18 150)',   // green
  'oklch(60% 0.18 280)',   // purple
  'oklch(65% 0.18 220)',   // sky
  'oklch(60% 0.12 250)',   // muted blue
];

const LIABILITY_COLORS = [
  'oklch(55% 0.20 20)',    // red-orange
  'oklch(60% 0.18 40)',    // orange
  'oklch(65% 0.18 60)',    // amber
  'oklch(55% 0.18 350)',   // crimson
  'oklch(60% 0.14 30)',    // muted red
];

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function pct(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

interface DonutProps {
  title: string;
  data: NetWorthSlice[];
  total: number;
  colors: string[];
  emptyLabel: string;
  totalLabel: string;
}

function DonutChart({ title, data, total, colors, emptyLabel, totalLabel }: DonutProps) {
  const hasData = data.length > 0 && total > 0;

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg flex flex-col gap-4">
      <h3 className="text-label-md font-semibold text-on-surface">{title}</h3>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>donut_large</span>
          <p className="text-body-sm text-on-surface-variant">{emptyLabel}</p>
        </div>
      ) : (
        <>
          <div className="relative" role="img" aria-label={`${title} chart`}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [cur.format(v as number), name as string]}
                  contentStyle={{
                    background: 'oklch(17% 0.025 260)',
                    border: '1px solid oklch(25% 0.02 260)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'oklch(90% 0.01 260)',
                  }}
                  labelStyle={{ display: 'none' }}
                  itemStyle={{ color: 'oklch(90% 0.01 260)' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-label-sm text-on-surface-variant">{totalLabel}</p>
              <p className="text-body-lg font-bold font-mono-data tabular-nums text-on-surface">
                {cur.format(total)}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2">
            {data.map((slice, i) => (
              <div key={slice.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="shrink-0 w-2.5 h-2.5 rounded-full"
                    style={{ background: colors[i % colors.length] }}
                  />
                  <span className="text-label-sm text-on-surface-variant truncate">{slice.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-label-sm font-mono-data tabular-nums text-on-surface">{cur.format(slice.value)}</span>
                  <span className="text-label-sm text-on-surface-variant w-10 text-right">{pct(slice.value, total)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function NetWorthChart({ result }: Props) {
  const chartRef = usePrintChart();
  return (
    <div ref={chartRef} className="grid grid-cols-1 md:grid-cols-2 gap-4" data-print="chart">
      <DonutChart
        title="Assets Breakdown"
        data={result.assetBreakdown}
        total={result.totalAssets}
        colors={ASSET_COLORS}
        emptyLabel="Enter your assets above to see the breakdown."
        totalLabel="Total assets"
      />
      <DonutChart
        title="Liabilities Breakdown"
        data={result.liabilityBreakdown}
        total={result.totalLiabilities}
        colors={LIABILITY_COLORS}
        emptyLabel="Enter your liabilities above to see the breakdown."
        totalLabel="Total owed"
      />
    </div>
  );
}
