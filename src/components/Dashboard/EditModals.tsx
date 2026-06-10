import { useState, type ReactNode } from 'react';
import { saveToDashboard } from '../../lib/dashboard';
import type {
  DashboardNetWorth,
  DashboardHousing,
  DashboardDebt,
  DashboardSavings,
  DashboardIncome,
  DashboardGoals,
  DashboardBudget,
} from '../../lib/dashboard';
import { QuickEditModal } from './QuickEditModal';

function Field({
  label,
  hint,
  value,
  onChange,
  prefix = '$',
  suffix,
  type = 'number',
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  type?: 'number' | 'text';
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-label-sm text-on-surface-variant">{label}</label>
      {hint && <p className="text-label-sm text-on-surface-variant/70 -mt-0.5">{hint}</p>}
      <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-container px-3 py-2 focus-within:border-primary-accent transition-colors">
        {prefix && <span className="text-on-surface-variant text-body-sm select-none">{prefix}</span>}
        <input
          type={type}
          min={type === 'number' ? '0' : undefined}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent outline-none text-body-sm text-right tabular-nums text-on-surface"
        />
        {suffix && <span className="text-on-surface-variant text-body-sm select-none ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest pt-2 first:pt-0">
      {children}
    </p>
  );
}

// ─── Budget ───────────────────────────────────────────────────────────────────

interface BudgetEditModalProps {
  initial: DashboardBudget | null;
  onClose: () => void;
  onSaved: () => void;
}

export function BudgetEditModal({ initial, onClose, onSaved }: BudgetEditModalProps) {
  const s = (n?: number) => (n != null && n !== 0 ? String(parseFloat(n.toFixed(2))) : '');

  const [takeHome, setTakeHome] = useState(s(initial?.monthlyTakeHome));
  const [sideIncome, setSideIncome] = useState(s(initial?.monthlySideIncome));
  const [housing, setHousing] = useState(s(initial?.housing));
  const [transportation, setTransportation] = useState(s(initial?.transportation));
  const [food, setFood] = useState(s(initial?.food));
  const [utilities, setUtilities] = useState(s(initial?.utilities));
  const [subscriptions, setSubscriptions] = useState(s(initial?.subscriptions));
  const [debtPayments, setDebtPayments] = useState(s(initial?.debtPayments));
  const [savings, setSavings] = useState(s(initial?.savings));
  const [other, setOther] = useState(s(initial?.other));

  function handleSave() {
    const data: DashboardBudget = {
      monthlyTakeHome: parseFloat(takeHome) || 0,
      monthlySideIncome: parseFloat(sideIncome) || 0,
      housing: parseFloat(housing) || 0,
      transportation: parseFloat(transportation) || 0,
      food: parseFloat(food) || 0,
      utilities: parseFloat(utilities) || 0,
      subscriptions: parseFloat(subscriptions) || 0,
      debtPayments: parseFloat(debtPayments) || 0,
      savings: parseFloat(savings) || 0,
      other: parseFloat(other) || 0,
      updatedAt: new Date().toISOString(),
    };
    saveToDashboard('nm_budget', data as unknown as Record<string, unknown>);
    onSaved();
    onClose();
  }

  return (
    <QuickEditModal
      title="Monthly Budget"
      subtitle="Enter your typical monthly amounts. We'll handle the math."
      onClose={onClose}
      onSave={handleSave}
    >
      <SectionLabel>Income</SectionLabel>
      <Field label="Primary take-home pay" hint="After taxes and deductions" value={takeHome} onChange={setTakeHome} />
      <Field label="Side income / freelance" hint="After self-employment taxes (optional)" value={sideIncome} onChange={setSideIncome} />

      <SectionLabel>Monthly Expenses</SectionLabel>
      <Field label="Housing" hint="Rent or mortgage payment" value={housing} onChange={setHousing} />
      <Field label="Transportation" hint="Car payment, gas, insurance" value={transportation} onChange={setTransportation} />
      <Field label="Groceries & dining" value={food} onChange={setFood} />
      <Field label="Utilities" hint="Electric, internet, phone" value={utilities} onChange={setUtilities} />
      <Field label="Subscriptions & memberships" hint="Streaming, gym, etc." value={subscriptions} onChange={setSubscriptions} />
      <Field label="Debt payments" hint="Minimum payments on all debts" value={debtPayments} onChange={setDebtPayments} />
      <Field label="Other / miscellaneous" value={other} onChange={setOther} />

      <SectionLabel>Savings</SectionLabel>
      <Field label="Monthly savings & investments" hint="401(k), brokerage, HYSA contributions" value={savings} onChange={setSavings} />
    </QuickEditModal>
  );
}

// ─── Net Worth ────────────────────────────────────────────────────────────────

interface NetWorthEditModalProps {
  initial: DashboardNetWorth | null;
  onClose: () => void;
  onSaved: () => void;
}

export function NetWorthEditModal({ initial, onClose, onSaved }: NetWorthEditModalProps) {
  const s = (n?: number) => (n != null && n !== 0 ? String(parseFloat(n.toFixed(2))) : '');
  const [assets, setAssets] = useState(s(initial?.totalAssets));
  const [liabilities, setLiabilities] = useState(s(initial?.totalLiabilities));

  function handleSave() {
    const a = parseFloat(assets) || 0;
    const l = parseFloat(liabilities) || 0;
    saveToDashboard('nm_networth', {
      totalAssets: a,
      totalLiabilities: l,
      netWorth: a - l,
      updatedAt: new Date().toISOString(),
    });
    onSaved();
    onClose();
  }

  return (
    <QuickEditModal
      title="Net Worth"
      subtitle="What you own minus what you owe."
      onClose={onClose}
      onSave={handleSave}
      fullBreakdownHref="/net-worth"
      fullBreakdownLabel="Create Detailed Breakdown: Net Worth Calculator"
    >
      <Field
        label="Total assets"
        hint="Checking, savings, investments, home value, car value, etc."
        value={assets}
        onChange={setAssets}
      />
      <Field
        label="Total liabilities"
        hint="Mortgage, car loans, credit cards, student loans, etc."
        value={liabilities}
        onChange={setLiabilities}
      />
    </QuickEditModal>
  );
}

// ─── Housing ──────────────────────────────────────────────────────────────────

interface HousingEditModalProps {
  initial: DashboardHousing | null;
  onClose: () => void;
  onSaved: () => void;
}

export function HousingEditModal({ initial, onClose, onSaved }: HousingEditModalProps) {
  const s = (n?: number) => (n != null && n !== 0 ? String(parseFloat(n.toFixed(2))) : '');
  const [monthlyCost, setMonthlyCost] = useState(s(initial?.monthlyCost));
  const [equity, setEquity] = useState(s(initial?.equity));

  function handleSave() {
    saveToDashboard('nm_housing', {
      monthlyCost: parseFloat(monthlyCost) || 0,
      equity: parseFloat(equity) || 0,
      breakEvenYear: initial?.breakEvenYear ?? null,
      updatedAt: new Date().toISOString(),
    });
    onSaved();
    onClose();
  }

  return (
    <QuickEditModal
      title="Housing"
      subtitle="Your monthly housing cost and current equity."
      onClose={onClose}
      onSave={handleSave}
      fullBreakdownHref="/buy-vs-rent"
      fullBreakdownLabel="Create Detailed Breakdown: Buy vs. Rent"
    >
      <Field
        label="Monthly housing cost"
        hint="Rent or mortgage payment (including taxes & insurance)"
        value={monthlyCost}
        onChange={setMonthlyCost}
      />
      <Field
        label="Current home equity"
        hint="Home value minus remaining mortgage balance (0 if renting)"
        value={equity}
        onChange={setEquity}
      />
    </QuickEditModal>
  );
}

// ─── Debt ─────────────────────────────────────────────────────────────────────

interface DebtEditModalProps {
  initial: DashboardDebt | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DebtEditModal({ initial, onClose, onSaved }: DebtEditModalProps) {
  const s = (n?: number) => (n != null && n !== 0 ? String(parseFloat(n.toFixed(2))) : '');
  const [totalDebt, setTotalDebt] = useState(s(initial?.totalDebt));
  const [monthlyPayment, setMonthlyPayment] = useState(s(initial?.monthlyPayment));

  function handleSave() {
    const debt = parseFloat(totalDebt) || 0;
    const payment = parseFloat(monthlyPayment) || 0;
    const monthsToDebtFree = payment > 0 ? Math.ceil(debt / payment) : 0;

    saveToDashboard('nm_debt', {
      totalDebt: debt,
      monthlyPayment: payment,
      monthsToDebtFree,
      updatedAt: new Date().toISOString(),
    });
    onSaved();
    onClose();
  }

  return (
    <QuickEditModal
      title="Debt"
      subtitle="Your total debt balance and what you're paying each month."
      onClose={onClose}
      onSave={handleSave}
      fullBreakdownHref="/debt-payoff-planner"
      fullBreakdownLabel="Create Detailed Breakdown: Debt Payoff Planner"
    >
      <Field
        label="Total debt balance"
        hint="Credit cards, auto loans, personal loans, student loans"
        value={totalDebt}
        onChange={setTotalDebt}
      />
      <Field
        label="Monthly payment"
        hint="What you're currently paying across all debts each month"
        value={monthlyPayment}
        onChange={setMonthlyPayment}
      />
    </QuickEditModal>
  );
}

// ─── Income ───────────────────────────────────────────────────────────────────

interface IncomeEditModalProps {
  initial: DashboardIncome | null;
  onClose: () => void;
  onSaved: () => void;
}

export function IncomeEditModal({ initial, onClose, onSaved }: IncomeEditModalProps) {
  const s = (n?: number) => (n != null && n !== 0 ? String(parseFloat(n.toFixed(2))) : '');
  const [monthlyTakeHome, setMonthlyTakeHome] = useState(
    initial?.annualTakeHome ? s(Math.round(initial.annualTakeHome / 12)) : '',
  );
  const [hourlyRate, setHourlyRate] = useState(s(initial?.effectiveHourlyRate));

  function handleSave() {
    const monthly = parseFloat(monthlyTakeHome) || 0;
    const hourly = parseFloat(hourlyRate) || 0;

    saveToDashboard('nm_income', {
      effectiveHourlyRate: hourly,
      annualTakeHome: monthly * 12,
      updatedAt: new Date().toISOString(),
    });
    onSaved();
    onClose();
  }

  return (
    <QuickEditModal
      title="Income"
      subtitle="Your take-home pay after all taxes and deductions."
      onClose={onClose}
      onSave={handleSave}
      fullBreakdownHref="/effective-hourly"
      fullBreakdownLabel="Create Detailed Breakdown: Effective Hourly Rate"
    >
      <Field
        label="Monthly take-home pay"
        hint="Net amount deposited after taxes, 401(k), health insurance, etc."
        value={monthlyTakeHome}
        onChange={setMonthlyTakeHome}
      />
      <Field
        label="Effective hourly rate (optional)"
        hint="What you actually earn per hour after commute and unpaid time"
        value={hourlyRate}
        onChange={setHourlyRate}
        suffix="/hr"
      />
    </QuickEditModal>
  );
}

// ─── Savings & Growth ─────────────────────────────────────────────────────────

interface SavingsEditModalProps {
  initial: DashboardSavings | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SavingsEditModal({ initial, onClose, onSaved }: SavingsEditModalProps) {
  const s = (n?: number) => (n != null && n !== 0 ? String(parseFloat(n.toFixed(2))) : '');
  const [projectedBalance, setProjectedBalance] = useState(s(initial?.projectedBalance));
  const [yearsToRetirement, setYearsToRetirement] = useState(s(initial?.yearsToRetirement));

  function handleSave() {
    const balance = parseFloat(projectedBalance) || 0;
    const years = parseFloat(yearsToRetirement) || 0;
    const monthlyIncome = Math.round((balance * 0.04) / 12);

    saveToDashboard('nm_savings', {
      projectedBalance: balance,
      inflationAdjustedBalance: balance,
      estimatedMonthlyIncome: monthlyIncome,
      yearsToRetirement: years,
      updatedAt: new Date().toISOString(),
    });
    onSaved();
    onClose();
  }

  return (
    <QuickEditModal
      title="Savings & Growth"
      subtitle="Your projected retirement balance and timeline."
      onClose={onClose}
      onSave={handleSave}
      fullBreakdownHref="/retirement-projector"
      fullBreakdownLabel="Create Detailed Breakdown: 401(k) Projector"
    >
      <Field
        label="Projected retirement balance"
        hint="Total expected in all retirement accounts at retirement age"
        value={projectedBalance}
        onChange={setProjectedBalance}
      />
      <Field
        label="Years to retirement"
        hint="How many years until you plan to retire"
        value={yearsToRetirement}
        onChange={setYearsToRetirement}
        prefix=""
        suffix="yrs"
      />
    </QuickEditModal>
  );
}

// ─── Emergency Fund / Goals ───────────────────────────────────────────────────

interface GoalsEditModalProps {
  initial: DashboardGoals | null;
  onClose: () => void;
  onSaved: () => void;
}

export function GoalsEditModal({ initial, onClose, onSaved }: GoalsEditModalProps) {
  const s = (n?: number) => (n != null && n !== 0 ? String(parseFloat(n.toFixed(2))) : '');

  const initialMonthlyExpenses = initial?.threeMonthTarget
    ? Math.round(initial.threeMonthTarget / 3)
    : 0;

  const [monthlyExpenses, setMonthlyExpenses] = useState(s(initialMonthlyExpenses));
  const [currentSavings, setCurrentSavings] = useState(
    initial?.monthsCoverage && initialMonthlyExpenses
      ? s(Math.round(initial.monthsCoverage * initialMonthlyExpenses))
      : '',
  );

  function handleSave() {
    const expenses = parseFloat(monthlyExpenses) || 0;
    const savings = parseFloat(currentSavings) || 0;
    const monthsCoverage = expenses > 0 ? parseFloat((savings / expenses).toFixed(1)) : 0;
    const threeMonthTarget = expenses * 3;
    const sixMonthTarget = expenses * 6;

    const now = new Date();
    const monthsNeeded3 = Math.max(0, threeMonthTarget - savings);
    const monthsNeeded6 = Math.max(0, sixMonthTarget - savings);

    const date3 = new Date(now);
    date3.setMonth(date3.getMonth() + Math.ceil(monthsNeeded3 / (expenses * 0.1 || 1)));
    const date6 = new Date(now);
    date6.setMonth(date6.getMonth() + Math.ceil(monthsNeeded6 / (expenses * 0.1 || 1)));

    saveToDashboard('nm_goals', {
      monthsCoverage,
      threeMonthTarget,
      sixMonthTarget,
      projectedDateThree: date3.toISOString().split('T')[0],
      projectedDateSix: date6.toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });
    onSaved();
    onClose();
  }

  return (
    <QuickEditModal
      title="Emergency Fund"
      subtitle="How many months of expenses are you covered?"
      onClose={onClose}
      onSave={handleSave}
      fullBreakdownHref="/emergency-fund"
      fullBreakdownLabel="Create Detailed Breakdown: Emergency Fund Calculator"
    >
      <Field
        label="Monthly expenses"
        hint="All essential costs: housing, food, utilities, insurance, minimum debt payments"
        value={monthlyExpenses}
        onChange={setMonthlyExpenses}
      />
      <Field
        label="Current emergency savings"
        hint="Cash in savings accounts set aside for emergencies"
        value={currentSavings}
        onChange={setCurrentSavings}
      />
    </QuickEditModal>
  );
}
