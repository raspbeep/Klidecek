// LBF vs RBF response over a 2D input space.
// Toggle the neuron type: LBF colours the plane by which side of a hyperplane
// (here a line) the input lies on -> GLOBAL response; RBF colours by distance
// from a centre -> LOCAL Gaussian bump. The slider tilts the LBF line / moves
// the RBF centre, so the coloured field visibly changes.
import { useState } from "react";

export default function LbfRbfResponse() {
  const W = 320, H = 190;
  const x0 = 16, y0 = 16;            // top-left of the field
  const fieldW = W - 32, fieldH = H - 50;
  const G = 22;                      // grid resolution (cells per axis)

  const [mode, setMode] = useState("LBF");
  // single shared slider that means something in each mode:
  //  - LBF: orientation (angle) of the dividing line
  //  - RBF: horizontal position of the centre
  const [knob, setKnob] = useState(0.5);

  // map grid cell -> input coordinates in [0,1]^2
  const sigma = 0.18;               // RBF width

  // LBF: weighted sum w·x + b run through a sigmoid -> activation in (0,1)
  const angle = (knob - 0.5) * Math.PI;          // -90°..+90°
  const wx = Math.cos(angle), wy = Math.sin(angle);
  const sig = (z) => 1 / (1 + Math.exp(-z));
  const lbf = (ux, uy) => sig(8 * (wx * (ux - 0.5) + wy * (uy - 0.5)));

  // RBF: Gaussian bump centred at (cx, cy)
  const cx = knob, cy = 0.5;
  const rbf = (ux, uy) =>
    Math.exp(-(((ux - cx) ** 2) + ((uy - cy) ** 2)) / (2 * sigma * sigma));

  const act = (ux, uy) => (mode === "LBF" ? lbf(ux, uy) : rbf(ux, uy));

  // build the heat grid
  const cellW = fieldW / G, cellH = fieldH / G;
  const cells = [];
  for (let gy = 0; gy < G; gy++) {
    for (let gx = 0; gx < G; gx++) {
      const ux = (gx + 0.5) / G;
      const uy = (gy + 0.5) / G;
      const a = act(ux, uy);                    // 0..1
      cells.push({
        x: x0 + gx * cellW,
        y: y0 + gy * cellH,
        a,
      });
    }
  }

  // toX/toY for overlay markers (line / centre) in field coords
  const fx = (u) => x0 + u * fieldW;
  const fy = (u) => y0 + u * fieldH;

  // LBF dividing line: w·(x-0.5)=0 -> passes through centre, normal (wx,wy).
  // direction along the line is perpendicular to the normal: (-wy, wx)
  const midX = 0.5, midY = 0.5, L = 0.8;
  const lx1 = midX - wy * L, ly1 = midY + wx * L;
  const lx2 = midX + wy * L, ly2 = midY - wx * L;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* heat field: opacity of accent encodes activation 0..1 */}
        {cells.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={cellW + 0.6} height={cellH + 0.6}
            fill="var(--accent)" opacity={(0.08 + 0.88 * c.a).toFixed(3)} />
        ))}
        {/* field border */}
        <rect x={x0} y={y0} width={fieldW} height={fieldH}
          fill="none" stroke="var(--line-strong)" strokeWidth="1" />

        {mode === "LBF" ? (
          // dividing hyperplane (line) — the response flips sides here
          <line x1={fx(lx1)} y1={fy(ly1)} x2={fx(lx2)} y2={fy(ly2)}
            stroke="var(--text)" strokeWidth="1.6" strokeDasharray="4 3" />
        ) : (
          // centre marker — bump is brightest right here
          <g>
            <circle cx={fx(cx)} cy={fy(cy)} r="4" fill="var(--bg-card)"
              stroke="var(--text)" strokeWidth="1.6" />
            <text x={fx(cx)} y={fy(cy) - 7} textAnchor="middle" fontSize="8"
              fontFamily="var(--font-mono)" fill="var(--text)">c</text>
          </g>
        )}

        <text x={x0} y={H - 8} fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {mode === "LBF"
            ? "LBF: globální — nadrovina dělí prostor na 2 poloroviny"
            : "RBF: lokální — Gaussův kopeček svítí jen kolem centra c"}
        </text>
        <text x={W - 16} y={y0 + 11} textAnchor="end" fontSize="8.5"
          fontFamily="var(--font-mono)" fill="var(--text-muted)">jasné = aktivace ~1</text>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>typ neuronu:</span>
        {["LBF", "RBF"].map((m) => (
          <button key={m} className="viz-btn" data-active={mode === m} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <span style={{ width: 150 }}>
          {mode === "LBF"
            ? `sklon nadroviny = ${((knob - 0.5) * 180).toFixed(0)}°`
            : `centrum cₓ = ${knob.toFixed(2)}`}
        </span>
        <input type="range" className="viz-slider" min={0} max={1} step={0.01}
          value={knob} onChange={(e) => setKnob(+e.target.value)} style={{ flex: 1 }} />
      </label>

      <span className="viz-readout">
        {mode === "LBF"
          ? "LBF reaguje (skoro) všude — daleko od hranice dá sigmoida pořád ~0 nebo ~1"
          : "RBF reaguje jen lokálně — dál od centra padá výstup k 0, jinde neuron mlčí"}
      </span>
    </div>
  );
}
