// RUP hump chart — úsilí disciplín v čase přes 4 fáze.
// Posuvník = poloha v čase (0..1). Křivky ukazují relativní úsilí každé disciplíny;
// svislý kurzor čte aktuální úsilí. Žádná disciplína neklesne na nulu.
import { useState } from "react";

const PHASES = [
  { id: "I", label: "Inception", from: 0.0, to: 0.18 },
  { id: "E", label: "Elaboration", from: 0.18, to: 0.45 },
  { id: "C", label: "Construction", from: 0.45, to: 0.85 },
  { id: "T", label: "Transition", from: 0.85, to: 1.0 },
];

// Gaussovský hrb: centrum c, šířka w, výška peak; plus malé baseline.
function hump(t, c, w, peak, base = 0.06) {
  const g = peak * Math.exp(-((t - c) * (t - c)) / (2 * w * w));
  return Math.min(1, base + g);
}

const DISCIPLINES = [
  { id: "biz", label: "Business modeling", hue: 264, f: (t) => hump(t, 0.1, 0.1, 0.7) },
  { id: "req", label: "Requirements", hue: 300, f: (t) => hump(t, 0.22, 0.13, 0.85) },
  { id: "ad", label: "Analysis & Design", hue: 200, f: (t) => hump(t, 0.36, 0.15, 0.9) },
  { id: "impl", label: "Implementation", hue: 142, f: (t) => hump(t, 0.62, 0.16, 0.95) },
  { id: "test", label: "Test", hue: 80, f: (t) => hump(t, 0.72, 0.18, 0.8) },
  { id: "depl", label: "Deployment", hue: 22, f: (t) => hump(t, 0.92, 0.09, 0.85) },
];

const W = 520, H = 200;
const PAD_L = 14, PAD_R = 14, PAD_T = 24, PAD_B = 38;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const toX = (t) => PAD_L + t * plotW;
// každá disciplína má vlastní vodorovný pruh; effort moduluje tloušťku/výšku v pruhu
const bandH = plotH / DISCIPLINES.length;

export default function RupHump() {
  const [t, setT] = useState(0.3);
  const phase = PHASES.find((p) => t >= p.from && t <= p.to) || PHASES[PHASES.length - 1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* fázové pásy + popisky */}
        {PHASES.map((p) => {
          const x0 = toX(p.from), x1 = toX(p.to);
          const active = p.id === phase.id;
          return (
            <g key={p.id}>
              <rect
                x={x0} y={PAD_T} width={x1 - x0} height={plotH}
                fill={active ? "oklch(0.62 0.14 264 / 0.07)" : "transparent"}
                stroke="var(--line)" strokeWidth="0.5"
              />
              <text
                x={(x0 + x1) / 2} y={H - 22} textAnchor="middle"
                fontSize="10" fontFamily="var(--font-mono)"
                fontWeight={active ? 700 : 400}
                fill={active ? "oklch(0.5 0.14 264)" : "var(--text-muted)"}
              >
                {p.label}
              </text>
            </g>
          );
        })}

        {/* disciplíny — vyplněné hrby v pruzích */}
        {DISCIPLINES.map((d, idx) => {
          const yTop = PAD_T + idx * bandH;
          const yBase = yTop + bandH - 3;
          const N = 60;
          let path = `M ${toX(0)} ${yBase}`;
          for (let i = 0; i <= N; i++) {
            const tt = i / N;
            const e = d.f(tt);
            const y = yBase - e * (bandH - 5);
            path += ` L ${toX(tt)} ${y}`;
          }
          path += ` L ${toX(1)} ${yBase} Z`;
          const eHere = d.f(t);
          return (
            <g key={d.id}>
              <path d={path} fill={`oklch(0.62 0.14 ${d.hue} / 0.28)`} stroke={`oklch(0.6 0.14 ${d.hue})`} strokeWidth="1" />
              <text x={PAD_L + 3} y={yTop + 11} fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">
                {d.label}
              </text>
              {/* tečka úsilí na kurzoru */}
              <circle cx={toX(t)} cy={yBase - eHere * (bandH - 5)} r="2.6" fill={`oklch(0.55 0.16 ${d.hue})`} />
            </g>
          );
        })}

        {/* časový kurzor */}
        <line x1={toX(t)} y1={PAD_T} x2={toX(t)} y2={PAD_T + plotH} stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="3 3" />
        <text x="6" y="16" fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          úsilí disciplín v čase →
        </text>
      </svg>

      <input type="range" className="viz-slider" min={0} max={100} value={Math.round(t * 100)} onChange={(e) => setT(+e.target.value / 100)} style={{ width: "100%" }} />

      <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 11.5 }}>
        <span style={{ fontWeight: 600, color: "var(--text)" }}>Fáze: {phase.label}</span>{" "}
        <span style={{ color: "var(--text-muted)" }}>
          — největší hrb má{" "}
          <span style={{ color: "var(--text)", fontWeight: 600 }}>
            {DISCIPLINES.reduce((best, d) => (d.f(t) > best.f(t) ? d : best)).label}
          </span>
          . Všimni si, že žádná disciplína není na nule — všechny běží průběžně.
        </span>
      </div>
    </div>
  );
}
