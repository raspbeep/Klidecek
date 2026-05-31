// wap-microtask-queue — postav scénář z bloků (sync / micro / macro) a viz
// spočítá pořadí výpisu podle pravidel smyčky: nejprve VŠECHEN sync kód,
// pak VŠECHNY mikroúlohy, pak makroúlohy po jedné. Ukazuje, proč
// Promise.then a kód po await předbíhají setTimeout(…,0).
import { useState } from "react";

const KINDS = {
  sync: { label: "synchronně", short: "sync", hue: 264 },
  micro: { label: "mikroúloha (.then / await)", short: "micro", hue: 142 },
  macro: { label: "makroúloha (setTimeout 0)", short: "macro", hue: 22 },
};

// Výchozí scénář v pořadí, jak je zapsán ve zdrojáku.
const DEFAULT = [
  { id: "A", kind: "sync" },
  { id: "T", kind: "macro" },
  { id: "P", kind: "micro" },
  { id: "B", kind: "sync" },
];

// Simuluj smyčku: sync v pořadí zápisu → microtask checkpoint → makroúlohy
// po jedné (mezi nimi opět checkpoint, zde ale žádné nové mikroúlohy
// nevznikají). Vrať seznam {id, kind, phase}.
function resolveOrder(blocks) {
  const out = [];
  // 1) všechen synchronní kód v pořadí zápisu
  for (const b of blocks) if (b.kind === "sync") out.push({ ...b, phase: "sync" });
  // 2) microtask checkpoint — všechny mikroúlohy v pořadí naplánování
  for (const b of blocks) if (b.kind === "micro") out.push({ ...b, phase: "micro" });
  // 3) makroúlohy po jedné (každá za svou otáčku)
  for (const b of blocks) if (b.kind === "macro") out.push({ ...b, phase: "macro" });
  return out;
}

export default function WapMicrotaskQueue() {
  const [blocks, setBlocks] = useState(DEFAULT);

  const setKind = (idx, kind) =>
    setBlocks((bs) => bs.map((b, i) => (i === idx ? { ...b, kind } : b)));

  const order = resolveOrder(blocks);
  const W = 520, rowH = 30, top = 30;
  const H = top + order.length * rowH + 16;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* editor scénáře */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>pořadí zápisu v kódu — změň typ každého bloku:</div>
        {blocks.map((b, i) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
            <span style={{ fontFamily: "var(--font-mono)", width: 70, color: "var(--text-muted)" }}>
              log("{b.id}")
            </span>
            <select value={b.kind} onChange={(e) => setKind(i, e.target.value)} style={sel}>
              {Object.entries(KINDS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* výsledné pořadí výpisu */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 540, background: "var(--bg-inset)", borderRadius: 6 }}>
        <text x="14" y="20" fontSize="11" fontWeight="600" fill="var(--text)">pořadí výpisu na konzoli ↓</text>
        {order.map((b, i) => {
          const k = KINDS[b.kind];
          const y = top + i * rowH;
          const phaseLabel =
            b.phase === "sync" ? "fáze: synchronní běh" :
            b.phase === "micro" ? "fáze: microtask checkpoint" :
            "fáze: makroúloha (1 / otáčka)";
          return (
            <g key={b.id}>
              <text x="22" y={y + 19} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">{i + 1}.</text>
              <rect x="48" y={y + 4} width="120" height="22" rx={4}
                fill={`oklch(0.62 0.15 ${k.hue} / 0.22)`} stroke={`oklch(0.6 0.15 ${k.hue})`} />
              <text x="108" y={y + 19} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
                {b.id} · {k.short}
              </text>
              <text x="184" y={y + 19} fontSize="10" fill="var(--text-faint)">{phaseLabel}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Smyčka odbaví <b style={{ color: "var(--text)" }}>všechen synchronní kód</b>, pak v jednom checkpointu
        <b style={{ color: "oklch(0.55 0.15 142)" }}> všechny mikroúlohy</b>, a teprve nakonec
        <b style={{ color: "oklch(0.58 0.18 22)" }}> makroúlohy</b> — proto <code>setTimeout(…, 0)</code> vždy prohraje
        s <code>.then</code>, ať je v kódu napsán kdekoli.
      </div>
    </div>
  );
}

const sel = {
  padding: "3px 6px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 3,
  color: "var(--text)",
};
