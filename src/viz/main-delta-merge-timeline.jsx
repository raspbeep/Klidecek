// main-delta-merge-timeline — column-store main + delta architecture.
// Insert rows into delta, SELECT scans both, then "Merge Delta" rebuilds
// the sorted compressed main store.
import { useState } from "react";

const W = 540, H = 280;

function makeInitial() {
  // Main store: sorted by country
  return {
    main: ["CZ", "CZ", "CZ", "DE", "DE", "FR", "US", "US", "US"],
    delta: [],
    queryHits: 0,
  };
}

export default function MainDeltaMergeTimeline() {
  const [state, setState] = useState(makeInitial);
  const [tick, setTick] = useState(0);

  function insert(country) {
    setState(s => ({ ...s, delta: [...s.delta, country] }));
  }
  function selectAll(country) {
    const m = state.main.filter(v => v === country).length;
    const d = state.delta.filter(v => v === country).length;
    setState(s => ({ ...s, queryHits: m + d, lastQuery: { country, m, d } }));
  }
  function mergeDelta() {
    setState(s => ({ main: [...s.main, ...s.delta].sort(), delta: [], queryHits: s.queryHits, lastQuery: s.lastQuery }));
    setTick(t => t + 1);
  }
  function reset() { setState(makeInitial()); }

  // Stats
  const mainSize = state.main.length;
  const deltaSize = state.delta.length;
  const total = mainSize + deltaSize;

  // Visualize as bar
  const PAD = 16;
  const barY = 60;
  const barH = 32;
  const totalW = W - PAD * 2 - 100;
  const mainW = (mainSize / Math.max(1, total)) * totalW;
  const deltaW = (deltaSize / Math.max(1, total)) * totalW;

  // Color per country
  const countries = Array.from(new Set([...state.main, ...state.delta]));
  const palette = ["oklch(0.65 0.16 264)", "oklch(0.65 0.16 145)", "oklch(0.7 0.15 22)", "oklch(0.7 0.15 320)", "oklch(0.7 0.15 60)"];
  const colorOf = (v) => palette[countries.indexOf(v) % palette.length];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => insert("CZ")}>INSERT CZ</button>
        <button className="viz-btn" onClick={() => insert("DE")}>INSERT DE</button>
        <button className="viz-btn" onClick={() => insert("UK")}>INSERT UK</button>
        <button className="viz-btn" onClick={() => insert("US")}>INSERT US</button>
        <div style={{ flex: 1 }} />
        <button className="viz-btn" onClick={() => selectAll("CZ")}>SELECT * WHERE c=CZ</button>
        <button className="viz-btn" data-active={deltaSize > 0} onClick={mergeDelta} disabled={deltaSize === 0}>MERGE DELTA</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Main store */}
        <text x={PAD} y={32} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">Main store · sorted · heavy compression</text>
        <rect x={PAD + 90} y={barY} width={mainW} height={barH} fill="var(--bg-inset)" stroke="oklch(0.65 0.16 264)" />
        {state.main.map((v, i) => {
          const cellW = mainW / Math.max(1, mainSize);
          return (
            <rect key={i} x={PAD + 90 + i * cellW} y={barY} width={Math.max(0.5, cellW - 0.5)} height={barH}
              fill={colorOf(v)} opacity={0.85} />
          );
        })}
        <text x={PAD} y={barY + 20} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">main: {mainSize} rows</text>

        {/* Delta store */}
        <text x={PAD} y={130} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">Delta store · append-only · light compression</text>
        <rect x={PAD + 90} y={144} width={Math.max(20, deltaW)} height={barH} fill="var(--bg-inset)" stroke="oklch(0.65 0.16 145)" strokeDasharray={deltaSize === 0 ? "3 3" : "0"} />
        {state.delta.map((v, i) => {
          const cellW = deltaW / Math.max(1, deltaSize);
          return (
            <rect key={i} x={PAD + 90 + i * cellW} y={144} width={Math.max(0.5, cellW - 0.5)} height={barH}
              fill={colorOf(v)} opacity={0.85} />
          );
        })}
        <text x={PAD} y={164} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">delta: {deltaSize} rows</text>

        {/* Delta ratio warning */}
        {deltaSize / Math.max(1, total) > 0.2 && (
          <text x={W - PAD} y={164} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">
            ⚠ delta ≈ {Math.round(deltaSize / total * 100)}% — read latency degraded
          </text>
        )}

        {/* Query indicator */}
        {state.lastQuery && (
          <g transform={`translate(${PAD}, ${H - 56})`}>
            <text x={0} y={0} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
              last query: SELECT count(*) WHERE country = "{state.lastQuery.country}"
            </text>
            <text x={0} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 264)">
              main hits: {state.lastQuery.m}
            </text>
            <text x={120} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 145)">
              delta hits: {state.lastQuery.d}
            </text>
            <text x={240} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)">
              total: {state.queryHits}
            </text>
            <text x={0} y={28} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              ↑ reads must scan both stores; main is index-sorted, delta is linear
            </text>
          </g>
        )}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Column store with main + delta architecture (SAP HANA, Vertica WOS/ROS, ClickHouse MergeTree).
        Writes go into the small unsorted delta (fast appends). Reads must scan both. When delta grows past ~20 %, performance drops and merge is triggered:
        delta is sorted & combined with main, then atomically swapped. The merge is online — reads see the old snapshot until commit.
      </div>
    </div>
  );
}
