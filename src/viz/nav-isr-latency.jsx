// nav-isr-latency — co se stane od vzniku přerušení po jeho obsloužení.
// Krokovací časová osa: dokončení instrukce → stacking registrů → fetch
// vektoru → ISR (top-half) → návrat → bottom-half v hlavní smyčce.
// Přepínač "kritická sekce" ukazuje, jak zakázané přerušení zvýší latenci.
import { useState } from "react";

function buildSteps(inCritical) {
  const base = [
    { t: "Hlavní smyčka běží", lane: "main", w: inCritical ? 5 : 3,
      d: "Procesor vykonává kód hlavní smyčky. Vzniká asynchronní událost (např. hrana na pinu, dokončení převodu ADC)." },
  ];
  if (inCritical) {
    base.push({ t: "Kritická sekce — přerušení zakázáno", lane: "main", w: 4, crit: true,
      d: "Hlavní smyčka má dočasně zakázaná přerušení (chrání sdílená data). Vznikl požadavek na přerušení, ale CPU ho nemůže obsloužit — přidává se k latenci. Toto je blokování kritickou sekcí." });
  }
  base.push(
    { t: "Dokončení aktuální instrukce", lane: "hw", w: 1,
      d: "Přerušení nastane v polovině instrukce; CPU nejprve dokončí rozpracovanou instrukci (běžné chování), teprve pak reaguje." },
    { t: "Stacking registrů", lane: "hw", w: 3,
      d: "Hardware automaticky uloží na zásobník caller-saved registry (na Cortex-M: xPSR, PC, LR, R12, R3, R2, R1, R0 — 8 slov). Souběžně se čte vektor." },
    { t: "Fetch vektoru přerušení", lane: "hw", w: 1, parallel: true,
      d: "Z tabulky vektorů přerušení se načte adresa obslužné rutiny do PC. Na Cortex-M probíhá paralelně se stackingem, takže nezvyšuje latenci." },
    { t: "ISR — top-half", lane: "isr", w: 3,
      d: "Spustí se první instrukce obsluhy. Top-half jen rychle zaznamená událost — nastaví volatile příznak nebo vloží data do fronty. Žádné blokující volání ani složitý výpočet." },
    { t: "Návrat z přerušení", lane: "hw", w: 2,
      d: "Unstacking: hardware obnoví uložené registry ze zásobníku a hlavní smyčka pokračuje přesně tam, kde byla přerušena." },
    { t: "Bottom-half v hlavní smyčce", lane: "main", w: 5,
      d: "Hlavní smyčka si všimne příznaku/dat z fronty a teprve teď provede zdlouhavé zpracování. Tak zůstane samotná ISR krátká a systém responzivní." },
  );
  return base;
}

const LANES = {
  main: { label: "hlavní smyčka", hue: 264, y: 56 },
  hw: { label: "hardware (NVIC/CPU)", hue: 40, y: 92 },
  isr: { label: "ISR", hue: 22, y: 128 },
};

export default function NavIsrLatency() {
  const [inCritical, setInCritical] = useState(false);
  const [step, setStep] = useState(0);
  const steps = buildSteps(inCritical);
  const cur = Math.min(step, steps.length - 1);

  const W = 560, H = 180;
  const x0 = 16, scale = 26;
  // kumulativní x pozice
  let acc = x0;
  const segs = steps.map((s) => {
    const seg = { ...s, x: acc, w: s.w * scale };
    acc += s.w * scale;
    return seg;
  });

  // latence = od vzniku události (konec prvního "main" segmentu) po první
  // instrukci ISR (začátek isr segmentu)
  const eventX = segs[0].x + segs[0].w + (inCritical ? segs[1].w : 0);
  const isrSeg = segs.find((s) => s.lane === "isr");
  const latencyX = isrSeg.x;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setStep(Math.max(0, cur - 1))} disabled={cur === 0} style={btn}>← zpět</button>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          krok {cur + 1} / {steps.length}
        </span>
        <button onClick={() => setStep(Math.min(steps.length - 1, cur + 1))} disabled={cur === steps.length - 1} style={btn}>vpřed →</button>
        <label style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 6, fontSize: 11.5 }}>
          <input type="checkbox" checked={inCritical} onChange={(e) => { setInCritical(e.target.checked); setStep(0); }} />
          <span>kritická sekce v hl. smyčce</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 580, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* dráhy */}
        {Object.entries(LANES).map(([k, l]) => (
          <g key={k}>
            <text x={x0} y={l.y - 13} fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">{l.label}</text>
            <line x1={x0} y1={l.y + 11} x2={W - 12} y2={l.y + 11} stroke="var(--line)" strokeWidth="0.4" />
          </g>
        ))}

        {/* segmenty */}
        {segs.map((s, i) => {
          const l = LANES[s.lane];
          const active = i === cur;
          const passed = i < cur;
          return (
            <g key={i} opacity={i <= cur ? 1 : 0.22}>
              <rect x={s.x} y={l.y - 9} width={s.w - 2} height={22} rx={3}
                fill={s.crit ? "oklch(0.6 0.18 30 / 0.4)" : `oklch(0.65 0.13 ${l.hue} / ${active ? 0.9 : passed ? 0.5 : 0.35})`}
                stroke={active ? `oklch(0.55 0.16 ${l.hue})` : "var(--line)"} strokeWidth={active ? 1.6 : 0.7} />
            </g>
          );
        })}

        {/* značka události */}
        <line x1={eventX} y1={40} x2={eventX} y2={150} stroke="oklch(0.62 0.2 30)" strokeWidth="1.3" strokeDasharray="2 2" />
        <circle cx={eventX} cy={40} r={3.5} fill="oklch(0.62 0.2 30)" />
        <text x={eventX} y={34} textAnchor="middle" fontSize="8.5" fill="oklch(0.55 0.2 30)" fontWeight="600">událost</text>

        {/* značka první instrukce ISR */}
        <line x1={latencyX} y1={40} x2={latencyX} y2={150} stroke="oklch(0.5 0.15 142)" strokeWidth="1.3" strokeDasharray="2 2" />
        <text x={latencyX} y={34} textAnchor="middle" fontSize="8.5" fill="oklch(0.48 0.15 142)" fontWeight="600">1. instr. ISR</text>

        {/* šipka latence */}
        {cur >= (inCritical ? 4 : 3) && (
          <>
            <line x1={eventX} y1={158} x2={latencyX} y2={158} stroke="var(--text)" strokeWidth="1"
              markerEnd="url(#ilArr)" markerStart="url(#ilArrR)" />
            <rect x={(eventX + latencyX) / 2 - 36} y={163} width={72} height={14} rx={2} fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.5" />
            <text x={(eventX + latencyX) / 2} y={173} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)">latence</text>
          </>
        )}

        <defs>
          <marker id="ilArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text)" />
          </marker>
          <marker id="ilArrR" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
            <path d="M10,0 L0,5 L10,10 Z" fill="var(--text)" />
          </marker>
        </defs>
      </svg>

      <div style={{ marginTop: 6, padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--text)", marginBottom: 3 }}>{steps[cur].t}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{steps[cur].d}</div>
      </div>
    </div>
  );
}

const btn = {
  background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)",
  padding: "3px 10px", borderRadius: 3, fontSize: 11.5, cursor: "pointer",
};
