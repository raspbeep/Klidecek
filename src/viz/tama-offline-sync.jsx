// Offline-first synchronizace s write-ahead frontou.
// Krokový průchod: uživatel pracuje offline (zápisy se řadí do fronty),
// po obnovení sítě se fronta asynchronně odešle na server. Volitelný
// konflikt (souběžná úprava na serveru) řešený strategií last-write-wins.
import { useState } from "react";

function makeSteps(conflict) {
  const steps = [
    {
      title: "1 · Online — lokální DB drží zrcadlo serveru",
      detail: "Aplikace čte i zapisuje primárně do lokální DB (SQLite / Core Data). UI nikdy nečeká na síť.",
      net: true, queue: [], local: "{ stav: A }", server: "{ stav: A }", note: "",
    },
    {
      title: "2 · Výpadek sítě — uživatel zapisuje dál",
      detail: "Zápis se okamžitě projeví lokálně a zároveň se uloží do write-ahead fronty odchozích operací.",
      net: false, queue: ["PUT stav=B"], local: "{ stav: B }", server: "{ stav: A }", note: "",
    },
    {
      title: "3 · Další offline zápis — fronta roste",
      detail: "Fronta zachovává pořadí operací. Aplikace je plně použitelná i bez signálu.",
      net: false, queue: ["PUT stav=B", "PUT stav=C"], local: "{ stav: C }",
      server: conflict ? "{ stav: X }" : "{ stav: A }",
      note: conflict ? "mezitím jiný klient zapsal na server stav=X" : "",
    },
    {
      title: "4 · Síť obnovena — asynchronní synchronizace",
      detail: "Po připojení se fronta po jedné operaci přehraje na server. UI běží dál, sync jede na pozadí.",
      net: true, queue: ["PUT stav=C"], local: "{ stav: C }",
      server: conflict ? "{ stav: X }" : "{ stav: B }", note: "",
    },
    conflict
      ? {
          title: "5 · Konflikt → last-write-wins",
          detail: "Server měl stav X, klient posílá pozdější C. LWW použije časově poslední zápis (C) — a tichá ztráta X je riziko (lost update).",
          net: true, queue: [], local: "{ stav: C }", server: "{ stav: C }",
          note: "X přepsáno bez varování", warn: true,
        }
      : {
          title: "5 · Fronta vyprázdněna — konvergence",
          detail: "Všechny operace doručeny, lokální DB i server jsou ve shodě. Eventual consistency.",
          net: true, queue: [], local: "{ stav: C }", server: "{ stav: C }", note: "",
        },
  ];
  return steps;
}

export default function TamaOfflineSync() {
  const [conflict, setConflict] = useState(false);
  const [step, setStep] = useState(0);
  const steps = makeSteps(conflict);
  const s = steps[Math.min(step, steps.length - 1)];
  const W = 360, H = 150;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 11.5 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={conflict} onChange={(e) => { setConflict(e.target.checked); setStep(0); }} />
          <span style={{ fontFamily: "var(--font-mono)" }}>souběžná úprava na serveru (konflikt)</span>
        </label>
      </div>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>←</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step + 1} / {steps.length}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>→</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* Zařízení (lokální DB) */}
        <rect x="12" y="16" width="120" height="48" rx="5" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)" />
        <text x="72" y="32" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">lokální DB</text>
        <text x="72" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)" fontFamily="var(--font-mono)">{s.local}</text>

        {/* Server */}
        <rect x="228" y="16" width="120" height="48" rx="5" fill="var(--bg-card)"
          stroke={s.warn ? "oklch(0.6 0.16 22)" : "oklch(0.62 0.14 142)"} />
        <text x="288" y="32" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">server</text>
        <text x="288" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)" fontFamily="var(--font-mono)">{s.server}</text>

        {/* spojnice / stav sítě */}
        <line x1="132" y1="40" x2="228" y2="40"
          stroke={s.net ? "oklch(0.55 0.16 142)" : "var(--line)"} strokeWidth="1.6"
          strokeDasharray={s.net ? "0" : "4 4"} markerEnd={s.net ? "url(#osArr)" : undefined} />
        <text x="180" y="34" textAnchor="middle" fontSize="8.5"
          fill={s.net ? "oklch(0.5 0.16 142)" : "oklch(0.6 0.16 22)"} fontFamily="var(--font-mono)">
          {s.net ? "online" : "✕ offline"}
        </text>

        {/* write-ahead fronta */}
        <text x="72" y="82" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">write-ahead fronta</text>
        {s.queue.length === 0 ? (
          <text x="72" y="100" textAnchor="middle" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">— prázdná —</text>
        ) : (
          s.queue.map((q, i) => (
            <g key={i}>
              <rect x={20 + i * 56} y="88" width="52" height="18" rx="3"
                fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)" />
              <text x={46 + i * 56} y="100" textAnchor="middle" fontSize="8" fill="var(--text)" fontFamily="var(--font-mono)">{q}</text>
            </g>
          ))
        )}

        {s.note && (
          <text x="180" y={H - 10} textAnchor="middle" fontSize="8.5"
            fill={s.warn ? "oklch(0.6 0.16 22)" : "var(--text-faint)"} fontFamily="var(--font-mono)">
            {s.note}
          </text>
        )}

        <defs>
          <marker id="osArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.16 142)" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 9, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--text)", marginBottom: 3 }}>{s.title}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.45 }}>{s.detail}</div>
      </div>
    </div>
  );
}
