import type { AffordabilityCalcResult } from '../../lib/affordability';
import { DTIGauge } from '../ui/DTIGauge';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  result: AffordabilityCalcResult;
  backEndDTILimit: number;
  proInsight: string;
}

const cur = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pctFmt = (v: number) => `${(v * 100).toFixed(1)}%`;

function riskLabel(backEndDTI: number): string {
  if (backEndDTI < 0.28) return 'Low Risk Profile';
  if (backEndDTI < 0.36) return 'Moderate Risk Profile';
  if (backEndDTI < 0.43) return 'Elevated Risk Profile';
  return 'High Risk Profile';
}

function dtiBodyText(backEndDTI: number): string {
  if (backEndDTI < 0.28) return 'Your DTI is excellent. Lenders will view your application very favorably.';
  if (backEndDTI < 0.36) return 'Your DTI is in a healthy range. Most lenders prefer back-end DTI at or below 36%.';
  if (backEndDTI < 0.43) return 'Your DTI is in the caution zone. Some lenders may require compensating factors like a larger down payment.';
  return 'Your back-end DTI exceeds most lender limits. Consider paying down existing debts before applying.';
}

export function AffordabilityResult({ result, backEndDTILimit, proInsight }: Props) {
  const dti = result.backEndDTIActual;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Main budget card */}
      <div className="bg-primary-container p-8 rounded-xl text-on-primary-container shadow-xl flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-label-md uppercase tracking-widest opacity-80">Estimated Home Budget</span>
          <InfoTooltip text="The most expensive home you can buy while keeping your monthly housing costs at your target DTI percentage." />
        </div>
        <div
          className="leading-tight font-mono-data tracking-tighter mb-4"
          style={{ fontSize: '56px', fontWeight: 700 }}
        >
          {cur.format(result.maxHomePrice)}
        </div>
        <div className="flex items-center gap-1 px-4 py-1 bg-black/10 rounded-full text-label-sm">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {dti < 0.36 ? 'verified' : 'warning'}
          </span>
          {riskLabel(dti)}
        </div>
        <div className="mt-8 w-full pt-5 border-t border-white/10 flex justify-between">
          <div className="text-left">
            <div className="flex items-center gap-1 opacity-70">
              <span className="text-label-sm">Monthly P&amp;I</span>
              <InfoTooltip text="The part of your monthly payment that goes to principal and interest — not counting taxes or insurance." />
            </div>
            <div className="text-headline-md font-bold font-mono-data">{cur.format(result.monthlyPI)}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 opacity-70">
              <span className="text-label-sm">Total Monthly Payment</span>
              <InfoTooltip text="Your full monthly housing payment: principal, interest, property taxes, insurance, and HOA fees combined." />
            </div>
            <div className="text-headline-md font-bold font-mono-data">{cur.format(result.monthlyPITI)}</div>
          </div>
        </div>
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-label-sm text-on-surface-variant">Max Loan Amount</span>
            <InfoTooltip text="The loan you would need after your down payment. Lenders may approve up to this amount based on your income." />
          </div>
          <div className="text-body-lg font-mono-data text-primary font-semibold">{cur.format(result.maxLoanAmount)}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-label-sm text-on-surface-variant">Cash to Close</span>
            <InfoTooltip text="The total upfront cash you need: your down payment plus closing costs." />
          </div>
          <div className="text-body-lg font-mono-data text-primary font-semibold">{cur.format(result.cashToClose)}</div>
          <div className="text-[10px] text-on-surface-variant mt-0.5">
            {cur.format(result.downPayment)} down + {cur.format(result.closingCosts)} closing
          </div>
        </div>
      </div>

      {/* DTI Gauge card */}
      <div className="glass-panel p-8 rounded-xl flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <h4 className="text-label-md text-on-surface font-bold">Debt-to-Income Ratio (DTI)</h4>
            <InfoTooltip text="All your monthly debts — housing plus car loans, student loans, and credit cards — as a percentage of your gross income." />
          </div>
          <span className="text-headline-md font-mono-data text-primary">{pctFmt(dti)}</span>
        </div>
        <DTIGauge dti={dti} />
        <div className="flex justify-between text-label-sm text-on-surface-variant">
          <div className="flex items-center gap-1">
            <span>Front-end DTI:</span>
            <span className="font-mono-data text-on-surface ml-1">{pctFmt(result.frontEndDTIActual)}</span>
            <InfoTooltip text="Your housing payment as a percentage of income. Lenders typically want this at 28% or below." />
          </div>
          <div className="flex items-center gap-1">
            <span>Back-end DTI:</span>
            <span className={`font-mono-data ml-1 ${result.backEndExceeded ? 'text-error' : 'text-on-surface'}`}>
              {pctFmt(dti)}
            </span>
          </div>
        </div>
        <p className="text-body-sm text-on-surface-variant leading-relaxed">
          {dtiBodyText(dti)}
          {result.backEndExceeded && (
            <span className="ml-1 text-red-400">
              Your back-end DTI ({pctFmt(dti)}) exceeds your {pctFmt(backEndDTILimit)} limit.
            </span>
          )}
        </p>
        <div className="flex gap-4 items-start pt-1 border-t border-border-subtle">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>lightbulb</span>
          </div>
          <div>
            <h5 className="text-label-md text-on-surface mb-1">Pro Insight</h5>
            <p className="text-body-sm text-on-surface-variant">{proInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
