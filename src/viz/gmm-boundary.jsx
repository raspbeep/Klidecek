// 1D generative classifier: two class-conditional GMM densities scaled by priors.
// Slider P(w1) (P(w2)=1-P(w1)) and a separation slider for the class means.
// We plot p(x|w)*P(w) for both classes and a vertical decision boundary at their
// crossover. Raising the prior of a class pushes the boundary toward the other
// class -> the student SEES "prior moves the boundary".
import { useState } from "react";

export default function GmmBoundary() {
  // P(w1); P(w2) = 1 - P(w1)
  const [prior1, setPrior1] = useState(0.5);
  // separation: shifts the two classes apart/together around the centre (x=5)
  const [sep, setSep] = useState(2.4);

  const W = 320, H = 180;
  const x0 = 24, x1 = W - 10, yBase = H - 26, yTop = 16;
  const DMAX = 10;

  // Class 1: 2-component GMM on the LEFT, class 2: 2-component GMM on the RIGHT.
  // Means are placed relative to the centre c=5 and pushed out by `sep`.
  const c = 5;
  const cls1 = [
    { w: 0.6, m: c - sep - 0.6, s: 0.7 },
    { w: 0.4, m: c - sep + 0.9, s: 0.9 },
  ];
  const cls2 = [
    { w: 0.5, m: c + sep - 0.7, s: 0.8 },
    { w: 0.5, m: c + sep + 1.0, s: 0.7 },
  ];

  const gauss = (x, m, s) =>
    Math.exp(-((x - m) * (x - m)) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s);

  // class-conditional density p(x|w) = sum_k pi_k N(x; mu_k, sigma_k)
  const dens = (x, comps) => comps.reduce((a, k) => a + k.w * gauss(x, k.m, k.s), 0);

  const prior2 = 1 - prior1;
  // scaled densities f_c(x) = p(x|w_c) * P(w_c) -- the MAP discriminant (numerator)
  const f1 = (x) => dens(x, cls1) * prior1;
  const f2 = (x) => dens(x, cls2) * prior2;

  const N = 240;
  const xs = Array.from({ length: N + 1 }, (_, i) => (i / N) * DMAX);
  const y1 = xs.map(f1);
  const y2 = xs.map(f2);
  const yMax = Math.max(0.001, ...y1, ...y2) * 1.12;

  const toX = (x) => x0 + (x / DMAX) * (x1 - x0);
  const toY = (y) => yBase - (y / yMax) * (yBase - yTop);
  const pathOf = (ys) =>
    ys.map((y, i) => `${i === 0 ? "M" : "L"} ${toX(xs[i]).toFixed(1)} ${toY(y).toFixed(1)}`).join(" ");
  // filled-area path down to the baseline (for shading under the winning class)
  const areaOf = (ys) =>
    `M ${toX(xs[0]).toFixed(1)} ${yBase} ` +
    ys.map((y, i) => `L ${toX(xs[i]).toFixed(1)} ${toY(y).toFixed(1)}`).join(" ") +
    ` L ${toX(xs[N]).toFixed(1)} ${yBase} Z`;

  // Decision boundaries = sign changes of d(x) = f1(x) - f2(x).
  // (GMMs can produce more than one crossing -> the boundary may be non-contiguous.)
  const d = xs.map((x) => f1(x) - f2(x));
  const cross = [];
  for (let i = 1; i <= N; i++) {
    if ((d[i - 1] <= 0 && d[i] > 0) || (d[i - 1] >= 0 && d[i] < 0)) {
      const t = d[i - 1] / (d[i - 1] - d[i]); // linear interp of the zero crossing
      cross.push(xs[i - 1] + t * (xs[i] - xs[i - 1]));
    }
  }
  // primary boundary = crossing nearest the middle of the domain (for the readout)
  const main = cross.length
    ? cross.reduce((b, x) => (Math.abs(x - c) < Math.abs(b - c) ? x : b))
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 440, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <line x1={x0} y1={yBase} x2={x1} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={x0} y1={yTop} x2={x0} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={x1} y={H - 12} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">x →</text>
        <text x={x0 - 2} y={yTop - 4} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">p(x|ω)·P(ω)</text>

        {/* shaded areas under the curves */}
        <path d={areaOf(y1)} fill="var(--accent)" fillOpacity="0.14" stroke="none" />
        <path d={areaOf(y2)} fill="var(--accent-line)" fillOpacity="0.14" stroke="none" />

        {/* decision boundary lines (one per crossing) */}
        {cross.map((x, i) => (
          <line key={i} x1={toX(x)} y1={yTop} x2={toX(x)} y2={yBase}
            stroke="var(--text)" strokeWidth="1.2" strokeDasharray="4 3" />
        ))}

        {/* scaled class-conditional densities */}
        <path d={pathOf(y1)} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
        <path d={pathOf(y2)} fill="none" stroke="var(--accent-line)" strokeWidth="2.2" />

        {/* which class wins on each side of the main boundary */}
        {main != null && (
          <>
            <text x={(x0 + toX(main)) / 2} y={H - 12} textAnchor="middle"
              fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">→ ω₁</text>
            <text x={(toX(main) + x1) / 2} y={H - 12} textAnchor="middle"
              fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent-line)">ω₂ ←</text>
          </>
        )}

        <text x={W - 10} y={yTop + 4} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">— ω₁ · P(ω₁)</text>
        <text x={W - 10} y={yTop + 16} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent-line)">— ω₂ · P(ω₂)</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "4px 8px", alignItems: "center", fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        <span>apriori P(ω₁)</span>
        <input type="range" className="viz-slider" min={0.05} max={0.95} step={0.01} value={prior1}
          onChange={(e) => setPrior1(+e.target.value)} />
        <span style={{ color: "var(--text)" }}>{prior1.toFixed(2)}</span>
        <span>rozestup tříd</span>
        <input type="range" className="viz-slider" min={0.6} max={3.2} step={0.05} value={sep}
          onChange={(e) => setSep(+e.target.value)} />
        <span style={{ color: "var(--text)" }}>{sep.toFixed(2)}</span>
      </div>

      <span className="viz-readout">
        P(ω₁)={prior1.toFixed(2)} · P(ω₂)={prior2.toFixed(2)} ·{" "}
        {main != null
          ? `hranice x≈${main.toFixed(2)}${cross.length > 1 ? ` (+${cross.length - 1} další)` : ""}`
          : "tříd se nepřekrývají"}
        {" "}— zvýšení P(ω) posune hranici od dané třídy pryč
      </span>
    </div>
  );
}
