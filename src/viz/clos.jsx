// Three-stage Clos network Clos(m, n, r) — n×m input, r×r middle, m×n output stages.
// Slide n, m, r to see the non-blocking conditions and crosspoint cost.
import { useState, useMemo } from "react";

export default function Clos() {
  const [n, setN] = useState(4);
  const [r, setR] = useState(3);
  const [m, setM] = useState(7);

  const N = n * r;
  const strictly = m >= 2 * n - 1;
  const rearrangeable = m >= n;

  // crossbar cost
  const closXpoints = r * (n * m) + m * (r * r) + r * (m * n);
  const directXpoints = N * N;

  const W = 540, H = 220;
  const padX = 50, padY = 28;
  const innerW = W - 2 * padX;
  const innerH = H - 2 * padY;
  const xStage = (s) => padX + (s + 0.5) * (innerW / 3);

  const data = useMemo(() => {
    const inputs = Array.from({ length: r }, (_, i) => ({ stage: 0, k: i }));
    const middles = Array.from({ length: m }, (_, i) => ({ stage: 1, k: i }));
    const outputs = Array.from({ length: r }, (_, i) => ({ stage: 2, k: i }));
    return { inputs, middles, outputs };
  }, [m, r]);

  const yIn = (k) => padY + 10 + (k * (innerH - 20)) / (r - 1 || 1);
  const yMid = (k) => padY + 8 + (k * (innerH - 16)) / (m - 1 || 1);
  const yOut = (k) => padY + 10 + (k * (innerH - 20)) / (r - 1 || 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* full m·r connections: every input switch → every middle */}
        {data.inputs.flatMap((isw) =>
          data.middles.map((msw) => (
            <line key={`im-${isw.k}-${msw.k}`}
              x1={xStage(0) + 18} y1={yIn(isw.k)}
              x2={xStage(1) - 14} y2={yMid(msw.k)}
              stroke="var(--line-strong)" strokeWidth="0.35" opacity="0.6" />
          )),
        )}

        {/* middle → every output */}
        {data.middles.flatMap((msw) =>
          data.outputs.map((osw) => (
            <line key={`mo-${msw.k}-${osw.k}`}
              x1={xStage(1) + 14} y1={yMid(msw.k)}
              x2={xStage(2) - 18} y2={yOut(osw.k)}
              stroke="var(--line-strong)" strokeWidth="0.35" opacity="0.6" />
          )),
        )}

        {/* input switches */}
        {data.inputs.map((sw) => (
          <g key={`is-${sw.k}`}>
            <rect x={xStage(0) - 18} y={yIn(sw.k) - 11} width="36" height="22"
              fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1" rx="3" />
            <text x={xStage(0)} y={yIn(sw.k) + 3} textAnchor="middle"
              fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">
              {n}×{m}
            </text>
            <text x={xStage(0) - 22} y={yIn(sw.k) + 3} textAnchor="end"
              fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              IS{sw.k + 1}
            </text>
          </g>
        ))}

        {/* middle switches */}
        {data.middles.map((sw) => (
          <g key={`ms-${sw.k}`}>
            <rect x={xStage(1) - 14} y={yMid(sw.k) - 8} width="28" height="16"
              fill="var(--bg-card)" stroke="oklch(0.62 0.15 145)" strokeWidth="1" rx="3" />
            <text x={xStage(1)} y={yMid(sw.k) + 2.5} textAnchor="middle"
              fontSize="8" fontFamily="var(--font-mono)" fill="oklch(0.62 0.15 145)">
              {r}×{r}
            </text>
          </g>
        ))}

        {/* output switches */}
        {data.outputs.map((sw) => (
          <g key={`os-${sw.k}`}>
            <rect x={xStage(2) - 18} y={yOut(sw.k) - 11} width="36" height="22"
              fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1" rx="3" />
            <text x={xStage(2)} y={yOut(sw.k) + 3} textAnchor="middle"
              fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">
              {m}×{n}
            </text>
            <text x={xStage(2) + 22} y={yOut(sw.k) + 3}
              fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              OS{sw.k + 1}
            </text>
          </g>
        ))}

        {/* port stubs */}
        {data.inputs.map((sw) =>
          Array.from({ length: n }, (_, k) => (
            <line key={`ip-${sw.k}-${k}`}
              x1={xStage(0) - 18} y1={yIn(sw.k) - 8 + k * (16 / Math.max(1, n - 1))}
              x2={xStage(0) - 26} y2={yIn(sw.k) - 8 + k * (16 / Math.max(1, n - 1))}
              stroke="var(--text-faint)" strokeWidth="0.6" />
          )),
        )}
        {data.outputs.map((sw) =>
          Array.from({ length: n }, (_, k) => (
            <line key={`op-${sw.k}-${k}`}
              x1={xStage(2) + 18} y1={yOut(sw.k) - 8 + k * (16 / Math.max(1, n - 1))}
              x2={xStage(2) + 26} y2={yOut(sw.k) - 8 + k * (16 / Math.max(1, n - 1))}
              stroke="var(--text-faint)" strokeWidth="0.6" />
          )),
        )}

        <text x={xStage(0)} y={H - 8} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {r} × ({n}×{m})
        </text>
        <text x={xStage(1)} y={H - 8} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {m} × ({r}×{r})
        </text>
        <text x={xStage(2)} y={H - 8} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {r} × ({m}×{n})
        </text>

        <text x={W / 2} y={16} textAnchor="middle"
          fontSize="10" fontWeight="700" fill="var(--text)">
          Clos({m}, {n}, {r}) — N = n·r = {N} portů
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        fontSize: 12, color: "var(--text-muted)" }}>
        <Slider label="n (vstup/výstup)" value={n} min={1} max={8} onChange={setN} />
        <Slider label="m (středové)"     value={m} min={1} max={12} onChange={setM} />
        <Slider label="r (počet IS=OS)" value={r} min={2} max={6} onChange={setR} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap",
        fontSize: 12, lineHeight: 1.5 }}>
        <span style={{
          padding: "2px 8px", borderRadius: 4, fontWeight: 600,
          background: strictly ? "color-mix(in oklch, oklch(0.62 0.15 145) 18%, var(--bg-card))" : "var(--bg-card)",
          color: strictly ? "oklch(0.62 0.15 145)" : "var(--text-muted)",
          border: "1px solid " + (strictly ? "oklch(0.62 0.15 145)" : "var(--line-strong)"),
        }}>
          {strictly ? "✓ strictly non-blocking" : "✗ ne-strictly"} (m ≥ 2n−1 = {2 * n - 1})
        </span>
        <span style={{
          padding: "2px 8px", borderRadius: 4, fontWeight: 600,
          background: rearrangeable ? "color-mix(in oklch, var(--accent) 14%, var(--bg-card))" : "var(--bg-card)",
          color: rearrangeable ? "var(--accent)" : "var(--text-muted)",
          border: "1px solid " + (rearrangeable ? "var(--accent)" : "var(--line-strong)"),
        }}>
          {rearrangeable ? "✓ rearrangeably non-blocking" : "✗ blokující"} (m ≥ n = {n})
        </span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        Crosspointů Clos: r·n·m + m·r² + r·m·n = <strong>{closXpoints.toLocaleString()}</strong>.
        Pro stejný počet portů by 1-stupňový crossbar potřeboval N² ={" "}
        <strong>{directXpoints.toLocaleString()}</strong>{" "}
        {closXpoints < directXpoints ? (
          <span style={{ color: "oklch(0.62 0.15 145)" }}>
            (úspora {Math.round((1 - closXpoints / directXpoints) * 100)}%)
          </span>
        ) : (
          <span style={{ color: "oklch(0.68 0.16 65)" }}>
            (Clos je tady dražší — pro malá N se nevyplatí)
          </span>
        )}.
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11 }}>{label}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="range" min={min} max={max} step="1" value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", minWidth: 18 }}>{value}</span>
      </div>
    </label>
  );
}
