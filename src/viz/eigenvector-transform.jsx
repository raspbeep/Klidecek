// eigenvector-transform — drag an input unit vector x; show its image A·x.
// For most directions x rotates; along eigenvector directions it stays on the
// same line, only scaled by lambda. Switch matrices to see the eigenlines move
// (and a rotation that has no real eigenvectors).
import { useState } from "react";

const W = 300, H = 240;
const ORIG = [W / 2, H / 2 + 8];
const SCALE = 38;
const toX = (x) => ORIG[0] + x * SCALE;
const toY = (y) => ORIG[1] - y * SCALE;

// matrices with their (real) eigen-decomposition precomputed for the figure
const MATS = {
  "škálování": {
    A: [[2, 0], [0, 0.5]],
    eig: [{ v: [1, 0], l: 2 }, { v: [0, 1], l: 0.5 }],
  },
  "smyk": {
    A: [[1, 1], [0, 1]],
    eig: [{ v: [1, 0], l: 1 }], // shear: only one eigenline (x-axis), lambda=1
  },
  "symetr.": {
    A: [[2, 1], [1, 2]],
    eig: [{ v: [0.7071, 0.7071], l: 3 }, { v: [-0.7071, 0.7071], l: 1 }],
  },
  "rotace 60°": {
    A: [[0.5, -0.866], [0.866, 0.5]],
    eig: [], // rotation: no real eigenvectors
  },
};

function apply(A, [x, y]) {
  return [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
}

export default function EigenvectorTransform() {
  const names = Object.keys(MATS);
  const [name, setName] = useState("symetr.");
  const [ang, setAng] = useState(20); // input direction in degrees
  const [dragging, setDragging] = useState(false);
  const { A, eig } = MATS[name];

  // map a mouse position on the svg to the input direction (degrees on the circle)
  function angleFromEvent(e) {
    // resolve the <svg> box even when the event fires on the handle circle
    const svg = e.currentTarget.closest("svg") || e.currentTarget;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    const dx = (px - ORIG[0]) / SCALE;
    const dy = (ORIG[1] - py) / SCALE; // y up in data-space
    if (dx === 0 && dy === 0) return;
    let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
    if (deg < 0) deg += 360;
    setAng(deg % 360);
  }

  function onMove(e) {
    if (!dragging) return;
    angleFromEvent(e);
  }

  const rad = (ang * Math.PI) / 180;
  const x = [Math.cos(rad), Math.sin(rad)]; // unit input vector
  const Ax = apply(A, x);

  // is current direction (almost) an eigenvector? -> Ax parallel to x
  const cross = x[0] * Ax[1] - x[1] * Ax[0];
  const onEigen = Math.abs(cross) < 0.04 && eig.length > 0;

  const fmt = (v) => `(${v[0].toFixed(2)}, ${v[1].toFixed(2)})`;

  const Arrow = ({ p, color, name: mn, width = 2.2 }) => (
    <line x1={toX(0)} y1={toY(0)} x2={toX(p[0])} y2={toY(p[1])}
      stroke={color} strokeWidth={width} markerEnd={`url(#ev-${mn})`} />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>matice:</span>
        {names.map((nm) => (
          <button key={nm} className="viz-btn" data-active={name === nm} onClick={() => setName(nm)}>
            {nm}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", maxWidth: 420, background: "var(--bg-inset)", borderRadius: 4, userSelect: "none", touchAction: "none" }}
        onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}>
        <defs>
          <marker id="ev-in" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-muted)" />
          </marker>
          <marker id="ev-out" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* grid + axes */}
        {Array.from({ length: 7 }, (_, i) => i - 3).map((g) => (
          <g key={g}>
            <line x1={toX(g)} y1={0} x2={toX(g)} y2={H} stroke="var(--line)" strokeWidth="0.4" opacity="0.5" />
            <line x1={0} y1={toY(g)} x2={W} y2={toY(g)} stroke="var(--line)" strokeWidth="0.4" opacity="0.5" />
          </g>
        ))}
        <line x1={0} y1={toY(0)} x2={W} y2={toY(0)} stroke="var(--line-strong)" strokeWidth="0.8" />
        <line x1={toX(0)} y1={0} x2={toX(0)} y2={H} stroke="var(--line-strong)" strokeWidth="0.8" />
        <circle cx={toX(0)} cy={toY(0)} r={SCALE} fill="none" stroke="var(--line-strong)" strokeWidth="0.6" strokeDasharray="3 3" />

        {/* eigenlines (dashed full lines through origin) */}
        {eig.map((e, i) => {
          const s = 3;
          return (
            <line key={i}
              x1={toX(-s * e.v[0])} y1={toY(-s * e.v[1])}
              x2={toX(s * e.v[0])} y2={toY(s * e.v[1])}
              stroke="oklch(0.6 0.18 145)" strokeWidth="1.3" strokeDasharray="5 3" opacity="0.85" />
          );
        })}
        {eig.map((e, i) => (
          <text key={"l" + i} x={toX(2.6 * e.v[0])} y={toY(2.6 * e.v[1]) - 4}
            textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 145)">
            λ={e.l}
          </text>
        ))}

        {/* image vector A·x (accent) */}
        <Arrow p={Ax} color="var(--accent)" name="out" width={2.6} />
        {/* input unit vector x */}
        <Arrow p={x} color="var(--text-muted)" name="in" />
        {/* draggable handle on the input vector */}
        <circle cx={toX(x[0])} cy={toY(x[1])} r="7" fill="var(--text)" opacity="0.85"
          style={{ cursor: "grab" }}
          onMouseDown={(e) => { setDragging(true); angleFromEvent(e); }} />

        {onEigen && (
          <text x={W / 2} y={16} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700" fill="oklch(0.6 0.18 145)">
            jsi na vlastním směru — Ax = λx
          </text>
        )}
        <text x={6} y={H - 30} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">táhni kolečko po kružnici (nebo použij slider)</text>
        <text x={6} y={H - 18} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">x = vstup (šedá), Ax = obraz (akcent)</text>
        <text x={6} y={H - 6} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">čárkovaně = vlastní směry</text>
      </svg>

      <input type="range" className="viz-slider" min={0} max={359} value={ang}
        onChange={(e) => setAng(+e.target.value)} style={{ width: "100%" }} />
      <span className="viz-readout">
        směr x = {ang}° · x = {fmt(x)} · Ax = {fmt(Ax)}
        {onEigen ? " · ✓ vlastní směr" : eig.length === 0 ? " · (rotace: žádné reálné vl. směry)" : ""}
      </span>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Otáčej vstupním vektorem x. Obecně se Ax stočí mimo přímku x. Když x trefíš na čárkovanou vlastní přímku, Ax na ní zůstane a jen se přeškáluje λ-krát. „rotace 60°" žádné reálné vlastní směry nemá — Ax se stočí vždy.
      </div>
    </div>
  );
}
