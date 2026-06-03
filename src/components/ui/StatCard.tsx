import { InfoTooltip } from './InfoTooltip';

interface Props {
  label: string;
  value: string;
  sub?: string;
  tooltip?: string;
  valueColor?: string;
}

export function StatCard({ label, value, sub, tooltip, valueColor = 'text-on-surface' }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <span className={`text-headline-md font-semibold font-mono-data ${valueColor}`}>{value}</span>
      {sub && <span className="text-label-sm text-on-surface-variant">{sub}</span>}
    </div>
  );
}
