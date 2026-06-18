// lda-projection — two 2D classes; toggle between projecting onto the PCA axis
// (max total variance, ignores labels) and the LDA / Fisher axis (max between-
// over within-class scatter). 1D histograms of the projected classes show that
// LDA separates the two clusters that PCA collapses on top of each other.
import { useState } from "react";

const W = 320, H = 210;

// Two elongated, parallel clusters. The big spread (total variance) runs along
// the cluster's long axis (~45°), but the *class separation* is perpendicular
// to it. So PCA (max total variance) keeps the long axis and merges classes;
// LDA finds the perpendicular separating axis.
function cluster(cx, cy, n, seed) {
  const pts = [];
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const g = () => (rnd() + rnd() + rnd() - 1.5);
  for (let i = 0; i < n; i++) {
    const along = g() * 2.6;   // large spread along long axis
    const across = g() * 0.5;  // small spread across
    // long axis direction (1,1)/√2 ; across direction (1,-1)/√2
    const dx = (along + across) / Math.SQRT2;
    const dy = (along - across) / Math.SQRT2;
    pts.push([cx + dx, cy + dy]);
  }
  return pts;
}

// centers offset along the across-direction (1,-1) so classes differ perpendicular to spread
const A = cluster(4.4, 5.6, 28, 13);
const B = cluster(5.6, 4.4, 28, 77);

function meanVec(pts) {
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length,
          pts.reduce((s, p) => s + p[1], 0) / pts.length];
}
function cov(pts, m) {
  let sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of pts) { sxx += (x - m[0]) ** 2; sxy += (x - m[0]) * (y - m[1]); syy += (y - m[1]) ** 2; }
  const n = pts.length;
  return [[sxx / n, sxy / n], [sxy / n, syy / n]];
}
function topEigvec(c) {
  const a = c[0][0], b = c[0][1], d = c[1][1];
  const tr = a + d, det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
  const l1 = tr / 2 + disc;
  let vx = 1, vy = 0;
  if (Math.abs(b) > 1e-9) { vx = b; vy = l1 - a; }
  else if (a < d) { vx = 0; vy = 1; }
  const n = Math.hypot(vx, vy);
  return [vx / n, vy / n];
}

const ALL = [...A, ...B];
const mAll = meanVec(ALL);
const mA = meanVec(A), mB = meanVec(B);

// PCA axis: top eigenvector of total covariance
const pcaAxis = topEigvec(cov(ALL, mAll));

// LDA axis (2 classes, isotropic-ish): direction of Sw^-1 (mB - mA)
const cA = cov(A, mA), cB = cov(B, mB);
const Sw = [[(cA[0][0] + cB[0][0]) / 2, (cA[0][1] + cB[0][1]) / 2],
            [(cA[1][0] + cB[1][0]) / 2, (cA[1][1] + cB[1][1]) / 2]];
function inv2(m) {
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  return [[m[1][1] / det, -m[0][1] / det], [-m[1][0] / det, m[0][0] / det]];
}
const Swi = inv2(Sw);
const dmean = [mB[0] - mA[0], mB[1] - mA[1]];
let ldaRaw = [Swi[0][0] * dmean[0] + Swi[0][1] * dmean[1], Swi[1][0] * dmean[0] + Swi[1][1] * dmean[1]];
const ln = Math.hypot(ldaRaw[0], ldaRaw[1]);
const ldaAxis = [ldaRaw[0] / ln, ldaRaw[1] / ln];

