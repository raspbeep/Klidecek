// Gibbs sampling on a 2D correlated Gaussian.
// Step the sampler: it alternates x|y (horizontal move) and y|x (vertical move) —
// the rectangular "staircase" path. Samples accumulate and trace out the density.
// Crank up correlation rho: steps shrink and the chain crawls (high autocorrelation).
import { useState, useRef } from "react";

const W = 300, H = 230;
// data coords: x,y in [-3.4, 3.4]; both unit variance, correlation rho
const LO = -3.4, HI = 3.4;
const PAD = 18;
const toPx = (x) => PAD + ((x - LO) / (HI - LO)) * (W - 2 * PAD);
const toPy = (y) => (H - PAD) - ((y - LO) / (HI - LO)) * (H - 2 * PAD);

// standard normal sampler (Box–Muller)
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export default function GibbsSampling() {
  const [rho, setRho] = useState(0.5);
  const [pts, setPts] = useState([]);          // accumulated kept points {x,y}
  const [cur, setCur] = useState({ x: -2.6, y: 2.6 });
  const [seg, setSeg] = useState([]);          // recent path segments [{x1,y1,x2,y2,axis}]
  const [phase, setPhase] = useState("x");     // which coord updates next
  const rhoRef = useRef(rho);
  rhoRef.current = rho;

  // one Gibbs half-step
  const step = () => {
    const r = rhoRef.current;
    const sd = Math.sqrt(1 - r * r);
    setCur((c) => {
      let nx = c.x, ny = c.y, axis;
      if (phase === "x") { nx = r * c.y + sd * randn(); axis = "x"; }
      else { ny = r * c.x + sd * randn(); axis = "y"; }
      const nc = { x: nx, y: ny };
      setSeg((s) => [...s.slice(-9), { x1: c.x, y1: c.y, x2: nx, y2: ny, axis }]);
      // a full sample = after a y-update (both coords fresh)
      if (phase === "y") setPts((p) => [...p.slice(-260), nc]);
      return nc;
    });
    setPhase((p) => (p === "x" ? "y" : "x"));
  };

  const stepN = (n) => { for (let i = 0; i < n; i++) step(); };

  const reset = () => {
    setPts([]); setSeg([]); setPhase("x");
    setCur({ x: -2.6 + 0.3 * randn(), y: 2.6 + 0.3 * randn() });
  };

  // density contour ellipses for the chosen rho (eigen-axes of [[1,rho],[rho,1]]
  // are the 45°/135° diagonals; eigenvalues 1+rho and 1-rho)
  const ang = -45; // major axis along y=x for rho>0
  const a = Math.sqrt(1 + rho), b = Math.sqrt(Math.max(0.02, 1 - rho));
  // scale data->pixel (isotropic since x,y share range)
  const sxPx = (W - 2 * PAD) / (HI - LO);
  const ellipses = [1, 2].map((k) => ({
    rx: a * k * sxPx, ry: b * k * sxPx, k,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 420 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <line x1={toPx(LO)} y1={toPy(0)} x2={toPx(HI)} y2={toPy(0)} stroke="var(--line)" strokeWidth="0.5" />
        <line x1={toPx(0)} y1={toPy(LO)} x2={toPx(0)} y2={toPy(HI)} stroke="var(--line)" strokeWidth="0.5" />
        {/* density contours */}
        {ellipses.map((e) => (
          <ellipse key={e.k} cx={toPx(0)} cy={toPy(0)} rx={e.rx} ry={e.ry}
            transform={`rotate(${ang} ${toPx(0)} ${toPy(0)})`}
            fill="none" stroke="var(--line-strong)" strokeWidth="0.8" opacity={0.55 - e.k * 0.12} />
        ))}
        {/* accumulated samples */}
        {pts.map((p, i) => (
          <circle key={i} cx={toPx(p.x)} cy={toPy(p.y)} r="1.5"
            fill="var(--accent)" opacity={0.18 + 0.5 * (i / Math.max(1, pts.length))} />
        ))}
        {/* recent path segments (right-angle staircase) */}
        {seg.map((s, i) => (
          <line key={i} x1={toPx(s.x1)} y1={toPy(s.y1)} x2={toPx(s.x2)} y2={toPy(s.y2)}
            stroke={s.axis === "x" ? "oklch(0.7 0.18 60)" : "var(--accent)"}
            strokeWidth="1" opacity={0.25 + 0.55 * (i / Math.max(1, seg.length))} />
        ))}
        {/* current point */}
        <circle cx={toPx(cur.x)} cy={toPy(cur.y)} r="4" fill="var(--accent)" stroke="var(--bg-inset)" strokeWidth="1" />
        {/* legend */}
        <text x={toPx(LO) + 2} y={14} fontSize="8.5" fontFamily="var(--font-mono)" fill="oklch(0.7 0.18 60)">— krok x|y (vodorovně)</text>
        <text x={toPx(LO) + 2} y={25} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--accent)">— krok y|x (svisle)</text>
        <text x={toPx(HI)} y={toPy(0) - 3} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">x</text>
        <text x={toPx(0) + 4} y={toPy(HI) + 9} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">y</text>
      </svg>

      <div className="viz-controls" style={{ flexWrap: "wrap" }}>
        <button className="viz-btn primary" onClick={() => step()}>+1 půlkrok</button>
        <button className="viz-btn" onClick={() => stepN(10)}>+10</button>
        <button className="viz-btn" onClick={() => stepN(200)}>+200</button>
        <button className="viz-btn" onClick={reset}>reset</button>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
          ρ (korelace)
          <input type="range" className="viz-slider" min={-0.95} max={0.95} step={0.05}
            value={rho} onChange={(e) => setRho(+e.target.value)} />
        </label>
      </div>

      <span className="viz-readout">
        ρ={rho.toFixed(2)} · vzorků={pts.length} · další krok: {phase === "x" ? "x | y (vodorovně)" : "y | x (svisle)"} · σ_podm=√(1−ρ²)={Math.sqrt(1 - rho * rho).toFixed(2)}
      </span>
      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.5 }}>
        Každý krok mění jen jednu souřadnici → pravoúhlá „schodišťová" trajektorie. Body postupně obkreslí elipsy hustoty. Vytáhni ρ k ±0.9: kroky se zkrátí, sampler se plíží = silná autokorelace.
      </div>
    </div>
  );
}
