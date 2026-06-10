// 3-SAT ≤_P CLIQUE — interaktivní převodník.
// Z 3-CNF formule se zkonstruuje graf: 3 vrcholy na klauzuli (sloupec),
// hrana mezi vrcholy z různých klauzulí, které nejsou v konfliktu (jeden není
// negací druhého). Pak k-klika ⇔ splnitelné přiřazení.
// Layout: každá klauzule = svislý sloupec; klika tvořena strong-color hranami napříč.
import { useState, useMemo } from "react";

function parseLit(s) {
  s = s.trim();
  if (s.startsWith("¬") || s.startsWith("!")) return { var: s.slice(1), neg: true };
  return { var: s, neg: false };
}
function showLit(l) { return (l.neg ? "¬" : "") + l.var; }
function conflict(a, b) { return a.var === b.var && a.neg !== b.neg; }

const PRESETS = {
  "splnitelná (3 klauzule)": [
    [parseLit("x"), parseLit("y"), parseLit("z")],
    [parseLit("¬x"), parseLit("y"), parseLit("¬z")],
    [parseLit("x"), parseLit("¬y"), parseLit("z")],
  ],
  "splnitelná (4 klauzule)": [
    [parseLit("x"), parseLit("y"), parseLit("z")],
    [parseLit("¬x"), parseLit("y"), parseLit("w")],
    [parseLit("x"), parseLit("¬y"), parseLit("¬w")],
    [parseLit("¬z"), parseLit("¬y"), parseLit("w")],
  ],
  "nesplnitelná (3 prom.)": [
    [parseLit("x"), parseLit("y"), parseLit("z")],
    [parseLit("¬x"), parseLit("y"), parseLit("z")],
    [parseLit("x"), parseLit("¬y"), parseLit("z")],
    [parseLit("x"), parseLit("y"), parseLit("¬z")],
    [parseLit("¬x"), parseLit("¬y"), parseLit("z")],
    [parseLit("¬x"), parseLit("y"), parseLit("¬z")],
    [parseLit("x"), parseLit("¬y"), parseLit("¬z")],
    [parseLit("¬x"), parseLit("¬y"), parseLit("¬z")],
  ],
};

function buildGraph(clauses) {
  const vertices = [];
  clauses.forEach((c, ci) => c.forEach((l, li) => vertices.push({ idx: vertices.length, ci, li, lit: l })));
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const a = vertices[i], b = vertices[j];
      if (a.ci !== b.ci && !conflict(a.lit, b.lit)) edges.push([i, j]);
    }
  }
  return { vertices, edges };
}

function findClique(graph, k) {
  const { vertices } = graph;
  const byClause = {};
  vertices.forEach((v) => { (byClause[v.ci] = byClause[v.ci] || []).push(v.idx); });
  const clauseIdxs = Object.keys(byClause).map(Number).sort();
  if (clauseIdxs.length !== k) return null;
  const adjMatrix = new Set(graph.edges.map(([a, b]) => `${a},${b}`));
  function hasEdge(a, b) {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return adjMatrix.has(`${lo},${hi}`);
  }
  function recurse(idx, chosen) {
    if (idx === clauseIdxs.length) return chosen;
    const opts = byClause[clauseIdxs[idx]];
    for (const v of opts) {
      let ok = true;
      for (const c of chosen) if (!hasEdge(v, c)) { ok = false; break; }
      if (ok) {
        const r = recurse(idx + 1, [...chosen, v]);
        if (r) return r;
      }
    }
    return null;
  }
  return recurse(0, []);
}

function deriveAssignment(graph, clique) {
  const assign = {};
  for (const idx of clique) {
    const lit = graph.vertices[idx].lit;
    assign[lit.var] = !lit.neg;
  }
  return assign;
}

