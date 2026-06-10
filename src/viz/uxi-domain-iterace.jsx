// uxi-domain-iterace — pět iteračních kroků návrhu doménového modelu.
// Tlačítko posouvá po krocích; aktivní krok se zvýrazní, popis se mění.
// Po validaci (krok 4) vede přerušovaná zpětná vazba k refaktorizaci (krok 5)
// a odtud zpět k identifikaci — návrh je iterativní, ne lineární.
import { useState } from "react";

const STEPS = [
  {
    n: 1,
    label: "Identifikace konceptů",
    hue: 264,
    detail:
      "Z analýzy podstatných jmen v požadavcích a z rozhovorů se vybírá optimálně 5–10 klíčových entit (konceptuálních tříd). Víc znamená míchání úrovní abstrakce.",
  },
  {
    n: 2,
    label: "Vztahy a interakce",
    hue: 200,
    detail:
      "Určení směru vazeb, jejich kardinality (multiplicity) a analýza sloves — slovesa naznačují asociace a operace mezi entitami.",
  },
  {
    n: 3,
    label: "Omezení a pravidla",
    hue: 142,
    detail:
      "Dokumentace pravidel se striktním oddělením pevných technických omezení od flexibilních byznys pravidel. Záměna vede k modelu, který nelze měnit.",
  },
  {
    n: 4,
    label: "Validace se stakeholdery",
    hue: 80,
    detail:
      "Ověření správnosti terminologie a vztahů s doménovými experty a uživateli pomocí scénářů. Tady se odhalí nedorozumění o významu pojmů.",
  },
  {
    n: 5,
    label: "Refaktorizace",
    hue: 22,
    detail:
      "Pravidelné zjednodušování a aktualizace modelu podle vývoje požadavků. Z refaktorizace se cyklí zpět — model žije s projektem.",
  },
];

export default function UxiDomainIterace() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const accent = `oklch(0.62 0.15 ${step.hue})`;

  // pět uzlů po oblouku
  const W = 460;
  const cx = W / 2;
  const nodes = STEPS.map((s, k) => {
    const x = 50 + k * ((W - 100) / (STEPS.length - 1));
    return { x, y: 56 };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} 150`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height="150" fill="var(--bg-inset)" rx="6" />
        <defs>
          <marker id="udiArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)" />
          </marker>
        </defs>
        {/* spojnice mezi sousedními kroky */}
        {nodes.slice(0, -1).map((n, k) => {
          const m = nodes[k + 1];
          return (
            <line
              key={`l${k}`}
              x1={n.x + 22}
              y1={n.y}
              x2={m.x - 22}
              y2={m.y}
              stroke="var(--line-strong)"
              strokeWidth="1.3"
              markerEnd="url(#udiArr)"
            />
          );
        })}
        {/* zpětná vazba 5 -> 1 */}
        <path
          d={`M ${nodes[4].x} ${nodes[4].y + 24} Q ${cx} 128 ${nodes[0].x} ${nodes[0].y + 24}`}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="1.1"
          strokeDasharray="4 4"
          markerEnd="url(#udiArr)"
        />
        <text x={cx} y="126" textAnchor="middle" fontSize="10" fontStyle="italic" fill="var(--text-faint)">
          iterace
        </text>
        {STEPS.map((s, k) => {
          const n = nodes[k];
          const active = k === i;
          const done = k < i;
          const c = `oklch(0.62 0.15 ${s.hue})`;
          return (
            <g key={s.n} style={{ cursor: "pointer" }} onClick={() => setI(k)}>
              <circle
                cx={n.x}
                cy={n.y}
                r={active ? 22 : 18}
                fill={active ? c : done ? `oklch(0.62 0.15 ${s.hue} / 0.25)` : "var(--bg-card)"}
                stroke={c}
                strokeWidth={active ? 2.4 : 1.3}
                opacity={active || done ? 1 : 0.6}
              />
              <text
                x={n.x}
                y={n.y + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill={active ? "var(--bg-card)" : c}
              >
                {s.n}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="viz-controls">
        <button
          className="viz-btn"
          onClick={() => setI((x) => Math.max(0, x - 1))}
          disabled={i === 0}
        >
          ← zpět
        </button>
        <button
          className="viz-btn primary"
          onClick={() => setI((x) => (x === STEPS.length - 1 ? 0 : x + 1))}
        >
          {i === STEPS.length - 1 ? "↻ nová iterace" : "další krok →"}
        </button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "right" }}>
          krok {step.n} / {STEPS.length}
        </span>
      </div>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: `1px solid ${accent}` }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: accent, marginBottom: 4 }}>
          {step.n}. {step.label}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{step.detail}</div>
      </div>
    </div>
  );
}

