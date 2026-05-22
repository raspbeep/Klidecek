// Suma prefixů — vstup + scan/prescan/reduce + použití (packing, line-of-sight).
// Editovatelný vstup, výběr operátoru, výběr aplikace.
import { useState, useMemo } from "react";

const OPERATORS = {
  "+": { fn: (a, b) => a + b, identity: 0 },
  "max": { fn: (a, b) => Math.max(a, b), identity: -Infinity },
  "min": { fn: (a, b) => Math.min(a, b), identity: Infinity },
};

function scan(input, opKey, inclusive) {
  const op = OPERATORS[opKey];
  const out = new Array(input.length);
  let acc = op.identity;
  for (let i = 0; i < input.length; i++) {
    if (inclusive) {
      acc = i === 0 ? input[0] : op.fn(acc, input[i]);
      out[i] = acc;
    } else {
      out[i] = acc;
      acc = i === 0 ? input[0] : op.fn(acc, input[i]);
    }
  }
  return out;
}

const APPS = {
  "základ": { intro: "Vstupní pole, scan (inclusive), prescan (exclusive) a reduce vedle sebe.", op: "+" },
  "packing": { intro: "Vstup = vektor hodnot. Vyber, které ponechat (1 = uchovat). Prescan dá cílovou pozici každého uchovaného prvku.", op: "+" },
  "line-of-sight": { intro: "Vstup = úhly bodů terénu od pozorovatele. Prescan s max dá maximální úhel před každým bodem. Bod je viditelný ↔ úhel(i) > max(j<i).", op: "max" },
};

