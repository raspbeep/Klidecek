// Onion routing layer-peeling stepper.
// A message wrapped in three encryption layers travels P1 → P2 → P3 → cíl.
// Each relay peels exactly one layer (its private key) and learns only its
// predecessor and successor. The exit hop (relay → cíl) is plaintext.
import { useState } from "react";

const RELAYS = [
  { id: "P1", label: "P1 · guard", layer: 0 },
  { id: "P2", label: "P2 · middle", layer: 1 },
  { id: "P3", label: "P3 · exit", layer: 2 },
];

// Layer colours (theme-aware via oklch, distinct hues).
const LAYER = [
  { hue: 235, name: "K_P1" }, // outer
  { hue: 25, name: "K_P2" },  // middle
  { hue: 145, name: "K_P3" }, // inner
];

// step 0: at sender (3 layers). step k (1..3): after relay k peeled a layer.
// step 4: delivered to cíl (plaintext).
const STEPS = [
  {
    title: "Odesílatel zabalí zprávu do 3 vrstev",
    at: "U",
    layers: 3,
    detail: "C = E(K_P1, E(K_P2, E(K_P3, M))). Odesílatel zná veřejné klíče všech relayů a šifruje od vnitřní vrstvy ven.",
    knows: "Odesílatel zná celou trasu i M.",
  },
  {
    title: "P1 (guard) oloupe vnější vrstvu",
    at: "P1",
    layers: 2,
    detail: "P1 dešifruje vnější vrstvu svým privátním klíčem. Uvnitř: „pošli na P2“ + dál zašifrovaná cibule.",
    knows: "P1 zná odesílatele a P2 — NE cíl, NE M.",
  },
  {
    title: "P2 (middle) oloupe další vrstvu",
    at: "P2",
    layers: 1,
    detail: "P2 dešifruje další vrstvu. Uvnitř: „pošli na P3“ + poslední zašifrovaná vrstva.",
    knows: "P2 zná P1 a P3 — NE odesílatele, NE cíl, NE M.",
  },
  {
    title: "P3 (exit) oloupe poslední vrstvu",
    at: "P3",
    layers: 0,
    detail: "P3 dešifruje poslední vrstvu a získá čistou zprávu M + adresu cíle.",
    knows: "P3 zná cíl a vidí plaintext M — NE odesílatele.",
  },
  {
    title: "Exit → cíl: nešifrovaný úsek!",
    at: "C",
    layers: 0,
    detail: "Úsek mezi exit relayem a cílem onion routing NEšifruje. Bez vlastního HTTPS vidí M každý na tomto úseku i exit relay.",
    knows: "Žádný jednotlivý uzel neviděl odesílatele i cíl současně.",
  },
];

export default function OnionRouting() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  const W = 520, H = 200;
  // node x positions: sender, P1, P2, P3, cíl
  const NODES = [
    { id: "U", x: 40, label: "odesílatel" },
    { id: "P1", x: 150, label: "P1" },
    { id: "P2", x: 255, label: "P2" },
    { id: "P3", x: 360, label: "P3" },
    { id: "C", x: 478, label: "cíl" },
  ];
  const ny = 70;
  const activeIdx = NODES.findIndex((n) => n.id === s.at);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* path links */}
        {NODES.slice(0, -1).map((n, i) => {
          const next = NODES[i + 1];
          const isExitLink = next.id === "C";
          const reached = i < activeIdx;
          return (
            <line key={`l-${i}`} x1={n.x + 14} y1={ny} x2={next.x - 14} y2={ny}
              stroke={isExitLink ? "oklch(0.62 0.18 25)" : "var(--accent)"}
              strokeWidth={reached || i === activeIdx - 1 ? 2 : 1}
              strokeDasharray={isExitLink ? "4 3" : "none"}
              opacity={reached || i === activeIdx - 1 ? 1 : 0.4}
              markerEnd="url(#or-arr)" />
          );
        })}
        <text x={(NODES[3].x + NODES[4].x) / 2} y={ny - 12} textAnchor="middle"
          fontSize="9" fill="oklch(0.62 0.18 25)" fontWeight="700">nešifrováno</text>

        {/* nodes */}
        {NODES.map((n, i) => {
          const isActive = n.id === s.at;
          const isRelay = n.id === "P1" || n.id === "P2" || n.id === "P3";
          let fill = "var(--bg-card)", stroke = "var(--line-strong)";
          if (n.id === "U") { fill = "var(--accent)"; stroke = "var(--accent)"; }
          else if (n.id === "C") { fill = "color-mix(in oklch, oklch(0.62 0.18 25) 18%, var(--bg-card))"; stroke = "oklch(0.62 0.18 25)"; }
          else if (isActive) { fill = "color-mix(in oklch, var(--accent) 28%, var(--bg-card))"; stroke = "var(--accent)"; }
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={ny} r="13" fill={fill} stroke={stroke} strokeWidth={isActive ? 2 : 1} />
              <text x={n.x} y={ny + 3.5} textAnchor="middle" fontSize="9"
                fontFamily="var(--font-mono)" fontWeight="700"
                fill={n.id === "U" ? "white" : "var(--text)"}>{n.label}</text>
              {isRelay && (
                <text x={n.x} y={ny + 28} textAnchor="middle" fontSize="8"
                  fontFamily="var(--font-mono)" fill="var(--text-muted)">
                  {RELAYS[i - 1].label.split("·")[1]}
                </text>
              )}
            </g>
          );
        })}

        {/* the onion: concentric layers, drawn at the active node */}
        <g transform={`translate(${NODES[Math.max(0, activeIdx)].x}, ${ny - 56})`}>
          {[2, 1, 0].map((li) => {
            const visible = li < s.layers;
            const r = 8 + li * 6;
            return (
              <circle key={li} cx="0" cy="0" r={r}
                fill="none"
                stroke={visible ? `oklch(0.6 0.16 ${LAYER[li].hue})` : "var(--line)"}
                strokeWidth={visible ? 2.4 : 0.5}
                strokeDasharray={visible ? "none" : "1 2"}
                opacity={visible ? 1 : 0.25} />
            );
          })}
          {/* core M */}
          <circle cx="0" cy="0" r="4"
            fill={s.layers === 0 ? "oklch(0.62 0.18 25)" : "var(--text-muted)"} />
          <text x="0" y="2.5" textAnchor="middle" fontSize="6.5" fontWeight="700"
            fill="white" fontFamily="var(--font-mono)">M</text>
        </g>

        {/* layer legend */}
        <g transform="translate(14, 150)" fontSize="9" fontFamily="var(--font-mono)">
          <text x="0" y="0" fill="var(--text-muted)" fontWeight="700">vrstvy:</text>
          {LAYER.map((l, i) => (
            <g key={i} transform={`translate(${52 + i * 92}, 0)`}>
              <circle cx="0" cy="-3" r="5" fill="none"
                stroke={`oklch(0.6 0.16 ${l.hue})`} strokeWidth="2.4"
                opacity={i < s.layers ? 1 : 0.25} />
              <text x="10" y="0" fill={i < s.layers ? "var(--text)" : "var(--text-faint)"}>
                E({l.name})
              </text>
            </g>
          ))}
        </g>

        <defs>
          <marker id="or-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← zpět</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step + 1} / {STEPS.length}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>další hop →</button>
        <button className="viz-btn" onClick={() => setStep(0)}>reset</button>
      </div>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{s.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6 }}>{s.detail}</div>
        <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{s.knows}</div>
      </div>
    </div>
  );
}
