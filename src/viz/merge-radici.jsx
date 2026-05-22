// Bucket Sort tree + Batcher Odd-Even Merge sorting network + Pipeline Merge Sort.
// Tři režimy přepínatelné v UI.
// Pipeline ověřeno: vstup [5,2,8,1,7,3,6,4] → výstup [1,2,3,4,5,6,7,8] ✓
import { useState, useMemo } from "react";

// ─── Bucket Sort ──────────────────────────────────────────────────────────
function buildBucketSort(input, m) {
  const n = input.length;
  const chunkSize = Math.ceil(n / m);
  const chunks = [];
  for (let i = 0; i < m; i++) {
    chunks.push(input.slice(i * chunkSize, Math.min((i + 1) * chunkSize, n)));
  }
  const states = [];
  states.push({ kind: "init", level: 0, chunks: chunks.map((c) => c.slice()), label: "Distribuce: vstup rozdělen mezi log n listů" });
  const sortedChunks = chunks.map((c) => c.slice().sort((a, b) => a - b));
  states.push({ kind: "leaf-sort", level: 0, chunks: sortedChunks.map((c) => c.slice()), label: "Lokální sort v každém listu (sekvenčně)" });
  let cur = sortedChunks.map((c) => c.slice());
  let level = 1;
  while (cur.length > 1) {
    const next = [];
    for (let i = 0; i + 1 < cur.length; i += 2) {
      next.push(merge(cur[i], cur[i + 1]));
    }
    if (cur.length % 2 === 1) next.push(cur[cur.length - 1].slice());
    states.push({ kind: "merge", level, chunks: next.map((c) => c.slice()), label: `Úroveň ${level}: merge sousedních posloupností` });
    cur = next;
    level++;
  }
  return states;
}
function merge(a, b) {
  const out = []; let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]); else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

// ─── Batcher Odd-Even Merge Sort (for n=8) ─────────────────────────────
const OEMS8 = [
  [[0, 1], [2, 3], [4, 5], [6, 7]],
  [[0, 2], [1, 3], [4, 6], [5, 7]],
  [[1, 2], [5, 6]],
  [[0, 4], [1, 5], [2, 6], [3, 7]],
  [[2, 4], [3, 5]],
  [[1, 2], [3, 4], [5, 6]],
];

function runOEMS(input) {
  const states = [{ arr: input.slice(), compares: [], stage: -1, label: "Vstup" }];
  let arr = input.slice();
  OEMS8.forEach((column, stage) => {
    const next = arr.slice();
    column.forEach(([i, j]) => {
      if (next[i] > next[j]) [next[i], next[j]] = [next[j], next[i]];
    });
    states.push({ arr: next.slice(), compares: column, stage, label: `Sloupec ${stage + 1}: ${column.length} paralelních comparator-exchange` });
    arr = next;
  });
  return states;
}

// ─── Pipeline Merge Sort ────────────────────────────────────────────────
// numProc = log2(n) procesorů P_1..P_log n. P_i merges length-2^(i-1) runs.
// Each cycle: P_1 reads next input (alternating queues), each proc advances merge.
// Decisions based on OLD state; updates take effect this cycle.
function deepCloneProc(p) {
  return {
    runLen: p.runLen,
    q1: p.q1.slice(),
    q2: p.q2.slice(),
    merging: p.merging ? {
      run1: p.merging.run1.slice(),
      run2: p.merging.run2.slice(),
      pos1: p.merging.pos1,
      pos2: p.merging.pos2,
      outQueue: p.merging.outQueue,
    } : null,
    outQueueForNextMerge: p.outQueueForNextMerge,
  };
}

