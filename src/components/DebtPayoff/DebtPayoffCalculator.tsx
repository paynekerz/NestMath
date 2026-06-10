import { useState, useMemo, useCallback } from 'react';
import {
  DEFAULT_DEBT_INPUTS,
  calcDebtPayoff,
  type DebtItem,
  type DebtPayoffInputs,
} from '../../lib/debt-payoff';
import { validateDebtPayoffInputs, hasDebtErrors } from '../../lib/validation';
import { DebtPayoffInputs as DebtInputsPanel } from './DebtPayoffInputs';
import { DebtPayoffSummary } from './DebtPayoffSummary';
import { DebtPayoffChart } from './DebtPayoffChart';
import { DebtPayoffTable } from './DebtPayoffTable';
import { KofiButton } from '../ui/KofiButton';
const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function buildCsv(inputs: DebtPayoffInputs, result: ReturnType<typeof calcDebtPayoff>): string {
  const today = new Date().toISOString().split('T')[0];
  const rows: string[] = [];

  const c = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const row = (...cells: string[]) => rows.push(cells.map(c).join(','));

  row('Debt Payoff Calculator — Avalanche vs. Snowball', `Generated: ${today}`);
  row('', '');
  row('--- Debts ---', '');
  row('Name', 'Balance', 'APR', 'Min. Payment');
  for (const d of inputs.debts) {
    row(d.name, cur.format(d.balance), `${(d.apr * 100).toFixed(2)}%`, cur.format(d.minPayment));
  }
  row('Extra monthly budget', cur.format(inputs.extraBudget));
  row('', '');
  row('--- Avalanche (Highest APR First) ---', '');
  row('Total months', String(result.avalanche.months));
  row('Total interest', cur.format(result.avalanche.totalInterest));
  row('', '');
  row('Payoff Order', 'Balance', 'APR', 'Payoff Month');
  for (const o of result.avalanche.payoffOrder) {
    row(o.name, cur.format(o.initialBalance), `${(o.apr * 100).toFixed(2)}%`, String(o.payoffMonth));
  }
  row('', '');
  row('--- Snowball (Lowest Balance First) ---', '');
  row('Total months', String(result.snowball.months));
  row('Total interest', cur.format(result.snowball.totalInterest));
  row('', '');
  row('Payoff Order', 'Balance', 'APR', 'Payoff Month');
  for (const o of result.snowball.payoffOrder) {
    row(o.name, cur.format(o.initialBalance), `${(o.apr * 100).toFixed(2)}%`, String(o.payoffMonth));
  }
  row('', '');
  row('Interest saved by avalanche', cur.format(result.interestSavedByAvalanche));

  return rows.join('\n');
}

let nextId = 4;

export function DebtPayoffCalculator() {
  const [debts, setDebts] = useState<DebtItem[]>(DEFAULT_DEBT_INPUTS.debts);
  const [extraBudget, setExtraBudget] = useState(DEFAULT_DEBT_INPUTS.extraBudget);

  const handleDebtChange = useCallback(
    (index: number, key: keyof DebtItem, value: string | number) => {
      setDebts(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [key]: value };
        return updated;
      });
    },
    [],
  );

  const handleAddDebt = useCallback(() => {
    if (debts.length >= 10) return;
    setDebts(prev => [
      ...prev,
      { id: String(nextId++), name: '', balance: 1_000, apr: 0.10, minPayment: 25 },
    ]);
  }, [debts.length]);

  const handleRemoveDebt = useCallback((index: number) => {
    setDebts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const errors = useMemo(
    () => validateDebtPayoffInputs(debts, extraBudget),
    [debts, extraBudget],
  );

  const result = useMemo(
    () => (hasDebtErrors(errors) || debts.length === 0 ? null : calcDebtPayoff({ debts, extraBudget })),
    [debts, extraBudget, errors],
  );

  const today = new Date().toISOString().split('T')[0];

  function handleCsv() {
    if (!result) return;
    const csv = buildCsv({ debts, extraBudget }, result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-payoff-planner-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1280px] mx-auto px-gutter pb-8">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">Debt Payoff Calculator</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Enter up to six debts with balances, APRs, and minimum payments to compare the avalanche (highest rate first) and snowball (lowest balance first) payoff strategies, including total interest, debt-free date, and payoff order for each method.</p>
        </div>
        <div data-print="hide" className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCsv}
            disabled={!result}
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
            Export PDF
          </button>
        </div>
      </div>

      {/* Main bento grid */}
      <div
        data-print="title"
        data-print-title="Debt Payoff Calculator — Avalanche vs. Snowball"
        data-date={today}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Input panel — col-span-8 */}
        <div className="lg:col-span-8 h-full">
          <DebtInputsPanel
            debts={debts}
            extraBudget={extraBudget}
            onDebtChange={handleDebtChange}
            onAddDebt={handleAddDebt}
            onRemoveDebt={handleRemoveDebt}
            onExtraChange={setExtraBudget}
            errors={errors}
          />
        </div>

        {/* Summary panel — col-span-4 */}
        <div className="lg:col-span-4">
          <DebtPayoffSummary result={result} />
        </div>

        {/* Chart — full width */}
        {result && (
          <div className="lg:col-span-12">
            <DebtPayoffChart result={result} />
          </div>
        )}
      </div>

      {result && <KofiButton message="If this helped you plan your path to debt-free," />}

      {/* Payoff order table */}
      {result && (
        <div className="mt-6">
          <DebtPayoffTable result={result} />
        </div>
      )}

    </div>
  );
}
