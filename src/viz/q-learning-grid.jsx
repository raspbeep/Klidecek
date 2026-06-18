// Q-learning on a small gridworld.
// Each "krok" = one environment step: agent picks an action ε-greedy,
// the environment returns (r, s'), and we apply the TD update to Q(s,a).
// Cells recolor by max_a Q(s,a); arrows show the current best action.
import { useState, useRef, useCallback } from "react";

const ROWS = 3, COLS = 4;
const GOAL = { r: 0, c: 3 };
const PIT = { r: 1, c: 3 };
const WALL = { r: 1, c: 1 };
const START = { r: 2, c: 0 };
const STEP_COST = -0.04;

const ACTIONS = [
  { dr: -1, dc: 0, glyph: "↑" },
  { dr: 1, dc: 0, glyph: "↓" },
  { dr: 0, dc: -1, glyph: "←" },
  { dr: 0, dc: 1, glyph: "→" },
];
const NA = ACTIONS.length;

const key = (r, c) => `${r},${c}`;
const isWall = (r, c) => r === WALL.r && c === WALL.c;
const isGoal = (r, c) => r === GOAL.r && c === GOAL.c;
const isPit = (r, c) => r === PIT.r && c === PIT.c;
const isTerminal = (r, c) => isGoal(r, c) || isPit(r, c);
const inGrid = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS && !isWall(r, c);

function step(r, c, a) {
  const nr = r + ACTIONS[a].dr, nc = c + ACTIONS[a].dc;
  if (!inGrid(nr, nc)) return [r, c]; // bump -> stay
  return [nr, nc];
}
function reward(r, c) {
  if (isGoal(r, c)) return 1;
  if (isPit(r, c)) return -1;
  return STEP_COST;
}

function freshQ() {
  const Q = {};
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!isWall(r, c)) Q[key(r, c)] = new Array(NA).fill(0);
  return Q;
}

function argmax(arr) {
  let bi = 0, bv = arr[0];
  for (let i = 1; i < arr.length; i++) if (arr[i] > bv) { bv = arr[i]; bi = i; }
  return bi;
}

