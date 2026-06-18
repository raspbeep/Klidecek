// Cramer's rule for a 2x2 system, shown geometrically as two lines.
// Sliders set the coefficients of  a1 x + b1 y = c1  and  a2 x + b2 y = c2.
// The intersection point = the solution; the panel computes det(A), det(A1),
// det(A2) and the ratios. When det(A) -> 0 the lines become parallel.
import { useState } from "react";

export default function CramerLines() {
  // start with the worked example: 2x + y = 5 ; x - y = 1  ->  (2, 1)
  const [a1, setA1] = useState(2);
  const [b1, setB1] = useState(1);
  const [c1, setC1] = useState(5);
  const [a2, setA2] = useState(1);
  const [b2, setB2] = useState(-1);
  const [c2, setC2] = useState(1);

  const W = 300, H = 200;
  const R = 6; // world view: x,y in [-R, R]
  const pad = 14;
  const sx = (x) => pad + ((x + R) / (2 * R)) * (W - 2 * pad);
  const sy = (y) => H - pad - ((y + R) / (2 * R)) * (H - 2 * pad);

  // determinants (Cramer)
  const detA = a1 * b2 - a2 * b1;
  const detA1 = c1 * b2 - c2 * b1; // x-column replaced by c
  const detA2 = a1 * c2 - a2 * c1; // y-column replaced by c
  const singular = Math.abs(detA) < 1e-9;
  const x = singular ? null : detA1 / detA;
  const y = singular ? null : detA2 / detA;

  // For a line a*X + b*Y = c, return two endpoints clipped to the [-R,R] box.
  function linePts(a, b, c) {
    const pts = [];
    // intersections with the four borders X=±R, Y=±R
    if (Math.abs(b) > 1e-9) {
      for (const X of [-R, R]) {
        const Y = (c - a * X) / b;
        if (Y >= -R - 1e-6 && Y <= R + 1e-6) pts.push([X, Y]);
      }
    }
    if (Math.abs(a) > 1e-9) {
      for (const Y of [-R, R]) {
        const X = (c - b * Y) / a;
        if (X >= -R - 1e-6 && X <= R + 1e-6) pts.push([X, Y]);
      }
    }
    if (pts.length < 2) return null;
    // Multiple borders can report the SAME corner (e.g. a diagonal through two
    // opposite corners hits both an X=±R and a Y=±R loop at the same point).
    // Picking pts[0] and pts[last] could then return two identical points → a
    // degenerate, invisible segment. Pick the two farthest-apart points instead.
    let best = null, bestD = -1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i][0] - pts[j][0];
        const dy = pts[i][1] - pts[j][1];
        const d = dx * dx + dy * dy;
        if (d > bestD) { bestD = d; best = [pts[i], pts[j]]; }
      }
    }
    if (!best || bestD < 1e-12) return null;
    return best;
  }

  const L1 = linePts(a1, b1, c1);
  const L2 = linePts(a2, b2, c2);

  const ctrls = [
    ["a₁", a1, setA1], ["b₁", b1, setB1], ["c₁", c1, setC1],
    ["a₂", a2, setA2], ["b₂", b2, setB2], ["c₂", c2, setC2],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <line x1={sx(-R)} y1={sy(0)} x2={sx(R)} y2={sy(0)} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={sx(0)} y1={sy(-R)} x2={sx(0)} y2={sy(R)} stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={sx(R) - 4} y={sy(0) - 4} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">x</text>
        <text x={sx(0) + 4} y={sy(R) + 9} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">y</text>

        {/* line 1 */}
        {L1 && (
          <line x1={sx(L1[0][0])} y1={sy(L1[0][1])} x2={sx(L1[1][0])} y2={sy(L1[1][1])}
            stroke="var(--accent)" strokeWidth="1.8" />
        )}
        {/* line 2 */}
        {L2 && (
          <line x1={sx(L2[0][0])} y1={sy(L2[0][1])} x2={sx(L2[1][0])} y2={sy(L2[1][1])}
            stroke="var(--accent-line)" strokeWidth="1.8" />
        )}

        {/* intersection / solution */}
        {!singular && x !== null && Math.abs(x) <= R && Math.abs(y) <= R && (
          <>
            <line x1={sx(x)} y1={sy(0)} x2={sx(x)} y2={sy(y)} stroke="var(--text-faint)" strokeWidth="0.6" strokeDasharray="2 2" />
            <line x1={sx(0)} y1={sy(y)} x2={sx(x)} y2={sy(y)} stroke="var(--text-faint)" strokeWidth="0.6" strokeDasharray="2 2" />
            <circle cx={sx(x)} cy={sy(y)} r="4.5" fill="var(--text)" stroke="var(--bg-inset)" strokeWidth="1.2" />
            <text x={sx(x) + 7} y={sy(y) - 6} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text)">
              ({x.toFixed(1)}, {y.toFixed(1)})
            </text>
          </>
        )}
        {singular && (
          <text x={W / 2} y={16} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)">
            det(A) = 0 → rovnoběžné přímky
          </text>
        )}
      </svg>

      <div className="viz-controls" style={{ flexWrap: "wrap", gap: 6 }}>
        {ctrls.map(([lbl, val, set]) => (
          <label key={lbl} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            <span style={{ minWidth: 16 }}>{lbl}</span>
            <input type="range" className="viz-slider" min={-5} max={5} step={1} value={val}
              onChange={(e) => set(+e.target.value)} style={{ width: 70 }} />
            <b style={{ color: "var(--text)", minWidth: 14, textAlign: "right" }}>{val}</b>
          </label>
        ))}
      </div>

      <div style={{ fontSize: 11.5, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <div>
          <b style={{ color: "var(--accent)" }}>{a1}</b>x + <b style={{ color: "var(--accent)" }}>{b1}</b>y = {c1}{"  ·  "}
          <b style={{ color: "var(--accent-line)" }}>{a2}</b>x + <b style={{ color: "var(--accent-line)" }}>{b2}</b>y = {c2}
        </div>
        <div>det(A) = {a1}·{b2} − {a2}·{b1} = <b style={{ color: singular ? "var(--accent)" : "var(--text)" }}>{detA}</b></div>
        {singular ? (
          <div style={{ color: "var(--accent)" }}>det(A)=0 → Cramer nelze použít (žádné / nekonečně mnoho řešení)</div>
        ) : (
          <>
            <div>x = det(A₁)/det(A) = {detA1}/{detA} = <b style={{ color: "var(--text)" }}>{x.toFixed(3)}</b></div>
            <div>y = det(A₂)/det(A) = {detA2}/{detA} = <b style={{ color: "var(--text)" }}>{y.toFixed(3)}</b></div>
          </>
        )}
      </div>
    </div>
  );
}
