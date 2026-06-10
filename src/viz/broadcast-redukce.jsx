// Broadcast / Reduce / All-reduce na různých topologiích.
// Hypercube (8), Mesh 4×4, binární strom (8 listů), ring (8).
// Krokuj a sleduj, kdo je informovaný v kroku k. Porovnání s teoretickým log N / √N / N.
import { useState, useMemo } from "react";

const W = 560, H = 320;

// Topologies — each defines nodes + edges + a step-schedule for broadcast.
// For broadcast: schedule[k] = set of edges activated in step k (from informed → uninformed).
// For reduce: we play schedule in reverse, accumulating ⊕ at receiver.

function buildHypercube() {
  const N = 8;
  const cx = 220, cy = 150;
  const nodes = [];
  // 3D hypercube projected onto 2D — front face + back face offset
  for (let i = 0; i < N; i++) {
    const b0 = i & 1, b1 = (i >> 1) & 1, b2 = (i >> 2) & 1;
    const x = cx + (b0 ? 80 : -80) + (b2 ? 30 : -30);
    const y = cy + (b1 ? 60 : -60) + (b2 ? -30 : 30);
    nodes.push({ id: i, x, y, label: i.toString(2).padStart(3, "0") });
  }
  const edges = [];
  for (let i = 0; i < N; i++) {
    for (let d = 0; d < 3; d++) {
      const j = i ^ (1 << d);
      if (j > i) edges.push({ a: i, b: j, dim: d });
    }
  }
  // Broadcast schedule from node 0: dim 0, dim 1, dim 2
  const schedule = [];
  let informed = new Set([0]);
  for (let d = 0; d < 3; d++) {
    const step = [];
    const newlyInformed = [];
    informed.forEach((n) => {
      const j = n ^ (1 << d);
      if (!informed.has(j)) {
        step.push({ from: n, to: j });
        newlyInformed.push(j);
      }
    });
    schedule.push(step);
    newlyInformed.forEach((n) => informed.add(n));
  }
  return { nodes, edges, schedule, N, label: "Hypercube 3D (N=8, log N=3)" };
}

function buildMesh() {
  // 4x4 mesh, broadcast from (0,0) along row then columns
  const N = 16;
  const x0 = 140, y0 = 60, dx = 60, dy = 60;
  const nodes = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      nodes.push({ id: r * 4 + c, x: x0 + c * dx, y: y0 + r * dy, label: `${r},${c}` });
    }
  }
  const edges = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (c < 3) edges.push({ a: r * 4 + c, b: r * 4 + c + 1 });
      if (r < 3) edges.push({ a: r * 4 + c, b: (r + 1) * 4 + c });
    }
  }
  // Schedule: first along row 0 with recursive doubling (3 steps), then down each column (3 steps in parallel)
  const schedule = [];
  // Phase 1: row 0 doubling
  let informedInRow = new Set([0]);
  for (let s = 0; s < 2; s++) {
    const step = [];
    const newly = [];
    informedInRow.forEach((id) => {
      const c = id % 4;
      // partner at c + 2^s
      const cP = c + (1 << s);
      if (cP <= 3 && !informedInRow.has(cP)) {
        step.push({ from: id, to: cP });
        newly.push(cP);
      }
    });
    if (step.length) schedule.push(step);
    newly.forEach((n) => informedInRow.add(n));
  }
  // Phase 2: column doubling, simultaneously across all 4 columns
  let informedRows = { 0: new Set([0]), 1: new Set([1]), 2: new Set([2]), 3: new Set([3]) };
  for (let s = 0; s < 2; s++) {
    const step = [];
    [0, 1, 2, 3].forEach((c) => {
      const informedCol = informedRows[c];
      const newlyCol = [];
      informedCol.forEach((rowIdx) => {
        const rP = rowIdx + (1 << s);
        if (rP <= 3 && !informedCol.has(rP)) {
          step.push({ from: c + rowIdx * 4, to: c + rP * 4 });
          newlyCol.push(rP);
        }
      });
      newlyCol.forEach((r) => informedCol.add(r));
    });
    if (step.length) schedule.push(step);
  }
  return { nodes, edges, schedule, N, label: "Mesh 4×4 (N=16, 2√N−2 = 4 kroky log-doubling)" };
}

