import { useState } from 'react';
import { calcAffordability, type BuyInputs } from '../../lib/calculator';
import { StatCard } from '../ui/StatCard';

interface Props {
  buy: BuyInputs;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function AffordabilitySnapshot({ buy }: Props) {
  const [showSavings, setShowSavings] = useState(false);
  const [monthlySavings, setMonthlySavings] = useState('');

  const aff = calcAffordability(buy);

  const savingsNum = parseFloat(monthlySavings.replace(/[^0-9.]/g, ''));
  const monthsToSave = savingsNum > 0 ? Math.ceil(aff.cashToClose / savingsNum) : null;
  const yearsToSave = monthsToSave !== null ? (monthsToSave / 12).toFixed(1) : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-4">
      <h2 className="text-base font-semibold">Affordability Snapshot</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Required Household Income"
          value={cur.format(aff.requiredAnnualIncome)}
          sub="28% front-end DTI rule"
        />
        <StatCard
          label="Cash Needed to Close"
          value={cur.format(aff.cashToClose)}
          sub={`${cur.format(aff.downPayment)} down + ${cur.format(aff.closingCosts)} closing`}
        />
        {monthsToSave !== null && (
          <StatCard
            label="Time to Save"
            value={`${yearsToSave} yrs`}
            sub={`${monthsToSave} months at ${cur.format(savingsNum)}/mo`}
          />
        )}
      </div>

      {!showSavings ? (
        <button
          data-print="hide"
          type="button"
          onClick={() => setShowSavings(true)}
          className="self-start text-sm text-accent underline-offset-2 hover:underline"
        >
          How long to save for a down payment?
        </button>
      ) : (
        <div data-print="hide" className="flex items-center gap-3">
          <label htmlFor="monthly-savings" className="text-sm text-muted whitespace-nowrap">
            Monthly savings toward down payment
          </label>
          <input
            id="monthly-savings"
            type="number"
            min="0"
            step="100"
            value={monthlySavings}
            onChange={e => setMonthlySavings(e.target.value)}
            placeholder="e.g. 1000"
            className="w-32 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      )}
    </div>
  );
}
