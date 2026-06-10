// Blelloch scan — up-sweep + down-sweep krok za krokem.
// Editovatelné vstupní pole (mocnina 2), volitelný operátor (+/max/min/OR).
// Vidíš strom redukcí v up-sweep i swap-with-modification v down-sweep.
import { useState, useMemo } from "react";

const OPERATORS = {
  "+": { fn: (a, b) => a + b, identity: 0, label: "součet" },
  "max": { fn: (a, b) => Math.max(a, b), identity: -Infinity, label: "maximum" },
  "min": { fn: (a, b) => Math.min(a, b), identity: Infinity, label: "minimum" },
  "OR": { fn: (a, b) => a | b, identity: 0, label: "bitové OR" },
};

const PRESETS = {
  "klasický": [3, 1, 7, 0, 4, 1, 6, 3],
  "vzestupný": [1, 2, 3, 4, 5, 6, 7, 8],
  "stejné": [5, 5, 5, 5, 5, 5, 5, 5],
  "bity": [1, 0, 1, 1, 0, 0, 1, 0],
};

// Run Blelloch and record every intermediate array state.
// Phase log: phase, step (within phase), description, array, highlightPairs[{i, j, op}], pendingArray? (next state)
function simulateBlelloch(input, op) {
  const { fn, identity } = op;
  const n = input.length;
  const logN = Math.log2(n);
  const states = [];

  // Step 0: initial
  let A = input.slice();
  states.push({
    phase: "init", level: 0, label: "Vstup",
    detail: "Počáteční pole — vstup pro scan operaci.",
    array: A.slice(), highlights: [],
  });

  // UP-SWEEP
  for (let d = 0; d < logN; d++) {
    const stride = 1 << (d + 1);
    const half = 1 << d;
    const pairs = [];
    const next = A.slice();
    for (let i = 0; i + stride - 1 < n; i += stride) {
      const left = i + half - 1;
      const right = i + stride - 1;
      next[right] = fn(A[left], A[right]);
      pairs.push({ from: left, to: right, leftVal: A[left], rightVal: A[right], result: next[right] });
    }
    states.push({
      phase: "up", level: d + 1,
      label: `Up-sweep ${d + 1}/${logN}`,
      detail: `Páry s odstupem ${stride}: A[i+${stride}-1] ← A[i+${half}-1] ⊕ A[i+${stride}-1]. Aktivní procesory: ${pairs.length}.`,
      array: next.slice(), highlights: pairs.map((p) => ({ left: p.from, right: p.to })),
    });
    A = next;
  }

  // After up-sweep, A[n-1] contains the total reduction.
  // DOWN-SWEEP: set root to identity, then propagate
  const total = A[n - 1];
  let B = A.slice();
  B[n - 1] = identity === -Infinity ? 0 : identity === Infinity ? 0 : identity;
  states.push({
    phase: "init-down", level: 0,
    label: "Inicializace down-sweep",
    detail: `Hodnota v poslední buňce (= celková redukce ${total}) je nahrazena neutrálním prvkem ${identity === -Infinity || identity === Infinity ? 0 : identity}. Začínáme distribuci.`,
    array: B.slice(), highlights: [{ root: n - 1 }],
    totalReduce: total,
  });

  // DOWN-SWEEP loop
  for (let d = logN - 1; d >= 0; d--) {
    const stride = 1 << (d + 1);
    const half = 1 << d;
    const pairs = [];
    const next = B.slice();
    for (let i = 0; i + stride - 1 < n; i += stride) {
      const left = i + half - 1;
      const right = i + stride - 1;
      const t = B[left]; // temp = old left
      next[left] = B[right]; // L ← parent
      next[right] = fn(t, B[right]); // R ← parent ⊕ original L
      pairs.push({ left, right, oldL: t, oldR: B[right] });
    }
    states.push({
      phase: "down", level: logN - d,
      label: `Down-sweep ${logN - d}/${logN}`,
      detail: `L-syn ← otec, R-syn ← otec ⊕ (původní L). Stride ${stride}.`,
      array: next.slice(), highlights: pairs.map((p) => ({ left: p.left, right: p.right })),
    });
    B = next;
  }

  states.push({
    phase: "done", level: logN,
    label: "Hotovo — výsledek je prescan",
    detail: `Pole obsahuje exclusive scan. Každá pozice i = a₀ ⊕ a₁ ⊕ ... ⊕ a_{i-1}. Pozice 0 = neutrální prvek.`,
    array: B.slice(), highlights: [],
    finalResult: true,
  });

  return states;
}

