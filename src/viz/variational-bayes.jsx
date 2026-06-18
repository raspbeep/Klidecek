// Variational Bayes intuition: a bimodal target "posterior" p(theta) (which we
// cannot fit exactly with a single Gaussian) and a single Gaussian approximation q.
// Drag q's mean and width with sliders; watch the ELBO rise / KL(q||p) fall, and
// see that the best single Gaussian "snaps" onto ONE mode (zero-forcing), never both.
import { useState } from "react";

const W = 320, H = 190;
const X0 = -6, X1 = 6;       // theta range
const N = 240;               // grid resolution
const PAD_L = 8, PAD_R = 8, PAD_T = 8, PAD_B = 26;

// unnormalized bimodal target: mixture of two Gaussians
function targetUnnorm(x) {
  const g = (m, s, w) => w * Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  return g(-2.2, 0.7, 0.55) + g(2.4, 1.0, 0.45);
}
function gauss(x, m, s) {
  return Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
}

// precompute grid + normalized target
const XS = Array.from({ length: N + 1 }, (_, i) => X0 + (i / N) * (X1 - X0));
const DX = (X1 - X0) / N;
const PRAW = XS.map(targetUnnorm);
const PZ = PRAW.reduce((a, v) => a + v, 0) * DX;      // normalizer (~1 already, but be safe)
const P = PRAW.map((v) => v / PZ);

export default function VariationalBayes() {
  const [mu, setMu] = useState(-2.2);   // q mean
  const [sigma, setSigma] = useState(0.8); // q std

  const Q = XS.map((x) => gauss(x, mu, sigma));

  // KL(q || p) = sum q ln(q/p) dx ; eps guards log(0)
  const eps = 1e-9;
  let kl = 0;
  for (let i = 0; i <= N; i++) {
    const q = Q[i], p = P[i];
    if (q > eps) kl += q * Math.log((q + eps) / (p + eps)) * DX;
  }
  if (kl < 0) kl = 0; // numerical floor
  // ELBO = ln p(X) - KL ; ln p(X)=ln(PZ). Show relative ELBO so the "higher is better" reads.
  const lnEvidence = Math.log(PZ);
  const elbo = lnEvidence - kl;

  // y scaling: fit max of both curves
  const ymax = Math.max(Math.max(...P), Math.max(...Q), 0.45) * 1.08;
  const toX = (x) => PAD_L + ((x - X0) / (X1 - X0)) * (W - PAD_L - PAD_R);
  const toY = (y) => H - PAD_B - (y / ymax) * (H - PAD_T - PAD_B);
  const area = (arr) => {
    let d = `M ${toX(XS[0])} ${toY(0)}`;
    for (let i = 0; i <= N; i++) d += ` L ${toX(XS[i])} ${toY(arr[i])}`;
    d += ` L ${toX(XS[N])} ${toY(0)} Z`;
    return d;
  };
  const line = (arr) => XS.map((x, i) => `${i === 0 ? "M" : "L"} ${toX(x)} ${toY(arr[i])}`).join(" ");

  // KL quality bar (0 KL = perfect). clamp for display
  const klPct = Math.min(1, kl / 2.0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* baseline */}
        <line x1={toX(X0)} y1={toY(0)} x2={toX(X1)} y2={toY(0)} stroke="var(--line-strong)" strokeWidth="0.5" />
        {/* target p (filled, muted accent) */}
        <path d={area(P)} fill="color-mix(in oklch, oklch(0.7 0.18 60) 22%, var(--bg-inset))" stroke="none" />
        <path d={line(P)} fill="none" stroke="oklch(0.7 0.18 60)" strokeWidth="1.6" />
        {/* approx q (accent) */}
        <path d={line(Q)} fill="none" stroke="var(--accent)" strokeWidth="1.8" />
        {/* mean marker */}
        <line x1={toX(mu)} y1={toY(0)} x2={toX(mu)} y2={toY(gauss(mu, mu, sigma))}
          stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 2" />
        {/* labels */}
        <text x={toX(X0) + 2} y={PAD_T + 8} fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.7 0.18 60)">p(θ|X) — cíl (bimodální)</text>
        <text x={toX(X0) + 2} y={PAD_T + 19} fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">q(θ) — gauss. aproximace</text>
        <text x={toX(X1)} y={H - 12} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">θ →</text>
      </svg>

      <div className="viz-controls" style={{ flexWrap: "wrap", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
          μ (střed q)
          <input type="range" className="viz-slider" min={-5} max={5} step={0.05}
            value={mu} onChange={(e) => setMu(+e.target.value)} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
          σ (šířka q)
          <input type="range" className="viz-slider" min={0.3} max={3} step={0.05}
            value={sigma} onChange={(e) => setSigma(+e.target.value)} />
        </label>
        <button className="viz-btn primary" onClick={() => { setMu(-2.2); setSigma(0.7); }}>
          sedni na levý mód
        </button>
      </div>

      {/* KL bar: shorter = better */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10.5, color: "var(--text-muted)", width: 92 }}>KL(q‖p):</span>
        <div style={{ flex: 1, height: 12, background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${klPct * 100}%`, height: "100%", background: "var(--accent)", transition: "width 60ms linear" }} />
        </div>
      </div>

      <span className="viz-readout">
        μ={mu.toFixed(2)} · σ={sigma.toFixed(2)} · ELBO={elbo.toFixed(3)} ↑ · KL(q‖p)={kl.toFixed(3)} ↓
      </span>
      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.5 }}>
        Maximální ELBO = minimální KL. Jediná gaussovka oba módy nepokryje — nejlepší q „uvázne" na jednom módu (zero-forcing). Zkus μ posunout mezi módy: KL vzroste.
      </div>
    </div>
  );
}
