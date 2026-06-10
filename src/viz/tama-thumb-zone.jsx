// Palcová zóna na mobilu při jednoruční obsluze.
// Přepínač ruky (levá/pravá) překlápí mapu dosahu palce; posuvník mění
// velikost telefonu. Barevné pásy = green / yellow / red zóna dosahu.
import { useState } from "react";

// Telefon je nakreslen jako svislý obdélník. Palec u jednoruční obsluhy
// vychází z dolního rohu na straně držící ruky a "rozkmitává" se po oblouku.
// Zóny modelujeme jednoduše třemi vodorovnými pásy + rohovou red zónou,
// které se zrcadlí podle zvolené ruky.
export default function TamaThumbZone() {
  const [hand, setHand] = useState("right"); // "right" | "left"
  const [size, setSize] = useState(6.1); // úhlopříčka v palcích 5.0–7.0

  const W = 360, H = 230;
  // šířka telefonu roste s úhlopříčkou (jen vizuální mapování)
  const phoneW = 96 + (size - 5) * 18; // 96..132
  const phoneH = 180;
  const px = (W - phoneW) / 2 - 30; // posun doleva, vpravo necháme legendu
  const py = (H - phoneH) / 2;

  const right = hand === "right";
  // kotva palce = dolní roh na straně ruky
  const thumbX = right ? px + phoneW - 12 : px + 12;
  const thumbY = py + phoneH - 10;

  // tři pásy dosahu (zelený nejníže = nejpohodlnější, červený nahoře u
  // protilehlého rohu). Modelujeme barvu buňky podle vzdálenosti od kotvy.
  const cols = 5, rows = 7;
  const cellW = phoneW / cols, cellH = phoneH / rows;
  const cells = [];
  // referenční dosah palce ~ 70 % delší strany
  const reach = phoneH * 0.78;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = px + c * cellW + cellW / 2;
      const cy = py + r * cellH + cellH / 2;
      const d = Math.hypot(cx - thumbX, cy - thumbY);
      const t = d / reach; // 0 (u kotvy) .. >1 (nedosažitelné)
      cells.push({ cx, cy, t });
    }
  }

  const zoneColor = (t) => {
    if (t < 0.62) return { fill: "oklch(0.65 0.15 150 / 0.30)", name: "green" };
    if (t < 0.92) return { fill: "oklch(0.75 0.14 85 / 0.30)", name: "yellow" };
    return { fill: "oklch(0.62 0.19 25 / 0.28)", name: "red" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>držící ruka:</span>
        {["left", "right"].map((h) => (
          <button key={h} className="viz-btn" data-active={hand === h} onClick={() => setHand(h)}>
            {h === "left" ? "levá" : "pravá"}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 380 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* tělo telefonu */}
        <rect x={px - 6} y={py - 10} width={phoneW + 12} height={phoneH + 20} rx={14}
          fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.5" />
        {/* obrazovka — pole zón */}
        <clipPath id="ttzScreen">
          <rect x={px} y={py} width={phoneW} height={phoneH} rx="4" />
        </clipPath>
        <g clipPath="url(#ttzScreen)">
          {cells.map((c, i) => {
            const z = zoneColor(c.t);
            return <rect key={i} x={c.cx - cellW / 2} y={c.cy - cellH / 2}
              width={cellW} height={cellH} fill={z.fill} stroke="var(--bg-inset)" strokeWidth="0.5" />;
          })}
        </g>
        <rect x={px} y={py} width={phoneW} height={phoneH} rx="4" fill="none" stroke="var(--line)" strokeWidth="1" />

        {/* oblouk dosahu palce */}
        <path d={`M ${thumbX} ${thumbY} A ${reach} ${reach} 0 0 ${right ? 0 : 1} ${right ? thumbX - reach : thumbX + reach} ${thumbY}`}
          fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.7" />
        {/* palec — kotva */}
        <circle cx={thumbX} cy={thumbY} r="6" fill="var(--accent)" />
        <text x={thumbX} y={thumbY + 20} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">palec</text>

        {/* legenda */}
        <g fontFamily="var(--font-mono)" fontSize="10">
          <rect x={W - 90} y={py} width={12} height={12} rx="2" fill="oklch(0.65 0.15 150 / 0.55)" />
          <text x={W - 74} y={py + 10} fill="var(--text)">green</text>
          <rect x={W - 90} y={py + 22} width={12} height={12} rx="2" fill="oklch(0.75 0.14 85 / 0.55)" />
          <text x={W - 74} y={py + 32} fill="var(--text)">yellow</text>
          <rect x={W - 90} y={py + 44} width={12} height={12} rx="2" fill="oklch(0.62 0.19 25 / 0.5)" />
          <text x={W - 74} y={py + 54} fill="var(--text)">red</text>
          <text x={W - 90} y={py + 80} fill="var(--text-faint)" fontSize="9">úhlopříčka</text>
          <text x={W - 90} y={py + 94} fill="var(--text-muted)" fontSize="11">{size.toFixed(1)}″</text>
        </g>
      </svg>

      <input type="range" className="viz-slider" min={5.0} max={7.0} step={0.1} value={size}
        onChange={(e) => setSize(+e.target.value)} style={{ width: "100%" }} />

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Zelená zóna (dolní část na straně {right ? "pravé" : "levé"} ruky) je dosažitelná palcem bez přehmatu — sem patří hlavní navigace a CTA.
        Červená zóna (protilehlý horní roh) vyžaduje přehmat nebo druhou ruku — vyhraď ji destruktivním a vzácným akcím.
        Větší telefon zvětšuje červenou zónu: oblouk dosahu palce zůstává stejný, ale plocha roste.
      </div>
    </div>
  );
}
