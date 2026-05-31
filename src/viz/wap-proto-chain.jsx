// Prototype chain delegation walker.
// Čtení vlastnosti deleguje vzhůru po [[Prototype]] až k null → undefined.
// Zápis NEdeleguje — vytvoří vlastní vlastnost na cílovém objektu (shadowing).
import { useState } from "react";

// chain[0] = cílový objekt; poslední článek deleguje na null.
const BASE = [
  { name: "dite", own: { vek: "5" }, hue: 264 },
  { name: "rodic", own: { prijmeni: '"Novák"', pozdrav: "fn" }, hue: 142 },
  { name: "Object.prototype", own: { toString: "fn" }, hue: 65 },
];

const LOOKUPS = ["vek", "prijmeni", "toString", "barva"];

const mono = { fontFamily: "var(--font-mono)" };

export default function WapProtoChain() {
  const [chain, setChain] = useState(BASE);
  const [mode, setMode] = useState("read"); // read | write
  const [prop, setProp] = useState("prijmeni");
  const [step, setStep] = useState(0); // index článku, kde právě hledáme (read)
  const [done, setDone] = useState(false);

  // pro daný prop najdi, na kterém článku se nachází (own)
  const foundAt = chain.findIndex((o) => prop in o.own);
  const reading = mode === "read";

  const reset = () => { setStep(0); setDone(false); };

  const next = () => {
    if (mode === "write") {
      // zápis: vždy vytvoří vlastní vlastnost na chain[0]
      if (!(prop in chain[0].own)) {
        const nc = chain.map((o, i) => (i === 0 ? { ...o, own: { ...o.own, [prop]: "(nová)" } } : o));
        setChain(nc);
      }
      setDone(true);
      return;
    }
    // čtení: krok po řetězci
    if (foundAt === -1) {
      // nenašli jsme → projdi celý řetězec a skonči na null
      if (step < chain.length) setStep(step + 1);
      else setDone(true);
    } else {
      if (step < foundAt) setStep(step + 1);
      else setDone(true);
    }
  };

  const atNull = reading && foundAt === -1 && step >= chain.length;
  const resultText = reading
    ? (done
        ? (foundAt === -1 ? `undefined  (řetězec skončil na null)` : `nalezeno na: ${chain[foundAt].name}`)
        : `hledám "${prop}"…`)
    : (done ? `zapsáno jako VLASTNÍ vlastnost na: dite (shadowing)` : `zápis dite.${prop} = …`);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 11.5 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <Toggle on={mode === "read"} label="čtení (delegace)" onClick={() => { setMode("read"); reset(); }} />
          <Toggle on={mode === "write"} label="zápis (shadowing)" onClick={() => { setMode("write"); reset(); }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
          <span style={mono}>{mode === "write" ? "dite." : ""}prop:</span>
          <select value={prop} onChange={(e) => { setProp(e.target.value); reset(); }} style={selectStyle}>
            {LOOKUPS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <svg viewBox="0 0 360 220" style={{ width: "100%", maxWidth: 420 }}>
        <rect width="360" height="220" fill="var(--bg-inset)" rx="6" />
        {chain.map((o, i) => {
          const y = 12 + i * 58;
          const active = reading && !done && step === i;
          const isHit = reading && done && foundAt === i;
          const isShadow = mode === "write" && i === 0 && prop in o.own;
          const stroke = active || isHit || isShadow ? `oklch(0.6 0.16 ${o.hue})` : "var(--line-strong)";
          const sw = active || isHit || isShadow ? 2 : 1;
          return (
            <g key={o.name}>
              <rect x="20" y={y} width="320" height="46" rx="6"
                fill={isHit || isShadow ? `oklch(0.6 0.16 ${o.hue} / 0.14)` : "var(--bg-card)"}
                stroke={stroke} strokeWidth={sw} />
              <text x="32" y={y + 18} fontSize="11.5" fontWeight="600" fill="var(--text)" style={mono}>{o.name}</text>
              <text x="32" y={y + 36} fontSize="10" fill="var(--text-muted)" style={mono}>
                {Object.entries(o.own).map(([k, v]) => `${k}: ${v}`).join("   ")}
              </text>
              {/* [[Prototype]] link arrow downward */}
              {i < chain.length - 1 && (
                <>
                  <line x1="180" y1={y + 46} x2="180" y2={y + 58} stroke="var(--text-faint)" strokeWidth="1.2" markerEnd="url(#pcArr)" />
                  <text x="188" y={y + 55} fontSize="8" fill="var(--text-faint)" style={mono}>[[Prototype]]</text>
                </>
              )}
              {active && <text x="330" y={y + 28} textAnchor="end" fontSize="9.5" fill={`oklch(0.6 0.16 ${o.hue})`} style={mono}>hledám…</text>}
              {isHit && <text x="330" y={y + 28} textAnchor="end" fontSize="9.5" fill={`oklch(0.5 0.16 ${o.hue})`} style={mono}>✓ found</text>}
              {isShadow && <text x="330" y={y + 28} textAnchor="end" fontSize="9.5" fill={`oklch(0.5 0.16 ${o.hue})`} style={mono}>↤ zapsáno</text>}
            </g>
          );
        })}
        {/* null terminator */}
        <text x="180" y={12 + chain.length * 58 + 12} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={atNull ? "oklch(0.6 0.18 22)" : "var(--text-faint)"} style={mono}>
          ↓ [[Prototype]] → null{atNull ? "  →  undefined" : ""}
        </text>
        <defs>
          <marker id="pcArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-faint)" />
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn" style={primaryBtn} onClick={next} disabled={done}>
          {reading ? "krok delegace →" : "proveď zápis →"}
        </button>
        <button className="btn ghost" style={ghostBtn} onClick={() => { setChain(BASE); reset(); }}>reset</button>
        <div style={{ flex: 1, textAlign: "right", fontSize: 11.5, fontWeight: 600, ...mono, color: done ? "var(--text)" : "var(--text-muted)" }}>
          {resultText}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, label, onClick }) {
  return (
    <button onClick={onClick} className="btn ghost" style={{
      padding: "4px 9px", fontSize: 11, ...mono, borderRadius: 4, cursor: "pointer",
      border: "1px solid var(--line)",
      background: on ? "var(--accent)" : "var(--bg-card)",
      color: on ? "var(--bg-card)" : "var(--text-muted)",
    }}>{label}</button>
  );
}

const selectStyle = {
  padding: "3px 6px", fontSize: 11.5, fontFamily: "var(--font-mono)",
  background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 3, color: "var(--text)",
};
const primaryBtn = {
  padding: "6px 12px", fontSize: 12, fontFamily: "var(--font-mono)", borderRadius: 5, cursor: "pointer",
  border: "1px solid var(--accent)", background: "var(--accent)", color: "var(--bg-card)",
};
const ghostBtn = {
  padding: "6px 12px", fontSize: 12, fontFamily: "var(--font-mono)", borderRadius: 5, cursor: "pointer",
  border: "1px solid var(--line)", background: "var(--bg-card)", color: "var(--text-muted)",
};
