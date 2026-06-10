// pdi-eip-chain — řetězení EIP vzorů na příkladu objednávky:
// Splitter → Content-Based Router (No-Match → DLQ) → Message Filter → Aggregator.
// Krokuj a sleduj, jak jedna objednávka teče přes celý řetězec a co se s
// jednotlivými položkami stane (rozdělení, směrování, odfiltrování, sloučení).
import { useState } from "react";

const W = 540, H = 210;

// Položky objednávky: typ určuje cílový kanál v routeru.
const ITEMS = [
  { id: "i1", label: "letenka",  type: "fly",   keep: true },
  { id: "i2", label: "hotel",    type: "stay",  keep: true },
  { id: "i3", label: "auto",     type: "car",   keep: true },
  { id: "i4", label: "pojištění", type: "other", keep: false }, // No-Match → DLQ
  { id: "i5", label: "spam",     type: "stay",  keep: false },  // projde routerem, ale filtr ho zahodí
];

// 0: objednávka, 1: split, 2: router, 3: filter, 4: aggregate
const STEPS = [
  { title: "1 · Objednávka přijata", desc: "Přichází jedna složená objednávka „dovolená“ (letenka + hotel + auto + pojištění + spam)." },
  { title: "2 · Splitter — rozdělení", desc: "Splitter roztříští objednávku na samostatné položky. Každá nová zpráva dostane Correlation ID (#42), aby ji šlo později spojit zpět." },
  { title: "3 · Content-Based Router — směrování", desc: "Router čte typ položky a pošle ji na příslušný kanál (let / ubytování / auto). Položka bez odpovídajícího kanálu (No-Match) jde do Dead Letter Queue, ne do ztracena." },
  { title: "4 · Message Filter — predikát", desc: "Filtr propustí jen položky vyhovující predikátu; nevyhovující (spam) trvale zahodí." },
  { title: "5 · Aggregator — sloučení", desc: "Stavový Aggregator sbírá položky podle Correlation ID #42. Když jsou kompletní (dle počtu / timeoutu), spojí je do jediné finální nabídky a účtenky." },
];

const TYPE_COL = { fly: 264, stay: 142, car: 80, other: 22 };

export default function PdiEipChain() {
  const [step, setStep] = useState(0);

  const cur = STEPS[step];

  // stav položek v daném kroku
  const items = ITEMS.map((it) => {
    let phase = "order";        // order | split | routed | dlq | filtered | dropped | aggregated
    if (step >= 1) phase = "split";
    if (step >= 2) phase = it.type === "other" ? "dlq" : "routed";
    if (step >= 3 && phase === "routed") phase = it.keep ? "routed" : "dropped";
    if (step >= 4 && phase === "routed") phase = "aggregated";
    return { ...it, phase };
  });

  const aggregated = items.filter((i) => i.phase === "aggregated");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← zpět</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step + 1} / {STEPS.length}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>další →</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* zdroj: objednávka */}
        <rect x={14} y={88} width={70} height={34} rx={6}
          fill={step === 0 ? "oklch(0.62 0.14 22 / 0.2)" : "var(--bg-card)"}
          stroke="oklch(0.6 0.16 22)" strokeWidth={step === 0 ? 1.4 : 1} />
        <text x={49} y={102} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--text)">objednávka</text>
        <text x={49} y={114} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-muted)">#42</text>

        {/* svislé "stage" kotvy */}
        <StageLabel x={150} label="Splitter" active={step >= 1} />
        <StageLabel x={265} label="Router" active={step >= 2} />
        <StageLabel x={380} label="Filter" active={step >= 3} />
        <StageLabel x={478} label="Aggregator" active={step >= 4} />

        {/* roura producent → splitter */}
        <line x1={84} y1={105} x2={120} y2={105} stroke="var(--text-muted)" strokeWidth="1.4" markerEnd="url(#eip-a)" />

        {/* položky jako řádky */}
        {items.map((it, idx) => {
          const y = 36 + idx * 32;
          const xByPhase = {
            order: 130, split: 150, routed: 265, dlq: 265, dropped: 380, filtered: 380, aggregated: 478,
          };
          const x = step === 0 ? 49 : xByPhase[it.phase];
          const hue = TYPE_COL[it.type];
          const dead = it.phase === "dlq" || it.phase === "dropped";
          const fill = dead ? "oklch(0.6 0.16 22 / 0.12)" : `oklch(0.62 0.14 ${hue} / 0.16)`;
          const stroke = dead ? "oklch(0.6 0.16 22)" : `oklch(0.6 0.14 ${hue})`;
          if (step === 0) {
            // vsechny schovane uvnitr objednavky — nezobrazujeme jednotlive
            return null;
          }
          const yy = it.phase === "aggregated"
            ? 70 + aggregated.indexOf(it) * 22
            : y;
          return (
            <g key={it.id} style={{ transition: "all 0.2s" }}>
              <rect x={x - 34} y={yy - 11} width={68} height={22} rx={5} fill={fill} stroke={stroke} strokeWidth="1" />
              <text x={x} y={yy + 4} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
                fill="var(--text)" style={{ textDecoration: dead ? "line-through" : "none" }}>
                {it.label}
              </text>
            </g>
          );
        })}

        {/* Anotace pod jednotlivými stagemi — každá ve svém sloupci, bez překryvu */}
        {step >= 2 && items.some((i) => i.phase === "dlq") && (
          <text x={265} y={H - 8} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="oklch(0.6 0.16 22)">No-Match → DLQ</text>
        )}
        {step >= 3 && items.some((i) => i.phase === "dropped") && (
          <text x={380} y={H - 8} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="oklch(0.6 0.16 22)">predikát → zahozeno</text>
        )}
        {step >= 4 && (
          <text x={526} y={H - 8} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="oklch(0.5 0.14 142)">→ 1 balíček #42</text>
        )}

        <defs>
          <marker id="eip-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 9, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--text)", marginBottom: 3 }}>{cur.title}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{cur.desc}</div>
      </div>
    </div>
  );
}

function StageLabel({ x, label, active }) {
  return (
    <g>
      <line x1={x} y1={20} x2={x} y2={166} stroke={active ? "var(--accent-line)" : "var(--line)"} strokeWidth="0.8" strokeDasharray="3 4" />
      <text x={x} y={14} textAnchor="middle" fontSize="9.5" fontWeight="600" fontFamily="var(--font-mono)"
        fill={active ? "var(--accent)" : "var(--text-faint)"}>{label}</text>
    </g>
  );
}
