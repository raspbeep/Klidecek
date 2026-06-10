// OLAP cube — interaktivní 4 základní operace nad multidimenzionální kostkou.
// Demonstruje roll-up, drill-down, pivoting a slicing nad 3D kostkou
// (čas × produkt × region) s hierarchií dimenzí.
import { useState, useMemo } from "react";

// Základní data — pekárna, prodaný počet kusů
// Dimenze: čas (6 dní → 2 týdny), produkt (3 položky → 2 kategorie), region (3 města → 2 země)
const TIME_HIER = {
  base: ["Po", "Út", "St", "Čt", "Pá", "So"],
  parent: { "Po": "T1", "Út": "T1", "St": "T1", "Čt": "T2", "Pá": "T2", "So": "T2" },
  rolled: ["T1", "T2"],
};
const PRODUCT_HIER = {
  base: ["rohlík", "párek", "koláč"],
  parent: { "rohlík": "pečivo", "párek": "pečivo", "koláč": "sladké" },
  rolled: ["pečivo", "sladké"],
};
const REGION_HIER = {
  base: ["Brno", "Praha", "BA"],
  parent: { "Brno": "CZ", "Praha": "CZ", "BA": "SK" },
  rolled: ["CZ", "SK"],
};

// Vygeneruj fakta — pseudo-náhodná, ale deterministická
function genFacts() {
  const out = {};
  for (const t of TIME_HIER.base)
    for (const p of PRODUCT_HIER.base)
      for (const r of REGION_HIER.base) {
        // deterministická "náhoda"
        const seed = t.charCodeAt(0) * 31 + p.charCodeAt(0) * 17 + r.charCodeAt(0) * 7;
        out[`${t}|${p}|${r}`] = 5 + (seed % 25);
      }
  return out;
}
const FACTS = genFacts();

// Pomocné: dej hodnotu dimenze na požadované úrovni
function valueAt(dim, base, level) {
  if (level === "base") return base;
  return dim.parent[base];
}

// Spočti agregát pro daný řez kostky
function aggregate({ rowDim, colDim, levels, slice }) {
  const dims = { time: TIME_HIER, product: PRODUCT_HIER, region: REGION_HIER };
  const result = {};
  for (const t of TIME_HIER.base) {
    if (slice.time && valueAt(TIME_HIER, t, levels.time) !== slice.time) continue;
    for (const p of PRODUCT_HIER.base) {
      if (slice.product && valueAt(PRODUCT_HIER, p, levels.product) !== slice.product) continue;
      for (const r of REGION_HIER.base) {
        if (slice.region && valueAt(REGION_HIER, r, levels.region) !== slice.region) continue;
        const rowVal = valueAt(dims[rowDim], { time: t, product: p, region: r }[rowDim], levels[rowDim]);
        const colVal = colDim
          ? valueAt(dims[colDim], { time: t, product: p, region: r }[colDim], levels[colDim])
          : "Σ";
        const key = `${rowVal}|${colVal}`;
        result[key] = (result[key] || 0) + FACTS[`${t}|${p}|${r}`];
      }
    }
  }
  return result;
}

function dimLabel(d) {
  return { time: "čas", product: "produkt", region: "region" }[d];
}

function getValues(dim, level, slice) {
  const hier = { time: TIME_HIER, product: PRODUCT_HIER, region: REGION_HIER }[dim];
  if (level === "base") {
    if (slice && slice[dim] === undefined) {
      // pokud je nadřazený slice aktivní, omez na děti
      return hier.base;
    }
    return hier.base;
  }
  return hier.rolled;
}

