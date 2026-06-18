// Particle Swarm Optimization on a 2D fitness landscape.
// Step through generations: each particle's velocity = inertia*v + cognitive
// pull to its pbest + social pull to the global gbest. Particles converge on
// the optimum. Slider tunes inertia w (exploration vs. exploitation).
import { useState, useMemo } from "react";

const W = 290, H = 200;
// domain: x,y in [0,10]; optimum (the "valley") at (7, 3)
const OPT = { x: 7, y: 3 };

// fitness to MINIMIZE: distance-squared to optimum (a simple bowl)
function f(x, y) {
  return (x - OPT.x) ** 2 + (y - OPT.y) ** 2;
}

const toPx = (x) => 10 + (x / 10) * (W - 20);
const toPy = (y) => 10 + (y / 10) * (H - 20);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NP = 9;          // number of particles
const CP = 1.5, CG = 1.5; // cognitive / social coefficients

// run the swarm for `steps` generations with inertia w, return particle states
function simulate(steps, w) {
  const rnd = mulberry32(777);
  // init: random positions, zero velocity
  const P = [];
  for (let i = 0; i < NP; i++) {
    const x = 0.5 + rnd() * 4;          // start clustered in the far corner
    const y = 5 + rnd() * 4.5;
    P.push({ x, y, vx: 0, vy: 0, px: x, py: y, pf: f(x, y) });
  }
  let g = P.reduce((b, p) => (p.pf < b.pf ? p : b));
  let gx = g.px, gy = g.py, gf = g.pf;

  for (let t = 0; t < steps; t++) {
    for (const p of P) {
      const rp = rnd(), rg = rnd();
      p.vx = w * p.vx + CP * rp * (p.px - p.x) + CG * rg * (gx - p.x);
      p.vy = w * p.vy + CP * rp * (p.py - p.y) + CG * rg * (gy - p.y);
      // clamp velocity so particles don't explode off the map
      const vmax = 2.5;
      p.vx = Math.max(-vmax, Math.min(vmax, p.vx));
      p.vy = Math.max(-vmax, Math.min(vmax, p.vy));
      p.x = Math.max(0, Math.min(10, p.x + p.vx));
      p.y = Math.max(0, Math.min(10, p.y + p.vy));
      const fit = f(p.x, p.y);
      if (fit < p.pf) { p.pf = fit; p.px = p.x; p.py = p.y; }   // update pbest
    }
    for (const p of P) if (p.pf < gf) { gf = p.pf; gx = p.px; gy = p.py; } // update gbest
  }
  return { P, gx, gy, gf };
}

// static contour rings around the optimum (cosmetic isolines)
const RINGS = [1.2, 2.4, 3.6, 4.8];

export default function PsoSwarm() {
  const [step, setStep] = useState(0);
  const [w, setW] = useState(0.7);

  const { P, gx, gy, gf } = useMemo(() => simulate(step, w), [step, w]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 440 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* contour rings (the "valley" of the fitness landscape) */}
        {RINGS.map((r, i) => (
          <ellipse key={i} cx={toPx(OPT.x)} cy={toPy(OPT.y)}
            rx={(r / 10) * (W - 20)} ry={(r / 10) * (H - 20)}
            fill="none" stroke="var(--accent-line)" strokeWidth="0.7"
            opacity={0.5 - i * 0.08} />
        ))}
        {/* optimum marker */}
        <circle cx={toPx(OPT.x)} cy={toPy(OPT.y)} r="3" fill="none"
          stroke="var(--accent)" strokeWidth="1.2" />
        <text x={toPx(OPT.x) + 6} y={toPy(OPT.y) + 3} fontSize="8.5"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">optimum</text>

        {/* velocity hints + particles */}
        {P.map((p, i) => {
          const cx = toPx(p.x), cy = toPy(p.y);
          const ex = toPx(Math.max(0, Math.min(10, p.x + p.vx)));
          const ey = toPy(Math.max(0, Math.min(10, p.y + p.vy)));
          return (
            <g key={i}>
              {step > 0 && (Math.abs(p.vx) + Math.abs(p.vy) > 0.05) && (
                <line x1={cx} y1={cy} x2={ex} y2={ey}
                  stroke="var(--text-muted)" strokeWidth="0.7" opacity="0.55" />
              )}
              <circle cx={cx} cy={cy} r="3.4" fill="var(--accent)" opacity="0.85" />
            </g>
          );
        })}
        {/* gbest marker */}
        <circle cx={toPx(gx)} cy={toPy(gy)} r="2.2" fill="var(--text)" />
        <text x={8} y={H - 8} fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          tečky = částice · linka = rychlost v · střed = optimum
        </text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          − krok
        </button>
        <button className="viz-btn primary" onClick={() => setStep((s) => Math.min(40, s + 1))}>
          + krok
        </button>
        <button className="viz-btn" onClick={() => setStep(0)} disabled={step === 0}>
          reset
        </button>
        <span className="viz-readout">krok {step} · gbest fitness = {gf.toFixed(2)}</span>
      </div>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>setrvačnost w:</span>
        <input type="range" className="viz-slider" min={0} max={1.2} step={0.05} value={w}
          onChange={(e) => setW(+e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        <span className="viz-readout">{w.toFixed(2)}</span>
      </div>

      <div style={{ fontSize: 11, lineHeight: 1.6, color: "var(--text-muted)" }}>
        {w >= 0.9
          ? "Vysoká setrvačnost: částice si dlouho drží směr, „přestřelují“ optimum a víc prozkoumávají (exploration)."
          : "Nízká setrvačnost: částice rychle podléhají tahu k pbest/gbest a sbíhají se k optimu (exploitation)."}
      </div>
    </div>
  );
}
