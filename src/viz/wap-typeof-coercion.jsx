// JavaScript typeof + type coercion explorer.
// Vyber hodnotu, ukáže typeof (vč. anomálií null/function), výsledek `+ 1`,
// `+ ""` a booleovský kontext (truthy/falsy).
import { useState } from "react";

const VALUES = [
  { label: "42", typeOf: "number", plus1: "43", plusStr: '"42"', boolean: true },
  { label: "0", typeOf: "number", plus1: "1", plusStr: '"0"', boolean: false },
  { label: "10n", typeOf: "bigint", plus1: "TypeError", plusStr: '"10"', boolean: true },
  { label: '"5"', typeOf: "string", plus1: '"51"', plusStr: '"5"', boolean: true },
  { label: '""', typeOf: "string", plus1: '"1"', plusStr: '""', boolean: false },
  { label: "true", typeOf: "boolean", plus1: "2", plusStr: '"true"', boolean: true },
  { label: "undefined", typeOf: "undefined", plus1: "NaN", plusStr: '"undefined"', boolean: false },
  { label: "null", typeOf: "object", plus1: "1", plusStr: '"null"', boolean: false, anomaly: true },
  { label: "NaN", typeOf: "number", plus1: "NaN", plusStr: '"NaN"', boolean: false },
  { label: "{}", typeOf: "object", plus1: '"[object Object]1"', plusStr: '"[object Object]"', boolean: true },
  { label: "[]", typeOf: "object", plus1: '"1"', plusStr: '""', boolean: true },
  { label: "function(){}", typeOf: "function", plus1: '"function(){}1"', plusStr: '"function(){}"', boolean: true, anomaly: true },
];

const mono = { fontFamily: "var(--font-mono)" };

export default function WapTypeofCoercion() {
  const [idx, setIdx] = useState(0);
  const v = VALUES[idx];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {VALUES.map((x, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="btn ghost"
            style={{
              padding: "4px 8px",
              fontSize: 11.5,
              ...mono,
              borderRadius: 4,
              cursor: "pointer",
              border: "1px solid var(--line)",
              background: i === idx ? "var(--accent)" : "var(--bg-card)",
              color: i === idx ? "var(--bg-card)" : "var(--text)",
            }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 360 170" style={{ width: "100%", maxWidth: 420 }}>
        <rect width="360" height="170" fill="var(--bg-inset)" rx="6" />

        {/* expression header */}
        <text x="14" y="26" fontSize="13" fontWeight="600" fill="var(--text)" style={mono}>
          x = {v.label}
        </text>

        {/* rows */}
        <Row y={48} expr={`typeof x`} res={`"${v.typeOf}"`} accent anomaly={v.anomaly} />
        <Row y={80} expr={`x + 1`} res={v.plus1} bad={v.plus1 === "TypeError" || v.plus1 === "NaN"} />
        <Row y={112} expr={`x + ""`} res={v.plusStr} />
        <Row y={144} expr={`Boolean(x)`} res={String(v.boolean)} truthy={v.boolean} falsy={!v.boolean} />
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {v.anomaly && v.label === "null" && (
          <span><b>Anomálie:</b> <code style={mono}>typeof null</code> vrací <code style={mono}>"object"</code> — historická chyba jazyka, nelze opravit kvůli zpětné kompatibilitě.</span>
        )}
        {v.anomaly && v.label.startsWith("function") && (
          <span><b>Anomálie:</b> funkce je volatelný <i>Object</i>, ale <code style={mono}>typeof</code> ji vyčleňuje jako <code style={mono}>"function"</code> — není to jeden z 8 specifikovaných typů.</span>
        )}
        {v.plus1 === "TypeError" && (
          <span><b>BigInt</b> se nemíchá s <code style={mono}>Number</code> — <code style={mono}>10n + 1</code> vyhodí TypeError; nutná explicitní konverze.</span>
        )}
        {!v.anomaly && v.plus1 !== "TypeError" && (
          <span><code style={mono}>+ 1</code> aritmeticky konvertuje na číslo (nebo konkatenuje, je-li operand řetězec); <code style={mono}>+ ""</code> vynutí převod na řetězec.</span>
        )}
      </div>
    </div>
  );
}

function Row({ y, expr, res, accent, bad, truthy, falsy, anomaly }) {
  const color = bad
    ? "oklch(0.6 0.18 22)"
    : truthy
    ? "oklch(0.55 0.15 142)"
    : falsy
    ? "oklch(0.6 0.16 65)"
    : anomaly
    ? "oklch(0.6 0.18 22)"
    : accent
    ? "var(--accent)"
    : "var(--text)";
  return (
    <g>
      <text x="14" y={y} fontSize="12" fill="var(--text-muted)" fontFamily="var(--font-mono)">
        {expr}
      </text>
      <text x="180" y={y} fontSize="12" fill="var(--text-faint)">→</text>
      <text x="200" y={y} fontSize="12" fontWeight="600" fill={color} fontFamily="var(--font-mono)">
        {res}
      </text>
    </g>
  );
}
