// Median Finding and Splitting (paralelní quicksort).
// Strom s log n listy. Každý vnitřní uzel najde medián své posloupnosti
// a rozdělí na ≤M (levý syn) a >M (pravý syn). Listy seřadí sekvenčně.
// Ověřeno: vstup [4,1,7,3,8,2,6,5] → výstup [1,2,3,4,5,6,7,8] ✓
import { useState, useMemo } from "react";

const PRESETS = {
  "klasický": [4, 1, 7, 3, 8, 2, 6, 5],
  "reverzní": [8, 7, 6, 5, 4, 3, 2, 1],
  "duplikáty": [3, 3, 5, 5, 1, 1, 7, 7],
  "skoro seřazený": [1, 2, 3, 4, 5, 6, 8, 7],
};

// Build the tree of states. Tree has m = leaves (power of 2).
// For n elements + m leaves, each leaf gets n/m elements.
// Level 0 = root, level log2(m) = leaves.
// Tree node indices: heap-style. root=0, children of i are 2i+1, 2i+2.

// Find median such that ≤M has ceil(seq.length/2) elements.
function findMedian(seq) {
  if (seq.length === 0) return null;
  const sorted = seq.slice().sort((a, b) => a - b);
  const idx = Math.ceil(seq.length / 2) - 1;
  return sorted[idx];
}

// Split sequence by pivot M: ≤M to left (preserving original order), >M to right.
// Special handling for duplicates: we need exactly ceil(n/2) elements in ≤ group.
function splitByMedian(seq, M) {
  // Count elements <M (strict), =M, and >M.
  const lt = seq.filter((x) => x < M);
  const eq = seq.filter((x) => x === M);
  const gt = seq.filter((x) => x > M);
  const targetL = Math.ceil(seq.length / 2);
  const numEqForL = Math.max(0, targetL - lt.length);
  // Build L: all <M in original order + first numEqForL occurrences of M in original order.
  let eqCount = 0;
  const L = [];
  const R = [];
  for (const x of seq) {
    if (x < M) L.push(x);
    else if (x === M) {
      if (eqCount < numEqForL) {
        L.push(x);
        eqCount++;
      } else {
        R.push(x);
      }
    } else {
      R.push(x);
    }
  }
  return { L, R };
}

function buildSimulation(input, m) {
  const n = input.length;
  const numLevels = Math.log2(m) + 1; // levels of nodes: root + (log m) more = log m + 1
  const states = [];

  // Each state is a snapshot: tree[id] = {seq, median (or null), sorted (for leaves)}.
  // We'll use a flat array indexed by heap index.
  // Number of nodes = 2m - 1.
  // Internal: indices 0 .. m-2. Leaves: m-1 .. 2m-2.

  const totalNodes = 2 * m - 1;

  // Step 0: only root has sequence.
  let tree = Array.from({ length: totalNodes }, () => ({ seq: [], median: null, sorted: null }));
  tree[0] = { seq: input.slice(), median: null, sorted: null };
  states.push({
    phase: "init",
    label: "Inicializace — kořen má celou posloupnost, ostatní uzly prázdné",
    tree: tree.map((t) => ({ ...t, seq: t.seq.slice() })),
  });

  // For each level (root downward), find median and split.
  for (let lvl = 0; lvl < numLevels - 1; lvl++) {
    // Process all nodes at this level
    const startIdx = Math.pow(2, lvl) - 1;
    const endIdx = Math.pow(2, lvl + 1) - 2;
    // First sub-step: find medians for all nodes at this level
    const newTree = tree.map((t) => ({ ...t, seq: t.seq.slice() }));
    let anyAction = false;
    for (let i = startIdx; i <= endIdx; i++) {
      if (newTree[i].seq.length > 1) {
        newTree[i].median = findMedian(newTree[i].seq);
        anyAction = true;
      }
    }
    if (anyAction) {
      states.push({
        phase: "median",
        label: `Úroveň ${lvl}: každý uzel najde medián své posloupnosti`,
        tree: newTree.map((t) => ({ ...t, seq: t.seq.slice() })),
      });
    }

    // Second sub-step: split and send to children
    const splitTree = newTree.map((t) => ({ ...t, seq: t.seq.slice() }));
    let anySplit = false;
    for (let i = startIdx; i <= endIdx; i++) {
      if (splitTree[i].median !== null && splitTree[i].seq.length > 1) {
        const { L, R } = splitByMedian(splitTree[i].seq, splitTree[i].median);
        splitTree[2 * i + 1] = { seq: L, median: null, sorted: null };
        splitTree[2 * i + 2] = { seq: R, median: null, sorted: null };
        splitTree[i] = { seq: splitTree[i].seq, median: splitTree[i].median, sorted: null, split: true };
        anySplit = true;
      }
    }
    if (anySplit) {
      states.push({
        phase: "split",
        label: `Úroveň ${lvl}: split podle mediánu — ≤M jde k levému synovi, >M k pravému`,
        tree: splitTree.map((t) => ({ ...t, seq: t.seq.slice() })),
      });
    }
    tree = splitTree;
  }

  // Final: leaves sort their sequences
  const leafTree = tree.map((t) => ({ ...t, seq: t.seq.slice() }));
  for (let i = m - 1; i < 2 * m - 1; i++) {
    leafTree[i].sorted = leafTree[i].seq.slice().sort((a, b) => a - b);
  }
  states.push({
    phase: "leaf-sort",
    label: "Listy seřadí svou podposloupnost sekvenčně (lokálně)",
    tree: leafTree.map((t) => ({ ...t, seq: t.seq.slice(), sorted: t.sorted ? t.sorted.slice() : null })),
  });

  // Final output: concatenate leaves left-to-right
  const output = [];
  for (let i = m - 1; i < 2 * m - 1; i++) {
    if (leafTree[i].sorted) output.push(...leafTree[i].sorted);
  }
  states.push({
    phase: "output",
    label: "Konkatenace listů zleva doprava = seřazený výstup",
    tree: leafTree.map((t) => ({ ...t, seq: t.seq.slice(), sorted: t.sorted ? t.sorted.slice() : null })),
    output,
  });

  return states;
}

