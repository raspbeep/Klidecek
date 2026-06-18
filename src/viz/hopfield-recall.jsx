// Hopfield associative memory recall on a small pixel grid.
// Two patterns are stored via the Hebb rule. Corrupt pixels by clicking, then
// step the asynchronous update: one neuron at a time flips toward sgn(sum w_ij y_j).
// The energy readout falls monotonically and the grid converges to the nearest
// stored pattern.
import { useState, useMemo } from "react";

const SIZE = 5;          // 5x5 grid -> 25 neurons
const N = SIZE * SIZE;

// two stored patterns (+1 = filled, -1 = empty). A "T" and an "X".
const PATTERNS = {
  T: [
    1, 1, 1, 1, 1,
    -1, -1, 1, -1, -1,
    -1, -1, 1, -1, -1,
    -1, -1, 1, -1, -1,
    -1, -1, 1, -1, -1,
  ],
  X: [
    1, -1, -1, -1, 1,
    -1, 1, -1, 1, -1,
    -1, -1, 1, -1, -1,
    -1, 1, -1, 1, -1,
    1, -1, -1, -1, 1,
  ],
};

// Hebb weights from both patterns: w_ij = sum_p xi_i xi_j, w_ii = 0
function buildWeights() {
  const w = Array.from({ length: N }, () => new Array(N).fill(0));
  for (const key of Object.keys(PATTERNS)) {
    const p = PATTERNS[key];
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        if (i !== j) w[i][j] += p[i] * p[j];
  }
  return w;
}

function energy(state, w) {
  let e = 0;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) e += w[i][j] * state[i] * state[j];
  return -0.5 * e;
}

export default function HopfieldRecall() {
  const w = useMemo(buildWeights, []);
  const [stored, setStored] = useState("T");
  const [state, setState] = useState(() => [...PATTERNS["T"]]);
  const [order, setOrder] = useState([]);  // remaining indices to update this sweep

  const W = 300, H = 218;
  const cell = 30, gx = 18, gy = 18; // grid placement

  const reset = (key) => {
    setStored(key);
    setState([...PATTERNS[key]]);
    setOrder([]);
  };

  // flip a few random pixels to "damage" the input
  const corrupt = () => {
    const next = [...state];
    const k = 5;
    const picks = new Set();
    while (picks.size < k) picks.add(Math.floor(Math.random() * N));
    picks.forEach((i) => (next[i] = -next[i]));
    setState(next);
    setOrder([]);
  };

  // toggle a single pixel by click
  const toggle = (i) => {
    const next = [...state];
    next[i] = -next[i];
    setState(next);
    setOrder([]);
  };

  // one asynchronous update step: pick next neuron, set y_i = sgn(sum_j w_ij y_j)
  const step = () => {
    let queue = order;
    if (queue.length === 0) {
      // new sweep in random order
      queue = [...Array(N).keys()].sort(() => Math.random() - 0.5);
    }
    const i = queue[0];
    const rest = queue.slice(1);
    let net = 0;
    for (let j = 0; j < N; j++) net += w[i][j] * state[j];
    const ny = net >= 0 ? 1 : -1;
    if (ny !== state[i]) {
      const next = [...state];
      next[i] = ny;
      setState(next);
    }
    setOrder(rest);
  };

  // run a full sweep (settle quickly)
  const settle = () => {
    let cur = [...state];
    for (let pass = 0; pass < 6; pass++) {
      const ord = [...Array(N).keys()].sort(() => Math.random() - 0.5);
      let changed = false;
      for (const i of ord) {
        let net = 0;
        for (let j = 0; j < N; j++) net += w[i][j] * cur[j];
        const ny = net >= 0 ? 1 : -1;
        if (ny !== cur[i]) { cur[i] = ny; changed = true; }
      }
      if (!changed) break;
    }
    setState(cur);
    setOrder([]);
  };

  const E = energy(state, w);
  const target = PATTERNS[stored];
  const wrong = state.reduce((acc, s, i) => acc + (s !== target[i] ? 1 : 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 420 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {state.map((s, i) => {
          const r = Math.floor(i / SIZE), c = i % SIZE;
          const matches = s === target[i];
          return (
            <rect key={i}
              x={gx + c * cell} y={gy + r * cell}
              width={cell - 2} height={cell - 2} rx="3"
              fill={s === 1 ? "var(--accent)" : "var(--bg-card)"}
              stroke={matches ? "var(--line)" : "var(--accent-line)"}
              strokeWidth={matches ? 0.8 : 2}
              onClick={() => toggle(i)} style={{ cursor: "pointer" }} />
          );
        })}
        <text x={gx} y={H - 26} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          klikni na pixel = přepni (poškoď vstup)
        </text>
        <text x={gx} y={H - 12} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          červený okraj = pixel se liší od uloženého vzoru
        </text>
        {/* energy bar */}
        <text x={W - 12} y={28} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)">
          E = {E.toFixed(0)}
        </text>
        <text x={W - 12} y={44} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          chybných: {wrong}/{N}
        </text>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>uložený vzor:</span>
        {Object.keys(PATTERNS).map((k) => (
          <button key={k} className="viz-btn" data-active={stored === k} onClick={() => reset(k)}>
            {k}
          </button>
        ))}
        <button className="viz-btn" onClick={corrupt}>poškoď</button>
        <button className="viz-btn" onClick={step}>krok</button>
        <button className="viz-btn primary" onClick={settle}>doustal</button>
        <button className="viz-btn" onClick={() => reset(stored)}>reset</button>
      </div>

      <span className="viz-readout">
        {wrong === 0
          ? "konvergováno na uložený vzor (E v minimu, 0 chybných pixelů)"
          : "krokuj — síť asynchronně překlápí neurony na sgn(Σ wᵢⱼyⱼ); E nikdy neroste"}
      </span>
    </div>
  );
}
