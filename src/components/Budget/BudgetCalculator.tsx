import { useState, useMemo, useCallback, useRef } from 'react';
import {
  DEFAULT_EXPENSES,
  estimateFederalTax,
  calcYearlyBreakdown,
  type Expense,
  type TaxEstimate,
  type YearRow,
} from '../../lib/budget';
import { IncomePanel } from './IncomePanel';
import { ExpensesPanel } from './ExpensesPanel';
import { BudgetSummary } from './BudgetSummary';
import { SavingsChart } from './SavingsChart';
import { BudgetTable } from './BudgetTable';
import { KofiButton } from '../ui/KofiButton';

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

function buildCsv(
  annualIncome: number,
  tax: TaxEstimate,
  expenses: Expense[],
  totalExpenses: number,
  monthlyNet: number,
  yearRows: YearRow[],
): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];
  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Personal Budget Calculator', `Generated: ${today}`);
  row('', '');
  row('--- Income ---', '');
  row('Annual pre-tax income', cur.format(annualIncome));
  row('Est. federal tax', cur.format(tax.federalTax));
  row('Effective rate', pct.format(tax.effectiveRate));
  row('Annual take-home', cur.format(tax.annualTakeHome));
  row('Monthly take-home', cur.format(tax.monthlyTakeHome));
  row('', '');
  row('--- Monthly Expenses ---', '');
  for (const exp of expenses) {
    row(exp.label, cur.format(exp.amount));
  }
  row('Total monthly expenses', cur.format(totalExpenses));
  row('', '');
  row('--- Summary ---', '');
  row('Monthly net savings', cur.format(monthlyNet));
  row('Annual net savings', cur.format(monthlyNet * 12));

  if (yearRows.length > 0) {
    row('', '');
    row('--- Year-by-Year ---', '');
    row('Year', 'Annual Savings', 'Cumulative Savings');
    for (const yr of yearRows) {
      row(String(yr.year), cur.format(yr.annualSavings), cur.format(yr.cumulative));
    }
  }

  return rows.join('\n');
}

export function BudgetCalculator() {
  const [annualIncome, setAnnualIncome] = useState(75_000);
  const [expenses, setExpenses] = useState<Expense[]>(DEFAULT_EXPENSES);
  const [horizonMonths, setHorizonMonths] = useState(60);
  const nextId = useRef(100);

  const tax = useMemo(() => estimateFederalTax(annualIncome), [annualIncome]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const monthlyNet = tax.monthlyTakeHome - totalExpenses;

  const yearRows = useMemo(
    () => (monthlyNet > 0 ? calcYearlyBreakdown(monthlyNet, horizonMonths / 12) : []),
    [monthlyNet, horizonMonths],
  );

  const handleChangeLabel = useCallback((id: string, label: string) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, label } : e)));
  }, []);

  const handleChangeAmount = useCallback((id: string, amount: number) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, amount } : e)));
  }, []);

  const handleAdd = useCallback(() => {
    setExpenses(prev => [
      ...prev,
      { id: String(nextId.current++), label: 'New expense', amount: 0 },
    ]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    const csv = buildCsv(annualIncome, tax, expenses, totalExpenses, monthlyNet, yearRows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-[16px] px-[24px] pb-[48px] max-w-5xl mx-auto">
      <div data-print="hide" className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={handleCsv}
          disabled={monthlyNet <= 0}
          className="flex items-center gap-1.5 px-md py-xs rounded-lg border border-border-subtle text-label-md text-on-surface-variant hover:border-primary-accent hover:text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
          Download CSV
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-md py-xs rounded-lg border border-border-subtle text-label-md text-on-surface-variant hover:border-primary-accent hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
          Print / Save PDF
        </button>
      </div>
      <IncomePanel annualIncome={annualIncome} onChange={setAnnualIncome} tax={tax} />

      <div className="grid md:grid-cols-2 gap-[16px]">
        <ExpensesPanel
          expenses={expenses}
          onChangeLabel={handleChangeLabel}
          onChangeAmount={handleChangeAmount}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
        <BudgetSummary
          monthlyTakeHome={tax.monthlyTakeHome}
          totalExpenses={totalExpenses}
          monthlyNet={monthlyNet}
        />
      </div>

      <div data-print="title" data-print-title="Personal Budget Calculator" data-date={today} className="flex flex-col gap-[16px]">
        <SavingsChart
          monthlyNet={monthlyNet}
          horizonMonths={horizonMonths}
          onHorizonChange={setHorizonMonths}
        />
        {monthlyNet > 0 && <KofiButton message="If this helped you map out your monthly budget," className="" />}
        <BudgetTable rows={yearRows} />
      </div>
    </div>
  );
}
