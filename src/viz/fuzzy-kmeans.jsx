// Fuzzy c-means on 2D points, 2 clusters. Each point's color blends between the
// two cluster colors by its fuzzy membership (mixed color = belongs to both /
// on the border). Step through iterations: update memberships, then move each
// center to the membership-weighted mean of all points.
import { useState } from "react";

export default function FuzzyKmeans() {
  // fixed toy data: two blobs with a couple of border points between them
  const pts = [
    [55, 60], [70, 48], [62, 80], [48, 72], [80, 66], [66, 64],
    [205, 70], [220, 58], [212, 92], [232, 80], [196, 84], [224, 74],
    [128, 70], [140, 92], [118, 100], // border-ish points in the middle
  ];
  const m = 2; // fuzziness exponent
  const initCenters = [[90, 120], [180, 120]]; // both start low so the move is visible

  // run FCM for `step` full iterations starting from initCenters
  function membership(centers, p) {
    const d = centers.map((c) => Math.hypot(p[0] - c[0], p[1] - c[1]) + 1e-6);
    const inv = d.map((dk) => Math.pow(1 / dk, 2 / (m - 1)));
    const s = inv[0] + inv[1];
    return [inv[0] / s, inv[1] / s];
  }
  function updateCenters(centers) {
    const us = pts.map((p) => membership(centers, p));
    return [0, 1].map((k) => {
      let nx = 0, ny = 0, den = 0;
      pts.forEach((p, i) => { const w = Math.pow(us[i][k], m); nx += w * p[0]; ny += w * p[1]; den += w; });
      return [nx / den, ny / den];
    });
  }

  const maxStep = 8;
  const [step, setStep] = useState(0);
  let centers = initCenters.map((c) => [...c]);
  for (let i = 0; i < step; i++) centers = updateCenters(centers);
  const us = pts.map((p) => membership(centers, p));

  // colors for the two clusters
  const A = [98, 0.14, 250]; // L,C,H  blue
  const B = [70, 0.16, 30];  // orange
  const colA = "oklch(0.62 0.14 250)";
  const colB = "oklch(0.65 0.16 30)";
  // blend per-point by membership to A
  const pointColor = (uA) => `color-mix(in oklch, ${colA} ${(uA * 100).toFixed(0)}%, ${colB})`;

  const W = 300, H = 180;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* points colored by fuzzy membership blend */}
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="5"
            fill={pointColor(us[i][0])} stroke="var(--line-strong)" strokeWidth="0.5" />
        ))}
        {/* cluster centers */}
        {centers.map((c, k) => (
          <g key={"c" + k}>
            <line x1={c[0] - 6} y1={c[1]} x2={c[0] + 6} y2={c[1]} stroke={k === 0 ? colA : colB} strokeWidth="2" />
            <line x1={c[0]} y1={c[1] - 6} x2={c[0]} y2={c[1] + 6} stroke={k === 0 ? colA : colB} strokeWidth="2" />
            <circle cx={c[0]} cy={c[1]} r="9" fill="none" stroke={k === 0 ? colA : colB} strokeWidth="1.4" />
          </g>
        ))}
        {/* legend */}
        <text x={8} y={14} fontSize="8.5" fontFamily="var(--font-mono)" fill={colA}>● shluk A</text>
        <text x={W - 8} y={14} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill={colB}>shluk B ●</text>
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">smíšená barva = bod na pomezí (patří do obou)</text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>‹ zpět</button>
        <span className="viz-readout">iterace {step} / {maxStep}</span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(maxStep, step + 1))} disabled={step === maxStep}>krok ›</button>
        <button className="viz-btn" onClick={() => setStep(0)} disabled={step === 0}>reset</button>
      </div>

      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
        každý krok: přepočítej příslušnosti u<sub>ij</sub> → posuň centra do váženého průměru (váha = u<sup>m</sup>)
      </span>
    </div>
  );
}
