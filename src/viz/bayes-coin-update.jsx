// Bayesian coin-flip belief updating.
// Click +líc / +rub to add observations; the Beta(alpha,beta) posterior over p
// (probability of heads) shifts toward the observed ratio and narrows with data.
import { useState } from "react";

// Unnormalised Beta(a,b) density at x in (0,1); we normalise by the curve's own max.
function betaPdf(x, a, b) {
  if (x <= 0 || x >= 1) return 0;
  // log to stay numerically sane for larger a,b
  const logv = (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x);
  return Math.exp(logv);
}

export default function BayesCoinUpdate() {
  // prior Beta(1,1) = uniform; counts of heads (s) and tails (f) accumulate
  const [s, setS] = useState(0);
  const [f, setF] = useState(0);
  const a0 = 1, b0 = 1;
  const a = a0 + s, b = b0 + f;
  const n = s + f;

  const W = 320, H = 180;
  // yTop leaves headroom above the curve so the flat Beta(1,1) prior (a full-height
  // rectangle) doesn't reach the top axis labels.
  const x0 = 28, x1 = W - 12, yBase = H - 26, yTop = 26;

  // sample the posterior curve and find its max for self-normalisation
  const N = 120;
  const xs = [];
  let maxv = 0;
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    const v = betaPdf(x, a, b);
    xs.push({ x, v });
    if (v > maxv) maxv = v;
  }
  // guard against the flat prior (max at endpoints -> 1)
  if (maxv === 0) maxv = 1;

  const toX = (x) => x0 + x * (x1 - x0);
  const toY = (v) => yBase - (v / maxv) * (yBase - yTop);

  const path = xs
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(1)} ${toY(p.v).toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${toX(1).toFixed(1)} ${yBase} L ${toX(0).toFixed(1)} ${yBase} Z`;

  // posterior mean and MLE (only when data present)
  const mean = a / (a + b);
  const mle = n > 0 ? s / n : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <line x1={x0} y1={yBase} x2={x1} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.7" />
        <line x1={x0} y1={yTop} x2={x0} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.7" />
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={yBase} x2={toX(t)} y2={yBase + 3} stroke="var(--line-strong)" strokeWidth="0.7" />
            <text x={toX(t)} y={yBase + 14} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">{t}</text>
          </g>
        ))}
        {/* axis labels: x-axis name below the axis (clear of the 0/0.5/1 tick labels),
            y-axis name in the top headroom above the curve */}
        <text x={(toX(0.5) + toX(1)) / 2} y={yBase + 14} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">p (líc)</text>
        <text x={x0 - 4} y={12} textAnchor="start" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">p(θ|X)</text>

        {/* posterior curve + fill */}
        <path d={area} fill="var(--accent)" opacity="0.12" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />

        {/* posterior mean marker */}
        <line x1={toX(mean)} y1={yTop} x2={toX(mean)} y2={yBase} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
        <text x={toX(mean)} y={yTop - 2} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--accent)">E[θ]={mean.toFixed(2)}</text>

        {/* MLE marker once we have data */}
        {mle !== null && (
          <>
            <line x1={toX(mle)} y1={yTop + 10} x2={toX(mle)} y2={yBase} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx={toX(mle)} cy={yBase} r="3" fill="var(--text-muted)" />
          </>
        )}

        {n === 0 && (
          <text x={(x0 + x1) / 2} y={(yTop + yBase) / 2} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
            prior Beta(1,1) = plochý — klikni a začni házet
          </text>
        )}
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={() => setS(s + 1)}>+ líc</button>
        <button className="viz-btn" onClick={() => setF(f + 1)}>+ rub</button>
        <button className="viz-btn" onClick={() => { setS(0); setF(0); }}>reset</button>
      </div>

      <span className="viz-readout">
        líce s={s} · ruby f={f} · n={n} → posterior Beta({a}, {b}) · E[θ]={mean.toFixed(3)}
        {mle !== null ? ` · MLE=${mle.toFixed(3)}` : ""}
      </span>
    </div>
  );
}
