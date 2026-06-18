// Perceptron learning on 2D toy data.
// "krok" picks the next misclassified point and applies one perceptron update
// w <- w + t*x, b <- b + t (here t in {+1,-1}); the decision line rotates and
// converges on this linearly separable set. "reset" restores the start state.
import { useState } from "react";

export default function PerceptronLearn() {
  // two linearly separable classes (+1 = blue top/right, -1 = red bottom/left),
  // interleaved with a small margin so several updates are needed to converge.
  const data = [
    { x: [0.6, 2.4], t: 1 },
    { x: [1.8, 1.6], t: 1 },
    { x: [2.4, 2.6], t: 1 },
    { x: [1.2, 3.0], t: 1 },
    { x: [2.8, 1.2], t: 1 },
    { x: [0.9, 1.2], t: 1 },
    { x: [-0.8, -1.4], t: -1 },
    { x: [-1.8, -0.6], t: -1 },
    { x: [-2.4, -1.8], t: -1 },
    { x: [-1.0, -2.6], t: -1 },
    { x: [-2.8, -0.4], t: -1 },
    { x: [-0.6, -0.9], t: -1 },
  ];

  // start from a deliberately wrong weight so the demo has work to do
  // (this start needs 4 perceptron updates to separate the set)
  const start = { w: [-3.0, -3.0], b: 0.5, mistakes: 0 };
  const [st, setSt] = useState(start);

  const W = 280, H = 200;
  // feature space [-4,4] -> pixels
  const pad = 16;
  const sx = (vx) => pad + ((vx + 4) / 8) * (W - 2 * pad);
  const sy = (vy) => H - pad - ((vy + 4) / 8) * (H - 2 * pad);

  const g = (p) => st.w[0] * p[0] + st.w[1] * p[1] + st.b; // discriminant
  const pred = (p) => (g(p) >= 0 ? 1 : -1);

  // find first misclassified point (cycling through the set)
  const wrongIdx = data.findIndex((d) => pred(d.x) !== d.t);
  const allOk = wrongIdx === -1;

  const step = () => {
    if (allOk) return;
    const d = data[wrongIdx];
    // perceptron update: move boundary toward correct side
    setSt((s) => ({
      w: [s.w[0] + d.t * d.x[0], s.w[1] + d.t * d.x[1]],
      b: s.b + d.t,
      mistakes: s.mistakes + 1,
    }));
  };

  // decision line w0*x + w1*y + b = 0  ->  draw across the viewBox
  // pick two x-values, solve for y (guard near-vertical lines)
  let linePts = null;
  if (Math.abs(st.w[1]) > 1e-6) {
    const yAt = (vx) => -(st.w[0] * vx + st.b) / st.w[1];
    linePts = [[-4, yAt(-4)], [4, yAt(4)]];
  } else if (Math.abs(st.w[0]) > 1e-6) {
    const xAt = -st.b / st.w[0];
    linePts = [[xAt, -4], [xAt, 4]];
  }

  const blue = "oklch(0.6 0.16 250)";
  const red = "oklch(0.6 0.18 25)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes through origin */}
        <line x1={sx(-4)} y1={sy(0)} x2={sx(4)} y2={sy(0)} stroke="var(--line)" strokeWidth="0.5" />
        <line x1={sx(0)} y1={sy(-4)} x2={sx(0)} y2={sy(4)} stroke="var(--line)" strokeWidth="0.5" />

        {/* decision line */}
        {linePts && (
          <line
            x1={sx(linePts[0][0])} y1={sy(linePts[0][1])}
            x2={sx(linePts[1][0])} y2={sy(linePts[1][1])}
            stroke="var(--accent)" strokeWidth="2"
          />
        )}

        {/* data points; ring the currently-targeted misclassified point */}
        {data.map((d, i) => {
          const ok = pred(d.x) === d.t;
          return (
            <g key={i}>
              {i === wrongIdx && (
                <circle cx={sx(d.x[0])} cy={sy(d.x[1])} r="8.5" fill="none"
                  stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" />
              )}
              <circle cx={sx(d.x[0])} cy={sy(d.x[1])} r="4.5"
                fill={d.t === 1 ? blue : red}
                stroke={ok ? "none" : "var(--text)"} strokeWidth={ok ? 0 : 1.2} />
            </g>
          );
        })}

        <text x={8} y={14} fontSize="9.5" fontFamily="var(--font-mono)" fill={blue}>● třída +1</text>
        <text x={8} y={26} fontSize="9.5" fontFamily="var(--font-mono)" fill={red}>● třída −1</text>
        <text x={W - 8} y={H - 8} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {allOk ? "vše správně — konvergováno" : "kroužek = příští oprava"}
        </text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={step} disabled={allOk}>
          krok učení
        </button>
        <button className="viz-btn" onClick={() => setSt(start)}>reset</button>
      </div>

      <span className="viz-readout">
        w = [{st.w[0].toFixed(2)}, {st.w[1].toFixed(2)}] · b = {st.b.toFixed(2)} · oprav: {st.mistakes}
        {allOk ? " · hotovo ✓" : " · zbývá chybně klasifikovaný bod"}
      </span>
    </div>
  );
}
