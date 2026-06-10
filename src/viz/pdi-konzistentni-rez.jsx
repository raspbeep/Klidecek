// Konzistentní řez — táhni řez na třech procesech. Zprávy jdou jako šipky;
// pokud nějaká šipka míří z budoucnosti (vpravo od řezu) do minulosti (vlevo),
// je porušena kauzalita (podmínka C2) a řez se zbarví červeně.
import { useState } from "react";

const W = 540, H = 220;
const PROCS = [
  { id: "P1", y: 55 },
  { id: "P2", y: 115 },
  { id: "P3", y: 175 },
];
// časové pozice (sloupce) události 0..10
const X0 = 70, XSTEP = 42;
const tx = (t) => X0 + t * XSTEP;

// zprávy: from {p, t} -> to {p, t}
const MSGS = [
  { fp: 0, ft: 1, tp: 1, tt: 2 }, // P1 -> P2
  { fp: 1, ft: 4, tp: 2, tt: 5 }, // P2 -> P3
  { fp: 2, ft: 3, tp: 0, tt: 6 }, // P3 -> P1
  { fp: 0, ft: 7, tp: 2, tt: 8 }, // P1 -> P3
];

export default function PdiKonzistentniRez() {
  // pozice řezu na každém procesu (čas, mezi 1 a 9)
  const [cut, setCut] = useState([5, 3, 7]);

  // hrana zprávy přechází z minulosti do budoucnosti?
  // porušení: send je v budoucnosti (t_send > cut[from]) ALE recv je v minulosti (t_recv <= cut[to])
  const violations = MSGS.map((m) => {
    const sendPast = m.ft <= cut[m.fp];
    const recvPast = m.tt <= cut[m.tp];
    // C2 porušeno, pokud příjem v minulosti, ale odeslání v budoucnosti
    return recvPast && !sendPast;
  });
  const anyViol = violations.some(Boolean);

  const set = (i, v) => {
    const next = [...cut];
    next[i] = +v;
    setCut(next);
  };

  const cutColor = anyViol ? "oklch(0.6 0.2 22)" : "var(--accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 560 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* minulost / budoucnost popisky */}
        <text x={X0 - 6} y={22} fontSize="10" fill="var(--text-muted)">minulost</text>
        <text x={W - 14} y={22} textAnchor="end" fontSize="10" fill="var(--text-muted)">budoucnost</text>

        {/* časové osy procesů */}
        {PROCS.map((p) => (
          <g key={p.id}>
            <line x1={X0 - 20} y1={p.y} x2={W - 14} y2={p.y} stroke="var(--text-faint)" strokeWidth="0.8" />
            <text x={X0 - 26} y={p.y + 4} textAnchor="end" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{p.id}</text>
          </g>
        ))}

        {/* události na osách (tečky v každém kroku, kde je událost) */}
        {PROCS.map((p, pi) => {
          const ts = new Set();
          MSGS.forEach((m) => { if (m.fp === pi) ts.add(m.ft); if (m.tp === pi) ts.add(m.tt); });
          return [...ts].map((t) => {
            const past = t <= cut[pi];
            return (
              <circle key={`${pi}-${t}`} cx={tx(t)} cy={p.y} r="4.5"
                fill={past ? "var(--bg-card)" : "var(--bg-inset)"}
                stroke={past ? "var(--line-strong)" : "var(--text-faint)"} strokeWidth="1" />
            );
          });
        })}

        {/* zprávy — zkrácené o poloměr uzlové tečky, aby šipka nezapadla do bodu */}
        {MSGS.map((m, i) => {
          const ax = tx(m.ft), ay = PROCS[m.fp].y;
          const bx = tx(m.tt), by = PROCS[m.tp].y;
          const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;
          const x1 = ax + ux * 6, y1 = ay + uy * 6;
          const x2 = bx - ux * 7, y2 = by - uy * 7;
          const col = violations[i] ? "oklch(0.6 0.2 22)" : "var(--text-muted)";
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={col} strokeWidth={violations[i] ? 1.8 : 1.1}
              markerEnd={violations[i] ? "url(#crBad)" : "url(#crOk)"} />
          );
        })}

        {/* řez jako lomená čára spojující pozice na procesech */}
        <polyline
          points={PROCS.map((p, i) => `${tx(cut[i])},${p.y}`).join(" ")}
          fill="none" stroke={cutColor} strokeWidth="1.4" strokeDasharray="5 3" opacity="0.55" />
        {PROCS.map((p, i) => (
          <g key={`h${i}`}>
            <line x1={tx(cut[i])} y1={p.y - 16} x2={tx(cut[i])} y2={p.y + 16} stroke={cutColor} strokeWidth="2" />
          </g>
        ))}

        <defs>
          <marker id="crOk" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="var(--text-muted)" />
          </marker>
          <marker id="crBad" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="oklch(0.6 0.2 22)" />
          </marker>
        </defs>
      </svg>

      {/* slidery */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {PROCS.map((p, i) => (
          <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
            <span style={{ width: 28, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{p.id}</span>
            <input type="range" className="viz-slider" min={1} max={9} value={cut[i]} onChange={(e) => set(i, e.target.value)} style={{ flex: 1 }} />
            <span style={{ width: 20, textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-faint)" }}>{cut[i]}</span>
          </label>
        ))}
      </div>

      {/* verdikt */}
      <div style={{
        padding: 9, borderRadius: 6, fontSize: 12.5, lineHeight: 1.45,
        background: anyViol ? "oklch(0.6 0.2 22 / 0.12)" : "var(--accent-soft)",
        border: `1px solid ${anyViol ? "oklch(0.6 0.2 22 / 0.4)" : "var(--accent-line)"}`,
        color: "var(--text)",
      }}>
        {anyViol ? (
          <span><b style={{ color: "oklch(0.6 0.2 22)" }}>Nekonzistentní řez.</b> Některá zpráva je přijata v minulosti, ale odeslána až v budoucnosti — efekt bez příčiny (porušení C2).</span>
        ) : (
          <span><b style={{ color: "var(--accent)" }}>Konzistentní řez.</b> Každá zpráva přes řez vede z minulosti do budoucnosti (zpráva v tranzitu). Řez je uzavřený vůči nastalo-před.</span>
        )}
      </div>
    </div>
  );
}