function simulatePipeline(input) {
  const n = input.length;
  const numProc = Math.log2(n);
  if (!Number.isInteger(numProc)) throw new Error("n must be power of 2");

  const procs = Array.from({ length: numProc }, (_, i) => ({
    runLen: 1 << i,
    q1: [], q2: [],
    merging: null,
    outQueueForNextMerge: "q1",
  }));

  let inputPtr = 0;
  let inputQueueChoiceForP1 = "q1";
  const output = [];
  const states = [];

  states.push({
    cycle: 0,
    inputPtr: 0,
    procs: procs.map(deepCloneProc),
    output: [],
    events: [],
    activeProcs: [],
    label: "Inicializace — všechny procesory prázdné",
  });

  const maxCycles = 5 * n;
  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    const oldProcs = procs.map(deepCloneProc);
    const events = [];
    const activeProcs = new Set();

    // P_1 reads input
    if (inputPtr < n) {
      procs[0][inputQueueChoiceForP1].push(input[inputPtr]);
      events.push(`P_1 čte input[${inputPtr}]=${input[inputPtr]} → ${inputQueueChoiceForP1}`);
      inputPtr++;
      inputQueueChoiceForP1 = inputQueueChoiceForP1 === "q1" ? "q2" : "q1";
    }

    for (let i = 0; i < numProc; i++) {
      const oldP = oldProcs[i];
      const newP = procs[i];
      const runLen = newP.runLen;

      if (oldP.merging) {
        const m = oldP.merging;
        let nextPos1 = m.pos1, nextPos2 = m.pos2, val;
        if (nextPos1 >= m.run1.length) {
          val = m.run2[nextPos2]; nextPos2++;
        } else if (nextPos2 >= m.run2.length) {
          val = m.run1[nextPos1]; nextPos1++;
        } else if (m.run1[nextPos1] <= m.run2[nextPos2]) {
          val = m.run1[nextPos1]; nextPos1++;
        } else {
          val = m.run2[nextPos2]; nextPos2++;
        }
        if (i === numProc - 1) {
          output.push(val);
          events.push(`P_${i + 1} výstup ${val} → FINAL`);
        } else {
          procs[i + 1][m.outQueue].push(val);
          events.push(`P_${i + 1} výstup ${val} → P_${i + 2}.${m.outQueue}`);
        }
        activeProcs.add(i);
        if (nextPos1 >= m.run1.length && nextPos2 >= m.run2.length) {
          newP.merging = null;
        } else {
          newP.merging = { run1: m.run1, run2: m.run2, pos1: nextPos1, pos2: nextPos2, outQueue: m.outQueue };
        }
      } else if (oldP.q1.length >= runLen && oldP.q2.length >= runLen) {
        const run1 = oldP.q1.slice(0, runLen);
        const run2 = oldP.q2.slice(0, runLen);
        newP.q1.splice(0, runLen);
        newP.q2.splice(0, runLen);
        const outQueue = oldP.outQueueForNextMerge;
        newP.outQueueForNextMerge = outQueue === "q1" ? "q2" : "q1";
        let val, pos1 = 0, pos2 = 0;
        if (run1[0] <= run2[0]) { val = run1[0]; pos1 = 1; } else { val = run2[0]; pos2 = 1; }
        if (i === numProc - 1) {
          output.push(val);
          events.push(`P_${i + 1} start merge, výstup ${val} → FINAL`);
        } else {
          procs[i + 1][outQueue].push(val);
          events.push(`P_${i + 1} start merge, výstup ${val} → P_${i + 2}.${outQueue}`);
        }
        activeProcs.add(i);
        if (pos1 >= run1.length && pos2 >= run2.length) {
          newP.merging = null;
        } else {
          newP.merging = { run1, run2, pos1, pos2, outQueue };
        }
      }
    }

    states.push({
      cycle,
      inputPtr,
      procs: procs.map(deepCloneProc),
      output: output.slice(),
      events,
      activeProcs: Array.from(activeProcs),
      label: `Cyklus ${cycle}`,
    });

    if (output.length === n) break;
  }
  return states;
}

function isCorrectlySorted(input, output) {
  if (!output || output.length !== input.length) return false;
  const sorted = input.slice().sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) if (sorted[i] !== output[i]) return false;
  return true;
}

const PRESETS = {
  "klasický": [7, 3, 8, 1, 5, 2, 6, 4],
  "reverzní": [8, 7, 6, 5, 4, 3, 2, 1],
  "skoro seřazený": [1, 2, 3, 4, 5, 6, 8, 7],
};
const PIPELINE_PRESETS = {
  "klasický": [5, 2, 8, 1, 7, 3, 6, 4],
  "reverzní": [8, 7, 6, 5, 4, 3, 2, 1],
  "skoro seřazený": [1, 2, 3, 4, 5, 6, 8, 7],
};

