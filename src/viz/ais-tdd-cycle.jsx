// ais-tdd-cycle — interaktivní průchod cyklem red-green-refactor.
// Tlačítko "další krok" posouvá vývojáře po fázích; barva stavového kruhu
// a popis fáze se mění, čítač přidaných testů roste s každým průchodem.
import { useState } from "react";

const PHASES = [
  {
    key: "red",
    label: "RED — napiš selhávající test",
    hue: 22,
    detail:
      "Vývojář napíše malý automatizovaný test pro chování, které kód ještě nemá. Test se spustí a MUSÍ selhat — tím se ověří, že test vůbec něco testuje a že funkcionalita zatím chybí.",
    bar: "✗ test selhal",
    barOk: false,
  },
  {
    key: "green",
    label: "GREEN — napiš minimální kód",
    hue: 142,
    detail:
      "Doplní se co nejjednodušší kód, který test rozsvítí na zeleno. Elegance teď není cílem — povolené je i \"ošklivé\" řešení. Jediné kritérium je: test prochází.",
    bar: "✓ test prošel",
    barOk: true,
  },
  {
    key: "refactor",
    label: "REFACTOR — vyčisti kód",
    hue: 264,
    detail:
      "Se zelenou sadou testů jako záchrannou sítí se odstraní duplicity, zlepší pojmenování a struktura. Vnější chování se NEMĚNÍ — testy musí zůstat zelené po každé úpravě.",
    bar: "✓ testy stále zelené",
    barOk: true,
  },
];

export default function AisTddCycle() {
  const [i, setI] = useState(0);
  const [laps, setLaps] = useState(0);

  const phase = PHASES[i];
  const accent = `oklch(0.62 0.16 ${phase.hue})`;
  // počet testů v sadě = počet dokončených cyklů + 1 rozpracovaný (po RED)
  const tests = laps + (i >= 0 ? 1 : 0);

  function next() {
    if (i === PHASES.length - 1) {
      setLaps((l) => l + 1);
      setI(0);
    } else {
      setI((x) => x + 1);
    }
  }
  function reset() {
    setI(0);
    setLaps(0);
  }

  // tři uzly cyklu rozmístěné do trojúhelníku
  const nodes = [
    { x: 90, y: 56 },
    { x: 230, y: 56 },
    { x: 160, y: 150 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox="0 0 320 196" style={{ width: "100%", maxWidth: 420 }}>
        <rect width="320" height="196" fill="var(--bg-inset)" rx="6" />
        {/* šipky cyklu */}
        {nodes.map((n, k) => {
          const m = nodes[(k + 1) % 3];
          return (
            <line
              key={`e${k}`}
              x1={n.x + (m.x - n.x) * 0.22}
              y1={n.y + (m.y - n.y) * 0.22}
              x2={n.x + (m.x - n.x) * 0.78}
              y2={n.y + (m.y - n.y) * 0.78}
              stroke="var(--line-strong)"
              strokeWidth="1.4"
              markerEnd="url(#tddArr)"
            />
          );
        })}
        {PHASES.map((p, k) => {
          const n = nodes[k];
          const active = k === i;
          const c = `oklch(0.62 0.16 ${p.hue})`;
          return (
            <g key={p.key}>
              <circle
                cx={n.x}
                cy={n.y}
                r={active ? 30 : 24}
                fill={active ? c : "var(--bg-card)"}
                stroke={c}
                strokeWidth={active ? 2.5 : 1.4}
                opacity={active ? 1 : 0.55}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill={active ? "var(--bg-card)" : c}
              >
                {p.key.toUpperCase()}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="tddArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)" />
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="btn ghost" style={btn} onClick={next}>
          {i === PHASES.length - 1 ? "↻ nový cyklus" : "další fáze →"}
        </button>
        <button className="btn ghost" style={btn} onClick={reset}>
          reset
        </button>
        <div style={{ flex: 1, textAlign: "right", fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          sada testů: {tests}× · dokončené cykly: {laps}
        </div>
      </div>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: `1px solid ${accent}` }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: accent, marginBottom: 4 }}>{phase.label}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{phase.detail}</div>
        <div
          style={{
            marginTop: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            fontWeight: 600,
            color: phase.barOk ? "oklch(0.55 0.16 142)" : "oklch(0.58 0.18 22)",
          }}
        >
          {phase.bar}
        </div>
      </div>
    </div>
  );
}

const btn = {
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
};