export default function PrefixSumUvod() {
  const [appKey, setAppKey] = useState("základ");
  const [input, setInput] = useState([3, 1, 7, 0, 4, 1, 6, 3]);
  const [flags, setFlags] = useState([1, 0, 1, 1, 0, 0, 1, 1]); // for packing
  const [opKey, setOpKey] = useState("+");

  const app = APPS[appKey];
  const effectiveOp = appKey === "line-of-sight" ? "max" : appKey === "packing" ? "+" : opKey;

  const inputToScan = appKey === "packing" ? flags : input;
  const scanOut = useMemo(() => scan(inputToScan, effectiveOp, true), [inputToScan, effectiveOp]);
  const prescanOut = useMemo(() => scan(inputToScan, effectiveOp, false), [inputToScan, effectiveOp]);
  const reduceOut = scanOut[scanOut.length - 1];

  // Packing result: where each kept element goes
  const packedPositions = useMemo(() => {
    if (appKey !== "packing") return null;
    const positions = flags.map((f, i) => (f === 1 ? prescanOut[i] : null));
    const packed = new Array(reduceOut).fill(null);
    flags.forEach((f, i) => {
      if (f === 1) packed[prescanOut[i]] = input[i];
    });
    return { positions, packed };
  }, [appKey, flags, input, prescanOut, reduceOut]);

  // Line of sight result: visibility
  const visibility = useMemo(() => {
    if (appKey !== "line-of-sight") return null;
    return input.map((v, i) => v > (i === 0 ? -Infinity : prescanOut[i]));
  }, [appKey, input, prescanOut]);

  const updateCell = (i, v) => {
    const next = input.slice();
    next[i] = isNaN(v) ? 0 : v;
    setInput(next);
  };
  const toggleFlag = (i) => {
    const next = flags.slice();
    next[i] = next[i] === 1 ? 0 : 1;
    setFlags(next);
  };

  const n = input.length;
  const cellW = 60;
  const W = 540, totalH = appKey === "základ" ? 200 : 260;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* App picker */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>aplikace:</span>
        {Object.keys(APPS).map((k) => (
          <button key={k} onClick={() => setAppKey(k)} style={{ ...modeBtn, ...(appKey === k ? activeBtn : {}) }}>
            {k}
          </button>
        ))}
        {appKey === "základ" && (
          <>
            <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 8 }}>operátor:</span>
            {Object.keys(OPERATORS).map((k) => (
              <button key={k} onClick={() => setOpKey(k)} style={{ ...modeBtn, ...(opKey === k ? activeBtn : {}) }}>
                {k}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Intro */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {app.intro}
      </div>

      {/* Visualisation */}
      <svg viewBox={`0 0 ${W} ${totalH}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={totalH} fill="var(--bg-inset)" />

        {/* Labels and rows */}
        {(() => {
          const rows = [];
          if (appKey === "packing") {
            rows.push({ label: "vstup", values: input, color: "var(--text)" });
            rows.push({ label: "flag", values: flags, color: "var(--accent)" });
            rows.push({ label: "prescan", values: prescanOut, color: "oklch(0.55 0.18 65)" });
            rows.push({ label: "packed", values: packedPositions ? packedPositions.packed : [], color: "oklch(0.55 0.18 142)" });
          } else if (appKey === "line-of-sight") {
            rows.push({ label: "úhly α", values: input, color: "var(--text)" });
            rows.push({ label: "prescan max", values: prescanOut.map((v) => (v === -Infinity ? "−∞" : v)), color: "oklch(0.55 0.18 65)" });
            rows.push({ label: "viditelný?", values: visibility.map((v) => (v ? "✓" : "—")), color: "oklch(0.55 0.18 142)" });
          } else {
            rows.push({ label: "vstup", values: input, color: "var(--text)" });
            rows.push({ label: "scan", values: scanOut, color: "var(--accent)" });
            rows.push({ label: "prescan", values: prescanOut.map((v) => (v === -Infinity ? "−∞" : v === Infinity ? "∞" : v)), color: "oklch(0.55 0.18 65)" });
            rows.push({ label: `reduce = ${reduceOut}`, values: [], color: "oklch(0.55 0.18 142)" });
          }

          return rows.map((row, ri) => {
            const y = 30 + ri * 50;
            return (
              <g key={`r-${ri}`}>
                <text x={10} y={y + 18} fontSize="10" fontFamily="var(--font-mono)" fill={row.color} fontWeight="600">{row.label}</text>
                {row.values.map((v, i) => (
                  <g key={`rc-${ri}-${i}`}>
                    <rect x={80 + i * cellW} y={y} width={cellW - 4} height="34"
                          fill={ri === 0 && appKey === "line-of-sight" && visibility && visibility[i] ? "oklch(0.62 0.14 142 / 0.25)" : "var(--bg-card)"}
                          stroke={row.color} strokeWidth="0.9" />
                    <text x={80 + i * cellW + (cellW - 4) / 2} y={y + 22}
                          textAnchor="middle" fontSize="13" fontFamily="var(--font-mono)" fontWeight="500" fill="var(--text)">
                      {v === null || v === undefined ? "·" : v}
                    </text>
                  </g>
                ))}
              </g>
            );
          });
        })()}

        {/* index row */}
        <g>
          {input.map((_, i) => (
            <text key={`ix-${i}`} x={80 + i * cellW + (cellW - 4) / 2} y={totalH - 8}
                  textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              {i}
            </text>
          ))}
        </g>
      </svg>

      {/* Editable input */}
      <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 11.5 }}>
        <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          edituj vstup
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {input.map((v, i) => (
            <input key={i} type="number" value={v} onChange={(e) => updateCell(i, parseInt(e.target.value, 10))}
              style={{ width: 40, padding: "3px 4px", fontSize: 11, fontFamily: "var(--font-mono)",
                       background: "var(--bg-inset)", border: "1px solid var(--line)", borderRadius: 3,
                       color: "var(--text)", textAlign: "center" }} />
          ))}
        </div>
        {appKey === "packing" && (
          <>
            <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 8, marginBottom: 6 }}>
              flagy (klikni přepneš)
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {flags.map((f, i) => (
                <button key={i} onClick={() => toggleFlag(i)}
                  style={{ width: 40, padding: "3px 4px", fontSize: 12, fontFamily: "var(--font-mono)",
                           background: f ? "var(--accent)" : "var(--bg-inset)",
                           color: f ? "var(--bg-card)" : "var(--text-muted)",
                           border: "1px solid var(--line)", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>
                  {f}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const modeBtn = {
  padding: "4px 10px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 3,
  color: "var(--text)",
  cursor: "pointer",
};
const activeBtn = { background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
