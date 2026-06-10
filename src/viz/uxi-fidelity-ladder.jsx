// uxi-fidelity-ladder — posuvník po žebříčku věrnosti prototypu.
// Posun nahoru zvyšuje realismus a náklady, ale klesá ochota uživatele
// k upřímné kritice. Tři pruhy ukazují trade-off pro zvolenou úroveň.
import { useState } from "react";

const RUNGS = [
  {
    label: "Skica / náčrt",
    sub: "tužka, ubrousek",
    realism: 0.12,
    cost: 0.08,
    honesty: 0.96,
    detail: "Hrubý náčrt myšlenky. Pár minut práce, nulové riziko připoutání k řešení. Uživatel bez obav navrhuje zásadní změny.",
  },
  {
    label: "Papírový wireframe",
    sub: "low-fi",
    realism: 0.3,
    cost: 0.2,
    honesty: 0.88,
    detail: "Drátěný model bez barev a grafiky. Ověřuje navigaci a strukturu. „Nedokonalý“ vzhled svádí uživatele k upřímné kritice.",
  },
  {
    label: "Digitální wireframe",
    sub: "mid-fi",
    realism: 0.55,
    cost: 0.45,
    honesty: 0.66,
    detail: "Čistší rozvržení v nástroji, stále schematické. Lépe komunikuje uvnitř týmu, ale začíná vypadat „hotově“.",
  },
  {
    label: "Klikací high-fi prototyp",
    sub: "high-fi",
    realism: 0.88,
    cost: 0.78,
    honesty: 0.4,
    detail: "Interaktivní model s reálným vizuálem. Testuje behaviorální reakce a soulad s mentálním modelem, ale vyleštěný vzhled tlumí kritiku.",
  },
  {
    label: "Produkční verze",
    sub: "skoro hotovo",
    realism: 1.0,
    cost: 1.0,
    honesty: 0.22,
    detail: "Téměř hotový produkt. Nejrealističtější data, ale nejdražší a nejpozdější na změnu — uživatel se bojí kritizovat hotovou věc.",
  },
];

export default function UxiFidelityLadder() {
  const [i, setI] = useState(1);
  const r = RUNGS[i];

  const W = 440;
  const barX = 150;
  const barMax = W - barX - 16;

  const bar = (label, val, y, hue) => (
    <g>
      <text x={10} y={y + 11} fontSize="11" fill="var(--text-muted)">{label}</text>
      <rect x={barX} y={y} width={barMax} height="13" rx="3" fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.6" />
      <rect x={barX} y={y} width={barMax * val} height="13" rx="3" fill={`oklch(0.62 0.15 ${hue})`} />
      <text x={barX + barMax} y={y + 11} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
        {Math.round(val * 100)}%
      </text>
    </g>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} 96`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height="96" fill="var(--bg-inset)" rx="6" />
        {bar("realismus", r.realism, 12, 142)}
        {bar("náklady", r.cost, 40, 22)}
        {bar("upřímná kritika", r.honesty, 68, 264)}
      </svg>

      <input
        type="range"
        className="viz-slider"
        min={0}
        max={RUNGS.length - 1}
        step={1}
        value={i}
        onChange={(e) => setI(+e.target.value)}
        style={{ width: "100%" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, fontFamily: "var(--font-mono)", color: "var(--text-faint)", padding: "0 2px" }}>
        <span>low-fi · levné · upřímné</span>
        <span>high-fi · drahé · realistické</span>
      </div>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--accent)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>
          {r.label} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>· {r.sub}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{r.detail}</div>
      </div>
    </div>
  );
}
