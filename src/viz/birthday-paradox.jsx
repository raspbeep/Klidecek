// Paradox narozenin — pravděpodobnost kolize hashe.
// Slider pro počet bitů n a počet vzorků r; vykreslí Pr[kolize] vs. r.
// "Generate" tlačítko provádí náhodný experiment, vyznačí kdy nastala 1. kolize.
import { useMemo, useState } from "react";

function pCollision(r, N) {
  // Pr[no collision] ≈ exp(-r²/(2N))
  return 1 - Math.exp(-(r * r) / (2 * N));
}

export default function BirthdayParadox() {
  const [n, setN] = useState(16);
  const [trial, setTrial] = useState(null);

  const N = Math.pow(2, n);
  const sqrtN = Math.sqrt(N);

  function runTrial() {
    // Empiricky: generujeme náhodné n-bit hashe dokud nenajdeme kolizi.
    const seen = new Set();
    let count = 0;
    const limit = Math.max(50000, Math.floor(5 * sqrtN));
    while (count < limit) {
      const h = Math.floor(Math.random() * N);
      count++;
      if (seen.has(h)) {
        setTrial({ found: true, count, n });
        return;
      }
      seen.add(h);
    }
    setTrial({ found: false, count: limit, n });
  }

  const data = useMemo(() => {
    const points = [];
    const maxR = Math.min(N, Math.floor(3 * sqrtN));
    const step = Math.max(1, Math.floor(maxR / 200));
    for (let r = 0; r <= maxR; r += step) {
      points.push({ r, p: pCollision(r, N) });
    }
    return { points, maxR };
  }, [N, sqrtN]);

  const W = 540, H = 240;
  const padL = 50, padR = 20, padT = 20, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const xToPx = (x) => padL + (x / data.maxR) * plotW;
  const yToPx = (y) => padT + (1 - y) * plotH;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>velikost hashe n bitů: {n}</label>
        <input type="range" className="viz-slider" min={8} max={32} step={1} value={n} onChange={(e) => { setN(+e.target.value); setTrial(null); }} style={{ flex: 1, minWidth: 200 }} />
        <button className="viz-btn primary" onClick={runTrial}>▶ Empirický pokus</button>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Prostor: <b style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>N = 2^{n} = {N.toLocaleString()}</b>{" · "}
        Birthday bound: <b style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>√N ≈ {sqrtN.toFixed(0)}</b>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 640 }}>
        {/* axes */}
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--line)" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--line)" />

        {/* gridlines */}
        {[0.25, 0.5, 0.75, 1.0].map((y) => (
          <g key={y}>
            <line x1={padL} y1={yToPx(y)} x2={padL + plotW} y2={yToPx(y)} stroke="var(--line)" strokeDasharray="2 4" opacity="0.4" />
            <text x={padL - 6} y={yToPx(y) + 4} fontSize="10" fill="var(--text-muted)" textAnchor="end">{y.toFixed(2)}</text>
          </g>
        ))}

        {/* curve */}
        <path
          d={"M" + data.points.map((p) => `${xToPx(p.r).toFixed(1)},${yToPx(p.p).toFixed(1)}`).join(" L")}
          stroke="var(--accent)" strokeWidth="2" fill="none"
        />

        {/* 50% threshold marker */}
        <line x1={xToPx(1.177 * sqrtN)} y1={padT} x2={xToPx(1.177 * sqrtN)} y2={padT + plotH}
          stroke="#81b29a" strokeWidth="1" strokeDasharray="3 3" />
        <text x={xToPx(1.177 * sqrtN) + 4} y={padT + 10} fontSize="9" fill="#81b29a">P = 0.5 ≈ 1.18√N</text>

        {/* √N marker */}
        <line x1={xToPx(sqrtN)} y1={padT} x2={xToPx(sqrtN)} y2={padT + plotH}
          stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <text x={xToPx(sqrtN) + 4} y={padT + 24} fontSize="9" fill="var(--accent)">√N ≈ {sqrtN.toFixed(0)}</text>

        {/* trial result marker */}
        {trial && trial.found && trial.n === n && (
          <>
            <line x1={xToPx(trial.count)} y1={padT} x2={xToPx(trial.count)} y2={padT + plotH}
              stroke="#e07a5f" strokeWidth="2" />
            <circle cx={xToPx(trial.count)} cy={yToPx(pCollision(trial.count, N))} r={5} fill="#e07a5f" />
            <text x={xToPx(trial.count) + 6} y={padT + 38} fontSize="10" fill="#e07a5f">
              kolize po {trial.count}
            </text>
          </>
        )}

        {/* axis labels */}
        <text x={padL + plotW / 2} y={H - 8} fontSize="11" fill="var(--text-muted)" textAnchor="middle">počet vzorků r</text>
        <text x={12} y={padT + plotH / 2} fontSize="11" fill="var(--text-muted)" transform={`rotate(-90, 12, ${padT + plotH / 2})`}>
          Pr[kolize]
        </text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Standardní paradox: pro hashe délky n bitů stačí jen <b>~2^(n/2)</b> vzorků pro pravděpodobnost kolize 50 %.
        Důsledek: 128-bit hash (MD5) má jen 64-bit kolizní bezpečnost. Pro 128-bit kolize potřebujeme 256-bit hash.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
