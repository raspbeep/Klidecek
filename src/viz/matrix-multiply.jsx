// matrix-multiply — click a cell of C = A·B to highlight the row of A and
// column of B whose dot product forms it. Toggle 2x2 / 3x3 and edit entries.
import { useState } from "react";

const CELL = 30, GAP = 4;

// fixed demo matrices for both sizes
const DATA = {
  2: { A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]] },
  3: { A: [[1, 2, 0], [0, 1, 3], [2, 0, 1]], B: [[1, 0, 2], [3, 1, 0], [0, 4, 1]] },
};

function gridW(n) { return n * CELL + (n - 1) * GAP; }

export default function MatrixMultiply() {
  const [n, setN] = useState(2);
  const [mats, setMats] = useState(DATA);
  const [sel, setSel] = useState([0, 0]); // [row i, col j] of C

  const A = mats[n].A, B = mats[n].B;
  const C = A.map((row, i) => B[0].map((_, j) =>
    row.reduce((s, _v, k) => s + A[i][k] * B[k][j], 0)));

  const [si, sj] = sel;
  const terms = A[si].map((_v, k) => [A[si][k], B[k][sj]]);
  const dotStr = terms.map(([a, b]) => `${a}·${b}`).join(" + ");
  const dotVal = C[si][sj];

  const setSize = (m) => { setN(m); setSel([0, 0]); };

  // layout: A | "·" | B | "=" | C, vertically centered
  const aW = gridW(n), bW = gridW(n), cW = gridW(n);
  const opW = 18;
  const totW = aW + opW + bW + opW + cW + 16;
  const totH = gridW(n) + 4;
  const ax = 2, bx = ax + aW + opW, cx = bx + bW + opW;
  const ay = 2;

  const cellRect = (gx, x, y, val, highlight, onClick) => (
    <g key={`${gx}-${x}-${y}`} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <rect x={x} y={y} width={CELL} height={CELL} rx={3}
        fill={highlight} stroke="var(--line-strong)" strokeWidth="0.6" />
      <text x={x + CELL / 2} y={y + CELL / 2 + 1} textAnchor="middle" dominantBaseline="central"
        fontSize="12" fontFamily="var(--font-mono)" fill="var(--text)">{val}</text>
    </g>
  );

  const gx = (base, j) => base + j * (CELL + GAP);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>rozměr:</span>
        {[2, 3].map((m) => (
          <button key={m} className="viz-btn" data-active={n === m} onClick={() => setSize(m)}>
            {m}×{m}
          </button>
        ))}
        <button className="viz-btn" onClick={() => setMats(DATA)}>reset čísel</button>
      </div>

      <svg viewBox={`0 0 ${totW} ${totH}`} style={{ width: "100%", maxWidth: 480, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* A — highlight selected row */}
        {A.map((row, i) => row.map((v, j) =>
          cellRect("A", gx(ax, j), gx(ay, i), v,
            i === si ? "color-mix(in oklch, var(--accent) 30%, var(--bg-card))" : "var(--bg-card)")
        ))}
        <text x={ax + aW + opW / 2} y={totH / 2} textAnchor="middle" dominantBaseline="central"
          fontSize="14" fill="var(--text-muted)">·</text>

        {/* B — highlight selected column */}
        {B.map((row, i) => row.map((v, j) =>
          cellRect("B", gx(bx, j), gx(ay, i), v,
            j === sj ? "color-mix(in oklch, var(--accent) 30%, var(--bg-card))" : "var(--bg-card)")
        ))}
        <text x={bx + bW + opW / 2} y={totH / 2} textAnchor="middle" dominantBaseline="central"
          fontSize="13" fill="var(--text-muted)">=</text>

        {/* C — clickable; selected cell is the accent */}
        {C.map((row, i) => row.map((v, j) =>
          cellRect("C", gx(cx, j), gx(ay, i), v,
            i === si && j === sj ? "var(--accent)" : "var(--bg-card)",
            () => setSel([i, j]))
        ))}
      </svg>

      <div style={{ fontSize: 12, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <div>buňka <b style={{ color: "var(--text)" }}>C[{si + 1},{sj + 1}]</b> = řádek {si + 1} matice A · sloupec {sj + 1} matice B</div>
        <div>= {dotStr} = <b style={{ color: "var(--accent)" }}>{dotVal}</b></div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Klikni na libovolnou buňku výsledku C — zvýrazní se řádek A a sloupec B, jejichž skalární součin tu buňku tvoří.
      </div>
    </div>
  );
}
