// ais-branching-strategy — feature branching vs Trunk Based Development.
// Přepínač strategie překreslí commit graf: dlouhé větve dlouho mimo trunk
// (riziko velkých konfliktů) vs. malé časté integrace do jedné větve.
import { useState } from "react";

const W = 540, H = 210;
const TRUNK_Y = 56;
const BRANCH_Y = 130;
const X0 = 70, DX = 50;

// feature branching: dvě dlouhé větve, slévané pozdě → velký konflikt
const FEATURE = {
  label: "Feature branching",
  hue: 22,
  trunk: [0, 1, 8],            // commity přímo na trunku (indexy sloupců)
  branches: [
    { from: 1, to: 7, lane: 0, label: "feature/A", conflict: true },
  ],
  merges: [{ at: 8, lane: 0 }],
  note: "Dlouhá větev žije mimo trunk mnoho commitů. Při pozdním slévání se nakupí velký, těžko řešitelný merge konflikt. Vývojář pracuje izolovaně.",
  conflictNote: "⚠ velký merge konflikt — větev se dlouho rozcházela s trunkem",
};

// TBD: malé časté commity přímo do trunku, jen krátké větve
const TBD = {
  label: "Trunk Based Development",
  hue: 142,
  trunk: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  branches: [
    { from: 3, to: 4, lane: 0, label: "krátká větev", conflict: false },
  ],
  merges: [{ at: 4, lane: 0 }],
  note: "Malé změny se slévají do jedné hlavní větve i několikrát denně. Větve žijí hodiny, ne týdny. Nehotová funkce se skryje za feature toggle.",
  conflictNote: "✓ konflikty malé a vzácné — trunk se integruje neustále",
};

export default function AisBranchingStrategy() {
  const [tbd, setTbd] = useState(false);
  const s = tbd ? TBD : FEATURE;
  const accent = `oklch(0.62 0.16 ${s.hue})`;
  const cx = (i) => X0 + i * DX;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        {[false, true].map((v) => {
          const mm = v ? TBD : FEATURE;
          return (
            <button
              key={String(v)}
              className="viz-btn"
              onClick={() => setTbd(v)}
              style={tbd === v ? {
                flex: 1,
                border: `1px solid oklch(0.62 0.16 ${mm.hue})`,
                background: `oklch(0.62 0.16 ${mm.hue})`,
                color: "var(--bg-card)",
              } : {
                flex: 1,
                border: `1px solid oklch(0.62 0.16 ${mm.hue})`,
                color: `oklch(0.62 0.16 ${mm.hue})`,
              }}
            >
              {mm.label}
            </button>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* trunk čára */}
        <line x1={cx(0)} y1={TRUNK_Y} x2={cx(8)} y2={TRUNK_Y} stroke="var(--line-strong)" strokeWidth="2" />
        <text x={cx(0) - 18} y={TRUNK_Y + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">main</text>

        {/* větve */}
        {s.branches.map((b, bi) => {
          const yB = BRANCH_Y + b.lane * 0;
          return (
            <g key={bi}>
              {/* odbočení z trunku */}
              <path
                d={`M ${cx(b.from)} ${TRUNK_Y} C ${cx(b.from) + 20} ${TRUNK_Y}, ${cx(b.from) + 20} ${yB}, ${cx(b.from) + 28} ${yB}`}
                fill="none" stroke={accent} strokeWidth="1.8"
              />
              {/* tělo větve */}
              <line x1={cx(b.from) + 28} y1={yB} x2={cx(b.to)} y2={yB} stroke={accent} strokeWidth="1.8" />
              {/* slití zpět */}
              <path
                d={`M ${cx(b.to)} ${yB} C ${cx(b.to) + 20} ${yB}, ${cx(b.to) + 20} ${TRUNK_Y}, ${cx(b.to) + 28} ${TRUNK_Y}`}
                fill="none" stroke={accent} strokeWidth="1.8" strokeDasharray={b.conflict ? "4 3" : "0"}
              />
              <text x={cx(b.from) + 30} y={yB + 22} fontSize="10" fontFamily="var(--font-mono)" fill={accent}>{b.label}</text>
              {/* commity na větvi */}
              {Array.from({ length: b.to - b.from }, (_, k) => b.from + 1 + k).map((ci) => (
                <circle key={ci} cx={cx(ci)} cy={yB} r="6" fill="var(--bg-card)" stroke={accent} strokeWidth="1.6" />
              ))}
              {/* značka konfliktu u slití */}
              {b.conflict && (
                <text x={cx(b.to) + 14} y={(TRUNK_Y + yB) / 2} fontSize="15" fill="oklch(0.58 0.18 22)">⚡</text>
              )}
            </g>
          );
        })}

        {/* commity na trunku */}
        {s.trunk.map((ci) => (
          <circle key={ci} cx={cx(ci)} cy={TRUNK_Y} r="7" fill={accent} stroke="var(--line-strong)" strokeWidth="1" />
        ))}

        {/* osa času */}
        <text x={cx(8)} y={H - 10} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">čas →</text>
      </svg>

      <div style={{ padding: 9, background: "var(--bg-card)", borderRadius: 6, border: `1px solid ${accent}`, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {s.note}
        <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: tbd ? "oklch(0.55 0.16 142)" : "oklch(0.58 0.18 22)" }}>
          {s.conflictNote}
        </div>
      </div>
    </div>
  );
}
