// H-můstek: 4 spínače do tvaru H, motor jako příčka.
// Přepínač režimů ukazuje, které spínače sepnou, kudy teče proud a co dělá
// motor. Zvlášť tlačítko shoot-through demonstruje zakázaný zkrat větve.
import { useState } from "react";

const W = 360, H = 250;

// stavy spínačů: S1 horní levý, S2 horní pravý, S3 dolní levý, S4 dolní pravý
const MODES = {
  forward: { on: ["S1", "S4"], label: "vpřed", desc: "S1+S4 (diagonála): proud zleva doprava, +U_d.", path: "fwd", motor: "↻ točí se" },
  reverse: { on: ["S2", "S3"], label: "vzad", desc: "S2+S3 (druhá diagonála): proud opačně, −U_d.", path: "rev", motor: "↺ opačný směr" },
  brake:   { on: ["S3", "S4"], label: "brzda", desc: "oba dolní sepnuty: svorky zkratovány, motor brzdí jako generátor.", path: "brake", motor: "■ rychle stojí" },
  coast:   { on: [],           label: "volnoběh", desc: "vše vypnuto: motor není buzen ani brzděn, volně dobíhá.", path: "none", motor: "~ dobíhá" },
  shoot:   { on: ["S1", "S3"], label: "shoot-through", desc: "S1+S3 téže větve = přímý zkrat zdroje přes oba tranzistory → ZNIČENÍ!", path: "short", motor: "💥 zkrat" },
};

export default function NavHBridge() {
  const [mode, setMode] = useState("forward");
  const m = MODES[mode];
  const isOn = (s) => m.on.includes(s);
  const danger = mode === "shoot";

  const swCol = (s) => (isOn(s) ? (danger ? "oklch(0.62 0.19 25)" : "oklch(0.62 0.15 150)") : "var(--bg-card)");
  const swStroke = (s) => (isOn(s) ? (danger ? "oklch(0.55 0.19 25)" : "oklch(0.5 0.15 150)") : "var(--line)");

  // souřadnice
  const topY = 40, botY = 210, leftX = 90, rightX = 270;
  const railTop = 24, railBot = 226;

  // proud: cesta podle režimu
  const flowCol = danger ? "oklch(0.62 0.19 25)" : "var(--accent)";

  const sw = (s, x, y) => (
    <g key={s}>
      <rect x={x - 22} y={y - 14} width={44} height={28} rx={5} fill={swCol(s)} stroke={swStroke(s)} strokeWidth={isOn(s) ? 1.8 : 1} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="600"
        fill={isOn(s) ? "white" : "var(--text-muted)"} fontFamily="var(--font-mono)">{s}</text>
      <text x={x} y={y - 19} textAnchor="middle" fontSize="8" fill="var(--text-faint)" fontFamily="var(--font-mono)">{isOn(s) ? "ON" : "off"}</text>
    </g>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        {Object.entries(MODES).map(([k, v]) => (
          <button key={k} className="viz-btn" data-active={mode === k} onClick={() => setMode(k)}
            style={mode === k && k === "shoot"
              ? { background: "oklch(0.62 0.19 25)", borderColor: "oklch(0.55 0.19 25)", color: "white" }
              : undefined}>
            {v.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 380 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* napájecí lišty */}
        <line x1={leftX} y1={railTop} x2={rightX} y2={railTop} stroke="var(--line-strong)" strokeWidth="1.5" />
        <text x={rightX + 8} y={railTop - 4} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">+U_d</text>
        <line x1={leftX} y1={railBot} x2={rightX} y2={railBot} stroke="var(--line-strong)" strokeWidth="1.5" />
        <text x={rightX + 8} y={railBot + 10} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">GND</text>

        {/* svislé větve */}
        <line x1={leftX} y1={railTop} x2={leftX} y2={topY - 14} stroke="var(--line-strong)" strokeWidth="1.2" />
        <line x1={leftX} y1={topY + 14} x2={leftX} y2={botY - 14} stroke="var(--line-strong)" strokeWidth="1.2" />
        <line x1={leftX} y1={botY + 14} x2={leftX} y2={railBot} stroke="var(--line-strong)" strokeWidth="1.2" />
        <line x1={rightX} y1={railTop} x2={rightX} y2={topY - 14} stroke="var(--line-strong)" strokeWidth="1.2" />
        <line x1={rightX} y1={topY + 14} x2={rightX} y2={botY - 14} stroke="var(--line-strong)" strokeWidth="1.2" />
        <line x1={rightX} y1={botY + 14} x2={rightX} y2={railBot} stroke="var(--line-strong)" strokeWidth="1.2" />

        {/* motor jako příčka */}
        <line x1={leftX} y1={125} x2={leftX + 50} y2={125} stroke="var(--line-strong)" strokeWidth="1.2" />
        <line x1={rightX - 50} y1={125} x2={rightX} y2={125} stroke="var(--line-strong)" strokeWidth="1.2" />
        <circle cx={W / 2} cy={125} r={25} fill="var(--bg-card)" stroke="var(--accent-line, var(--accent))" strokeWidth="1.5" />
        <text x={W / 2} y={123} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">M</text>
        <text x={W / 2} y={137} textAnchor="middle" fontSize="8" fill="var(--text-muted)">DC</text>

        {/* proudová cesta — zvýraznění */}
        {mode === "forward" && (
          <polyline points={`${leftX},${railTop} ${leftX},125 ${rightX},125 ${rightX},${railBot}`}
            fill="none" stroke={flowCol} strokeWidth="2.5" strokeOpacity="0.35" strokeLinejoin="round" />
        )}
        {mode === "reverse" && (
          <polyline points={`${rightX},${railTop} ${rightX},125 ${leftX},125 ${leftX},${railBot}`}
            fill="none" stroke={flowCol} strokeWidth="2.5" strokeOpacity="0.35" strokeLinejoin="round" />
        )}
        {mode === "brake" && (
          <polyline points={`${leftX},125 ${leftX},${railBot} ${rightX},${railBot} ${rightX},125`}
            fill="none" stroke={flowCol} strokeWidth="2.5" strokeOpacity="0.35" strokeLinejoin="round" />
        )}
        {mode === "shoot" && (
          <polyline points={`${leftX},${railTop} ${leftX},${railBot}`}
            fill="none" stroke={flowCol} strokeWidth="3" strokeOpacity="0.5" strokeDasharray="5 4" />
        )}

        {/* spínače */}
        {sw("S1", leftX, topY)}
        {sw("S2", rightX, topY)}
        {sw("S3", leftX, botY)}
        {sw("S4", rightX, botY)}
      </svg>

      <div style={{ padding: 10, background: danger ? "oklch(0.62 0.19 25 / 0.12)" : "var(--bg-card)", borderRadius: 6, border: `1px solid ${danger ? "oklch(0.55 0.19 25)" : "var(--line)"}` }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: danger ? "oklch(0.6 0.19 25)" : "var(--text)", marginBottom: 3 }}>
          {m.label} · motor: {m.motor}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{m.desc}</div>
      </div>
    </div>
  );
}
