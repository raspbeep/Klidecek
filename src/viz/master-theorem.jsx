// Master teorém — klasifikátor + rekurzivní strom.
// T(n) = a·T(n/b) + f(n), c* = log_b a.
// Slider a, b, výběr f(n). Auto-klasifikace 1/2/3, vykreslení stromu volání,
// suma cen v jednotlivých úrovních, finální Θ.
import { useState, useMemo } from "react";

// f(n) předdefinované: { label, eval: (n) => number, exp: polynomial part exponent, logPow }
const F_OPTIONS = [
  { label: "1", exp: 0, logPow: 0, eval: () => 1 },
  { label: "log n", exp: 0, logPow: 1, eval: (n) => Math.log2(Math.max(2, n)) },
  { label: "√n", exp: 0.5, logPow: 0, eval: (n) => Math.sqrt(n) },
  { label: "n", exp: 1, logPow: 0, eval: (n) => n },
  { label: "n log n", exp: 1, logPow: 1, eval: (n) => n * Math.log2(Math.max(2, n)) },
  { label: "n²", exp: 2, logPow: 0, eval: (n) => n * n },
  { label: "n³", exp: 3, logPow: 0, eval: (n) => n * n * n },
];

const PRESETS = {
  "Merge sort": { a: 2, b: 2, f: "n" },
  "Binary search": { a: 1, b: 2, f: "1" },
  "Strassen": { a: 7, b: 2, f: "n²" },
  "Quicksort (avg)": { a: 2, b: 2, f: "n" },
  "Karatsuba": { a: 3, b: 2, f: "n" },
};

function classify(a, b, f) {
  const cStar = Math.log(a) / Math.log(b);
  const fExp = f.exp;
  if (fExp < cStar - 0.001) return { case: 1, cStar, result: `Θ(n^${cStar.toFixed(2)})` };
  if (Math.abs(fExp - cStar) < 0.001) {
    if (f.logPow === 0) return { case: 2, cStar, result: `Θ(n^${cStar.toFixed(2)} · log n)` };
    return { case: "2 (s log)", cStar, result: `Θ(n^${cStar.toFixed(2)} · log^${f.logPow + 1} n)` };
  }
  return { case: 3, cStar, result: `Θ(${f.label})` };
}

export default function MasterTheorem() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const [fLabel, setFLabel] = useState("n");
  const f = F_OPTIONS.find((x) => x.label === fLabel);
  const N = 32; // visualization base size

  const verdict = classify(a, b, f);
  const cStar = verdict.cStar;
  const maxDepth = Math.min(6, Math.floor(Math.log(N) / Math.log(b)));

  // Per-level cost
  const levels = [];
  let total = 0;
  for (let k = 0; k <= maxDepth; k++) {
    const subN = N / Math.pow(b, k);
    const subF = f.eval(subN);
    const num = Math.pow(a, k);
    const lvlCost = num * subF;
    levels.push({ k, num, subN, subF, lvlCost });
    total += lvlCost;
  }
  const maxCost = Math.max(...levels.map((l) => l.lvlCost), 1);

  function pickPreset(name) {
    const p = PRESETS[name];
    setA(p.a);
    setB(p.b);
    setFLabel(p.f);
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>preset:</label>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} onClick={() => pickPreset(k)} style={{ ...btnStyle, fontSize: 11, padding: "3px 8px" }}>{k}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12 }}>
        <label style={{ color: "var(--text-muted)" }}>
          a (počet podproblémů): <input type="range" min={1} max={8} value={a} onChange={(e) => setA(+e.target.value)} style={{ width: 100 }} />
          <span style={{ color: "var(--accent)", marginLeft: 4 }}>{a}</span>
        </label>
        <label style={{ color: "var(--text-muted)" }}>
          b (dělení): <input type="range" min={2} max={5} value={b} onChange={(e) => setB(+e.target.value)} style={{ width: 100 }} />
          <span style={{ color: "var(--accent)", marginLeft: 4 }}>{b}</span>
        </label>
        <label style={{ color: "var(--text-muted)" }}>
          f(n):
          <select value={fLabel} onChange={(e) => setFLabel(e.target.value)} style={{ ...selectStyle, marginLeft: 4 }}>
            {F_OPTIONS.map((o) => <option key={o.label} value={o.label}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 8, fontFamily: "var(--font-mono, ui-monospace)", fontSize: 13, textAlign: "center" }}>
        T(n) = <span style={{ color: "var(--accent)" }}>{a}</span> · T(n/<span style={{ color: "var(--accent)" }}>{b}</span>) + <span style={{ color: "var(--accent)" }}>{fLabel}</span>
        &nbsp;&nbsp; c* = log<sub>{b}</sub>{a} = <span style={{ color: "var(--accent)" }}>{cStar.toFixed(2)}</span>
      </div>

      {/* recursion tree visualization */}
      <svg viewBox={`0 0 540 ${30 + (maxDepth + 1) * 36}`} style={{ width: "100%", maxWidth: 620, alignSelf: "center" }} fontFamily="var(--font-mono, ui-monospace)" fontSize="11">
        {levels.map((lvl, idx) => {
          const y = 20 + idx * 36;
          const barW = (lvl.lvlCost / maxCost) * 200;
          return (
            <g key={idx}>
              <text x={20} y={y + 4} fill="var(--text-muted)" fontSize="10">úroveň {lvl.k}</text>
              <text x={90} y={y + 4} fill="var(--text)" fontSize="10">
                {lvl.num} × f({lvl.subN.toFixed(1)})
              </text>
              <rect x={220} y={y - 8} width={barW} height={16} fill="var(--accent)" fillOpacity="0.4" stroke="var(--accent)" />
              <text x={220 + barW + 6} y={y + 4} fill="var(--text)" fontSize="10">{lvl.lvlCost.toFixed(1)}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 8, fontFamily: "var(--font-mono, ui-monospace)", fontSize: 13 }}>
        <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 4 }}>Případ:</div>
        <div style={{ fontSize: 14 }}>
          {verdict.case === 1 && <>1: f(n) malé proti n^c* ⇒ <span style={{ color: "var(--accent)" }}>{verdict.result}</span></>}
          {verdict.case === 2 && <>2: f(n) ≈ n^c* ⇒ <span style={{ color: "var(--accent)" }}>{verdict.result}</span></>}
          {verdict.case === "2 (s log)" && <>2 (rozšířený): f(n) má log faktor ⇒ <span style={{ color: "var(--accent)" }}>{verdict.result}</span></>}
          {verdict.case === 3 && <>3: f(n) velké proti n^c* ⇒ <span style={{ color: "var(--accent)" }}>{verdict.result}</span></>}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>
          Pro n = {N}: součet všech úrovní ≈ {total.toFixed(1)}
        </div>
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
