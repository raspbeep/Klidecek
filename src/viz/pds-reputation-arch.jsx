// Architektura reputačního systému: přepínač centralizovaný ↔ distribuovaný.
// Vlevo minulé transakce (past), vpravo potenciální transakce (present).
import { useState } from "react";

// agents arranged in two columns (past transactions web)
const AGENTS = [
  { id: "A1", x: 60, y: 40, label: "A" },
  { id: "F", x: 110, y: 70, label: "F" },
  { id: "G", x: 170, y: 38, label: "G" },
  { id: "A2", x: 60, y: 100, label: "A" },
  { id: "B1", x: 170, y: 80, label: "B" },
  { id: "E", x: 160, y: 116, label: "E" },
  { id: "D", x: 65, y: 145, label: "D" },
  { id: "C", x: 150, y: 150, label: "C" },
];

const PAST_LINKS = [
  ["A1", "F"], ["F", "G"], ["A1", "B1"], ["F", "B1"],
  ["A2", "E"], ["D", "B1"], ["D", "C"], ["A2", "D"],
];

export default function PdsReputationArch() {
  const [mode, setMode] = useState("central"); // central | distributed

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          ["central", "Centralizovaný"],
          ["distributed", "Distribuovaný"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            className="btn ghost"
            style={{
              flex: 1,
              padding: "6px 8px",
              fontSize: 12,
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: mode === k ? "var(--accent-soft)" : "var(--bg-card)",
              color: mode === k ? "var(--accent)" : "var(--text-muted)",
              fontWeight: mode === k ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 480 230" style={{ width: "100%", maxWidth: 480 }}>
        <rect width="480" height="230" fill="var(--bg-inset)" rx="8" />

        {/* divider */}
        <line x1="240" y1="14" x2="240" y2="216" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="120" y="22" textAnchor="middle" fontSize="10.5" fill="var(--text-faint)">minulé transakce (past)</text>
        <text x="360" y="22" textAnchor="middle" fontSize="10.5" fill="var(--text-faint)">potenciální transakce (present)</text>

        {/* ===== PAST side: agent web ===== */}
        {PAST_LINKS.map(([a, b], i) => {
          const na = AGENTS.find((n) => n.id === a);
          const nb = AGENTS.find((n) => n.id === b);
          return (
            <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke="var(--line-strong)" strokeWidth="1" />
          );
        })}

        {/* central mode: dashed ratings dropping to centre */}
        {mode === "central" &&
          AGENTS.map((n) => (
            <line key={`r-${n.id}`} x1={n.x} y1={n.y} x2={120} y2={196}
              stroke="var(--accent)" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.5" />
          ))}

        {AGENTS.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="11" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.2" />
            <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text)">{n.label}</text>
          </g>
        ))}

        {/* central: Reputation Centre box under past */}
        {mode === "central" && (
          <g>
            <rect x="35" y="186" width="170" height="22" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.2" />
            <text x="120" y="201" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--accent)">Reputation Centre</text>
            <text x="120" y="178" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">ratings ↓</text>
          </g>
        )}

        {/* distributed: relaying party note */}
        {mode === "distributed" && (
          <text x="120" y="200" textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontStyle="italic">
            výměna přes relaying party / peery
          </text>
        )}

        {/* ===== PRESENT side: A and B potential transaction ===== */}
        <circle cx="310" cy="100" r="16" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.4" />
        <text x="310" y="104" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">A</text>
        <circle cx="410" cy="100" r="16" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.4" />
        <text x="410" y="104" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">B</text>
        <line x1="326" y1="100" x2="394" y2="100" stroke="var(--line-strong)" strokeWidth="1.4" strokeDasharray="4 3" markerEnd="url(#raArr)" />
        <text x="360" y="92" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">potential</text>

        {mode === "central" ? (
          <g>
            <rect x="290" y="150" width="170" height="22" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.2" />
            <text x="375" y="165" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--accent)">Reputation Centre</text>
            <line x1="310" y1="116" x2="350" y2="150" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="410" y1="116" x2="400" y2="150" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="2 2" />
            <text x="375" y="138" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">reputation scores</text>
          </g>
        ) : (
          <g>
            {/* distributed: ratings arrive to A and B from scattered peers */}
            {[[300, 150], [330, 168], [430, 150], [400, 170]].map(([px, py], i) => (
              <g key={i}>
                <circle cx={px} cy={py} r="8" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1" />
                <line x1={px} y1={py} x2={i < 2 ? 310 : 410} y2={116}
                  stroke="var(--accent)" strokeWidth="0.7" strokeDasharray="2 2" markerEnd="url(#raArr)" />
              </g>
            ))}
            <text x="375" y="200" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">ratings (P2P)</text>
          </g>
        )}

        <defs>
          <marker id="raArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {mode === "central"
          ? "Centralizovaný: všechna hodnocení z minulých transakcí padají do jednoho Reputation Centre, které pak pro budoucí transakci A–B poskytne reputační skóre. Jeden bod selhání i kontroly."
          : "Distribuovaný: hodnocení se vyměňují přes spolehlivého partnera (relaying party) / přímo mezi peery. Reputační skóre uzlů A a B vzniká z rozptýlených svědectví. Typické v P2P sítích pro hodnocení spolehlivosti uzlu."}
      </div>
    </div>
  );
}
