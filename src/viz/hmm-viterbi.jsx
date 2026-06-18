// Viterbi DP on a trellis (states x time), step by step.
// Same toy HMM as hmm-generate: 2 weather states emit one of 3 activities.
// We fill DP columns left->right (delta = best log-prob of a path ending in that
// state), keep a back-pointer per cell, then trace back the single best path.
import { useState } from "react";

export default function HmmViterbi() {
  const STATES = [
    { key: "slunce", short: "S", color: "var(--accent)" },
    { key: "dest", short: "D", color: "var(--accent-line)" },
  ];
  const SYM = ["prochazka", "uklid", "nakup"];
  // fixed observation sequence (indices into SYM)
  const obs = [0, 0, 1, 2, 1]; // prochazka, prochazka, uklid, nakup, uklid
  const T = obs.length, K = STATES.length;

  const pi = [0.6, 0.4];
  const A = [
    [0.7, 0.3], // slunce -> slunce / dest
    [0.4, 0.6], // dest   -> slunce / dest
  ];
  const B = [
    [0.6, 0.1, 0.3], // slunce
    [0.1, 0.6, 0.3], // dest
  ];

  const L = Math.log;
  // delta[t][k] = log-prob of best path that ends in state k at time t
  const V = Array.from({ length: T }, () => new Array(K).fill(-Infinity));
  const bp = Array.from({ length: T }, () => new Array(K).fill(-1));
  for (let k = 0; k < K; k++) V[0][k] = L(pi[k]) + L(B[k][obs[0]]);
  for (let t = 1; t < T; t++) {
    for (let k = 0; k < K; k++) {
      let best = -Infinity, arg = -1;
      for (let j = 0; j < K; j++) {
        const cand = V[t - 1][j] + L(A[j][k]);
        if (cand > best) { best = cand; arg = j; }
      }
      V[t][k] = best + L(B[k][obs[t]]);
      bp[t][k] = arg;
    }
  }
  // traceback: best final state, then follow back-pointers
  let last = 0;
  for (let k = 1; k < K; k++) if (V[T - 1][k] > V[T - 1][last]) last = k;
  const path = new Array(T).fill(0);
  path[T - 1] = last;
  for (let t = T - 1; t > 0; t--) path[t - 1] = bp[t][path[t]];

  // step: 0..T fills columns; T..2T-1 reveals the traceback from the right
  const maxStep = T + (T - 1);
  const [step, setStep] = useState(1);
  const filled = Math.min(step, T);
  const tbShown = Math.max(0, step - T);
  const tbActive = (t) => tbShown > 0 && t >= T - tbShown;

  const W = 440, H = 210;
  const ox = 72, oy = 56, cw = 64, ch = 56;
  const cx = (t) => ox + t * cw;
  const cy = (k) => oy + k * ch;
  const fmt = (v) => (v === -Infinity ? "−∞" : v.toFixed(2));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 540, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* observation header */}
        <text x={ox - 30} y={oy - 18} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">obs:</text>
        {obs.map((o, t) => (
          <text key={`o${t}`} x={cx(t)} y={oy - 18} textAnchor="middle"
            fontSize="10" fontFamily="var(--font-mono)" fontWeight="600"
            fill={filled > t ? "var(--accent)" : "var(--text-muted)"}>{SYM[o].slice(0, 5)}</text>
        ))}

        {/* back-pointer arrows between filled columns */}
        {Array.from({ length: T }).map((_, t) => {
          if (t === 0 || t >= filled) return null;
          return STATES.map((_, k) => {
            const j = bp[t][k];
            const on = tbActive(t) && path[t] === k && path[t - 1] === j;
            return (
              <line key={`bp${t}-${k}`} x1={cx(t - 1) + 22} y1={cy(j)} x2={cx(t) - 22} y2={cy(k)}
                stroke={on ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={on ? 2 : 0.7} opacity={on ? 1 : 0.4}
                markerEnd={on ? "url(#vitArrOn)" : "url(#vitArr)"} />
            );
          });
        })}

        {/* trellis cells */}
        {STATES.map((s, k) =>
          Array.from({ length: T }).map((_, t) => {
            const shown = t < filled;
            const onPath = shown && path[t] === k;
            const onTb = onPath && tbActive(t);
            let fill = "var(--bg-card)";
            if (onTb) fill = "var(--accent)";
            else if (onPath) fill = `color-mix(in oklch, var(--accent) 28%, var(--bg-card))`;
            return (
              <g key={`c${t}-${k}`}>
                <circle cx={cx(t)} cy={cy(k)} r="20" fill={fill}
                  stroke={onPath ? "var(--accent)" : s.color}
                  strokeWidth={onPath ? 2 : 1} opacity={shown ? 1 : 0.35} />
                {shown && (
                  <text x={cx(t)} y={cy(k) + 4} textAnchor="middle" fontSize="11"
                    fontFamily="var(--font-mono)"
                    fill={onTb ? "var(--bg-inset)" : "var(--text)"}>{fmt(V[t][k])}</text>
                )}
              </g>
            );
          })
        )}

        {/* row labels */}
        {STATES.map((s, k) => (
          <text key={`r${k}`} x={ox - 30} y={cy(k) + 4} textAnchor="end"
            fontSize="11" fontFamily="var(--font-mono)" fill={s.color}>{s.key === "slunce" ? "slun" : "déšť"}</text>
        ))}

        <defs>
          <marker id="vitArr" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
            <path d="M0,0 L5,3 L0,6 Z" fill="var(--line-strong)" />
          </marker>
          <marker id="vitArrOn" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* status line */}
        <text x={ox - 60} y={H - 10} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {filled < T
            ? `vyplňuji t=${filled}: δ[t][k] = max_j( δ[t−1][j] + log a[j,k] ) + log b[k,oₜ]`
            : tbShown < T
              ? "zpětný průchod (backtrace) podle uložených ukazatelů →"
              : "nejlepší cesta: " + path.map((k) => STATES[k].short).join("·")}
        </text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={() => setStep((s) => Math.min(s + 1, maxStep))}>krok ▸</button>
        <button className="viz-btn" onClick={() => setStep(maxStep)}>dokonči ⏭</button>
        <button className="viz-btn" onClick={() => setStep(1)}>reset ↺</button>
      </div>
      <span className="viz-readout">
        hodnoty jsou log-pravděpodobnosti (záporné) · čas O(N²·T), paměť O(N·T) · N={K}, T={T}
      </span>
    </div>
  );
}