export default function OlapCube() {
  // Default: rows = region, cols = čas, agregace přes produkt (3. dimenze "do hloubky")
  const [rowDim, setRowDim] = useState("region");
  const [colDim, setColDim] = useState("time");
  const [levels, setLevels] = useState({ time: "base", product: "base", region: "base" });
  const [slice, setSlice] = useState({}); // { dim: value }

  const aggDim = ["time", "product", "region"].find((d) => d !== rowDim && d !== colDim);

  const rowVals = getValues(rowDim, levels[rowDim], slice);
  const colVals = getValues(colDim, levels[colDim], slice);
  const cells = useMemo(() => aggregate({ rowDim, colDim, levels, slice }), [rowDim, colDim, levels, slice]);

  // Operations
  const rollUp = (dim) => {
    setLevels((L) => ({ ...L, [dim]: "rolled" }));
    setSlice((S) => {
      // pokud byl slice na base úrovni, zruš ho (jinak nezachová smysl)
      const { [dim]: _, ...rest } = S;
      return rest;
    });
  };
  const drillDown = (dim) => setLevels((L) => ({ ...L, [dim]: "base" }));
  const pivot = () => {
    setRowDim(colDim);
    setColDim(rowDim);
  };
  const sliceTo = (dim, value) => setSlice((S) => ({ ...S, [dim]: value }));
  const unslice = (dim) => setSlice((S) => {
    const { [dim]: _, ...rest } = S;
    return rest;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Operations bar */}
      <div className="viz-controls" style={{
        padding: 8, background: "var(--bg-inset)", borderRadius: 8,
      }}>
        <button className="viz-btn"
          onClick={() => rollUp(rowDim)}
          disabled={levels[rowDim] === "rolled"}>
          ↑ Roll-up {dimLabel(rowDim)}
        </button>
        <button className="viz-btn"
          onClick={() => drillDown(rowDim)}
          disabled={levels[rowDim] === "base"}>
          ↓ Drill-down {dimLabel(rowDim)}
        </button>
        <button className="viz-btn" onClick={pivot}>
          ↺ Pivot (otoč osy)
        </button>
        <span className="viz-readout push">
          {aggDim} → agregace
        </span>
      </div>

      {/* Cube schematic */}
      <svg viewBox="0 0 540 100" style={{ width: "100%", maxWidth: 540 }}>
        <rect width="540" height="100" fill="var(--bg-inset)" />
        {/* Isometric cube */}
        <g transform="translate(40,18)">
          <polygon points="0,40 60,40 60,0 0,0" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)" />
          <polygon points="60,40 90,25 90,-15 60,0" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)" />
          <polygon points="0,0 60,0 90,-15 30,-15" fill="oklch(0.62 0.14 264 / 0.06)" stroke="oklch(0.62 0.14 264)" />
          <text x="30" y="60" fontSize="10" fill="var(--text-muted)" textAnchor="middle">{dimLabel(colDim)}</text>
          <text x="0" y="22" fontSize="10" fill="var(--text-muted)" textAnchor="end">{dimLabel(rowDim)}</text>
          <text x="62" y="-3" fontSize="10" fill="var(--text-muted)">{dimLabel(aggDim)}</text>
        </g>
        {/* Slice/level info */}
        <g transform="translate(170, 22)" fontSize="11">
          {["time", "product", "region"].map((d, i) => (
            <g key={d} transform={`translate(0, ${i * 22})`}>
              <text x="0" y="10" fill="var(--text)" fontFamily="var(--font-mono)" fontWeight="600">
                {dimLabel(d)}:
              </text>
              <text x="65" y="10" fill={levels[d] === "rolled" ? "oklch(0.55 0.18 22)" : "var(--text-muted)"}
                fontFamily="var(--font-mono)">
                {levels[d] === "rolled" ? "rolled-up" : "base"}
              </text>
              {slice[d] !== undefined && (
                <text x="155" y="10" fill="oklch(0.55 0.18 80)" fontFamily="var(--font-mono)">
                  slice = {slice[d]}
                </text>
              )}
              {d === aggDim && (
                <text x="255" y="10" fill="var(--text-faint)" fontStyle="italic">(agreguje se přes)</text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* Data table */}
      <div style={{
        padding: 10, background: "var(--bg-inset)", borderRadius: 8,
        maxWidth: 540, overflowX: "auto",
      }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-mono)", width: "100%" }}>
          <thead>
            <tr>
              <th style={cellHeadStyle}>
                {dimLabel(rowDim)} ↓ / {dimLabel(colDim)} →
              </th>
              {colVals.map((cv) => (
                <th key={cv} style={cellHeadStyle}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                    {cv}
                    <button
                      onClick={() => sliceTo(colDim, cv)}
                      title={`slice ${dimLabel(colDim)} = ${cv}`}
                      style={miniBtn}
                    >▦</button>
                  </span>
                </th>
              ))}
              <th style={{ ...cellHeadStyle, background: "oklch(0.62 0.14 142 / 0.18)" }}>Σ</th>
            </tr>
          </thead>
          <tbody>
            {rowVals.map((rv) => {
              const rowTotal = colVals.reduce((s, cv) => s + (cells[`${rv}|${cv}`] || 0), 0);
              return (
                <tr key={rv}>
                  <th style={cellHeadStyle}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {rv}
                      <button
                        onClick={() => sliceTo(rowDim, rv)}
                        title={`slice ${dimLabel(rowDim)} = ${rv}`}
                        style={miniBtn}
                      >▦</button>
                    </span>
                  </th>
                  {colVals.map((cv) => (
                    <td key={cv} style={cellStyle}>{cells[`${rv}|${cv}`] || 0}</td>
                  ))}
                  <td style={{ ...cellStyle, background: "oklch(0.62 0.14 142 / 0.10)", fontWeight: 600 }}>{rowTotal}</td>
                </tr>
              );
            })}
            <tr>
              <th style={{ ...cellHeadStyle, background: "oklch(0.62 0.14 142 / 0.18)" }}>Σ</th>
              {colVals.map((cv) => {
                const colTotal = rowVals.reduce((s, rv) => s + (cells[`${rv}|${cv}`] || 0), 0);
                return (
                  <td key={cv} style={{ ...cellStyle, background: "oklch(0.62 0.14 142 / 0.10)", fontWeight: 600 }}>
                    {colTotal}
                  </td>
                );
              })}
              <td style={{ ...cellStyle, background: "oklch(0.62 0.14 142 / 0.20)", fontWeight: 700 }}>
                {rowVals.reduce((s, rv) =>
                  s + colVals.reduce((s2, cv) => s2 + (cells[`${rv}|${cv}`] || 0), 0), 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Active filters */}
      {Object.keys(slice).length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 11, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>aktivní slice:</span>
          {Object.entries(slice).map(([d, v]) => (
            <span key={d} style={{
              padding: "2px 8px", background: "oklch(0.55 0.18 80 / 0.18)",
              border: "1px solid oklch(0.55 0.18 80)", borderRadius: 12,
              fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              {dimLabel(d)} = {v}
              <button onClick={() => unslice(d)} style={{ ...miniBtn, color: "oklch(0.40 0.18 80)" }}>×</button>
            </span>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        <strong style={{ color: "var(--text)" }}>Co zkusit:</strong>{" "}
        <em>Roll-up</em> sjednotí dny do týdnů (3+3 → 2 sloupce). <em>Pivot</em> otočí, co je na řádcích.
        Klikni na ▦ vedle hodnoty pro <em>slice</em> — kostka se redukuje o jednu dimenzi.
      </div>
    </div>
  );
}

const cellHeadStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  padding: "5px 8px",
  textAlign: "center",
  fontWeight: 600,
  color: "var(--text)",
  fontSize: 11.5,
};
const cellStyle = {
  border: "1px solid var(--line)",
  padding: "4px 8px",
  textAlign: "right",
  color: "var(--text)",
  background: "var(--bg-card)",
};
const miniBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "var(--text-faint)",
  padding: "0 2px",
  fontSize: 11,
};
