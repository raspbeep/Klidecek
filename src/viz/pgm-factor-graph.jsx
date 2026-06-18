// One and the same distribution shown as a Bayesian network, an MRF, and a factor graph.
// Model: P(x1) P(x2) P(x3 | x1, x2)  — a classic collider x1 -> x3 <- x2.
// The segmented control switches the representation; edges/arrows and (in FG mode)
// square factor nodes appear/disappear, and the readout shows that representation's
// factorisation. Shows the moralization edge x1-x2 that BN->MRF must add.
import { useState } from "react";

const POS = { x1: [60, 40], x2: [220, 40], x3: [140, 130] };
// factor-node positions for the FG view
const FPOS = { fa: [60, 90], fb: [220, 90], fc: [140, 85] };

export default function PgmFactorGraph() {
  const [view, setView] = useState("bn"); // bn | mrf | fg

  const W = 280, H = 175;

  const VAR = (id, p) => (
    <g key={id}>
      <circle cx={p[0]} cy={p[1]} r="15"
        fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.4" />
      <text x={p[0]} y={p[1] + 1} textAnchor="middle" dominantBaseline="central"
        fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--text)">
        {id}
      </text>
    </g>
  );

  // straight directed arrow (for BN), trimmed to node radius
  const arrow = (a, b, key) => {
    const p = POS[a], q = POS[b];
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const x1 = p[0] + ux * 15, y1 = p[1] + uy * 15;
    const x2 = q[0] - ux * 15, y2 = q[1] - uy * 15;
    const ax = x2 - ux * 8, ay = y2 - uy * 8;
    const nx = -uy, ny = ux;
    return (
      <g key={key}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent-line)" strokeWidth="1.6" />
        <polygon points={`${x2},${y2} ${ax + nx * 4},${ay + ny * 4} ${ax - nx * 4},${ay - ny * 4}`}
          fill="var(--accent-line)" />
      </g>
    );
  };

  // plain undirected edge between two var positions
  const undir = (a, b, key, dashed = false) => {
    const p = POS[a], q = POS[b];
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    return (
      <line key={key} x1={p[0] + ux * 15} y1={p[1] + uy * 15}
        x2={q[0] - ux * 15} y2={q[1] - uy * 15}
        stroke="var(--line-strong)" strokeWidth="1.6"
        strokeDasharray={dashed ? "4 3" : undefined} />
    );
  };

  // edge from a variable to a factor square (for FG)
  const fgEdge = (varId, fId, key) => {
    const p = POS[varId], q = FPOS[fId];
    return <line key={key} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]}
      stroke="var(--line-strong)" strokeWidth="1.3" />;
  };

  const factorSquare = (fId, label) => {
    const q = FPOS[fId];
    return (
      <g key={fId}>
        <rect x={q[0] - 8} y={q[1] - 8} width={16} height={16}
          fill="var(--accent)" stroke="var(--accent-line)" strokeWidth="1" rx="2" />
        <text x={q[0]} y={q[1] + 22} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {label}
        </text>
      </g>
    );
  };

  const factor =
    view === "bn" ? "P(x1) · P(x2) · P(x3 | x1, x2)"
    : view === "mrf" ? "(1/Z) · ψ(x1,x2,x3)"
    : "(1/Z) · fa(x1) · fb(x2) · fc(x1,x2,x3)";

  const note =
    view === "bn" ? "Orientované šipky: x1 a x2 jsou rodiče kolideru x3."
    : view === "mrf" ? "Šipky zmizely; moralizace přidá hranu x1—x2 (čárkovaně), protože sdílí faktor přes x3 → jedna klika {x1,x2,x3}."
    : "Bipartitní: čtverečky = faktory. fa, fb pokrývají priory, fc sdružený člen P(x3|x1,x2).";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>reprezentace:</span>
        {[["bn", "Bayes síť"], ["mrf", "MRF"], ["fg", "faktorový graf"]].map(([k, lbl]) => (
          <button key={k} className="viz-seg" data-active={view === k} onClick={() => setView(k)}>
            {lbl}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* BN: directed arrows x1->x3, x2->x3 */}
        {view === "bn" && [arrow("x1", "x3", "a1"), arrow("x2", "x3", "a2")]}

        {/* MRF: undirected edges + moralization edge x1-x2 */}
        {view === "mrf" && [
          undir("x1", "x3", "m1"),
          undir("x2", "x3", "m2"),
          undir("x1", "x2", "moral", true),
        ]}

        {/* FG: factor squares + var-factor edges */}
        {view === "fg" && [
          fgEdge("x1", "fa", "e1"),
          fgEdge("x2", "fb", "e2"),
          fgEdge("x1", "fc", "e3"),
          fgEdge("x2", "fc", "e4"),
          fgEdge("x3", "fc", "e5"),
          factorSquare("fa", "fa"),
          factorSquare("fb", "fb"),
          factorSquare("fc", "fc"),
        ]}

        {Object.entries(POS).map(([id, p]) => VAR(id, p))}

        {view === "mrf" && (
          <text x={140} y={28} textAnchor="middle" fontSize="8.5" fontStyle="italic"
            fontFamily="var(--font-mono)" fill="var(--accent)">
            + moralizační hrana
          </text>
        )}
      </svg>

      <div style={{ fontSize: 11.5, lineHeight: 1.6, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <div>faktorizace: <b style={{ color: "var(--text)" }}>{factor}</b></div>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>{note}</div>
    </div>
  );
}
