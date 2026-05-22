// P2P overlay vs IP underlay.
// Top: logical overlay (peers + super peer, dashed logical links).
// Bottom: IP infrastructure (routers in a mesh + PCs hosting peers).
// Click a peer → its overlay neighbours light up, and the IP path between
// the hosting PCs is highlighted (BFS on the underlay graph).
import { useState, useMemo } from "react";

const W = 540, H = 320;

// Overlay peers (logical positions in the top half)
const PEERS = [
  { id: "p0", x: 70,  y: 60, host: "h0" },
  { id: "p1", x: 160, y: 40, host: "h1" },
  { id: "p2", x: 250, y: 70, host: "h2" },
  { id: "p3", x: 340, y: 40, host: "h3", super: true },
  { id: "p4", x: 430, y: 70, host: "h4" },
  { id: "p5", x: 130, y: 110, host: "h5" },
  { id: "p6", x: 300, y: 120, host: "h6" },
  { id: "p7", x: 470, y: 120, host: "h7" },
];

// Logical (overlay) links — deliberately NOT mirroring physical topology
const OVERLAY_LINKS = [
  ["p0", "p3"], ["p0", "p5"], ["p1", "p3"], ["p2", "p3"], ["p3", "p4"],
  ["p3", "p6"], ["p3", "p7"], ["p5", "p7"], ["p2", "p6"], ["p4", "p1"],
];

// Underlay: 4 routers in a square + 8 PCs (one per peer)
const ROUTERS = [
  { id: "r0", x: 130, y: 230 },
  { id: "r1", x: 230, y: 230 },
  { id: "r2", x: 330, y: 230 },
  { id: "r3", x: 430, y: 230 },
];

const ROUTER_LINKS = [
  ["r0", "r1"], ["r1", "r2"], ["r2", "r3"],
  ["r0", "r2"], ["r1", "r3"], // some cross-links so paths vary
];

const HOSTS = [
  { id: "h0", x: 80,  y: 285, router: "r0", peer: "p0" },
  { id: "h1", x: 130, y: 290, router: "r0", peer: "p1" },
  { id: "h5", x: 180, y: 285, router: "r0", peer: "p5" },
  { id: "h2", x: 230, y: 290, router: "r1", peer: "p2" },
  { id: "h6", x: 305, y: 290, router: "r2", peer: "p6" },
  { id: "h3", x: 355, y: 285, router: "r2", peer: "p3" },
  { id: "h4", x: 430, y: 290, router: "r3", peer: "p4" },
  { id: "h7", x: 480, y: 285, router: "r3", peer: "p7" },
];

// Build a small adjacency for BFS over the underlay (routers + hosts).
const underlayAdj = (() => {
  const adj = {};
  [...ROUTERS, ...HOSTS].forEach((n) => (adj[n.id] = []));
  ROUTER_LINKS.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  HOSTS.forEach((h) => { adj[h.id].push(h.router); adj[h.router].push(h.id); });
  return adj;
})();

function bfsPath(src, dst) {
  if (src === dst) return [src];
  const prev = { [src]: null };
  const q = [src];
  while (q.length) {
    const u = q.shift();
    for (const v of underlayAdj[u]) {
      if (v in prev) continue;
      prev[v] = u;
      if (v === dst) {
        const path = [];
        let cur = v;
        while (cur != null) { path.push(cur); cur = prev[cur]; }
        return path.reverse();
      }
      q.push(v);
    }
  }
  return [];
}

