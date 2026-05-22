// BFS expansion on a small graph.
import { useState, useEffect } from "react";

export default function BFS() {
  const nodes = [
    { id: 0, p: [40, 90] },  { id: 1, p: [100, 40] },  { id: 2, p: [100, 140] },
    { id: 3, p: [170, 60] }, { id: 4, p: [170, 130] }, { id: 5, p: [235, 90] },
    { id: 6, p: [235, 30] }, { id: 7, p: [235, 150] },
  ];
  const edges = [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[3,6],[4,7],[1,2]];
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });

  const [src, setSrc] = useState(0);
  const [step, setStep] = useState(0);

  const dist = {};
  dist[src] = 0;
  let q = [src];
  while (q.length) {
    const u = q.shift();
    for (const v of adj[u]) if (!(v in dist)) { dist[v] = dist[u] + 1; q.push(v); }
  }
  const maxLayer = Math.max(...Object.values(dist));

  useEffect(() => {
    setStep(0);
    const id = setInterval(() => setStep((s) => (s >= maxLayer ? 0 : s + 1)), 900);
    return () => clearInterval(id);
  }, [src, maxLayer]);

  const W = 280, H = 180;
  const colorFor = (i) => {
    if (!(i in dist)) return "var(--bg-card)";
    if (dist[i] > step) return "var(--bg-card)";
    if (dist[i] === step) return "var(--accent)";
    return "color-mix(in oklch, var(--accent) 30%, var(--bg-card))";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none", maxWidth: 400 }}>
      <rect width={W} height={H} fill="var(--bg-inset)" />
      {edges.map(([a, b], i) => {
        const reached = a in dist && b in dist && dist[a] <= step && dist[b] <= step;
        return (
          <line key={i} x1={nodes[a].p[0]} y1={nodes[a].p[1]} x2={nodes[b].p[0]} y2={nodes[b].p[1]}
            stroke={reached ? "var(--accent)" : "var(--line-strong)"}
            strokeWidth={reached ? 1.5 : 1} opacity={reached ? 0.7 : 0.5} />
        );
      })}
      {nodes.map((n) => (
        <g key={n.id} onClick={() => setSrc(n.id)} style={{ cursor: "pointer" }}>
          <circle cx={n.p[0]} cy={n.p[1]} r="11"
            fill={colorFor(n.id)}
            stroke={n.id === src ? "var(--accent)" : "var(--line-strong)"}
            strokeWidth={n.id === src ? 2 : 1} />
          <text x={n.p[0]} y={n.p[1] + 1} textAnchor="middle" dominantBaseline="central"
            fontSize="10" fontFamily="var(--font-mono)"
            fill={dist[n.id] <= step && n.id in dist ? "white" : "var(--text-muted)"}>
            {n.id in dist && dist[n.id] <= step ? dist[n.id] : n.id}
          </text>
        </g>
      ))}
      <text x={8} y={H - 8} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
        layer {step} / {maxLayer} · click any node to set source
      </text>
    </svg>
  );
}
