// nav-hsp-partition — HW/SW partitioning explorer.
// Toggle each task block between SW (CPU) and HW (accelerator). The viz
// recomputes total latency, occupied HW area and bus communication overhead
// (paid only on edges that cross the HW/SW boundary), and flags when the
// chosen partition exceeds the HW area budget.
import { useState } from "react";

const W = 540, H = 230;

// Task graph: each block has a SW and a HW cost profile.
// swT/hwT = latency (arbitrary units), hwA = HW area (LUT units) when on HW.
const TASKS = [
  { id: "T1", label: "vstup",     x: 70,  y: 70,  swT: 4,  hwT: 1, hwA: 3 },
  { id: "T2", label: "FFT",       x: 200, y: 60,  swT: 20, hwT: 3, hwA: 9 },
  { id: "T3", label: "filtr",     x: 200, y: 160, swT: 12, hwT: 2, hwA: 6 },
  { id: "T4", label: "AES",       x: 340, y: 70,  swT: 14, hwT: 2, hwA: 7 },
  { id: "T5", label: "výstup",    x: 470, y: 110, swT: 4,  hwT: 1, hwA: 3 },
];
// Data dependencies. busCost paid when the two endpoints land on opposite sides.
const EDGES = [
  { from: "T1", to: "T2", bus: 2 },
  { from: "T1", to: "T3", bus: 2 },
  { from: "T2", to: "T4", bus: 3 },
  { from: "T3", to: "T4", bus: 2 },
  { from: "T4", to: "T5", bus: 3 },
];

const AREA_BUDGET = 22;

export default function NavHspPartition() {
  // false = SW, true = HW
  const [hw, setHw] = useState({ T1: false, T2: true, T3: false, T4: true, T5: false });

  const toggle = (id) => setHw((s) => ({ ...s, [id]: !s[id] }));

  const pos = Object.fromEntries(TASKS.map((t) => [t.id, t]));

  // metrics
  const latency = TASKS.reduce((s, t) => s + (hw[t.id] ? t.hwT : t.swT), 0);
  const area = TASKS.reduce((s, t) => s + (hw[t.id] ? t.hwA : 0), 0);
  const busOverhead = EDGES.reduce(
    (s, e) => s + (hw[e.from] !== hw[e.to] ? e.bus : 0),
    0
  );
  const total = latency + busOverhead;
  const overBudget = area > AREA_BUDGET;

  const accCol = "oklch(0.62 0.14 264)";   // SW
  const hwCol = "oklch(0.6 0.15 142)";      // HW
  const busCol = "oklch(0.65 0.17 50)";     // crossing edge

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* region labels */}
        <text x={70} y={26} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill={accCol}>SW · CPU</text>
        <text x={470} y={26} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill={hwCol}>HW · akcelerátor</text>

        {/* edges */}
        {EDGES.map((e, i) => {
          const a = pos[e.from], b = pos[e.to];
          const crossing = hw[e.from] !== hw[e.to];
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          return (
            <g key={i}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={crossing ? busCol : "var(--line-strong)"}
                strokeWidth={crossing ? 2.4 : 1.2}
                strokeDasharray={crossing ? "5 3" : "none"}
              />
              {crossing && (
                <>
                  <rect x={mx - 16} y={my - 17} width={32} height={13} rx="2"
                    fill="var(--bg-card)" stroke={busCol} strokeWidth="0.5" />
                  <text x={mx} y={my - 7} textAnchor="middle" fontSize="8.5"
                    fontFamily="var(--font-mono)" fill={busCol}>bus+{e.bus}</text>
                </>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {TASKS.map((t) => {
          const onHw = hw[t.id];
          const col = onHw ? hwCol : accCol;
          return (
            <g key={t.id} style={{ cursor: "pointer" }} onClick={() => toggle(t.id)}>
              <circle cx={t.x} cy={t.y} r={22}
                fill={onHw ? "oklch(0.6 0.15 142 / 0.20)" : "oklch(0.62 0.14 264 / 0.20)"}
                stroke={col} strokeWidth="1.8" />
              <text x={t.x} y={t.y - 2} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">{t.id}</text>
              <text x={t.x} y={t.y + 11} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{t.label}</text>
              <text x={t.x} y={t.y + 38} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={col}>
                {onHw ? "HW" : "SW"}
              </text>
            </g>
          );
        })}

        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--text-faint)">
          klikni na blok = přesun mezi SW a HW
        </text>
      </svg>

      {/* metrics bar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, fontFamily: "var(--font-mono)" }}>
        <Metric label="latence" value={latency} />
        <Metric label="režie sběrnice" value={`+${busOverhead}`} accent="oklch(0.65 0.17 50)" />
        <Metric label="celkem T" value={total} accent="var(--text)" strong />
        <Metric
          label={`plocha (≤ ${AREA_BUDGET})`}
          value={area}
          accent={overBudget ? "oklch(0.6 0.2 25)" : "oklch(0.6 0.15 142)"}
        />
      </div>

      <div style={{
        fontSize: 11.5, lineHeight: 1.5,
        color: overBudget ? "oklch(0.6 0.2 25)" : "var(--text-muted)",
        padding: "6px 8px", background: "var(--bg-card)", borderRadius: 5,
        border: `1px solid ${overBudget ? "oklch(0.6 0.2 25 / 0.5)" : "var(--line)"}`,
      }}>
        {overBudget
          ? `Plocha ${area} > rozpočet ${AREA_BUDGET}: toto rozdělení se na čip nevejde — vrať některý blok do SW.`
          : "Přesun do HW zkracuje latenci, ale zabírá plochu a každá hrana přes hranici platí režii sběrnice. Hledá se minimum celkového T při dodržení rozpočtu plochy — to je úloha HW/SW partitioningu."}
      </div>
    </div>
  );
}

function Metric({ label, value, accent = "var(--text-muted)", strong = false }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "4px 10px", background: "var(--bg-inset)", borderRadius: 5,
      border: "1px solid var(--line)", minWidth: 70,
    }}>
      <span style={{ fontSize: 9.5, color: "var(--text-faint)" }}>{label}</span>
      <span style={{ fontSize: strong ? 15 : 14, fontWeight: 700, color: accent }}>{value}</span>
    </div>
  );
}