export default function QLearningGrid() {
  const [eps, setEps] = useState(0.2);
  const [alpha, setAlpha] = useState(0.5);
  const [gamma, setGamma] = useState(0.9);
  // version counter just to force re-render; the heavy state lives in refs so
  // it persists across steps (Q is genuinely learned over time).
  const [, bump] = useState(0);
  const Q = useRef(freshQ());
  const pos = useRef({ ...START });
  const stats = useRef({ steps: 0, episodes: 0, lastTD: 0, lastA: null });

  const reset = useCallback(() => {
    Q.current = freshQ();
    pos.current = { ...START };
    stats.current = { steps: 0, episodes: 0, lastTD: 0, lastA: null };
    bump((x) => x + 1);
  }, []);

  // One TD update + move, mutating refs in place (no per-step re-render).
  const stepInner = useCallback(() => {
    let { r, c } = pos.current;
    if (isTerminal(r, c)) { r = START.r; c = START.c; } // start a fresh episode
    const q = Q.current;
    const a = Math.random() < eps ? Math.floor(Math.random() * NA) : argmax(q[key(r, c)]);
    const [nr, nc] = step(r, c, a);
    const rew = reward(nr, nc);
    const future = isTerminal(nr, nc) ? 0 : Math.max(...q[key(nr, nc)]);
    const td = rew + gamma * future - q[key(r, c)][a];
    q[key(r, c)][a] += alpha * td;
    stats.current.steps += 1;
    stats.current.lastTD = td;
    stats.current.lastA = a;
    if (isTerminal(nr, nc)) stats.current.episodes += 1;
    pos.current = { r: nr, c: nc };
  }, [eps, alpha, gamma]);

  const doStep = useCallback(() => {
    stepInner();
    bump((x) => x + 1);
  }, [stepInner]);

  const runEpisode = useCallback(() => {
    // walk until we reach a terminal state (cap at 60 steps as a safety net)
    for (let i = 0; i < 60; i++) {
      stepInner();
      if (isTerminal(pos.current.r, pos.current.c)) break;
    }
    bump((x) => x + 1);
  }, [stepInner]);

  const q = Q.current;
  const W = 300, H = 175;
  const cell = 42, ox = 8, oy = 8, gridW = COLS * cell;

  const cellFill = (r, c) => {
    if (isWall(r, c)) return "var(--line-strong)";
    if (isGoal(r, c)) return "color-mix(in oklch, var(--accent) 75%, var(--bg-card))";
    if (isPit(r, c)) return "color-mix(in oklch, oklch(0.6 0.18 22) 65%, var(--bg-card))";
    const v = Math.max(...q[key(r, c)]);
    const m = Math.max(0, Math.min(1, v));
    return `color-mix(in oklch, var(--accent) ${Math.round(m * 70)}%, var(--bg-inset))`;
  };

  const here = pos.current;
  const aGlyph = stats.current.lastA != null ? ACTIONS[stats.current.lastA].glyph : "–";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 420 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const x = ox + c * cell, y = oy + r * cell;
            const wall = isWall(r, c), term = isTerminal(r, c);
            const maxQ = wall ? 0 : Math.max(...q[key(r, c)]);
            const bestA = wall ? 0 : argmax(q[key(r, c)]);
            return (
              <g key={key(r, c)}>
                <rect x={x} y={y} width={cell - 2} height={cell - 2} rx="3"
                  fill={cellFill(r, c)} stroke="var(--line-strong)" strokeWidth="1" />
                {!wall && (
                  <text x={x + (cell - 2) / 2} y={y + 12} textAnchor="middle"
                    fontSize="9" fontFamily="var(--font-mono)"
                    fill={isPit(r, c) ? "var(--bg-inset)" : "var(--text)"}>
                    {maxQ.toFixed(2)}
                  </text>
                )}
                {wall && <text x={x + 20} y={y + 24} textAnchor="middle" fontSize="10" fill="var(--text-faint)">▦</text>}
                {isGoal(r, c) && <text x={x + 20} y={y + 30} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--bg-inset)">+1</text>}
                {isPit(r, c) && <text x={x + 20} y={y + 30} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--bg-inset)">−1</text>}
                {!wall && !term && (
                  <text x={x + (cell - 2) / 2} y={y + 32} textAnchor="middle"
                    fontSize="15" fontWeight="700" fill="var(--accent-line)">
                    {ACTIONS[bestA].glyph}
                  </text>
                )}
                {/* agent marker */}
                {here.r === r && here.c === c && (
                  <circle cx={x + (cell - 2) / 2} cy={y + (cell - 2) / 2} r="7"
                    fill="none" stroke="var(--text)" strokeWidth="2" />
                )}
              </g>
            );
          })
        )}
        <text x={ox + gridW + 8} y={oy + 14} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">číslo</text>
        <text x={ox + gridW + 8} y={oy + 26} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">= max Q</text>
        <text x={ox + gridW + 8} y={oy + 44} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">šipka =</text>
        <text x={ox + gridW + 8} y={oy + 56} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">best akce</text>
        <text x={ox + gridW + 8} y={oy + 74} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">○ = agent</text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={doStep}>krok (1 TD update) ▸</button>
        <button className="viz-btn" onClick={runEpisode}>epizoda ▸▸</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>ε =</span>
        <input type="range" className="viz-slider" min="0" max="0.8" step="0.05" value={eps}
          onChange={(e) => setEps(parseFloat(e.target.value))} style={{ width: 70 }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>α =</span>
        <input type="range" className="viz-slider" min="0.05" max="1" step="0.05" value={alpha}
          onChange={(e) => setAlpha(parseFloat(e.target.value))} style={{ width: 70 }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>γ =</span>
        <input type="range" className="viz-slider" min="0.5" max="0.99" step="0.01" value={gamma}
          onChange={(e) => setGamma(parseFloat(e.target.value))} style={{ width: 70 }} />
      </div>

      <span className="viz-readout">
        ε={eps.toFixed(2)} · α={alpha.toFixed(2)} · γ={gamma.toFixed(2)} · kroky={stats.current.steps} ·
        epizody={stats.current.episodes} · poslední akce {aGlyph}, TD chyba {stats.current.lastTD.toFixed(3)}
      </span>

      <span style={{ fontSize: 11.5, lineHeight: 1.6, color: "var(--text-muted)" }}>
        Agent (○) jde ε-greedy; po každém kroku se Q(s,a) posune o α·(TD chyba) k cíli
        r + γ·max Q(s'). Při dosažení +1/−1 epizoda končí a agent startuje znovu vlevo dole.
        Po desítkách kroků se šipky srovnají k cíli. Vyšší ε = víc náhodných odboček.
      </span>
    </div>
  );
}
