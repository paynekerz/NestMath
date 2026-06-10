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
import type { StudentLoanPayoffResult } from '../../lib/student-loan-payoff';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: StudentLoanPayoffResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cur2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STD_COLOR = 'oklch(55% 0.01 260)';
const ACC_COLOR = 'oklch(55% 0.18 250)';

export function StudentLoanPayoffChart({ result }: Props) {
  const chartRef = usePrintChart();
  const hasExtra = result.monthsSaved > 0;

  const data: { year: number; standard: number; accelerated: number }[] = [
    { year: 0, standard: result.initialBalance, accelerated: result.initialBalance },
    ...result.years.map(y => ({
      year: y.year,
      standard: y.balanceStandard,
      accelerated: y.balanceAccelerated,
    })),
  ];

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Remaining Balance Over Time</h2>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: STD_COLOR }} />
          Standard ({cur2.format(result.monthlyPayment)}/mo)
        </span>
        {hasExtra && (
          <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
            <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: ACC_COLOR }} />
            With extra payment
          </span>
        )}
      </div>

      <div ref={chartRef} role="img" aria-label="Remaining Balance Over Time chart">
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
              formatter={(v: unknown, name: string) => [
                cur.format(v as number),
                name === 'standard' ? 'Standard balance' : 'Accelerated balance',
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
              labelFormatter={(v: unknown) => `Year ${v}`}
            />
            <Legend wrapperStyle={{ display: 'none' }} />
            <Line
              type="monotone"
              dataKey="standard"
              stroke={STD_COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              strokeDasharray={hasExtra ? '6 3' : undefined}
            />
            {hasExtra && (
              <Line
                type="monotone"
                dataKey="accelerated"
                stroke={ACC_COLOR}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Standard total interest</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-error">
            {cur.format(result.totalInterestStandard)}
          </p>
          <p className="text-label-sm text-on-surface-variant">over {result.standardPayoffMonths} months</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Interest saved</p>
          <p className={`text-headline-md font-bold font-mono-data tabular-nums ${hasExtra ? 'text-success-emerald' : 'text-on-surface-variant'}`}>
            {cur.format(result.interestSaved)}
          </p>
          <p className="text-label-sm text-on-surface-variant">with extra payments</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Months saved</p>
          <p className={`text-headline-md font-bold font-mono-data tabular-nums ${hasExtra ? 'text-primary' : 'text-on-surface-variant'}`}>
            {result.monthsSaved}
          </p>
          <p className="text-label-sm text-on-surface-variant">off your payoff timeline</p>
        </div>
      </div>
    </div>
  );
}
