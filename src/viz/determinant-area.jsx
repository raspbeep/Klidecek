// determinant-area — two draggable column vectors u=(a,c), v=(b,d) of a 2x2
// matrix. The parallelogram they span has area = |det|, sign = orientation.
// Drag to see det = ad - bc change; det -> 0 as vectors become collinear.
import { useState } from "react";

const W = 300, H = 220;
const ORIG = [W / 2, H / 2 + 20];
const SCALE = 34; // px per unit

// data-space (math units, y up) <-> screen
const toX = (x) => ORIG[0] + x * SCALE;
const toY = (y) => ORIG[1] - y * SCALE;
const pxToX = (px) => (px - ORIG[0]) / SCALE;
const pxToY = (py) => (ORIG[1] - py) / SCALE;

export default function DeterminantArea() {
  // u = first column (a,c); v = second column (b,d)
  const [u, setU] = useState([2, 0.5]);
  const [v, setV] = useState([0.7, 2]);
  const [drag, setDrag] = useState(null); // "u" | "v" | null

  const a = u[0], c = u[1], b = v[0], d = v[1];
  const det = a * d - b * c;
  const area = Math.abs(det);
  const collinear = Math.abs(det) < 0.06;

  function onMove(e) {
    if (!drag) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    const nx = Math.max(-3.6, Math.min(3.6, Math.round(pxToX(px) * 2) / 2));
    const ny = Math.max(-2.4, Math.min(2.4, Math.round(pxToY(py) * 2) / 2));
    (drag === "u" ? setU : setV)([nx, ny]);
  }

  // parallelogram corners: 0, u, u+v, v
  const poly = [[0, 0], u, [a + b, c + d], v]
    .map(([x, y]) => `${toX(x)},${toY(y)}`).join(" ");

  const fillCol = collinear
    ? "color-mix(in oklch, var(--text-faint) 25%, transparent)"
    : det >= 0
      ? "color-mix(in oklch, var(--accent) 22%, transparent)"
      : "color-mix(in oklch, oklch(0.62 0.19 22) 24%, transparent)";

  const Vec = ({ p, color, label, name }) => (
    <g>
      <line x1={toX(0)} y1={toY(0)} x2={toX(p[0])} y2={toY(p[1])}
        stroke={color} strokeWidth="2" markerEnd={`url(#ar-${name})`} />
      <circle cx={toX(p[0])} cy={toY(p[1])} r="7" fill={color} opacity="0.9"
        style={{ cursor: "grab" }} onMouseDown={() => setDrag(name)} />
      <text x={toX(p[0]) + (p[0] >= 0 ? 10 : -10)} y={toY(p[1]) - 9}
        textAnchor={p[0] >= 0 ? "start" : "end"}
        fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill={color}>{label}</text>
    </g>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", maxWidth: 420, background: "var(--bg-inset)", borderRadius: 4, userSelect: "none", touchAction: "none" }}
        onMouseMove={onMove} onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}>
        <defs>
          <marker id="ar-u" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
          </marker>
          <marker id="ar-v" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="oklch(0.6 0.18 145)" />
          </marker>
        </defs>

        {/* grid */}
        {Array.from({ length: 9 }, (_, i) => i - 4).map((g) => (
          <g key={g}>
            <line x1={toX(g)} y1={0} x2={toX(g)} y2={H} stroke="var(--line)" strokeWidth="0.4" opacity="0.5" />
            <line x1={0} y1={toY(g)} x2={W} y2={toY(g)} stroke="var(--line)" strokeWidth="0.4" opacity="0.5" />
          </g>
        ))}
        {/* axes */}
        <line x1={0} y1={toY(0)} x2={W} y2={toY(0)} stroke="var(--line-strong)" strokeWidth="0.8" />
        <line x1={toX(0)} y1={0} x2={toX(0)} y2={H} stroke="var(--line-strong)" strokeWidth="0.8" />

        {/* parallelogram */}
        <polygon points={poly} fill={fillCol}
          stroke={collinear ? "var(--text-faint)" : det >= 0 ? "var(--accent)" : "oklch(0.62 0.19 22)"}
          strokeWidth="1.2" strokeDasharray={collinear ? "4 3" : "0"} />

        <Vec p={u} color="var(--accent)" label="u=(a,c)" name="u" />
        <Vec p={v} color="oklch(0.6 0.18 145)" label="v=(b,d)" name="v" />

        <text x={6} y={14} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          táhni hroty vektorů
        </text>
      </svg>

      <div style={{ fontSize: 12, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <div>A = [[{a}, {b}], [{c}, {d}]] (sloupce = vektory u, v)</div>
        <div>det = a·d − b·c = {a}·{d} − {b}·{c} = <b style={{ color: det >= 0 ? "var(--accent)" : "oklch(0.62 0.19 22)" }}>{det.toFixed(2)}</b></div>
        <div>obsah rovnoběžníku = |det| = <b style={{ color: "var(--text)" }}>{area.toFixed(2)}</b>
          {" · "}orientace: {collinear ? "—" : det >= 0 ? "+ (kladná)" : "− (převrácená)"}</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        {collinear
          ? "det ≈ 0 — vektory jsou kolineární (leží na jedné přímce), rovnoběžník zdegeneroval, matice je singulární."
          : "Posuň vektory na jednu přímku → obsah klesne na 0 a det = 0 (singulární matice). Záporný det = zrcadlení orientace."}
      </div>
    </div>
  );
}
