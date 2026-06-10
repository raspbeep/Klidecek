// wap-event-loop — krokovaný model smyčky událostí.
// Pevný scénář: synchronní log, setTimeout(0), Promise.then (řetězené).
// Krokujeme přes stavy zásobníku, fronty makroúloh, fronty mikroúloh,
// renderu a výstupní konzole. Cílem je ukázat, že microtask fronta se
// vyprázdní CELÁ dřív než další makroúloha a než render.
import { useState } from "react";

// Každý krok je snímek stavu světa po jedné akci smyčky.
const STEPS = [
  {
    title: "Synchronní kód běží na zásobníku",
    stack: ["main()", "log('A')"],
    macro: ["timeout cb"],
    micro: [],
    out: ["A"],
    render: false,
    note: "Synchronní log('A') běží hned. setTimeout(…,0) jen zaregistroval callback na pozadí → čeká ve frontě makroúloh.",
  },
  {
    title: "Naplánování mikroúlohy",
    stack: ["main()", "Promise.then(…)"],
    macro: ["timeout cb"],
    micro: ["then1"],
    out: ["A"],
    render: false,
    note: "Promise.resolve().then(...) nezavolá callback hned — zařadí ho do fronty mikroúloh.",
  },
  {
    title: "Konec synchronního kódu",
    stack: ["main()", "log('B')"],
    macro: ["timeout cb"],
    micro: ["then1"],
    out: ["A", "B"],
    render: false,
    note: "Poslední synchronní log('B'). Po jeho doběhnutí se main() vrátí a zásobník se vyprázdní.",
  },
  {
    title: "Zásobník prázdný → microtask checkpoint",
    stack: ["then1"],
    macro: ["timeout cb"],
    micro: [],
    out: ["A", "B"],
    render: false,
    note: "Smyčka vidí prázdný zásobník a začne vyprazdňovat mikroúlohy. Bere then1 a vykoná ho.",
  },
  {
    title: "Mikroúloha naplánovala další mikroúlohu",
    stack: [],
    macro: ["timeout cb"],
    micro: ["then2"],
    out: ["A", "B", "then1"],
    render: false,
    note: "then1 dopsal výstup a (řetězením .then) naplánoval then2. Checkpoint NEKONČÍ — fronta není prázdná, smyčka pokračuje.",
  },
  {
    title: "Vyprázdnění zbytku mikroúloh",
    stack: [],
    macro: ["timeout cb"],
    micro: [],
    out: ["A", "B", "then1", "then2"],
    render: false,
    note: "then2 doběhl, fronta mikroúloh je prázdná. Teprve teď je microtask checkpoint hotový.",
  },
  {
    title: "Zvážit render",
    stack: [],
    macro: ["timeout cb"],
    micro: [],
    out: ["A", "B", "then1", "then2"],
    render: true,
    note: "Po checkpointu smyčka zváží překreslení UI (~ v rytmu displeje). Až teď, NE mezi mikroúlohami.",
  },
  {
    title: "Jedna makroúloha",
    stack: ["timeout cb"],
    macro: [],
    micro: [],
    out: ["A", "B", "then1", "then2"],
    render: false,
    note: "Smyčka vezme PRÁVĚ JEDNU makroúlohu — timeout cb — a vykoná ji. setTimeout(…,0) se tak dostal ke slovu až úplně nakonec.",
  },
  {
    title: "Hotovo",
    stack: [],
    macro: [],
    micro: [],
    out: ["A", "B", "then1", "then2", "timeout"],
    render: false,
    note: "Pořadí výstupu: A, B, then1, then2, timeout. Mikroúlohy předběhly makroúlohu s nulovým zpožděním.",
  },
];

function Queue({ x, y, w, label, items, hue, mono }) {
  return (
    <g>
      <text x={x} y={y - 6} fontSize="10.5" fontWeight="600" fill="var(--text)">{label}</text>
      <rect x={x} y={y} width={w} height={34} rx={5} fill="var(--bg-card)" stroke="var(--line)" />
      {items.length === 0 ? (
        <text x={x + w / 2} y={y + 22} textAnchor="middle" fontSize="10" fill="var(--text-faint)">prázdné</text>
      ) : (
        items.map((it, i) => (
          <g key={i}>
            <rect x={x + 6 + i * 78} y={y + 6} width={72} height={22} rx={3}
              fill={`oklch(0.62 0.15 ${hue} / 0.22)`} stroke={`oklch(0.6 0.15 ${hue})`} />
            <text x={x + 6 + i * 78 + 36} y={y + 21} textAnchor="middle" fontSize="9.5"
              fontFamily={mono ? "var(--font-mono)" : undefined} fill="var(--text)">{it}</text>
          </g>
        ))
      )}
    </g>
  );
}

export default function WapEventLoop() {
  const [i, setI] = useState(0);
  const s = STEPS[i];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← zpět</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {i + 1} / {STEPS.length}
        </span>
        <button className="viz-btn primary" onClick={() => setI(Math.min(STEPS.length - 1, i + 1))} disabled={i === STEPS.length - 1}>další →</button>
      </div>

      <svg viewBox="0 0 540 250" style={{ width: "100%", maxWidth: 560, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* Call stack — vlevo, LIFO odspodu */}
        <text x="14" y="22" fontSize="10.5" fontWeight="600" fill="var(--text)">Call Stack (LIFO)</text>
        <rect x="14" y="28" width="150" height="170" rx="5" fill="var(--bg-card)" stroke="var(--line)" />
        {s.stack.length === 0 ? (
          <text x="89" y="120" textAnchor="middle" fontSize="10" fill="var(--text-faint)">prázdný</text>
        ) : (
          s.stack.map((f, k) => {
            const h = 26;
            const y = 190 - (k + 1) * (h + 4);
            return (
              <g key={k}>
                <rect x="26" y={y} width="126" height={h} rx={3}
                  fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)" />
                <text x="89" y={y + 17} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{f}</text>
              </g>
            );
          })
        )}

        {/* fronty vpravo */}
        <Queue x={186} y={42} w={262} label="fronta mikroúloh (vyšší priorita)" items={s.micro} hue={142} mono />
        <Queue x={186} y={118} w={262} label="fronta makroúloh" items={s.macro} hue={22} mono />

        {/* render indikátor */}
        <rect x={186} y={168} width={262} height={30} rx={5}
          fill={s.render ? "oklch(0.62 0.16 65 / 0.25)" : "var(--bg-card)"}
          stroke={s.render ? "oklch(0.6 0.16 65)" : "var(--line)"} />
        <text x={317} y={187} textAnchor="middle" fontSize="10.5"
          fontWeight={s.render ? "700" : "400"}
          fill={s.render ? "oklch(0.5 0.16 65)" : "var(--text-faint)"}>
          {s.render ? "▰ RENDER (zvážen po vyprázdnění mikroúloh)" : "render — teď ne"}
        </text>

        {/* konzole */}
        <text x="14" y="220" fontSize="10.5" fontWeight="600" fill="var(--text)">console</text>
        <rect x="14" y="226" width="512" height="18" rx="3" fill="var(--bg-card)" stroke="var(--line)" />
        <text x="22" y="239" fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)">
          {s.out.length ? "> " + s.out.join("  ·  ") : "> …"}
        </text>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--text)", marginBottom: 4 }}>{s.title}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.note}</div>
      </div>
    </div>
  );
}
