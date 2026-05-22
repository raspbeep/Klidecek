// Rake + Compress tree contraction.
// Vyber preset (vyvážený / lopsided / lineární řetěz) a krokuj Rake a Compress.
// Sleduj, jak strom kolabuje v log n iteracích — i lineární řetěz.
import { useState, useMemo } from "react";

// Preset trees as parent[i] arrays. root = node 1, parent[1] = 0.
// Layout computed automatically from tree structure.
const PRESETS = {
  "vyvážený 7": [0, 1, 1, 2, 2, 3, 3],          // 1 root → 2,3 → 4,5,6,7
  "vyvážený 15": [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7],
  "lopsided": [0, 1, 1, 2, 2, 4, 4, 6, 6],      // mix of leaves and chain
  "lineární": [0, 1, 2, 3, 4, 5, 6, 7],          // straight chain 1-2-3-4-5-6-7-8
  "lineární 12": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

function computeLayout(parents) {
  const n = parents.length;
  const children = new Array(n + 1).fill(null).map(() => []);
  for (let i = 1; i < n + 1; i++) {
    const p = parents[i - 1];
    if (p) children[p].push(i);
  }
  // Layout via post-order width assignment
  const subW = new Array(n + 1).fill(1);
  function compW(u) {
    if (children[u].length === 0) { subW[u] = 1; return 1; }
    let w = 0;
    children[u].forEach((c) => { w += compW(c); });
    subW[u] = w;
    return w;
  }
  const root = 1;
  compW(root);

  const positions = {};
  const totalW = subW[root];
  function place(u, x0, x1, depth) {
    const cx = (x0 + x1) / 2;
    positions[u] = { x: cx, y: 40 + depth * 50 };
    let cur = x0;
    children[u].forEach((c) => {
      const wfrac = subW[c] / subW[u];
      const cw = (x1 - x0) * wfrac;
      place(c, cur, cur + cw, depth + 1);
      cur += cw;
    });
  }
  place(root, 40, 500, 0);
  return positions;
}

// Build initial graph: list of nodes (alive flag) + edges (alive flag)
function buildGraph(parents) {
  const n = parents.length;
  const nodes = [];
  for (let i = 1; i <= n; i++) {
    nodes.push({ id: i, alive: true, parent: parents[i - 1], absorbed: [] });
  }
  return nodes;
}

// One Rake step: every leaf with parent ≠ root is removed.
// Leaf = node whose children are all removed (or initially no children).
function applyRake(nodes) {
  const childrenMap = {};
  nodes.forEach((n) => { childrenMap[n.id] = []; });
  nodes.forEach((n) => {
    if (n.alive && n.parent) childrenMap[n.parent].push(n.id);
  });
  const toRemove = [];
  nodes.forEach((n) => {
    if (!n.alive) return;
    if (n.id === 1) return; // never remove root
    const aliveChildren = childrenMap[n.id].filter((c) => nodes.find((x) => x.id === c && x.alive));
    if (aliveChildren.length === 0) toRemove.push(n.id);
  });
  const result = nodes.map((n) => ({ ...n }));
  toRemove.forEach((id) => {
    const node = result.find((x) => x.id === id);
    node.alive = false;
    // attach to parent's absorbed list
    const parent = result.find((x) => x.id === node.parent);
    if (parent) parent.absorbed.push(id);
  });
  return { result, removed: toRemove };
}

// Compress step: in each chain (sequence of degree-1 nodes), merge pairs.
function applyCompress(nodes) {
  const childrenMap = {};
  nodes.forEach((n) => { childrenMap[n.id] = []; });
  nodes.forEach((n) => { if (n.alive && n.parent) childrenMap[n.parent].push(n.id); });
  const aliveAdj = (id) => {
    const ch = childrenMap[id].filter((c) => nodes.find((x) => x.id === c && x.alive));
    const par = nodes.find((x) => x.id === id).parent;
    const parentAlive = par && nodes.find((x) => x.id === par)?.alive;
    return { children: ch, parent: parentAlive ? par : null };
  };
  // Find chains: a chain is a maximal path of nodes each with exactly 1 alive child
  // and parent has more than 1 alive child or is root.
  const merged = new Set();
  const merges = [];
  nodes.forEach((n) => {
    if (!n.alive || merged.has(n.id)) return;
    const adj = aliveAdj(n.id);
    if (adj.children.length === 1) {
      // potentially start of a chain. Look back: parent has >1 child or is root or chain root.
      // For simplicity: pair this node with its child if the child also has 0 or 1 children (i.e. is in chain).
      const child = adj.children[0];
      const childAdj = aliveAdj(child);
      if (childAdj.children.length <= 1 && !merged.has(child)) {
        // merge child INTO this node (or vice versa - we'll absorb child into parent)
        merges.push({ keep: n.id, absorb: child });
        merged.add(n.id);
        merged.add(child);
      }
    }
  });
  if (merges.length === 0) return { result: nodes.map((n) => ({ ...n })), merges };
  const result = nodes.map((n) => ({ ...n }));
  merges.forEach((m) => {
    const absorb = result.find((x) => x.id === m.absorb);
    const keep = result.find((x) => x.id === m.keep);
    // absorb's children re-parent to keep
    result.forEach((x) => {
      if (x.parent === m.absorb) x.parent = m.keep;
    });
    keep.absorbed.push(...absorb.absorbed, m.absorb);
    absorb.alive = false;
  });
  return { result, merges };
}

export default function KontrakceUvod() {
  const [presetKey, setPresetKey] = useState("vyvážený 7");
  const [history, setHistory] = useState(() => {
    const init = buildGraph(PRESETS["vyvážený 7"]);
    return [{ nodes: init, label: "Vstup — initial tree" }];
  });

  // Apply current preset on change
  useMemo(() => {
    const init = buildGraph(PRESETS[presetKey]);
    setHistory([{ nodes: init, label: "Vstup — initial tree" }]);
  }, [presetKey]);

  const positions = useMemo(() => computeLayout(PRESETS[presetKey]), [presetKey]);
  const current = history[history.length - 1];
  const aliveCount = current.nodes.filter((n) => n.alive).length;
  const totalCount = current.nodes.length;
  const done = aliveCount === 1;

  const W = 540, H = 320;

  const doRake = () => {
    const { result, removed } = applyRake(current.nodes);
    setHistory([...history, {
      nodes: result,
      label: `RAKE — odstraněno ${removed.length} listů (${removed.length === 0 ? "žádný" : removed.join(", ")})`,
      removed,
    }]);
  };

  const doCompress = () => {
    const { result, merges } = applyCompress(current.nodes);
    setHistory([...history, {
      nodes: result,
      label: `COMPRESS — sloučeno ${merges.length} párů` + (merges.length === 0 ? " (žádné chainy)" : "") + `, ${merges.map((m) => `${m.absorb}→${m.keep}`).join(", ")}`,
      merges,
    }]);
  };

  const reset = () => {
    setHistory([{ nodes: buildGraph(PRESETS[presetKey]), label: "Vstup — initial tree" }]);
  };

  const stepBack = () => {
    if (history.length > 1) setHistory(history.slice(0, -1));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Controls */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>strom:</span>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} onClick={() => setPresetKey(k)}
            style={{ ...modeBtn, ...(presetKey === k ? activeBtn : {}) }}>{k}</button>
        ))}
      </div>

      {/* Operation buttons */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={doRake} disabled={done} style={opBtn}>RAKE (odstraň listy)</button>
        <button onClick={doCompress} disabled={done} style={opBtnCompress}>COMPRESS (zkrať řetězy)</button>
        <button onClick={stepBack} disabled={history.length === 1} style={navBtn}>← zpět</button>
        <button onClick={reset} style={navBtn}>↻ reset</button>
        <div style={{ flex: 1, textAlign: "right", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          iterace {history.length - 1} &nbsp;·&nbsp; aktivní uzly: <b style={{ color: done ? "oklch(0.55 0.18 142)" : "var(--text)" }}>{aliveCount} / {totalCount}</b>
        </div>
      </div>

      {/* Tree SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Edges */}
        {current.nodes.filter((n) => n.alive && n.parent).map((n) => {
          const p = current.nodes.find((x) => x.id === n.parent && x.alive);
          if (!p) return null;
          const pa = positions[p.id], ch = positions[n.id];
          return <line key={`e-${n.id}`} x1={pa.x} y1={pa.y} x2={ch.x} y2={ch.y}
                       stroke="var(--line-strong)" strokeWidth="1" opacity="0.6" />;
        })}

        {/* Removed/absorbed nodes (ghost) */}
        {current.nodes.filter((n) => !n.alive).map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          return (
            <g key={`gn-${n.id}`} opacity="0.2">
              <circle cx={pos.x} cy={pos.y} r="12" fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.8" strokeDasharray="2 2" />
              <text x={pos.x} y={pos.y + 3} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">{n.id}</text>
            </g>
          );
        })}

        {/* Live nodes */}
        {current.nodes.filter((n) => n.alive).map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const isRecentlyRemoved = current.removed?.includes(n.id);
          const isRoot = n.id === 1;
          return (
            <g key={`n-${n.id}`}>
              <circle cx={pos.x} cy={pos.y} r="16"
                      fill={isRoot ? "oklch(0.62 0.14 252 / 0.3)" : n.absorbed.length > 0 ? "oklch(0.62 0.14 142 / 0.25)" : "var(--bg-card)"}
                      stroke={isRoot ? "var(--accent)" : n.absorbed.length > 0 ? "oklch(0.55 0.18 142)" : "var(--line-strong)"}
                      strokeWidth="1.4" />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">
                {n.id}
              </text>
              {n.absorbed.length > 0 && (
                <text x={pos.x + 17} y={pos.y - 10} fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 142)" fontWeight="600">
                  +{n.absorbed.length}
                </text>
              )}
            </g>
          );
        })}

        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {done ? "✓ kontrahováno na 1 uzel" : "klikni RAKE nebo COMPRESS"}
        </text>
      </svg>

      {/* Description of last step */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.5 }}>{current.label}</div>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
          <b>Rake</b> samotný kolabuje vyvážený strom v log n. <b>Compress</b> samotný zkrátí řetěz v log n. Střídání obou
          funguje na <em>libovolný</em> strom — i lopsided i lineární — vždy v O(log n) iterací.
        </div>
      </div>
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
  padding: "5px 10px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
};
const opBtn = {
  padding: "6px 14px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  fontWeight: 600,
  background: "var(--accent)",
  color: "var(--bg-card)",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};
const opBtnCompress = { ...opBtn, background: "oklch(0.55 0.18 142)" };