function isCorrectlySorted(input, output) {
  if (!output || output.length !== input.length) return false;
  const sorted = input.slice().sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) if (sorted[i] !== output[i]) return false;
  return true;
}

export default function MedianSplitting() {
  const [presetKey, setPresetKey] = useState("klasický");
  const [step, setStep] = useState(0);

  const input = PRESETS[presetKey];
  const m = 4; // 4 leaves for n=8 → 2 levels of internal nodes
  const states = useMemo(() => buildSimulation(input, m), [input]);
  const cur = states[Math.min(step, states.length - 1)];

  useMemo(() => { setStep(0); }, [presetKey]);

  const W = 560, H = 360;
  const numLevels = Math.log2(m) + 1; // 3 for m=4

  const levelY = (level) => 50 + (level * (H - 130)) / (numLevels - 1);
  const nodeX = (id, level) => {
    const idxInLevel = id - (Math.pow(2, level) - 1);
    const totalInLevel = Math.pow(2, level);
    return 30 + ((idxInLevel + 0.5) * (W - 60)) / totalInLevel;
  };

  const lastState = states[states.length - 1];
  const verified = lastState.output ? isCorrectlySorted(input, lastState.output) : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>vstup:</span>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} className="viz-btn" data-active={presetKey === k} onClick={() => setPresetKey(k)}>{k}</button>
        ))}
      </div>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          fáze {step + 1} / {states.length}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(states.length - 1, step + 1))} disabled={step >= states.length - 1}>další →</button>
        <button className="viz-btn" onClick={() => setStep(states.length - 1)}>⏭</button>
        <button className="viz-btn" onClick={() => setStep(0)}>↻</button>
      </div>

      {/* Tree SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Edges */}
        {cur.tree.map((nd, i) => {
          const level = Math.floor(Math.log2(i + 1));
          if (level === numLevels - 1) return null; // leaf
          const px = nodeX(i, level), py = levelY(level);
          const lcN = 2 * i + 1, rcN = 2 * i + 2;
          if (lcN >= cur.tree.length) return null;
          const lcLevel = level + 1;
          const lcX = nodeX(lcN, lcLevel), lcY = levelY(lcLevel);
          const rcX = nodeX(rcN, lcLevel), rcY = levelY(lcLevel);
          const isActive = cur.phase === "split" && cur.tree[i].split;
          return (
            <g key={`e-${i}`}>
              <line x1={px} y1={py + 18} x2={lcX} y2={lcY - 18}
                    stroke={isActive ? "var(--accent)" : "var(--line-strong)"} strokeWidth={isActive ? 1.6 : 0.8} opacity={isActive ? 0.95 : 0.5} />
              <line x1={px} y1={py + 18} x2={rcX} y2={rcY - 18}
                    stroke={isActive ? "oklch(0.55 0.18 65)" : "var(--line-strong)"} strokeWidth={isActive ? 1.6 : 0.8} opacity={isActive ? 0.95 : 0.5} />
            </g>
          );
        })}

        {/* Nodes */}
        {cur.tree.map((nd, i) => {
          const level = Math.floor(Math.log2(i + 1));
          const x = nodeX(i, level);
          const y = levelY(level);
          const isLeaf = level === numLevels - 1;
          const empty = nd.seq.length === 0 && !nd.sorted;
          const showSorted = isLeaf && nd.sorted;
          // Box width depends on content
          const content = showSorted ? `[${nd.sorted.join(",")}]` : empty ? "" : `[${nd.seq.join(",")}]`;
          const w = Math.max(50, content.length * 7.5);
          return (
            <g key={`n-${i}`}>
              <rect x={x - w / 2} y={y - 16} width={w} height={32} rx="4"
                    fill={showSorted ? "oklch(0.62 0.14 142 / 0.3)" : empty ? "var(--bg-card)" : "oklch(0.62 0.14 252 / 0.2)"}
                    stroke={showSorted ? "oklch(0.55 0.18 142)" : empty ? "var(--line-strong)" : "var(--accent)"}
                    strokeWidth="1.2"
                    strokeDasharray={empty ? "3 3" : ""} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">
                {empty ? "∅" : content}
              </text>
              {nd.median !== null && cur.phase !== "init" && (
                <text x={x} y={y - 22} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 22)" fontWeight="600">
                  M={nd.median}
                </text>
              )}
            </g>
          );
        })}

        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
          Median Finding and Splitting — m={m} listů, n={input.length} prvků
        </text>

        {/* Output stream at bottom */}
        {cur.output && (
          <g>
            <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="11" fontWeight="700" fill="oklch(0.55 0.18 142)">
              výstup: [{cur.output.join(", ")}]
            </text>
          </g>
        )}
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{cur.label}</div>
        {step === states.length - 1 && verified && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: "oklch(0.55 0.18 142)", fontFamily: "var(--font-mono)" }}>
            ✓ ověřeno: výstup je správně seřazen
          </div>
        )}
      </div>

      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        Mediánový pivot garantuje <b style={{ color: "var(--text)" }}>perfektní rozdělení</b> (na rozdíl od náhodného pivota).
        <br />
        Čas: <b style={{ color: "var(--text)" }}>O(n)</b> · procesory: <b style={{ color: "var(--text)" }}>O(log n)</b> · cena: <b style={{ color: "var(--accent)" }}>O(n log n) — cost-optimal</b>
      </div>
    </div>
  );
}

