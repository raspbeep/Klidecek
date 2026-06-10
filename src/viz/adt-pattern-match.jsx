// Exhaustiveness checker for ADT pattern matches.
import { useState } from "react";

const ADTS = {
  Bool:     { ctors: [{ n: "True", arity: 0 }, { n: "False", arity: 0 }], card: 2 },
  Color:    { ctors: [{ n: "Red", arity: 0 }, { n: "Green", arity: 0 }, { n: "Blue", arity: 0 }], card: 3 },
  "Maybe a":{ ctors: [{ n: "Nothing", arity: 0 }, { n: "Just", arity: 1 }], card: "1 + |a|" },
  "Either e a":{ ctors: [{ n: "Left", arity: 1, lblArg: "e" }, { n: "Right", arity: 1, lblArg: "a" }], card: "|e| + |a|" },
  "List a": { ctors: [{ n: "[]", arity: 0 }, { n: "(:)", arity: 2, lblArg: "a, List a" }], card: "rekurzivní" },
  "Tree a": { ctors: [{ n: "Leaf", arity: 0 }, { n: "Node", arity: 3, lblArg: "Tree a, a, Tree a" }], card: "rekurzivní" },
  Expr:     { ctors: [{ n: "Num", arity: 1, lblArg: "Int" }, { n: "Add", arity: 2, lblArg: "Expr, Expr" }, { n: "Mul", arity: 2, lblArg: "Expr, Expr" }, { n: "Neg", arity: 1, lblArg: "Expr" }], card: "rekurzivní" },
};

export default function AdtPatternMatch() {
  const [type, setType] = useState("Maybe a");
  const [covered, setCovered] = useState(["Nothing"]);

  const adt = ADTS[type];
  const allCtors = adt.ctors.map((c) => c.n);
  const missing = allCtors.filter((n) => !covered.includes(n));
  const exhaustive = missing.length === 0;

  const toggle = (n) => {
    setCovered((c) => c.includes(n) ? c.filter((x) => x !== n) : [...c, n]);
  };
  const setType2 = (t) => { setType(t); setCovered([]); };

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>typ:</label>
        <select className="viz-select" value={type} onChange={(e) => setType2(e.target.value)}>
          {Object.keys(ADTS).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ ...lbl, marginLeft: 12 }}>cardinality:</span>
        <code className="viz-readout">|{type}| = {adt.card}</code>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={col}>
          <div style={colHd}>konstruktory (data {type})</div>
          {adt.ctors.map((c) => (
            <div key={c.n} style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "3px 0", color: covered.includes(c.n) ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>
              {covered.includes(c.n) ? "✓" : "✗"} {c.n}{c.arity > 0 ? ` ${c.lblArg ?? "a"}` : ""}
            </div>
          ))}
        </div>
        <div style={col}>
          <div style={colHd}>vaše pattern match</div>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>case x of</code>
          {covered.length === 0 ? <div style={{ ...lineSt, color: "rgb(220,80,80)" }}>(žádné větve)</div> :
            covered.map((n) => {
              const c = adt.ctors.find((ct) => ct.n === n);
              const args = c.arity > 0 ? Array(c.arity).fill("_").join(" ") : "";
              return (
                <div key={n} style={lineSt}>
                  <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>  {c.n} {args} -&gt; ...</code>
                </div>
              );
            })}
        </div>
      </div>

      <div className="viz-controls">
        {adt.ctors.map((c) => (
          <button key={c.n} className="viz-btn" data-active={covered.includes(c.n)} onClick={() => toggle(c.n)}>{covered.includes(c.n) ? "✓" : "+"} {c.n}</button>
        ))}
      </div>

      <div style={{ background: exhaustive ? "rgba(64,192,87,0.18)" : "rgba(220,80,80,0.18)", padding: 10, borderRadius: 6, border: `1px solid ${exhaustive ? "rgb(64,192,87)" : "rgb(220,80,80)"}` }}>
        {exhaustive ? (
          <span style={{ color: "rgb(64,192,87)", fontFamily: "var(--font-mono)", fontSize: 12 }}>✓ Exhaustive — všechny case pokryty, žádný runtime crash.</span>
        ) : (
          <span style={{ color: "rgb(220,80,80)", fontFamily: "var(--font-mono)", fontSize: 12 }}>⚠ Non-exhaustive patterns: missing {missing.map((m) => <code key={m} style={{ marginLeft: 4 }}>{m}</code>)} — GHC warning, runtime crash při unmatchnutém vstupu.</span>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Sum types (|A| + |B|) = OR, product types (|A| × |B|) = AND. Algebraické typy se chovají jako vyšší aritmetika. Compile-time check zaručuje "make impossible states impossible".
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const col = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, minHeight: 110 };
const colHd = { fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 };
const lineSt = { padding: "2px 0" };