export default function MergeRadici() {
  const [mode, setMode] = useState("bucket"); // "bucket" | "batcher" | "pipeline"
  const [presetKey, setPresetKey] = useState("klasický");
  const [step, setStep] = useState(0);

  const presets = mode === "pipeline" ? PIPELINE_PRESETS : PRESETS;
  const input = presets[presetKey];

  const states = useMemo(() => {
    if (mode === "bucket") return buildBucketSort(input, 4);
    if (mode === "batcher") return runOEMS(input);
    return simulatePipeline(input);
  }, [mode, presetKey]);

  const cur = states[Math.min(step, states.length - 1)];
  useMemo(() => { setStep(0); }, [mode, presetKey]);

  const W = 560, H = 320;
  const last = states[states.length - 1];
  let verifiedOutput = null;
  if (mode === "bucket" && last.kind === "merge") verifiedOutput = last.chunks[0];
  if (mode === "batcher" && last.arr) verifiedOutput = last.arr;
  if (mode === "pipeline" && last.output) verifiedOutput = last.output;
  const verified = verifiedOutput && isCorrectlySorted(input, verifiedOutput);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>algoritmus:</span>
        <button onClick={() => setMode("bucket")} style={{ ...modeBtn, ...(mode === "bucket" ? activeBtn : {}) }}>Bucket Sort (strom)</button>
        <button onClick={() => setMode("batcher")} style={{ ...modeBtn, ...(mode === "batcher" ? activeBtn : {}) }}>Batcher OEMS</button>
        <button onClick={() => setMode("pipeline")} style={{ ...modeBtn, ...(mode === "pipeline" ? activeBtn : {}) }}>Pipeline Merge</button>
        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 8 }}>vstup:</span>
        {Object.keys(presets).map((k) => (
          <button key={k} onClick={() => setPresetKey(k)} style={{ ...modeBtn, ...(presetKey === k ? activeBtn : {}) }}>{k}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {mode === "pipeline" ? `cyklus ${cur.cycle ?? 0} / ${last.cycle ?? 0}` : `krok ${step + 1} / ${states.length}`}
        </div>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.min(states.length - 1, step + 1))} disabled={step >= states.length - 1}>další →</button>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(states.length - 1)}>⏭</button>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(0)}>↻</button>
      </div>

      {mode === "bucket" ? <BucketView state={cur} step={step} states={states} W={W} H={H} /> :
       mode === "batcher" ? <BatcherView state={cur} step={step} states={states} W={W} H={H} /> :
       <PipelineView state={cur} W={W} H={H} input={input} />}

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {cur.label}
        {step === states.length - 1 && verified && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: "oklch(0.55 0.18 142)", fontFamily: "var(--font-mono)" }}>
            ✓ ověřeno: výstup [{verifiedOutput.join(", ")}] je správně seřazen
          </div>
        )}
      </div>

      {mode === "pipeline" && cur.events && cur.events.length > 0 && (
        <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-muted)", maxHeight: 80, overflowY: "auto" }}>
          {cur.events.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        {mode === "bucket" && <span>Bucket Sort: <b style={{ color: "var(--text)" }}>O(n) čas</b>, <b style={{ color: "var(--text)" }}>O(log n) procesorů</b>, <b style={{ color: "var(--accent)" }}>O(n log n) cena = cost-optimal</b></span>}
        {mode === "batcher" && <span>Batcher OEMS: <b style={{ color: "var(--text)" }}>O(log² n) čas (hloubka {OEMS8.length})</b>, <b style={{ color: "var(--text)" }}>O(n log² n) CE jednotek</b>, není cost-optimal — ale ideální pro FPGA/ASIC.</span>}
        {mode === "pipeline" && <span>Pipeline Merge: <b style={{ color: "var(--text)" }}>O(n) čas</b>, <b style={{ color: "var(--text)" }}>O(log n) procesorů</b>, <b style={{ color: "var(--accent)" }}>O(n log n) cena = cost-optimal</b>. Procesory pracují paralelně v pipeline stylu — streaming vstup.</span>}
      </div>
    </div>
  );
}

