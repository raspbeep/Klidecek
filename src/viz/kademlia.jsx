// Kademlia FIND_VALUE hop-by-hop animation on a 5-bit (N=32) ID ring.
// Each node only "knows" k=3 nodes per bucket [2^i, 2^(i+1)) — so the lookup
// must hop, it can't teleport to the answer in one step.
import { useState, useMemo, useEffect } from "react";

const ID_BITS = 5;
const N = 1 << ID_BITS;
const K = 3;

export default function Kademlia() {
  const [self, setSelf] = useState(2);
  const [target, setTarget] = useState(26);
  const [hop, setHop] = useState(0);

  const traversal = useMemo(() => computeTrace(self, target), [self, target]);

  useEffect(() => { setHop(0); }, [self, target]);

  const W = 480, H = 270;
  const cx = W * 0.62, cy = H / 2 + 4;
  const ringR = Math.min(W * 0.32, H * 0.42);

  const cur = hop > 0 ? traversal[hop - 1] : null;
  const reached = cur && cur.to === target;

  const buckets = useMemo(() => bucketsOf(self), [self]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* k-bucket panel */}
        <g>
          <rect x="8" y="8" width="148" height={H - 16} fill="var(--bg-card)"
            stroke="var(--line-strong)" rx="4" />
          <text x="16" y="22" fontSize="10" fontFamily="var(--font-mono)"
            fontWeight="700" fill="var(--text)">k-buckety {self}</text>
          <text x="16" y="34" fontSize="8" fontFamily="var(--font-mono)"
            fill="var(--text-faint)">k={K}, [2ⁱ, 2ⁱ⁺¹)</text>
          {buckets.map((bk, i) => {
            const y = 50 + i * 36;
            return (
              <g key={`bk-${i}`}>
                <text x="16" y={y} fontSize="8.5" fontFamily="var(--font-mono)"
                  fill="var(--accent)">
                  i={i} [{1 << i}–{(1 << (i + 1)) - 1}]
                </text>
                <text x="16" y={y + 11} fontSize="9.5" fontFamily="var(--font-mono)"
                  fill="var(--text-muted)">
                  {bk.length ? bk.slice(0, K).join(", ") : "—"}
                </text>
              </g>
            );
          })}
        </g>

        {/* ring of nodes */}
        {Array.from({ length: N }, (_, i) => {
          const a = (i / N) * 2 * Math.PI - Math.PI / 2;
          const x = cx + Math.cos(a) * ringR;
          const y = cy + Math.sin(a) * ringR;
          const isSelf = i === self;
          const isTarget = i === target;
          const isVisited = traversal.slice(0, hop).some((h) => h.from === i || h.to === i);
          const isCurrent = cur && cur.to === i;

          let fill = "var(--bg-card)", stroke = "var(--line-strong)", textFill = "var(--text-muted)";
          if (isTarget && reached) { fill = "oklch(0.62 0.15 145)"; stroke = "oklch(0.62 0.15 145)"; textFill = "white"; }
          else if (isTarget) { fill = "color-mix(in oklch, oklch(0.68 0.16 65) 18%, var(--bg-card))"; stroke = "oklch(0.68 0.16 65)"; textFill = "var(--text)"; }
          else if (isSelf) { fill = "var(--accent)"; stroke = "var(--accent)"; textFill = "white"; }
          else if (isCurrent) { fill = "color-mix(in oklch, var(--accent) 30%, var(--bg-card))"; stroke = "var(--accent)"; textFill = "var(--text)"; }
          else if (isVisited) { fill = "color-mix(in oklch, var(--accent) 10%, var(--bg-card))"; stroke = "var(--accent)"; }

          return (
            <g key={`n-${i}`}>
              <circle cx={x} cy={y} r="8" fill={fill} stroke={stroke} strokeWidth="1" />
              <text x={x} y={y + 2.5} textAnchor="middle"
                fontSize="7" fontFamily="var(--font-mono)" fontWeight="700"
                fill={textFill}>{i}</text>
            </g>
          );
        })}

        {/* center label */}
        <text x={cx} y={cy - 4} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          N={N}
        </text>
        <text x={cx} y={cy + 7} textAnchor="middle"
          fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          XOR metric
        </text>

        {/* traversal arrows */}
        {traversal.slice(0, hop).map((h, i) => {
          const a1 = (h.from / N) * 2 * Math.PI - Math.PI / 2;
          const a2 = (h.to / N) * 2 * Math.PI - Math.PI / 2;
          const r1 = ringR - 8;
          const x1 = cx + Math.cos(a1) * r1;
          const y1 = cy + Math.sin(a1) * r1;
          const x2 = cx + Math.cos(a2) * r1;
          const y2 = cy + Math.sin(a2) * r1;
          const mx = (x1 + x2 + cx) / 3;
          const my = (y1 + y2 + cy) / 3;
          const isCur = i === hop - 1;
          return (
            <g key={`tr-${i}`}>
              <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                fill="none"
                stroke={isCur ? "var(--accent)" : "color-mix(in oklch, var(--accent) 50%, var(--bg-card))"}
                strokeWidth={isCur ? 1.8 : 1.1}
                opacity={isCur ? 1 : 0.7}
                markerEnd={`url(#${isCur ? "kad-cur" : "kad-past"})`} />
              <text x={mx} y={my} textAnchor="middle"
                fontSize="8" fontFamily="var(--font-mono)" fontWeight="700"
                fill={isCur ? "var(--accent)" : "var(--text-muted)"}>
                #{i + 1}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="kad-cur" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 z" fill="var(--accent)" />
          </marker>
          <marker id="kad-past" markerWidth="6" markerHeight="6" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L6,2.5 L0,5 z" fill="color-mix(in oklch, var(--accent) 50%, var(--bg-card))" />
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
        fontSize: 12, color: "var(--text-muted)" }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          self
          <input type="number" min="0" max={N - 1} value={self}
            onChange={(e) => setSelf(clamp(+e.target.value || 0, 0, N - 1))}
            style={{ width: 50, padding: "2px 4px", border: "1px solid var(--line-strong)",
              borderRadius: 3, background: "var(--bg-card)", color: "var(--text)",
              fontFamily: "var(--font-mono)" }} />
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          klíč
          <input type="number" min="0" max={N - 1} value={target}
            onChange={(e) => setTarget(clamp(+e.target.value || 0, 0, N - 1))}
            style={{ width: 50, padding: "2px 4px", border: "1px solid var(--line-strong)",
              borderRadius: 3, background: "var(--bg-card)", color: "var(--text)",
              fontFamily: "var(--font-mono)" }} />
        </label>
        <button className="btn"
          onClick={() => setHop((h) => Math.min(traversal.length, h + 1))}
          disabled={hop >= traversal.length}>další hop</button>
        <button className="btn ghost" onClick={() => setHop(0)}>reset</button>
        <button className="btn ghost" onClick={() => setHop(traversal.length)}>
          najdi
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        {cur ? (
          reached ? (
            <span style={{ color: "oklch(0.62 0.15 145)" }}>
              ✓ Cíl <strong>{target}</strong> nalezen po {hop} skocích (očekáváno ~log₂{N} = {Math.log2(N).toFixed(1)}).
            </span>
          ) : (
            <span>
              Hop {hop}: {cur.from} → {cur.to}, XOR z {cur.xorBefore} na {cur.xorAfter}.
              Každý uzel volí ze své znalosti nejbližšího ke klíči.
            </span>
          )
        ) : (
          <span>
            Klikni „další hop" — uzel {self} hledá klíč {target}, jen na základě svých k-bucketů
            (každý uzel zná pouze K={K} nodů na vzdálenostní pásmo).
          </span>
        )}
      </div>
    </div>
  );
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Per-node knowledge: up to K nodes per distance bucket [2^i, 2^(i+1))
function bucketsOf(node) {
  const out = [];
  for (let i = 0; i < ID_BITS; i++) {
    const lo = 1 << i;
    const hi = 1 << (i + 1);
    const bk = [];
    for (let j = 0; j < N; j++) {
      if (j === node) continue;
      const d = j ^ node;
      if (d >= lo && d < hi) bk.push(j);
    }
    bk.sort((a, b) => a - b);
    out.push(bk);
  }
  return out;
}

function knownNodesOf(node) {
  const known = new Set();
  bucketsOf(node).forEach((bk) => bk.slice(0, K).forEach((n) => known.add(n)));
  return known;
}

function computeTrace(self, target) {
  if (self === target) return [];
  const trace = [];
  let current = self;
  let iter = 0;
  while (current !== target && iter < 8) {
    const xor = current ^ target;
    const known = knownNodesOf(current);
    let best = current;
    let bestDist = xor;
    known.forEach((n) => {
      const d = n ^ target;
      if (d < bestDist) { bestDist = d; best = n; }
    });
    if (best === current) break;
    trace.push({ from: current, to: best, xorBefore: xor, xorAfter: bestDist });
    current = best;
    iter++;
  }
  return trace;
}
