// Amdahl vs Gustafson — interaktivní křivky zrychlení.
// Posuvníky pro α (paralelizovatelný podíl) a N (počet procesorů).
// Ukáže asymptotu 1/(1-α) a srovnání s Gustafsonem (lineární růst pro
// škálovaný problém). Vstupní pole pro Karp-Flatt empirickou diagnostiku.
import { useState, useMemo } from "react";

const W = 560, H = 280;
const padL = 48, padR = 14, padT = 22, padB = 38;
const plotW = W - padL - padR;
const plotH = H - padT - padB;
const N_MAX = 100000;
const N_MIN = 1;

function amdahl(alpha, N) {
  return 1 / ((1 - alpha) + alpha / N);
}
function gustafson(alpha, N) {
  return 1 + alpha * (N - 1);
}

// Karp-Flatt empirical serial fraction
function karpFlatt(S, N) {
  if (N <= 1 || S <= 0) return null;
  const e = (1 / S - 1 / N) / (1 - 1 / N);
  return e;
}

export default function AmdahlGustafson() {
  const [alpha, setAlpha] = useState(0.9);
  const [N, setN] = useState(64);
  const [logX, setLogX] = useState(true);
  const [kfS, setKfS] = useState(8);
  const [kfN, setKfN] = useState(16);

  // X scale: log or linear
  const xS = (n) => {
    if (logX) {
      const lmin = Math.log10(N_MIN);
      const lmax = Math.log10(N_MAX);
      return padL + (plotW * (Math.log10(n) - lmin)) / (lmax - lmin);
    }
    return padL + (plotW * (n - N_MIN)) / (N_MAX - N_MIN);
  };

  // Y scale: cap at 1/(1-α) * 1.1 or sensible bound
  const yMax = useMemo(() => {
    const ampLimit = alpha >= 0.999 ? 1000 : 1 / (1 - alpha);
    const gusEnd = gustafson(alpha, N_MAX);
    return Math.min(Math.max(ampLimit * 1.15, gusEnd * 0.3, 10), 1500);
  }, [alpha]);

  const yS = (v) => padT + plotH - (plotH * Math.min(v, yMax)) / yMax;

  // Sample curves
  const samples = useMemo(() => {
    const pts = [];
    const STEPS = 220;
    for (let i = 0; i <= STEPS; i++) {
      const f = i / STEPS;
      const n = logX
        ? Math.pow(10, Math.log10(N_MIN) + f * (Math.log10(N_MAX) - Math.log10(N_MIN)))
        : N_MIN + f * (N_MAX - N_MIN);
      pts.push({ n, sA: amdahl(alpha, n), sG: gustafson(alpha, n) });
    }
    return pts;
  }, [alpha, logX]);

  const pathA = samples.map((p, i) => `${i === 0 ? "M" : "L"} ${xS(p.n)} ${yS(p.sA)}`).join(" ");
  const pathG = samples.map((p, i) => `${i === 0 ? "M" : "L"} ${xS(p.n)} ${yS(p.sG)}`).join(" ");

  const sAt = amdahl(alpha, N);
  const gAt = gustafson(alpha, N);
  const asymptote = alpha >= 0.999 ? Infinity : 1 / (1 - alpha);
  const kfE = karpFlatt(kfS, kfN);

  // grid: a few log decades or linear marks
  const xTicks = logX
    ? [1, 10, 100, 1000, 10000, 100000].filter((v) => v >= N_MIN && v <= N_MAX)
    : [1, 20000, 40000, 60000, 80000, 100000];

  const yTicks = (() => {
    const t = [];
    const decade = Math.pow(10, Math.floor(Math.log10(yMax)));
    for (let v = decade; v < yMax; v += decade) t.push(v);
    return t.slice(0, 8);
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Plot */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Axes */}
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="var(--text-muted)" strokeWidth="0.8" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--text-muted)" strokeWidth="0.8" />

        {/* Y-axis label */}
        <text x={10} y={padT + plotH / 2} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)"
              transform={`rotate(-90 10 ${padT + plotH / 2})`}>
          speedup S(N)
        </text>
        <text x={padL + plotW / 2} y={H - 6} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          počet procesorů N {logX ? "(log)" : ""}
        </text>

        {/* Gridlines + ticks */}
        {xTicks.map((tx) => (
          <g key={`xt-${tx}`}>
            <line x1={xS(tx)} y1={padT} x2={xS(tx)} y2={padT + plotH} stroke="var(--line)" strokeWidth="0.4" strokeDasharray="2 3" />
            <text x={xS(tx)} y={padT + plotH + 13} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              {tx >= 1000 ? `${tx / 1000}k` : tx}
            </text>
          </g>
        ))}
        {yTicks.map((ty) => (
          <g key={`yt-${ty}`}>
            <line x1={padL} y1={yS(ty)} x2={W - padR} y2={yS(ty)} stroke="var(--line)" strokeWidth="0.4" strokeDasharray="2 3" />
            <text x={padL - 4} y={yS(ty) + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              {ty >= 100 ? Math.round(ty) : ty.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Asymptote 1/(1-α) for Amdahl */}
        {Number.isFinite(asymptote) && asymptote <= yMax && (
          <g>
            <line x1={padL} y1={yS(asymptote)} x2={W - padR} y2={yS(asymptote)}
                  stroke="oklch(0.65 0.15 25)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            <text x={W - padR - 4} y={yS(asymptote) - 4} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 25)">
              1/(1-α) = {asymptote.toFixed(1)}
            </text>
          </g>
        )}

        {/* Ideal line S=N */}
        <path d={`M ${xS(1)} ${yS(1)} L ${xS(yMax)} ${yS(yMax)}`}
              stroke="var(--text-faint)" strokeWidth="0.7" strokeDasharray="2 4" opacity="0.7" fill="none" />

        {/* Gustafson curve */}
        <path d={pathG} fill="none" stroke="oklch(0.55 0.18 142)" strokeWidth="1.8" />

        {/* Amdahl curve */}
        <path d={pathA} fill="none" stroke="var(--accent)" strokeWidth="2" />

        {/* Current N markers */}
        <line x1={xS(N)} y1={padT} x2={xS(N)} y2={padT + plotH} stroke="var(--text)" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5" />
        <circle cx={xS(N)} cy={yS(sAt)} r="4" fill="var(--accent)" stroke="var(--bg-card)" strokeWidth="1.5" />
        <circle cx={xS(N)} cy={yS(gAt)} r="4" fill="oklch(0.55 0.18 142)" stroke="var(--bg-card)" strokeWidth="1.5" />

        {/* Legend */}
        <g transform={`translate(${padL + 10}, ${padT + 8})`}>
          <line x1="0" y1="0" x2="14" y2="0" stroke="var(--accent)" strokeWidth="2" />
          <text x="18" y="3.5" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">Amdahl (fixed-size)</text>
          <line x1="0" y1="14" x2="14" y2="14" stroke="oklch(0.55 0.18 142)" strokeWidth="2" />
          <text x="18" y="17.5" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">Gustafson (scaled)</text>
          <line x1="0" y1="28" x2="14" y2="28" stroke="var(--text-faint)" strokeWidth="0.8" strokeDasharray="2 4" />
          <text x="18" y="31.5" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">ideál S = N</text>
        </g>
      </svg>

      {/* Readouts */}
      <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 12 }}>
        <div>
          <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>N</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)" }}>{N}</div>
        </div>
        <div>
          <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Amdahl S(N)</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--accent)" }}>{sAt.toFixed(2)}×</div>
        </div>
        <div>
          <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Gustafson S(N)</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "oklch(0.55 0.18 142)" }}>{gAt.toFixed(1)}×</div>
        </div>
        <div>
          <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>limit Amdahl</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "oklch(0.55 0.18 25)" }}>
            {Number.isFinite(asymptote) ? `${asymptote.toFixed(1)}×` : "∞"}
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, fontSize: 12 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <span style={{ fontFamily: "var(--font-mono)", minWidth: 22 }}>α</span>
          <input type="range" min="0.5" max="0.999" step="0.001" value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", minWidth: 48 }}>{alpha.toFixed(3)}</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <span style={{ fontFamily: "var(--font-mono)", minWidth: 22 }}>N</span>
          <input type="range" min="0" max="5" step="0.05" value={Math.log10(N)} onChange={(e) => setN(Math.round(Math.pow(10, parseFloat(e.target.value))))} style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", minWidth: 48 }}>{N}</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <input type="checkbox" checked={logX} onChange={(e) => setLogX(e.target.checked)} />
          <span style={{ fontFamily: "var(--font-mono)" }}>log osa X</span>
        </label>
        <div style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>presety:</span>
          {[
            { a: 0.5, label: "α=0.5" },
            { a: 0.8, label: "α=0.8" },
            { a: 0.95, label: "α=0.95" },
            { a: 0.99, label: "α=0.99" },
          ].map((p) => (
            <button key={p.label} onClick={() => setAlpha(p.a)} style={{ ...presetBtn, ...(Math.abs(alpha - p.a) < 0.005 ? { background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" } : {}) }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Karp-Flatt */}
      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          Karp-Flatt diagnostika — empirický sériový podíl
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text-muted)" }}>
            <span style={{ fontFamily: "var(--font-mono)" }}>změřené S =</span>
            <input type="number" min="1" max="1000" step="0.5" value={kfS} onChange={(e) => setKfS(Math.max(1, parseFloat(e.target.value) || 1))}
                   style={inputStyle} />
          </label>
          <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text-muted)" }}>
            <span style={{ fontFamily: "var(--font-mono)" }}>na N =</span>
            <input type="number" min="2" max="10000" step="1" value={kfN} onChange={(e) => setKfN(Math.max(2, parseInt(e.target.value, 10) || 2))}
                   style={inputStyle} />
          </label>
          <div style={{ flex: 1, fontFamily: "var(--font-mono)", color: "var(--text)" }}>
            ⇒ e = <span style={{ color: "var(--accent)", fontWeight: 600 }}>{kfE !== null ? kfE.toFixed(4) : "—"}</span>
            <span style={{ color: "var(--text-faint)", marginLeft: 8 }}>(odhad 1−α)</span>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
          Pokud e <em>roste</em> s N, znamená to, že přidává paralelní overhead (komunikace, synchronizace) — algoritmus se neškáluje dobře.
        </div>
      </div>
    </div>
  );
}

const presetBtn = {
  padding: "3px 8px",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 3,
  color: "var(--text)",
  cursor: "pointer",
};
const inputStyle = {
  width: 70,
  padding: "3px 6px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 3,
  color: "var(--text)",
};
