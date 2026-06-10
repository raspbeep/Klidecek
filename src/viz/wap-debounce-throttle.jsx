// wap-debounce-throttle — porovnání surové obsluby, debouncingu a throttlingu.
// Pohyb myší přes plochu zaznamenává časy událostí; tři dráhy ukazují, kdy by
// se spustila surová obsluha (každá událost), debounced (až po klidu) a
// throttled (max 1× za interval). Posuvník mění interval — dráhy se mění živě.
import { useState, useRef } from "react";

const W = 520, H = 200;
const TRACK_X = 24, TRACK_W = W - TRACK_X - 14;
const WINDOW_MS = 4000;          // časové okno dráhy (poslední 4 s)
const LANES = [
  { key: "raw", label: "surová obsluha (každá událost)", hue: 22, y: 64 },
  { key: "debounce", label: "debounce (až po klidu)", hue: 142, y: 110 },
  { key: "throttle", label: "throttle (max 1× / interval)", hue: 200, y: 156 },
];

// Z posloupnosti časů událostí spočítej, kdy by se spustila debounced obsluha:
// fire po každém eventu, po kterém následuje klid >= interval (nebo je poslední).
function debounceFires(times, interval) {
  const out = [];
  for (let i = 0; i < times.length; i++) {
    const next = times[i + 1];
    if (next === undefined || next - times[i] >= interval) out.push(times[i] + interval);
  }
  return out;
}

// Throttle: první událost spustí obsluhu hned, pak nejvýše jednou za interval.
function throttleFires(times, interval) {
  const out = [];
  let last = -Infinity;
  for (const t of times) {
    if (t - last >= interval) { out.push(t); last = t; }
  }
  return out;
}

export default function WapDebounceThrottle() {
  const [ms, setMs] = useState(400);
  const [events, setEvents] = useState([]);      // časy událostí (ms, relativní)
  const startRef = useRef(null);
  const lastSampleRef = useRef(0);

  const reset = () => { setEvents([]); startRef.current = null; };

  // Vzorkujeme pohyb myši (ne každý mikropohyb — to by zahltilo stav stejně
  // jako reálnou aplikaci; ~ každých 25 ms je dost husté pro názornost).
  const onMove = () => {
    const now = performance.now();
    if (startRef.current === null) { startRef.current = now; lastSampleRef.current = -100; }
    const t = now - startRef.current;
    if (t - lastSampleRef.current < 25) return;
    lastSampleRef.current = t;
    setEvents((ev) => {
      const cut = t - WINDOW_MS;
      const kept = ev.filter((x) => x >= cut);
      return [...kept, t];
    });
  };

  // Normalizuj časy do okna [now-WINDOW, now] → osa X.
  const now = events.length ? events[events.length - 1] : 0;
  const t0 = now - WINDOW_MS;
  const toX = (t) => TRACK_X + ((t - t0) / WINDOW_MS) * TRACK_W;

  const fires = {
    raw: events,
    debounce: debounceFires(events, ms).filter((t) => t <= now),
    throttle: throttleFires(events, ms),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-muted)" }}>
          interval = {ms} ms
          <input type="range" className="viz-slider" min={100} max={900} step={50} value={ms}
            onChange={(e) => setMs(+e.target.value)} style={{ width: 120 }} />
        </label>
        <button className="viz-btn" onClick={reset}>⟲ vymazat</button>
      </div>

      {/* plocha pro pohyb myší */}
      <div
        onMouseMove={onMove}
        onTouchMove={onMove}
        style={{
          height: 54, borderRadius: 8, border: "1px dashed var(--line-strong)",
          background: "var(--bg-card)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, color: "var(--text-muted)",
          cursor: "crosshair", userSelect: "none",
        }}>
        pohybuj zde myší — generuješ záplavu událostí (jako scroll / mousemove)
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 540, background: "var(--bg-inset)", borderRadius: 6 }}>
        <text x={TRACK_X} y={20} fontSize="10.5" fontWeight="600" fill="var(--text)">poslední 4 s — kdy se spustí obsluha</text>
        <text x={W - 14} y={20} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">teď →</text>

        {LANES.map((lane) => {
          const stroke = `oklch(0.6 0.15 ${lane.hue})`;
          const fill = `oklch(0.62 0.15 ${lane.hue} / 0.9)`;
          const f = fires[lane.key];
          return (
            <g key={lane.key}>
              <text x={TRACK_X} y={lane.y - 12} fontSize="10" fontWeight="600" fill="var(--text)">{lane.label}</text>
              {/* dráha */}
              <line x1={TRACK_X} y1={lane.y} x2={TRACK_X + TRACK_W} y2={lane.y} stroke="var(--line)" strokeWidth="1" />
              {/* tiky událostí / spuštění */}
              {f.map((t, i) => {
                const x = toX(t);
                if (x < TRACK_X - 1 || x > TRACK_X + TRACK_W + 1) return null;
                return <line key={i} x1={x} y1={lane.y - 9} x2={x} y2={lane.y + 9} stroke={stroke} strokeWidth={lane.key === "raw" ? 1 : 2} />;
              })}
              {/* počet spuštění */}
              <rect x={TRACK_X + TRACK_W - 56} y={lane.y - 26} width={56} height={16} rx={3} fill={`oklch(0.62 0.15 ${lane.hue} / 0.18)`} stroke={stroke} strokeWidth="0.7" />
              <text x={TRACK_X + TRACK_W - 28} y={lane.y - 14} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text)">
                {f.length}×
              </text>
              {/* tečka „naposledy spuštěno" */}
              {f.length > 0 && <circle cx={Math.min(toX(f[f.length - 1]), TRACK_X + TRACK_W)} cy={lane.y} r={2.6} fill={fill} />}
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        <b style={{ color: "oklch(0.58 0.18 22)" }}>Surová</b> obsluha běží na každou událost — záplava volání.{" "}
        <b style={{ color: "oklch(0.55 0.15 142)" }}>Debounce</b> spustí obsluhu až {ms} ms po poslední události (našeptávač: až dopíšeš).{" "}
        <b style={{ color: "oklch(0.55 0.15 200)" }}>Throttle</b> ji pustí nejvýše jednou za {ms} ms i během souvislého pohybu (plynulý scroll).
      </div>
    </div>
  );
}
