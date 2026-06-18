// Value iteration on a small gridworld.
// "Krok" applies one Bellman optimality backup: cells recolor by V,
// arrows show the greedy policy and converge toward the goal.
import { useState, useMemo } from "react";

// 4x4 grid. Cell types: "free", "wall" (blocked), "goal" (+1), "pit" (-1).
const ROWS = 4, COLS = 4;
const GOAL = { r: 0, c: 3 };
const PIT = { r: 1, c: 3 };
const WALL = { r: 1, c: 1 };
const STEP_COST = -0.04; // small living penalty -> agent prefers short paths

const ACTIONS = [
  { dr: -1, dc: 0, name: "up" },
  { dr: 1, dc: 0, name: "down" },
  { dr: 0, dc: -1, name: "left" },
  { dr: 0, dc: 1, name: "right" },
];

const key = (r, c) => `${r},${c}`;
const isWall = (r, c) => r === WALL.r && c === WALL.c;
const isGoal = (r, c) => r === GOAL.r && c === GOAL.c;
const isPit = (r, c) => r === PIT.r && c === PIT.c;
const isTerminal = (r, c) => isGoal(r, c) || isPit(r, c);
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS && !isWall(r, c);

// Where you actually land if you try to move (dr,dc) from (r,c).
// Bumping a wall/edge keeps you in place.
function move(r, c, dr, dc) {
  const nr = r + dr, nc = c + dc;
  if (!inGrid(nr, nc)) return [r, c];
  return [nr, nc];
}

// Transition distribution for action a under given "slip" probability.
// With prob (1-slip): intended direction. With prob slip: split to the two
// perpendicular directions (stochastic environment, classic gridworld).
function transitions(r, c, a, slip) {
  const main = ACTIONS[a];
  const perp = main.dr === 0
    ? [ACTIONS[0], ACTIONS[1]]   // horizontal action -> slip up/down
    : [ACTIONS[2], ACTIONS[3]];  // vertical action -> slip left/right
  const out = [];
  out.push({ p: 1 - slip, to: move(r, c, main.dr, main.dc) });
  out.push({ p: slip / 2, to: move(r, c, perp[0].dr, perp[0].dc) });
  out.push({ p: slip / 2, to: move(r, c, perp[1].dr, perp[1].dc) });
  return out;
}

// Odměna R(s,a,s') se připisuje za PŘECHOD do stavu s' — tedy podle CÍLOVÉ
// buňky, do které agent vstoupí (stejná konvence jako Q-learning viz a jako
// definice R(s,a,s') v mdp.md). Proto buňka hned vedle cíle konverguje k V≈1.00:
// při kroku do cíle se inkasuje +1 a cíl je terminální (žádná další odměna).
function reward(r, c) {
  if (isGoal(r, c)) return 1;
  if (isPit(r, c)) return -1;
  return STEP_COST;
}

// One value-iteration sweep over all non-terminal, non-wall cells.
function backup(V, gamma, slip) {
  const next = { ...V };
  const policy = {};
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isWall(r, c)) continue;
      // V terminálního stavu je 0 — odměna se inkasuje při vstupu do něj, ne v něm.
      if (isTerminal(r, c)) { next[key(r, c)] = 0; continue; }
      let best = -Infinity, bestA = 0;
      for (let a = 0; a < ACTIONS.length; a++) {
        let q = 0;
        for (const { p, to } of transitions(r, c, a, slip)) {
          const tr = to[0], tc = to[1];
          // odměna cílové buňky + diskontovaná V(s'); za terminál se dál nepokračuje
          const future = isTerminal(tr, tc) ? 0 : V[key(tr, tc)];
          q += p * (reward(tr, tc) + gamma * future);
        }
        if (q > best) { best = q; bestA = a; }
      }
      next[key(r, c)] = best;
      policy[key(r, c)] = bestA;
    }
  }
  return { next, policy };
}

function freshV() {
  const V = {};
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      V[key(r, c)] = 0; // start na nule včetně terminálů (V terminálu = 0)
  return V;
}

