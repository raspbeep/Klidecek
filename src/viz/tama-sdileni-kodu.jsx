// Spektrum technologických přístupů k vývoji mobilní aplikace.
// Přepínač volí přístup; viz ukazuje, kolik kódu se sdílí mezi platformami
// a jak se to projeví na výkonu a přístupu k HW (kvalitativní trade-off).
import { useState } from "react";

const APPROACHES = [
  { id: "native", label: "Nativní", hue: 22, share: 0, perf: 5, hw: 5,
    note: "2 codebase (Kotlin/Swift), maximální výkon a okamžitý přístup k novému HW." },
  { id: "cross", label: "Cross-platform", hue: 142, share: 80, perf: 4, hw: 4,
    note: "Jeden kód (React Native, Flutter, KMP, .NET MAUI); sdílí se ~70–90 %." },
  { id: "hybrid", label: "Hybridní", hue: 264, share: 95, perf: 2, hw: 3,
    note: "Web ve WebView (Cordova/Capacitor); rychlé a levné, výkon brzdí prohlížeč." },
  { id: "pwa", label: "PWA", hue: 80, share: 100, perf: 2, hw: 2,
    note: "Běží v prohlížeči; offline + instalace na plochu, ale omezený přístup k HW." },
];

function Dots({ n, hue, y }) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={250 + i * 16} cy={y} r="4.5"
          fill={i < n ? `oklch(0.6 0.14 ${hue})` : "var(--bg-card)"}
          stroke="var(--line)" strokeWidth="0.6" />
      ))}
    </g>
  );
}

export default function TamaSdileniKodu() {
  const [id, setId] = useState("cross");
  const a = APPROACHES.find((x) => x.id === id);
  const W = 360, H = 150;
  const barX = 14, barY = 26, barW = 200, barH = 22;
  const shareW = (a.share / 100) * barW;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div className="viz-controls">
        {APPROACHES.map((x) => (
          <button key={x.id} className="viz-btn" data-active={id === x.id} onClick={() => setId(x.id)}
            style={id === x.id ? {
              borderColor: `oklch(0.62 0.14 ${x.hue})`,
              background: `oklch(0.62 0.14 ${x.hue} / 0.18)`,
              color: "var(--text)",
            } : undefined}>
            {x.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* sdílení kódu — pruh */}
        <text x={barX} y={barY - 6} fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">sdílený kód</text>
        <rect x={barX} y={barY} width={barW} height={barH} rx="3" fill="var(--bg-card)" stroke="var(--line)" />
        <rect x={barX} y={barY} width={shareW} height={barH} rx="3" fill={`oklch(0.6 0.14 ${a.hue} / 0.55)`} />
        <text x={barX + barW / 2} y={barY + 15} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">{a.share} %</text>

        {/* zbytek = platformově specifický kód */}
        <text x={barX} y={barY + barH + 14} fontSize="8.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          {a.share === 0 ? "vše psáno zvlášť pro každou platformu" :
           a.share === 100 ? "jeden web pro všechny" :
           `zbývajících ${100 - a.share} % = nativní moduly / vzhled`}
        </text>

        {/* trade-off body */}
        <text x={250} y={barY - 6} textAnchor="start" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">výkon</text>
        <Dots n={a.perf} hue={a.hue} y={barY + 4} />
        <text x={250} y={barY + 28} textAnchor="start" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">přístup k HW</text>
        <Dots n={a.hw} hue={a.hue} y={barY + 38} />

        {/* popis */}
        <foreignObject x={barX} y={H - 56} width={W - barX * 2} height={48}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: "10.5px", lineHeight: 1.35, color: "var(--text)" }}>
            {a.note}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
