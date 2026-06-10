// Composite — interaktivní strom souborů/složek. Vyber uzel-složku, přidej
// do něj soubor (Leaf) nebo podsložku (Composite). Tlačítko show() spustí
// rekurzivní průchod do hloubky a postupně rozsvítí navštívené uzly.
import { useState, useEffect, useRef } from "react";

let uid = 1;
const mkFolder = (name) => ({ id: uid++, type: "folder", name, children: [] });
const mkFile = (name) => ({ id: uid++, type: "file", name });

const initial = () => {
  uid = 1;
  const root = mkFolder("root");
  const docs = mkFolder("docs");
  docs.children.push(mkFile("a.txt"));
  root.children.push(docs);
  root.children.push(mkFile("readme.md"));
  return root;
};

// depth-first pre-order traversal -> list of node ids (the order show() visits)
function preorder(node, acc = []) {
  acc.push(node.id);
  if (node.type === "folder") node.children.forEach((c) => preorder(c, acc));
  return acc;
}

// layout: assign x by in-order index, y by depth
function layout(node, depth, cursor, out) {
  const childStart = cursor.x;
  if (node.type === "folder" && node.children.length) {
    node.children.forEach((c) => layout(c, depth + 1, cursor, out));
    const kids = out.filter((o) => node.children.some((c) => c.id === o.id));
    node._x = (kids[0].x + kids[kids.length - 1].x) / 2;
  } else {
    node._x = cursor.x;
    cursor.x += 1;
  }
  out.push({ id: node.id, x: node._x, y: depth, type: node.type, name: node.name });
  return out;
}

export default function AisCompositeTree() {
  const [root, setRoot] = useState(initial);
  const [sel, setSel] = useState(1); // selected folder id
  const [visited, setVisited] = useState([]);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const find = (node, id) => {
    if (node.id === id) return node;
    if (node.type === "folder")
      for (const c of node.children) {
        const r = find(c, id);
        if (r) return r;
      }
    return null;
  };

  const clone = (node) =>
    node.type === "folder"
      ? { ...node, children: node.children.map(clone) }
      : { ...node };

  const addTo = (kind) => {
    const next = clone(root);
    const target = find(next, sel);
    if (!target || target.type !== "folder") return;
    const n = target.children.length + 1;
    target.children.push(kind === "file" ? mkFile(`f${n}.txt`) : mkFolder(`dir${n}`));
    setRoot(next);
    setVisited([]);
    setPlaying(false);
    clearTimeout(timer.current);
  };

  const runShow = () => {
    clearTimeout(timer.current);
    const order = preorder(root);
    setVisited([]);
    setPlaying(true);
    let i = 0;
    const tick = () => {
      i += 1;
      setVisited(order.slice(0, i));
      if (i < order.length) timer.current = setTimeout(tick, 420);
      else setPlaying(false);
    };
    timer.current = setTimeout(tick, 200);
  };

  const reset = () => {
    clearTimeout(timer.current);
    setRoot(initial());
    setSel(1);
    setVisited([]);
    setPlaying(false);
  };

  // compute layout
  const nodes = layout(clone(root), 0, { x: 0 }, []);
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const cols = Math.max(1, Math.max(...nodes.map((n) => n.x)) + 1);
  const rows = Math.max(1, Math.max(...nodes.map((n) => n.y)) + 1);
  const W = 460, H = 30 + rows * 56;
  const colW = (W - 40) / cols;
  const px = (n) => 20 + (n.x + 0.5) * colW;
  const py = (n) => 26 + n.y * 56;

  // edges parent->child
  const edges = [];
  const walk = (node) => {
    if (node.type === "folder")
      node.children.forEach((c) => {
        edges.push([node.id, c.id]);
        walk(c);
      });
  };
  walk(root);

  const selNode = find(root, sel);
  const selValid = selNode && selNode.type === "folder";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls" style={{ fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)" }}>
          cíl: <code>{selValid ? selNode.name : "—"}</code>
        </span>
        <button className="viz-btn" disabled={!selValid || playing} onClick={() => addTo("file")}>+ soubor (Leaf)</button>
        <button className="viz-btn" disabled={!selValid || playing} onClick={() => addTo("folder")}>+ složka (Composite)</button>
        <button className="viz-btn primary" disabled={playing} onClick={runShow}>▶ show()</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
        {edges.map(([p, c], i) => (
          <line key={i} x1={px(byId[p])} y1={py(byId[p]) + 13} x2={px(byId[c])} y2={py(byId[c]) - 13}
            stroke="var(--line-strong)" strokeWidth="1" />
        ))}
        {nodes.map((n) => {
          const isFolder = n.type === "folder";
          const seen = visited.includes(n.id);
          const isSel = n.id === sel && isFolder;
          const hue = isFolder ? 142 : 264;
          return (
            <g key={n.id} style={{ cursor: isFolder ? "pointer" : "default" }}
              onClick={() => isFolder && !playing && setSel(n.id)}>
              {isFolder ? (
                <rect x={px(n) - 30} y={py(n) - 13} width="60" height="26" rx="4"
                  fill={seen ? `oklch(0.62 0.14 ${hue} / 0.4)` : `oklch(0.62 0.14 ${hue} / 0.12)`}
                  stroke={`oklch(0.62 0.14 ${hue})`} strokeWidth={isSel ? 2.2 : 1.1} />
              ) : (
                <circle cx={px(n)} cy={py(n)} r="13"
                  fill={seen ? `oklch(0.62 0.14 ${hue} / 0.4)` : `oklch(0.62 0.14 ${hue} / 0.12)`}
                  stroke={`oklch(0.62 0.14 ${hue})`} strokeWidth="1.1" />
              )}
              <text x={px(n)} y={py(n) + 4} textAnchor="middle" fontSize="9.5"
                fontFamily="var(--font-mono)" fill="var(--text)">{n.name}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Klikni na <strong style={{ color: "oklch(0.5 0.14 142)" }}>složku</strong> (Composite) a přidej do ní soubor nebo podsložku — strom roste do
        libovolné hloubky. <strong>show()</strong> spustí <em>pre-order</em> průchod: každá složka deleguje
        <code> show()</code> na svoje děti, takže klient nikdy nerozlišuje list od složeniny.
      </div>
    </div>
  );
}
