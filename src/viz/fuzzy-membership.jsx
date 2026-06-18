// Fuzzy membership: drag a temperature value, read its degree of membership in
// three overlapping fuzzy sets (studeno / akorat / horko). One value can belong
// to two sets at once -> the core fuzzy idea of partial membership.
import { useState } from "react";

export default function FuzzyMembership() {
  const [t, setT] = useState(19); // temperature 0..40

  // three overlapping trapezoid/triangle membership functions over 0..40
  // studeno: high left, fades 12..22 ; akorat: triangle peak 22 ; horko: rises 22..32
  const muCold = (x) => clamp((22 - x) / (22 - 12)); // 1 below 12, 0 above 22
  const muOk = (x) => clamp(x <= 22 ? (x - 12) / (22 - 12) : (32 - x) / (32 - 22));
  const muHot = (x) => clamp((x - 22) / (32 - 22)); // 0 below 22, 1 above 32
  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  const sets = [
    { name: "studeno", f: muCold, col: "oklch(0.62 0.13 250)" },
    { name: "akorát", f: muOk, col: "oklch(0.65 0.15 150)" },
    { name: "horko", f: muHot, col: "oklch(0.62 0.17 30)" },
  ];

  const W = 300, H = 180;
  const x0 = 28, x1 = W - 12, y0 = 18, y1 = H - 34;
  const toX = (temp) => x0 + (temp / 40) * (x1 - x0);
  const toY = (mu) => y1 - mu * (y1 - y0);
  const curve = (f) => {
    let p = "";
    for (let temp = 0; temp <= 40; temp += 0.5) {
      p += `${temp === 0 ? "M" : "L"} ${toX(temp).toFixed(1)} ${toY(f(temp)).toFixed(1)} `;
    }
    return p;
  };

  const cx = toX(t);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <line x1={x0} y1={y1} x2={x1} y2={y1} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={6} y={y0 + 4} fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">μ=1</text>
        <text x={6} y={y1} fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">0</text>
        <text x={x1} y={H - 20} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">teplota [°C] →</text>

        {/* membership curves */}
        {sets.map((s) => (
          <path key={s.name} d={curve(s.f)} fill="none" stroke={s.col} strokeWidth="1.6" />
        ))}

        {/* vertical cursor at selected temperature */}
        <line x1={cx} y1={y0} x2={cx} y2={y1} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
        {/* dots where cursor crosses each curve */}
        {sets.map((s) => (
          <circle key={"d" + s.name} cx={cx} cy={toY(s.f(t))} r="3.4" fill={s.col} stroke="var(--bg-inset)" strokeWidth="0.8" />
        ))}
        <text x={cx} y={y1 + 12} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">{t}°C</text>
      </svg>

      <input type="range" className="viz-slider" min={0} max={40} step={1} value={t}
        onChange={(e) => setT(+e.target.value)} style={{ width: "100%" }} />

      <div style={{ fontSize: 11.5, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)", display: "flex", flexWrap: "wrap", gap: "2px 14px" }}>
        {sets.map((s) => (
          <span key={"r" + s.name}>
            μ<sub style={{ color: s.col }}>{s.name}</sub>({t}) = <b style={{ color: s.col }}>{s.f(t).toFixed(2)}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
