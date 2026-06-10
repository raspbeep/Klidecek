// TCP congestion-control sawtooth: Tahoe / Reno / Cubic.
// Slow Start (exponential) → Congestion Avoidance (linear or cubic) → loss event.
import { useState, useMemo } from "react";

const RTTS = 100;

export default function AIMD() {
  const [variant, setVariant] = useState("reno");
  const [seed, setSeed] = useState(7);
  const [lossPct, setLossPct] = useState(2.5);
  const [ssthreshStart, setSsthreshStart] = useState(20);

  const sim = useMemo(
    () => simulate({ variant, lossPct, ssthreshStart, seed }),
    [variant, lossPct, ssthreshStart, seed]
  );

  const W = 540, H = 250;
  const padL = 32, padR = 14, padT = 26, padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxCwnd = Math.max(2, ...sim.data.map((d) => d.cwnd));
  const xS = (i) => padL + (plotW * i) / (RTTS - 1);
  const yS = (c) => padT + plotH - (plotH * c) / maxCwnd;

  // build line segments coloured by mode
  const segments = [];
  for (let i = 1; i < sim.data.length; i++) {
    const prev = sim.data[i - 1];
    const cur = sim.data[i];
    segments.push({
      x1: xS(i - 1), y1: yS(prev.cwnd),
      x2: xS(i),     y2: yS(cur.cwnd),
      mode: cur.mode,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* axes */}
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH}
          stroke="var(--text-muted)" strokeWidth="0.8" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH}
          stroke="var(--text-muted)" strokeWidth="0.8" />
        <text x={padL - 4} y={padT + 4} textAnchor="end"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">cwnd</text>
        <text x={W - padR} y={padT + plotH + 14} textAnchor="end"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">RTT</text>

        {/* grid lines */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={`gh-${i}`}
            x1={padL} y1={padT + plotH * (1 - f)}
            x2={W - padR} y2={padT + plotH * (1 - f)}
            stroke="var(--line)" strokeWidth="0.4" strokeDasharray="2 2" />
        ))}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={`gv-${i}`}
            x1={padL + plotW * f} y1={padT}
            x2={padL + plotW * f} y2={padT + plotH}
            stroke="var(--line)" strokeWidth="0.4" strokeDasharray="2 2" />
        ))}

        {/* cwnd line segments */}
        {segments.map((s, i) => (
          <line key={`seg-${i}`}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={modeColor(s.mode)} strokeWidth="1.6" />
        ))}

        {/* loss events */}
        {sim.events.map((e, i) => (
          <g key={`ev-${i}`}>
            <line x1={xS(e.t)} y1={padT} x2={xS(e.t)} y2={padT + plotH}
              stroke="oklch(0.60 0.18 25)" strokeWidth="0.7"
              strokeDasharray="2 2" opacity="0.55" />
            <circle cx={xS(e.t)} cy={yS(e.cwndBefore)} r="3"
              fill="oklch(0.60 0.18 25)" />
            <text x={xS(e.t)} y={padT - 4} textAnchor="middle"
              fontSize="8" fontFamily="var(--font-mono)" fill="oklch(0.60 0.18 25)">
              {e.type === "timeout" ? "TO" : "3-dup"}
            </text>
          </g>
        ))}

        {/* legend */}
        <g transform={`translate(${padL + 6}, ${padT + 8})`}>
          <line x1="0" y1="0" x2="14" y2="0" stroke="oklch(0.68 0.16 65)" strokeWidth="2" />
          <text x="18" y="3" fontSize="8.5" fontFamily="var(--font-mono)"
            fill="var(--text-muted)">slow start</text>
          <line x1="0" y1="12" x2="14" y2="12" stroke="var(--accent)" strokeWidth="2" />
          <text x="18" y="15" fontSize="8.5" fontFamily="var(--font-mono)"
            fill="var(--text-muted)">cong. avoid</text>
          <line x1="0" y1="24" x2="14" y2="24" stroke="oklch(0.62 0.15 145)" strokeWidth="2" />
          <text x="18" y="27" fontSize="8.5" fontFamily="var(--font-mono)"
            fill="var(--text-muted)">cubic</text>
        </g>

        <text x={W / 2} y={16} textAnchor="middle"
          fontSize="10" fontWeight="700" fill="var(--text)">
          {variantLabel(variant)} — avg cwnd {(sim.avgCwnd).toFixed(1)}, {sim.events.length} loss events
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
        fontSize: 12 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <span>varianta</span>
          <select className="viz-select" value={variant} onChange={(e) => setVariant(e.target.value)}
            style={{ flex: 1 }}>
            <option value="tahoe">TCP Tahoe</option>
            <option value="reno">TCP Reno (AIMD)</option>
            <option value="cubic">CUBIC</option>
          </select>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          loss
          <input type="range" className="viz-slider" min="0" max="8" step="0.5" value={lossPct}
            onChange={(e) => setLossPct(parseFloat(e.target.value))}
            style={{ flex: 1 }} />
          <span className="viz-readout">{lossPct.toFixed(1)}%</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          ssthresh
          <input type="range" className="viz-slider" min="4" max="64" step="2" value={ssthreshStart}
            onChange={(e) => setSsthreshStart(parseInt(e.target.value, 10))}
            style={{ flex: 1 }} />
          <span className="viz-readout">{ssthreshStart}</span>
        </label>
        <button className="viz-btn" onClick={() => setSeed(Math.floor(Math.random() * 1000))}>
          ↻ jiný seed
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        {variant === "tahoe" && "Tahoe: každá ztráta = ssthresh = cwnd/2, cwnd = 1, slow-start. Konzervativní, ale pomalý."}
        {variant === "reno" && "Reno: 3 duplicate ACK = ssthresh = cwnd/2, cwnd = ssthresh (fast recovery). Timeout → cwnd=1. Klasická AIMD pila."}
        {variant === "cubic" && "CUBIC: po loss roste cwnd jako kubická funkce času od posledního Wmax. Lépe využívá tučné spoje (long fat networks)."}
      </div>
    </div>
  );
}

