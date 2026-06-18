// feature-separability — two classes of 2D points; pick which single feature
// (x-axis, y-axis, or a diagonal combo) to keep and see how well the two
// classes separate when projected onto that 1D feature. Good feature = the
// two 1D histograms barely overlap; bad feature = they sit on top of each other.
import { useState } from "react";

const W = 300, H = 188;

// Two 2D blobs whose class separation lives ONLY along the diagonal (x+y)
// direction, while a large *shared* spread runs along the anti-diagonal (x-y).
// Result: projecting onto plain x or plain y mixes in that big spread and the
// classes overlap (bad feature); projecting onto x+y cancels it and the classes
// separate cleanly (good feature). `off` = how far the class sits along x+y.
function blob(off, n, seed) {
  const pts = [];
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const g = () => (rnd() + rnd() + rnd() - 1.5);  // ~gaussian via sum of uniforms
  for (let i = 0; i < n; i++) {
    const diagComp = off + g() * 0.4;  // small spread along separating direction
    const antiComp = g() * 3.4;        // large shared spread, orthogonal to it
    pts.push([5 + (diagComp + antiComp) / Math.SQRT2,
              5 + (diagComp - antiComp) / Math.SQRT2]);
  }
  return pts;
}

const A = blob(-0.8, 26, 7);
const B = blob(0.8, 26, 91);

// candidate 1D features: unit projection directions
const FEATURES = {
  x:    { dir: [1, 0],            label: "jen x" },
  y:    { dir: [0, 1],            label: "jen y" },
  diag: { dir: [0.7071, 0.7071], label: "x+y (úhlopříčka)" },
};

export default function FeatureSeparability() {
  const [feat, setFeat] = useState("x");
  const dir = FEATURES[feat].dir;

  const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
  const PAD_L = 8, PAD_R = 8, PAD_T = 8, PAD_B = 44;
  const PW = W - PAD_L - PAD_R;
  const PH = H - PAD_T - PAD_B;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + PH - ((y - yMin) / (yMax - yMin)) * PH;

  const proj = (p) => p[0] * dir[0] + p[1] * dir[1];
  const pa = A.map(proj), pb = B.map(proj);

  // separability score: standardized distance between class means on this 1D feature
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const std = (a, m) => Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
  const ma = mean(pa), mb = mean(pb);
  const sa = std(pa, ma), sb = std(pb, mb);
  const fisher = Math.abs(mb - ma) / Math.sqrt(sa * sa + sb * sb + 1e-9);
  const good = fisher > 1.2;

  // 1D number line for the chosen feature
  const all = [...pa, ...pb];
  const tMin = Math.min(...all) - 0.5, tMax = Math.max(...all) + 0.5;
  const toT = (t) => PAD_L + ((t - tMin) / (tMax - tMin + 1e-9)) * PW;
  const lineY = H - 14;

  const cA = "oklch(0.65 0.16 264)";   // class A — blue
  const cB = "oklch(0.62 0.18 28)";    // class B — red/orange

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>příznak:</span>
        {Object.entries(FEATURES).map(([k, v]) => (
          <button key={k} className="viz-btn" data-active={feat === k} onClick={() => setFeat(k)}>
            {v.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 440, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* frame */}
        <rect x={PAD_L} y={PAD_T} width={PW} height={PH} fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.5" />

        {/* projection direction arrow through the cloud center */}
        {(() => {
          const cx = 5, cy = 5;
          return (
            <line x1={toX(cx - 3.2 * dir[0])} y1={toY(cy - 3.2 * dir[1])}
                  x2={toX(cx + 3.2 * dir[0])} y2={toY(cy + 3.2 * dir[1])}
                  stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="4 3" />
          );
        })()}

        {/* points with thin projection ties to the 1D line */}
        {A.map((p, i) => (
          <g key={"a" + i}>
            <line x1={toX(p[0])} y1={toY(p[1])} x2={toT(pa[i])} y2={lineY} stroke={cA} strokeWidth="0.3" opacity="0.25" />
            <circle cx={toX(p[0])} cy={toY(p[1])} r="3" fill={cA} opacity="0.9" />
          </g>
        ))}
        {B.map((p, i) => (
          <g key={"b" + i}>
            <line x1={toX(p[0])} y1={toY(p[1])} x2={toT(pb[i])} y2={lineY} stroke={cB} strokeWidth="0.3" opacity="0.25" />
            <circle cx={toX(p[0])} cy={toY(p[1])} r="3" fill={cB} opacity="0.9" />
          </g>
        ))}

        {/* 1D projected feature line */}
        <line x1={PAD_L} y1={lineY} x2={W - PAD_R} y2={lineY} stroke="var(--line-strong)" />
        {pa.map((t, i) => <circle key={"ta" + i} cx={toT(t)} cy={lineY} r="2.6" fill={cA} stroke="var(--bg-inset)" strokeWidth="0.4" />)}
        {pb.map((t, i) => <circle key={"tb" + i} cx={toT(t)} cy={lineY} r="2.6" fill={cB} stroke="var(--bg-inset)" strokeWidth="0.4" />)}

        <text x={PAD_L} y={lineY - 6} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          1D příznak (projekce)
        </text>
      </svg>

      <span className="viz-readout">
        separabilita (Fisher) = <b style={{ color: good ? cA : cB }}>{fisher.toFixed(2)}</b>
        {" · "}{good ? "dobrý příznak — třídy oddělené" : "špatný příznak — třídy se překrývají"}
      </span>
    </div>
  );
}
