// Mamdani fuzzy controller, single input -> single output.
// Drag the input error: see which rules fire (firing strength), how each output
// term is clipped (min), how clipped areas combine (max), and the centroid (COG)
// defuzzified crisp output.
import { useState } from "react";

export default function FuzzyControl() {
  const [e, setE] = useState(25); // input error 0..40

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  // input terms over 0..40
  const inLow = (x) => clamp((20 - x) / 20);
  const inMed = (x) => clamp(x <= 20 ? x / 20 : (40 - x) / 20);
  const inHigh = (x) => clamp((x - 20) / 20);

  // rules: IF error low->action weak ; med->medium ; high->strong
  // output universe 0..100, term triangles centered at 15 / 50 / 85
  const rules = [
    { name: "slabá", w: inLow(e), c: 15, col: "oklch(0.62 0.13 250)" },
    { name: "střední", w: inMed(e), c: 50, col: "oklch(0.65 0.15 150)" },
    { name: "silná", w: inHigh(e), c: 85, col: "oklch(0.62 0.17 30)" },
  ];
  const outTri = (v, c) => clamp(1 - Math.abs(v - c) / 25); // half-width 25

  // combined output membership = max over clipped rule outputs
  const combined = (v) => Math.max(...rules.map((r) => Math.min(r.w, outTri(v, r.c))));

  // centroid defuzzification
  let num = 0, den = 0;
  for (let v = 0; v <= 100; v += 1) { const m = combined(v); num += v * m; den += m; }
  const cog = den > 0 ? num / den : 50;

  const W = 300, H = 200;
  const x0 = 24, x1 = W - 12, y0 = 70, y1 = H - 30; // output plot region
  const toX = (v) => x0 + (v / 100) * (x1 - x0);
  const toY = (m) => y1 - m * (y1 - y0);
  // filled combined area
  let area = `M ${toX(0)} ${toY(0)} `;
  for (let v = 0; v <= 100; v += 1) area += `L ${toX(v).toFixed(1)} ${toY(combined(v)).toFixed(1)} `;
  area += `L ${toX(100)} ${toY(0)} Z`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* --- top strip: rule firing strengths --- */}
        <text x={x0} y={16} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">aktivace pravidel (síla = min ořez)</text>
        {rules.map((r, i) => {
          const bx = x0 + i * 90;
          return (
            <g key={r.name}>
              <rect x={bx} y={24} width={70} height={9} fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.5" />
              <rect x={bx} y={24} width={70 * r.w} height={9} fill={r.col} opacity="0.85" />
              <text x={bx} y={45} fontSize="8" fontFamily="var(--font-mono)" fill={r.col}>{r.name} {r.w.toFixed(2)}</text>
            </g>
          );
        })}

        {/* --- output plot --- */}
        <line x1={x0} y1={y1} x2={x1} y2={y1} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="var(--line-strong)" strokeWidth="0.6" />
        {/* faint full output term outlines + clip levels */}
        {rules.map((r) => {
          let p = "";
          for (let v = 0; v <= 100; v += 1) p += `${v === 0 ? "M" : "L"} ${toX(v).toFixed(1)} ${toY(outTri(v, r.c)).toFixed(1)} `;
          return <path key={"o" + r.name} d={p} fill="none" stroke={r.col} strokeWidth="0.8" opacity="0.35" />;
        })}
        {/* combined clipped+merged area */}
        <path d={area} fill="var(--accent)" opacity="0.22" stroke="var(--accent)" strokeWidth="1.2" />
        {/* centroid line */}
        <line x1={toX(cog)} y1={y0 - 4} x2={toX(cog)} y2={y1} stroke="var(--text)" strokeWidth="1.3" />
        <text x={toX(cog)} y={y0 - 8} textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--text)">{cog.toFixed(0)}</text>
        <text x={x1} y={y1 + 14} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">výstup (akce) →</text>
        <text x={toX(cog) - 2} y={y1 + 14} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text)">těžiště</text>
      </svg>

      <input type="range" className="viz-slider" min={0} max={40} step={1} value={e}
        onChange={(ev) => setE(+ev.target.value)} style={{ width: "100%" }} />

      <span className="viz-readout">
        vstup chyba = {e} · těžiště → akce = <b style={{ color: "var(--accent)" }}>{cog.toFixed(1)}</b>
      </span>
    </div>
  );
}
