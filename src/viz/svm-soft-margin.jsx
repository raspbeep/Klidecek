// Soft-margin SVM: two overlapping classes, slider C controls margin width.
// Small C -> wide margin, more tolerated violations (points inside the band /
// on the wrong side). Large C -> narrow margin, fewer tolerated violations.
// The separating direction is fixed (horizontal projection); only the margin
// half-width changes with C, which is what the C trade-off visualises.
import { useState } from "react";

const W = 300, H = 200;

// two overlapping 1D-ish clouds projected on x; y is just for spread.
// class +1 around x=190, class -1 around x=110, with a few intruders.
const PTS = [
  // class -1 (hollow), left-ish, one intruder far right
  { x: 80, y: 50, c: -1 }, { x: 105, y: 90, c: -1 }, { x: 95, y: 140, c: -1 },
  { x: 130, y: 70, c: -1 }, { x: 125, y: 120, c: -1 }, { x: 165, y: 100, c: -1 },
  { x: 205, y: 150, c: -1 },
  // class +1 (filled), right-ish, one intruder far left
  { x: 220, y: 55, c: 1 }, { x: 195, y: 95, c: 1 }, { x: 235, y: 135, c: 1 },
  { x: 175, y: 60, c: 1 }, { x: 180, y: 130, c: 1 }, { x: 150, y: 105, c: 1 },
  { x: 110, y: 45, c: 1 },
];

const BOUNDARY = 155; // x of separating line (proj direction = +x)

export default function SvmSoftMargin() {
  const [cExp, setCExp] = useState(0); // log10(C), -2..2
  const C = Math.pow(10, cExp);

  // margin half-width shrinks as C grows: large C => narrow band.
  // map C in [0.01, 100] to half-width in [~60 px, ~8 px]
  const half = 8 + 52 / (1 + Math.log10(C) + 2.2);
  const left = BOUNDARY - half, right = BOUNDARY + half;

  // classify + detect violations:
  // a point violates the margin if it is inside the band OR on the wrong side.
  const classified = PTS.map((p) => {
    const pred = p.x >= BOUNDARY ? 1 : -1;
    const wrongSide = pred !== p.c;
    const insideBand = p.x > left && p.x < right;
    const violation = wrongSide || insideBand;
    return { ...p, pred, wrongSide, violation };
  });
  const nViol = classified.filter((p) => p.violation).length;
  const nMiss = classified.filter((p) => p.wrongSide).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* margin band */}
        <rect x={left} y={6} width={right - left} height={H - 28}
          fill="var(--accent)" opacity="0.12" />
        {/* margin edges */}
        <line x1={left} y1={6} x2={left} y2={H - 22} stroke="var(--accent-line)"
          strokeWidth="1" strokeDasharray="4 3" />
        <line x1={right} y1={6} x2={right} y2={H - 22} stroke="var(--accent-line)"
          strokeWidth="1" strokeDasharray="4 3" />
        {/* separating line */}
        <line x1={BOUNDARY} y1={6} x2={BOUNDARY} y2={H - 22}
          stroke="var(--accent)" strokeWidth="1.8" />

        {/* points; violations get an accent ring */}
        {classified.map((p, i) => (
          <g key={i}>
            {p.violation && <circle cx={p.x} cy={p.y} r="9.5" fill="none"
              stroke="var(--accent)" strokeWidth="2" />}
            <circle cx={p.x} cy={p.y} r="6"
              fill={p.c === 1 ? "var(--accent)" : "var(--bg-card)"}
              stroke={p.c === 1 ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth="1.5" />
          </g>
        ))}

        <text x={8} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          ● +1 · ○ −1 · kroužek = porušení marginu
        </text>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>C =</span>
        <input type="range" className="viz-slider" min={-2} max={2} step={0.1}
          value={cExp} onChange={(e) => setCExp(+e.target.value)}
          style={{ flex: 1, minWidth: 120 }} />
        <span className="viz-readout" style={{ minWidth: 64, textAlign: "right" }}>
          {C >= 1 ? C.toFixed(C < 10 ? 1 : 0) : C.toFixed(2)}
        </span>
      </div>

      <span className="viz-readout">
        {cExp <= -1.2 ? "malé C → " : cExp >= 1.2 ? "velké C → " : ""}
        margin {half > 30 ? "široký" : half < 16 ? "úzký" : "střední"} ·
        porušení marginu (uvnitř pásu / špatná strana): {nViol} · z toho špatně klasifikováno: {nMiss}
      </span>
    </div>
  );
}
