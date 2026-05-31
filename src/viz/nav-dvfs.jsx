// DVFS demo: P_dyn ~ alpha*C*U^2*f. Two sliders (frequency, voltage) drive a
// power gauge + bar; shows that voltage moves power quadratically while
// frequency moves it linearly, and what that does to energy-per-task.
import { useState } from "react";

const W = 360, H = 200;

export default function NavDvfs() {
  // f as fraction of fmax (0.2..1.0), U in volts (0.7..1.0)
  const [fRel, setFRel] = useState(1.0);
  const [u, setU] = useState(0.9);

  // Reference operating point (fmax, Umax) at P=1.0 (normalised).
  const Umax = 1.0, Umin = 0.7;
  // P ~ U^2 * f, normalised so that (f=1, U=Umax) => 1.0
  const P = (u * u * fRel) / (Umax * Umax * 1.0);
  // A fixed-work task: time ~ 1/f, energy ~ P * time ~ U^2 (independent of f).
  const time = 1 / fRel;            // relative to fastest
  const energy = P * time;          // ~ U^2 -> normalised to 1.0 at Umax

  const barW = 200;
  const pBar = Math.min(1, P) * barW;
  const eBar = Math.min(1, energy) * barW;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* Power bar */}
        <text x={16} y={28} fontSize="11" fontWeight="600" fill="var(--text)">
          příkon P ~ U²·f
        </text>
        <rect x={16} y={36} width={barW} height={18} rx="4" fill="var(--bg-card)" stroke="var(--line)" />
        <rect x={16} y={36} width={pBar} height={18} rx="4" fill="var(--accent)" fillOpacity="0.55" />
        <text x={16 + barW + 8} y={50} fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">
          {P.toFixed(2)}×
        </text>

        {/* Energy-per-task bar */}
        <text x={16} y={84} fontSize="11" fontWeight="600" fill="var(--text)">
          energie/úloha ~ U² (na f nezávisí)
        </text>
        <rect x={16} y={92} width={barW} height={18} rx="4" fill="var(--bg-card)" stroke="var(--line)" />
        <rect x={16} y={92} width={eBar} height={18} rx="4" fill="oklch(0.62 0.14 142)" fillOpacity="0.55" />
        <text x={16 + barW + 8} y={106} fontSize="11" fontFamily="var(--font-mono)" fill="oklch(0.45 0.14 142)">
          {energy.toFixed(2)}×
        </text>

        {/* readouts */}
        <text x={16} y={140} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          f = {(fRel * 100).toFixed(0)} % f_max
        </text>
        <text x={16} y={158} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          U = {u.toFixed(2)} V (rozsah {Umin}–{Umax})
        </text>
        <text x={16} y={176} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          doba úlohy = {time.toFixed(2)}×
        </text>
        <text x={16} y={194} fontSize="10" fill="var(--text-faint)">
          {u <= Umin + 0.001
            ? "min. napětí → největší kvadratická úspora"
            : fRel < 0.99 && u > Umin + 0.001
            ? "jen f dolů: P klesá, ale energie/úloha skoro stejná"
            : "plný výkon"}
        </text>
      </svg>

      <label style={lbl}>
        <span style={tag}>frekvence f</span>
        <input type="range" min={20} max={100} value={Math.round(fRel * 100)}
          onChange={(e) => setFRel(+e.target.value / 100)} style={{ flex: 1 }} />
      </label>
      <label style={lbl}>
        <span style={tag}>napětí U</span>
        <input type="range" min={70} max={100} value={Math.round(u * 100)}
          onChange={(e) => setU(+e.target.value / 100)} style={{ flex: 1 }} />
      </label>
    </div>
  );
}

const lbl = { display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 };
const tag = {
  fontFamily: "var(--font-mono)", color: "var(--text-muted)",
  width: 88, display: "inline-block",
};
