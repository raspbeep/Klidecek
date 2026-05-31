// wap-xss-types — přepínač tří forem XSS: Stored, Reflected, DOM-based.
// Pro každou formu ukáže cestu škodlivého payloadu (kde se uloží / odrazí /
// kde se vykoná) a zda se na útoku podílí server, nebo jde čistě o klienta.
import { useState } from "react";

const RED = "oklch(0.55 0.18 22)";
const ACCENT = "oklch(0.55 0.16 264)";

const TYPES = {
  stored: {
    label: "Stored",
    sub: "perzistentní",
    server: true,
    desc: "Payload se trvale uloží na serveru (např. komentář v DB). Vykoná se KAŽDÉMU, kdo si obsah zobrazí — bez interakce útočníka.",
    nodes: [
      { id: "atk", x: 40, label: "útočník", note: "vloží <script>" },
      { id: "srv", x: 175, label: "server / DB", note: "ULOŽÍ payload", hot: true },
      { id: "vic", x: 320, label: "oběť", note: "skript se spustí", hot: true },
    ],
    edges: [["atk", "srv"], ["srv", "vic"]],
  },
  reflected: {
    label: "Reflected",
    sub: "odražený",
    server: true,
    desc: "Payload je v URL/požadavku. Server jej neošetřený „odrazí\" zpět v odpovědi, která se vykoná v prohlížeči oběti. Útočník musí oběť přimět kliknout na připravený odkaz.",
    nodes: [
      { id: "atk", x: 40, label: "útočník", note: "pošle odkaz" },
      { id: "vic", x: 175, label: "oběť klikne", note: "?q=<script>" },
      { id: "srv", x: 320, label: "server", note: "odrazí do HTML", hot: true },
    ],
    edges: [["atk", "vic"], ["vic", "srv"]],
  },
  dom: {
    label: "DOM-based",
    sub: "klientský",
    server: false,
    desc: "Zranitelnost je čistě v klientském JS. Skript přečte data z URL (location.hash) a předá je do nebezpečného sinku (innerHTML / eval). Server payload nikdy nevidí.",
    nodes: [
      { id: "atk", x: 40, label: "útočník", note: "odkaz s #payload" },
      { id: "vic", x: 175, label: "oběť — JS", note: "čte location.hash" },
      { id: "sink", x: 320, label: "sink", note: "innerHTML = …", hot: true },
    ],
    edges: [["atk", "vic"], ["vic", "sink"]],
  },
};

export default function WapXssTypes() {
  const [key, setKey] = useState("stored");
  const t = TYPES[key];
  const W = 380;
  const H = 150;

  const nodeById = (id) => t.nodes.find((n) => n.id === id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {Object.entries(TYPES).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setKey(k)}
            style={{
              flex: 1,
              padding: "7px 6px",
              fontSize: 12,
              borderRadius: 6,
              cursor: "pointer",
              border: key === k ? `1.5px solid ${ACCENT}` : "1px solid var(--line)",
              background: key === k ? "oklch(0.55 0.16 264 / 0.12)" : "var(--bg-card)",
              color: key === k ? ACCENT : "var(--text-muted)",
              fontWeight: key === k ? 700 : 500,
            }}
          >
            {v.label}
            <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2 }}>{v.sub}</div>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* hrany — vždy zleva doprava mezi sousedními uzly, ve výšce středů */}
        {t.edges.map(([a, b], i) => {
          const na = nodeById(a);
          const nb = nodeById(b);
          return (
            <line
              key={i}
              x1={na.x + 22}
              y1={56}
              x2={nb.x - 22}
              y2={56}
              stroke={RED}
              strokeWidth="1.6"
              markerEnd="url(#wapXssArr)"
            />
          );
        })}

        {/* uzly — krajní popisky kotvíme dovnitř, aby nepřetekly viewBox */}
        {t.nodes.map((n) => {
          const anchor = n.x < 80 ? "start" : n.x > W - 80 ? "end" : "middle";
          const noteX = anchor === "start" ? n.x - 22 : anchor === "end" ? n.x + 22 : n.x;
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={56}
                r={22}
                fill={n.hot ? "oklch(0.55 0.18 22 / 0.15)" : "var(--bg-card)"}
                stroke={n.hot ? RED : "var(--line-strong)"}
                strokeWidth={n.hot ? 1.6 : 1}
              />
              <text x={n.x} y={60} textAnchor="middle" fontSize="9.5" fill="var(--text)">
                {n.label}
              </text>
              <text x={noteX} y={98} textAnchor={anchor} fontSize="9" fontFamily="var(--font-mono)"
                fill={n.hot ? RED : "var(--text-muted)"}>
                {n.note}
              </text>
            </g>
          );
        })}

        {/* role serveru */}
        <text x={W / 2} y={130} textAnchor="middle" fontSize="10.5"
          fill={t.server ? ACCENT : "var(--text-muted)"}>
          {t.server ? "server se na útoku podílí (odráží / ukládá)" : "server payload NIKDY nevidí — vše na klientovi"}
        </text>

        <defs>
          <marker id="wapXssArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={RED} />
          </marker>
        </defs>
      </svg>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, padding: "8px 10px", background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        {t.desc}
      </div>
    </div>
  );
}