export default function LdaProjection() {
  const [mode, setMode] = useState("pca");
  const dir = mode === "pca" ? pcaAxis : ldaAxis;

  const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
  const PAD_L = 8, PAD_R = 8, PAD_T = 8, PAD_B = 60;
  const PW = W - PAD_L - PAD_R;
  const PH = H - PAD_T - PAD_B;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + PH - ((y - yMin) / (yMax - yMin)) * PH;

  const proj = (p) => p[0] * dir[0] + p[1] * dir[1];
  const pa = A.map(proj), pb = B.map(proj);

  const meanA = pa.reduce((s, v) => s + v, 0) / pa.length;
  const meanB = pb.reduce((s, v) => s + v, 0) / pb.length;
  const sd = (a, m) => Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
  const fisher = Math.abs(meanB - meanA) / Math.sqrt(sd(pa, meanA) ** 2 + sd(pb, meanB) ** 2 + 1e-9);

  // histogram on the 1D projected line
  const all = [...pa, ...pb];
  const tMin = Math.min(...all) - 0.4, tMax = Math.max(...all) + 0.4;
  const BINS = 16;
  const binOf = (t) => Math.min(BINS - 1, Math.max(0, Math.floor((t - tMin) / (tMax - tMin) * BINS)));
  const hA = new Array(BINS).fill(0), hB = new Array(BINS).fill(0);
  pa.forEach((t) => hA[binOf(t)]++);
  pb.forEach((t) => hB[binOf(t)]++);
  const hMax = Math.max(1, ...hA, ...hB);
  const histTop = H - PAD_B + 8;
  const histH = 30;
  const binW = PW / BINS;

  const colA = "oklch(0.65 0.16 264)";
  const colB = "oklch(0.62 0.18 28)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>projekční osa:</span>
        <button className="viz-btn" data-active={mode === "pca"} onClick={() => setMode("pca")}>PCA osa</button>
        <button className="viz-btn primary" data-active={mode === "lda"} onClick={() => setMode("lda")}>LDA osa</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, background: "var(--bg-inset)", borderRadius: 4 }}>
        <rect x={PAD_L} y={PAD_T} width={PW} height={PH} fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.5" />

        {/* chosen projection axis through global mean */}
        <line x1={toX(mAll[0] - 4 * dir[0])} y1={toY(mAll[1] - 4 * dir[1])}
              x2={toX(mAll[0] + 4 * dir[0])} y2={toY(mAll[1] + 4 * dir[1])}
              stroke="var(--accent)" strokeWidth="1.6" />
        <text x={toX(mAll[0] + 3.4 * dir[0])} y={toY(mAll[1] + 3.4 * dir[1]) - 4}
              fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">
          {mode === "pca" ? "PC1" : "LDA"}
        </text>

        {/* points */}
        {A.map((p, i) => <circle key={"a" + i} cx={toX(p[0])} cy={toY(p[1])} r="2.7" fill={colA} opacity="0.9" />)}
        {B.map((p, i) => <circle key={"b" + i} cx={toX(p[0])} cy={toY(p[1])} r="2.7" fill={colB} opacity="0.9" />)}

        {/* class-mean ticks projected onto the axis */}
        {[[meanA, colA], [meanB, colB]].map(([m, c], k) => {
          const px = mAll[0] + (m - (mAll[0] * dir[0] + mAll[1] * dir[1])) * dir[0];
          const py = mAll[1] + (m - (mAll[0] * dir[0] + mAll[1] * dir[1])) * dir[1];
          return <circle key={k} cx={toX(px)} cy={toY(py)} r="3.4" fill="none" stroke={c} strokeWidth="1.6" />;
        })}

        {/* histograms of the 1D projections */}
        <line x1={PAD_L} y1={histTop} x2={W - PAD_R} y2={histTop} stroke="var(--line-strong)" strokeWidth="0.6" />
        {hA.map((v, i) => v > 0 && (
          <rect key={"ha" + i} x={PAD_L + i * binW + 0.5} y={histTop - (v / hMax) * histH}
                width={binW - 1} height={(v / hMax) * histH} fill={colA} opacity="0.55" />
        ))}
        {hB.map((v, i) => v > 0 && (
          <rect key={"hb" + i} x={PAD_L + i * binW + 0.5} y={histTop - (v / hMax) * histH}
                width={binW - 1} height={(v / hMax) * histH} fill={colB} opacity="0.55" />
        ))}
        <text x={PAD_L} y={H - 6} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          histogramy 1D projekcí tříd
        </text>
      </svg>

      <span className="viz-readout">
        oddělení tříd po projekci (Fisher) = <b style={{ color: mode === "lda" ? colA : colB }}>{fisher.toFixed(2)}</b>
        {" · "}{mode === "lda" ? "LDA: třídy se rozdělí" : "PCA: třídy splynou"}
      </span>
    </div>
  );
}
