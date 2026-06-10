// Staged rollout — postupné uvolňování aktualizace.
// Přepínač: Apple App Store (pevný 7denní rozvrh 1/2/5/10/20/50/100 %)
// vs Google Play (volitelná procenta, developer řídí tempo).
// Posuvník = den. Tlačítko "kritický pád" zastaví rollout (halt) a ukáže
// dopad na zatím nezasažené uživatele.
import { useState } from "react";

// Apple — pevný 7denní rozvrh (App Store Connect phased release)
const APPLE = [1, 2, 5, 10, 20, 50, 100];
// Google — typický scénář volených kroků (developer si je volí sám)
const GOOGLE = [5, 5, 20, 20, 50, 50, 100];

export default function TamaStagedRollout() {
  const [store, setStore] = useState("apple");
  const [day, setDay] = useState(0);
  const [halt, setHalt] = useState(false);
  const sched = store === "apple" ? APPLE : GOOGLE;

  // při haltu se procento „zmrazí" na hodnotě v den haltu
  const effDay = halt ? Math.min(day, 2) : day;
  const pct = sched[effDay];

  const W = 360, H = 150;
  const barX = 14, barW = W - 28, rowY = 92, rowH = 26;
  const fillW = (pct / 100) * barW;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div className="viz-controls">
        <button className="viz-btn" data-active={store === "apple"} onClick={() => { setStore("apple"); setDay(0); setHalt(false); }} style={store === "apple" ? { borderColor: "oklch(0.62 0.14 200)", background: "oklch(0.62 0.14 200 / 0.18)", color: "var(--text)" } : undefined}>App Store (pevný 7denní)</button>
        <button className="viz-btn" data-active={store === "google"} onClick={() => { setStore("google"); setDay(0); setHalt(false); }} style={store === "google" ? { borderColor: "oklch(0.62 0.14 142)", background: "oklch(0.62 0.14 142 / 0.18)", color: "var(--text)" } : undefined}>Play (volená %)</button>
        <label style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4, fontSize: 11.5 }}>
          <input type="checkbox" checked={halt} onChange={(e) => setHalt(e.target.checked)} />
          <span style={{ fontFamily: "var(--font-mono)" }}>kritický pád → halt</span>
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* rozvrh — sloupce po dnech */}
        {sched.map((p, i) => {
          const x = barX + (i / sched.length) * barW;
          const w = barW / sched.length - 3;
          const h = (p / 100) * 50;
          const active = i <= effDay;
          return (
            <g key={i}>
              <rect x={x} y={66 - h} width={w} height={h} rx="2"
                fill={active ? (store === "apple" ? "oklch(0.6 0.14 200 / 0.55)" : "oklch(0.6 0.14 142 / 0.55)") : "var(--bg-card)"}
                stroke={i === effDay ? "var(--accent)" : "var(--line)"} strokeWidth={i === effDay ? 1.3 : 0.6} />
              <text x={x + w / 2} y={78} textAnchor="middle" fontSize="7.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">{store === "apple" ? `D${i + 1}` : `f${i + 1}`}</text>
              <text x={x + w / 2} y={64 - h} textAnchor="middle" fontSize="7.5" fill={active ? "var(--text)" : "var(--text-faint)"} fontFamily="var(--font-mono)">{p}</text>
            </g>
          );
        })}

        {/* aktuální zásah uživatelů */}
        <text x={barX} y={rowY - 4} fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">zasažení uživatelé</text>
        <rect x={barX} y={rowY} width={barW} height={rowH} rx="3" fill="var(--bg-card)" stroke="var(--line)" />
        <rect x={barX} y={rowY} width={fillW} height={rowH} rx="3"
          fill={halt ? "oklch(0.6 0.16 22 / 0.5)" : "oklch(0.6 0.14 142 / 0.5)"} />
        <text x={barX + barW / 2} y={rowY + 17} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">{pct} %</text>

        <text x={barX} y={H - 8} fontSize="8.5"
          fill={halt ? "oklch(0.6 0.16 22)" : "var(--text-faint)"} fontFamily="var(--font-mono)">
          {halt
            ? `rollout zastaven na ${pct} % — zbylí uživatelé chráněni; nahraje se hotfix`
            : store === "apple"
            ? "Apple: automatický postup, lze pozastavit až 30 dní"
            : "Google: tempo i procenta volí vývojář, lze halt kdykoliv"}
        </text>
      </svg>

      <input type="range" className="viz-slider" min={0} max={6} value={day} onChange={(e) => setDay(+e.target.value)} disabled={halt} style={{ width: "100%" }} />
      <span className="viz-readout">
        {store === "apple" ? `den ${effDay + 1} / 7` : `fáze ${effDay + 1} / 7`} · {pct} % uživatelů
      </span>
    </div>
  );
}
