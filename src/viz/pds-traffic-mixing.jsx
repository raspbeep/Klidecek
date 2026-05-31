// Traffic mixing: a mix node collects arriving packets and releases them in a
// different order (and uniform size), breaking the timing correlation an
// observer would use to link input ↔ output.
import { useState } from "react";

// Four senders, distinct hues. arrival order is fixed 1..4 (top→bottom-ish),
// send order is a reordered permutation.
const SENDERS = [
  { id: 0, hue: 235, arr: 1 },
  { id: 1, hue: 25, arr: 4 },
  { id: 2, hue: 200, arr: 2 },
  { id: 3, hue: 145, arr: 3 },
];
// send order (by sender id): position in output. A non-trivial permutation.
const SEND_POS = { 0: 3, 1: 1, 2: 4, 3: 2 };

export default function TrafficMixing() {
  const [mixed, setMixed] = useState(false);

  const W = 520, H = 200;
  const mixX = 260, mixY = 100;
  const inX = 70, outX = 450;
  const rowY = (i) => 40 + i * 40;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        <text x={inX} y={20} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="700">Arrival Order</text>
        <text x={outX} y={20} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="700">Send Order</text>

        {/* incoming arrows: arrival order labelled */}
        {SENDERS.map((s, i) => {
          const c = `oklch(0.6 0.16 ${s.hue})`;
          return (
            <g key={`in-${s.id}`}>
              <circle cx={inX} cy={rowY(i)} r="11" fill={`color-mix(in oklch, ${c} 25%, var(--bg-card))`} stroke={c} strokeWidth="1.5" />
              <line x1={inX + 12} y1={rowY(i)} x2={mixX - 26} y2={mixY}
                stroke={c} strokeWidth="2" markerEnd="url(#tm-arr)" />
              <text x={(inX + mixX) / 2 - 6} y={(rowY(i) + mixY) / 2 - 4} textAnchor="middle"
                fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" fill={c}>{s.arr}</text>
            </g>
          );
        })}

        {/* mix node */}
        <circle cx={mixX} cy={mixY} r="24"
          fill="color-mix(in oklch, var(--accent) 18%, var(--bg-card))"
          stroke="var(--accent)" strokeWidth="2" />
        <text x={mixX} y={mixY - 1} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="700">MIX</text>
        <text x={mixX} y={mixY + 11} textAnchor="middle" fontSize="7.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          {mixed ? "reorder" : "buffer"}
        </text>

        {/* outgoing arrows: only shown after mixing, in send order */}
        {SENDERS.map((s) => {
          const c = `oklch(0.6 0.16 ${s.hue})`;
          const pos = SEND_POS[s.id];
          const oi = pos - 1; // 0-based output row
          const oy = rowY(oi);
          return (
            <g key={`out-${s.id}`} opacity={mixed ? 1 : 0.12}>
              <line x1={mixX + 26} y1={mixY} x2={outX - 12} y2={oy}
                stroke={c} strokeWidth="2" markerEnd="url(#tm-arr)" />
              {mixed && (
                <text x={(mixX + outX) / 2 + 8} y={(mixY + oy) / 2 - 4} textAnchor="middle"
                  fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" fill={c}>{pos}</text>
              )}
              <rect x={outX} y={oy - 6} width="22" height="12" rx="2"
                fill={`color-mix(in oklch, ${c} 25%, var(--bg-card))`} stroke={c} strokeWidth="1.5" />
            </g>
          );
        })}

        <defs>
          <marker id="tm-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setMixed(true)} disabled={mixed}>smíchej (reorder + delay)</button>
        <button className="btn ghost" onClick={() => setMixed(false)} disabled={!mixed}>reset</button>
      </div>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {mixed ? (
          <span>
            <strong style={{ color: "var(--text)" }}>Pořadí odchodu ≠ pořadí příchodu.</strong> Mix nasbíral pakety, sjednotil jejich velikost a vypustil je přeskupené (s prodlevou). Pozorovatel už nedokáže spárovat konkrétní vstup s výstupem podle časování — <em>timing korelace je rozbitá</em>. Cenou je <strong style={{ color: "var(--text)" }}>latence</strong> a nutnost <strong style={{ color: "var(--text)" }}>hustého provozu</strong> (v řídké dávce není co míchat).
          </span>
        ) : (
          <span>
            Bez mixování by pakety odešly ve stejném pořadí, v jakém přišly — pasivní pozorovatel by je podle <em>časování</em> snadno spároval vstup↔výstup. Klikni <strong style={{ color: "var(--text)" }}>„smíchej"</strong> a sleduj, jak se pořadí na výstupu změní.
          </span>
        )}
      </div>
    </div>
  );
}
