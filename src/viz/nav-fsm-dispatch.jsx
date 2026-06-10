// nav-fsm-dispatch — porovnání tří způsobů výběru obsluhy stavu v FSM:
// if-else řetěz O(n), switch/jump-table O(1) a pole ukazatelů na funkce O(1).
// Slider = počet stavů N; tlačítka = který stav je aktivní. Vizualizuje, kolik
// porovnání každý přístup udělá, než skočí na obsluhu cílového stavu.
import { useState } from "react";

export default function NavFsmDispatch() {
  const [n, setN] = useState(8);
  const [target, setTarget] = useState(5);
  const tgt = Math.min(target, n - 1);

  const W = 540, H = 196;
  const colW = (W - 24) / 3;
  const cols = [
    { title: "if-else řetěz", sub: "O(n)", cmps: tgt + 1, x: 12 },
    { title: "switch (jump table)", sub: "O(1)", cmps: 1, x: 12 + colW },
    { title: "pole ukazatelů", sub: "O(1)", cmps: 1, x: 12 + 2 * colW },
  ];

  // sloupec malých buněk = stavy 0..n-1, zvýrazni navštívené při hledání
  function renderColumn(c, idx) {
    const cellH = Math.min(15, (H - 78) / n);
    const cellW = colW - 30;
    const cx = c.x + 15;
    const cy0 = 56;
    return (
      <g key={idx}>
        <text x={c.x + colW / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">{c.title}</text>
        <text x={c.x + colW / 2} y={34} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)"
          fill={c.sub === "O(1)" ? "oklch(0.55 0.15 142)" : "oklch(0.6 0.18 30)"} fontWeight="600">{c.sub}</text>

        {Array.from({ length: n }).map((_, s) => {
          const y = cy0 + s * cellH;
          // if-else: navštíví 0..tgt (postupné porovnání). switch/pole: rovnou tgt.
          const visited = idx === 0 ? s <= tgt : s === tgt;
          const isTgt = s === tgt;
          return (
            <g key={s}>
              <rect x={cx} y={y} width={cellW} height={cellH - 2} rx={2}
                fill={isTgt ? "oklch(0.6 0.16 142 / 0.85)" : visited ? "oklch(0.6 0.18 30 / 0.35)" : "var(--bg-card)"}
                stroke={isTgt ? "oklch(0.5 0.16 142)" : "var(--line)"} strokeWidth={isTgt ? 1.2 : 0.6} />
              {cellH >= 11 && (
                <text x={cx + 5} y={y + cellH / 2 + 2} fontSize="8.5" fontFamily="var(--font-mono)"
                  fill={isTgt ? "white" : "var(--text-muted)"}>S{s}</text>
              )}
              {/* index/skok u tabulkových přístupů */}
              {idx > 0 && isTgt && (
                <line x1={cx - 11} y1={y + cellH / 2 - 1} x2={cx - 1} y2={y + cellH / 2 - 1}
                  stroke="oklch(0.5 0.16 142)" strokeWidth="1.4" markerEnd="url(#fdArr)" />
              )}
            </g>
          );
        })}
        {idx > 0 && (
          <text x={cx - 13} y={50} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">idx</text>
        )}
        {/* počet porovnání */}
        <rect x={c.x + colW / 2 - 42} y={H - 18} width={84} height={15} rx={2}
          fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.5" />
        <text x={c.x + colW / 2} y={H - 7} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)">
          {c.cmps} {c.cmps === 1 ? "krok" : "porovn."}
        </text>
      </g>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div className="viz-controls" style={{ marginBottom: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: "var(--text-muted)" }}>počet stavů N</span>
          <input type="range" className="viz-slider" min={3} max={12} value={n}
            onChange={(e) => { setN(+e.target.value); }} style={{ width: 90 }} />
          <span className="viz-readout">{n}</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: "var(--text-muted)" }}>cílový stav</span>
          <input type="range" className="viz-slider" min={0} max={n - 1} value={tgt}
            onChange={(e) => setTarget(+e.target.value)} style={{ width: 90 }} />
          <span className="viz-readout">S{tgt}</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 560, background: "var(--bg-inset)", borderRadius: 4 }}>
        {cols.map(renderColumn)}
        <line x1={12 + colW} y1={42} x2={12 + colW} y2={H - 22} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1={12 + 2 * colW} y1={42} x2={12 + 2 * colW} y2={H - 22} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 3" />
        <defs>
          <marker id="fdArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.5 0.16 142)" />
          </marker>
        </defs>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Oranžové buňky = stavy, které se musely otestovat, než se dospělo k cíli (zeleně). If-else projde stavy v řadě,
        takže pro vzdálený stav udělá až <b style={{ color: "var(--text-muted)" }}>N porovnání</b>; tabulkové přístupy
        skočí přímo přes index, vždy jediným krokem — nezávisle na N.
      </div>
    </div>
  );
}
