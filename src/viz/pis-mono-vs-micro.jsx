// Interaktivní porovnání monolit vs. mikroslužby.
// Toggle zobrazí, co je v každém přístupu sdílené a co oddělené.
import { useState } from "react";

export default function MonoVsMicro() {
  const [mode, setMode] = useState("mono");
  const W = 360, H = 220;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, padding: 3, background: "var(--bg-inset)", borderRadius: 8, width: "fit-content" }}>
        <button
          className="btn ghost"
          style={{
            background: mode === "mono" ? "var(--bg-card)" : "transparent",
            boxShadow: mode === "mono" ? "var(--shadow-sm)" : "none",
            padding: "6px 14px",
          }}
          onClick={() => setMode("mono")}
        >
          Monolit
        </button>
        <button
          className="btn ghost"
          style={{
            background: mode === "micro" ? "var(--bg-card)" : "transparent",
            boxShadow: mode === "micro" ? "var(--shadow-sm)" : "none",
            padding: "6px 14px",
          }}
          onClick={() => setMode("micro")}
        >
          Mikroslužby
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 500 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Klient (vždy) */}
        <rect x="20" y="20" width="60" height="30" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)" />
        <text x="50" y="39" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">klient</text>

        {mode === "mono" ? (
          <g>
            {/* Velký monolit */}
            <line x1="80" y1="35" x2="125" y2="35" stroke="var(--text-muted)" strokeWidth="1" markerEnd="url(#mvm-arr)" />
            <rect x="125" y="15" width="160" height="120" rx="6" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
            <text x="205" y="33" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--accent)">Monolitická aplikace</text>
            <line x1="135" y1="44" x2="275" y2="44" stroke="var(--accent-line)" strokeWidth="0.5" />

            <rect x="135" y="50" width="42" height="22" rx="3" fill="var(--bg-card)" stroke="var(--accent-line)" />
            <text x="156" y="65" textAnchor="middle" fontSize="9.5" fill="var(--text)">Katalog</text>
            <rect x="183" y="50" width="42" height="22" rx="3" fill="var(--bg-card)" stroke="var(--accent-line)" />
            <text x="204" y="65" textAnchor="middle" fontSize="9.5" fill="var(--text)">Objedn.</text>
            <rect x="231" y="50" width="42" height="22" rx="3" fill="var(--bg-card)" stroke="var(--accent-line)" />
            <text x="252" y="65" textAnchor="middle" fontSize="9.5" fill="var(--text)">Platby</text>

            <text x="205" y="92" textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">jedna technologie, sdílený model</text>
            <text x="205" y="106" textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">jeden deployment balík</text>

            {/* Společná databáze */}
            <ellipse cx="205" cy="170" rx="55" ry="14" fill="var(--bg-card)" stroke="var(--accent)" />
            <text x="205" y="174" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--accent)">Sdílená DB</text>
            <line x1="205" y1="135" x2="205" y2="156" stroke="var(--accent)" strokeWidth="1" markerEnd="url(#mvm-arr)" />

            <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">
              všechny moduly v jednom procesu, jedna DB
            </text>
          </g>
        ) : (
          <g>
            {/* API gateway */}
            <line x1="80" y1="35" x2="110" y2="35" stroke="var(--text-muted)" strokeWidth="1" markerEnd="url(#mvm-arr)" />
            <rect x="110" y="20" width="70" height="30" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" />
            <text x="145" y="39" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--accent)">API Gateway</text>

            {/* Mikroslužby */}
            <line x1="180" y1="30" x2="210" y2="80" stroke="var(--text-muted)" strokeWidth="0.8" markerEnd="url(#mvm-arr)" />
            <line x1="180" y1="35" x2="210" y2="135" stroke="var(--text-muted)" strokeWidth="0.8" markerEnd="url(#mvm-arr)" />
            <line x1="180" y1="40" x2="210" y2="190" stroke="var(--text-muted)" strokeWidth="0.8" markerEnd="url(#mvm-arr)" />

            <rect x="210" y="68" width="76" height="30" rx="4" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.62 0.14 22)" />
            <text x="248" y="87" textAnchor="middle" fontSize="10" fontWeight="600" fill="oklch(0.42 0.14 22)">Katalog</text>
            <ellipse cx="320" cy="83" rx="20" ry="7" fill="oklch(0.62 0.14 22 / 0.15)" stroke="oklch(0.62 0.14 22)" strokeWidth="0.7" />
            <text x="320" y="86" textAnchor="middle" fontSize="8" fill="oklch(0.42 0.14 22)" fontFamily="var(--font-mono)">Postgres</text>
            <line x1="286" y1="83" x2="299" y2="83" stroke="oklch(0.62 0.14 22)" strokeWidth="0.7" />

            <rect x="210" y="123" width="76" height="30" rx="4" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)" />
            <text x="248" y="142" textAnchor="middle" fontSize="10" fontWeight="600" fill="oklch(0.42 0.14 264)">Objednávky</text>
            <ellipse cx="320" cy="138" rx="20" ry="7" fill="oklch(0.62 0.14 264 / 0.15)" stroke="oklch(0.62 0.14 264)" strokeWidth="0.7" />
            <text x="320" y="141" textAnchor="middle" fontSize="8" fill="oklch(0.42 0.14 264)" fontFamily="var(--font-mono)">Mongo</text>
            <line x1="286" y1="138" x2="299" y2="138" stroke="oklch(0.62 0.14 264)" strokeWidth="0.7" />

            <rect x="210" y="178" width="76" height="30" rx="4" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)" />
            <text x="248" y="197" textAnchor="middle" fontSize="10" fontWeight="600" fill="oklch(0.42 0.14 142)">Platby</text>
            <ellipse cx="320" cy="193" rx="20" ry="7" fill="oklch(0.62 0.14 142 / 0.15)" stroke="oklch(0.62 0.14 142)" strokeWidth="0.7" />
            <text x="320" y="196" textAnchor="middle" fontSize="8" fill="oklch(0.42 0.14 142)" fontFamily="var(--font-mono)">Redis</text>
            <line x1="286" y1="193" x2="299" y2="193" stroke="oklch(0.62 0.14 142)" strokeWidth="0.7" />

            <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">
              každá služba: vlastní DB, vlastní tým, vlastní deploy
            </text>
          </g>
        )}

        <defs>
          <marker id="mvm-arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)" />
          </marker>
        </defs>
      </svg>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {mode === "mono" ? (
          <>
            <strong style={{ color: "var(--text)" }}>Monolit:</strong> jedna technologie, jedna sdílená databáze, jednoduché lokální volání mezi moduly, ale celá aplikace musí být znovu nasazena při jakékoliv změně.
          </>
        ) : (
          <>
            <strong style={{ color: "var(--text)" }}>Mikroslužby:</strong> každá služba má vlastní privátní databázi (polyglot persistence), nezávislý deployment a vlastní tým. Cena: režie sítě, nutnost zvládat distribuovaná selhání.
          </>
        )}
      </div>
    </div>
  );
}
