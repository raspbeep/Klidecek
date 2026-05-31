// wap-anycast — Unicast vs Anycast směrování + chování při DDoS.
// Unicast: jedna IP = jeden server; provoz (i útok) míří na jediný uzel,
//          při DDoS se zahltí.
// Anycast: tutéž IP sdílí N uzlů; BGP pošle klienta na nejbližší, a útok
//          se rozprostře napříč uzly — žádný jednotlivý se nezahltí.
import { useState } from "react";

const GREEN = "oklch(0.52 0.16 142)";
const RED = "oklch(0.55 0.18 22)";
const ACCENT = "oklch(0.55 0.16 264)";

// kapacita jednoho uzlu v jednotkách provozu
const CAP = 100;
const NORMAL_LOAD = 30;
const DDOS_LOAD = 600;

// uzly v anycastu (souřadnice v SVG)
const NODES = [
  { id: "EU", x: 250, y: 40 },
  { id: "US", x: 250, y: 96 },
  { id: "AS", x: 250, y: 152 },
];

export default function WapAnycast() {
  const [mode, setMode] = useState("anycast"); // "unicast" | "anycast"
  const [attack, setAttack] = useState(false);

  const W = 380;
  const H = 196;

  const total = attack ? DDOS_LOAD : NORMAL_LOAD;
  const nNodes = mode === "anycast" ? NODES.length : 1;
  // unicast: vše na jeden uzel; anycast: rozprostřeno rovnoměrně
  const perNode = total / nNodes;
  const overwhelmed = perNode > CAP;

  // v unicastu zobrazujeme jen prostřední uzel jako "ten jediný server"
  const activeNodes = mode === "anycast" ? NODES : [NODES[1]];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Ovládání */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          padding: 8,
          background: "var(--bg-inset)",
          borderRadius: 8,
          fontSize: 11.5,
        }}
      >
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>směrování:</span>
        {["unicast", "anycast"].map((m) => (
          <label key={m} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="radio"
              name="wap-anycast-mode"
              checked={mode === m}
              onChange={() => setMode(m)}
            />
            <span style={{ fontFamily: "var(--font-mono)" }}>{m === "unicast" ? "Unicast" : "Anycast"}</span>
          </label>
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 6 }}>
          <input type="checkbox" checked={attack} onChange={(e) => setAttack(e.target.checked)} />
          <span style={{ fontFamily: "var(--font-mono)", color: attack ? RED : "var(--text)" }}>
            DDoS záplava
          </span>
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* klient / zdroj provozu */}
        <circle cx="44" cy="96" r="16" fill={`color-mix(in oklch, ${attack ? RED : ACCENT} 18%, transparent)`} stroke={attack ? RED : ACCENT} />
        <text x="44" y="100" textAnchor="middle" fontSize="9.5" fill="var(--text)">
          {attack ? "botnet" : "klient"}
        </text>
        <text x="44" y="128" textAnchor="middle" fontSize="8.5" fill="var(--text-muted)">
          {total} prov.
        </text>

        {/* sdílená / serverová IP popisek */}
        <text x="250" y="14" textAnchor="middle" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          {mode === "anycast" ? "sdílená IP 198.51.1.1" : "IP 203.0.1.5"}
        </text>

        {/* spoje a uzly */}
        {activeNodes.map((n) => {
          const load = perNode;
          const hot = load > CAP;
          const stroke = hot ? RED : attack ? GREEN : ACCENT;
          return (
            <g key={n.id}>
              <line
                x1="60"
                y1="96"
                x2={n.x - 28}
                y2={n.y}
                stroke={hot ? RED : attack ? GREEN : "var(--text-muted)"}
                strokeWidth={Math.min(5, 1 + load / 80)}
                strokeDasharray={mode === "anycast" ? "0" : "0"}
              />
              <rect
                x={n.x - 28}
                y={n.y - 16}
                width="56"
                height="32"
                rx="5"
                fill={`color-mix(in oklch, ${stroke} ${hot ? 22 : 12}%, transparent)`}
                stroke={stroke}
                strokeWidth={hot ? 2 : 1.2}
              />
              <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--text)">
                uzel {n.id}
              </text>
              <text x={n.x} y={n.y + 9} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill={hot ? RED : "var(--text-muted)"}>
                {Math.round(load)}/{CAP} {hot ? "⚠" : "✓"}
              </text>
              {/* kapacitní proužek */}
              <rect x={n.x - 24} y={n.y + 14} width="48" height="3" rx="1.5" fill="var(--line)" />
              <rect
                x={n.x - 24}
                y={n.y + 14}
                width={Math.min(48, (load / CAP) * 48)}
                height="3"
                rx="1.5"
                fill={hot ? RED : GREEN}
              />
            </g>
          );
        })}

        {/* u anycastu naznačit ostatní (neaktivní u normálního provozu) uzly nejsou potřeba — všechny aktivní */}
        {mode === "anycast" && !attack && (
          <text x={NODES[0].x + 44} y={NODES[0].y + 4} fontSize="8" fill="var(--text-faint)">
            BGP → nejbližší
          </text>
        )}
      </svg>

      <div
        style={{
          fontSize: 12,
          color: "var(--text)",
          lineHeight: 1.5,
          padding: "8px 10px",
          background: "var(--bg-card)",
          borderRadius: 6,
          border: `1px solid ${overwhelmed ? RED : "var(--line)"}`,
        }}
      >
        <strong style={{ color: overwhelmed ? RED : GREEN }}>
          {overwhelmed ? "⚠ Uzel přetížen — výpadek služby." : "✓ Provoz v rámci kapacity."}
        </strong>{" "}
        <span style={{ color: "var(--text-muted)" }}>
          {mode === "unicast"
            ? attack
              ? `Unicast: celá záplava ${DDOS_LOAD} míří na jediný server (kapacita ${CAP}) — zahltí se.`
              : "Unicast: jedna IP = jeden server; běžný provoz zvládne."
            : attack
            ? `Anycast: BGP rozprostře útok napříč ${NODES.length} uzly → ${Math.round(perNode)} na uzel; síť útok pohltí.`
            : "Anycast: tutéž IP sdílí více uzlů; BGP klienta nasměruje na síťově nejbližší."}
        </span>
      </div>
    </div>
  );
}
