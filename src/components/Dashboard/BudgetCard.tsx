import { useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import type { DashboardBudget } from '../../lib/dashboard';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const SLICES = [
  { key: 'housing',       label: 'Housing',        color: '#818cf8' },
  { key: 'transportation',label: 'Transportation',  color: '#fbbf24' },
  { key: 'food',          label: 'Food & Dining',   color: '#34d399' },
  { key: 'utilities',     label: 'Utilities',       color: '#22d3ee' },
  { key: 'subscriptions', label: 'Subscriptions',   color: '#c084fc' },
  { key: 'debtPayments',  label: 'Debt Payments',   color: '#fb7185' },
  { key: 'other',         label: 'Other',           color: '#94a3b8' },
] as const;

interface RatioBarProps {
  label: string;
  hint: string;
  pct: number;
  target: string;
  isGood: boolean;
  inverse?: boolean;
}

function RatioBar({ label, hint, pct, target, isGood }: RatioBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-label-sm font-medium text-on-surface">{label}</span>
          <span className="text-label-sm text-on-surface-variant ml-1.5">{hint}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-label-sm font-mono-data text-on-surface tabular-nums">
            {Math.round(pct)}%
          </span>
          <span className="text-label-sm text-on-surface-variant">target {target}</span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '14px', color: isGood ? 'var(--color-success-emerald)' : 'var(--color-error)' }}
          >
            {isGood ? 'check_circle' : 'warning'}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(Math.max(pct, 1), 100)}%`,
            background: isGood ? 'var(--color-success-emerald)' : 'var(--color-error)',
          }}
        />
      </div>
    </div>
  );
}

interface BudgetCardProps {
  data: DashboardBudget;
  onEdit: () => void;
}

export function BudgetCard({ data, onEdit }: BudgetCardProps) {
  const [activeSlice, setActiveSlice] = useState<{ key: string; label: string; value: number; color: string } | null>(null);

  const totalIncome = data.monthlyTakeHome + data.monthlySideIncome;
  const totalExpenses =
    data.housing + data.transportation + data.food + data.utilities +
    data.subscriptions + data.debtPayments + data.other;
  const cashFlow = totalIncome - totalExpenses - data.savings;
  const savingsRate = totalIncome > 0 ? (data.savings / totalIncome) * 100 : 0;

  const needsTotal = data.housing + data.transportation + data.food + data.utilities + data.debtPayments;
  const wantsTotal = data.subscriptions + data.other;
  const needsPct = totalIncome > 0 ? (needsTotal / totalIncome) * 100 : 0;
  const wantsPct = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0;
  const savingsPct = totalIncome > 0 ? (data.savings / totalIncome) * 100 : 0;

  const chartSlices = SLICES
    .map(s => ({ ...s, value: data[s.key as keyof DashboardBudget] as number }))
    .filter(s => s.value > 0);

  const fmtUpdated = new Date(data.updatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="glass-card p-lg rounded-xl mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: 'var(--color-primary-accent)' }}
          >
            account_balance_wallet
          </span>
          <h2 className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">
            Budget Overview
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label-sm text-on-surface-variant hidden sm:block">{fmtUpdated}</span>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit budget"
            className="flex items-center gap-1 text-label-md text-primary-accent hover:underline"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
            Edit
          </button>
        </div>
      </div>

      {/* Main layout: income+cashflow | donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-budget-layout>
        {/* Left: income breakdown + cash flow */}
        <div className="flex flex-col gap-4">
          {/* Income vs Expenses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-label-sm text-on-surface-variant mb-1">Monthly Income</p>
              <p className="text-headline-md font-bold font-mono-data text-on-surface">
                {cur.format(totalIncome)}
              </p>
              <div className="mt-2 flex flex-col gap-0.5">
                <p className="text-label-sm text-on-surface-variant">
                  Primary: {cur.format(data.monthlyTakeHome)}
                </p>
                {data.monthlySideIncome > 0 && (
                  <p className="text-label-sm text-on-surface-variant">
                    Side income: {cur.format(data.monthlySideIncome)}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant mb-1">Monthly Expenses</p>
              <p className="text-headline-md font-bold font-mono-data text-on-surface">
                {cur.format(totalExpenses)}
              </p>
              {totalIncome > 0 && (
                <p className="text-label-sm text-on-surface-variant mt-2">
                  {Math.round((totalExpenses / totalIncome) * 100)}% of income
                </p>
              )}
            </div>
          </div>

          {/* Cash flow + savings rate summary box */}
          <div className="rounded-xl bg-surface-container p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">Monthly cash flow</span>
              <span
                className="text-body-sm font-semibold font-mono-data tabular-nums"
                style={{ color: cashFlow >= 0 ? 'var(--color-success-emerald)' : 'var(--color-error)' }}
              >
                {cashFlow >= 0 ? '+' : ''}{cur.format(cashFlow)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">Savings rate</span>
              <span
                className="text-body-sm font-semibold font-mono-data tabular-nums"
                style={{ color: savingsRate >= 20 ? 'var(--color-success-emerald)' : 'var(--color-on-surface)' }}
              >
                {savingsRate.toFixed(1)}%
              </span>
            </div>
            {data.savings > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">Monthly savings</span>
                <span className="text-body-sm font-mono-data tabular-nums text-on-surface">
                  {cur.format(data.savings)}
                </span>
              </div>
            )}
          </div>

          {/* 50/30/20 guide */}
          <div className="flex flex-col gap-3 pt-2">
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
              50/30/20 Budget Guide
            </p>
            <RatioBar
              label="Needs"
              hint="housing, food, utilities, transport, debt"
              pct={needsPct}
              target="≤50%"
              isGood={needsPct <= 50}
            />
            <RatioBar
              label="Wants"
              hint="subscriptions, other"
              pct={wantsPct}
              target="≤30%"
              isGood={wantsPct <= 30}
            />
            <RatioBar
              label="Savings"
              hint=""
              pct={savingsPct}
              target="≥20%"
              isGood={savingsPct >= 20}
            />
          </div>
        </div>

        {/* Right: donut chart + legend */}
        <div className="flex flex-col gap-4">
          {chartSlices.length > 0 ? (
            <>
              {/* Donut — fixed 200×200 to avoid ResponsiveContainer sizing bugs in print */}
              <div className="relative h-[200px] flex justify-center">
                <PieChart width={200} height={200}>
                  <Pie
                    data={chartSlices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={88}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#0f141a"
                    isAnimationActive={false}
                    onMouseEnter={(_, i) => setActiveSlice(chartSlices[i])}
                    onMouseLeave={() => setActiveSlice(null)}
                  >
                    {chartSlices.map((slice, i) => (
                      <Cell
                        key={i}
                        fill={slice.color}
                        opacity={activeSlice && activeSlice.key !== slice.key ? 0.4 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="flex flex-col items-center justify-center rounded-full text-center"
                    style={{ width: 116, height: 116, background: 'var(--color-surface)' }}
                  >
                    <p
                      className="text-headline-md font-bold font-mono-data leading-none transition-colors duration-150"
                      style={{ color: activeSlice ? activeSlice.color : 'var(--color-on-surface)' }}
                    >
                      {cur.format(activeSlice ? activeSlice.value : totalExpenses)}
                    </p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                      {activeSlice ? activeSlice.label : 'Spending'}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">per month</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {chartSlices.map(slice => (
                  <div key={slice.key} className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: slice.color }}
                    />
                    <span className="text-label-sm text-on-surface-variant truncate">{slice.label}</span>
                    <span className="text-label-sm font-mono-data text-on-surface ml-auto tabular-nums shrink-0">
                      {totalExpenses > 0 ? Math.round((slice.value / totalExpenses) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-on-surface-variant text-body-sm">
              Add expenses above to see the breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state card shown when no budget is set up ──────────────────────────

interface BudgetEmptyCardProps {
  onSetUp: () => void;
}

export function BudgetEmptyCard({ onSetUp }: BudgetEmptyCardProps) {
  return (
    <div className="glass-card p-lg rounded-xl mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '20px', color: 'var(--color-primary-accent)' }}
        >
          account_balance_wallet
        </span>
        <h2 className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">
          Budget Overview
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 py-4">
        <div className="flex-1">
          <p className="text-headline-md font-semibold text-on-surface mb-2">
            See your full financial picture
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Enter your monthly income and expenses to see where your money goes,
            your savings rate, and how your budget compares to the 50/30/20 guideline.
          </p>
        </div>
        <button
          type="button"
          onClick={onSetUp}
          className="shrink-0 bg-primary-container text-on-primary-container px-lg py-sm rounded-xl text-label-md font-semibold hover:brightness-110 transition-all active:scale-95 flex items-center gap-1.5"
        >
          Set up your budget
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
