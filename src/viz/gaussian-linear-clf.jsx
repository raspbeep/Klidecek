// Gaussian classifier: shared vs different covariance -> linear vs quadratic boundary.
// Two Gaussian classes drawn as iso-density ellipses. Toggle "shared" makes both
// classes use the same covariance (LDA -> straight boundary); "different" gives
// each its own covariance (QDA -> curved boundary). The boundary is computed by
// sampling g(x)=ln p(x|w1)P(w1) - ln p(x|w2)P(w2) on a grid and drawing the zero
// level set as a polyline, so the picture genuinely changes with the toggle.
import { useState } from "react";

export default function GaussianLinearClf() {
  const [mode, setMode] = useState("shared"); // "shared" | "different"
  const W = 280, H = 200;
  const pad = 14;
  // feature space x in [-5,5], y in [-4,4]
  const sx = (vx) => pad + ((vx + 5) / 10) * (W - 2 * pad);
  const sy = (vy) => H - pad - ((vy + 4) / 8) * (H - 2 * pad);

  // class means
  const mu1 = [-2.0, 0.6];
  const mu2 = [2.2, -0.4];

  // covariances as [a,b,c] meaning [[a,b],[b,c]]
  const shared = [1.6, 0.5, 1.1];
  const cov1 = mode === "shared" ? shared : [1.4, 0.7, 0.7];
  const cov2 = mode === "shared" ? shared : [1.0, -0.6, 1.8];

  // inverse + log-det of a 2x2 SPD matrix [a,b,c]
  const inv2 = ([a, b, c]) => {
    const det = a * c - b * b;
    return { m: [c / det, -b / det, a / det], logdet: Math.log(det) };
  };
  const i1 = inv2(cov1), i2 = inv2(cov2);

  // -1/2 (x-mu)^T S^-1 (x-mu) - 1/2 logdet  (log density up to const 2pi term)
  const logp = (p, mu, inf) => {
    const dx = p[0] - mu[0], dy = p[1] - mu[1];
    const [a, b, c] = inf.m;
    const q = a * dx * dx + 2 * b * dx * dy + c * dy * dy;
    return -0.5 * q - 0.5 * inf.logdet;
  };
  // discriminant g(x) = log p1 - log p2 (equal priors)
  const gAt = (p) => logp(p, mu1, i1) - logp(p, mu2, i2);

  // trace the g=0 contour by scanning columns and finding the sign change in y
  const boundary = [];
  for (let px = -5; px <= 5; px += 0.12) {
    let prev = null;
    for (let py = -4; py <= 4; py += 0.08) {
      const v = gAt([px, py]);
      if (prev && Math.sign(prev.v) !== Math.sign(v)) {
        // linear interp on the crossing
        const t = prev.v / (prev.v - v);
        const yc = prev.y + t * (py - prev.y);
        boundary.push([px, yc]);
        break;
      }
      prev = { y: py, v };
    }
  }
  // A QDA boundary can have two branches; scanning columns top-down jumps between
  // them, so don't connect every point with "L". Start a fresh subpath "M" whenever
  // the vertical jump in feature-space y is too big to be one continuous branch.
  const yBreak = 1.5; // feature units; ~more than half the visible y-range step
  const bPath = boundary.length
    ? boundary
        .map((p, i) => {
          const cmd = i === 0 || Math.abs(p[1] - boundary[i - 1][1]) > yBreak ? "M" : "L";
          return `${cmd} ${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`;
        })
        .join(" ")
    : "";

  // iso-density ellipse for a covariance: eigen-decomp of 2x2 symmetric
  const ellipse = (mu, [a, b, c]) => {
    const tr = a + c, det = a * c - b * b;
    const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    // eigenvector for l1
    let ang;
    if (Math.abs(b) > 1e-9) ang = Math.atan2(l1 - a, b);
    else ang = a >= c ? 0 : Math.PI / 2;
    // scale so the ellipse spans ~1.6 std in pixels
    const k = 1.6;
    const rx = (k * Math.sqrt(l1)) / 10 * (W - 2 * pad);
    const ry = (k * Math.sqrt(l2)) / 8 * (H - 2 * pad);
    return { cx: sx(mu[0]), cy: sy(mu[1]), rx, ry, deg: (-ang * 180) / Math.PI };
  };
  const e1 = ellipse(mu1, cov1), e2 = ellipse(mu2, cov2);

  const blue = "oklch(0.6 0.16 250)";
  const red = "oklch(0.6 0.18 25)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* class 1 ellipse + mean */}
        <g transform={`rotate(${e1.deg} ${e1.cx} ${e1.cy})`}>
          <ellipse cx={e1.cx} cy={e1.cy} rx={e1.rx} ry={e1.ry}
            fill={blue} fillOpacity="0.14" stroke={blue} strokeWidth="1.4" />
        </g>
        <circle cx={sx(mu1[0])} cy={sy(mu1[1])} r="3" fill={blue} />

        {/* class 2 ellipse + mean */}
        <g transform={`rotate(${e2.deg} ${e2.cx} ${e2.cy})`}>
          <ellipse cx={e2.cx} cy={e2.cy} rx={e2.rx} ry={e2.ry}
            fill={red} fillOpacity="0.14" stroke={red} strokeWidth="1.4" />
        </g>
        <circle cx={sx(mu2[0])} cy={sy(mu2[1])} r="3" fill={red} />

        {/* decision boundary g=0 */}
        {bPath && <path d={bPath} fill="none" stroke="var(--accent)" strokeWidth="2.2" />}

        <text x={8} y={14} fontSize="9.5" fontFamily="var(--font-mono)" fill={blue}>● ω₁ ~ N(μ₁,Σ₁)</text>
        <text x={8} y={26} fontSize="9.5" fontFamily="var(--font-mono)" fill={red}>● ω₂ ~ N(μ₂,Σ₂)</text>
        <text x={W - 8} y={14} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--accent)">
          {mode === "shared" ? "hranice: přímka" : "hranice: křivka"}
        </text>
      </svg>

      <div className="viz-controls">
        <div className="viz-seg">
          <button className="viz-btn" data-active={mode === "shared"} onClick={() => setMode("shared")}>
            společná Σ
          </button>
          <button className="viz-btn" data-active={mode === "different"} onClick={() => setMode("different")}>
            různé Σ
          </button>
        </div>
      </div>

      <span className="viz-readout">
        {mode === "shared"
          ? "Σ₁ = Σ₂ ⇒ kvadratické členy se vyruší ⇒ LINEÁRNÍ hranice (LDA)"
          : "Σ₁ ≠ Σ₂ ⇒ kvadratické členy zůstanou ⇒ KVADRATICKÁ hranice (QDA)"}
      </span>
    </div>
  );
}