export default function PrefixSumAlgoritmus() {
  const [input, setInput] = useState(PRESETS["klasický"]);
  const [opKey, setOpKey] = useState("+");
  const [step, setStep] = useState(0);

  const op = OPERATORS[opKey];
  const states = useMemo(() => simulateBlelloch(input, op), [input, op]);
  const current = states[Math.min(step, states.length - 1)];

  const n = input.length;
  const cellW = 460 / n;
  const W = 540, H = 280;

  // edit an array element
  const updateCell = (idx, val) => {
    const next = input.slice();
    next[idx] = isNaN(val) ? 0 : val;
    setInput(next);
    setStep(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Controls */}
      <div className="viz-controls" style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>operátor:</span>
        {Object.keys(OPERATORS).map((k) => (
          <button key={k} className="viz-btn" data-active={opKey === k} onClick={() => { setOpKey(k); setStep(0); }}>
            {k}
          </button>
        ))}
        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 8 }}>preset:</span>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} className="viz-btn" onClick={() => { setInput(PRESETS[k]); setStep(0); }}>
            {k}
          </button>
        ))}
      </div>

      {/* Step nav */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step + 1} / {states.length}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(states.length - 1, step + 1))} disabled={step >= states.length - 1}>další →</button>
        <button className="viz-btn" onClick={() => setStep(0)}>↻</button>
      </div>

      {/* Array visualization with arrows showing pair operations */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Phase badge */}
        <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700"
              fill={current.phase === "up" ? "var(--accent)" : current.phase === "down" ? "oklch(0.55 0.18 142)" : "var(--text)"}>
          {current.label}
        </text>

        {/* Arrows / connections between cells for highlighted pairs */}
        {current.highlights && current.highlights.map((h, i) => {
          if (h.left == null) return null;
          const x1 = 40 + h.left * cellW + cellW / 2;
          const x2 = 40 + h.right * cellW + cellW / 2;
          const yArc = 100;
          const yCell = 170;
          const phaseColor = current.phase === "up" ? "var(--accent)" : "oklch(0.55 0.18 142)";
          return (
            <g key={`hl-${i}`}>
              <path d={`M ${x1} ${yCell} Q ${(x1 + x2) / 2} ${yArc} ${x2} ${yCell}`}
                    fill="none" stroke={phaseColor} strokeWidth="1.8" opacity="0.9"
                    markerEnd={current.phase === "up" ? "url(#psaArrUp)" : null} />
              {current.phase === "down" && (
                <>
                  {/* L-syn ← parent: arrow from right to left */}
                  <path d={`M ${x2 - 12} ${yCell - 5} Q ${(x1 + x2) / 2} ${yArc - 30} ${x1 + 8} ${yCell - 5}`}
                        fill="none" stroke="oklch(0.55 0.18 142)" strokeWidth="1.4" opacity="0.7"
                        markerEnd="url(#psaArrDown)" strokeDasharray="3 2" />
                </>
              )}
            </g>
          );
        })}

        {/* Cells */}
        {current.array.map((v, i) => {
          const x = 40 + i * cellW;
          const isHL = current.highlights && current.highlights.some((h) => h.left === i || h.right === i);
          const isRoot = current.highlights && current.highlights.some((h) => h.root === i);
          return (
            <g key={`c-${i}`}>
              <rect x={x + 1} y={170} width={cellW - 2} height="32"
                    fill={isRoot ? "oklch(0.62 0.18 22 / 0.3)" : isHL ? "oklch(0.62 0.14 252 / 0.25)" : "var(--bg-card)"}
                    stroke={isRoot ? "oklch(0.55 0.18 22)" : isHL ? "var(--accent)" : "var(--line-strong)"} strokeWidth="1" />
              <text x={x + cellW / 2} y={190} textAnchor="middle" fontSize="13" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">
                {v === Infinity ? "∞" : v === -Infinity ? "-∞" : v}
              </text>
              <text x={x + cellW / 2} y={216} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{i}</text>
            </g>
          );
        })}

        <defs>
          <marker id="psaArrUp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)" />
          </marker>
          <marker id="psaArrDown" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 142)" />
          </marker>
        </defs>
      </svg>

      {/* Editable input row */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", alignSelf: "center", marginRight: 4 }}>edituj:</span>
        {input.map((v, i) => (
          <input key={i} type="number" value={v} onChange={(e) => updateCell(i, parseInt(e.target.value, 10))}
            style={{ width: 36, padding: "3px 4px", fontSize: 11, fontFamily: "var(--font-mono)",
                     background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 3,
                     color: "var(--text)", textAlign: "center" }} />
        ))}
      </div>

      {/* Description */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{current.detail}</div>
        {current.totalReduce !== undefined && (
          <div style={{ marginTop: 6, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text)" }}>
            celková redukce (reduce) = <b style={{ color: "var(--accent)" }}>{current.totalReduce}</b>
          </div>
        )}
        {current.finalResult && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--text)" }}>
            <b>Inclusive scan</b> (sčítání i sebe sama) získáš posunem o jedna doleva + přidáním reduce na konec.
          </div>
        )}
      </div>

      {/* Complexity */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        čas: <b style={{ color: "var(--text)" }}>O(log n) = {Math.log2(n).toFixed(0)} úrovní</b> &nbsp;·&nbsp;
        procesory: <b style={{ color: "var(--text)" }}>n/2 = {n / 2}</b> &nbsp;·&nbsp;
        cena: <b style={{ color: "var(--text)" }}>O(n log n)</b> &nbsp;·&nbsp;
        s Brentem: <b style={{ color: "var(--accent)" }}>cost-optimal O(n)</b>
      </div>
    </div>
  );
}

