// Pollardova ρ — bezpaměťové hledání kolize hashe.
// Iteruje x_{i+1} = H(x_i); Floyd's tortoise-and-hare najde cyklus.
// Cyklus → kolize (vstup do cyklu a místo opětovného navštívení).
import { useEffect, useMemo, useState } from "react";

// Toy n-bit hash
function makeHash(n) {
  const mask = (1 << n) - 1;
  return (x) => {
    let y = x;
    y = (y ^ (y << 13)) & 0xFFFFFFFF;
    y = (y ^ (y >>> 17)) & 0xFFFFFFFF;
    y = (y ^ (y << 5)) & 0xFFFFFFFF;
    return (y >>> 0) & mask;
  };
}

export default function PollardRho() {
  const [n, setN] = useState(10);
  const [start, setStart] = useState(7);
  const [running, setRunning] = useState(false);

  const h = useMemo(() => makeHash(n), [n]);
  const N = 1 << n;

  const result = useMemo(() => {
    // Floyd: tortoise = h(x_0), hare = h(h(x_0))
    let tortoise = h(start), hare = h(h(start));
    const tPath = [start, tortoise], hPath = [start, h(start), hare];
    let steps = 0;
    const maxSteps = N + 100;
    while (tortoise !== hare && steps < maxSteps) {
      tortoise = h(tortoise);
      hare = h(h(hare));
      tPath.push(tortoise);
      hPath.push(h(hPath[hPath.length - 1]));
      hPath.push(hare);
      steps++;
    }
    if (tortoise !== hare) return { found: false };

    // Find start of cycle: tortoise = x_0, hare stays. Advance both 1 by 1.
    let mu = 0;
    tortoise = start;
    while (tortoise !== hare) {
      tortoise = h(tortoise);
      hare = h(hare);
      mu++;
    }
    // Now find cycle length λ
    let lambda = 1;
    let h2 = h(tortoise);
    while (h2 !== tortoise) {
      h2 = h(h2);
      lambda++;
    }

    // Collision: x_{μ-1} (or pred of cycle entry) and x_{μ+λ-1} both → x_μ
    // Simpler: any two x_i, x_j with h(x_i) = h(x_j) demonstrates collision
    // The collision is at tortoise = h(x_{μ-1}) and also h(x_{μ+λ-1}). Find these in path.
    return { found: true, mu, lambda, meetVal: tortoise, steps, tPath: tPath.slice(0, Math.min(80, tPath.length)) };
  }, [start, h, N]);

  // Visualisation: draw the ρ-shape
  const W = 540, H = 260;
  const cx = 280, cy = 140;

  // Compute path positions
  const positions = useMemo(() => {
    if (!result.found) return [];
    const pts = [];
    let x = start;
    const seen = new Map();
    for (let i = 0; i < 60; i++) {
      if (seen.has(x)) {
        return { pts, cycleStart: seen.get(x) };
      }
      seen.set(x, i);
      pts.push({ x, idx: i });
      x = h(x);
    }
    return { pts, cycleStart: -1 };
  }, [start, h, result.found]);

  function layoutPoints(positions) {
    if (!positions.pts) return [];
    const tail = positions.pts.slice(0, positions.cycleStart);
    const cycle = positions.pts.slice(positions.cycleStart);
    const layouts = [];
    // Tail: along a curve from (60, 140) to ρ start
    const cycleR = Math.max(40, Math.min(80, cycle.length * 6));
    const cycleCx = cx + 60, cycleCy = cy;
    tail.forEach((p, i) => {
      const tailX = 100 + (i / Math.max(1, tail.length)) * (cycleCx - cycleR - 100);
      layouts.push({ ...p, px: tailX, py: cy, kind: "tail" });
    });
    cycle.forEach((p, i) => {
      const ang = (i / cycle.length) * 2 * Math.PI;
      layouts.push({ ...p, px: cycleCx + cycleR * Math.cos(ang), py: cycleCy + cycleR * Math.sin(ang), kind: "cycle" });
    });
    return layouts;
  }
  const layout = useMemo(() => layoutPoints(positions), [positions]);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>velikost hashe n bitů: {n}</label>
        <input type="range" min={6} max={14} value={n} onChange={(e) => setN(+e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        <label style={lbl}>start x₀:</label>
        <input type="number" min={0} max={N - 1} value={start} onChange={(e) => setStart(+e.target.value)} style={num} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 620, background: "var(--bg-inset)", borderRadius: 6 }}>
        {layout.length > 1 && layout.map((p, i) => {
          if (i === layout.length - 1) return null;
          const next = layout[i + 1];
          // For cycle, we may need to wrap around: don't draw from last cycle back to its first since we drew positions linearly
          return (
            <line key={i} x1={p.px} y1={p.py} x2={next.px} y2={next.py}
              stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
          );
        })}
        {/* Close the cycle */}
        {positions.cycleStart >= 0 && layout.length > 0 && (() => {
          const cyclePoints = layout.filter((p) => p.kind === "cycle");
          if (cyclePoints.length < 2) return null;
          const first = cyclePoints[0], last = cyclePoints[cyclePoints.length - 1];
          return <line x1={last.px} y1={last.py} x2={first.px} y2={first.py} stroke="var(--accent)" strokeWidth="1.2" />;
        })()}

        {layout.map((p, i) => {
          const isStart = i === 0;
          const isCycleStart = i === positions.cycleStart;
          return (
            <g key={i}>
              <circle cx={p.px} cy={p.py} r={isStart ? 5 : 3} fill={isStart ? "var(--accent)" : isCycleStart ? "#81b29a" : "var(--text-muted)"} />
              {(isStart || isCycleStart || i < 4 || i % 5 === 0) && (
                <text x={p.px} y={p.py - 8} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{p.x}</text>
              )}
            </g>
          );
        })}

        <text x={20} y={20} fontSize="11" fill="var(--text-muted)">ρ-tvar: chvost + cyklus</text>
        <text x={20} y={H - 10} fontSize="10" fill="var(--accent)">● start</text>
        <text x={70} y={H - 10} fontSize="10" fill="#81b29a">● vstup do cyklu</text>
      </svg>

      {result.found ? (
        <div style={section}>
          <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 4 }}>Floyd: tortoise/hare se potkali — cyklus nalezen.</div>
          <div style={mono}>
            μ (vstup do cyklu) = <b>{result.mu}</b><br />
            λ (délka cyklu) = <b>{result.lambda}</b><br />
            kolizní hodnota: h(x_{result.mu - 1}) = h(x_{result.mu + result.lambda - 1}) = <b style={{ color: "#81b29a" }}>{result.meetVal}</b><br />
            kroků pro nalezení: <b>{result.steps}</b>
            <span style={{ color: "var(--text-faint)" }}> (~√N = {Math.sqrt(N).toFixed(0)})</span>
          </div>
        </div>
      ) : (
        <div style={{ ...section, color: "#e07a5f" }}>Žádný cyklus nenalezen v limitu.</div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Pollardova ρ je <b>bezpaměťový</b> útok — používá Floydovu detekci cyklu místo hash mapy.
        Time: O(√N) jako birthday, ale memory: O(1). Tvar trajektorie připomíná řecké písmeno ρ (proto název).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const num = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", width: 70 };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const mono = { fontFamily: "var(--font-mono)", color: "var(--text)", fontSize: 12, lineHeight: 1.6 };
