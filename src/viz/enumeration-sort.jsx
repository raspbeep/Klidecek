// Enumeration Sort — mesh n×n verze + linear+bus verze.
// Princip: pozice prvku v setříděném výstupu = počet menších + 1.
// Ověřeno: [7,3,5,1] → ranks [4,2,3,1] → output [1,3,5,7] ✓
import { useState, useMemo } from "react";

const PRESETS = {
  "klasický": [7, 3, 5, 1],
  "vzestupný": [1, 3, 5, 7],
  "reverzní": [7, 5, 3, 1],
  "duplikáty*": [5, 3, 7, 5], // * with caveat
};

function computeRankMatrix(input) {
  const n = input.length;
  // RANK_ij = (x_j < x_i) ? 1 : 0
  const M = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      M[i][j] = input[j] < input[i] ? 1 : 0;
    }
  }
  return M;
}

function computeRanks(input) {
  // For each x_i, count strictly smaller elements + 1 = rank (1-indexed).
  // For duplicates we'd need tie-breaking; we use original index.
  const n = input.length;
  const ranks = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let cnt = 0;
    for (let j = 0; j < n; j++) {
      if (j !== i && (input[j] < input[i] || (input[j] === input[i] && j < i))) cnt++;
    }
    ranks[i] = cnt + 1;
  }
  return ranks;
}

function sortByRanks(input, ranks) {
  const n = input.length;
  const out = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    out[ranks[i] - 1] = input[i];
  }
  return out;
}

function isCorrectlySorted(input, output) {
  if (!output || output.length !== input.length) return false;
  const sorted = input.slice().sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) if (sorted[i] !== output[i]) return false;
  return true;
}

export default function EnumerationSort() {
  const [mode, setMode] = useState("mesh"); // "mesh" | "linear"
  const [presetKey, setPresetKey] = useState("klasický");
  const [phase, setPhase] = useState(0);

  const input = PRESETS[presetKey];
  const n = input.length;

  const meshMatrix = useMemo(() => computeRankMatrix(input), [input]);
  const ranks = useMemo(() => computeRanks(input), [input]);
  const output = useMemo(() => sortByRanks(input, ranks), [input, ranks]);
  const verified = isCorrectlySorted(input, output);

  useMemo(() => { setPhase(0); }, [mode, presetKey]);

  // ─── MESH phases ─────────────────────────
  // 0: empty grid
  // 1: distribute (show A,B in each cell)
  // 2: compute RANK_ij
  // 3: row sum
  // 4: place output
  const meshPhases = [
    { label: "0. Inicializace — pole vstoupí po obvodu mřížky" },
    { label: "1. Distribuce: P(i,j) dostane A = x_i (po řádku), B = x_j (po sloupci)" },
    { label: "2. Porovnání: RANK_ij = (B < A) ? 1 : 0" },
    { label: "3. Redukce po řádkách: sum RANK(i,·) + 1 = pozice prvku x_i" },
    { label: "4. Přesun: x_i jde na pozici RANK(i,1)" },
  ];
  const meshMax = meshPhases.length - 1;

  // ─── LINEAR phases ─────────────────────────
  // 0: init values in X registers
  // 1: counting phase done → C_k registers show counts
  // 2: bus routing → each x_k goes to P_{C_k}
  // 3: final output
  const linearPhases = [
    { label: "0. Inicializace — všichni P mají prázdné registry" },
    { label: "1. Vstupní fáze: x_k jde po sběrnici do P_k.X a vlévá se přes řetěz do Y. C_k počítá kolikrát X > Y." },
    { label: "2. Po n cyklech: C_k = počet menších než x_k. To je pořadí x_k (0-indexované)." },
    { label: "3. Výstupní fáze: P_k pošle X po sběrnici procesoru P_{C_k+1}, který uloží do Z." },
    { label: "4. Konec — pořadí Z odpovídá seřazené posloupnosti." },
  ];
  const linearMax = linearPhases.length - 1;

  const cur = mode === "mesh" ? meshPhases[phase] : linearPhases[phase];
  const maxPhase = mode === "mesh" ? meshMax : linearMax;

  const W = 560, H = 380;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls" style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>topologie:</span>
        <button className="viz-btn" data-active={mode === "mesh"} onClick={() => setMode("mesh")}>Mřížka n×n</button>
        <button className="viz-btn" data-active={mode === "linear"} onClick={() => setMode("linear")}>Lineární + sběrnice</button>
        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 8 }}>vstup:</span>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} className="viz-btn" data-active={presetKey === k} onClick={() => setPresetKey(k)}>{k}</button>
        ))}
      </div>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setPhase(Math.max(0, phase - 1))} disabled={phase === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          fáze {phase} / {maxPhase}
        </span>
        <button className="viz-btn primary" onClick={() => setPhase(Math.min(maxPhase, phase + 1))} disabled={phase >= maxPhase}>další →</button>
        <button className="viz-btn" onClick={() => setPhase(0)}>↻</button>
      </div>

      {mode === "mesh" ? (
        <MeshView input={input} matrix={meshMatrix} ranks={ranks} output={output} phase={phase} W={W} H={H} />
      ) : (
        <LinearView input={input} ranks={ranks} output={output} phase={phase} W={W} H={H} />
      )}

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{cur.label}</div>
        {phase === maxPhase && verified && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: "oklch(0.55 0.18 142)", fontFamily: "var(--font-mono)" }}>
            ✓ ověřeno: výstup [{output.join(", ")}] je správně seřazen
          </div>
        )}
      </div>

      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        {mode === "mesh" ? (
          <span>
            Mřížka n×n: čas <b style={{ color: "var(--text)" }}>O(log n)</b>, procesorů <b style={{ color: "var(--text)" }}>n²</b>, cena <b style={{ color: "oklch(0.55 0.18 22)" }}>O(n² log n)</b> — extrémně rychlé, ale plýtvá procesory.
          </span>
        ) : (
          <span>
            Lineární + sběrnice: čas <b style={{ color: "var(--text)" }}>O(n)</b>, procesorů <b style={{ color: "var(--text)" }}>n</b>, cena <b style={{ color: "oklch(0.55 0.18 22)" }}>O(n²)</b> — jednodušší HW, ale ne cost-optimal.
          </span>
        )}
      </div>
    </div>
  );
}

