// Euler tour + pointer-jumping list ranking.
// Vyber strom, sleduj konstrukci Eulerovské cesty (orientované hrany),
// pak iterace pointer jumping na seznamu — distance se zdvojnásobuje.
import { useState, useMemo } from "react";

// Trees: each node has {id, x, y, parent}
const TREES = {
  "vyvážený 4 uzly": {
    nodes: [
      { id: 1, x: 280, y: 50 },
      { id: 2, x: 200, y: 120 },
      { id: 3, x: 280, y: 120 },
      { id: 4, x: 360, y: 120 },
    ],
    edges: [[1, 2], [1, 3], [1, 4]],
    root: 1,
  },
  "vyvážený 7 uzlů": {
    nodes: [
      { id: 1, x: 280, y: 40 },
      { id: 2, x: 180, y: 100 },
      { id: 3, x: 380, y: 100 },
      { id: 4, x: 130, y: 170 },
      { id: 5, x: 230, y: 170 },
      { id: 6, x: 330, y: 170 },
      { id: 7, x: 430, y: 170 },
    ],
    edges: [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7]],
    root: 1,
  },
  "lineární 5 uzlů": {
    nodes: [
      { id: 1, x: 100, y: 50 },
      { id: 2, x: 100, y: 110 },
      { id: 3, x: 100, y: 170 },
      { id: 4, x: 100, y: 230 },
      { id: 5, x: 100, y: 290 },
    ],
    edges: [[1, 2], [2, 3], [3, 4], [4, 5]],
    root: 1,
  },
};

// Build Euler tour by DFS — produce ordered list of directed edges <u,v>.
function buildEulerTour(tree) {
  const adj = {};
  tree.nodes.forEach((n) => (adj[n.id] = []));
  tree.edges.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  const edges = [];
  function dfs(u, parent) {
    for (const v of adj[u]) {
      if (v === parent) continue;
      edges.push({ from: u, to: v, forward: true });
      dfs(v, u);
      edges.push({ from: v, to: u, forward: false });
    }
  }
  dfs(tree.root, null);
  return edges;
}

// Pointer jumping: start with each element pointing to next, rank = 1.
// In each iteration: rank += rank[next]; next = next[next]
function simulatePointerJumping(n) {
  const states = [];
  let rank = new Array(n).fill(1);
  let next = new Array(n).fill(null).map((_, i) => (i + 1 < n ? i + 1 : null));
  rank[n - 1] = 0; // last element has rank 0
  next[n - 1] = null;
  states.push({ iter: 0, rank: rank.slice(), next: next.slice(), label: "Inicializace: rank=1, next=soused" });

  const logN = Math.ceil(Math.log2(n));
  for (let it = 0; it < logN; it++) {
    const newRank = rank.slice();
    const newNext = next.slice();
    for (let i = 0; i < n; i++) {
      if (next[i] !== null) {
        newRank[i] = rank[i] + rank[next[i]];
        newNext[i] = next[next[i]];
      }
    }
    rank = newRank;
    next = newNext;
    states.push({ iter: it + 1, rank: rank.slice(), next: next.slice(), label: `Iterace ${it + 1}: rank[i] += rank[next[i]]; next[i] = next[next[i]]` });
  }
  return states;
}

