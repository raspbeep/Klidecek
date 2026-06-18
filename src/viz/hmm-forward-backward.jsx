// Forward-backward on a trellis: pick a time t and see which part of the lattice
// the forward pass (alpha, prefix up to t) and the backward pass (beta, suffix
// after t) cover. Their product, normalized by P(X), gives the state-occupation
// posterior gamma_s(t) = P(state=s at t | X). The bars show gamma for the chosen t.
import { useState } from "react";

export default function HmmForwardBackward() {
  const STATES = [
    { key: "slunce", short: "slun", color: "var(--accent)" },
    { key: "dest", short: "déšť", color: "var(--accent-line)" },
  ];
  const SYM = ["prochazka", "uklid", "nakup"];
  const obs = [0, 0, 1, 2, 1];
  const T = obs.length, K = STATES.length;

  const pi = [0.6, 0.4];
  const A = [
    [0.7, 0.3],
    [0.4, 0.6],
  ];
  const B = [
    [0.6, 0.1, 0.3],
    [0.1, 0.6, 0.3],
  ];

  // forward: alpha[t][k] = P(o_1..o_t, state_t = k)
  const al = Array.from({ length: T }, () => new Array(K).fill(0));
  for (let k = 0; k < K; k++) al[0][k] = pi[k] * B[k][obs[0]];
  for (let t = 1; t < T; t++)
    for (let k = 0; k < K; k++) {
      let s = 0;
      for (let j = 0; j < K; j++) s += al[t - 1][j] * A[j][k];
      al[t][k] = s * B[k][obs[t]];
    }
  // backward: beta[t][k] = P(o_{t+1}..o_T | state_t = k)
  const be = Array.from({ length: T }, () => new Array(K).fill(0));
  for (let k = 0; k < K; k++) be[T - 1][k] = 1;
  for (let t = T - 2; t >= 0; t--)
    for (let k = 0; k < K; k++) {
      let s = 0;
      for (let j = 0; j < K; j++) s += A[k][j] * B[j][obs[t + 1]] * be[t + 1][j];
      be[t][k] = s;
    }
  // P(X) = sum_k alpha[T-1][k]
  const PX = al[T - 1].reduce((a, b) => a + b, 0);
  // gamma[t][k] = alpha*beta / P(X)
  const gamma = (t, k) => (al[t][k] * be[t][k]) / PX;

  const [t, setT] = useState(2);

  const W = 440, H = 220;
  const ox = 72, oy = 50, cw = 64, ch = 52;
  const cx = (i) => ox + i * cw;
  const cy = (k) => oy + k * ch;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 540, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* shaded regions: forward prefix (<= t), backward suffix (>= t) */}
        <rect x={cx(0) - 26} y={oy - 26} width={(t) * cw + 52} height={ch + 32}
          fill="color-mix(in oklch, var(--accent) 16%, transparent)" />
        <rect x={cx(t) - 26} y={oy - 26} width={(T - 1 - t) * cw + 52} height={ch + 32}
          fill="color-mix(in oklch, var(--accent-line) 16%, transparent)" />
        <text x={cx(0) - 22} y={oy - 12} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--accent)">
          α — forward (začátek → t)
        </text>
        <text x={cx(T - 1) + 22} y={oy - 12} textAnchor="end" fontSize="9.5"
          fontFamily="var(--font-mono)" fill="var(--accent-line)">β — backward (t → konec)</text>

        {/* observation header */}
        {obs.map((o, i) => (
          <text key={`o${i}`} x={cx(i)} y={oy + 2 * ch + 6} textAnchor="middle"
            fontSize="9.5" fontFamily="var(--font-mono)"
            fill={i === t ? "var(--text)" : "var(--text-faint)"}>{SYM[o].slice(0, 5)}</text>
        ))}

        {/* trellis edges (faint) */}
        {Array.from({ length: T - 1 }).map((_, i) =>
          STATES.map((_, j) =>
            STATES.map((_, k) => (
              <line key={`e${i}-${j}-${k}`} x1={cx(i) + 18} y1={cy(j)} x2={cx(i + 1) - 18} y2={cy(k)}
                stroke="var(--line-strong)" strokeWidth="0.5" opacity="0.3" />
            ))
          )
        )}

        {/* nodes; the column at t is highlighted, node radius scales with gamma */}
        {STATES.map((s, k) =>
          Array.from({ length: T }).map((_, i) => {
            const onT = i === t;
            const g = gamma(i, k);
            return (
              <g key={`n${i}-${k}`}>
                <circle cx={cx(i)} cy={cy(k)} r={onT ? 9 + g * 11 : 9}
                  fill={onT ? `color-mix(in oklch, ${s.color} 45%, var(--bg-card))` : "var(--bg-card)"}
                  stroke={s.color} strokeWidth={onT ? 1.8 : 1} />
              </g>
            );
          })
        )}

        {/* row labels */}
        {STATES.map((s, k) => (
          <text key={`r${k}`} x={ox - 30} y={cy(k) + 4} textAnchor="end"
            fontSize="11" fontFamily="var(--font-mono)" fill={s.color}>{s.short}</text>
        ))}

        {/* gamma readout for selected column */}
        <text x={ox - 30} y={H - 12} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          γ(t={t}): {STATES.map((s, k) => `${s.short}=${gamma(t, k).toFixed(2)}`).join("  ")}
        </text>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>čas t:</span>
        <input type="range" className="viz-slider" min={0} max={T - 1} value={t}
          onChange={(e) => setT(+e.target.value)} style={{ flex: 1, minWidth: 120 }} />
      </div>
      <span className="viz-readout">
        γ_s(t) = α_s(t)·β_s(t) / P(X) — posterior obsazení stavu; velikost uzlu ∝ γ
      </span>
    </div>
  );
}
