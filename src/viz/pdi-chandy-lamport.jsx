// Chandy–Lamportův snímek na 3 procesech v kruhu (P1->P2->P3->P1, FIFO kanály).
// Krokuj: iniciace u P1, šíření markerů, nahrávání kanálů, terminace.
// Vlevo topologie + markery/stavy, vpravo skládaný snímek (lokální stavy + stavy kanálů).
import { useState } from "react";

const W = 540, H = 230;
// procesy v trojúhelníku
const NODES = {
  P1: { x: 130, y: 60 },
  P2: { x: 250, y: 175 },
  P3: { x: 60, y: 175 },
};
// orientované FIFO kanály (kruh)
const CHANS = [
  { id: "c12", from: "P1", to: "P2" },
  { id: "c23", from: "P2", to: "P3" },
  { id: "c31", from: "P3", to: "P1" },
];

// stav: které procesy už zaznamenaly LS, na kterých kanálech je marker / nahrávání,
// jaké stavy kanálů jsou hotové.
const STEPS = [
  {
    title: "Start — výpočet běží",
    detail: "Žádný snímek se zatím nepořizuje. P1 se rozhodne iniciovat.",
    recorded: [],
    markerOn: [],
    recording: [],
    chanState: {},
    done: false,
  },
  {
    title: "Iniciace u P1",
    detail: "P1 zaznamená svůj lokální stav LS₁, vyšle marker na svůj odchozí kanál c12 (před jakoukoli další zprávou) a začne nahrávat příchozí kanál c31.",
    recorded: ["P1"],
    markerOn: ["c12"],
    recording: ["c31"],
    chanState: {},
    done: false,
  },
  {
    title: "P2 přijal první marker (kanálem c12)",
    detail: "P2 dosud stav neměl → zaznamená LS₂. Kanál c12, kterým marker přišel, označí jako prázdný. Vyšle marker na c23 a začne nahrávat ostatní příchozí kanály.",
    recorded: ["P1", "P2"],
    markerOn: ["c23"],
    recording: ["c31"],
    chanState: { c12: "∅" },
    done: false,
  },
  {
    title: "P3 přijal první marker (kanálem c23)",
    detail: "P3 zaznamená LS₃, kanál c23 označí jako prázdný, vyšle marker na c31 a nahrává ostatní příchozí kanály.",
    recorded: ["P1", "P2", "P3"],
    markerOn: ["c31"],
    recording: [],
    chanState: { c12: "∅", c23: "∅" },
    done: false,
  },
  {
    title: "P1 přijal opakovaný marker (kanálem c31)",
    detail: "P1 už svůj stav má → stav nemění. Zastaví nahrávání c31 a zaznamená jeho stav jako množinu zpráv nahraných od svého snímku do příchodu markeru (zde {m}). P1 už dostal marker ze všech příchozích kanálů → terminuje.",
    recorded: ["P1", "P2", "P3"],
    markerOn: [],
    recording: [],
    chanState: { c12: "∅", c23: "∅", c31: "{m}" },
    done: true,
  },
];

export default function PdiChandyLamport() {
  const [s, setS] = useState(0);
  const step = STEPS[s];

  const markerHot = (cid) => step.markerOn.includes(cid);
  const recHot = (cid) => step.recording.includes(cid);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* ovládání */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setS(Math.max(0, s - 1))} disabled={s === 0}>← zpět</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          fáze {s + 1} / {STEPS.length}
        </span>
        <button className="viz-btn primary" onClick={() => setS(Math.min(STEPS.length - 1, s + 1))} disabled={s === STEPS.length - 1}>další →</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 560 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <line x1={300} y1={14} x2={300} y2={H - 14} stroke="var(--line)" strokeWidth="0.8" strokeDasharray="3 4" />

        {/* ── levá část: topologie ── */}
        {CHANS.map((c) => {
          const a = NODES[c.from], b = NODES[c.to];
          // zkrácení o poloměr uzlu
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
          const ux = dx / len, uy = dy / len;
          const x1 = a.x + ux * 22, y1 = a.y + uy * 22;
          const x2 = b.x - ux * 22, y2 = b.y - uy * 22;
          const hot = markerHot(c.id);
          const rec = recHot(c.id);
          const stroke = hot ? "var(--accent)" : rec ? "oklch(0.62 0.16 65)" : "var(--line-strong)";
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          return (
            <g key={c.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke}
                strokeWidth={hot || rec ? 2 : 1.1} markerEnd="url(#clArr)" />
              {hot && (
                <g>
                  <rect x={mx - 24} y={my - 9} width="48" height="16" rx="3" fill="var(--accent)" />
                  <text x={mx} y={my + 3} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--accent-text-on)">MARKER</text>
                </g>
              )}
              {rec && !hot && (
                <text x={mx} y={my - 5} textAnchor="middle" fontSize="9" fill="oklch(0.62 0.16 65)" fontFamily="var(--font-mono)">REC…</text>
              )}
            </g>
          );
        })}
        {Object.entries(NODES).map(([id, n]) => {
          const rec = step.recorded.includes(id);
          return (
            <g key={id}>
              <circle cx={n.x} cy={n.y} r="22"
                fill={rec ? "var(--accent-soft)" : "var(--bg-card)"}
                stroke={rec ? "var(--accent)" : "var(--line-strong)"} strokeWidth={rec ? 2 : 1.2} />
              <text x={n.x} y={n.y - 1} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">{id}</text>
              <text x={n.x} y={n.y + 11} textAnchor="middle" fontSize="8" fill={rec ? "var(--accent)" : "var(--text-faint)"} fontFamily="var(--font-mono)">
                {rec ? "LS uloženo" : "běží"}
              </text>
            </g>
          );
        })}

        {/* ── pravá část: skládaný snímek ── */}
        <text x={420} y={26} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-muted)">SNÍMEK</text>
        <text x={320} y={50} fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">lokální stavy:</text>
        {["P1", "P2", "P3"].map((p, i) => {
          const has = step.recorded.includes(p);
          return (
            <g key={p}>
              <rect x={320 + i * 66} y={56} width="58" height="22" rx="4"
                fill={has ? "var(--accent-soft)" : "var(--bg-card)"}
                stroke={has ? "var(--accent)" : "var(--line)"} strokeWidth="1" />
              <text x={349 + i * 66} y={71} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)"
                fill={has ? "var(--text)" : "var(--text-faint)"}>
                {has ? `LS${i + 1} ✓` : `LS${i + 1} –`}
              </text>
            </g>
          );
        })}
        <text x={320} y={104} fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">stavy kanálů:</text>
        {CHANS.map((c, i) => {
          const v = step.chanState[c.id];
          return (
            <g key={c.id}>
              <rect x={320} y={112 + i * 26} width="200" height="20" rx="4"
                fill={v ? "var(--bg-card)" : "var(--bg-inset)"}
                stroke={v ? "var(--accent)" : "var(--line)"} strokeWidth="1" />
              <text x={328} y={126 + i * 26} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                SC[{c.from}→{c.to}]
              </text>
              <text x={512} y={126 + i * 26} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600"
                fill={v ? "var(--accent)" : "var(--text-faint)"}>
                {v || "—"}
              </text>
            </g>
          );
        })}
        {step.done && (
          <text x={420} y={216} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--accent)">snímek hotový — konzistentní stav</text>
        )}

        <defs>
          <marker id="clArr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{step.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{step.detail}</div>
      </div>
    </div>
  );
}
