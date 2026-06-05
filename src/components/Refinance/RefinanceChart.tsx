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
import type { RefinanceResult } from '../../lib/calculator';

interface Props {
  result: RefinanceResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtTooltip = (v: number) => cur.format(v);

export function RefinanceChart({ result }: Props) {
  const [view, setView] = useState<'5yr' | 'lifetime'>('lifetime');

  const allData = [
    { year: 0, 'Current Path': 0, 'Refinanced': 0 },
    ...result.years.map(y => ({
      year: y.year,
      'Current Path': y.cumulativeInterestCurrent,
      'Refinanced': y.cumulativeInterestRefinanced,
    })),
  ];

  const data = view === '5yr' ? allData.filter(d => d.year <= 5) : allData;

  const breakEvenYear = result.breakEvenMonths !== null
    ? Math.ceil(result.breakEvenMonths / 12)
    : null;

  const breakEvenDataPoint = breakEvenYear !== null
    ? allData.find(d => d.year === breakEvenYear)
    : null;
  const breakEvenY = breakEvenDataPoint?.['Refinanced'] ?? null;
  const breakEvenInView = breakEvenYear !== null && data.some(d => d.year === breakEvenYear);

  const grossInterestSaved = result.totalInterestCurrent - result.totalInterestRefinanced;

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Equity Recovery &amp; Break-Even</h2>
        <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5" data-print="hide">
          {(['5yr', 'lifetime'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-sm py-1 rounded-md text-label-sm transition-colors ${view === v ? 'bg-surface-elevated text-on-surface font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {v === '5yr' ? '5 yr' : 'Lifetime'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: '#f87171' }} />
          Current Path
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: 'oklch(70% 0.15 150)' }} />
          Refinanced
        </span>
      </div>

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
              x={breakEvenYear!}
              stroke="oklch(55% 0.01 260)"
              strokeDasharray="4 4"
              label={{ value: 'Break-even', position: 'top', fill: 'oklch(55% 0.01 260)', fontSize: 10 }}
            />
          )}
          {breakEvenInView && breakEvenY !== null && (
            <ReferenceDot
              x={breakEvenYear!}
              y={breakEvenY}
              r={5}
              fill="oklch(70% 0.15 150)"
              stroke="oklch(17% 0.025 260)"
              strokeWidth={2}
            />
          )}
          <Line
            type="monotone"
            dataKey="Current Path"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Refinanced"
            stroke="oklch(70% 0.15 150)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 3-col insight row */}
      <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Closing Costs</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {cur.format(result.closingCostsDollar)}
          </p>
          <p className="text-label-sm text-on-surface-variant">upfront to refinance</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Gross Interest Saved</p>
          <p className={`text-headline-md font-bold font-mono-data tabular-nums ${grossInterestSaved >= 0 ? 'text-success-emerald' : 'text-error'}`}>
            {grossInterestSaved >= 0
              ? cur.format(grossInterestSaved)
              : `-${cur.format(Math.abs(grossInterestSaved))}`}
          </p>
          <p className="text-label-sm text-on-surface-variant">before closing costs</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Net Savings</p>
          <p className={`text-headline-md font-bold font-mono-data tabular-nums ${result.netSavings >= 0 ? 'text-success-emerald' : 'text-error'}`}>
            {result.netSavings >= 0
              ? cur.format(result.netSavings)
              : `-${cur.format(Math.abs(result.netSavings))}`}
          </p>
          <p className="text-label-sm text-on-surface-variant">after closing costs</p>
        </div>
      </div>
    </div>
  );
}
