// Triplet loss in a 2D embedding space.
// Drag anchor (A), positive (P), negative (N). We draw d(a,p), d(a,n), a margin
// ring around A at radius d(a,p)+m, and the live triplet loss
// L = max(0, d(a,p) - d(a,n) + m). Loss is 0 once N is outside the ring.
import { useRef, useState } from "react";

export default function TripletLoss() {
  const W = 300, H = 200;
  const m = 38; // margin in pixels
  const [pts, setPts] = useState({
    a: [95, 100],
    p: [140, 70],
    n: [165, 140],
  });
  const [drag, setDrag] = useState(null);
  const svgRef = useRef(null);

  const dist = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]);
  const dap = dist(pts.a, pts.p);
  const dan = dist(pts.a, pts.n);
  const loss = Math.max(0, dap - dan + m);
  const satisfied = loss === 0;

  const toLocal = (e) => {
    const svg = svgRef.current;
    const r = svg.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return [
      Math.max(12, Math.min(W - 12, (cx / r.width) * W)),
      Math.max(12, Math.min(H - 12, (cy / r.height) * H)),
    ];
  };
  const onMove = (e) => {
    if (!drag) return;
    e.preventDefault();
    const p = toLocal(e);
    setPts((s) => ({ ...s, [drag]: p }));
  };
  const stop = () => setDrag(null);

  const COL = {
    a: "var(--accent)",
    p: "var(--accent-line)",
    n: "var(--text-muted)",
  };
  const LABEL = { a: "A", p: "P", n: "N" };

  // margin ring radius around the anchor: target = d(a,p)+m (N should sit beyond it)
  const ring = dap + m;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", display: "block", maxWidth: 440, touchAction: "none", cursor: drag ? "grabbing" : "default" }}
        onMouseMove={onMove} onMouseUp={stop} onMouseLeave={stop}
        onTouchMove={onMove} onTouchEnd={stop}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* margin ring around anchor: N must be on/outside this to give 0 loss */}
        <circle cx={pts.a[0]} cy={pts.a[1]} r={ring} fill="none"
          stroke="var(--line)" strokeWidth="1" strokeDasharray="4 3" />
        <text x={pts.a[0] + ring * 0.7} y={pts.a[1] - ring * 0.7} fontSize="8"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">d(a,p)+m</text>

        {/* anchor->positive line (should be short) */}
        <line x1={pts.a[0]} y1={pts.a[1]} x2={pts.p[0]} y2={pts.p[1]}
          stroke="var(--accent)" strokeWidth="1.6" />
        {/* anchor->negative line (should be long) */}
        <line x1={pts.a[0]} y1={pts.a[1]} x2={pts.n[0]} y2={pts.n[1]}
          stroke={satisfied ? "var(--text-muted)" : "oklch(0.6 0.18 22)"} strokeWidth="1.6" />

        {/* distance labels at midpoints */}
        <text x={(pts.a[0] + pts.p[0]) / 2 + 4} y={(pts.a[1] + pts.p[1]) / 2 - 4}
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">d(a,p)={(dap).toFixed(0)}</text>
        <text x={(pts.a[0] + pts.n[0]) / 2 + 4} y={(pts.a[1] + pts.n[1]) / 2 + 10}
          fontSize="9" fontFamily="var(--font-mono)" fill={satisfied ? "var(--text-muted)" : "oklch(0.6 0.18 22)"}>d(a,n)={(dan).toFixed(0)}</text>

        {/* points */}
        {(["a", "p", "n"]).map((k) => (
          <g key={k} style={{ cursor: "grab" }}
            onMouseDown={() => setDrag(k)} onTouchStart={() => setDrag(k)}>
            <circle cx={pts[k][0]} cy={pts[k][1]} r="11"
              fill={COL[k]} stroke="var(--line-strong)" strokeWidth="1" />
            <text x={pts[k][0]} y={pts[k][1] + 1} textAnchor="middle" dominantBaseline="central"
              fontSize="11" fontWeight="600" fontFamily="var(--font-mono)"
              fill="var(--bg-inset)">{LABEL[k]}</text>
          </g>
        ))}

        <text x={8} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          táhni A / P / N
        </text>
      </svg>

      <span className="viz-readout">
        d(a,p)={dap.toFixed(0)} · d(a,n)={dan.toFixed(0)} · margin={m} · L = max(0, d(a,p)−d(a,n)+m) ={" "}
        <b style={{ color: satisfied ? "var(--accent)" : "oklch(0.6 0.18 22)" }}>{loss.toFixed(0)}</b>
        {satisfied ? "  ✓ N je za marginem" : "  N je moc blízko"}
      </span>
    </div>
  );
}
