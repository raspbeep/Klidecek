// d-separation explorer on a tiny Bayesian network.
// A and B connect through C in three classic ways (chosen by the segmented control).
// Click a node to toggle it as observed (yellow). The path A..B turns orange (active /
// information flows) or grey (blocked); the readout reports whether A ⊥ B given the
// observed set, by the d-separation collider rule.
import { useState } from "react";

// Three canonical structures relating A and B through middle node C.
// collider: whether C is a head-to-head node on the A-B path (changes blocking rule).
const STRUCTS = {
  chain: {
    label: "řetězec  A→C→B",
    edges: [["A", "C"], ["C", "B"]],
    collider: false,
    factor: "P(A)·P(C|A)·P(B|C)",
    pos: { A: [40, 95], C: [140, 95], B: [240, 95] },
  },
  fork: {
    label: "společná příčina  A←C→B",
    edges: [["C", "A"], ["C", "B"]],
    collider: false,
    factor: "P(C)·P(A|C)·P(B|C)",
    pos: { A: [40, 130], C: [140, 40], B: [240, 130] },
  },
  collider: {
    label: "kolider  A→C←B",
    edges: [["A", "C"], ["B", "C"]],
    collider: true,
    factor: "P(A)·P(B)·P(C|A,B)",
    pos: { A: [40, 40], C: [140, 130], B: [240, 40] },
  },
};

export default function BayesNetDsep() {
  const [kind, setKind] = useState("chain");
  const [obs, setObs] = useState({}); // node id -> true if observed

  const S = STRUCTS[kind];
  const cObserved = !!obs.C;

  // d-separation along the single A-C-B path:
  //  - non-collider middle (chain/fork): observing C BLOCKS the path
  //  - collider middle: observing C OPENS the path; otherwise blocked
  const active = S.collider ? cObserved : !cObserved;
  const indep = !active; // A ⊥ B given observed set iff the A-C-B path is blocked

  const toggle = (id) => setObs((o) => ({ ...o, [id]: !o[id] }));

  const nodeFill = (id) =>
    obs[id]
      ? "color-mix(in oklch, oklch(0.78 0.16 80) 60%, var(--bg-card))"
      : "var(--bg-card)";
  const nodeStroke = (id) => (obs[id] ? "oklch(0.7 0.16 80)" : "var(--line-strong)");

  // active path drawn orange to match the caption ("oranžové, informace teče");
  // same orange the belief-propagation viz uses for its backward messages.
  const activeColor = "oklch(0.7 0.17 50)";
  const edgeColor = active ? activeColor : "var(--line-strong)";
  const edgeOpacity = active ? 0.9 : 0.4;

  const W = 280, H = 170;

  // arrow: line + small triangle head, trimmed to the node radius
  const drawEdge = ([from, to], i) => {
    const p = S.pos[from], q = S.pos[to];
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const r = 16;
    const x1 = p[0] + ux * r, y1 = p[1] + uy * r;
    const x2 = q[0] - ux * r, y2 = q[1] - uy * r;
    const ax = x2 - ux * 8, ay = y2 - uy * 8;
    const nx = -uy, ny = ux;
    return (
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={edgeColor} strokeWidth={active ? 2.2 : 1.4} opacity={edgeOpacity} />
        <polygon
          points={`${x2},${y2} ${ax + nx * 4},${ay + ny * 4} ${ax - nx * 4},${ay - ny * 4}`}
          fill={edgeColor} opacity={edgeOpacity} />
      </g>
    );
  };

  const indepSymbol = indep ? "⊥" : "⊥̸"; // ⊥ vs ⊥̸ (not independent)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>struktura:</span>
        {Object.entries(STRUCTS).map(([k, v]) => (
          <button key={k} className="viz-seg" data-active={kind === k}
            onClick={() => { setKind(k); setObs({}); }}>
            {v.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {S.edges.map(drawEdge)}
        {["A", "B", "C"].map((id) => {
          const p = S.pos[id];
          return (
            <g key={id} onClick={() => toggle(id)} style={{ cursor: "pointer" }}>
              <circle cx={p[0]} cy={p[1]} r="16"
                fill={nodeFill(id)} stroke={nodeStroke(id)}
                strokeWidth={obs[id] ? 2.5 : 1.3} />
              <text x={p[0]} y={p[1] + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="13" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--text)">
                {id}
              </text>
            </g>
          );
        })}
        <text x={8} y={H - 8} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          klikni uzel = pozoruj / přestaň pozorovat
        </text>
      </svg>

      <div style={{ fontSize: 11.5, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <div>faktorizace: <b style={{ color: "var(--text)" }}>{S.factor}</b></div>
        <div>
          cesta A—C—B:{" "}
          <b style={{ color: active ? activeColor : "var(--text-muted)" }}>
            {active ? "AKTIVNÍ (informace teče)" : "BLOKOVANÁ"}
          </b>
        </div>
        <div>
          A{" "}
          <b style={{ color: indep ? "var(--text)" : activeColor }}>{indepSymbol}</b>{" "}
          B {cObserved ? "| C" : "(marginálně)"}
          {S.collider && cObserved && (
            <span style={{ color: activeColor }}>  ← explaining away</span>
          )}
        </div>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Řetězec i společná příčina: pozorování C cestu <b>blokuje</b> (A ⊥ B | C).
        Kolider je opačný — bez pozorování je C blokované (A ⊥ B), pozorování C cestu <b>otevře</b>.
      </div>
    </div>
  );
}
