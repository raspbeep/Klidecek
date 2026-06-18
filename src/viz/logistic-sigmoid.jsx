// 1D logistic regression: how w (steepness) and b (shift) move the sigmoid
// P(omega1|x) = sigma(w*x + b) and the decision threshold (where sigma = 0.5).
// Sliders change w and b; the curve, the x* = -b/w threshold line and the
// classification of the toy points all update live.
import { useState } from "react";

export default function LogisticSigmoid() {
  const [w, setW] = useState(1.4);
  const [b, setB] = useState(0.2);

  const W = 280, H = 200;
  const padL = 18, padR = 12, padT = 14, padB = 26;
  // x in [-6,6], probability in [0,1]
  const sx = (vx) => padL + ((vx + 6) / 12) * (W - padL - padR);
  const sy = (p) => H - padB - p * (H - padT - padB);

  const sigma = (a) => 1 / (1 + Math.exp(-a));
  const prob = (vx) => sigma(w * vx + b);

  // toy 1D points: class -1 on the left, class +1 on the right
  const pts = [
    { x: -4.0, t: 0 }, { x: -3.0, t: 0 }, { x: -1.6, t: 0 }, { x: -0.8, t: 0 },
    { x: 0.9, t: 1 }, { x: 1.8, t: 1 }, { x: 3.0, t: 1 }, { x: 4.2, t: 1 },
  ];

  // sigmoid curve
  const curve = [];
  for (let vx = -6; vx <= 6; vx += 0.15) curve.push([vx, prob(vx)]);
  const cPath = curve.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join(" ");

  // decision threshold x* where w*x+b = 0  =>  x* = -b/w  (sigma = 0.5)
  const hasThresh = Math.abs(w) > 1e-6;
  const xStar = hasThresh ? -b / w : null;
  const inView = hasThresh && xStar >= -6 && xStar <= 6;

  const blue = "oklch(0.6 0.16 250)";
  const red = "oklch(0.6 0.18 25)";

  // count errors at threshold 0.5
  const errs = pts.filter((p) => (prob(p.x) >= 0.5 ? 1 : 0) !== p.t).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* p = 0.5 gridline */}
        <line x1={sx(-6)} y1={sy(0.5)} x2={sx(6)} y2={sy(0.5)}
          stroke="var(--line)" strokeWidth="0.5" strokeDasharray="3 3" />
        <text x={sx(-6) + 2} y={sy(0.5) - 3} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">0.5</text>

        {/* axes */}
        <line x1={sx(-6)} y1={sy(0)} x2={sx(6)} y2={sy(0)} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={sx(0)} y1={sy(0)} x2={sx(0)} y2={sy(1)} stroke="var(--line)" strokeWidth="0.5" />

        {/* decision threshold */}
        {inView && (
          <line x1={sx(xStar)} y1={sy(0)} x2={sx(xStar)} y2={sy(1)}
            stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="4 2" />
        )}

        {/* sigmoid */}
        <path d={cPath} fill="none" stroke="var(--accent)" strokeWidth="2.2" />

        {/* data points, on the baseline, colored by true class, ringed if misclassified */}
        {pts.map((p, i) => {
          const wrong = (prob(p.x) >= 0.5 ? 1 : 0) !== p.t;
          return (
            <g key={i}>
              {wrong && <circle cx={sx(p.x)} cy={sy(0)} r="6.5" fill="none" stroke="var(--text)" strokeWidth="1.1" />}
              <circle cx={sx(p.x)} cy={sy(0)} r="4" fill={p.t === 1 ? blue : red} />
            </g>
          );
        })}

        <text x={8} y={14} fontSize="9.5" fontFamily="var(--font-mono)" fill={red}>● −1</text>
        <text x={34} y={14} fontSize="9.5" fontFamily="var(--font-mono)" fill={blue}>● +1</text>
        <text x={W - 8} y={H - 8} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">x →</text>
        <text x={W - 8} y={14} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--accent)">
          σ(wx+b)
        </text>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>w</span>
        <input type="range" className="viz-slider" min={-4} max={4} step={0.1} value={w}
          onChange={(e) => setW(+e.target.value)} style={{ width: 90 }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>b</span>
        <input type="range" className="viz-slider" min={-6} max={6} step={0.1} value={b}
          onChange={(e) => setB(+e.target.value)} style={{ width: 90 }} />
      </div>

      <span className="viz-readout">
        w = {w.toFixed(1)} · b = {b.toFixed(1)} · práh x* = {hasThresh ? xStar.toFixed(2) : "—"} · chyby: {errs}
      </span>
    </div>
  );
}
