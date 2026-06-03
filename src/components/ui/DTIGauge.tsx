interface Props {
  dti: number; // decimal, e.g. 0.36
}

export function DTIGauge({ dti }: Props) {
  const pct = Math.min(Math.max(dti * 100, 0), 100);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-4 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
        {/* Healthy: 0–28% */}
        <div className="h-full bg-success-emerald border-r border-background/20" style={{ width: '28%' }} />
        {/* Moderate: 28–36% */}
        <div className="h-full bg-primary-accent border-r border-background/20" style={{ width: '8%' }} />
        {/* Caution: 36–43% */}
        <div className="h-full bg-tertiary-container border-r border-background/20" style={{ width: '7%' }} />
        {/* High: 43–100% */}
        <div className="h-full bg-error-container" style={{ width: '57%' }} />
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10"
          style={{ left: `calc(${pct}% - 2px)` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px] text-on-surface-variant uppercase tracking-wide">
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-success-emerald shrink-0" />
          Healthy (&lt;28%)
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary-accent shrink-0" />
          Moderate
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-error-container shrink-0" />
          High (&gt;43%)
        </div>
      </div>
    </div>
  );
}
