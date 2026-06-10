// VPN / proxy "who knows what" diagram.
// User → encrypted tunnel → gateway → internet → destination.
// Switch the observer to see what each one can link. The gateway operator is
// the single point of trust: it sees source AND destination simultaneously.
import { useState } from "react";

const OBSERVERS = [
  {
    id: "isp",
    label: "ISP před bránou",
    src: "known",
    dst: "hidden",
    note: "ISP vidí vaši reálnou IP a šifrovaný tunel k bráně — NE cíl.",
  },
  {
    id: "gateway",
    label: "provozovatel brány",
    src: "known",
    dst: "known",
    note: "Brána vidí ZÁROVEŇ zdroj i cíl — jediný bod důvěry. Žádná anonymita!",
  },
  {
    id: "after",
    label: "pozorovatel za bránou",
    src: "hidden",
    dst: "known",
    note: "Za bránou je vidět IP brány a cíl — NE vaše reálná IP.",
  },
];

export default function VpnAnonymity() {
  const [obs, setObs] = useState("gateway");
  const o = OBSERVERS.find((x) => x.id === obs);

  const W = 520, H = 188;
  const userX = 56, gwX = 260, dstX = 464, y = 78;

  const srcKnown = o.src === "known";
  const dstKnown = o.dst === "known";
  const isGateway = obs === "gateway";

  const KNOWN = "oklch(0.6 0.18 25)";
  const HIDDEN = "oklch(0.62 0.14 235)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>pozorovatel:</span>
        {OBSERVERS.map((x) => (
          <button key={x.id}
            className="viz-btn"
            data-active={obs === x.id}
            onClick={() => setObs(x.id)}>
            {x.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* observer position marker band */}
        {obs === "isp" && <rect x={userX + 24} y={20} width={gwX - userX - 60} height={116} fill="color-mix(in oklch, oklch(0.62 0.14 235) 8%, transparent)" />}
        {obs === "after" && <rect x={gwX + 36} y={20} width={dstX - gwX - 60} height={116} fill="color-mix(in oklch, oklch(0.6 0.18 25) 8%, transparent)" />}
        {obs === "gateway" && <rect x={gwX - 34} y={20} width={68} height={116} fill="color-mix(in oklch, oklch(0.6 0.18 25) 12%, transparent)" />}

        {/* tunnel: user → gateway (encrypted) */}
        <line x1={userX + 22} y1={y} x2={gwX - 26} y2={y}
          stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
        <text x={(userX + gwX) / 2 - 2} y={y - 14} textAnchor="middle" fontSize="9.5"
          fill="var(--accent)" fontWeight="700">🔒 šifrovaný tunel</text>

        {/* gateway → destination (plain) */}
        <line x1={gwX + 26} y1={y} x2={dstX - 22} y2={y}
          stroke="var(--text-muted)" strokeWidth="2.5" />
        <text x={(gwX + dstX) / 2 + 2} y={y - 14} textAnchor="middle" fontSize="9.5"
          fill="var(--text-muted)">provoz jménem brány</text>

        {/* user */}
        <circle cx={userX} cy={y} r="20" fill="var(--accent)" stroke="var(--accent)" />
        <text x={userX} y={y + 3.5} textAnchor="middle" fontSize="10" fill="white" fontWeight="700">uživatel</text>
        <text x={userX} y={y + 36} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
          fill={srcKnown ? KNOWN : HIDDEN} fontWeight="700">
          zdroj: {srcKnown ? "ZNÁMÝ" : "skrytý"}
        </text>

        {/* gateway */}
        <rect x={gwX - 26} y={y - 18} width="52" height="36" rx="5"
          fill={isGateway ? "color-mix(in oklch, oklch(0.6 0.18 25) 25%, var(--bg-card))" : "var(--bg-card)"}
          stroke={isGateway ? KNOWN : "var(--line-strong)"} strokeWidth={isGateway ? 2 : 1} />
        <text x={gwX} y={y - 3} textAnchor="middle" fontSize="9.5" fill="var(--text)" fontWeight="700">VPN /</text>
        <text x={gwX} y={y + 9} textAnchor="middle" fontSize="9.5" fill="var(--text)" fontWeight="700">proxy</text>
        {isGateway && (
          <text x={gwX} y={y + 36} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
            fill={KNOWN} fontWeight="700">vidí ZDROJ i CÍL</text>
        )}

        {/* destination */}
        <circle cx={dstX} cy={y} r="20" fill="color-mix(in oklch, oklch(0.6 0.18 25) 15%, var(--bg-card))"
          stroke="oklch(0.6 0.18 25)" />
        <text x={dstX} y={y + 3.5} textAnchor="middle" fontSize="11" fill="var(--text)" fontWeight="700">cíl</text>
        <text x={dstX} y={y + 36} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
          fill={dstKnown ? KNOWN : HIDDEN} fontWeight="700">
          cíl: {dstKnown ? "ZNÁMÝ" : "skrytý"}
        </text>

        {/* legend */}
        <g transform="translate(14, 168)" fontSize="9.5" fontFamily="var(--font-mono)">
          <circle cx="2" cy="-3" r="4" fill={KNOWN} />
          <text x="11" y="0" fill="var(--text-muted)">známý pozorovateli</text>
          <circle cx="146" cy="-3" r="4" fill={HIDDEN} />
          <text x="155" y="0" fill="var(--text-muted)">skrytý</text>
        </g>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{o.label}</div>
        <div style={{ fontSize: 12.5, color: isGateway ? KNOWN : "var(--text-muted)", lineHeight: 1.5, fontWeight: isGateway ? 600 : 400 }}>
          {o.note}
        </div>
      </div>
    </div>
  );
}
