// Plug-in vs posterior-predictive distribution.
// Gaussian mean example: data ~ N(mu, sigma^2) with known sigma, unknown mu.
// Posterior over mu is N(mu_hat, tau^2) with tau^2 = sigma^2 / n.
//   plug-in predictive:    N(mu_hat, sigma^2)                 (pretends mu is exact)
//   posterior predictive:  N(mu_hat, sigma^2 + tau^2)         (adds parameter uncertainty)
// More data (n up) -> tau^2 -> 0 -> the two curves merge.
import { useState } from "react";

function gauss(x, mu, varc) {
  return Math.exp(-((x - mu) * (x - mu)) / (2 * varc)) / Math.sqrt(2 * Math.PI * varc);
}

export default function BayesPredictive() {
  const [n, setN] = useState(2); // number of observed data points
  const sigma2 = 1.0; // known observation noise (variance)
  const muHat = 0; // estimated mean (centre everything at 0 for clarity)

  const tau2 = sigma2 / n; // posterior variance of mu
  const varPlug = sigma2; // plug-in predictive variance
  const varPred = sigma2 + tau2; // posterior predictive variance (wider)

  const W = 330, H = 180;
  const x0 = 16, x1 = W - 12, yBase = H - 26, yTop = 14;
  const xmin = -5, xmax = 5, N = 160;

  // shared vertical scale: normalise by the tallest (plug-in is always tallest)
  const peak = gauss(muHat, muHat, varPlug);
  const toX = (x) => x0 + ((x - xmin) / (xmax - xmin)) * (x1 - x0);
  const toY = (y) => yBase - (y / peak) * (yBase - yTop);

  const sample = (varc) => {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const x = xmin + (i / N) * (xmax - xmin);
      pts.push({ x, y: gauss(x, muHat, varc) });
    }
    return pts;
  };
  const mkPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(1)} ${toY(p.y).toFixed(1)}`).join(" ");

  const plug = sample(varPlug);
  const pred = sample(varPred);

  const sdPlug = Math.sqrt(varPlug);
  const sdPred = Math.sqrt(varPred);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 470, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <line x1={x0} y1={yBase} x2={x1} y2={yBase} stroke="var(--line-strong)" strokeWidth="0.7" />
        {[-4, -2, 0, 2, 4].map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={yBase} x2={toX(t)} y2={yBase + 3} stroke="var(--line-strong)" strokeWidth="0.7" />
            <text x={toX(t)} y={yBase + 13} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">{t}</text>
          </g>
        ))}
        <text x={x1} y={yTop + 2} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">x&#39;</text>

        {/* posterior-predictive fill (the wider one) */}
        <path d={`${mkPath(pred)} L ${toX(xmax)} ${yBase} L ${toX(xmin)} ${yBase} Z`} fill="var(--accent)" opacity="0.1" />

        {/* plug-in: narrow, tall */}
        <path d={mkPath(plug)} fill="none" stroke="var(--text-muted)" strokeWidth="1.6" strokeDasharray="3 3" />
        {/* posterior predictive: wider, lower */}
        <path d={mkPath(pred)} fill="none" stroke="var(--accent)" strokeWidth="2.2" />

        {/* legend */}
        <g>
          <line x1={x0 + 4} y1={yTop + 6} x2={x0 + 20} y2={yTop + 6} stroke="var(--text-muted)" strokeWidth="1.6" strokeDasharray="3 3" />
          <text x={x0 + 24} y={yTop + 9} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">plug-in (jediné θ̂)</text>
          <line x1={x0 + 4} y1={yTop + 17} x2={x0 + 20} y2={yTop + 17} stroke="var(--accent)" strokeWidth="2.2" />
          <text x={x0 + 24} y={yTop + 20} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--accent)">prediktivní (průměr přes posterior)</text>
        </g>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>počet dat n = {n}</span>
        <input type="range" className="viz-slider" min={1} max={50} step={1} value={n} onChange={(e) => setN(+e.target.value)} style={{ flex: 1, minWidth: 120 }} />
      </div>

      <span className="viz-readout">
        posterior var(θ)=σ²/n={tau2.toFixed(3)} · SD plug-in={sdPlug.toFixed(2)} · SD prediktivní={sdPred.toFixed(2)}
        {n >= 30 ? " · n velké → křivky téměř splývají" : " · prediktivní širší o nejistotu θ"}
      </span>
    </div>
  );
}
