// List ranking pointer jumping — interaktivní.
// Vyber preset (lineární / obrácený / zamíchaný) nebo náhodně zamíchej.
// Sleduj, jak arcs zdvojnásobují svou délku v každé iteraci, dokud
// všechny uzly nedosáhnou konce. Verifikace: finální rank[i] = vzdálenost
// od i ke konci + 1 (počítáno přímým průchodem).
// Ověřeno: lineární [1,2,3,4,5,6,7,null] → ranks [8,7,6,5,4,3,2,1] ✓
import { useState, useMemo } from "react";

const PRESETS = {
  "lineární": [1, 2, 3, 4, 5, 6, 7, null],
  "obrácený": [null, 0, 1, 2, 3, 4, 5, 6],
  // permutation: 0→3→5→1→7→2→6→4→null
  "zamíchaný A": [3, 7, 6, 5, null, 1, 4, 2],
  // permutation: 5→2→7→0→4→6→3→1→null
  "zamíchaný B": [4, null, 7, 1, 6, 2, 3, 0],
};

function simulate(next0) {
  const n = next0.length;
  const states = [];
  let next = next0.slice();
  let rank = new Array(n).fill(1);
  states.push({
    next: next.slice(),
    rank: rank.slice(),
    iter: 0,
    jumps: [],
    label: "Inicializace: rank = 1 pro každý prvek, next = původní pointer",
  });

  const maxIter = Math.ceil(Math.log2(n)) + 1; // safety bound
  for (let it = 1; it <= maxIter; it++) {
    const newNext = next.slice();
    const newRank = rank.slice();
    let anyChange = false;
    const jumps = [];
    for (let i = 0; i < n; i++) {
      if (next[i] !== null) {
        newRank[i] = rank[i] + rank[next[i]];
        newNext[i] = next[next[i]];
        jumps.push({
          from: i,
          oldNext: next[i],
          newNext: newNext[i],
          rankAdded: rank[next[i]],
        });
        anyChange = true;
      }
    }
    next = newNext;
    rank = newRank;
    states.push({
      next: next.slice(),
      rank: rank.slice(),
      iter: it,
      jumps,
      label: `Iterace ${it}: ${jumps.length === 0 ? "už není co skákat" : `${jumps.length} uzlů skočilo; rank zdvojnásoben`}`,
    });
    if (!anyChange) break;
  }
  return states;
}

// Reference computation: for each node, walk to end counting positions.
function expectedRanks(next0) {
  const n = next0.length;
  const ranks = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let count = 1;
    let cur = next0[i];
    const visited = new Set([i]);
    while (cur !== null) {
      if (visited.has(cur)) break; // cycle guard
      visited.add(cur);
      count++;
      cur = next0[cur];
    }
    ranks[i] = count;
  }
  return ranks;
}

function isCorrect(final, expected) {
  for (let i = 0; i < expected.length; i++) {
    if (final[i] !== expected[i]) return false;
  }
  return true;
}

