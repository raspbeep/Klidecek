// GP subtree crossover. Two parent expression trees are shown.
// Pick a crossover node in each parent; "Zkřížit" swaps the subtrees rooted there,
// producing two offspring whose size/depth changes accordingly.
import { useState } from "react";

// A tree node: { v: label, k: kind ("fn"|"term"), c: [children] }
// Parent A:  (x + 1) * x       Parent B:  (y - 2) / (x + y)
const PARENT_A = {
  id: "a0", v: "*", k: "fn", c: [
    { id: "a1", v: "+", k: "fn", c: [
      { id: "a2", v: "x", k: "term", c: [] },
      { id: "a3", v: "1", k: "term", c: [] },
    ]},
    { id: "a4", v: "x", k: "term", c: [] },
  ],
};
const PARENT_B = {
  id: "b0", v: "/", k: "fn", c: [
    { id: "b1", v: "-", k: "fn", c: [
      { id: "b2", v: "y", k: "term", c: [] },
      { id: "b3", v: "2", k: "term", c: [] },
    ]},
    { id: "b4", v: "+", k: "fn", c: [
      { id: "b5", v: "x", k: "term", c: [] },
      { id: "b6", v: "y", k: "term", c: [] },
    ]},
  ],
};

const clone = (n) => ({ ...n, c: n.c.map(clone) });
const reId = (n, p) => ({ ...n, id: p + n.id, c: n.c.map((ch) => reId(ch, p)) });
const size = (n) => 1 + n.c.reduce((s, ch) => s + size(ch), 0);
const depth = (n) => (n.c.length ? 1 + Math.max(...n.c.map(depth)) : 1);
const expr = (n) =>
  n.c.length ? `(${expr(n.c[0])} ${n.v} ${n.c.length > 1 ? expr(n.c[1]) : ""})`.replace(/\s+/g, " ").trim() : n.v;

// replace the subtree with id == targetId by `sub` (cloned)
function replaceAt(node, targetId, sub) {
  if (node.id === targetId) return clone(sub);
  return { ...node, c: node.c.map((ch) => replaceAt(ch, targetId, sub)) };
}
function findById(node, id) {
  if (node.id === id) return node;
  for (const ch of node.c) { const r = findById(ch, id); if (r) return r; }
  return null;
}

// assign x/y positions (compact layout) within a box of width w
function layout(node, x0, x1, depthLevel, dy, out) {
  const mid = (x0 + x1) / 2;
  out.push({ id: node.id, v: node.v, k: node.k, x: mid, y: 22 + depthLevel * dy });
  const n = node.c.length;
  node.c.forEach((ch, i) => {
    const cx0 = x0 + (i / n) * (x1 - x0);
    const cx1 = x0 + ((i + 1) / n) * (x1 - x0);
    layout(ch, cx0, cx1, depthLevel + 1, dy, out);
  });
}

function edges(node) {
  const e = [];
  const walk = (p) => p.c.forEach((ch) => { e.push([p.id, ch.id]); walk(ch); });
  walk(node);
  return e;
}

function TreePanel({ root, sel, onSel, title, w, h, accentSel }) {
  const nodes = [];
  layout(root, 6, w - 6, 0, (h - 40) / Math.max(depth(root), 2), nodes);
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const eg = edges(root);
  // mark every node in the selected subtree (highlight what will be swapped)
  const selSet = new Set();
  if (sel) { const s = findById(root, sel); const mark = (n) => { selSet.add(n.id); n.c.forEach(mark); }; if (s) mark(s); }

  return (
    <div style={{ flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 2 }}>{title}</div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", display: "block" }}>
        <rect width={w} height={h} fill="var(--bg-inset)" rx="3" />
        {eg.map(([a, b], i) => (
          <line key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y}
            stroke={selSet.has(b) ? accentSel : "var(--line-strong)"}
            strokeWidth={selSet.has(b) ? 1.6 : 1} opacity={selSet.has(b) ? 0.9 : 0.55} />
        ))}
        {nodes.map((n) => {
          const inSub = selSet.has(n.id);
          const isRoot = n.id === sel;
          return (
            <g key={n.id} onClick={() => onSel(n.id)} style={{ cursor: "pointer" }}>
              <circle cx={n.x} cy={n.y} r="11"
                fill={inSub ? accentSel : (n.k === "fn" ? "var(--bg-card)" : "var(--bg-card)")}
                opacity={inSub ? (isRoot ? 0.95 : 0.55) : 1}
                stroke={isRoot ? accentSel : "var(--line)"}
                strokeWidth={isRoot ? 2 : 0.8} />
              <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontFamily="var(--font-mono)" fontWeight={n.k === "fn" ? 700 : 500}
                fill={inSub ? "var(--bg-inset)" : "var(--text)"}>{n.v}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function GpCrossover() {
  const [parents, setParents] = useState({ a: clone(PARENT_A), b: clone(PARENT_B) });
  const [selA, setSelA] = useState("a1"); // default: the (x+1) subtree
  const [selB, setSelB] = useState("b4"); // default: the (x+y) subtree
  const [children, setChildren] = useState(null);

  const cross = () => {
    const subA = findById(parents.a, selA);
    const subB = findById(parents.b, selB);
    if (!subA || !subB) return;
    // child1 = A with selA replaced by subB ; child2 = B with selB replaced by subA
    const c1 = reId(replaceAt(parents.a, selA, subB), "c");
    const c2 = reId(replaceAt(parents.b, selB, subA), "d");
    setChildren({ c1, c2 });
  };

  const reset = () => { setChildren(null); setSelA("a1"); setSelB("b4"); };

  const pw = 158, ph = 130;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <TreePanel root={parents.a} sel={selA} onSel={setSelA}
          title={`rodič A  =  ${expr(parents.a)}`} w={pw} h={ph} accentSel="var(--accent)" />
        <TreePanel root={parents.b} sel={selB} onSel={setSelB}
          title={`rodič B  =  ${expr(parents.b)}`} w={pw} h={ph} accentSel="var(--accent-line)" />
      </div>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={cross}>Zkřížit (vyměnit podstromy)</button>
        <button className="viz-btn" onClick={reset}>Reset</button>
        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>klikni uzel = bod křížení</span>
      </div>

      {children && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TreePanel root={children.c1} sel={null} onSel={() => {}}
            title={`potomek 1  (vel. ${size(children.c1)})`} w={pw} h={ph} accentSel="var(--accent)" />
          <TreePanel root={children.c2} sel={null} onSel={() => {}}
            title={`potomek 2  (vel. ${size(children.c2)})`} w={pw} h={ph} accentSel="var(--accent-line)" />
        </div>
      )}

      <span className="viz-readout">
        {children
          ? `potomek 1 = ${expr(children.c1)}  ·  potomek 2 = ${expr(children.c2)}`
          : `bod A = podstrom "${expr(findById(parents.a, selA) || PARENT_A)}"  ·  bod B = "${expr(findById(parents.b, selB) || PARENT_B)}"`}
      </span>
    </div>
  );
}
