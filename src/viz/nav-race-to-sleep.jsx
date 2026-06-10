// nav-race-to-sleep — energy = area under the power(t) curve.
// Compares a CPU running a task (lower active power, longer time) against a HW
// accelerator (higher peak power, shorter time) over the SAME total window.
// After finishing, each path drops to a low idle/sleep floor. The shaded area
// under each curve is the consumed energy; the HW path usually wins despite a
// higher peak because race-to-sleep shrinks the active interval.
import { useState } from "react";

const W = 540, H = 240;
const PLOT_X0 = 46, PLOT_X1 = W - 16, PLOT_Y0 = 30, PLOT_Y1 = H - 46;
const WINDOW = 20;          // total observed time window (units)
const P_IDLE = 0.6;         // sleep-floor power
const P_CPU = 3.2;          // CPU active power
const PMAX = 12;            // y-axis max power

export default function NavRaceToSleep() {
  // HW accelerator knobs
  const [speedup, setSpeedup] = useState(8);   // how many× faster than CPU
  const [hwPeak, setHwPeak] = useState(6.5);   // HW active power (peak)

  const tCpu = 12;                       // CPU active duration (fixed reference)
  const tHw = Math.max(0.6, tCpu / speedup);

  // energy = active power * active time + idle power * remaining window
  const eCpu = P_CPU * tCpu + P_IDLE * (WINDOW - tCpu);
  const eHw = hwPeak * tHw + P_IDLE * (WINDOW - tHw);
  const saving = ((eCpu - eHw) / eCpu) * 100;

  const toX = (t) => PLOT_X0 + (t / WINDOW) * (PLOT_X1 - PLOT_X0);
  const toY = (p) => PLOT_Y1 - (p / PMAX) * (PLOT_Y1 - PLOT_Y0);

  // build a closed area path: baseline -> active rect -> idle floor -> back
  const areaPath = (tActive, pActive) =>
    `M ${toX(0)} ${toY(0)}
     L ${toX(0)} ${toY(pActive)}
     L ${toX(tActive)} ${toY(pActive)}
     L ${toX(tActive)} ${toY(P_IDLE)}
     L ${toX(WINDOW)} ${toY(P_IDLE)}
     L ${toX(WINDOW)} ${toY(0)} Z`;

  const cpuCol = "oklch(0.62 0.14 264)";
  const hwCol = "oklch(0.6 0.15 142)";

  const winner = eHw < eCpu ? "HW" : "CPU";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* axes */}
        <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X0} y2={PLOT_Y1} stroke="var(--line-strong)" strokeWidth="0.8" />
        <line x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1} stroke="var(--line-strong)" strokeWidth="0.8" />
        <text x={10} y={PLOT_Y0 + 4} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">P [W]</text>
        <text x={PLOT_X1} y={PLOT_Y1 + 16} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">čas →</text>

        {/* idle floor guide */}
        <line x1={PLOT_X0} y1={toY(P_IDLE)} x2={PLOT_X1} y2={toY(P_IDLE)} stroke="var(--line)" strokeWidth="0.8" strokeDasharray="2 3" />
        <text x={PLOT_X1 - 2} y={toY(P_IDLE) - 3} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">sleep</text>

        {/* CPU area */}
        <path d={areaPath(tCpu, P_CPU)} fill="oklch(0.62 0.14 264 / 0.18)" stroke="none" />
        <path d={`M ${toX(0)} ${toY(P_CPU)} L ${toX(tCpu)} ${toY(P_CPU)} L ${toX(tCpu)} ${toY(P_IDLE)} L ${toX(WINDOW)} ${toY(P_IDLE)}`}
          fill="none" stroke={cpuCol} strokeWidth="2" />

        {/* HW area */}
        <path d={areaPath(tHw, hwPeak)} fill="oklch(0.6 0.15 142 / 0.22)" stroke="none" />
        <path d={`M ${toX(0)} ${toY(hwPeak)} L ${toX(tHw)} ${toY(hwPeak)} L ${toX(tHw)} ${toY(P_IDLE)} L ${toX(WINDOW)} ${toY(P_IDLE)}`}
          fill="none" stroke={hwCol} strokeWidth="2" />

        {/* finish markers */}
        <line x1={toX(tCpu)} y1={PLOT_Y0} x2={toX(tCpu)} y2={PLOT_Y1} stroke={cpuCol} strokeWidth="0.6" strokeDasharray="3 3" />
        <line x1={toX(tHw)} y1={PLOT_Y0} x2={toX(tHw)} y2={PLOT_Y1} stroke={hwCol} strokeWidth="0.6" strokeDasharray="3 3" />

        {/* legend */}
        <rect x={PLOT_X0 + 6} y={PLOT_Y0 + 2} width={10} height={10} fill="oklch(0.62 0.14 264 / 0.5)" stroke={cpuCol} strokeWidth="0.8" />
        <text x={PLOT_X0 + 20} y={PLOT_Y0 + 11} fontSize="9.5" fontFamily="var(--font-mono)" fill={cpuCol}>CPU (sekvenčně)</text>
        <rect x={PLOT_X0 + 6} y={PLOT_Y0 + 16} width={10} height={10} fill="oklch(0.6 0.15 142 / 0.55)" stroke={hwCol} strokeWidth="0.8" />
        <text x={PLOT_X0 + 20} y={PLOT_Y0 + 25} fontSize="9.5" fontFamily="var(--font-mono)" fill={hwCol}>HW (race-to-sleep)</text>

        <text x={(toX(0) + toX(tHw)) / 2} y={toY(hwPeak) - 4} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill={hwCol}>vyšší špička</text>
      </svg>

      {/* controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={lbl}>
          <span>HW zrychlení ×{speedup}</span>
          <input type="range" className="viz-slider" min={1} max={16} step={1} value={speedup}
            onChange={(e) => setSpeedup(+e.target.value)} style={{ flex: 1 }} />
        </label>
        <label style={lbl}>
          <span>HW příkon {hwPeak.toFixed(1)} W</span>
          <input type="range" className="viz-slider" min={3.5} max={11} step={0.5} value={hwPeak}
            onChange={(e) => setHwPeak(+e.target.value)} style={{ flex: 1 }} />
        </label>
      </div>

      {/* energy readout */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, fontFamily: "var(--font-mono)" }}>
        <E label="E(CPU)" value={eCpu.toFixed(1)} col={cpuCol} />
        <E label="E(HW)" value={eHw.toFixed(1)} col={hwCol} />
        <E label="úspora" value={`${saving >= 0 ? "" : ""}${saving.toFixed(0)} %`} col={saving >= 0 ? hwCol : "oklch(0.6 0.2 25)"} strong />
      </div>

      <div style={{
        fontSize: 11.5, lineHeight: 1.5, color: "var(--text-muted)",
        padding: "6px 8px", background: "var(--bg-card)", borderRadius: 5, border: "1px solid var(--line)",
      }}>
        {saving >= 0
          ? `Plocha pod křivkou = energie (E = ∫P dt). HW má vyšší špičku, ale ${winner === "HW" ? "kratší aktivní čas a rychlejší přechod do sleep" : "..."} mu dá nižší celkovou energii — to je race-to-sleep.`
          : "Při velmi vysokém příkonu a malém zrychlení může HW spotřebovat víc — race-to-sleep nefunguje, když špička přebije úsporu času (sem patří i past režie komunikace)."}
      </div>
    </div>
  );
}

const lbl = {
  display: "flex", alignItems: "center", gap: 10, fontSize: 11.5,
  fontFamily: "var(--font-mono)", color: "var(--text-muted)",
};

function E({ label, value, col, strong = false }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "4px 12px", background: "var(--bg-inset)", borderRadius: 5,
      border: "1px solid var(--line)", minWidth: 78,
    }}>
      <span style={{ fontSize: 9.5, color: "var(--text-faint)" }}>{label}</span>
      <span style={{ fontSize: strong ? 15 : 14, fontWeight: 700, color: col }}>{value}</span>
    </div>
  );
}
