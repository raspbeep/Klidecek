// Ant System (ACO) on a small TSP instance.
// Step through iterations: each ant builds a tour by probabilistically choosing
// edges (pheromone^alpha * visibility^beta), pheromone evaporates and is
// reinforced (Q/L). Edge thickness = pheromone level; the short tour emerges.
import { useState, useMemo } from "react";

// fixed small instance of 6 cities (layout chosen so a clear short tour exists)
const CITIES = [
  { id: 0, x: 55, y: 40 },
  { id: 1, x: 150, y: 28 },
  { id: 2, x: 245, y: 55 },
  { id: 3, x: 235, y: 145 },
  { id: 4, x: 135, y: 165 },
  { id: 5, x: 45, y: 130 },
];
const N = CITIES.length;

function dist(a, b) {
  return Math.hypot(CITIES[a].x - CITIES[b].x, CITIES[a].y - CITIES[b].y);
}

// precompute distance matrix
const D = CITIES.map((_, i) => CITIES.map((_, j) => (i === j ? 0 : dist(i, j))));

// deterministic pseudo-random so the animation is reproducible per step
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALPHA = 1;        // pheromone weight
const BETA = 3;         // visibility weight
const RHO = 0.3;        // evaporation
const Q = 800;          // pheromone constant
const M_ANTS = 8;       // ants per iteration

// run the whole simulation up to `iters` iterations from a fresh start,
// returning the final pheromone matrix and the best tour found.
function simulate(iters) {
  // init pheromone: small uniform value
  let tau = CITIES.map(() => CITIES.map(() => 1));
  for (let i = 0; i < N; i++) tau[i][i] = 0;
  const rnd = mulberry32(12345);

  let bestTour = null, bestLen = Infinity;

  for (let it = 0; it < iters; it++) {
    const deltas = CITIES.map(() => CITIES.map(() => 0));
    for (let k = 0; k < M_ANTS; k++) {
      // build a tour starting from a (rotating) city
      const start = k % N;
      const visited = new Set([start]);
      const tour = [start];
      let cur = start;
      while (visited.size < N) {
        // probabilities over allowed (unvisited) cities
        let total = 0;
        const w = [];
        for (let j = 0; j < N; j++) {
          if (visited.has(j)) { w.push(0); continue; }
          const eta = 1 / D[cur][j];
          const val = Math.pow(tau[cur][j], ALPHA) * Math.pow(eta, BETA);
          w.push(val); total += val;
        }
        // roulette-wheel selection
        let r = rnd() * total, next = -1;
        for (let j = 0; j < N; j++) { r -= w[j]; if (w[j] > 0 && r <= 0) { next = j; break; } }
        if (next === -1) { for (let j = 0; j < N; j++) if (!visited.has(j)) next = j; }
        visited.add(next); tour.push(next); cur = next;
      }
      // close the loop
      let len = 0;
      for (let s = 0; s < N; s++) len += D[tour[s]][tour[(s + 1) % N]];
      if (len < bestLen) { bestLen = len; bestTour = tour.slice(); }
      // deposit Q/L on each used edge
      for (let s = 0; s < N; s++) {
        const a = tour[s], b = tour[(s + 1) % N];
        deltas[a][b] += Q / len; deltas[b][a] += Q / len;
      }
    }
    // evaporate + reinforce
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        if (i !== j) tau[i][j] = (1 - RHO) * tau[i][j] + deltas[i][j];
  }
  return { tau, bestTour, bestLen };
}

export default function AcoTsp() {
  const [iter, setIter] = useState(0);
  const W = 290, H = 200;

  const { tau, bestTour, bestLen } = useMemo(() => simulate(iter), [iter]);

  // max pheromone for normalizing edge thickness
  let tauMax = 0.0001;
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) tauMax = Math.max(tauMax, tau[i][j]);

  const tourEdges = new Set();
  if (bestTour) for (let s = 0; s < N; s++) {
    const a = bestTour[s], b = bestTour[(s + 1) % N];
    tourEdges.add(a < b ? `${a}-${b}` : `${b}-${a}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 440 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* all edges, thickness = pheromone level */}
        {CITIES.map((_, i) =>
          CITIES.slice(i + 1).map((_, jj) => {
            const j = i + 1 + jj;
            const t = tau[i][j] / tauMax;            // 0..1 normalized pheromone
            const inTour = tourEdges.has(`${i}-${j}`);
            return (
              <line key={`${i}-${j}`}
                x1={CITIES[i].x} y1={CITIES[i].y}
                x2={CITIES[j].x} y2={CITIES[j].y}
                stroke={inTour ? "var(--accent)" : "var(--accent-line)"}
                strokeWidth={0.4 + t * 5}
                opacity={inTour ? 0.9 : 0.18 + t * 0.6}
                strokeLinecap="round" />
            );
          })
        )}
        {/* cities */}
        {CITIES.map((c) => (
          <g key={c.id}>
            <circle cx={c.x} cy={c.y} r="9" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x={c.x} y={c.y + 1} textAnchor="middle" dominantBaseline="central"
              fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--text)">
              {c.id}
            </text>
          </g>
        ))}
        <text x={8} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          tloušťka hrany = množství feromonu τ
        </text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setIter((i) => Math.max(0, i - 1))} disabled={iter === 0}>
          − iterace
        </button>
        <button className="viz-btn primary" onClick={() => setIter((i) => Math.min(60, i + 1))}>
          + iterace
        </button>
        <button className="viz-btn" onClick={() => setIter(0)} disabled={iter === 0}>
          reset
        </button>
        <span className="viz-readout">
          iterace {iter} · nejkratší L = {bestLen === Infinity ? "—" : bestLen.toFixed(0)}
        </span>
      </div>

      <div style={{ fontSize: 11, lineHeight: 1.6, color: "var(--text-muted)" }}>
        {iter === 0
          ? "Start: feromon je všude stejně malý, žádná trasa není zvýhodněná."
          : "Krátké trasy dostávají víc feromonu (Q/L) a vypařování maže slabé stopy — nejkratší okruh (zvýrazněný) postupně „tloustne“."}
      </div>
    </div>
  );
}
