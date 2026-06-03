import type { AffordabilityCalcResult } from '../../lib/affordability';
import { DTIGauge } from '../ui/DTIGauge';

interface Props {
  result: AffordabilityCalcResult;
  backEndDTILimit: number;
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

export function AffordabilityResult({ result, backEndDTILimit }: Props) {
  const dti = result.backEndDTIActual;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Main budget card */}
      <div className="bg-primary-container p-8 rounded-xl text-on-primary-container shadow-xl flex flex-col items-center text-center">
        <span className="text-label-md uppercase tracking-widest opacity-80 mb-2">Estimated Home Budget</span>
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
            <div className="text-label-sm opacity-70">Monthly P&amp;I</div>
            <div className="text-headline-md font-bold font-mono-data">{cur.format(result.monthlyPI)}</div>
          </div>
          <div className="text-right">
            <div className="text-label-sm opacity-70">Total Monthly Payment</div>
            <div className="text-headline-md font-bold font-mono-data">{cur.format(result.monthlyPITI)}</div>
          </div>
        </div>
      </div>

      {/* DTI Gauge card */}
      <div className="mt-auto glass-panel p-8 rounded-xl flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h4 className="text-label-md text-on-surface font-bold">Debt-to-Income Ratio (DTI)</h4>
          <span className="text-headline-md font-mono-data text-primary">{pctFmt(dti)}</span>
        </div>
        <DTIGauge dti={dti} />
        <p className="text-body-sm text-on-surface-variant leading-relaxed">
          {dtiBodyText(dti)}
          {result.backEndExceeded && (
            <span className="ml-1 text-red-400">
              Your back-end DTI ({pctFmt(dti)}) exceeds your {pctFmt(backEndDTILimit)} limit.
            </span>
          )}
        </p>
      </div>

    </div>
  );
}