export default function EulerTour() {
  const [treeKey, setTreeKey] = useState("vyvážený 7 uzlů");
  const [phase, setPhase] = useState("tour"); // "tour" | "ranking"
  const [step, setStep] = useState(0);

  const tree = TREES[treeKey];
  const tour = useMemo(() => buildEulerTour(tree), [treeKey]);
  const n = tour.length;
  const ranking = useMemo(() => simulatePointerJumping(n), [n]);

  const W = 540, H = 320;

  const visibleTourEdges = phase === "tour" ? tour.slice(0, step) : tour;
  const rankingState = phase === "ranking" ? ranking[Math.min(step, ranking.length - 1)] : null;

  const maxStep = phase === "tour" ? tour.length : ranking.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Controls */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>strom:</span>
        {Object.keys(TREES).map((k) => (
          <button key={k} onClick={() => { setTreeKey(k); setStep(0); setPhase("tour"); }}
            style={{ ...modeBtn, ...(treeKey === k ? activeBtn : {}) }}>{k}</button>
        ))}
        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 8 }}>fáze:</span>
        <button onClick={() => { setPhase("tour"); setStep(0); }}
          style={{ ...modeBtn, ...(phase === "tour" ? activeBtn : {}) }}>1. Euler tour</button>
        <button onClick={() => { setPhase("ranking"); setStep(0); }}
          style={{ ...modeBtn, ...(phase === "ranking" ? activeBtn : {}) }}>2. List ranking</button>
      </div>

      {/* Step nav */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {phase === "tour" ? `Euler edge ${step} / ${tour.length}` : `iterace ${rankingState?.iter ?? 0} / ${ranking.length - 1}`}
        </div>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.min(maxStep, step + 1))} disabled={step >= maxStep}>další →</button>
      </div>

      {/* Tree SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Edges */}
        {tree.edges.map(([a, b], i) => {
          const na = tree.nodes.find((n) => n.id === a);
          const nb = tree.nodes.find((n) => n.id === b);
          return <line key={`tne-${i}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="var(--line-strong)" strokeWidth="1" opacity="0.5" />;
        })}

        {/* Visible Euler tour edges */}
        {visibleTourEdges.map((e, i) => {
          const a = tree.nodes.find((n) => n.id === e.from);
          const b = tree.nodes.find((n) => n.id === e.to);
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          // Offset perpendicular so forward and backward don't overlap
          const perpX = -dy / len * 8 * (e.forward ? 1 : -1);
          const perpY = dx / len * 8 * (e.forward ? 1 : -1);
          const isLatest = i === visibleTourEdges.length - 1;
          const color = e.forward ? "var(--accent)" : "oklch(0.55 0.18 22)";
          return (
            <g key={`et-${i}`}>
              <line x1={a.x + perpX} y1={a.y + perpY} x2={b.x + perpX} y2={b.y + perpY}
                    stroke={color} strokeWidth={isLatest ? 2.4 : 1.4} opacity={isLatest ? 1 : 0.75}
                    markerEnd={e.forward ? "url(#etArrFwd)" : "url(#etArrBwd)"} />
            </g>
          );
        })}

        {/* Nodes */}
        {tree.nodes.map((n) => (
          <g key={`tn-${n.id}`}>
            <circle cx={n.x} cy={n.y} r="16" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.4" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="13" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">
              {n.id}
            </text>
          </g>
        ))}

        <defs>
          <marker id="etArrFwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)" />
          </marker>
          <marker id="etArrBwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)" />
          </marker>
        </defs>

        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
          {phase === "tour" ? "Konstrukce Euler tour (DFS, 2(n−1) orientovaných hran)" : "List ranking pointer jumping"}
        </text>
      </svg>

      {/* Tour list or ranking table */}
      {phase === "tour" ? (
        <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Euler tour ({tour.length} hran)
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text)", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {tour.map((e, i) => (
              <span key={i} style={{
                padding: "2px 6px", borderRadius: 3,
                background: i < step ? (e.forward ? "oklch(0.62 0.14 252 / 0.2)" : "oklch(0.62 0.14 22 / 0.2)") : "var(--bg-inset)",
                color: i < step ? "var(--text)" : "var(--text-faint)",
                fontWeight: i === step - 1 ? 700 : 400,
              }}>
                {e.forward ? "→" : "←"}{e.from},{e.to}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            {rankingState?.label}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>
            <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${n}, 1fr)`, gap: 2, alignItems: "center" }}>
              <span style={{ color: "var(--text-faint)" }}>index</span>
              {rankingState?.rank.map((_, i) => <span key={i} style={{ textAlign: "center", color: "var(--text-faint)" }}>{i}</span>)}
              <span style={{ color: "var(--text-muted)" }}>rank</span>
              {rankingState?.rank.map((r, i) => (
                <span key={i} style={{ textAlign: "center", padding: "2px 4px", background: "var(--bg-inset)", borderRadius: 2, color: "var(--accent)", fontWeight: 600 }}>{r}</span>
              ))}
              <span style={{ color: "var(--text-muted)" }}>next</span>
              {rankingState?.next.map((v, i) => (
                <span key={i} style={{ textAlign: "center", padding: "2px 4px", background: "var(--bg-inset)", borderRadius: 2, color: "var(--text-muted)" }}>{v === null ? "—" : v}</span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Po log n = {Math.ceil(Math.log2(n))} iteracích každý prvek obsahuje vzdálenost ke konci seznamu = pozici v Eulerovské cestě. Tu pak použijeme jako klíč pro suffix-sum nad váhami (depth, preorder, descendants, …).
          </div>
        </div>
      )}
    </div>
  );
}

const modeBtn = {
  padding: "4px 10px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 3,
  color: "var(--text)",
  cursor: "pointer",
};
const activeBtn = { background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const navBtn = {
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
};
