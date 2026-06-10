import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { SideIncomeResult } from '../../lib/side-income';

interface Props {
  result: SideIncomeResult;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const SLICE_CONFIG = [
  { key: 'businessExpenses',      label: 'Business expenses', color: 'oklch(55% 0.03 260)' },
  { key: 'selfEmploymentTax',     label: 'SE tax',            color: 'oklch(65% 0.18 50)'  },
  { key: 'incomeTaxOnSideIncome', label: 'Income tax',        color: 'oklch(55% 0.20 20)'  },
  { key: 'trueTakeHome',          label: 'Take-home',         color: 'oklch(55% 0.15 150)' },
] as const;

export function SideIncomeChart({ result }: Props) {
  const slices = SLICE_CONFIG
    .map(({ key, label, color }) => ({
      name: label,
      value: Math.max(0, result[key]),
      color,
    }))
    .filter(s => s.value > 0);

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <h2 className="text-label-md font-semibold text-on-surface mb-4">Where Your Gross Income Goes</h2>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Donut */}
        <div className="relative shrink-0" role="img" aria-label="Where Your Gross Income Goes chart" style={{ width: 220, height: 220 }}>
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={2}
                strokeWidth={0}
              >
                {slices.map((s, i) => (
                  <Cell key={i} fill={s.color} />
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
            <p className="text-label-sm text-on-surface-variant">Gross</p>
            <p className="text-body-md font-bold font-mono-data tabular-nums text-on-surface">
              {cur.format(result.grossSideIncome)}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-3 w-full">
          {slices.map(s => {
            const sharePct = total > 0 ? (s.value / total) * 100 : 0;
            return (
              <div key={s.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-label-sm text-on-surface-variant">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-label-sm tabular-nums text-on-surface">{cur.format(s.value)}</span>
                    <span className="text-label-sm text-on-surface-variant w-10 text-right">{sharePct.toFixed(1)}%</span>
                  </div>
                </div>
                {/* Bar */}
                <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(sharePct, 1)}%`, background: s.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
