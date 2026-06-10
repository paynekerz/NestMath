import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { RenovationROIResult } from '../../lib/renovation-roi';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: RenovationROIResult;
  yearsUntilSale: number;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtTooltip = (v: number) => cur.format(v);

const RENO_COLOR = 'oklch(55% 0.18 250)';
const INVEST_COLOR = '#10b981';

export function RenovationROIChart({ result, yearsUntilSale }: Props) {
  const chartRef = usePrintChart();
  const data = [
    { year: 0, 'Renovation Gain': 0, 'Investment Value': 0 },
    ...result.years.map(y => ({
      year: y.year,
      'Renovation Gain': y.renovationNetGain,
      'Investment Value': y.investmentNetGain,
    })),
  ];

  const crossoverYear = (() => {
    for (let i = 1; i < result.years.length; i++) {
      const prev = result.years[i - 1];
      const curr = result.years[i];
      if ((prev.delta >= 0) !== (curr.delta >= 0)) return curr.year;
    }
    return null;
  })();

  const last = result.years[result.years.length - 1];

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Net Gain Over Time</h2>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: RENO_COLOR }} />
          Renovation net gain
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: INVEST_COLOR }} />
          Investment net gain
        </span>
      </div>

      <div ref={chartRef} role="img" aria-label="Net Gain Over Time chart">
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
            formatter={(v: unknown) => fmtTooltip(v as number)}
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
          {crossoverYear !== null && (
            <ReferenceLine
              x={crossoverYear}
              stroke="oklch(55% 0.01 260)"
              strokeDasharray="4 4"
              label={{ value: 'Crossover', position: 'top', fill: 'oklch(55% 0.01 260)', fontSize: 10 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="Renovation Gain"
            stroke={RENO_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Investment Value"
            stroke={INVEST_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Reno Net Gain (Year {yearsUntilSale})</p>
          <p className={`text-headline-md font-bold font-mono-data tabular-nums ${last && last.renovationNetGain >= 0 ? 'text-primary' : 'text-error'}`}>
            {last ? (last.renovationNetGain >= 0 ? `+${cur.format(last.renovationNetGain)}` : cur.format(last.renovationNetGain)) : '—'}
          </p>
          <p className="text-label-sm text-on-surface-variant">at sale</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Invest Net Gain (Year {yearsUntilSale})</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-success-emerald">
            {last ? `+${cur.format(last.investmentNetGain)}` : '—'}
          </p>
          <p className="text-label-sm text-on-surface-variant">if invested instead</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Winner Advantage</p>
          <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.renoWins ? 'text-primary' : 'text-success-emerald'}`}>
            +{cur.format(result.delta)}
          </p>
          <p className="text-label-sm text-on-surface-variant">{result.renoWins ? 'reno wins' : 'invest wins'}</p>
        </div>
      </div>
    </div>
  );
}
