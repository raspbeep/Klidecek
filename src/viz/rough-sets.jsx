// Rough-set approximation of a target set X over a universe partitioned
// into equivalence (elementary) classes.
// Click cells to toggle membership in X. Cells are colored by region:
//   lower approximation (certainly in X), boundary (maybe), outside.
// Readouts: |lower|, |upper|, accuracy alpha = |lower|/|upper|.
import { useState } from "react";

export default function RoughSets() {
  // 12 objects laid out on a 4x3 grid, partitioned into 4 elementary classes.
  // Each class = a block of cells that are mutually indiscernible by attributes.
  const cells = [
    // class 0
    { id: 0, cls: 0, c: 0, r: 0 }, { id: 1, cls: 0, c: 1, r: 0 },
    { id: 2, cls: 0, c: 0, r: 1 }, { id: 3, cls: 0, c: 1, r: 1 },
    // class 1
    { id: 4, cls: 1, c: 2, r: 0 }, { id: 5, cls: 1, c: 3, r: 0 },
    { id: 6, cls: 1, c: 2, r: 1 },
    // class 2
    { id: 7, cls: 2, c: 0, r: 2 }, { id: 8, cls: 2, c: 1, r: 2 },
    { id: 9, cls: 2, c: 2, r: 2 },
    // class 3
    { id: 10, cls: 3, c: 3, r: 1 }, { id: 11, cls: 3, c: 3, r: 2 },
  ];
  const classes = [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11]];

  // membership of each object in the target set X (start: a "rough" set)
  const [inX, setInX] = useState(() => {
    const s = new Set([0, 1, 4, 5, 7, 8, 9]); // class2 fully in, class0/1 partial
    return s;
  });
  const toggle = (id) => {
    setInX((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // classify each class as: "lower" (subset of X), "boundary" (meets X but not subset), "neg"
  const classRegion = classes.map((cl) => {
    const hits = cl.filter((id) => inX.has(id)).length;
    if (hits === 0) return "neg";
    if (hits === cl.length) return "lower";
    return "bnd";
  });

  const lowerCount = classes.reduce((s, cl, i) => s + (classRegion[i] === "lower" ? cl.length : 0), 0);
  const upperCount = classes.reduce((s, cl, i) => s + (classRegion[i] !== "neg" ? cl.length : 0), 0);
  const bndCount = upperCount - lowerCount;
  const alpha = upperCount === 0 ? 1 : lowerCount / upperCount;
  const crisp = bndCount === 0;

  const regionColor = (reg) => {
    if (reg === "lower") return "color-mix(in oklch, var(--accent) 55%, var(--bg-card))";
    if (reg === "bnd") return "color-mix(in oklch, var(--accent) 18%, var(--bg-card))";
    return "var(--bg-card)";
  };

  // SVG geometry
  const G = 38, pad = 14, cols = 4, rows = 3;
  const W = pad * 2 + cols * G + 96; // room for legend column
  const H = pad * 2 + rows * G + 8;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* class outlines (thick) drawn first */}
        {classes.map((cl, i) => {
          const xs = cl.map((id) => cells[id].c);
          const ys = cl.map((id) => cells[id].r);
          return cl.map((id) => {
            const cell = cells[id];
            const x = pad + cell.c * G, y = pad + cell.r * G;
            // draw class border edges only where neighbor isn't same class
            const same = (cc, rr) => cl.some((j) => cells[j].c === cc && cells[j].r === rr);
            return (
              <g key={"b" + id}>
                {!same(cell.c, cell.r - 1) && <line x1={x} y1={y} x2={x + G} y2={y} stroke="var(--line-strong)" strokeWidth="2" />}
                {!same(cell.c, cell.r + 1) && <line x1={x} y1={y + G} x2={x + G} y2={y + G} stroke="var(--line-strong)" strokeWidth="2" />}
                {!same(cell.c - 1, cell.r) && <line x1={x} y1={y} x2={x} y2={y + G} stroke="var(--line-strong)" strokeWidth="2" />}
                {!same(cell.c + 1, cell.r) && <line x1={x + G} y1={y} x2={x + G} y2={y + G} stroke="var(--line-strong)" strokeWidth="2" />}
              </g>
            );
          });
        })}

        {/* cells */}
        {cells.map((cell) => {
          const x = pad + cell.c * G, y = pad + cell.r * G;
          const reg = classRegion[cell.cls];
          const member = inX.has(cell.id);
          return (
            <g key={cell.id} onClick={() => toggle(cell.id)} style={{ cursor: "pointer" }}>
              <rect x={x + 2} y={y + 2} width={G - 4} height={G - 4} rx="4"
                fill={regionColor(reg)}
                stroke="var(--line)" strokeWidth="0.7" />
              {/* dot marks "this object is in X" */}
              {member && (
                <circle cx={x + G / 2} cy={y + G / 2} r="5.5"
                  fill="var(--accent)" stroke="var(--bg-inset)" strokeWidth="1.2" />
              )}
            </g>
          );
        })}

        {/* legend */}
        {(() => {
          const lx = pad + cols * G + 14;
          const items = [
            ["lower", "dolní apr."],
            ["bnd", "hranice"],
            ["neg", "mimo"],
          ];
          return (
            <g>
              {items.map(([reg, label], i) => (
                <g key={reg}>
                  <rect x={lx} y={pad + 4 + i * 22} width={14} height={14} rx="3"
                    fill={regionColor(reg)} stroke="var(--line)" strokeWidth="0.7" />
                  <text x={lx + 20} y={pad + 15 + i * 22} fontSize="9.5"
                    fontFamily="var(--font-mono)" fill="var(--text-muted)">{label}</text>
                </g>
              ))}
              <circle cx={lx + 7} cy={pad + 4 + 3 * 22 + 7} r="5" fill="var(--accent)" />
              <text x={lx + 20} y={pad + 15 + 3 * 22} fontSize="9.5"
                fontFamily="var(--font-mono)" fill="var(--text-muted)">∈ X</text>
            </g>
          );
        })()}
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>klikni buňku → přepni členství v cílové množině X</span>
      </div>

      <div style={{ fontSize: 11.5, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <div>|dolní apr. S(X)| = <b style={{ color: "var(--text)" }}>{lowerCount}</b> · |horní apr. S̄(X)| = <b style={{ color: "var(--text)" }}>{upperCount}</b> · |hranice| = <b style={{ color: "var(--accent)" }}>{bndCount}</b></div>
        <div>přesnost α = |S(X)|/|S̄(X)| = <b style={{ color: "var(--accent)" }}>{alpha.toFixed(2)}</b>
          {" → "}
          <b style={{ color: "var(--text)" }}>{crisp ? "přesná (ostrá) množina" : "hrubá množina"}</b>
        </div>
      </div>
    </div>
  );
}
