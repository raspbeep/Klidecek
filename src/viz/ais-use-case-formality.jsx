// Úrovně formálnosti případu užití: brief → casual → fully dressed.
// Toggle mezi úrovněmi ukazuje, jak roste detail popisu TÉHOŽ případu užití
// (Zpracuj prodej) a jaké sekce se přidávají u plně formální šablony.
import { useState } from "react";

const LEVELS = [
  {
    id: "brief",
    label: "brief — stručný",
    note: "Jeden hlavní scénář, krátký odstavec. Vznikne za pár minut během rané analýzy.",
    sections: [
      { name: "(jediný odstavec)", lines: [
        "Zákazník přijde k pokladně se zbožím. Pokladní",
        "zaznamená položky, systém spočítá součet a daň,",
        "zákazník zaplatí a obdrží doklad.",
      ] },
    ],
  },
  {
    id: "casual",
    label: "casual — neformální",
    note: "Více odstavců pokrývajících i alternativní (neúspěšné) scénáře. Stále neformální.",
    sections: [
      { name: "Hlavní scénář", lines: [
        "Zákazník přijde se zbožím; pokladní zaznamená",
        "položky, systém spočítá součet a daň, zaplatí se.",
      ] },
      { name: "Alternativní scénáře", lines: [
        "Neznámý kód → návrh ručního zadání.",
        "Zamítnutá platba → nabídnout jinou platbu.",
      ] },
    ],
  },
  {
    id: "fully",
    label: "fully dressed — plně formální",
    note: "Strukturovaná šablona se všemi sekcemi. Píše se jen pro ~10 % kritických případů.",
    sections: [
      { name: "Primární aktér", lines: ["Pokladní"] },
      { name: "Zúčastněné strany a zájmy", lines: ["Pokladní: rychlé zadání. Vedení: přesná evidence."] },
      { name: "Vstupní podmínky (preconditions)", lines: ["Pokladní je přihlášen a ověřen."], hl: true },
      { name: "Garance úspěchu (postconditions)", lines: ["Prodej uložen, daň správně spočtena."], hl: true },
      { name: "Hlavní úspěšný scénář (basic flow)", lines: ["1. Pokladní zahájí prodej.  2. Zaznamená položky.", "3. Systém spočítá součet a daň.  4. Platba …"], hl: true },
      { name: "Rozšíření / alternativní toky (extensions)", lines: ["3a. Neznámý kód.  4a. Zamítnutá platba …"], hl: true },
    ],
  },
];

export default function AisUseCaseFormality() {
  const [idx, setIdx] = useState(0);
  const lvl = LEVELS[idx];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* level toggle */}
      <div style={{ display: "flex", gap: 6 }}>
        {LEVELS.map((l, i) => (
          <button key={l.id} onClick={() => setIdx(i)}
            style={{
              flex: 1, padding: "6px 8px", fontSize: 11.5, cursor: "pointer",
              fontFamily: "var(--font-mono)", borderRadius: 5,
              border: `1px solid ${i === idx ? "var(--accent)" : "var(--line)"}`,
              background: i === idx ? "oklch(0.62 0.14 264 / 0.16)" : "var(--bg-card)",
              color: i === idx ? "var(--accent)" : "var(--text-muted)",
              fontWeight: i === idx ? 600 : 400,
            }}>
            {l.id}
          </button>
        ))}
      </div>

      {/* detail growth bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <span>detail:</span>
        <div style={{ flex: 1, height: 8, background: "var(--bg-card)", borderRadius: 4, border: "1px solid var(--line)", overflow: "hidden" }}>
          <div style={{ width: `${(idx + 1) / 3 * 100}%`, height: "100%", background: "var(--accent)", transition: "width .2s" }} />
        </div>
        <span>{lvl.sections.length} {lvl.sections.length === 1 ? "sekce" : lvl.sections.length < 5 ? "sekce" : "sekcí"}</span>
      </div>

      {/* the use case "card" */}
      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
          Případ užití: Zpracuj prodej
        </div>
        <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
          {lvl.label}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {lvl.sections.map((s) => (
            <div key={s.name} style={{
              paddingLeft: 8,
              borderLeft: `2px solid ${s.hl ? "var(--accent)" : "var(--line-strong)"}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.hl ? "var(--accent)" : "var(--text-muted)" }}>
                {s.name}
              </div>
              {s.lines.map((ln, j) => (
                <div key={j} style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.45 }}>{ln}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {lvl.note}
        {idx === 2 && <span style={{ color: "var(--accent)" }}> Modře zvýrazněné sekce existují pouze u plně formálního stylu.</span>}
      </div>
    </div>
  );
}
