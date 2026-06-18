// 2D EM for a 2-component GMM, stepped by hand.
// Fixed dataset (two blobs). "E-krok" recomputes responsibilities (recolors points),
// "M-krok" updates the component params (ellipses move/reshape). A side plot shows the
// log-likelihood climbing monotonically. All math is real EM so the picture truly changes.
import { useState, useMemo } from "react";

// --- fixed toy dataset: two gaussian blobs in [0..100]^2 ---
function makeData() {
  // deterministic pseudo-random so the figure is stable across renders
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const gauss = () => {
    // Box-Muller
    const u = Math.max(1e-6, rnd()), v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const pts = [];
  for (let i = 0; i < 30; i++) pts.push([34 + gauss() * 9, 40 + gauss() * 9]);
  for (let i = 0; i < 30; i++) pts.push([68 + gauss() * 8, 64 + gauss() * 8]);
  return pts;
}

// 2x2 covariance helpers
const det2 = (S) => S[0] * S[3] - S[1] * S[2];
const inv2 = (S) => {
  const d = det2(S) || 1e-9;
  return [S[3] / d, -S[1] / d, -S[2] / d, S[0] / d];
};
function gaussPdf(p, mu, S) {
  const dx = p[0] - mu[0], dy = p[1] - mu[1];
  const Si = inv2(S);
  const q = dx * (Si[0] * dx + Si[1] * dy) + dy * (Si[2] * dx + Si[3] * dy);
  const d = Math.max(det2(S), 1e-9);
  return Math.exp(-0.5 * q) / (2 * Math.PI * Math.sqrt(d));
}

// one EM iteration returns new params + per-point responsibilities + log-likelihood
function emStep(data, params, doM) {
  const K = params.length;
  const resp = data.map((p) => {
    const w = params.map((c) => c.pi * gaussPdf(p, c.mu, c.S));
    const s = w.reduce((a, b) => a + b, 0) || 1e-12;
    return w.map((x) => x / s);
  });
  const ll = data.reduce((acc, p) => {
    const s = params.reduce((a, c) => a + c.pi * gaussPdf(p, c.mu, c.S), 0);
    return acc + Math.log(Math.max(s, 1e-12));
  }, 0);
  if (!doM) return { params, resp, ll };
  const N = data.length;
  const next = params.map((c, k) => {
    const Nk = resp.reduce((a, r) => a + r[k], 0) || 1e-9;
    const mu = [
      resp.reduce((a, r, i) => a + r[k] * data[i][0], 0) / Nk,
      resp.reduce((a, r, i) => a + r[k] * data[i][1], 0) / Nk,
    ];
    let s00 = 0, s01 = 0, s11 = 0;
    data.forEach((p, i) => {
      const dx = p[0] - mu[0], dy = p[1] - mu[1];
      s00 += r_(resp, i, k) * dx * dx;
      s01 += r_(resp, i, k) * dx * dy;
      s11 += r_(resp, i, k) * dy * dy;
    });
    // regularise to avoid collapse
    const S = [s00 / Nk + 4, s01 / Nk, s01 / Nk, s11 / Nk + 4];
    return { pi: Nk / N, mu, S };
  });
  return { params: next, resp, ll };
}
const r_ = (resp, i, k) => resp[i][k];

// ellipse params (rx, ry, rotation deg) from a 2x2 covariance at ~1.5 sigma
function ellipse(S) {
  const a = S[0], b = S[1], d = S[3];
  const tr = a + d, det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
  const theta = Math.atan2(l1 - a, b || 1e-9); // angle of major eigvec
  const k = 1.6;
  return { rx: k * Math.sqrt(Math.max(l1, 0.1)), ry: k * Math.sqrt(Math.max(l2, 0.1)), deg: (theta * 180) / Math.PI };
}

const COLORS = ["var(--accent)", "var(--accent-line)"];

export default function GmmEm() {
  const data = useMemo(makeData, []);
  // deliberately bad init so the steps clearly move the ellipses
  const init = useMemo(() => [
    { pi: 0.5, mu: [45, 55], S: [120, 0, 0, 120] },
    { pi: 0.5, mu: [60, 48], S: [120, 0, 0, 120] },
  ], []);

  const [params, setParams] = useState(init);
  const [resp, setResp] = useState(null);
  const [llHist, setLlHist] = useState([]);
  const [phase, setPhase] = useState("init"); // "init" | "E" | "M"

  const doE = () => {
    const { resp: r, ll } = emStep(data, params, false);
    setResp(r);
    setLlHist((h) => (h.length && Math.abs(h[h.length - 1] - ll) < 1e-9 ? h : [...h, ll]));
    setPhase("E");
  };
  const doM = () => {
    const { params: np, resp: r } = emStep(data, params, true);
    setParams(np);
    setResp(r);
    setPhase("M");
  };
  const reset = () => { setParams(init); setResp(null); setLlHist([]); setPhase("init"); };

  const W = 320, H = 200;
  const PW = 200, PH = H; // point plot width
  // point plot coords (data already in 0..100)
  const px = (x) => 10 + (x / 100) * (PW - 20);
  const py = (y) => H - 14 - (y / 100) * (H - 28);

  // log-likelihood mini plot
  const lx0 = PW + 12, lx1 = W - 6, ly0 = 24, ly1 = H - 16;
  const lls = llHist;
  const llMin = lls.length ? Math.min(...lls) : 0;
  const llMax = lls.length ? Math.max(...lls) : 1;
  const lspan = llMax - llMin || 1;
  const lpx = (i) => lx0 + (lls.length <= 1 ? 0.5 : i / (lls.length - 1)) * (lx1 - lx0);
  const lpy = (v) => ly1 - ((v - llMin) / lspan) * (ly1 - ly0);

  const pointColor = (i) => {
    if (!resp) return "var(--text-muted)";
    // mix the two component colors by responsibility -> via opacity of two dots is hard,
    // so pick dominant color but fade by confidence
    const r = resp[i];
    return r[0] >= r[1] ? COLORS[0] : COLORS[1];
  };
  const pointOpacity = (i) => {
    if (!resp) return 0.6;
    const r = resp[i];
    const conf = Math.max(r[0], r[1]); // 0.5..1
    return 0.4 + (conf - 0.5) * 1.2; // 0.4..1.0
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* divider */}
        <line x1={PW + 4} y1={10} x2={PW + 4} y2={H - 10} stroke="var(--line)" strokeWidth="0.6" />

        {/* component ellipses */}
        {params.map((c, k) => {
          const e = ellipse(c.S);
          return (
            <ellipse key={k}
              cx={px(c.mu[0])} cy={py(c.mu[1])}
              rx={(e.rx / 100) * (PW - 20)} ry={(e.ry / 100) * (H - 28)}
              transform={`rotate(${-e.deg} ${px(c.mu[0])} ${py(c.mu[1])})`}
              fill={COLORS[k]} fillOpacity="0.1"
              stroke={COLORS[k]} strokeWidth="1.6" />
          );
        })}
        {/* data points */}
        {data.map((p, i) => (
          <circle key={i} cx={px(p[0])} cy={py(p[1])} r="3"
            fill={pointColor(i)} opacity={pointOpacity(i)} />
        ))}
        {/* component means */}
        {params.map((c, k) => (
          <g key={"m" + k}>
            <line x1={px(c.mu[0]) - 4} y1={py(c.mu[1])} x2={px(c.mu[0]) + 4} y2={py(c.mu[1])} stroke={COLORS[k]} strokeWidth="2" />
            <line x1={px(c.mu[0])} y1={py(c.mu[1]) - 4} x2={px(c.mu[0])} y2={py(c.mu[1]) + 4} stroke={COLORS[k]} strokeWidth="2" />
          </g>
        ))}
        <text x={10} y={14} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">body + 2 komponenty</text>

        {/* log-likelihood plot */}
        <text x={lx0} y={18} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">log L (roste)</text>
        <line x1={lx0} y1={ly1} x2={lx1} y2={ly1} stroke="var(--line-strong)" strokeWidth="0.5" />
        <line x1={lx0} y1={ly0} x2={lx0} y2={ly1} stroke="var(--line-strong)" strokeWidth="0.5" />
        {lls.length > 1 && (
          <path d={lls.map((v, i) => `${i === 0 ? "M" : "L"} ${lpx(i).toFixed(1)} ${lpy(v).toFixed(1)}`).join(" ")}
            fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        )}
        {lls.map((v, i) => (
          <circle key={i} cx={lpx(i)} cy={lpy(v)} r="2.2" fill="var(--accent)" />
        ))}
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={doE} data-active={phase === "E"}>E-krok</button>
        <button className="viz-btn primary" onClick={doM} data-active={phase === "M"}>M-krok</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>

      <span className="viz-readout">
        {phase === "init" && "start: stejné kruhové komponenty, špatně umístěné — klikni E-krok"}
        {phase === "E" && "E-krok: body přebarveny podle odpovědnosti γ (sytost = jistota přiřazení)"}
        {phase === "M" && "M-krok: středy a tvar elips přepočteny váženě podle γ"}
        {lls.length > 0 && ` · log L = ${lls[lls.length - 1].toFixed(1)}`}
      </span>
    </div>
  );
}
