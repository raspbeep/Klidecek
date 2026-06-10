// tama-ui-thread — blokující vs. neblokující práce na UI vlákně.
// Přepni mezi „blocking" (dlouhá operace přímo na UI vlákně) a „suspend/await"
// (operace běží na pozadí, UI vlákno zůstává volné pro vykreslování ~16 ms snímků).
import { useState } from "react";

const FRAME_MS = 16; // ~60 fps → snímek každých 16 ms
const TOTAL = 480;   // časová osa v ms

export default function TamaUiThread() {
  const [mode, setMode] = useState("suspend"); // "blocking" | "suspend"
  const W = 500, laneH = 38;

  // dlouhá operace zabere 200 ms a startuje v 80 ms
  const opStart = 80, opLen = 200;
  const toX = (ms) => 30 + (ms / TOTAL) * (W - 50);

  // snímky UI vlákna; v blocking módu jsou snímky během operace zahozené (jank)
  const frames = [];
  for (let t = 0; t <= TOTAL; t += FRAME_MS) {
    const duringOp = t >= opStart && t < opStart + opLen;
    const dropped = mode === "blocking" && duringOp;
    frames.push({ t, dropped });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>režim:</span>
        <button className="viz-btn" data-active={mode === "blocking"} onClick={() => setMode("blocking")}>blokující (na UI vlákně)</button>
        <button className="viz-btn" data-active={mode === "suspend"} onClick={() => setMode("suspend")}>suspend / await (pozadí)</button>
      </div>

      <svg viewBox={`0 0 ${W} 150`} style={{ width: "100%", maxWidth: 520, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* popis pruhů */}
        <text x={6} y={28} fontSize="9.5" fill="var(--text-muted)" fontFamily="ui-monospace, monospace">UI</text>
        <text x={6} y={26 + laneH} fontSize="9.5" fill="var(--text-muted)" fontFamily="ui-monospace, monospace">work</text>

        {/* UI lane — snímky */}
        {frames.map((f, i) => (
          <rect key={i} x={toX(f.t)} y={12} width={(FRAME_MS / TOTAL) * (W - 50) - 1} height={laneH - 4}
            fill={f.dropped ? "oklch(0.6 0.18 22 / 0.5)" : "oklch(0.62 0.14 142 / 0.45)"}
            stroke={f.dropped ? "oklch(0.55 0.18 22)" : "oklch(0.5 0.12 142)"} strokeWidth="0.5" />
        ))}

        {/* work lane — dlouhá operace */}
        <rect x={toX(opStart)} y={12 + laneH} width={toX(opStart + opLen) - toX(opStart)} height={laneH - 4}
          fill={mode === "blocking" ? "oklch(0.6 0.18 22 / 0.4)" : "oklch(0.62 0.14 264 / 0.4)"}
          stroke={mode === "blocking" ? "oklch(0.55 0.18 22)" : "oklch(0.55 0.14 264)"} strokeWidth="1.2" rx="3" />
        <text x={(toX(opStart) + toX(opStart + opLen)) / 2} y={12 + laneH + (laneH - 4) / 2 + 3}
          textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--text)" fontFamily="ui-monospace, monospace">
          {mode === "blocking" ? "běží na UI vlákně" : "Dispatchers.IO / Task"}
        </text>

        {/* časová osa */}
        <line x1={30} y1={12 + 2 * laneH} x2={W - 14} y2={12 + 2 * laneH} stroke="var(--line-strong)" strokeWidth="0.6" />
        {[0, 120, 240, 360, 480].map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={12 + 2 * laneH} x2={toX(t)} y2={16 + 2 * laneH} stroke="var(--line-strong)" strokeWidth="0.6" />
            <text x={toX(t)} y={28 + 2 * laneH} textAnchor="middle" fontSize="8.5" fill="var(--text-faint)" fontFamily="ui-monospace, monospace">{t}ms</text>
          </g>
        ))}
      </svg>

      <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {mode === "blocking"
          ? "Dlouhá operace běží přímo na UI vlákně → snímky se nestihnou vykreslit (červené = zahozené), aplikace „zatuhne“ a hrozí ANR / watchdog kill."
          : "Operace běží na pozadí; suspend/await uvolní UI vlákno, takže vykreslování snímků (zelené) pokračuje plynule a rozhraní zůstává responzivní."}
      </div>
    </div>
  );
}
