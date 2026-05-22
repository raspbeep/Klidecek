// CYK — interaktivní fill tabulky.
// Gramatika v CNF: S → AC | AB, C → SB, A → a, B → b (generuje {a^n b^n}, n≥1).
// Stiskni krok ▶: vyplní se další buňka. Aktivní buňka ukáže šipky k dvojici buněk,
// které ji "živí", a které pravidlo X → BC se aplikuje.
// Trace ručně ověřen pro vstupy aabb a aaabbb.
import { useState, useMemo } from "react";

const GRAMMAR = {
  rules: [
    { lhs: "S", rhs: ["A", "C"] },
    { lhs: "S", rhs: ["A", "B"] },
    { lhs: "C", rhs: ["S", "B"] },
    { lhs: "A", rhs: ["a"] },
    { lhs: "B", rhs: ["b"] },
  ],
  start: "S",
};

function runCYK(word) {
  const n = word.length;
  // T[i][j] for j=1..n, i=1..n-j+1; we'll store T[j-1][i-1]
  const T = Array.from({ length: n }, () => Array.from({ length: n }, () => new Set()));
  const steps = []; // each step: { i, j, k (or null for j=1), pairs: [{B,C,rule}], result: Set, contributors: [{B,i,j},{C,i,j}] }

  // j=1: terminal rules
  for (let i = 1; i <= n; i++) {
    const a = word[i - 1];
    const cell = new Set();
    const matches = [];
    for (const r of GRAMMAR.rules) {
      if (r.rhs.length === 1 && r.rhs[0] === a) {
        cell.add(r.lhs);
        matches.push(r);
      }
    }
    T[0][i - 1] = cell;
    steps.push({ i, j: 1, k: null, sym: a, matches, result: new Set(cell), contribs: [] });
  }
  // j ≥ 2
  for (let j = 2; j <= n; j++) {
    for (let i = 1; i <= n - j + 1; i++) {
      const cell = new Set();
      const matches = []; // {rule, k, B_cell:{i,j}, C_cell:{i,j}}
      for (let k = 1; k <= j - 1; k++) {
        const Bs = T[k - 1][i - 1];
        const Cs = T[j - k - 1][i + k - 1];
        for (const r of GRAMMAR.rules) {
          if (r.rhs.length === 2 && Bs.has(r.rhs[0]) && Cs.has(r.rhs[1])) {
            cell.add(r.lhs);
            matches.push({
              rule: r,
              k,
              Bcell: { i, j: k },
              Ccell: { i: i + k, j: j - k },
            });
          }
        }
      }
      T[j - 1][i - 1] = cell;
      steps.push({ i, j, k: null, matches, result: new Set(cell), contribs: matches });
    }
  }
  return { T, steps };
}

const PRESETS = ["aabb", "aaabbb", "abab", "aabbbb"];