export default function MdpGridworld() {
  const [gamma, setGamma] = useState(0.9);
  const [slip, setSlip] = useState(0); // 0 = deterministic, 0.2 = stochastic
  const [iter, setIter] = useState(0);

  // Recompute the value table from scratch up to `iter` sweeps so changing
  // gamma/slip immediately reflows everything.
  const { V, policy } = useMemo(() => {
    let v = freshV();
    let pol = {};
    for (let i = 0; i < iter; i++) {
      const res = backup(v, gamma, slip);
      v = res.next; pol = res.policy;
    }
    if (iter === 0) {
      // show greedy policy of the initial (all-zero) values too
      pol = backup(v, gamma, slip).policy;
    }
    return { V: v, policy: pol };
  }, [gamma, slip, iter]);

  const W = 300, H = 200;
  const pad = 8, cell = 44, gridW = COLS * cell, gridH = ROWS * cell;
  const ox = pad, oy = pad;

  // color: negative -> muted red-ish via inset, positive -> accent fill by magnitude
  const cellFill = (r, c) => {
    if (isWall(r, c)) return "var(--line-strong)";
    const v = V[key(r, c)];
    if (isGoal(r, c)) return "color-mix(in oklch, var(--accent) 75%, var(--bg-card))";
    if (isPit(r, c)) return "color-mix(in oklch, oklch(0.6 0.18 22) 65%, var(--bg-card))";
    const m = Math.max(0, Math.min(1, v)); // 0..1
    return `color-mix(in oklch, var(--accent) ${Math.round(m * 70)}%, var(--bg-inset))`;
  };

  const arrow = { up: "↑", down: "↓", left: "←", right: "→" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 420 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const x = ox + c * cell, y = oy + r * cell;
            const term = isTerminal(r, c);
            const wall = isWall(r, c);
            return (
              <g key={key(r, c)}>
                <rect x={x} y={y} width={cell - 2} height={cell - 2} rx="3"
                  fill={cellFill(r, c)}
                  stroke="var(--line-strong)" strokeWidth="1" />
                {!wall && !term && (
                  <text x={x + (cell - 2) / 2} y={y + 13} textAnchor="middle"
                    fontSize="9" fontFamily="var(--font-mono)"
                    fill="var(--text)">
                    {V[key(r, c)].toFixed(2)}
                  </text>
                )}
                {wall && (
                  <text x={x + (cell - 2) / 2} y={y + (cell - 2) / 2 + 3} textAnchor="middle"
                    fontSize="10" fill="var(--text-faint)">▦</text>
                )}
                {isGoal(r, c) && (
                  <text x={x + (cell - 2) / 2} y={y + 30} textAnchor="middle"
                    fontSize="13" fill="var(--bg-inset)" fontWeight="700">+1</text>
                )}
                {isPit(r, c) && (
                  <text x={x + (cell - 2) / 2} y={y + 30} textAnchor="middle"
                    fontSize="13" fill="var(--bg-inset)" fontWeight="700">−1</text>
                )}
                {!term && !wall && policy[key(r, c)] != null && (
                  <text x={x + (cell - 2) / 2} y={y + 33} textAnchor="middle"
                    fontSize="16" fontWeight="700" fill="var(--accent-line)">
                    {arrow[ACTIONS[policy[key(r, c)]].name]}
                  </text>
                )}
              </g>
            );
          })
        )}
        <text x={ox + gridW + 8} y={oy + 14} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          iterace
        </text>
        <text x={ox + gridW + 8} y={oy + 30} fontSize="18" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--accent)">
          {iter}
        </text>
        <text x={ox + gridW + 8} y={oy + 58} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">číslo = V(s)</text>
        <text x={ox + gridW + 8} y={oy + 72} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">šipka = greedy</text>
        <text x={ox + gridW + 8} y={oy + 86} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">▦ = zeď</text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={() => setIter((i) => i + 1)}>
          krok value iteration ▸
        </button>
        <button className="viz-btn" onClick={() => setIter(0)}>reset</button>
        <span className="viz-seg">
          <button className="viz-btn" data-active={slip === 0} onClick={() => setSlip(0)}>deterministické</button>
          <button className="viz-btn" data-active={slip === 0.2} onClick={() => setSlip(0.2)}>stochastické (20% slip)</button>
        </span>
      </div>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>γ =</span>
        <input type="range" className="viz-slider" min="0.1" max="0.99" step="0.01"
          value={gamma} onChange={(e) => setGamma(parseFloat(e.target.value))}
          style={{ flex: 1, minWidth: 120 }} />
        <span className="viz-readout">γ = {gamma.toFixed(2)}</span>
      </div>

      <span style={{ fontSize: 11.5, lineHeight: 1.6, color: "var(--text-muted)" }}>
        Každý krok aplikuje Bellmanův backup ve všech buňkách. Hodnota teče od cíle (+1);
        šipky greedy politiky se postupně srovnají k nejkratší bezpečné cestě. Vyšší γ
        prosvětlí i vzdálené buňky; slip přidá vyhýbání se propasti. Odměna se inkasuje
        při vstupu do buňky (konvence R(s,a,s')), proto buňka hned vedle cíle má V≈1,00 —
        stejně jako max Q ve viz Q-learningu.
      </span>
    </div>
  );
}