function MeshView({ input, matrix, ranks, output, phase, W, H }) {
  const n = input.length;
  const cellSize = 70;
  const gridX0 = 100, gridY0 = 60;
  const showA = phase >= 1;
  const showRanks = phase >= 2;
  const showRowSum = phase >= 3;
  const showOutput = phase >= 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      <rect width={W} height={H} fill="var(--bg-inset)" />

      {/* Input vector on left (column) */}
      <text x={gridX0 - 50} y={gridY0 - 16} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 22)" fontWeight="600">x_i ↓</text>
      {input.map((v, i) => (
        <g key={`in-${i}`}>
          <rect x={gridX0 - 38} y={gridY0 + i * cellSize + 18} width="24" height="24" rx="3" fill="oklch(0.62 0.18 22 / 0.2)" stroke="oklch(0.55 0.18 22)" strokeWidth="0.8" />
          <text x={gridX0 - 26} y={gridY0 + i * cellSize + 34} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">{v}</text>
        </g>
      ))}

      {/* Input vector on top (row) */}
      <text x={gridX0 + n * cellSize / 2} y={gridY0 - 24} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 65)" fontWeight="600">x_j →</text>
      {input.map((v, j) => (
        <g key={`top-${j}`}>
          <rect x={gridX0 + j * cellSize + 18} y={gridY0 - 14} width="24" height="20" rx="3" fill="oklch(0.62 0.18 65 / 0.2)" stroke="oklch(0.55 0.18 65)" strokeWidth="0.8" />
          <text x={gridX0 + j * cellSize + 30} y={gridY0 + 1} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">{v}</text>
        </g>
      ))}

      {/* Grid cells */}
      {input.map((a, i) =>
        input.map((b, j) => {
          const x = gridX0 + j * cellSize + 6;
          const y = gridY0 + i * cellSize + 14;
          const cellW = cellSize - 10;
          const cellH = cellSize - 20;
          const rankVal = matrix[i][j];
          return (
            <g key={`c-${i}-${j}`}>
              <rect x={x} y={y} width={cellW} height={cellH} rx="3"
                    fill={showRanks && rankVal === 1 ? "oklch(0.62 0.14 142 / 0.2)" : "var(--bg-card)"}
                    stroke={showRanks && rankVal === 1 ? "oklch(0.55 0.18 142)" : "var(--line-strong)"} strokeWidth="0.8" />
              <text x={x + cellW / 2} y={y + 12} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">P({i + 1},{j + 1})</text>
              {showA && !showRanks && (
                <>
                  <text x={x + 6} y={y + 30} fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 22)">A={a}</text>
                  <text x={x + 6} y={y + 42} fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 65)">B={b}</text>
                </>
              )}
              {showRanks && (
                <text x={x + cellW / 2} y={y + 34} textAnchor="middle" fontSize="16" fontFamily="var(--font-mono)" fontWeight="700"
                      fill={rankVal === 1 ? "oklch(0.55 0.18 142)" : "var(--text-faint)"}>
                  {rankVal}
                </text>
              )}
            </g>
          );
        })
      )}

      {/* Row sum on the right */}
      {showRowSum && (
        <g>
          <text x={gridX0 + n * cellSize + 28} y={gridY0 - 16} fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)" fontWeight="600">RANK+1</text>
          {ranks.map((r, i) => (
            <g key={`rk-${i}`}>
              <rect x={gridX0 + n * cellSize + 16} y={gridY0 + i * cellSize + 18} width="36" height="24" rx="3" fill="oklch(0.62 0.14 252 / 0.25)" stroke="var(--accent)" strokeWidth="0.8" />
              <text x={gridX0 + n * cellSize + 34} y={gridY0 + i * cellSize + 34} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--accent)">{r}</text>
            </g>
          ))}
        </g>
      )}

      {/* Output row at bottom */}
      {showOutput && (
        <g>
          <text x={gridX0 - 50} y={gridY0 + n * cellSize + 36} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 142)" fontWeight="600">output:</text>
          {output.map((v, i) => (
            <g key={`out-${i}`}>
              <rect x={gridX0 + i * cellSize + 18} y={gridY0 + n * cellSize + 22} width="24" height="24" rx="3" fill="oklch(0.62 0.14 142 / 0.3)" stroke="oklch(0.55 0.18 142)" strokeWidth="0.8" />
              <text x={gridX0 + i * cellSize + 30} y={gridY0 + n * cellSize + 38} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">{v}</text>
            </g>
          ))}
        </g>
      )}

      <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
        Enumeration Sort — mřížka {n}×{n}
      </text>
    </svg>
  );
}

