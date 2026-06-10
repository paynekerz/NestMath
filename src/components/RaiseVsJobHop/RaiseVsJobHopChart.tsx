import { useState } from 'react';
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
  ReferenceDot,
} from 'recharts';
import type { RaiseVsJobHopResult } from '../../lib/raise-vs-job-hop';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: RaiseVsJobHopResult;
  yearsToModel: number;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtTooltip = (v: number) => cur.format(v);

const STAY_COLOR = '#94a3b8';
const HOP_COLOR = 'oklch(55% 0.18 250)';

export function RaiseVsJobHopChart({ result, yearsToModel }: Props) {
  const chartRef = usePrintChart();
  const [view, setView] = useState<'5yr' | 'lifetime'>('lifetime');

  const allData = [
    { year: 0, 'Stay': 0, 'Hop': 0 },
    ...result.years.map(y => ({
      year: y.year,
      'Stay': y.cumulativeStay,
      'Hop': y.cumulativeHop,
    })),
  ];

  const data = view === '5yr' ? allData.filter(d => d.year <= 5) : allData;

  const breakEvenDataPoint = result.breakEvenYear !== null
    ? allData.find(d => d.year === result.breakEvenYear)
    : null;
  const breakEvenY = breakEvenDataPoint?.['Hop'] ?? null;
  const breakEvenInView = result.hopWins && result.breakEvenYear !== null && result.breakEvenYear > 1 && data.some(d => d.year === result.breakEvenYear);

  const last = result.years[result.years.length - 1];

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Cumulative Earnings Over Time</h2>
        <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5" data-print="hide">
          {(['5yr', 'lifetime'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-sm py-1 rounded-md text-label-sm transition-colors ${view === v ? 'bg-surface-elevated text-on-surface font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {v === '5yr' ? '5 yr' : `${yearsToModel} yr`}
            </button>
          ))}
        </div>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: STAY_COLOR }} />
          Stay (current job)
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: HOP_COLOR }} />
          Hop (new offer)
        </span>
      </div>

      <div ref={chartRef} role="img" aria-label="Cumulative Earnings Over Time chart">
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
          {breakEvenInView && (
            <ReferenceLine
              x={result.breakEvenYear!}
              stroke="oklch(55% 0.01 260)"
              strokeDasharray="4 4"
              label={{ value: 'Break-even', position: 'top', fill: 'oklch(55% 0.01 260)', fontSize: 10 }}
            />
          )}
          {breakEvenInView && breakEvenY !== null && (
            <ReferenceDot
              x={result.breakEvenYear!}
              y={breakEvenY}
              r={5}
              fill={HOP_COLOR}
              stroke="oklch(17% 0.025 260)"
              strokeWidth={2}
            />
          )}
          <Line
            type="monotone"
            dataKey="Stay"
            stroke={STAY_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Hop"
            stroke={HOP_COLOR}
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
          <p className="text-label-sm text-on-surface-variant mb-1">Year {yearsToModel} Salary (Stay)</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {last ? cur.format(last.salaryStay) : '—'}
          </p>
          <p className="text-label-sm text-on-surface-variant">annual salary</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Year {yearsToModel} Salary (Hop)</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
            {last ? cur.format(last.salaryHop) : '—'}
          </p>
          <p className="text-label-sm text-on-surface-variant">annual salary</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Lifetime Delta</p>
          <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.lifetimeDelta >= 0 ? 'text-primary' : 'text-success-emerald'}`}>
            {result.lifetimeDelta >= 0
              ? `+${cur.format(result.lifetimeDelta)}`
              : cur.format(result.lifetimeDelta)}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            {result.lifetimeDelta >= 0 ? 'more by hopping' : 'more by staying'}
          </p>
        </div>
      </div>
    </div>
  );
}
