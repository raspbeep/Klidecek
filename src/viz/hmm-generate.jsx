// Generative view of a small HMM (weather -> activity).
// "krok" performs one step of the random walk: pick the next hidden state by the
// transition matrix A, then emit an observation by the emission matrix B.
// We show the HIDDEN state path (top, faint) vs the OBSERVED symbols (bottom).
import { useState } from "react";

export default function HmmGenerate() {
  // Hidden states (weather) and observable symbols (activity).
  const STATES = [
    { key: "slunce", color: "var(--accent)" },
    { key: "dest", color: "var(--accent-line)" },
  ];
  const SYM = ["prochazka", "uklid", "nakup"];

  // pi: start distribution over hidden states.
  const pi = [0.6, 0.4];
  // A[from][to]: transition matrix (rows sum to 1).
  const A = [
    [0.7, 0.3], // slunce -> slunce / dest
    [0.4, 0.6], // dest   -> slunce / dest
  ];
  // B[state][sym]: emission matrix (rows sum to 1).
  const B = [
    [0.6, 0.1, 0.3], // slunce: hodne prochazek
    [0.1, 0.6, 0.3], // dest:   hodne uklidu
  ];

  // pick an index from a probability row using a uniform draw
  const pick = (row) => {
    let r = Math.random(), acc = 0;
    for (let i = 0; i < row.length; i++) { acc += row[i]; if (r <= acc) return i; }
    return row.length - 1;
  };

  const [seq, setSeq] = useState([]); // [{ s: stateIdx, o: symIdx }]

  const stepOnce = () => {
    setSeq((prev) => {
      const s = prev.length === 0 ? pick(pi) : pick(A[prev[prev.length - 1].s]);
      const o = pick(B[s]);
      const next = [...prev, { s, o }];
      return next.length > 9 ? next.slice(next.length - 9) : next;
    });
  };

  const W = 360, H = 180;
  const ox = 64, cw = 32, topY = 52, botY = 116;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        <text x={8} y={topY + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">skryté</text>
        <text x={8} y={botY + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">pozoruji</text>
        <text x={ox} y={26} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          čas t →   (skrytý stav vygeneruje pozorování)
        </text>

        {seq.length === 0 && (
          <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize="11"
            fontFamily="var(--font-mono)" fill="var(--text-faint)">stiskni „krok“ → náhodná chůze</text>
        )}

        {seq.map((step, t) => {
          const x = ox + t * cw;
          const st = STATES[step.s];
          return (
            <g key={t}>
              {/* transition arrow from previous hidden state */}
              {t > 0 && (
                <line x1={ox + (t - 1) * cw + 11} y1={topY} x2={x - 11} y2={topY}
                  stroke="var(--line-strong)" strokeWidth="1" markerEnd="url(#hmmGenArr)" />
              )}
              {/* hidden state node */}
              <circle cx={x} cy={topY} r="11"
                fill={`color-mix(in oklch, ${st.color} 35%, var(--bg-card))`}
                stroke={st.color} strokeWidth="1.4" />
              <text x={x} y={topY + 3.5} textAnchor="middle" fontSize="9"
                fontFamily="var(--font-mono)" fill="var(--text)">{st.key === "slunce" ? "S" : "D"}</text>
              {/* emission arrow down */}
              <line x1={x} y1={topY + 12} x2={x} y2={botY - 12}
                stroke={st.color} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
              {/* observed symbol box */}
              <rect x={x - 11} y={botY - 11} width="22" height="22" rx="3"
                fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="0.8" />
              <text x={x} y={botY + 3.5} textAnchor="middle" fontSize="8.5"
                fontFamily="var(--font-mono)" fill="var(--text)">{SYM[step.o].slice(0, 3)}</text>
            </g>
          );
        })}

        <defs>
          <marker id="hmmGenArr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--line-strong)" />
          </marker>
        </defs>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={stepOnce}>krok ▸</button>
        <button className="viz-btn" onClick={() => setSeq([])}>reset ↺</button>
      </div>
      <span className="viz-readout">
        S = slunce, D = déšť · pozorování: {seq.length ? seq.map((x) => SYM[x.o].slice(0, 3)).join(" ") : "—"}
      </span>
    </div>
  );
}
