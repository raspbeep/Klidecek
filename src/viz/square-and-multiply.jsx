// Modulární umocnění a^x mod n metodou square-and-multiply.
// Bit-by-bit animace; ukazuje kolik násobení/squaringů.
import { useMemo, useState } from "react";

export default function SquareAndMultiply() {
  const [a, setA] = useState(7);
  const [x, setX] = useState(560);
  const [n, setN] = useState(561);
  const [step, setStep] = useState(-1);

  const result = useMemo(() => {
    const trace = [];
    let r = 1;
    let base = a % n;
    let exp = x;
    let bitIdx = 0;
    while (exp > 0) {
      const bit = exp & 1;
      trace.push({
        bit, base, r,
        op: bit ? "× (bit=1)" : "skip (bit=0)",
        newR: bit ? (r * base) % n : r,
        bitIdx,
      });
      if (bit) r = (r * base) % n;
      base = (base * base) % n;
      exp >>= 1;
      bitIdx++;
    }
    return { trace, final: r };
  }, [a, x, n]);

  const bits = x.toString(2).split("").reverse().join(""); // LSB first
  const currentStep = step < 0 ? result.trace.length - 1 : Math.min(step, result.trace.length - 1);

  const naiveOps = x;
  const smOps = result.trace.length + result.trace.filter((t) => t.bit).length;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>a:</label>
        <input type="number" min={1} value={a} onChange={(e) => setA(Math.max(1, +e.target.value))} style={num} />
        <label style={lbl}>x:</label>
        <input type="number" min={0} value={x} onChange={(e) => setX(Math.max(0, +e.target.value))} style={num} />
        <label style={lbl}>n:</label>
        <input type="number" min={2} value={n} onChange={(e) => setN(Math.max(2, +e.target.value))} style={num} />
      </div>
      <div style={row}>
        <button onClick={() => setStep(0)} style={btnSm}>Start</button>
        <button onClick={() => setStep(Math.max(0, currentStep - 1))} style={btnSm}>◀</button>
        <button onClick={() => setStep(Math.min(result.trace.length - 1, currentStep + 1))} style={btnSm}>▶</button>
        <button onClick={() => setStep(-1)} style={btnSm}>Konec</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          krok {currentStep + 1} / {result.trace.length}
        </span>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Exponent x v binárce (LSB vlevo, jak se zpracovává):
      </div>
      <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {bits.split("").map((b, i) => (
          <div key={i} style={{
            width: 24, height: 24, lineHeight: "24px", textAlign: "center",
            background: i === currentStep ? "var(--accent)" : "var(--bg-inset)",
            color: i === currentStep ? "var(--bg-card)" : (b === "1" ? "var(--accent)" : "var(--text-muted)"),
            border: "1px solid var(--line)", borderRadius: 3,
            fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: "bold",
          }}>
            {b}
          </div>
        ))}
      </div>

      <div style={section}>
        <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6 }}>Trasa:</div>
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {result.trace.map((t, i) => (
            <div key={i} style={{
              padding: "3px 6px",
              background: i === currentStep ? "rgba(81,131,219,0.18)" : "transparent",
              fontSize: 11, fontFamily: "var(--font-mono)", color: i <= currentStep ? "var(--text)" : "var(--text-faint)",
              borderLeft: i === currentStep ? "2px solid var(--accent)" : "2px solid transparent",
            }}>
              bit[{t.bitIdx}]={t.bit}: r={t.r} {t.bit ? `× a^(2^${t.bitIdx})=` + t.base + ` → r=${t.newR}` : "(přeskočit)"} &nbsp;
              <span style={{ color: "var(--text-faint)" }}>a^(2^{t.bitIdx + 1}) = {(t.base * t.base) % n}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={section}>
        <div style={{ fontSize: 12, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
          {a}^{x} mod {n} = <b style={{ color: "var(--accent)" }}>{result.final}</b>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Operací: <b>{smOps}</b> (square+multiply) vs naivně {naiveOps} (postupné násobení).
          Pro 2048-bit exponent: ~3000 operací místo ~10^617.
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        ⚠ <b>Side-channel:</b> "if bit=1" větvení uniká bity tajného exponentu d (RSA dešifrování).
        Constant-time implementace používá Montgomery ladder — vždy stejný počet operací.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const num = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 100 };
const btnSm = { padding: "3px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 11, cursor: "pointer" };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
