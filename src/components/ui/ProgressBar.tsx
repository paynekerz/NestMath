interface Props {
  pct: number; // 0–100
  className?: string;
}

export function ProgressBar({ pct, className = '' }: Props) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={`h-1.5 rounded-full bg-surface-container-high overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${clamped}%`,
          background: 'linear-gradient(to right, var(--color-primary-container), var(--color-primary-accent))',
        }}
      />
    </div>
  );
}