function buildTree() {
  // Binary tree with 8 leaves
  const nodes = [];
  // Levels: root, 2, 4, 8
  const levels = [
    [{ y: 60 }],
    [{ y: 130 }, { y: 130 }],
    [{ y: 200 }, { y: 200 }, { y: 200 }, { y: 200 }],
    [{ y: 270 }, { y: 270 }, { y: 270 }, { y: 270 }, { y: 270 }, { y: 270 }, { y: 270 }, { y: 270 }],
  ];
  let id = 0;
  levels.forEach((lvl, li) => {
    const count = lvl.length;
    lvl.forEach((n, i) => {
      const x = 80 + ((i + 0.5) * 400) / count;
      nodes.push({ id: id++, x, y: n.y, label: `${id - 1}` });
    });
  });
  const edges = [];
  // Connect each parent to its two children: parent at idx p has children 2p+1, 2p+2
  for (let p = 0; p < 7; p++) {
    edges.push({ a: p, b: 2 * p + 1 });
    edges.push({ a: p, b: 2 * p + 2 });
  }
  // Broadcast from root (id=0) down the tree
  const schedule = [];
  let frontier = [0];
  while (true) {
    const step = [];
    const nextFrontier = [];
    frontier.forEach((p) => {
      const lc = 2 * p + 1, rc = 2 * p + 2;
      if (lc < 15) { step.push({ from: p, to: lc }); nextFrontier.push(lc); }
      if (rc < 15) { step.push({ from: p, to: rc }); nextFrontier.push(rc); }
    });
    if (step.length === 0) break;
    schedule.push(step);
    frontier = nextFrontier;
  }
  return { nodes, edges, schedule, N: 15, label: "Binární strom (8 listů, hloubka log 8 = 3)" };
}

function buildRing() {
  const N = 8;
  const cx = 280, cy = 160, r = 100;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    nodes.push({ id: i, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), label: `${i}` });
  }
  const edges = [];
  for (let i = 0; i < N; i++) edges.push({ a: i, b: (i + 1) % N });
  // Broadcast from 0 hop by hop (worst case): N/2 = 4 steps (bidirectional ring)
  const schedule = [];
  for (let s = 0; s < N / 2; s++) {
    const step = [];
    // each step: both neighbours of current frontier extend
    step.push({ from: s, to: s + 1 });
    if (s > 0) step.push({ from: (N - s) % N, to: (N - s - 1 + N) % N });
    schedule.push(step);
  }
  return { nodes, edges, schedule, N: 8, label: "Ring (N=8, N/2 = 4 kroky obousměrně)" };
}

const TOPOLOGIES = {
  hypercube: buildHypercube(),
  mesh: buildMesh(),
  tree: buildTree(),
  ring: buildRing(),
};

