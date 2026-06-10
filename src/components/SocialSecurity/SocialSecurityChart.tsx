import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { SocialSecurityResult } from '../../lib/social-security';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: SocialSecurityResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const COLOR_62 = '#f87171';
const COLOR_67 = 'oklch(55% 0.18 250)';
const COLOR_70 = 'oklch(55% 0.15 150)';

export function SocialSecurityChart({ result }: Props) {
  const chartRef = usePrintChart();

  const data = result.chartRows.map(r => ({
    age: r.age,
    'Claim at 62': r.total62,
    'Claim at 67': r.total67,
    'Claim at 70': r.total70,
  }));

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <h2 className="text-label-md font-semibold text-on-surface mb-1">Cumulative Lifetime Benefits</h2>

      {/* Legend */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        {[
          { label: 'Claim at 62', color: COLOR_62 },
          { label: 'Claim at 67 (FRA)', color: COLOR_67 },
          { label: 'Claim at 70', color: COLOR_70 },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
            <span className="inline-block w-6 rounded-full" style={{ height: '2px', background: color }} />
            {label}
          </span>
        ))}
      </div>

      <div ref={chartRef} role="img" aria-label="Cumulative Lifetime Benefits chart">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
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
              width={68}
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
              labelFormatter={(v: unknown) => `Age ${v}`}
            />

            {/* Break-even reference lines */}
            {result.breakEvenAge_62vs67 !== null && (
              <ReferenceLine
                x={result.breakEvenAge_62vs67}
                stroke="oklch(55% 0.01 260)"
                strokeDasharray="4 3"
                label={{
                  value: `62/67 break-even`,
                  position: 'insideTopRight',
                  fill: 'oklch(55% 0.01 260)',
                  fontSize: 10,
                }}
              />
            )}
            {result.breakEvenAge_67vs70 !== null && (
              <ReferenceLine
                x={result.breakEvenAge_67vs70}
                stroke="oklch(55% 0.01 260)"
                strokeDasharray="4 3"
                label={{
                  value: `67/70 break-even`,
                  position: 'insideTopLeft',
                  fill: 'oklch(55% 0.01 260)',
                  fontSize: 10,
                }}
              />
            )}

            <Line type="monotone" dataKey="Claim at 62" stroke={COLOR_62} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Claim at 67" stroke={COLOR_67} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Claim at 70" stroke={COLOR_70} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        {([
          { label: 'Claiming at 62', total: result.lifetimeTotalAt62, monthly: result.monthlyBenefitAt62, color: COLOR_62 },
          { label: 'Claiming at 67', total: result.lifetimeTotalAt67, monthly: result.monthlyBenefitAt67, color: COLOR_67 },
          { label: 'Claiming at 70', total: result.lifetimeTotalAt70, monthly: result.monthlyBenefitAt70, color: COLOR_70 },
        ]).map(({ label, total, monthly, color }) => (
          <div key={label}>
            <p className="text-label-sm text-on-surface-variant mb-1">{label}</p>
            <p className="text-headline-md font-bold font-mono-data tabular-nums" style={{ color }}>
              {cur.format(total)}
            </p>
            <p className="text-label-sm text-on-surface-variant">{cur.format(monthly)}/mo lifetime</p>
          </div>
        ))}
      </div>
    </div>
  );
}
