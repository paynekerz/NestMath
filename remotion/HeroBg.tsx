import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

const W = 1920;
const H = 900;

// Chart bounding box
const CX = 460;
const CY = 60;
const CW = 1380;
const CH = 760;

// Normalized net-worth curves (year 0–9, y: 0=bottom 1=top)
const BUY_Y  = [0.02, 0.08, 0.17, 0.28, 0.41, 0.56, 0.71, 0.85, 0.94, 1.00];
const RENT_Y = [0.05, 0.13, 0.23, 0.34, 0.45, 0.56, 0.67, 0.78, 0.88, 0.96];

// ─── geometry helpers ──────────────────────────────────────────────────────────

type Pt = { x: number; y: number };

function toPts(ys: number[]): Pt[] {
  return ys.map((y, i) => ({
    x: CX + (i / (ys.length - 1)) * CW,
    y: CY + CH - y * CH,
  }));
}

function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const cx = ((a.x + b.x) / 2).toFixed(1);
    d += ` C ${cx} ${a.y.toFixed(1)} ${cx} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

// ─── colors ───────────────────────────────────────────────────────────────────

const BG      = '#0f141a';
const BLUE    = '#b4c5ff';
const GREEN   = '#4ad98b';
const GRID    = 'rgba(180,197,255,0.055)';
const LABEL   = 'rgba(195,198,215,0.38)';
const MONO    = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// ─── main component ───────────────────────────────────────────────────────────

export const HeroBg: React.FC = () => {
  const frame = useCurrentFrame();

  // Animation timeline (300 frames = 10 s @ 30 fps)
  const gridOp  = interpolate(frame, [0, 40],   [0, 1], { extrapolateRight: 'clamp' });
  const reveal  = interpolate(frame, [10, 180],  [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const dotOp   = interpolate(frame, [80, 150],  [0, 1], { extrapolateRight: 'clamp' });
  const master  = interpolate(frame, [262, 300], [1, 0], { extrapolateLeft: 'clamp' });

  const buyPts  = toPts(BUY_Y);
  const rentPts = toPts(RENT_Y);
  const buyPath  = smoothPath(buyPts);
  const rentPath = smoothPath(rentPts);

  const revealX = CX + reveal * CW;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg
        width={W}
        height={H}
        style={{ position: 'absolute', inset: 0, opacity: master }}
      >
        <defs>
          {/* Clip: reveals chart left-to-right */}
          <clipPath id="reveal-clip">
            <rect x={CX} y={0} width={reveal * CW} height={H} />
          </clipPath>

          {/* Glow filter — blue */}
          <filter id="glow-b" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow filter — green */}
          <filter id="glow-g" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── grid ─────────────────────────────────────────────────────────── */}
        <g opacity={gridOp}>
          {/* horizontal */}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={CX} x2={CX + CW}
              y1={CY + (i / 8) * CH} y2={CY + (i / 8) * CH}
              stroke={GRID} strokeWidth={1}
            />
          ))}
          {/* vertical */}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={CX + (i / 9) * CW} x2={CX + (i / 9) * CW}
              y1={CY} y2={CY + CH}
              stroke={GRID} strokeWidth={1}
            />
          ))}
        </g>

        {/* ── year-axis labels ──────────────────────────────────────────────── */}
        <g opacity={gridOp * 0.9} fontFamily={MONO} fontSize={13} fill={LABEL} textAnchor="middle">
          {Array.from({ length: 10 }, (_, i) => {
            const lx = CX + (i / 9) * CW;
            if (lx > revealX + 20) return null;
            return (
              <text key={`yr${i}`} x={lx} y={CY + CH + 34}>
                Yr {i + 1}
              </text>
            );
          })}
        </g>

        {/* ── buy curve ─────────────────────────────────────────────────────── */}
        <g clipPath="url(#reveal-clip)">
          {/* glow halo */}
          <path d={buyPath} fill="none" stroke={`${BLUE}50`} strokeWidth={14} filter="url(#glow-b)" />
          {/* crisp line */}
          <path d={buyPath} fill="none" stroke={BLUE} strokeWidth={2.5} />
        </g>

        {/* ── rent+invest curve ─────────────────────────────────────────────── */}
        <g clipPath="url(#reveal-clip)">
          <path d={rentPath} fill="none" stroke={`${GREEN}50`} strokeWidth={14} filter="url(#glow-g)" />
          <path d={rentPath} fill="none" stroke={GREEN} strokeWidth={2.5} />
        </g>

        {/* ── data point dots ───────────────────────────────────────────────── */}
        <g opacity={dotOp}>
          {buyPts.map((pt, i) => {
            if (pt.x > revealX) return null;
            return <circle key={`bd${i}`} cx={pt.x} cy={pt.y} r={5} fill={BLUE} />;
          })}
        </g>
        <g opacity={dotOp * 0.85}>
          {rentPts.map((pt, i) => {
            if (pt.x > revealX) return null;
            return <circle key={`rd${i}`} cx={pt.x} cy={pt.y} r={5} fill={GREEN} />;
          })}
        </g>

        {/* ── legend ────────────────────────────────────────────────────────── */}
        <g opacity={dotOp} fontFamily={MONO} fontSize={13} fill={LABEL}>
          <rect x={CX + CW - 290} y={CY + CH + 52} width={22} height={2.5} fill={BLUE} rx={1} />
          <text x={CX + CW - 260} y={CY + CH + 66}>Buy</text>

          <rect x={CX + CW - 180} y={CY + CH + 52} width={22} height={2.5} fill={GREEN} rx={1} />
          <text x={CX + CW - 150} y={CY + CH + 66}>Rent + Invest</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