export default function ListRanking() {
  const [presetKey, setPresetKey] = useState("lineární");
  const [step, setStep] = useState(0);

  const next0 = PRESETS[presetKey];
  const n = next0.length;
  const states = useMemo(() => simulate(next0), [next0]);
  const expected = useMemo(() => expectedRanks(next0), [next0]);
  const cur = states[Math.min(step, states.length - 1)];

  useMemo(() => { setStep(0); }, [presetKey]);

  const W = 560, H = 320;
  const padX = 40;
  const nodeY = 180;
  const spacing = (W - 2 * padX) / (n - 1);
  const nodeX = (i) => padX + i * spacing;
  const NODE_R = 18;

  const finalState = states[states.length - 1];
  const verified = isCorrect(finalState.rank, expected);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls" style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>preset:</span>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} className="viz-btn" data-active={presetKey === k} onClick={() => setPresetKey(k)}>{k}</button>
        ))}
      </div>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          iterace {cur.iter} / {finalState.iter}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(states.length - 1, step + 1))} disabled={step >= states.length - 1}>další →</button>
        <button className="viz-btn" onClick={() => setStep(states.length - 1)}>⏭</button>
        <button className="viz-btn" onClick={() => setStep(0)}>↻</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Arrows from each node to its current next */}
        {cur.next.map((nx, i) => {
          if (nx === null) return null;
          const x1 = nodeX(i);
          const x2 = nodeX(nx);
          const dx = x2 - x1;
          const goingRight = dx > 0;
          const sign = goingRight ? 1 : -1;
          const startX = x1 + sign * NODE_R;
          const endX = x2 - sign * NODE_R;
          const midX = (x1 + x2) / 2;
          // Arc height scales with arc span. Bound to avoid going off-canvas.
          const arcHeight = Math.min(80, Math.abs(dx) * 0.5);
          const midY = goingRight ? nodeY - arcHeight : nodeY + arcHeight;
          const wasJumping = cur.jumps?.some((j) => j.from === i);
          // Color by relative arc length (longer arc = brighter)
          const distance = Math.abs(nx - i);
          const isLongJump = distance >= 2;
          const color = wasJumping ? "var(--accent)" : isLongJump ? "oklch(0.55 0.18 252)" : "var(--line-strong)";
          return (
            <g key={`a-${i}`}>
              <path d={`M ${startX} ${nodeY} Q ${midX} ${midY} ${endX} ${nodeY}`}
                    fill="none" stroke={color} strokeWidth={wasJumping ? 2 : 1.3}
                    opacity={wasJumping ? 1 : 0.75} markerEnd="url(#lrArr)" />
              {wasJumping && (
                <text x={midX} y={midY + (goingRight ? -4 : 12)} textAnchor="middle" fontSize="9"
                      fontFamily="var(--font-mono)" fill="var(--accent)" fontWeight="600">
                  +{cur.jumps.find((j) => j.from === i).rankAdded}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {Array.from({ length: n }, (_, i) => {
          const x = nodeX(i);
          const isEndNode = cur.next[i] === null;
          const isFinal = cur.rank[i] === expected[i];
          return (
            <g key={`n-${i}`}>
              <circle cx={x} cy={nodeY} r={NODE_R}
                      fill={isEndNode ? "oklch(0.62 0.14 142 / 0.25)" : isFinal ? "oklch(0.62 0.14 252 / 0.2)" : "var(--bg-card)"}
                      stroke={isEndNode ? "oklch(0.55 0.18 142)" : isFinal ? "var(--accent)" : "var(--line-strong)"}
                      strokeWidth="1.4" />
              <text x={x} y={nodeY + 4} textAnchor="middle" fontSize="13" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">{i}</text>
              {/* Rank label below */}
              <text x={x} y={nodeY + 40} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600"
                    fill={isFinal ? "oklch(0.55 0.18 142)" : "var(--accent)"}>
                {cur.rank[i]}
              </text>
              {/* Expected value */}
              <text x={x} y={nodeY + 56} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                (cíl {expected[i]})
              </text>
              {isEndNode && (
                <text x={x} y={nodeY - 32} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 142)">⊥ end</text>
              )}
            </g>
          );
        })}

        <defs>
          <marker id="lrArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>

        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
          {cur.label}
        </text>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          Stav po iteraci {cur.iter}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text)" }}>
          <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${n}, 1fr)`, gap: 2, alignItems: "center" }}>
            <span style={{ color: "var(--text-faint)" }}>index</span>
            {cur.next.map((_, i) => <span key={i} style={{ textAlign: "center", color: "var(--text-faint)" }}>{i}</span>)}
            <span style={{ color: "var(--text-muted)" }}>next</span>
            {cur.next.map((v, i) => (
              <span key={i} style={{ textAlign: "center", padding: "2px 4px", background: "var(--bg-inset)", borderRadius: 2, color: "var(--text-muted)" }}>
                {v === null ? "⊥" : v}
              </span>
            ))}
            <span style={{ color: "var(--text-muted)" }}>rank</span>
            {cur.rank.map((r, i) => (
              <span key={i} style={{ textAlign: "center", padding: "2px 4px", background: r === expected[i] ? "oklch(0.62 0.14 142 / 0.15)" : "var(--bg-inset)",
                                      borderRadius: 2, color: r === expected[i] ? "oklch(0.55 0.18 142)" : "var(--accent)", fontWeight: 600 }}>
                {r}
              </span>
            ))}
          </div>
        </div>
        {step === states.length - 1 && verified && (
          <div style={{ marginTop: 8, fontSize: 11.5, color: "oklch(0.55 0.18 142)", fontFamily: "var(--font-mono)" }}>
            ✓ ověřeno: rank[i] = vzdálenost od i ke konci + 1 pro všechna i
          </div>
        )}
      </div>

      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        V iteraci k má každý uzel pointer skákající přes <b style={{ color: "var(--text)" }}>2^k</b> uzlů. Po <b style={{ color: "var(--text)" }}>⌈log n⌉ = {Math.ceil(Math.log2(n))}</b> iteracích každý uzel zná svou vzdálenost ke konci. Algoritmus pracuje stejně dobře na lineárním i zamíchaném seznamu — pořadí <em>logických</em> sousedů nezávisí na <em>fyzických</em> indexech.
      </div>
    </div>
  );
}