export default function CykParsing() {
  const [word, setWord] = useState("aabb");
  const { T, steps } = useMemo(() => runCYK(word), [word]);
  const [stepIdx, setStepIdx] = useState(0);

  useMemo(() => { setStepIdx(0); return null; }, [word]);

  const cur = steps[stepIdx];
  const n = word.length;
  const CELL = 50;
  const MARGIN_L = 60;
  const MARGIN_T = 30;
  const totalW = MARGIN_L + n * CELL + 40;
  const totalH = MARGIN_T + n * CELL + 60;

  // Determine which cells are "filled" up to and including stepIdx
  function isFilled(i, j) {
    const idx = steps.findIndex((s) => s.i === i && s.j === j);
    return idx <= stepIdx;
  }

  function cellSet(i, j) {
    return T[j - 1][i - 1];
  }

  // Position: cell T[i,j] drawn at x = MARGIN_L + (i-1) * CELL, y from bottom for j
  function cellXY(i, j) {
    return {
      x: MARGIN_L + (i - 1) * CELL + (j - 1) * CELL / 2,
      y: MARGIN_T + (n - j) * CELL,
    };
  }

  const final = T[n - 1][0]; // T[1, n]
  const accepts = final.has(GRAMMAR.start);
  const showAccept = stepIdx === steps.length - 1;

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Vstup:</label>
        <select value={word} onChange={(e) => setWord(e.target.value)} style={selectStyle}>
          {PRESETS.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
          krok {stepIdx + 1}/{steps.length}
        </span>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono, ui-monospace)" }}>
        Gramatika v CNF: S → AC | AB, &nbsp; C → SB, &nbsp; A → a, &nbsp; B → b
      </div>

      <svg viewBox={`0 0 ${totalW} ${totalH}`} style={{ width: "100%", maxWidth: 660, alignSelf: "center" }} fontFamily="var(--font-mono, ui-monospace)" fontSize="11">
        {/* row labels j=1..n */}
        {Array.from({ length: n }, (_, idx) => {
          const j = n - idx;
          return (
            <text key={"jl" + j} x={MARGIN_L - 8} y={MARGIN_T + idx * CELL + CELL / 2 + 4} textAnchor="end" fill="var(--text-muted)">
              j={j}
            </text>
          );
        })}
        {/* column labels i=1..n */}
        {Array.from({ length: n }, (_, idx) => (
          <text key={"il" + idx} x={MARGIN_L + idx * CELL + CELL / 2} y={MARGIN_T + n * CELL + 16} textAnchor="middle" fill="var(--text-muted)">
            i={idx + 1}
          </text>
        ))}
        {/* word chars under cols */}
        {Array.from({ length: n }, (_, idx) => (
          <text key={"w" + idx} x={MARGIN_L + idx * CELL + CELL / 2} y={MARGIN_T + n * CELL + 32} textAnchor="middle" fill="var(--text)">
            {word[idx]}
          </text>
        ))}
        {/* cells */}
        {Array.from({ length: n }, (_, jIdx) => {
          const j = jIdx + 1;
          return Array.from({ length: n - j + 1 }, (_, iIdx) => {
            const i = iIdx + 1;
            const { x, y } = cellXY(i, j);
            const filled = isFilled(i, j);
            const isCur = cur.i === i && cur.j === j;
            const set = cellSet(i, j);
            const isAcceptCell = i === 1 && j === n;
            return (
              <g key={`c${i}-${j}`}>
                <rect
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  fill={
                    isCur
                      ? "color-mix(in oklch, var(--accent) 35%, var(--bg-card))"
                      : filled
                      ? "var(--bg-inset)"
                      : "var(--bg-card)"
                  }
                  stroke={isCur ? "var(--accent)" : "var(--line)"}
                  strokeWidth={isCur ? 2 : 1}
                />
                {filled && (
                  <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" fill={set.size === 0 ? "var(--text-faint)" : isAcceptCell && accepts ? "var(--accent)" : "var(--text)"} fontWeight={isAcceptCell && accepts ? "bold" : "normal"}>
                    {set.size === 0 ? "∅" : [...set].sort().join(",")}
                  </text>
                )}
              </g>
            );
          });
        }).flat()}
        {/* arrows from contribs of current cell */}
        {cur.contribs && cur.contribs.length > 0 && cur.contribs.slice(0, 3).map((m, idx) => {
          const cur_xy = cellXY(cur.i, cur.j);
          const b_xy = cellXY(m.Bcell.i, m.Bcell.j);
          const c_xy = cellXY(m.Ccell.i, m.Ccell.j);
          const stroke = idx === 0 ? "var(--accent)" : "var(--text-muted)";
          return (
            <g key={"arr" + idx}>
              <line x1={b_xy.x + CELL / 2} y1={b_xy.y + CELL / 2} x2={cur_xy.x + CELL / 2} y2={cur_xy.y + CELL / 2} stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />
              <line x1={c_xy.x + CELL / 2} y1={c_xy.y + CELL / 2} x2={cur_xy.x + CELL / 2} y2={cur_xy.y + CELL / 2} stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />
            </g>
          );
        })}
      </svg>

      {/* explanation */}
      <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "0 8px" }}>
        {cur.j === 1 ? (
          <>
            Buňka T[{cur.i},1]: symbol „{cur.sym}". Aplikovaná pravidla: {cur.matches.map((r, i) => (
              <span key={i} style={{ color: "var(--accent)", fontFamily: "var(--font-mono, ui-monospace)" }}>
                {i > 0 && ", "}
                {r.lhs} → {r.rhs.join("")}
              </span>
            ))}.
          </>
        ) : cur.matches.length === 0 ? (
          <>
            Buňka T[{cur.i},{cur.j}]: žádné rozdělení k nedá pár, který by se shodoval s pravou stranou ⇒ ∅.
          </>
        ) : (
          <>
            Buňka T[{cur.i},{cur.j}]: {cur.matches.slice(0, 3).map((m, i) => (
              <span key={i}>
                {i > 0 && "; "}
                k={m.k}: <span style={{ fontFamily: "var(--font-mono, ui-monospace)", color: "var(--accent)" }}>{m.rule.lhs} → {m.rule.rhs.join("")}</span>
              </span>
            ))}
            {cur.matches.length > 3 && ` (a ${cur.matches.length - 3} dalších)`}
          </>
        )}
      </div>

      {showAccept && (
        <div style={{ fontSize: 13, textAlign: "center", color: accepts ? "var(--accent)" : "var(--text-muted)" }}>
          {accepts
            ? `✓ S ∈ T[1,${n}] — slovo "${word}" je v L(G)`
            : `S ∉ T[1,${n}] — slovo "${word}" není v L(G)`}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0} style={btnStyle}>◀</button>
        <button onClick={() => setStepIdx(0)} style={btnStyle}>reset</button>
        <button onClick={() => setStepIdx(Math.min(steps.length - 1, stepIdx + 1))} disabled={stepIdx === steps.length - 1} style={btnStyle}>▶</button>
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

const selectStyle = {
  padding: "4px 8px",
  background: "var(--bg-inset)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  borderRadius: 6,
};

const btnStyle = {
  padding: "6px 12px",
  background: "var(--bg-inset)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
};
