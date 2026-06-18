// Kernel SVM on non-linearly separable data (two concentric rings).
// Toggle linear vs RBF kernel; gamma slider reshapes the RBF boundary.
// Score(x) = sum_i y_i * K(x, x_i); decision boundary = where score crosses 0.
// Linear kernel can only make a straight cut (it fails on rings); RBF curves
// around the rings. Too-small gamma -> boundary so smooth it collapses (the +1
// region vanishes => underfit, nonzero errors); large gamma -> tight blobs.
import { useState, useMemo } from "react";

const W = 280, H = 200;
const CX = 140, CY = 100;

// build two rings: inner = class +1, outer = class -1
const TRAIN = (() => {
  const out = [];
  const ring = (r, c, n, jitter) => {
    for (let k = 0; k < n; k++) {
      const a = (2 * Math.PI * k) / n + 0.3 * c;
      const rr = r + (((k * 53) % 11) - 5) * jitter;
      out.push({ x: CX + rr * Math.cos(a), y: CY + rr * Math.sin(a) * 0.78, c });
    }
  };
  ring(26, 1, 9, 0.4);   // inner ring, class +1
  ring(70, -1, 14, 0.3); // outer ring, class -1
  return out;
})();

export default function SvmKernel() {
  const [kernel, setKernel] = useState("rbf");
  const [gExp, setGExp] = useState(-3.0); // log10(gamma)
  const gamma = Math.pow(10, gExp);

  // score at a point
  const score = (px, py) => {
    let s = 0;
    for (const p of TRAIN) {
      const dx = px - p.x, dy = py - p.y;
      let K;
      if (kernel === "linear") {
        // linear kernel ~ dot product in centered coords (only a straight cut)
        K = ((px - CX) * (p.x - CX) + (py - CY) * (p.y - CY)) / 4000;
      } else {
        K = Math.exp(-gamma * (dx * dx + dy * dy));
      }
      s += p.c * K;
    }
    return s;
  };

  // sample a coarse grid -> mark each cell's predicted class for the shaded map
  const STEP = 8;
  const { cells, errors } = useMemo(() => {
    const cells = [];
    for (let gx = 0; gx < W; gx += STEP) {
      for (let gy = 0; gy < H; gy += STEP) {
        const s = score(gx + STEP / 2, gy + STEP / 2);
        cells.push({ gx, gy, pos: s >= 0 });
      }
    }
    let errors = 0;
    for (const p of TRAIN) { if ((score(p.x, p.y) >= 0 ? 1 : -1) !== p.c) errors++; }
    return { cells, errors };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kernel, gExp]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 440, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* decision regions */}
        {cells.map((c, i) => (
          <rect key={i} x={c.gx} y={c.gy} width={STEP} height={STEP}
            fill={c.pos ? "var(--accent)" : "var(--line-strong)"}
            opacity={c.pos ? 0.16 : 0.08} />
        ))}

        {/* training points */}
        {TRAIN.map((p, i) => {
          const wrong = (score(p.x, p.y) >= 0 ? 1 : -1) !== p.c;
          return (
            <g key={i}>
              {wrong && <circle cx={p.x} cy={p.y} r="6.5" fill="none"
                stroke="oklch(0.62 0.2 25)" strokeWidth="2" />}
              <circle cx={p.x} cy={p.y} r="4.2"
                fill={p.c === 1 ? "var(--accent)" : "var(--bg-card)"}
                stroke={p.c === 1 ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth="1.3" />
            </g>
          );
        })}

        <text x={8} y={H - 18} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          ● vnitřní (+1) · ○ vnější (−1)
        </text>
        <text x={8} y={H - 7} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          plocha = predikovaná třída
        </text>
      </svg>

      <div className="viz-controls">
        {["linear", "rbf"].map((k) => (
          <button key={k} className="viz-btn" data-active={kernel === k}
            onClick={() => setKernel(k)}>
            {k === "linear" ? "lineární" : "RBF"}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>γ</span>
        <input type="range" className="viz-slider" min={-4} max={-1.6} step={0.05}
          value={gExp} disabled={kernel === "linear"}
          onChange={(e) => setGExp(+e.target.value)}
          style={{ flex: 1, minWidth: 100, opacity: kernel === "linear" ? 0.4 : 1 }} />
      </div>

      <span className="viz-readout">
        {kernel === "linear"
          ? `lineární jádro: jen přímý řez → chyby: ${errors} z ${TRAIN.length}`
          : `RBF · γ=${gamma.toFixed(4)} · ${errors > 0
              ? `moc hladká, globální → podtrénováno, vnitřní kruh zmizel`
              : gExp > -2.2 ? "těsné ostrůvky kolem bodů" : "zakřivená hranice obkresluje kruhy"} · chyby: ${errors} z ${TRAIN.length}`}
      </span>
    </div>
  );
}
