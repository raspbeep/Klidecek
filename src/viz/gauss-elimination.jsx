// Step-through Gaussian elimination on a 3x4 augmented matrix.
// Each "next step" applies one elementary row operation toward row-echelon
// form and then RREF; cells that change are highlighted, pivots are marked.
import { useState } from "react";

// A fixed worked example: x + y + z = 6 ; 2x - y + z = 3 ; x + 2y - z = 3
// solution (9/7, 15/7, 18/7). We list every intermediate matrix together with
// the operation that produced it and the set of (row,col) cells that changed.
const STEPS = [
  {
    m: [
      [1, 1, 1, 6],
      [2, -1, 1, 3],
      [1, 2, -1, 3],
    ],
    op: "rozšířená matice soustavy",
    changed: [],
    pivots: [],
  },
  {
    m: [
      [1, 1, 1, 6],
      [0, -3, -1, -9],
      [1, 2, -1, 3],
    ],
    op: "R₂ ← R₂ − 2·R₁  (nula pod 1. pivotem)",
    changed: [[1, 0], [1, 1], [1, 2], [1, 3]],
    pivots: [[0, 0]],
  },
  {
    m: [
      [1, 1, 1, 6],
      [0, -3, -1, -9],
      [0, 1, -2, -3],
    ],
    op: "R₃ ← R₃ − R₁  (nula pod 1. pivotem)",
    changed: [[2, 0], [2, 1], [2, 2], [2, 3]],
    pivots: [[0, 0]],
  },
  {
    m: [
      [1, 1, 1, 6],
      [0, -3, -1, -9],
      [0, 0, -7, -18],
    ],
    op: "R₃ ← 3·R₃ + R₂  (nula pod 2. pivotem) → SCHODOVITÝ TVAR",
    changed: [[2, 1], [2, 2], [2, 3]],
    pivots: [[0, 0], [1, 1]],
  },
  {
    m: [
      [1, 1, 1, 6],
      [0, 1, 1 / 3, 3],
      [0, 0, 1, 18 / 7],
    ],
    op: "normalizace pivotů na 1 (R₂÷−3, R₃÷−7)",
    changed: [[1, 1], [1, 2], [1, 3], [2, 2], [2, 3]],
    pivots: [[0, 0], [1, 1], [2, 2]],
  },
  {
    m: [
      [1, 1, 0, 6 - 18 / 7],
      [0, 1, 0, 15 / 7],
      [0, 0, 1, 18 / 7],
    ],
    op: "eliminace NAD 3. pivotem (R₁,R₂ −= sloupec z)",
    changed: [[0, 2], [0, 3], [1, 2], [1, 3]],
    pivots: [[0, 0], [1, 1], [2, 2]],
  },
  {
    m: [
      [1, 0, 0, 9 / 7],
      [0, 1, 0, 15 / 7],
      [0, 0, 1, 18 / 7],
    ],
    op: "eliminace NAD 2. pivotem (R₁ −= sloupec y) → RREF",
    changed: [[0, 1], [0, 3]],
    pivots: [[0, 0], [1, 1], [2, 2]],
  },
];

const COLS = ["x", "y", "z", "="];

function fmt(v) {
  const r = Math.round(v);
  if (Math.abs(v - r) < 1e-9) return String(r);
  // show small fractions nicely for the /7 and /3 values
  for (const den of [3, 7, 21]) {
    const num = v * den;
    if (Math.abs(num - Math.round(num)) < 1e-6) return `${Math.round(num)}/${den}`;
  }
  return v.toFixed(2);
}

export default function GaussElimination() {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const W = 320, H = 178;
  const x0 = 26, y0 = 44, cw = 56, rh = 34;

  const isChanged = (r, c) => cur.changed.some(([a, b]) => a === r && b === c);
  const isPivotCell = (r, c) => cur.pivots.some(([a, b]) => a === r && b === c);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 440, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* column headers */}
        {COLS.map((c, j) => (
          <text key={"h" + j} x={x0 + j * cw + cw / 2} y={y0 - 8}
            textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)"
            fill="var(--text-faint)">{c}</text>
        ))}
        {/* vertical separator before the augmented column */}
        <line x1={x0 + 3 * cw + 3} y1={y0 - 2} x2={x0 + 3 * cw + 3} y2={y0 + 3 * rh + 2}
          stroke="var(--line-strong)" strokeWidth="1" />
        {/* big brackets */}
        <path d={`M ${x0 - 6} ${y0 - 4} h -6 v ${3 * rh + 8} h 6`} fill="none" stroke="var(--line-strong)" strokeWidth="1.2" />
        <path d={`M ${x0 + 4 * cw + 6} ${y0 - 4} h 6 v ${3 * rh + 8} h -6`} fill="none" stroke="var(--line-strong)" strokeWidth="1.2" />
        {/* cells */}
        {cur.m.map((row, r) =>
          row.map((val, c) => {
            const cx = x0 + c * cw + cw / 2;
            const cy = y0 + r * rh + rh / 2;
            const piv = isPivotCell(r, c);
            const chg = isChanged(r, c);
            return (
              <g key={`${r}-${c}`}>
                {(piv || chg) && (
                  <rect x={cx - 24} y={cy - 13} width={48} height={26} rx={5}
                    fill={piv ? "var(--accent)" : "color-mix(in oklch, var(--accent) 22%, var(--bg-card))"}
                    opacity={piv ? 0.9 : 1}
                    stroke={chg && !piv ? "var(--accent)" : "none"} strokeWidth="1" />
                )}
                <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
                  fontSize="12.5" fontFamily="var(--font-mono)"
                  fontWeight={piv ? 700 : 400}
                  fill={piv ? "var(--bg-inset)" : (val === 0 ? "var(--text-faint)" : "var(--text)")}>
                  {fmt(val)}
                </text>
              </g>
            );
          })
        )}
        {/* operation caption */}
        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="9.5"
          fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {cur.op}
        </text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn" disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}>← zpět</button>
        <button className="viz-btn primary" disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>další krok →</button>
        <button className="viz-btn" onClick={() => setStep(0)}>reset</button>
        <span className="viz-readout">
          krok {step + 1}/{STEPS.length}
          {step === 3 ? " · schodovitý" : step === STEPS.length - 1 ? " · RREF (řešení)" : ""}
        </span>
      </div>
    </div>
  );
}
