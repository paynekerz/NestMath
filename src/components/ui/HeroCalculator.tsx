import { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculate,
  DEFAULT_BUY_INPUTS,
  DEFAULT_RENT_INPUTS,
  DEFAULT_ASSUMPTIONS,
} from '../../lib/calculator';

const fmtUsd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtUsdShort = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return fmtUsd(n);
};

/** Count-up hook — respects prefers-reduced-motion. */
function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef(0);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    cancelAnimationFrame(frameRef.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs]);

  return value;
}

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function Slider({ id, label, value, min, max, step, display, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-[6px]">
        <label htmlFor={id} className="text-label-sm font-medium text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
        <span className="font-mono-data text-body-sm font-semibold text-on-surface tabular-nums">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function Sparkline({
  buy,
  rent,
  breakEvenYear,
}: {
  buy: number[];
  rent: number[];
  breakEvenYear: number | null;
}) {
  const W = 320;
  const H = 88;
  const PAD = 4;
  const all = [...buy, ...rent];
  const minV = Math.min(...all);
  const maxV = Math.max(...all);
  const range = maxV - minV || 1;
  const x = (i: number) => PAD + (i / (buy.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - minV) / range) * (H - PAD * 2);
  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const beIdx = breakEvenYear !== null ? breakEvenYear - 1 : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={
        breakEvenYear !== null
          ? `Net worth lines for buying and renting cross at year ${breakEvenYear}`
          : 'Net worth lines for buying and renting over 30 years'
      }
    >
      <path d={path(rent)} fill="none" stroke="var(--color-success-emerald)" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d={path(buy)} fill="none" stroke="var(--color-primary-accent)" strokeWidth="2.5" strokeLinecap="round" />
      {beIdx !== null && beIdx >= 0 && beIdx < buy.length && (
        <>
          <line
            x1={x(beIdx)} y1={PAD} x2={x(beIdx)} y2={H - PAD}
            stroke="var(--color-outline)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
          />
          <circle cx={x(beIdx)} cy={y(buy[beIdx])} r="4" fill="var(--color-primary-accent)" stroke="var(--color-background)" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

export function HeroCalculator() {
  const [homePrice, setHomePrice] = useState(400_000);
  const [ratePct, setRatePct] = useState(6.5);
  const [rent, setRent] = useState(1_900);

  const result = useMemo(
    () =>
      calculate(
        { ...DEFAULT_BUY_INPUTS, homePrice, mortgageRate: ratePct / 100 },
        { ...DEFAULT_RENT_INPUTS, monthlyRent: rent },
        { ...DEFAULT_ASSUMPTIONS, yearsToModel: 30 },
      ),
    [homePrice, ratePct, rent],
  );

  const { years, breakEvenYear } = result;
  const last = years[years.length - 1];
  const finalDelta = last.buyNetWorth - last.rentNetWorth;
  const buyWins = breakEvenYear !== null;

  const animatedDelta = useCountUp(Math.abs(finalDelta));

  return (
    <div className="hero-card p-[24px] sm:p-[32px]">
      <p className="text-label-sm font-semibold text-primary uppercase tracking-widest mb-[20px]">
        Try it — should you buy or rent?
      </p>

      <div className="flex flex-col gap-[18px]">
        <Slider
          id="hero-home-price"
          label="Home price"
          value={homePrice}
          min={150_000}
          max={1_000_000}
          step={10_000}
          display={fmtUsd(homePrice)}
          onChange={setHomePrice}
        />
        <Slider
          id="hero-rate"
          label="Mortgage rate"
          value={ratePct}
          min={3}
          max={9}
          step={0.125}
          display={`${ratePct.toFixed(3).replace(/\.?0+$/, '')}%`}
          onChange={setRatePct}
        />
        <Slider
          id="hero-rent"
          label="Comparable rent"
          value={rent}
          min={800}
          max={5_000}
          step={50}
          display={`${fmtUsd(rent)}/mo`}
          onChange={setRent}
        />
      </div>

      <div
        className="mt-[24px] pt-[20px] border-t border-border-subtle"
        aria-live="polite"
      >
        {buyWins ? (
          <p className="font-display text-headline-md sm:text-headline-lg font-bold text-on-surface leading-tight">
            Buying pulls ahead in{' '}
            <span className="text-primary whitespace-nowrap">year {breakEvenYear}</span>
          </p>
        ) : (
          <p className="font-display text-headline-md sm:text-headline-lg font-bold text-on-surface leading-tight">
            Renting wins <span className="text-success-emerald">all 30 years</span>
          </p>
        )}
        <p className="text-body-sm text-on-surface-variant mt-[6px]">
          {buyWins ? 'Buyer' : 'Renter'} ends ~
          <span className="font-mono-data font-semibold tabular-nums text-on-surface">
            {fmtUsdShort(animatedDelta)}
          </span>{' '}
          ahead by year 30, with a 20% down payment and typical costs.
        </p>

        <div className="mt-[16px]">
          <Sparkline
            buy={years.map((y) => y.buyNetWorth)}
            rent={years.map((y) => y.rentNetWorth)}
            breakEvenYear={breakEvenYear}
          />
          <div className="flex items-center gap-[16px] mt-[8px]">
            <span className="flex items-center gap-[6px] text-label-sm text-on-surface-variant">
              <span className="w-3 h-[3px] rounded-full bg-primary-accent inline-block" aria-hidden="true"></span>
              Buy net worth
            </span>
            <span className="flex items-center gap-[6px] text-label-sm text-on-surface-variant">
              <span className="w-3 h-[3px] rounded-full bg-success-emerald inline-block" aria-hidden="true"></span>
              Rent &amp; invest
            </span>
          </div>
        </div>

        <a
          href="/buy-vs-rent"
          className="mt-[20px] inline-flex w-full items-center justify-center gap-[8px] bg-primary-accent text-white px-[24px] py-[14px] rounded-lg text-label-md font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
        >
          See the full breakdown
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}