function BucketView({ state, step, states, W, H }) {
  const chunks = state.chunks;
  const m = chunks.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      <rect width={W} height={H} fill="var(--bg-inset)" />
      {chunks.map((chunk, i) => {
        const yLevel = state.kind === "init" || state.kind === "leaf-sort" ? 260 : 260 - state.level * 60;
        const totalW = 480;
        const xStart = 40 + (i * totalW) / m;
        return (
          <g key={i}>
            {chunk.map((v, j) => (
              <g key={j}>
                <rect x={xStart + j * 22} y={yLevel} width="20" height="26"
                      fill={state.kind === "leaf-sort" || state.kind === "merge" ? "oklch(0.62 0.14 252 / 0.25)" : "var(--bg-card)"}
                      stroke={state.kind === "leaf-sort" || state.kind === "merge" ? "var(--accent)" : "var(--line-strong)"} strokeWidth="0.9" />
                <text x={xStart + j * 22 + 10} y={yLevel + 17} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">{v}</text>
              </g>
            ))}
            <text x={xStart + (chunk.length * 22) / 2} y={yLevel - 6} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              {state.kind === "init" ? "list" : state.kind === "leaf-sort" ? "sorted leaf" : `úroveň ${state.level}`}
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
        Bucket Sort — krok {step + 1} z {states.length}
      </text>
    </svg>
  );
}

function BatcherView({ state, step, states, W, H }) {
  const n = 8;
  const wireY = (i) => 50 + i * 30;
  const stageX = (s) => 80 + s * 65;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      <rect width={W} height={H} fill="var(--bg-inset)" />
      {Array.from({ length: n }, (_, i) => (
        <line key={`w-${i}`} x1="60" y1={wireY(i)} x2={stageX(OEMS8.length) + 30} y2={wireY(i)} stroke="var(--line-strong)" strokeWidth="0.6" opacity="0.6" />
      ))}
      {OEMS8.map((col, s) => (
        <g key={`col-${s}`}>
          {col.map(([i, j], k) => {
            const isActive = state.stage === s;
            const color = isActive ? "var(--accent)" : "var(--line-strong)";
            return (
              <g key={k}>
                <line x1={stageX(s)} y1={wireY(i)} x2={stageX(s)} y2={wireY(j)} stroke={color} strokeWidth={isActive ? 2 : 1.2} />
                <circle cx={stageX(s)} cy={wireY(i)} r="4" fill={color} />
                <circle cx={stageX(s)} cy={wireY(j)} r="4" fill={color} />
              </g>
            );
          })}
        </g>
      ))}
      {state.arr.map((v, i) => (
        <g key={`v-${i}`}>
          <text x={45} y={wireY(i) + 4} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">{v}</text>
        </g>
      ))}
      {OEMS8.map((_, s) => (
        <text key={`sl-${s}`} x={stageX(s)} y={35} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={state.stage === s ? "var(--accent)" : "var(--text-faint)"}>{s + 1}</text>
      ))}
      <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
        Batcher Odd-Even Merge Sort (n=8, hloubka {OEMS8.length})
      </text>
    </svg>
  );
}

function PipelineView({ state, W, H, input }) {
  const n = input.length;
  const numProc = state.procs.length;
  const procWidth = 130;
  const procGap = 20;
  const startX = 40;
  const procY = 110;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      <rect width={W} height={H} fill="var(--bg-inset)" />

      {/* Input stream at top */}
      <text x={20} y={32} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 22)" fontWeight="600">vstup:</text>
      {input.map((v, i) => (
        <g key={`in-${i}`}>
          <rect x={70 + i * 28} y={20} width="22" height="20" rx="2"
                fill={i < state.inputPtr ? "oklch(0.62 0.18 22 / 0.15)" : "oklch(0.62 0.18 22 / 0.3)"}
                stroke="oklch(0.55 0.18 22)" strokeWidth={i === state.inputPtr - 1 ? 1.5 : 0.6}
                opacity={i < state.inputPtr ? 0.4 : 1} />
          <text x={70 + i * 28 + 11} y={35} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600"
                fill={i < state.inputPtr ? "var(--text-faint)" : "var(--text)"}>
            {v}
          </text>
        </g>
      ))}

      {/* Processors */}
      {state.procs.map((p, i) => {
        const x = startX + i * (procWidth + procGap);
        const isActive = state.activeProcs?.includes(i);
        return (
          <g key={`p-${i}`}>
            {/* Processor box */}
            <rect x={x} y={procY - 50} width={procWidth} height={150} rx="4"
                  fill="var(--bg-card)"
                  stroke={isActive ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={isActive ? 1.8 : 1} />
            <text x={x + procWidth / 2} y={procY - 36} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700" fill="var(--text)">
              P_{i + 1}
            </text>
            <text x={x + procWidth / 2} y={procY - 22} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              runLen = {p.runLen}
            </text>

            {/* q1 */}
            <text x={x + 8} y={procY - 4} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">q1:</text>
            <text x={x + 30} y={procY - 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
              [{p.q1.join(",")}]
            </text>
            {/* q2 */}
            <text x={x + 8} y={procY + 12} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">q2:</text>
            <text x={x + 30} y={procY + 12} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
              [{p.q2.join(",")}]
            </text>

            {/* merging */}
            {p.merging && (
              <g>
                <text x={x + 8} y={procY + 32} fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)" fontWeight="600">merging:</text>
                <text x={x + 8} y={procY + 46} fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">
                  r1[{p.merging.pos1}/{p.merging.run1.length}]={p.merging.run1.slice(p.merging.pos1).join(",")}
                </text>
                <text x={x + 8} y={procY + 60} fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">
                  r2[{p.merging.pos2}/{p.merging.run2.length}]={p.merging.run2.slice(p.merging.pos2).join(",")}
                </text>
                <text x={x + 8} y={procY + 74} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                  → out.{p.merging.outQueue}
                </text>
              </g>
            )}

            {/* Chain arrow to next */}
            {i < numProc - 1 && (
              <line x1={x + procWidth} y1={procY + 25} x2={x + procWidth + procGap} y2={procY + 25}
                    stroke="var(--line-strong)" strokeWidth="1" markerEnd="url(#pmArr)" />
            )}
          </g>
        );
      })}

      {/* Output stream */}
      <g>
        <text x={20} y={H - 20} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 142)" fontWeight="600">výstup:</text>
        <text x={70} y={H - 20} fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="oklch(0.55 0.18 142)">
          [{state.output.join(", ")}{state.output.length < n ? (state.output.length > 0 ? ", " : "") + "…" : ""}]
        </text>
      </g>

      <defs>
        <marker id="pmArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)" />
        </marker>
      </defs>
    </svg>
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
