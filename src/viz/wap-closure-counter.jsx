// Closure counter — dvě nezávislé instance čítače vytvořené stejnou factory.
// Ukazuje, že každý uzávěr drží VLASTNÍ živé x (ne snímek, ne sdílená proměnná).
import { useState } from "react";

const mono = { fontFamily: "var(--font-mono)" };

export default function WapClosureCounter() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [log, setLog] = useState([]);

  const tick = (which) => {
    if (which === "A") {
      const nx = a + 1;
      setA(nx);
      setLog((l) => [`citacA()  →  ${nx}`, ...l].slice(0, 6));
    } else {
      const nx = b + 1;
      setB(nx);
      setLog((l) => [`citacB()  →  ${nx}`, ...l].slice(0, 6));
    }
  };

  const reset = () => { setA(0); setB(0); setLog([]); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <pre style={{ ...mono, fontSize: 11.5, background: "var(--bg-inset)", padding: 10, borderRadius: 6, margin: 0, color: "var(--text)", lineHeight: 1.45, overflowX: "auto" }}>
{`function makeCitac() {
  let x = 0;                 // soukromá, žije v uzávěru
  return () => { x++; return x; };
}
const citacA = makeCitac();  // vlastní x
const citacB = makeCitac();  // jiné, nezávislé x`}
      </pre>

      <svg viewBox="0 0 360 130" style={{ width: "100%", maxWidth: 420 }}>
        <rect width="360" height="130" fill="var(--bg-inset)" rx="6" />
        {[
          { id: "A", x: 20, val: a, hue: 264 },
          { id: "B", x: 190, val: b, hue: 142 },
        ].map((c) => (
          <g key={c.id}>
            <rect x={c.x} y={14} width={150} height={102} rx={7}
              fill={`oklch(0.62 0.13 ${c.hue} / 0.10)`} stroke={`oklch(0.62 0.13 ${c.hue})`} />
            <text x={c.x + 75} y={34} textAnchor="middle" fontSize="11.5" fontWeight="600"
              fill={`oklch(0.5 0.14 ${c.hue})`} fontFamily="var(--font-mono)">
              citac{c.id}
            </text>
            <text x={c.x + 75} y={50} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)"
              fontFamily="var(--font-mono)">[[uzávěr]] x =</text>
            <text x={c.x + 75} y={88} textAnchor="middle" fontSize="30" fontWeight="700"
              fill={`oklch(0.55 0.16 ${c.hue})`} fontFamily="var(--font-mono)">
              {c.val}
            </text>
            <text x={c.x + 75} y={108} textAnchor="middle" fontSize="9" fill="var(--text-faint)"
              fontFamily="var(--font-mono)">soukromé · živé</text>
          </g>
        ))}
      </svg>

      <div className="viz-controls">
        <button className="viz-btn" style={btn(264)} onClick={() => tick("A")}>citacA() ++</button>
        <button className="viz-btn" style={btn(142)} onClick={() => tick("B")}>citacB() ++</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>

      <div style={{ ...mono, fontSize: 11, color: "var(--text-muted)", background: "var(--bg-inset)", borderRadius: 6, padding: 8, minHeight: 28 }}>
        {log.length === 0
          ? <span style={{ color: "var(--text-faint)" }}>klikni — každá instance počítá nezávisle…</span>
          : log.map((l, i) => <div key={i} style={{ opacity: i === 0 ? 1 : 0.55 }}>{l}</div>)}
      </div>
    </div>
  );
}

function btn(hue) {
  return {
    border: `1px solid oklch(0.62 0.13 ${hue})`,
    background: `oklch(0.62 0.13 ${hue} / 0.15)`,
    color: `oklch(0.5 0.14 ${hue})`,
  };
}
