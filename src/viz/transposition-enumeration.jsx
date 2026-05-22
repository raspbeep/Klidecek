// Odd-Even Transposition Sort.
// Pole 4-12 prvků, sleduj liché a sudé fáze swapů. Worst-case n/2 iterací.
// Vyber reverzní preset (n, n-1, ..., 1) a uvidíš proč n/2 stačí.
import { useState, useMemo } from "react";

function makeRandom(n, seed) {
  // simple LCG
  let s = seed;
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xFFFFFFFF; return (s >>> 0) / 0x100000000; };
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function reverseArr(n) {
  return Array.from({ length: n }, (_, i) => n - i);
}

// One sub-phase: compare and swap pairs at indices [start, start+1], [start+2, start+3], ...
// start = 0 (odd phase: pairs (1,2), (3,4)... in 1-indexed) — let's just do start=0 / start=1 in 0-indexed.
function oneSubPhase(arr, start) {
  const next = arr.slice();
  const swaps = [];
  for (let i = start; i + 1 < arr.length; i += 2) {
    if (next[i] > next[i + 1]) {
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      swaps.push([i, i + 1]);
    }
  }
  return { next, swaps };
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) if (arr[i - 1] > arr[i]) return false;
  return true;
}

export default function TranspositionEnumeration() {
  const [n, setN] = useState(8);
  const [seed, setSeed] = useState(42);
  const [preset, setPreset] = useState("random");

  const initial = useMemo(() => {
    if (preset === "reverse") return reverseArr(n);
    if (preset === "almost") {
      const a = Array.from({ length: n }, (_, i) => i + 1);
      [a[0], a[n - 1]] = [a[n - 1], a[0]];
      return a;
    }
    return makeRandom(n, seed);
  }, [n, seed, preset]);

  // Build full history: alternating sub-phases.
  const history = useMemo(() => {
    const states = [{ arr: initial.slice(), phase: "init", swaps: [], label: "Vstup" }];
    let arr = initial.slice();
    let iter = 0;
    const maxIters = Math.ceil(n / 2);
    while (iter < maxIters && !isSorted(arr)) {
      // odd phase (0-indexed pairs starting at 0)
      const r1 = oneSubPhase(arr, 0);
      states.push({ arr: r1.next.slice(), phase: "odd", swaps: r1.swaps, label: `Iterace ${iter + 1} — liché páry (0-1, 2-3, …)` });
      arr = r1.next;
      // even phase (0-indexed pairs starting at 1)
      const r2 = oneSubPhase(arr, 1);
      states.push({ arr: r2.next.slice(), phase: "even", swaps: r2.swaps, label: `Iterace ${iter + 1} — sudé páry (1-2, 3-4, …)` });
      arr = r2.next;
      iter++;
    }
    return states;
  }, [initial, n]);

  const [step, setStep] = useState(0);
  const cur = history[Math.min(step, history.length - 1)];

  // Reset step when initial changes
  useMemo(() => { setStep(0); }, [initial]);

  const W = 540, H = 200;
  const cellW = (W - 40) / n;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Controls */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>n:</span>
        <input type="range" min="4" max="16" step="2" value={n} onChange={(e) => { setN(parseInt(e.target.value, 10)); setStep(0); }} style={{ width: 80 }} />
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", minWidth: 24 }}>{n}</span>
        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 8 }}>preset:</span>
        {["random", "reverse", "almost"].map((k) => (
          <button key={k} onClick={() => { setPreset(k); setStep(0); }}
            style={{ ...modeBtn, ...(preset === k ? activeBtn : {}) }}>
            {k === "random" ? "náhodný" : k === "reverse" ? "reverzní (worst-case)" : "skoro seřazený"}
          </button>
        ))}
        {preset === "random" && (
          <button onClick={() => setSeed(seed + 1)} style={modeBtn}>↻ jiný náhodný</button>
        )}
      </div>

      {/* Step nav */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step} / {history.length - 1}
        </div>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.min(history.length - 1, step + 1))} disabled={step >= history.length - 1}>další →</button>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(history.length - 1)}>⏭ konec</button>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(0)}>↻</button>
      </div>

      {/* Array SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Title */}
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
              fill={cur.phase === "odd" ? "var(--accent)" : cur.phase === "even" ? "oklch(0.55 0.18 65)" : "var(--text)"}>
          {cur.label}
        </text>

        {/* Cells */}
        {cur.arr.map((v, i) => {
          const isSwapped = cur.swaps.some(([a, b]) => a === i || b === i);
          // Show pair highlight for non-init phases
          let pairHighlight = null;
          if (cur.phase !== "init") {
            const start = cur.phase === "odd" ? 0 : 1;
            if ((i - start) >= 0 && (i - start) % 2 === 0 && i + 1 < n) pairHighlight = "left";
            if ((i - start - 1) >= 0 && (i - start - 1) % 2 === 0) pairHighlight = "right";
          }
          return (
            <g key={`c-${i}`}>
              {pairHighlight === "left" && (
                <rect x={20 + i * cellW - 2} y={60} width={2 * cellW + 4} height="48"
                      fill="none" stroke={cur.phase === "odd" ? "var(--accent)" : "oklch(0.55 0.18 65)"} strokeWidth="1" strokeDasharray="3 3" rx="3" opacity="0.5" />
              )}
              <rect x={20 + i * cellW + 1} y={64} width={cellW - 2} height="40"
                    fill={isSwapped ? (cur.phase === "odd" ? "oklch(0.62 0.14 252 / 0.35)" : "oklch(0.62 0.14 65 / 0.35)") : "var(--bg-card)"}
                    stroke={isSwapped ? (cur.phase === "odd" ? "var(--accent)" : "oklch(0.55 0.18 65)") : "var(--line-strong)"} strokeWidth="1" />
              <text x={20 + i * cellW + cellW / 2} y={89} textAnchor="middle" fontSize="14" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">
                {v}
              </text>
              <text x={20 + i * cellW + cellW / 2} y={122} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{i}</text>
            </g>
          );
        })}

        {/* Swap arrows */}
        {cur.swaps.map(([a, b], i) => {
          const x1 = 20 + a * cellW + cellW / 2;
          const x2 = 20 + b * cellW + cellW / 2;
          const y = 145;
          return (
            <g key={`sw-${i}`}>
              <path d={`M ${x1} 130 Q ${(x1 + x2) / 2} ${y + 15} ${x2} 130`} fill="none"
                    stroke={cur.phase === "odd" ? "var(--accent)" : "oklch(0.55 0.18 65)"} strokeWidth="1.5"
                    markerEnd="url(#oeArr)" markerStart="url(#oeArr)" />
              <text x={(x1 + x2) / 2} y={y + 20} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)"
                    fill={cur.phase === "odd" ? "var(--accent)" : "oklch(0.55 0.18 65)"}>swap</text>
            </g>
          );
        })}

        {/* Sorted indicator */}
        {isSorted(cur.arr) && step > 0 && (
          <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="oklch(0.55 0.18 142)" fontFamily="var(--font-mono)">
            ✓ seřazeno
          </text>
        )}

        <defs>
          <marker id="oeArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      {/* Stats */}
      <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 12 }}>
        <div>
          <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase" }}>iterace</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)" }}>{Math.ceil(step / 2)}</div>
        </div>
        <div>
          <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase" }}>max iterací</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)" }}>{Math.ceil(n / 2)}</div>
        </div>
        <div>
          <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase" }}>swapů v kroku</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: cur.swaps.length > 0 ? "var(--accent)" : "var(--text-faint)" }}>{cur.swaps.length}</div>
        </div>
        <div>
          <div style={{ color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase" }}>topologie</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)" }}>lineární řetěz</div>
        </div>
      </div>

      {/* Explanation */}
      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 6, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Liché a sudé fáze se střídají. Každá inverze se posune nanejvýš o 1 pozici za pár fází.
        Nejhorší případ <code style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>[n, n-1, …, 1]</code> potřebuje <b>{Math.ceil(n / 2)}</b> iterací — žádná hodnota nesmí přejít přes víc než {n - 1} pozic.
        Algoritmus je <em>paralelní bubblesort</em>: O(n) čas, O(n) procesorů, O(n²) cena — není cost-optimal, ale jednoduchý na hardware.
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
const navBtn = {
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
};
