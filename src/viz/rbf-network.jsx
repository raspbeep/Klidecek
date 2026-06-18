// RBF function approximation: build a target curve from a weighted sum of
// Gaussian "bumps". Pick a bump, drag its center / width / weight and watch the
// network output (sum of bumps) move toward the target. Shows locality: each
// bump only affects its own neighborhood.
import { useState } from "react";

export default function RbfNetwork() {
  const W = 320, H = 190;
  const x0 = 24, x1 = W - 12;     // plot x range (px)
  const yMid = 96, yAmp = 64;     // plot y center / amplitude (px)

  // target function on domain [0,1]: a wiggly curve to be fitted
  const target = (t) =>
    0.55 * Math.sin(2 * Math.PI * 1.1 * t) +
    0.30 * Math.sin(2 * Math.PI * 2.3 * t + 0.8);

  // three RBF neurons: center c in [0,1], width s, output weight w
  const [bumps, setBumps] = useState([
    { c: 0.18, s: 0.10, w: 0.7 },
    { c: 0.50, s: 0.12, w: -0.6 },
    { c: 0.80, s: 0.10, w: 0.5 },
  ]);
  const [sel, setSel] = useState(0);

  const gauss = (t, b) => Math.exp(-((t - b.c) ** 2) / (2 * b.s * b.s));
  const netOut = (t) => bumps.reduce((acc, b) => acc + b.w * gauss(t, b), 0);

  // sampling
  const N = 90;
  const ts = Array.from({ length: N + 1 }, (_, i) => i / N);
  const toX = (t) => x0 + t * (x1 - x0);
  // clamp into the viewBox so the summed output curve can't escape the plot
  // even when all weights/widths are pushed to their extremes
  const toY = (v) => Math.max(2, Math.min(H - 2, yMid - v * yAmp));

  const pathOf = (fn) =>
    ts.map((t, i) => `${i === 0 ? "M" : "L"} ${toX(t).toFixed(1)} ${toY(fn(t)).toFixed(1)}`).join(" ");

  // mean squared error against target (readout)
  const mse =
    ts.reduce((acc, t) => acc + (netOut(t) - target(t)) ** 2, 0) / (N + 1);

  const upd = (key, val) => {
    setBumps((bs) => bs.map((b, i) => (i === sel ? { ...b, [key]: val } : b)));
  };

  const b = bumps[sel];
  const bumpColor = (i) =>
    i === sel ? "var(--accent)" : "var(--text-faint)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* zero axis */}
        <line x1={x0} y1={yMid} x2={x1} y2={yMid} stroke="var(--line-strong)" strokeWidth="0.5" />
        {/* individual weighted bumps (faint, selected highlighted) */}
        {bumps.map((bb, i) => (
          <path key={i} d={pathOf((t) => bb.w * gauss(t, bb))}
            fill="none" stroke={bumpColor(i)} strokeWidth={i === sel ? 1.3 : 1}
            strokeDasharray="3 3" opacity={i === sel ? 0.95 : 0.5} />
        ))}
        {/* target curve */}
        <path d={pathOf(target)} fill="none" stroke="var(--text-muted)" strokeWidth="1.6" />
        {/* network output = sum of bumps */}
        <path d={pathOf(netOut)} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {/* center markers on the axis */}
        {bumps.map((bb, i) => (
          <g key={"c" + i} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
            <circle cx={toX(bb.c)} cy={yMid} r={i === sel ? 4 : 3}
              fill={i === sel ? "var(--accent)" : "var(--bg-card)"}
              stroke={bumpColor(i)} strokeWidth="1.3" />
            <text x={toX(bb.c)} y={yMid + 14} textAnchor="middle" fontSize="8"
              fontFamily="var(--font-mono)" fill={bumpColor(i)}>c{i + 1}</text>
          </g>
        ))}
        <text x={x1} y={14} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">— cíl</text>
        <text x={x1} y={26} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">— výstup sítě (Σ wⱼ·φⱼ)</text>
        <text x={x0} y={H - 8} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">přerušované = jednotlivé RBF kopečky</text>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>neuron:</span>
        {bumps.map((_, i) => (
          <button key={i} className="viz-btn" data-active={sel === i} onClick={() => setSel(i)}>
            φ{i + 1}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <span style={{ width: 96 }}>centrum c{sel + 1} = {b.c.toFixed(2)}</span>
          <input type="range" className="viz-slider" min={0} max={1} step={0.01}
            value={b.c} onChange={(e) => upd("c", +e.target.value)} style={{ flex: 1 }} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <span style={{ width: 96 }}>šířka σ{sel + 1} = {b.s.toFixed(2)}</span>
          <input type="range" className="viz-slider" min={0.03} max={0.30} step={0.01}
            value={b.s} onChange={(e) => upd("s", +e.target.value)} style={{ flex: 1 }} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <span style={{ width: 96 }}>váha w{sel + 1} = {b.w.toFixed(2)}</span>
          <input type="range" className="viz-slider" min={-1} max={1} step={0.05}
            value={b.w} onChange={(e) => upd("w", +e.target.value)} style={{ flex: 1 }} />
        </label>
      </div>

      <span className="viz-readout">
        chyba aproximace (MSE) = {mse.toFixed(4)} · čím níž, tím lépe výstup sedí na cíl
      </span>
    </div>
  );
}