function variantLabel(v) {
  return v === "tahoe" ? "TCP Tahoe" : v === "reno" ? "TCP Reno" : "CUBIC";
}

function modeColor(m) {
  if (m === "ss")    return "oklch(0.68 0.16 65)";
  if (m === "cubic") return "oklch(0.62 0.15 145)";
  return "var(--accent)";
}

// deterministic PRNG so we can replay with a seed
function mulberry32(s) {
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulate({ variant, lossPct, ssthreshStart, seed }) {
  const rand = mulberry32(seed * 1009 + Math.round(lossPct * 10) + ssthreshStart);
  let cwnd = 1;
  let ssthresh = ssthreshStart;
  let mode = "ss";
  const data = [];
  const events = [];
  const lossProb = lossPct / 100;
  let sumCwnd = 0;

  for (let t = 0; t < RTTS; t++) {
    data.push({ cwnd, mode, ssthresh });
    sumCwnd += cwnd;

    const loss = rand() < lossProb && cwnd > 2;
    if (loss) {
      const timeout = rand() < 0.3;
      const cwndBefore = cwnd;
      ssthresh = Math.max(2, Math.floor(cwnd / 2));
      if (timeout) {
        events.push({ t, type: "timeout", cwndBefore });
        cwnd = 1; mode = "ss";
      } else if (variant === "tahoe") {
        events.push({ t, type: "3dup", cwndBefore });
        cwnd = 1; mode = "ss";
      } else {
        events.push({ t, type: "3dup", cwndBefore });
        cwnd = ssthresh; mode = variant === "cubic" ? "cubic" : "ca";
      }
    } else {
      if (mode === "ss") {
        cwnd = cwnd * 2;
        if (cwnd >= ssthresh) { cwnd = ssthresh; mode = variant === "cubic" ? "cubic" : "ca"; }
      } else if (variant === "cubic") {
        const Wmax = ssthresh * 2;
        const diff = Wmax - cwnd;
        cwnd += diff > 0 ? Math.max(0.3, diff * 0.05) : 0.15;
      } else {
        cwnd += 1;
      }
    }
  }
  return { data, events, avgCwnd: sumCwnd / RTTS };
}