export default function P2POverlay() {
  const [selected, setSelected] = useState("p0");
  const [hoverEdge, setHoverEdge] = useState(null);

  const overlayNeighbours = useMemo(() => {
    const out = new Set();
    OVERLAY_LINKS.forEach(([a, b]) => {
      if (a === selected) out.add(b);
      if (b === selected) out.add(a);
    });
    return out;
  }, [selected]);

  // For each highlighted overlay edge, compute underlay path
  const highlightedEdges = useMemo(() => {
    let edges = [];
    if (hoverEdge) edges = [hoverEdge];
    else edges = OVERLAY_LINKS.filter(([a, b]) => a === selected || b === selected);
    return edges.map(([a, b]) => {
      const pa = PEERS.find((p) => p.id === a);
      const pb = PEERS.find((p) => p.id === b);
      const path = bfsPath(pa.host, pb.host);
      return { a, b, path };
    });
  }, [selected, hoverEdge]);

  const usedUnderlayEdges = useMemo(() => {
    const s = new Set();
    highlightedEdges.forEach(({ path }) => {
      for (let i = 0; i < path.length - 1; i++) {
        const [u, v] = [path[i], path[i + 1]].sort();
        s.add(`${u}|${v}`);
      }
    });
    return s;
  }, [highlightedEdges]);

  const usedRouters = useMemo(() => {
    const s = new Set();
    highlightedEdges.forEach(({ path }) =>
      path.forEach((n) => { if (n.startsWith("r")) s.add(n); })
    );
    return s;
  }, [highlightedEdges]);

  const peerById = (id) => PEERS.find((p) => p.id === id);
  const hostById = (id) => HOSTS.find((h) => h.id === id);
  const routerById = (id) => ROUTERS.find((r) => r.id === id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* layer labels */}
        <text x={14} y={20} fontSize="10" fontWeight="700"
          fontFamily="var(--font-mono)" fill="var(--accent)">
          OVERLAY (logical)
        </text>
        <text x={14} y={205} fontSize="10" fontWeight="700"
          fontFamily="var(--font-mono)" fill="var(--text-muted)">
          IP infrastructure (physical)
        </text>

        {/* divider */}
        <line x1={0} y1={170} x2={W} y2={170}
          stroke="var(--line)" strokeWidth="0.6" strokeDasharray="4 3" />

        {/* underlay router links */}
        {ROUTER_LINKS.map(([a, b], i) => {
          const ra = routerById(a), rb = routerById(b);
          const key = [a, b].sort().join("|");
          const used = usedUnderlayEdges.has(key);
          return (
            <line key={`rl-${i}`}
              x1={ra.x} y1={ra.y} x2={rb.x} y2={rb.y}
              stroke={used ? "oklch(0.62 0.15 145)" : "var(--line-strong)"}
              strokeWidth={used ? 2.4 : 1.1}
              opacity={used ? 1 : 0.8} />
          );
        })}
        {/* underlay host→router links */}
        {HOSTS.map((h) => {
          const r = routerById(h.router);
          const key = [h.id, h.router].sort().join("|");
          const used = usedUnderlayEdges.has(key);
          return (
            <line key={`hl-${h.id}`}
              x1={h.x} y1={h.y} x2={r.x} y2={r.y}
              stroke={used ? "oklch(0.62 0.15 145)" : "var(--line-strong)"}
              strokeWidth={used ? 2 : 0.9}
              opacity={used ? 1 : 0.7} />
          );
        })}

        {/* peer ↔ host mapping lines (vertical dotted) */}
        {HOSTS.map((h) => {
          const p = peerById(h.peer);
          return (
            <line key={`map-${h.id}`}
              x1={p.x} y1={p.y + 9} x2={h.x} y2={h.y - 6}
              stroke="var(--text-faint)" strokeWidth="0.5"
              strokeDasharray="1 3" opacity="0.6" />
          );
        })}

        {/* overlay edges */}
        {OVERLAY_LINKS.map(([a, b], i) => {
          const pa = peerById(a), pb = peerById(b);
          const isHighlight = highlightedEdges.some((e) =>
            (e.a === a && e.b === b) || (e.a === b && e.b === a)
          );
          return (
            <line key={`ol-${i}`}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={isHighlight ? "var(--accent)" : "var(--accent-line)"}
              strokeWidth={isHighlight ? 2 : 1}
              strokeDasharray="4 2"
              opacity={isHighlight ? 1 : 0.5}
              onMouseEnter={() => setHoverEdge([a, b])}
              onMouseLeave={() => setHoverEdge(null)}
              style={{ cursor: "pointer", pointerEvents: "stroke" }} />
          );
        })}

        {/* routers */}
        {ROUTERS.map((r) => {
          const used = usedRouters.has(r.id);
          return (
            <g key={r.id}>
              <rect x={r.x - 10} y={r.y - 7} width={20} height={14}
                fill={used ? "color-mix(in oklch, oklch(0.62 0.15 145) 25%, var(--bg-card))" : "var(--bg-card)"}
                stroke={used ? "oklch(0.62 0.15 145)" : "var(--line-strong)"}
                strokeWidth="1" rx="2" />
              <text x={r.x} y={r.y + 3} textAnchor="middle"
                fontSize="8" fontFamily="var(--font-mono)" fontWeight="700"
                fill={used ? "oklch(0.62 0.15 145)" : "var(--text-muted)"}>
                {r.id}
              </text>
            </g>
          );
        })}

        {/* hosts (PCs) */}
        {HOSTS.map((h) => (
          <g key={h.id}>
            <rect x={h.x - 8} y={h.y - 5} width={16} height={11}
              fill="var(--bg-card)" stroke="var(--text-muted)"
              strokeWidth="0.8" rx="1.5" />
            <text x={h.x} y={h.y + 2.5} textAnchor="middle"
              fontSize="7" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              {h.id}
            </text>
          </g>
        ))}

        {/* peers */}
        {PEERS.map((p) => {
          const isSelected = p.id === selected;
          const isNeighbour = overlayNeighbours.has(p.id);
          let fill = "var(--bg-card)";
          let stroke = "var(--accent-line)";
          let textFill = "var(--text)";
          if (isSelected) {
            fill = "var(--accent)";
            stroke = "var(--accent)";
            textFill = "white";
          } else if (isNeighbour) {
            fill = "color-mix(in oklch, var(--accent) 28%, var(--bg-card))";
            stroke = "var(--accent)";
          }
          return (
            <g key={p.id} onClick={() => setSelected(p.id)}
              style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={p.super ? 11 : 9}
                fill={fill} stroke={stroke}
                strokeWidth={p.super ? 2 : 1.2} />
              <text x={p.x} y={p.y + 3} textAnchor="middle"
                fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
                fill={textFill}>
                {p.id}
              </text>
              {p.super && (
                <text x={p.x} y={p.y - 14} textAnchor="middle"
                  fontSize="7" fontFamily="var(--font-mono)"
                  fill="var(--accent)">super</text>
              )}
            </g>
          );
        })}

        {/* info banner */}
        <g>
          <text x={W - 14} y={20} textAnchor="end"
            fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            klik = peer · hover = jediný overlay link
          </text>
        </g>
      </svg>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        <strong style={{ color: "var(--text)" }}>{selected}</strong>
        {" má "}
        <strong style={{ color: "var(--accent)" }}>{overlayNeighbours.size}</strong>
        {" overlay sousedů "}
        ({[...overlayNeighbours].join(", ")}).
        Každý <em>logický</em> skok v overlay (čárkovaně) se v IP infrastruktuře{" "}
        <span style={{ color: "oklch(0.62 0.15 145)" }}>(zeleně)</span>{" "}
        skládá z 1–{Math.max(...highlightedEdges.map((e) => e.path.length - 1), 1)} fyzických hopů přes routery a host-linky.
      </div>
    </div>
  );
}