export default function BroadcastRedukce() {
  const [topo, setTopo] = useState("hypercube");
  const [mode, setMode] = useState("broadcast"); // "broadcast" | "reduce" | "allreduce"
  const [step, setStep] = useState(0);

  const T = TOPOLOGIES[topo];
  const maxStep = T.schedule.length;

  // For reduce: reverse the schedule, accumulating from leaves to root
  const activeEdges = useMemo(() => {
    if (step === 0) return [];
    if (mode === "broadcast" || mode === "allreduce") {
      return T.schedule[step - 1] || [];
    }
    // reduce: reverse
    const sched = T.schedule.slice().reverse();
    const edges = sched[step - 1] || [];
    // Flip direction: from → to (leaves → root)
    return edges.map((e) => ({ from: e.to, to: e.from }));
  }, [topo, mode, step]);

  // Which nodes are "active" / informed:
  const informedSet = useMemo(() => {
    const s = new Set();
    if (mode === "broadcast" || mode === "allreduce") {
      s.add(T.schedule[0]?.[0]?.from ?? 0);
      for (let i = 0; i < step; i++) {
        (T.schedule[i] || []).forEach((e) => { s.add(e.from); s.add(e.to); });
      }
    } else {
      // reduce: starts with all leaves, ends with root
      const allNodes = T.nodes.map((n) => n.id);
      const reverseSched = T.schedule.slice().reverse();
      if (step === 0) allNodes.forEach((n) => s.add(n));
      else {
        // After k reduce steps, nodes that have already passed their value upward are "consumed"
        for (let id of allNodes) s.add(id);
      }
    }
    return s;
  }, [topo, mode, step]);

  const reset = () => setStep(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Controls */}
      <div className="viz-controls" style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>topologie:</span>
        {Object.keys(TOPOLOGIES).map((k) => (
          <button key={k} className="viz-btn" data-active={topo === k} onClick={() => { setTopo(k); reset(); }}>
            {k === "hypercube" ? "hyperkrychle" : k === "mesh" ? "mřížka" : k === "tree" ? "strom" : "kruh"}
          </button>
        ))}
        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 8 }}>operace:</span>
        {["broadcast", "reduce", "allreduce"].map((k) => (
          <button key={k} className="viz-btn" data-active={mode === k} onClick={() => { setMode(k); reset(); }}>
            {k === "allreduce" ? "all-reduce" : k}
          </button>
        ))}
      </div>

      {/* Step nav */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step} / {maxStep}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(maxStep, step + 1))} disabled={step >= maxStep}>další →</button>
        <button className="viz-btn" onClick={reset}>↻</button>
      </div>

      {/* Topology SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Static edges */}
        {T.edges.map((e, i) => {
          const a = T.nodes[e.a], b = T.nodes[e.b];
          return <line key={`e-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line-strong)" strokeWidth="0.7" opacity="0.55" />;
        })}

        {/* Active edges in current step (arrows) */}
        {activeEdges.map((e, i) => {
          const a = T.nodes[e.from], b = T.nodes[e.to];
          return (
            <g key={`ae-${i}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--accent)" strokeWidth="2.2" markerEnd="url(#brArr)" opacity="0.95" />
            </g>
          );
        })}

        {/* Nodes */}
        {T.nodes.map((n) => {
          const informed = informedSet.has(n.id);
          return (
            <g key={`n-${n.id}`}>
              <circle cx={n.x} cy={n.y} r={topo === "mesh" ? 16 : 18}
                      fill={informed ? "oklch(0.62 0.14 252 / 0.35)" : "var(--bg-card)"}
                      stroke={informed ? "var(--accent)" : "var(--line-strong)"} strokeWidth="1.4" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={topo === "hypercube" ? "9" : "11"}
                    fontFamily="var(--font-mono)" fill={informed ? "var(--text)" : "var(--text-muted)"}>
                {n.label}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="brArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)" />
          </marker>
        </defs>

        <text x={W / 2} y={16} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
          {T.label}
        </text>
      </svg>

      {/* Info panel */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {mode === "broadcast" && (
          <span>
            <b style={{ color: "var(--text)" }}>Broadcast</b> z uzlu 0 ke všem. V kroku <b>{step}</b> má hodnotu <b>{informedSet.size}</b> z {T.nodes.length} uzlů.{" "}
            {topo === "hypercube" && "Hyperkrychle zdvojnásobí počet informovaných v každém kroku — log N kroků."}
            {topo === "mesh" && "Mřížka šíří nejdřív po řádce (s rekurzivním zdvojováním), pak ve sloupcích."}
            {topo === "tree" && "Ve stromě se z kořene paralelně rozesílá oběma synům — hloubka stromu = log N."}
            {topo === "ring" && "Ring obousměrně šíří od jednoho uzlu — N/2 kroků, žádné zdvojnásobení."}
          </span>
        )}
        {mode === "reduce" && (
          <span>
            <b style={{ color: "var(--text)" }}>Reduce</b> — inverzní pohyb dat. Listy/uzly posílají hodnotu rodiči/sousedovi, ten aplikuje ⊕.
            {topo === "ring" && " V kruhu se hodnota „točí\" — N kroků."}
            {(topo === "tree" || topo === "hypercube") && " log N kroků (stejně jako broadcast)."}
          </span>
        )}
        {mode === "allreduce" && (
          <span>
            <b style={{ color: "var(--text)" }}>All-reduce</b> — všichni mají výsledek redukce. Naivně: reduce + broadcast. Optimálně na hyperkrychli: každý uzel si v kroku k vymění s partnerem přes dim k a aplikuje ⊕ → log N kroků.
          </span>
        )}
      </div>

      {/* Comparison table */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
        <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          čas broadcastu (N = počet uzlů)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, color: "var(--text-muted)" }}>
          <div style={{ color: topo === "hypercube" ? "var(--accent)" : "var(--text-muted)", fontWeight: topo === "hypercube" ? 600 : 400 }}>hyperkrychle: log N</div>
          <div style={{ color: topo === "mesh" ? "var(--accent)" : "var(--text-muted)", fontWeight: topo === "mesh" ? 600 : 400 }}>mřížka: √N</div>
          <div style={{ color: topo === "tree" ? "var(--accent)" : "var(--text-muted)", fontWeight: topo === "tree" ? 600 : 400 }}>strom: log N</div>
          <div style={{ color: topo === "ring" ? "var(--accent)" : "var(--text-muted)", fontWeight: topo === "ring" ? 600 : 400 }}>ring: N/2</div>
        </div>
      </div>
    </div>
  );
}

