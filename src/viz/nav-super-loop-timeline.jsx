// nav-super-loop-timeline — jak se v super-loopu skládá doba reakce.
// Tři úlohy v cyklu; přepínač "blokující úloha" prodlouží jednu z nich a
// ukáže, jak se zdrží všechny následující (jitter) a jak doba reakce na
// událost = součet WCET zbytku cyklu. Slider = okamžik vzniku události.
import { useState } from "react";

const HUES = [264, 22, 142]; // tři úlohy

export default function NavSuperLoopTimeline() {
  const [blocking, setBlocking] = useState(false);
  const [eventAt, setEventAt] = useState(15); // % cyklu, kdy přijde událost

  // WCET jednotlivých úloh (v ms); blokující varianta nafoukne úlohu B.
  const tasks = [
    { name: "A: čtení vstupů", wcet: 4 },
    { name: "B: výpočet logiky", wcet: blocking ? 22 : 6 },
    { name: "C: zápis výstupů", wcet: 5 },
  ];
  const total = tasks.reduce((s, t) => s + t.wcet, 0);

  // Geometrie: dva cykly za sebou, ať je vidět opakování.
  const W = 560, H = 200;
  const x0 = 14, trackW = W - x0 - 14;
  const scale = trackW / (2 * total); // px na ms (dva cykly)
  const rowY = 54, rowH = 30;

  // Událost přijde v eventAt % prvního cyklu.
  const evMs = (eventAt / 100) * total;
  // Najdi, ve které úloze prvního cyklu událost padne, a spočítej zbytek do
  // konce cyklu — to je nejhorší doba reakce (event poll až na začátku dalšího
  // cyklu, plus celý zbývající WCET).
  let acc = 0, evTask = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (evMs >= acc && evMs < acc + tasks[i].wcet) { evTask = i; break; }
    acc += tasks[i].wcet;
  }
  // Reakce: pokud událost vstup čte úloha A na začátku cyklu, musí počkat na
  // dokončení aktuálního cyklu (od evMs do total) + celé úlohy A příštího cyklu.
  const responseMs = (total - evMs) + tasks[0].wcet;

  // Vykreslení jednoho cyklu od offsetu cycleStart (v ms).
  function cycle(cycleStart, key) {
    let cx = x0 + cycleStart * scale;
    return tasks.map((t, i) => {
      const w = t.wcet * scale;
      const seg = (
        <g key={`${key}-${i}`}>
          <rect x={cx} y={rowY} width={w} height={rowH} rx={3}
            fill={`oklch(0.65 0.13 ${HUES[i]} / ${i === 1 && blocking ? 0.85 : 0.55})`}
            stroke={`oklch(0.6 0.14 ${HUES[i]})`} strokeWidth="1" />
          {w > 26 && (
            <text x={cx + w / 2} y={rowY + rowH / 2 + 3.5} textAnchor="middle"
              fontSize="9.5" fill="var(--text)" fontWeight="600">
              {t.name.split(":")[0]}
            </text>
          )}
        </g>
      );
      cx += w;
      return seg;
    });
  }

  const evX = x0 + evMs * scale;
  const pollX = x0 + total * scale + tasks[0].wcet * scale; // začátek A v dalším cyklu, kdy se vstup přečte

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap", alignItems: "center", fontSize: 11.5 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input type="checkbox" checked={blocking} onChange={(e) => setBlocking(e.target.checked)} />
          <span>úloha B blokuje (čeká na periferii)</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 180 }}>
          <span style={{ color: "var(--text-muted)" }}>událost v</span>
          <input type="range" min={0} max={99} value={eventAt}
            onChange={(e) => setEventAt(+e.target.value)} style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{eventAt}%</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 580, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* časová osa */}
        <line x1={x0} y1={rowY + rowH + 14} x2={W - 14} y2={rowY + rowH + 14} stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={W - 14} y={rowY + rowH + 27} textAnchor="end" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">čas →</text>

        {/* dva cykly */}
        {cycle(0, "c1")}
        {cycle(total, "c2")}

        {/* hranice cyklů */}
        {[0, 1, 2].map((k) => (
          <line key={k} x1={x0 + k * total * scale} y1={rowY - 6} x2={x0 + k * total * scale} y2={rowY + rowH + 6}
            stroke="var(--line-strong)" strokeWidth="0.8" strokeDasharray="2 3" />
        ))}
        <text x={x0 + total * scale / 2} y={rowY - 12} textAnchor="middle" fontSize="9" fill="var(--text-muted)">cyklus N</text>
        <text x={x0 + total * scale * 1.5} y={rowY - 12} textAnchor="middle" fontSize="9" fill="var(--text-muted)">cyklus N+1</text>

        {/* událost */}
        <line x1={evX} y1={rowY - 6} x2={evX} y2={rowY + rowH + 30} stroke="oklch(0.62 0.2 30)" strokeWidth="1.4" />
        <circle cx={evX} cy={rowY - 6} r={4} fill="oklch(0.62 0.2 30)" />
        <text x={evX} y={rowY + rowH + 40} textAnchor="middle" fontSize="9" fill="oklch(0.55 0.2 30)" fontWeight="600">událost</text>

        {/* okamžik obsloužení = další čtení vstupů (konec A v cyklu N+1) */}
        <line x1={pollX} y1={rowY - 6} x2={pollX} y2={rowY + rowH + 30} stroke="oklch(0.55 0.15 142)" strokeWidth="1.4" strokeDasharray="3 2" />
        <text x={pollX} y={rowY + rowH + 40} textAnchor="middle" fontSize="9" fill="oklch(0.5 0.15 142)" fontWeight="600">obslouženo</text>

        {/* šipka doby reakce */}
        <line x1={evX} y1={rowY + rowH + 52} x2={pollX} y2={rowY + rowH + 52} stroke="var(--text)" strokeWidth="1" markerEnd="url(#slArr)" markerStart="url(#slArrR)" />
        <rect x={(evX + pollX) / 2 - 52} y={rowY + rowH + 60} width={104} height={15} rx={2} fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.5" />
        <text x={(evX + pollX) / 2} y={rowY + rowH + 71} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text)">
          reakce ≈ {responseMs.toFixed(0)} ms
        </text>

        <defs>
          <marker id="slArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text)" />
          </marker>
          <marker id="slArrR" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M10,0 L0,5 L10,10 Z" fill="var(--text)" />
          </marker>
        </defs>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Doba jednoho cyklu = součet WCET úloh = <b style={{ color: "var(--text-muted)" }}>{total} ms</b>. Událost se přečte
        až při dalším průchodu blokem „čtení vstupů", proto je nejhorší doba reakce zdola omezena délkou celého cyklu.
        Zapni blokující úlohu B — celý cyklus se prodlouží a všechny ostatní úlohy se zdrží (jitter).
      </div>
    </div>
  );
}
