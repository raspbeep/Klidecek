// Iterativní vs inkrementální vývoj — porovnání na metafoře malby obrazu.
// Posuvník volí počet hotových cyklů; přepínač režim.
// Iterativní = celý obraz se zpřesňuje (roste detail). Inkrementální = přidávají se nové části.
// Kombinace = obojí najednou.
import { useState } from "react";

const MODES = [
  { id: "iter", label: "Iterativní", hue: 264, note: "zpřesňuje celý celek" },
  { id: "inc", label: "Inkrementální", hue: 142, note: "přidává nové funkce" },
  { id: "both", label: "Kombinace", hue: 80, note: "obojí najednou (UP, agile)" },
];

// Tři „funkce" (kvadranty obrazu) a jejich úroveň detailu v dané iteraci.
function levels(mode, n) {
  // n = 1..3 dokončených cyklů
  if (mode === "iter") {
    // všechny tři části existují od začátku, roste jen detail (0..3)
    return [n, n, n];
  }
  if (mode === "inc") {
    // části přibývají jednou za cyklus, ale rovnou v plné kvalitě (3) — jinak 0
    return [n >= 1 ? 3 : 0, n >= 2 ? 3 : 0, n >= 3 ? 3 : 0];
  }
  // both: část přibude a zároveň se starší zpřesňují
  return [Math.min(3, n), n >= 2 ? Math.min(3, n - 1) : 0, n >= 3 ? 1 : 0];
}

// vizuální „kvalita" = neprůhlednost + počet detailních čar
function quadFill(hue, lvl) {
  if (lvl <= 0) return "transparent";
  const a = 0.12 + lvl * 0.16;
  return `oklch(0.62 0.14 ${hue} / ${a})`;
}

export default function IterVsInkrement() {
  const [mode, setMode] = useState("iter");
  const [n, setN] = useState(1);
  const m = MODES.find((x) => x.id === mode);
  const lv = levels(mode, n);

  const quads = [
    { x: 16, y: 16, label: "katalog" },
    { x: 96, y: 16, label: "košík" },
    { x: 16, y: 84, label: "platba" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {MODES.map((x) => (
          <button
            key={x.id}
            onClick={() => setMode(x.id)}
            style={{
              padding: "5px 10px",
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
              borderRadius: 4,
              cursor: "pointer",
              color: "var(--text)",
              border: `1px solid ${mode === x.id ? `oklch(0.62 0.14 ${x.hue})` : "var(--line)"}`,
              background: mode === x.id ? `oklch(0.62 0.14 ${x.hue} / 0.18)` : "var(--bg-card)",
            }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 320 180" style={{ width: "100%", maxWidth: 360 }}>
        <rect width="320" height="180" fill="var(--bg-inset)" rx="6" />
        {/* "obraz" rámeček */}
        <rect x="10" y="10" width="170" height="140" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)" />
        {quads.map((q, i) => {
          const lvl = lv[i];
          const present = lvl > 0;
          return (
            <g key={i}>
              <rect
                x={q.x} y={q.y} width="72" height="58" rx="3"
                fill={quadFill(m.hue, lvl)}
                stroke={present ? `oklch(0.62 0.14 ${m.hue})` : "var(--line)"}
                strokeDasharray={present ? "0" : "3 3"}
              />
              {/* detail čáry rostou s úrovní (iterativní zpřesnění) */}
              {present &&
                Array.from({ length: lvl }).map((_, k) => (
                  <line
                    key={k}
                    x1={q.x + 6}
                    y1={q.y + 14 + k * 12}
                    x2={q.x + 66}
                    y2={q.y + 14 + k * 12}
                    stroke={`oklch(0.5 0.14 ${m.hue})`}
                    strokeWidth="1.4"
                    opacity={0.8}
                  />
                ))}
              <text
                x={q.x + 36}
                y={q.y + 52}
                textAnchor="middle"
                fontSize="9"
                fill={present ? "var(--text)" : "var(--text-faint)"}
                fontFamily="var(--font-mono)"
              >
                {q.label}
              </text>
            </g>
          );
        })}

        {/* legenda stavu vpravo */}
        <text x="196" y="26" fontSize="11" fill="var(--text)" fontWeight="600">
          po {n}. cyklu
        </text>
        <text x="196" y="44" fontSize="10" fill={`oklch(0.5 0.14 ${m.hue})`} fontFamily="var(--font-mono)">
          {m.label}
        </text>
        <text x="196" y="60" fontSize="9.5" fill="var(--text-muted)">
          {m.note}
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <text x="196" y={88 + i * 18} fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">
              {quads[i].label}:
            </text>
            <text x="252" y={88 + i * 18} fontSize="9" fill="var(--text)" fontFamily="var(--font-mono)">
              {lv[i] === 0 ? "—" : `detail ${lv[i]}/3`}
            </text>
          </g>
        ))}
      </svg>

      <input type="range" min={1} max={3} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        cyklus = {n} / 3 · {mode === "iter"
          ? "celý obraz existuje hned, jen se zjemňuje"
          : mode === "inc"
          ? "části přibývají rovnou hotové, jedna za cyklus"
          : "část přibude a zároveň se starší vylepšují"}
      </div>
    </div>
  );
}
