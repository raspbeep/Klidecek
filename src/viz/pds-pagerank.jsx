// PageRank iterace na malém grafu. Tlačítkem "iteruj" se rekurzivně přepočítává
// R(u) = (1-d)/N + d·Σ R(v)/N_v. Sleduj, jak se skóre ustaluje.
import { useState } from "react";

// directed graph: edges out of each node
const NODES = {
  A: { x: 70, y: 45 },
  B: { x: 215, y: 40 },
  C: { x: 70, y: 150 },
  D: { x: 215, y: 155 },
  E: { x: 320, y: 100 },
};
const EDGES = [
  ["A", "B"], ["A", "C"],
  ["B", "D"], ["B", "E"],
  ["C", "A"], ["C", "D"],
  ["D", "E"],
  ["E", "B"],
];

const NAMES = Object.keys(NODES);
const N = NAMES.length;
const d = 0.85; // damping factor

// outgoing counts
const outCount = {};
NAMES.forEach((n) => (outCount[n] = EDGES.filter(([f]) => f === n).length));
// inbound map
const inbound = {};
NAMES.forEach((n) => (inbound[n] = EDGES.filter(([, t]) => t === n).map(([f]) => f)));

function step(rank) {
  const next = {};
  for (const u of NAMES) {
    let sum = 0;
    for (const v of inbound[u]) sum += rank[v] / outCount[v];
    next[u] = (1 - d) / N + d * sum;
  }
  return next;
}

export default function PdsPagerank() {
  const init = {};
  NAMES.forEach((n) => (init[n] = 1 / N));
  const [rank, setRank] = useState(init);
  const [iter, setIter] = useState(0);

  const reset = () => { setRank(init); setIter(0); };
  const doStep = () => { setRank(step(rank)); setIter((i) => i + 1); };

  const maxR = Math.max(...NAMES.map((n) => rank[n]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox="0 0 400 200" style={{ width: "100%", maxWidth: 400 }}>
        <rect width="400" height="200" fill="var(--bg-inset)" rx="8" />

        {/* edges */}
        {EDGES.map(([f, t], i) => {
          const a = NODES[f], b = NODES[t];
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len, uy = dy / len;
          const r1 = 20, r2 = 22;
          return (
            <line key={i}
              x1={a.x + ux * r1} y1={a.y + uy * r1}
              x2={b.x - ux * r2} y2={b.y - uy * r2}
              stroke="var(--line-strong)" strokeWidth="1.1" markerEnd="url(#prArr)" />
          );
        })}

        {/* nodes — radius scales with rank */}
        {NAMES.map((n) => {
          const node = NODES[n];
          const rad = 14 + 14 * (rank[n] / maxR);
          const hot = rank[n] === maxR;
          return (
            <g key={n}>
              <circle cx={node.x} cy={node.y} r={rad}
                fill={hot ? "var(--accent-soft)" : "var(--bg-card)"}
                stroke="var(--accent)" strokeWidth={hot ? 2 : 1.3} />
              <text x={node.x} y={node.y - 2} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">{n}</text>
              <text x={node.x} y={node.y + 11} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                {rank[n].toFixed(3)}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="prArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)" />
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn ghost" onClick={doStep} style={btn}>▶ iteruj</button>
        <button className="btn ghost" onClick={reset} style={btn}>↻ reset</button>
        <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          iterace: {iter}
        </span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        R(u) = (1−d)/N + d·Σ<sub>v∈B<sub>u</sub></sub> R(v)/N<sub>v</sub> &nbsp;(d = 0,85). Každý uzel rozdělí své skóre
        rovnoměrně mezi své odchozí odkazy. Po pár iteracích se hodnoty <strong>ustálí</strong> — to je fixní bod
        rekurze. Větší kruh = vyšší PageRank.
      </div>
    </div>
  );
}

const btn = {
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
  color: "var(--text)",
};
