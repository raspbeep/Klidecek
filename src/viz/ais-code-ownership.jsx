// ais-code-ownership — čtyři modely vlastnictví kódu na škále od individuálního
// po kolektivní. Výběr modelu přepne, kdo (A/B/C = vývojáři) smí měnit které
// moduly (M1/M2/M3). Šipka = vývojář smí editovat modul.
import { useState } from "react";

const DEVS = ["A", "B", "C"];
const MODS = ["M1", "M2", "M3"];

// edits[dev] = pole modulů, které smí měnit; přerušovaná šipka = jen se souhlasem
const MODELS = {
  none: {
    label: "Žádné vlastnictví",
    hue: 22,
    note: "Nikdo neodpovídá za žádný modul. Kdokoli mění cokoli bez koordinace → chaos, nikdo nehlídá kvalitu.",
    edits: { A: ["M1", "M2", "M3"], B: ["M1", "M2", "M3"], C: ["M1", "M2", "M3"] },
    weak: {},
  },
  strong: {
    label: "Silné (individuální)",
    hue: 320,
    note: "Každý modul má jediného vlastníka, který ho jako jediný smí měnit. Vzniká úzké hrdlo a znalost je vázaná na jednu osobu.",
    edits: { A: ["M1"], B: ["M2"], C: ["M3"] },
    weak: {},
  },
  weakOwn: {
    label: "Slabé vlastnictví",
    hue: 65,
    note: "Modul má vlastníka, ale ostatní ho smí měnit po dohodě s ním. Vlastník hlídá změny ve svém modulu.",
    edits: { A: ["M1"], B: ["M2"], C: ["M3"] },
    weak: { A: ["M2", "M3"], B: ["M1", "M3"], C: ["M1", "M2"] },
  },
  collective: {
    label: "Kolektivní (CCO)",
    hue: 142,
    note: "Kód patří celému týmu. Každý smí (a má) vylepšit jakoukoli část. Vyžaduje standardy, testy, CI a CCO.",
    edits: { A: ["M1", "M2", "M3"], B: ["M1", "M2", "M3"], C: ["M1", "M2", "M3"] },
    weak: {},
  },
};

const ORDER = ["none", "strong", "weakOwn", "collective"];

export default function AisCodeOwnership() {
  const [m, setM] = useState("strong");
  const model = MODELS[m];
  const accent = `oklch(0.62 0.16 ${model.hue})`;

  const devX = 60;
  const modX = 250;
  const rowY = (i) => 56 + i * 44;

  const edges = [];
  DEVS.forEach((d, di) => {
    (model.edits[d] || []).forEach((mod) => {
      edges.push({ d, di, mod, mi: MODS.indexOf(mod), dashed: false });
    });
    (model.weak[d] || []).forEach((mod) => {
      edges.push({ d, di, mod, mi: MODS.indexOf(mod), dashed: true });
    });
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {ORDER.map((k) => (
          <button
            key={k}
            onClick={() => setM(k)}
            style={{
              flex: 1,
              minWidth: 92,
              padding: "5px 6px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              borderRadius: 5,
              border: `1px solid oklch(0.62 0.16 ${MODELS[k].hue})`,
              background: m === k ? `oklch(0.62 0.16 ${MODELS[k].hue})` : "var(--bg-card)",
              color: m === k ? "var(--bg-card)" : `oklch(0.62 0.16 ${MODELS[k].hue})`,
              fontWeight: 600,
            }}
          >
            {MODELS[k].label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 320 210" style={{ width: "100%", maxWidth: 440 }}>
        <rect width="320" height="210" fill="var(--bg-inset)" rx="6" />
        <text x={devX} y={28} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">vývojáři</text>
        <text x={modX} y={28} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">moduly</text>

        {/* hrany editace */}
        {edges.map((e, i) => (
          <line
            key={i}
            x1={devX + 18}
            y1={rowY(e.di)}
            x2={modX - 22}
            y2={rowY(e.mi)}
            stroke={accent}
            strokeWidth={e.dashed ? 1.1 : 1.6}
            strokeDasharray={e.dashed ? "3 3" : "0"}
            opacity={e.dashed ? 0.6 : 0.85}
            markerEnd="url(#ownArr)"
          />
        ))}

        {DEVS.map((d, i) => (
          <g key={d}>
            <circle cx={devX} cy={rowY(i)} r="16" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.4" />
            <text x={devX} y={rowY(i) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--text)">{d}</text>
          </g>
        ))}
        {MODS.map((mod, i) => (
          <g key={mod}>
            <rect x={modX - 18} y={rowY(i) - 14} width="36" height="28" rx="4" fill="var(--bg-card)" stroke={accent} strokeWidth="1.4" />
            <text x={modX} y={rowY(i) + 4} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill={accent}>{mod}</text>
          </g>
        ))}

        <defs>
          <marker id="ownArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={accent} />
          </marker>
        </defs>
        <text x={160} y={198} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">plná = smí měnit · čárkovaná = se souhlasem vlastníka</text>
      </svg>

      <div style={{ padding: 9, background: "var(--bg-card)", borderRadius: 6, border: `1px solid ${accent}`, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: accent }}>{model.label}: </span>
        {model.note}
      </div>
    </div>
  );
}
