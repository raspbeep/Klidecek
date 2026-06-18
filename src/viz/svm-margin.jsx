// Max-margin hyperplane for two linearly separable classes in 2D.
// Drag points; the separating line, margin band and support vectors update.
// We approximate the hard-margin solution: search a set of candidate normal
// directions; for each, the best offset puts the line midway between the two
// classes' extreme projections, and the margin = (gap)/2. Pick the direction
// with the widest margin. Support vectors = points sitting on either edge.
import { useState, useRef } from "react";

const W = 300, H = 200;

export default function SvmMargin() {
  // class +1 (filled) and class -1 (hollow); positions in viewBox coords
  const [pts, setPts] = useState([
    { id: 0, x: 95, y: 55, c: 1 },
    { id: 1, x: 70, y: 95, c: 1 },
    { id: 2, x: 120, y: 120, c: 1 },
    { id: 3, x: 55, y: 140, c: 1 },
    { id: 4, x: 215, y: 60, c: -1 },
    { id: 5, x: 245, y: 100, c: -1 },
    { id: 6, x: 200, y: 130, c: -1 },
    { id: 7, x: 250, y: 150, c: -1 },
  ]);
  const drag = useRef(null);
  const svgRef = useRef(null);

  // --- solve approximate max-margin over candidate directions ---
  let best = null;
  const NA = 180;
  for (let k = 0; k < NA; k++) {
    const ang = (Math.PI * k) / NA; // 0..pi, direction of normal w
    const wx = Math.cos(ang), wy = Math.sin(ang);
    let posMin = Infinity, negMax = -Infinity, posArg = -1, negArg = -1;
    for (const p of pts) {
      const proj = wx * p.x + wy * p.y;
      if (p.c === 1) { if (proj < posMin) { posMin = proj; posArg = p.id; } }
      else { if (proj > negMax) { negMax = proj; negArg = p.id; } }
    }
    const gap = posMin - negMax; // positive if separable in this direction
    const margin = gap / 2;
    if (best === null || margin > best.margin) {
      best = { wx, wy, margin, mid: (posMin + negMax) / 2, gap, posArg, negArg };
    }
  }
  const separable = best.gap > 0;
  // line: wx*x + wy*y = mid. edges at mid +/- margin (i.e. proj = posMin / negMax)
  const { wx, wy, mid, margin } = best;

  // identify support vectors: closest to their class edge (within tolerance)
  const tol = 4;
  const svIds = new Set();
  if (separable) {
    const posMin = mid + margin, negMax = mid - margin;
    for (const p of pts) {
      const proj = wx * p.x + wy * p.y;
      if (p.c === 1 && Math.abs(proj - posMin) < tol) svIds.add(p.id);
      if (p.c === -1 && Math.abs(proj - negMax) < tol) svIds.add(p.id);
    }
  }

  // helper: draw a line of form wx*x + wy*y = c clipped to the box
  const lineForLevel = (c) => {
    // parametric: point on line + tangent direction (-wy, wx)
    const px = wx * c, py = wy * c; // closest point to origin on the line
    const tx = -wy, ty = wx;
    const ts = [];
    // intersect with box edges
    const cand = [];
    if (Math.abs(tx) > 1e-9) { cand.push((0 - px) / tx, (W - px) / tx); }
    if (Math.abs(ty) > 1e-9) { cand.push((0 - py) / ty, (H - py) / ty); }
    for (const t of cand) {
      const X = px + tx * t, Y = py + ty * t;
      if (X >= -0.5 && X <= W + 0.5 && Y >= -0.5 && Y <= H + 0.5) ts.push(t);
    }
    if (ts.length < 2) return null;
    ts.sort((a, b) => a - b);
    const t0 = ts[0], t1 = ts[ts.length - 1];
    return { x1: px + tx * t0, y1: py + ty * t0, x2: px + tx * t1, y2: py + ty * t1 };
  };

  const mainL = separable ? lineForLevel(mid) : null;
  const posL = separable ? lineForLevel(mid + margin) : null;
  const negL = separable ? lineForLevel(mid - margin) : null;

  // --- dragging ---
  const toSvg = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
    const cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H };
  };
  const onMove = (e) => {
    if (drag.current === null) return;
    const { x, y } = toSvg(e);
    setPts((ps) => ps.map((p) => p.id === drag.current
      ? { ...p, x: Math.max(8, Math.min(W - 8, x)), y: Math.max(8, Math.min(H - 8, y)) }
      : p));
  };
  const end = () => { drag.current = null; };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", maxWidth: 460, display: "block", touchAction: "none" }}
        onMouseMove={onMove} onMouseUp={end} onMouseLeave={end}
        onTouchMove={onMove} onTouchEnd={end}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* margin band */}
        {separable && posL && negL && (
          <polygon
            points={`${posL.x1},${posL.y1} ${posL.x2},${posL.y2} ${negL.x2},${negL.y2} ${negL.x1},${negL.y1}`}
            fill="var(--accent)" opacity="0.10" />
        )}
        {/* margin edges */}
        {posL && <line x1={posL.x1} y1={posL.y1} x2={posL.x2} y2={posL.y2}
          stroke="var(--accent-line)" strokeWidth="1" strokeDasharray="4 3" />}
        {negL && <line x1={negL.x1} y1={negL.y1} x2={negL.x2} y2={negL.y2}
          stroke="var(--accent-line)" strokeWidth="1" strokeDasharray="4 3" />}
        {/* separating hyperplane */}
        {mainL && <line x1={mainL.x1} y1={mainL.y1} x2={mainL.x2} y2={mainL.y2}
          stroke="var(--accent)" strokeWidth="1.8" />}
        {!separable && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="11"
            fontFamily="var(--font-mono)" fill="var(--text-muted)">
            třídy se překrývají — hard margin nemá řešení
          </text>
        )}

        {/* points */}
        {pts.map((p) => {
          const isSv = svIds.has(p.id);
          return (
            <g key={p.id}
              onMouseDown={() => { drag.current = p.id; }}
              onTouchStart={() => { drag.current = p.id; }}
              style={{ cursor: "grab" }}>
              {isSv && <circle cx={p.x} cy={p.y} r="9.5" fill="none"
                stroke="var(--accent)" strokeWidth="2" />}
              <circle cx={p.x} cy={p.y} r="6"
                fill={p.c === 1 ? "var(--accent)" : "var(--bg-card)"}
                stroke={p.c === 1 ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth="1.5" />
            </g>
          );
        })}

        <text x={8} y={H - 19} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          ● +1 · ○ −1 · táhni body
        </text>
        <text x={8} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          kroužek = support vektor
        </text>
      </svg>

      <span className="viz-readout">
        {separable
          ? `margin ≈ ${(2 * margin).toFixed(0)} px · support vektorů: ${svIds.size}`
          : "neseparabilní — přesuň body, aby šly oddělit přímkou"}
      </span>
    </div>
  );
}