function LinearView({ input, ranks, output, phase, W, H }) {
  const n = input.length;
  const procSpacing = 100;
  const procY = 180;
  const procX = (i) => 60 + i * procSpacing;
  // phase 0: empty, 1: showing X and C after counting, 2: same as 1 (transition), 3: routing arrows, 4: output stored in Z
  const showX = phase >= 1;
  const showC = phase >= 1;
  const showRouting = phase === 3;
  const showZ = phase >= 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      <rect width={W} height={H} fill="var(--bg-inset)" />

      {/* Bus at the top */}
      <line x1={30} y1={70} x2={W - 30} y2={70} stroke="oklch(0.55 0.18 22)" strokeWidth="2" opacity="0.7" />
      <text x={W / 2} y={62} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 22)" fontWeight="600">global bus</text>

      {/* Processors */}
      {input.map((v, i) => (
        <g key={`p-${i}`}>
          {/* Connection to bus */}
          <line x1={procX(i)} y1={70} x2={procX(i)} y2={procY - 30} stroke="oklch(0.55 0.18 22)" strokeWidth="0.6" opacity="0.6" strokeDasharray="2 2" />
          {/* Processor box */}
          <rect x={procX(i) - 40} y={procY - 30} width="80" height="100" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1" />
          <text x={procX(i)} y={procY - 14} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">P_{i + 1}</text>
          {/* X register */}
          <text x={procX(i) - 32} y={procY + 2} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">X:</text>
          <text x={procX(i) + 6} y={procY + 2} fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill={showX ? "var(--accent)" : "var(--text-faint)"}>{showX ? v : "—"}</text>
          {/* C register */}
          <text x={procX(i) - 32} y={procY + 22} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">C:</text>
          <text x={procX(i) + 6} y={procY + 22} fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill={showC ? "oklch(0.55 0.18 65)" : "var(--text-faint)"}>
            {showC ? ranks[i] - 1 : "—"}
          </text>
          {/* Z register */}
          <text x={procX(i) - 32} y={procY + 44} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">Z:</text>
          <text x={procX(i) + 6} y={procY + 44} fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill={showZ ? "oklch(0.55 0.18 142)" : "var(--text-faint)"}>
            {showZ ? output[i] : "—"}
          </text>
        </g>
      ))}

      {/* Chain links between processors */}
      {input.map((_, i) => (
        i < n - 1 ? <g key={`ch-${i}`}>
          <line x1={procX(i) + 40} y1={procY + 10} x2={procX(i + 1) - 40} y2={procY + 10} stroke="var(--line-strong)" strokeWidth="1" />
        </g> : null
      ))}

      {/* Routing arrows during phase 3 */}
      {showRouting && input.map((v, i) => {
        const target = ranks[i] - 1;
        const x1 = procX(i);
        const x2 = procX(target);
        return (
          <g key={`route-${i}`}>
            <path d={`M ${x1} ${procY - 30} Q ${(x1 + x2) / 2} ${30} ${x2} ${procY - 30}`}
                  fill="none" stroke="oklch(0.55 0.18 142)" strokeWidth="1.4" opacity="0.7" markerEnd="url(#esArr)" />
          </g>
        );
      })}

      <defs>
        <marker id="esArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 142)" />
        </marker>
      </defs>

      <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
        Enumeration Sort — lineární + sběrnice (n={n})
      </text>
      <text x={W / 2} y={36} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
        X = vstupní hodnota · C = počet menších · Z = výsledek na této pozici
      </text>
    </svg>
  );
}

