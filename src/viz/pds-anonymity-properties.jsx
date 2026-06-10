// Anonymity properties selector: sender / receiver / relationship anonymity
// (the three facets of unlinkability) + unobservability. Click a mode and the
// diagram highlights what an observer is prevented from learning about the
// A → B communication.
import { useState } from "react";

const MODES = [
  {
    id: "sender",
    label: "Sender anonymity",
    q: "„Kdo poslal?“",
    hideA: true, hideB: false, hideLink: false, hideExist: false,
    note: "Skrývá identitu ODESÍLATELE. Pozorovatel ví, že B něco dostává, ale ne od koho.",
  },
  {
    id: "receiver",
    label: "Receiver anonymity",
    q: "„Kdo je příjemce?“",
    hideA: false, hideB: true, hideLink: false, hideExist: false,
    note: "Skrývá identitu PŘÍJEMCE. Pozorovatel ví, že A něco posílá, ale ne komu.",
  },
  {
    id: "relationship",
    label: "Relationship anonymity",
    q: "„Jsou A a B ve spojení?“",
    hideA: false, hideB: false, hideLink: true, hideExist: false,
    note: "Slabší cíl: A i B mohou být známí, ale jejich VZTAH ne — nelze spojit konkrétní A s konkrétním B. Sem cílí mixovací sítě.",
  },
  {
    id: "unobs",
    label: "Unobservability",
    q: "„Proběhla vůbec zpráva?“",
    hideA: true, hideB: true, hideLink: true, hideExist: true,
    note: "Nejsilnější: sledovaná událost nejde odlišit od šumu. Cover/dummy traffic skryje i samotnou EXISTENCI komunikace.",
  },
];

export default function AnonymityProperties() {
  const [mode, setMode] = useState("relationship");
  const m = MODES.find((x) => x.id === mode);

  const W = 460, H = 150;
  const ax = 90, bx = 370, y = 78;

  const HIDE = "oklch(0.62 0.14 235)";
  const SHOW = "var(--text)";

  const linkVisible = !m.hideLink && !m.hideExist;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        {MODES.map((x) => (
          <button key={x.id}
            className="viz-btn"
            data-active={mode === x.id}
            onClick={() => setMode(x.id)}>
            {x.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fill="var(--accent)" fontWeight="700">
          {m.q}
        </text>

        {/* link A → B */}
        <line x1={ax + 24} y1={y} x2={bx - 24} y2={y}
          stroke={linkVisible ? "var(--accent)" : HIDE}
          strokeWidth={linkVisible ? 2.5 : 1.5}
          strokeDasharray={linkVisible ? "none" : "5 4"}
          opacity={m.hideExist ? 0.25 : 1}
          markerEnd={linkVisible ? "url(#ap-arr)" : "none"} />
        {!linkVisible && (
          <text x={(ax + bx) / 2} y={y - 12} textAnchor="middle" fontSize="9"
            fill={HIDE} fontWeight="700">
            {m.hideExist ? "? existuje vůbec ?" : "? vztah skrytý ?"}
          </text>
        )}

        {/* A */}
        <circle cx={ax} cy={y} r="22"
          fill={m.hideA ? `color-mix(in oklch, ${HIDE} 18%, var(--bg-card))` : "var(--accent)"}
          stroke={m.hideA ? HIDE : "var(--accent)"} strokeWidth={m.hideA ? 1.5 : 1}
          strokeDasharray={m.hideA ? "4 3" : "none"}
          opacity={m.hideExist ? 0.4 : 1} />
        <text x={ax} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="700"
          fill={m.hideA ? HIDE : "white"} opacity={m.hideExist ? 0.5 : 1}>
          {m.hideA ? "?" : "A"}
        </text>
        <text x={ax} y={y + 38} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
          fill={m.hideA ? HIDE : SHOW} fontWeight="700">
          odesílatel
        </text>

        {/* B */}
        <circle cx={bx} cy={y} r="22"
          fill={m.hideB ? `color-mix(in oklch, ${HIDE} 18%, var(--bg-card))` : "color-mix(in oklch, var(--accent) 30%, var(--bg-card))"}
          stroke={m.hideB ? HIDE : "var(--accent)"} strokeWidth={m.hideB ? 1.5 : 1}
          strokeDasharray={m.hideB ? "4 3" : "none"}
          opacity={m.hideExist ? 0.4 : 1} />
        <text x={bx} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="700"
          fill={m.hideB ? HIDE : "var(--text)"} opacity={m.hideExist ? 0.5 : 1}>
          {m.hideB ? "?" : "B"}
        </text>
        <text x={bx} y={y + 38} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
          fill={m.hideB ? HIDE : SHOW} fontWeight="700">
          příjemce
        </text>

        {/* legend */}
        <g transform="translate(14, 138)" fontSize="9" fontFamily="var(--font-mono)">
          <circle cx="2" cy="-3" r="4" fill="var(--accent)" />
          <text x="11" y="0" fill="var(--text-muted)">známé pozorovateli</text>
          <circle cx="150" cy="-3" r="4" fill="none" stroke={HIDE} strokeDasharray="2 2" />
          <text x="159" y="0" fill="var(--text-muted)">skryté</text>
        </g>

        <defs>
          <marker id="ap-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 z" fill="var(--accent)" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{m.label}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{m.note}</div>
      </div>
    </div>
  );
}