export default function SatClique() {
  const [presetKey, setPresetKey] = useState("splnitelná (3 klauzule)");
  const [showAllEdges, setShowAllEdges] = useState(true);
  const clauses = PRESETS[presetKey];
  const graph = useMemo(() => buildGraph(clauses), [presetKey]);
  const clique = useMemo(() => findClique(graph, clauses.length), [graph, clauses.length]);
  const assignment = clique ? deriveAssignment(graph, clique) : null;

  const k = clauses.length;
  const cliqueSet = new Set(clique || []);

  // Column layout: each clause = column. Width adapts to k.
  const W = 540;
  const H = 280;
  const MARGIN_X = 50;
  const TOP_Y = 50;
  const ROW_H = 60;
  const colX = (ci) => MARGIN_X + ((W - 2 * MARGIN_X) / Math.max(1, k - 1)) * ci;
  const rowY = (li) => TOP_Y + li * ROW_H;

  // For k=1, center the column
  const positions = graph.vertices.map((v) => ({
    x: k === 1 ? W / 2 : colX(v.ci),
    y: rowY(v.li),
  }));

  // Build curved-edge path between two positions
  function edgePath(i, j) {
    const a = positions[i], b = positions[j];
    if (Math.abs(graph.vertices[i].ci - graph.vertices[j].ci) === 1) {
      // adjacent columns → straight line
      return `M${a.x},${a.y} L${b.x},${b.y}`;
    }
    // far columns → arc above
    const midX = (a.x + b.x) / 2;
    const dy = (graph.vertices[j].ci - graph.vertices[i].ci) * 18;
    const ctrlY = Math.min(a.y, b.y) - dy;
    return `M${a.x},${a.y} Q${midX},${ctrlY} ${b.x},${b.y}`;
  }

  return (
    <div style={containerStyle}>
      <div className="viz-controls">
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Formule:</label>
        <select className="viz-select" value={presetKey} onChange={(e) => setPresetKey(e.target.value)}>
          {Object.keys(PRESETS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={showAllEdges} onChange={(e) => setShowAllEdges(e.target.checked)} />
          zobrazit všechny nekonfliktní hrany
        </label>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono, ui-monospace)", textAlign: "center" }}>
        {clauses.map((c, ci) => (
          <span key={ci}>
            {ci > 0 && " ∧ "}
            ({c.map((l, li) => (
              <span key={li}>
                {li > 0 && " ∨ "}
                <span style={{ color: clique && cliqueSet.has(graph.vertices.findIndex((v) => v.ci === ci && v.li === li)) ? "var(--accent)" : "var(--text-muted)" }}>
                  {showLit(l)}
                </span>
              </span>
            ))})
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 620, alignSelf: "center" }} fontFamily="var(--font-mono, ui-monospace)" fontSize="11">
        {/* clause column backgrounds */}
        {Array.from({ length: k }, (_, ci) => (
          <g key={"col" + ci}>
            <rect
              x={colX(ci) - 22}
              y={TOP_Y - 22}
              width={44}
              height={ROW_H * 2 + 44}
              rx={8}
              fill="var(--bg-inset)"
              stroke="var(--line)"
              strokeDasharray="3 2"
              opacity="0.5"
            />
            <text x={colX(ci)} y={TOP_Y - 30} textAnchor="middle" fill="var(--text-muted)" fontSize="11">C{ci + 1}</text>
          </g>
        ))}

        {/* non-clique edges (dim) */}
        {showAllEdges && graph.edges.map(([i, j], idx) => {
          const inClique = cliqueSet.has(i) && cliqueSet.has(j);
          if (inClique) return null;
          return (
            <path
              key={"e" + idx}
              d={edgePath(i, j)}
              stroke="var(--line-strong)"
              strokeWidth="0.6"
              fill="none"
              opacity="0.35"
            />
          );
        })}

        {/* clique edges (highlighted) */}
        {graph.edges.map(([i, j], idx) => {
          const inClique = cliqueSet.has(i) && cliqueSet.has(j);
          if (!inClique) return null;
          return (
            <path
              key={"ce" + idx}
              d={edgePath(i, j)}
              stroke="var(--accent)"
              strokeWidth="2"
              fill="none"
            />
          );
        })}

        {/* vertices */}
        {graph.vertices.map((v, i) => {
          const inClique = cliqueSet.has(i);
          const p = positions[i];
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={15}
                fill={inClique ? "var(--accent)" : "var(--bg-card)"}
                stroke={inClique ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={inClique ? 2.2 : 1.2}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fill={inClique ? "var(--bg-card)" : "var(--text)"}
                fontSize="11"
                fontWeight={inClique ? "bold" : "normal"}
              >
                {showLit(v.lit)}
              </text>
            </g>
          );
        })}

        {/* legend at bottom */}
        <text x={20} y={H - 8} fill="var(--text-faint)" fontSize="10">
          hrana = nekonflikt + různé klauzule &nbsp;·&nbsp; tučná {k}-klika ⇔ splnitelnost
        </text>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 8, fontSize: 12 }}>
        {clique ? (
          <>
            <div style={{ color: "#81b29a", marginBottom: 6 }}>
              ✓ Existuje {k}-klika — formule je splnitelná
            </div>
            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono, ui-monospace)" }}>
              Vybrané literály: {clique.map((idx, i) => (
                <span key={idx}>
                  {i > 0 && " ∧ "}
                  <span style={{ color: "var(--accent)" }}>{showLit(graph.vertices[idx].lit)}</span>
                  <span style={{ color: "var(--text-faint)", fontSize: 10 }}>(C{graph.vertices[idx].ci + 1})</span>
                </span>
              ))}
            </div>
            <div style={{ color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono, ui-monospace)" }}>
              Přiřazení: {Object.entries(assignment).map(([v, b], i) => (
                <span key={v}>
                  {i > 0 && ", "}
                  {v} = <span style={{ color: b ? "#81b29a" : "#e07a5f" }}>{b ? "1" : "0"}</span>
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: "#e07a5f", marginBottom: 4 }}>
              ✗ Žádná {k}-klika — formule je nesplnitelná
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              Žádné konzistentní vybrání po jednom literálu z každé klauzule (= žádná k-klika v grafu).
            </div>
          </>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Konstrukce: pro každou klauzuli C<sub>i</sub> tři vrcholy (sloupec); hrana mezi vrcholy
        z různých klauzulí, pokud nejsou v konfliktu (jeden není negací druhého). Pak: formule
        splnitelná ⇔ existuje k-klika (jeden vrchol z každé klauzule, všichni navzájem spojeni).
      </div>
    </div>
  );
}

const containerStyle = {
  padding: 16,
  borderRadius: 12,
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
