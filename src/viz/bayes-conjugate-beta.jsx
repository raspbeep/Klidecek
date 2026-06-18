// Beta-Bernoulli conjugacy on one canvas: prior, (scaled) likelihood, posterior.
// Sliders set the Beta(alpha,beta) prior and the observed successes/failures.
// Posterior = Beta(alpha+s, beta+f); each curve self-normalised to its own peak.
import { useState } from "react";

function betaLogKernel(x, a, b) {
  if (x <= 0 || x >= 1) return -Infinity;
  return (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x);
}

// curve sampled over (0,1), normalised so its peak = 1 (for plotting on shared axis)
function curve(a, b, N) {
  const pts = [];
  let maxLog = -Infinity;
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    const lk = betaLogKernel(x, a, b);
    pts.push({ x, lk });
    if (lk > maxLog) maxLog = lk;
  }
  return pts.map((p) => ({ x: p.x, v: p.lk === -Infinity ? 0 : Math.exp(p.lk - maxLog) }));
}

export default function BayesConjugateBeta() {
  const [alpha, setAlpha] = useState(2);
  const [beta, setBeta] = useState(2);
  const [s, setS] = useState(6); // observed successes
  const [f, setF] = useState(2); // observed failures

  const W = 330, H = 190;
  const x0 = 26, x1 = W - 12, yBase = H - 40, yTop = 16;
  const N = 140;

  const toX = (x) => x0 + x * (x1 - x0);
  const toY = (v) => yBase - v * (yBase - yTop);

  // prior, likelihood (Beta(s+1,f+1) kernel ∝ θ^s (1-θ)^f), posterior
  const prior = curve(alpha, beta, N);
  const like = curve(s + 1, f + 1, N);
  const post = curve(alpha + s, beta + f, N);

  const mkPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(1)} ${toY(p.v).toFixed(1)}`).join(" ");

  const series = [
    { key: "prior", pts: prior, color: "var(--text-muted)", label: `prior Beta(${alpha},${beta})`, dash: "4 3" },
    { key: "like", pts: like, color: "var(--accent-line)", label: `likelihood (s=${s}, f=${f})`, dash: "2 2" },
    { key: "post", pts: post, color: "var(--accent)", label: `posterior Beta(${alpha + s},${beta + f})`, dash: "" },
  ];

  const postMean = (alpha + s) / (alpha + beta + s + f);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 470, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <line x1={x0} y1={yBase} x2={x1} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.7" />
        <line x1={x0} y1={yTop} x2={x0} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.7" />
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={yBase} x2={toX(t)} y2={yBase + 3} stroke="var(--line-strong)" strokeWidth="0.7" />
            <text x={toX(t)} y={yBase + 13} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">{t}</text>
          </g>
        ))}
        <text x={x1} y={yTop + 2} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">θ</text>

        {/* fill under posterior for emphasis */}
        <path d={`${mkPath(post)} L ${toX(1)} ${yBase} L ${toX(0)} ${yBase} Z`} fill="var(--accent)" opacity="0.1" />

        {series.map((sr) => (
          <path key={sr.key} d={mkPath(sr.pts)} fill="none" stroke={sr.color} strokeWidth={sr.key === "post" ? 2.2 : 1.5} strokeDasharray={sr.dash} />
        ))}

        {/* posterior-mean guide */}
        <line x1={toX(postMean)} y1={yTop} x2={toX(postMean)} y2={yBase} stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.7" />

        {/* legend */}
        {series.map((sr, i) => (
          <g key={"L" + sr.key}>
            <line x1={x0 + 2} y1={H - 30 + i * 9.5} x2={x0 + 18} y2={H - 30 + i * 9.5} stroke={sr.color} strokeWidth="2" strokeDasharray={sr.dash} />
            <text x={x0 + 22} y={H - 27 + i * 9.5} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">{sr.label}</text>
          </g>
        ))}
      </svg>

      <div className="viz-controls" style={{ flexWrap: "wrap" }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
          α={alpha}
          <input type="range" className="viz-slider" min={1} max={10} step={1} value={alpha} onChange={(e) => setAlpha(+e.target.value)} />
        </label>
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
          β={beta}
          <input type="range" className="viz-slider" min={1} max={10} step={1} value={beta} onChange={(e) => setBeta(+e.target.value)} />
        </label>
      </div>
      <div className="viz-controls" style={{ flexWrap: "wrap" }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
          úspěchy s={s}
          <input type="range" className="viz-slider" min={0} max={40} step={1} value={s} onChange={(e) => setS(+e.target.value)} />
        </label>
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
          neúspěchy f={f}
          <input type="range" className="viz-slider" min={0} max={40} step={1} value={f} onChange={(e) => setF(+e.target.value)} />
        </label>
      </div>

      <span className="viz-readout">
        posterior = Beta(α+s, β+f) = Beta({alpha + s}, {beta + f}) · E[θ|X]={postMean.toFixed(3)}
      </span>
    </div>
  );
}
