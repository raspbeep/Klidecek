// 1D Gaussian Mixture Model density.
// Three components with sliders for weight (pi), mean (mu), std (sigma).
// Grey curves = individual weighted components; blue curve = their sum (mixture density).
import { useState } from "react";

const COMP = [
  { color: "var(--accent)" },
  { color: "var(--accent-line)" },
  { color: "var(--text-muted)" },
];

export default function GmmDensity() {
  // each component: weight w, mean m (in [0,10]), std s
  const [comps, setComps] = useState([
    { w: 0.4, m: 2.5, s: 0.8 },
    { w: 0.35, m: 5.5, s: 1.1 },
    { w: 0.25, m: 8.0, s: 0.7 },
  ]);
  const [sel, setSel] = useState(0);

  const W = 320, H = 180;
  const x0 = 24, x1 = W - 10, yBase = H - 26, yTop = 16;

  // normalised weights (so they always sum to 1, like real pi_k)
  const wsum = comps.reduce((a, c) => a + c.w, 0) || 1;
  const pis = comps.map((c) => c.w / wsum);

  const gauss = (x, m, s) =>
    Math.exp(-((x - m) * (x - m)) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s);

  // sample the domain x in [0,10]
  const N = 160;
  const xs = Array.from({ length: N + 1 }, (_, i) => (i / N) * 10);
  const compY = comps.map((c, k) => xs.map((x) => pis[k] * gauss(x, c.m, c.s)));
  const mixY = xs.map((_, i) => compY.reduce((a, cy) => a + cy[i], 0));
  const yMax = Math.max(0.001, ...mixY) * 1.1;

  const toX = (x) => x0 + (x / 10) * (x1 - x0);
  const toY = (y) => yBase - (y / yMax) * (yBase - yTop);
  const pathOf = (ys) =>
    ys.map((y, i) => `${i === 0 ? "M" : "L"} ${toX(xs[i]).toFixed(1)} ${toY(y).toFixed(1)}`).join(" ");

  const set = (key, val) =>
    setComps((cs) => cs.map((c, i) => (i === sel ? { ...c, [key]: val } : c)));

  const c = comps[sel];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 440, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <line x1={x0} y1={yBase} x2={x1} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={x0} y1={yTop} x2={x0} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={x1} y={H - 12} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">x →</text>
        <text x={x0 - 2} y={yTop - 4} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">p(x)</text>
        {/* individual weighted components (thin, dashed) */}
        {compY.map((cy, k) => (
          <path key={k} d={pathOf(cy)} fill="none"
            stroke={COMP[k].color} strokeWidth={k === sel ? 1.6 : 1}
            strokeDasharray="3 2" opacity={k === sel ? 0.95 : 0.55} />
        ))}
        {/* mixture density (thick blue) */}
        <path d={pathOf(mixY)} fill="none" stroke="var(--accent)" strokeWidth="2.4" />
        {/* mark the selected component's mean */}
        <line x1={toX(c.m)} y1={yTop} x2={toX(c.m)} y2={yBase}
          stroke={COMP[sel].color} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
        <text x={W - 10} y={yTop + 4} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">— směs p(x)</text>
        <text x={W - 10} y={yTop + 16} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">- - komponenty πₖ𝒩</text>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>komponenta:</span>
        {comps.map((_, k) => (
          <button key={k} className="viz-btn" data-active={sel === k} onClick={() => setSel(k)}
            style={{ color: sel === k ? undefined : COMP[k].color }}>
            {k + 1}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "4px 8px", alignItems: "center", fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        <span>váha w</span>
        <input type="range" className="viz-slider" min={0.05} max={1} step={0.05} value={c.w} onChange={(e) => set("w", +e.target.value)} />
        <span style={{ color: "var(--text)" }}>π = {pis[sel].toFixed(2)}</span>
        <span>střed μ</span>
        <input type="range" className="viz-slider" min={0.5} max={9.5} step={0.1} value={c.m} onChange={(e) => set("m", +e.target.value)} />
        <span style={{ color: "var(--text)" }}>{c.m.toFixed(1)}</span>
        <span>šířka σ</span>
        <input type="range" className="viz-slider" min={0.3} max={2.5} step={0.1} value={c.s} onChange={(e) => set("s", +e.target.value)} />
        <span style={{ color: "var(--text)" }}>{c.s.toFixed(1)}</span>
      </div>
      <span className="viz-readout">
        Σπₖ = 1 (váhy se normují) · vybraná komponenta {sel + 1}: π={pis[sel].toFixed(2)}, μ={c.m.toFixed(1)}, σ={c.s.toFixed(1)}
      </span>
    </div>
  );
}
