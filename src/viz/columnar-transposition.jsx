// Sloupcová transpozice: matice po řádcích, čtení po sloupcích v pořadí klíče.
import { useMemo, useState } from "react";

function clean(s) { return s.toUpperCase().replace(/[^A-Z]/g, ""); }
function keyOrder(key) {
  const arr = key.split("").map((c, i) => ({ c, i }));
  arr.sort((a, b) => a.c === b.c ? a.i - b.i : a.c.localeCompare(b.c));
  const order = new Array(key.length);
  arr.forEach((x, rank) => { order[x.i] = rank; });
  return order;
}

function encrypt(plain, key) {
  const cols = key.length;
  const rows = Math.ceil(plain.length / cols);
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      row.push(idx < plain.length ? plain[idx] : "·");
    }
    grid.push(row);
  }
  const order = keyOrder(key);
  // For each rank (0, 1, 2, …) read out that column
  const ranked = key.split("").map((c, i) => ({ c, i, rank: order[i] }));
  ranked.sort((a, b) => a.rank - b.rank);
  let cipher = "";
  for (const { i } of ranked) {
    for (let r = 0; r < rows; r++) {
      if (grid[r][i] !== "·") cipher += grid[r][i];
    }
  }
  return { grid, order, ranked, cipher, rows, cols };
}

export default function ColumnarTransposition() {
  const [plain, setPlain] = useState("WEAREDISCOVEREDFLEEATONCE");
  const [key, setKey] = useState("ZEBRAS");
  const [readIdx, setReadIdx] = useState(-1);

  const cleaned = clean(plain);
  const cleanedKey = clean(key);
  const { grid, order, ranked, cipher, rows, cols } = useMemo(() => encrypt(cleaned, cleanedKey), [cleaned, cleanedKey]);

  const W = 480;
  const CELL = Math.min(50, (W - 20) / Math.max(1, cols));
  const SVGW = CELL * cols + 20, SVGH = (rows + 1) * CELL + 60;
  const HIGHLIGHT_COL = readIdx >= 0 ? ranked[readIdx]?.i : -1;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Plaintext:</label>
        <input value={plain} onChange={(e) => setPlain(e.target.value)} style={inp} maxLength={40} />
        <label style={lbl}>Klíč:</label>
        <input value={key} onChange={(e) => setKey(e.target.value)} style={{ ...inp, width: 100 }} maxLength={10} />
      </div>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setReadIdx(-1)}>1. Plnění tabulky</button>
        <button className="viz-btn primary" onClick={() => setReadIdx(readIdx < 0 ? 0 : Math.min(readIdx + 1, cols - 1))}>
          2. Čtení sloupců (rank {readIdx + 1}/{cols})
        </button>
      </div>

      <svg viewBox={`0 0 ${SVGW} ${SVGH}`} style={{ width: "100%", maxWidth: 540 }}>
        {/* key letters */}
        {cleanedKey.split("").map((c, i) => (
          <g key={"k" + i}>
            <text x={10 + i * CELL + CELL / 2} y={16} fontSize="13" fill="var(--text-muted)" textAnchor="middle" fontFamily="var(--font-mono)">{c}</text>
            <text x={10 + i * CELL + CELL / 2} y={32} fontSize="11" fill="var(--accent)" textAnchor="middle" fontFamily="var(--font-mono)">{order[i] + 1}</text>
          </g>
        ))}
        {/* grid */}
        {grid.map((row, r) => row.map((ch, c) => {
          const x = 10 + c * CELL, y = 40 + r * CELL;
          const isHighlight = c === HIGHLIGHT_COL;
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={CELL - 2} height={CELL - 2} rx={3}
                fill={isHighlight ? "rgba(81,131,219,0.2)" : "var(--bg-inset)"}
                stroke={isHighlight ? "var(--accent)" : "var(--line)"} strokeWidth={isHighlight ? 1.5 : 0.8} />
              <text x={x + CELL / 2} y={y + CELL / 2 + 5} fontSize="14" fill={ch === "·" ? "var(--text-faint)" : "var(--text)"}
                textAnchor="middle" fontFamily="var(--font-mono)">{ch}</text>
            </g>
          );
        }))}
      </svg>

      {readIdx >= 0 && (
        <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)" }}>
          <div style={{ color: "var(--text-muted)" }}>Pořadí čtení (zleva podle ranku klíče):</div>
          {ranked.slice(0, readIdx + 1).map((x, i) => (
            <div key={i} style={{ color: i === readIdx ? "var(--accent)" : "var(--text)" }}>
              rank {i + 1}: sloupec {x.i + 1} (klíč „{x.c}") →{" "}
              <b>{grid.map((row) => row[x.i]).filter((c) => c !== "·").join("")}</b>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...section, fontSize: 12 }}>
        <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 4 }}>Ciphertext:</div>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: 2 }}>{cipher}</div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Klíč „{cleanedKey}" určuje pořadí čtení sloupců (abecedně). Statistika jednotlivých znaků se nemění,
        ale digramová a vyšší statistika ano — proto útok přes digramové skóre kandidátních permutací.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const inp = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 220 };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
