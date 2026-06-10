import { useState, useEffect } from 'react';
import { loadDashboard, clearDashboard } from '../../lib/dashboard';
import { DashboardSection } from './DashboardSection';
import { PrivacyBar } from './PrivacyBar';
import { BudgetCard, BudgetEmptyCard } from './BudgetCard';
import { DashboardTutorial, TUTORIAL_STORAGE_KEY } from './DashboardTutorial';
import {
  BudgetEditModal,
  NetWorthEditModal,
  HousingEditModal,
  DebtEditModal,
  IncomeEditModal,
  SavingsEditModal,
  GoalsEditModal,
} from './EditModals';

type ModalType = 'budget' | 'netWorth' | 'housing' | 'debt' | 'income' | 'savings' | 'goals' | null;

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const curHr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildCsv(data: ReturnType<typeof loadDashboard>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
  const row = (...cells: Array<string | number>) => rows.push(cells.map(c).join(','));
  const blank = () => rows.push('');
  const header = (title: string) => { blank(); row(title); };

  row('NestMath Dashboard Export', `Generated: ${today}`);

  if (data.budget) {
    const b = data.budget;
    const totalIncome = b.monthlyTakeHome + b.monthlySideIncome;
    const totalExpenses = b.housing + b.transportation + b.food + b.utilities + b.subscriptions + b.debtPayments + b.other;
    const cashFlow = totalIncome - totalExpenses - b.savings;
    header('MONTHLY BUDGET');
    row('Primary take-home pay', cur.format(b.monthlyTakeHome));
    if (b.monthlySideIncome > 0) row('Side income', cur.format(b.monthlySideIncome));
    row('Total monthly income', cur.format(totalIncome));
    blank();
    row('Housing', cur.format(b.housing));
    row('Transportation', cur.format(b.transportation));
    row('Groceries & dining', cur.format(b.food));
    row('Utilities', cur.format(b.utilities));
    row('Subscriptions', cur.format(b.subscriptions));
    row('Debt payments', cur.format(b.debtPayments));
    row('Other', cur.format(b.other));
    row('Total expenses', cur.format(totalExpenses));
    blank();
    row('Monthly savings', cur.format(b.savings));
    row('Monthly cash flow', (cashFlow >= 0 ? '+' : '') + cur.format(cashFlow));
    row('Savings rate', `${((b.savings / totalIncome) * 100).toFixed(1)}%`);
    blank();
    const needsPct = Math.round(((b.housing + b.transportation + b.food + b.utilities + b.debtPayments) / totalIncome) * 100);
    const wantsPct = Math.round(((b.subscriptions + b.other) / totalIncome) * 100);
    const savingsPct = Math.round((b.savings / totalIncome) * 100);
    row('50/30/20 — Needs', `${needsPct}% (target ≤50%)`);
    row('50/30/20 — Wants', `${wantsPct}% (target ≤30%)`);
    row('50/30/20 — Savings', `${savingsPct}% (target ≥20%)`);
  }

  if (data.netWorth) {
    header('NET WORTH');
    row('Total assets', cur.format(data.netWorth.totalAssets));
    row('Total liabilities', cur.format(data.netWorth.totalLiabilities));
    row('Net worth', cur.format(data.netWorth.netWorth));
  }

  if (data.housing) {
    header('HOUSING');
    row('Monthly housing cost', cur.format(data.housing.monthlyCost));
    if (data.housing.equity > 0) row('Current equity', cur.format(data.housing.equity));
    if (data.housing.breakEvenYear) row('Buy break-even year', `Year ${data.housing.breakEvenYear}`);
  }

  if (data.debt) {
    header('DEBT');
    row('Total debt balance', cur.format(data.debt.totalDebt));
    row('Monthly payment', cur.format(data.debt.monthlyPayment));
    if (data.debt.monthsToDebtFree > 0) {
      row('Debt-free date', fmtPayoffDate(data.debt.monthsToDebtFree));
    }
  }

  if (data.income) {
    header('INCOME');
    row('Annual take-home', cur.format(data.income.annualTakeHome));
    row('Monthly take-home', cur.format(Math.round(data.income.annualTakeHome / 12)));
    if (data.income.effectiveHourlyRate > 0) {
      row('Effective hourly rate', `$${data.income.effectiveHourlyRate.toFixed(2)}/hr`);
    }
  }

  if (data.savings) {
    header('SAVINGS & GROWTH');
    row('Projected retirement balance', cur.format(data.savings.projectedBalance));
    row('Years to retirement', data.savings.yearsToRetirement);
    row('Estimated monthly income (4% rule)', cur.format(data.savings.estimatedMonthlyIncome));
  }

  if (data.goals) {
    header('EMERGENCY FUND');
    row('Months covered', data.goals.monthsCoverage.toFixed(1));
    row('3-month target', cur.format(data.goals.threeMonthTarget));
    row('6-month target', cur.format(data.goals.sixMonthTarget));
  }

  return rows.join('\n');
}

