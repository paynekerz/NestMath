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
import type { CreditCardPayoffResult } from '../../lib/credit-card-payoff';
import { usePrintChart } from '../../lib/usePrintChart';

interface Props {
  result: CreditCardPayoffResult;
}

function fmtAxis(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const USER_COLOR = 'oklch(55% 0.18 250)';
const MIN_COLOR = 'oklch(55% 0.01 260)';

export function CreditCardPayoffChart({ result }: Props) {
  const chartRef = usePrintChart();
  const maxMonths = Math.max(result.payoffMonths, result.minPayoffMonths);

  const userMap = new Map(result.months.map(m => [m.month, m.balance]));
  const minMap = new Map(result.minMonths.map(m => [m.month, m.balance]));

  const data: { month: number; user: number; minimum: number }[] = [
    { month: 0, user: result.initialBalance, minimum: result.initialBalance },
  ];
  for (let m = 1; m <= maxMonths; m++) {
    data.push({
      month: m,
      user: userMap.get(m) ?? 0,
      minimum: minMap.get(m) ?? 0,
    });
  }

  const xTickInterval = Math.max(1, Math.floor(maxMonths / 8));

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-subtle p-lg" data-print="chart">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-label-md font-semibold text-on-surface">Remaining Balance Over Time</h2>
      </div>

      {/* Legend pills */}
      <div className="flex items-center gap-lg mb-4" data-print="hide">
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: USER_COLOR }} />
          Your payment ({cur.format(result.effectivePayment)}/mo)
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <span className="inline-block w-3 rounded-full" style={{ height: '2px', background: MIN_COLOR }} />
          Minimum payment (~2% balance)
        </span>
      </div>

      <div ref={chartRef}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(25% 0.02 260)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
            axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
            tickLine={false}
            interval={xTickInterval}
            label={{ value: 'Month', position: 'insideBottom', offset: -8, fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fill: 'oklch(55% 0.01 260)', fontSize: 11 }}
            axisLine={{ stroke: 'oklch(25% 0.02 260)' }}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(v: unknown, name: string) => [cur.format(v as number), name === 'user' ? 'Your payment' : 'Minimum payment']}
            contentStyle={{
              background: 'oklch(17% 0.025 260)',
              border: '1px solid oklch(25% 0.02 260)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'oklch(90% 0.01 260)',
            }}
            labelStyle={{ color: 'oklch(90% 0.01 260)', marginBottom: '4px' }}
            itemStyle={{ color: 'oklch(90% 0.01 260)' }}
            labelFormatter={(v: unknown) => `Month ${v}`}
          />
          <Legend wrapperStyle={{ display: 'none' }} />
          <Line
            type="monotone"
            dataKey="user"
            stroke={USER_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="minimum"
            stroke={MIN_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            strokeDasharray="6 3"
          />
        </LineChart>
      </ResponsiveContainer>
      </div>

      {/* 3-col insight row */}
      <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-lg mt-2">
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Interest saved</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-success-emerald">
            {cur.format(result.interestSaved)}
          </p>
          <p className="text-label-sm text-on-surface-variant">vs. minimum payments</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Months faster</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-primary">
            {result.minPayoffMonths - result.payoffMonths}
          </p>
          <p className="text-label-sm text-on-surface-variant">than minimum payment</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant mb-1">Min. payoff time</p>
          <p className="text-headline-md font-bold font-mono-data tabular-nums text-on-surface">
            {result.minPayoffMonths} mo
          </p>
          <p className="text-label-sm text-on-surface-variant">paying only minimums</p>
        </div>
      </div>
    </div>
  );
}