function fmtPayoffDate(monthsFromNow: number): string {
  if (monthsFromNow <= 0) return 'now';
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ─── Empty section card (shown when a section has no data yet) ────────────────

interface EmptySectionCardProps {
  icon: string;
  title: string;
  onEdit: () => void;
}

function EmptySectionCard({ icon, title, onEdit }: EmptySectionCardProps) {
  return (
    <div className="glass-card p-lg rounded-xl flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined shrink-0"
          style={{ fontSize: '20px', color: 'var(--color-on-surface-variant)' }}
        >
          {icon}
        </span>
        <h2 className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="flex-1 flex flex-col items-start justify-center gap-2 py-2">
        <p className="text-headline-lg font-bold font-mono-data text-on-surface-variant/40">—</p>
        <p className="text-label-sm text-on-surface-variant">Not tracked yet</p>
      </div>
      <div className="pt-2 border-t border-border-subtle mt-auto">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-label-md text-primary-accent hover:underline"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_circle</span>
          Add data
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function Dashboard() {
  const [data, setData] = useState(() => loadDashboard());
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [tutorialActive, setTutorialActive] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
      setTutorialActive(true);
    }
  }, []);

  function reload() {
    setData(loadDashboard());
  }

  function handleClear() {
    clearDashboard();
    setData(loadDashboard());
  }

  function handleStopTutorial() {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
    setTutorialActive(false);
  }

  const open = (modal: ModalType) => () => setOpenModal(modal);
  const close = () => setOpenModal(null);

  function handleExportCsv() {
    const csv = buildCsv(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nestmath-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Verdict strings ───────────────────────────────────────────────────────

  const netWorthVerdict = data.netWorth
    ? data.netWorth.netWorth >= 0
      ? `Total assets: ${cur.format(data.netWorth.totalAssets)} · Total liabilities: ${cur.format(data.netWorth.totalLiabilities)}`
      : `Your liabilities exceed your assets by ${cur.format(Math.abs(data.netWorth.netWorth))}. Focus on reducing high-interest debt.`
    : '';

  const housingVerdict = data.housing
    ? data.housing.breakEvenYear
      ? `You break even on buying in Year ${data.housing.breakEvenYear}. ${data.housing.equity > 0 ? `Current equity: ${cur.format(data.housing.equity)}.` : ''}`
      : data.housing.equity > 0
        ? `Current equity: ${cur.format(data.housing.equity)}.`
        : 'Track your monthly housing cost and equity here.'
    : '';

  const debtVerdict = data.debt
    ? `Debt-free by ${fmtPayoffDate(data.debt.monthsToDebtFree)} at ${cur.format(data.debt.monthlyPayment)}/mo.`
    : '';

  const savingsVerdict = data.savings
    ? `On track for ${cur.format(data.savings.estimatedMonthlyIncome)}/mo estimated retirement income (4% rule, inflation-adjusted).`
    : '';

  const incomeVerdict = data.income
    ? `Annual adjusted take-home: ${cur.format(data.income.annualTakeHome)}. True rate after taxes, commute, and expenses.`
    : '';

  const goalsCoverage = data.goals?.monthsCoverage ?? 0;
  const goalsVerdict = data.goals
    ? goalsCoverage >= 6
      ? `Emergency fund fully funded: ${goalsCoverage.toFixed(1)} months covered.`
      : goalsCoverage >= 3
        ? `Partially funded: ${goalsCoverage.toFixed(1)} of 6 months covered. 3-month goal reached.`
        : `Under-funded: ${goalsCoverage.toFixed(1)} month${goalsCoverage !== 1 ? 's' : ''} covered. Target: ${cur.format(data.goals!.threeMonthTarget)} for 3 months.`
    : '';
  const coveragePct = Math.min((goalsCoverage / 6) * 100, 100);

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-12">
      {/* Page title + export buttons */}
      <div className="pt-[32px] pb-[8px] flex items-start justify-between gap-4" data-print="hide">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Dashboard</h1>
          <p className="text-body-md text-on-surface-variant mt-[8px]">
            Income, spending, debt, savings, and net worth in one place.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          <button
            type="button"
            onClick={() => setTutorialActive(true)}
            className="flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-high border border-border-subtle"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>help</span>
            Tutorial
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-high border border-border-subtle"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
            CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-high border border-border-subtle"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>picture_as_pdf</span>
            PDF
          </button>
        </div>
      </div>

      <PrivacyBar onClear={handleClear} />

      {/* Budget card — always shown at top */}
      <div data-tutorial="budget">
        {data.budget ? (
          <BudgetCard data={data.budget} onEdit={open('budget')} />
        ) : (
          <BudgetEmptyCard onSetUp={open('budget')} />
        )}
      </div>

      {/* Section grid — always rendered, empty cards shown for missing data */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Net Worth */}
        <div data-tutorial="netWorth" style={{ display: 'contents' }}>
          {data.netWorth ? (
            <DashboardSection
              icon="account_balance"
              title="Net Worth"
              headlineStat={cur.format(data.netWorth.netWorth)}
              headlineLabel="Total net worth"
              verdict={netWorthVerdict}
              linkHref="/net-worth"
              linkLabel="Create Detailed Breakdown"
              accent={data.netWorth.netWorth >= 0 ? 'success' : 'error'}
              updatedAt={data.netWorth.updatedAt}
              onEdit={open('netWorth')}
            >
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-label-sm">
                  <span className="text-on-surface-variant w-16 shrink-0">Assets</span>
                  <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full rounded-full w-full" style={{ background: 'var(--color-success-emerald)' }} />
                  </div>
                  <span className="font-mono-data text-on-surface tabular-nums text-right w-16 shrink-0">{cur.format(data.netWorth.totalAssets)}</span>
                </div>
                {data.netWorth.totalLiabilities > 0 && (
                  <div className="flex items-center gap-2 text-label-sm">
                    <span className="text-on-surface-variant w-16 shrink-0">Liabilities</span>
                    <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${data.netWorth.totalAssets > 0 ? Math.min((data.netWorth.totalLiabilities / data.netWorth.totalAssets) * 100, 100) : 100}%`,
                          background: 'var(--color-error)',
                        }}
                      />
                    </div>
                    <span className="font-mono-data text-on-surface tabular-nums text-right w-16 shrink-0">{cur.format(data.netWorth.totalLiabilities)}</span>
                  </div>
                )}
              </div>
            </DashboardSection>
          ) : (
            <EmptySectionCard icon="account_balance" title="Net Worth" onEdit={open('netWorth')} />
          )}
        </div>

        {/* Housing */}
        <div data-tutorial="housing" style={{ display: 'contents' }}>
          {data.housing ? (
            <DashboardSection
              icon="home"
              title="Housing"
              headlineStat={cur.format(data.housing.monthlyCost)}
              headlineLabel="Monthly housing cost"
              verdict={housingVerdict}
              linkHref="/buy-vs-rent"
              linkLabel="Create Detailed Breakdown"
              updatedAt={data.housing.updatedAt}
              onEdit={open('housing')}
            >
              {data.housing.breakEvenYear ? (
                <div>
                  <div className="relative h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-r-full"
                      style={{
                        left: `${Math.min((data.housing.breakEvenYear / 30) * 100, 100)}%`,
                        right: 0,
                        background: 'var(--color-success-emerald)',
                        opacity: 0.45,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-label-sm text-on-surface-variant mt-1">
                    <span>Yr 1</span>
                    <span className="text-primary-accent font-mono-data">Break-even Yr {data.housing.breakEvenYear}</span>
                    <span>Yr 30</span>
                  </div>
                </div>
              ) : null}
            </DashboardSection>
          ) : (
            <EmptySectionCard icon="home" title="Housing" onEdit={open('housing')} />
          )}
        </div>

        {/* Debt */}
        <div data-tutorial="debt" style={{ display: 'contents' }}>
          {data.debt ? (
            <DashboardSection
              icon="credit_card"
              title="Debt"
              headlineStat={cur.format(data.debt.totalDebt)}
              headlineLabel="Total debt balance"
              verdict={debtVerdict}
              linkHref="/debt-payoff-planner"
              linkLabel="Create Detailed Breakdown"
              accent="error"
              updatedAt={data.debt.updatedAt}
              onEdit={open('debt')}
            >
              {data.debt.totalDebt > 0 && (
                <div>
                  <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                    <span>Annual payoff rate</span>
                    <span className="font-mono-data">{Math.round(Math.min((data.debt.monthlyPayment * 12 / data.debt.totalDebt) * 100, 100))}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((data.debt.monthlyPayment * 12 / data.debt.totalDebt) * 100, 100)}%`,
                        background: 'var(--color-error)',
                      }}
                    />
                  </div>
                  <p className="text-label-sm text-on-surface-variant mt-1">
                    {cur.format(data.debt.monthlyPayment * 12)}/yr against {cur.format(data.debt.totalDebt)} balance
                  </p>
                </div>
              )}
            </DashboardSection>
          ) : (
            <EmptySectionCard icon="credit_card" title="Debt" onEdit={open('debt')} />
          )}
        </div>

        {/* Income */}
        <div data-tutorial="income" style={{ display: 'contents' }}>
          {data.income ? (
            <DashboardSection
              icon="schedule"
              title="Income"
              headlineStat={`${curHr.format(data.income.effectiveHourlyRate)}/hr`}
              headlineLabel="Effective hourly rate (net)"
              verdict={incomeVerdict}
              linkHref="/effective-hourly"
              linkLabel="Create Detailed Breakdown"
              updatedAt={data.income.updatedAt}
              onEdit={open('income')}
            >
              <div className="space-y-1.5 pt-1">
                {([
                  ['Annual', data.income.annualTakeHome],
                  ['Monthly', Math.round(data.income.annualTakeHome / 12)],
                  ['Weekly', Math.round(data.income.annualTakeHome / 52)],
                ] as [string, number][]).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-2 text-label-sm">
                    <span className="text-on-surface-variant w-14 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-accent"
                        style={{ width: `${(value / data.income!.annualTakeHome) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono-data text-on-surface tabular-nums text-right w-16 shrink-0">{cur.format(value)}</span>
                  </div>
                ))}
              </div>
            </DashboardSection>
          ) : (
            <EmptySectionCard icon="schedule" title="Income" onEdit={open('income')} />
          )}
        </div>

        {/* Savings & Growth */}
        <div data-tutorial="savings" style={{ display: 'contents' }}>
          {data.savings ? (
            <DashboardSection
              icon="trending_up"
              title="Savings & Growth"
              headlineStat={cur.format(data.savings.projectedBalance)}
              headlineLabel="Projected retirement balance"
              verdict={savingsVerdict}
              linkHref="/retirement-projector"
              linkLabel="Create Detailed Breakdown"
              accent="success"
              updatedAt={data.savings.updatedAt}
              onEdit={open('savings')}
            >
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 text-label-sm">
                  <span className="text-on-surface-variant w-16 shrink-0">Nominal</span>
                  <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full rounded-full w-full" style={{ background: 'var(--color-success-emerald)' }} />
                  </div>
                  <span className="font-mono-data text-on-surface tabular-nums text-right w-16 shrink-0">{cur.format(data.savings.projectedBalance)}</span>
                </div>
                <div className="flex items-center gap-2 text-label-sm">
                  <span className="text-on-surface-variant w-16 shrink-0">Real (adj)</span>
                  <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-accent"
                      style={{
                        width: `${data.savings.projectedBalance > 0 ? (data.savings.inflationAdjustedBalance / data.savings.projectedBalance) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono-data text-on-surface tabular-nums text-right w-16 shrink-0">{cur.format(data.savings.inflationAdjustedBalance)}</span>
                </div>
              </div>
            </DashboardSection>
          ) : (
            <EmptySectionCard icon="trending_up" title="Savings & Growth" onEdit={open('savings')} />
          )}
        </div>

        {/* Emergency Fund / Goals */}
        <div data-tutorial="goals" style={{ display: 'contents' }}>
          {data.goals ? (
            <DashboardSection
              icon="savings"
              title="Emergency Fund"
              headlineStat={`${goalsCoverage.toFixed(1)} mo`}
              headlineLabel="Emergency fund coverage"
              verdict={goalsVerdict}
              linkHref="/emergency-fund"
              linkLabel="Create Detailed Breakdown"
              accent={goalsCoverage >= 3 ? 'success' : 'error'}
              updatedAt={data.goals.updatedAt}
              onEdit={open('goals')}
            >
              <div>
                <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                  <span>Progress to 6-month goal</span>
                  <span>{Math.round(coveragePct)}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${coveragePct}%`,
                      background: goalsCoverage >= 3 ? 'var(--color-success-emerald)' : 'var(--color-error)',
                    }}
                  />
                </div>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  3-mo target: {cur.format(data.goals.threeMonthTarget)} · 6-mo target: {cur.format(data.goals.sixMonthTarget)}
                </p>
              </div>
            </DashboardSection>
          ) : (
            <EmptySectionCard icon="savings" title="Emergency Fund" onEdit={open('goals')} />
          )}
        </div>

      </div>

      {/* Modals */}
      {openModal === 'budget' && (
        <BudgetEditModal initial={data.budget} onClose={close} onSaved={reload} />
      )}
      {openModal === 'netWorth' && (
        <NetWorthEditModal initial={data.netWorth} onClose={close} onSaved={reload} />
      )}
      {openModal === 'housing' && (
        <HousingEditModal initial={data.housing} onClose={close} onSaved={reload} />
      )}
      {openModal === 'debt' && (
        <DebtEditModal initial={data.debt} onClose={close} onSaved={reload} />
      )}
      {openModal === 'income' && (
        <IncomeEditModal initial={data.income} onClose={close} onSaved={reload} />
      )}
      {openModal === 'savings' && (
        <SavingsEditModal initial={data.savings} onClose={close} onSaved={reload} />
      )}
      {openModal === 'goals' && (
        <GoalsEditModal initial={data.goals} onClose={close} onSaved={reload} />
      )}

      <DashboardTutorial active={tutorialActive} onStop={handleStopTutorial} />
    </div>
  );
}
