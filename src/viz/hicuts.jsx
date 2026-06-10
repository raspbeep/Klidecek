// Geometric view of 2D packet classification + HiCuts cuts overlay.
// Drag the packet point — the highest-priority matching rule lights up.
// Toggle HiCuts to see the recursive space partition.
import { useState, useRef, useEffect } from "react";

// 8 rules in a 3-bit × 3-bit field space (F1, F2 ∈ [0, 8)).
// Priority = array index (R1 highest, R8 lowest), matching real ACL semantics.
const RULES = [
  { id: "R1", f1: [0, 1], f2: [0, 1], action: "permit" },
  { id: "R3", f1: [1, 4], f2: [0, 1], action: "permit" },
  { id: "R2", f1: [0, 4], f2: [1, 4], action: "deny"   },
  { id: "R4", f1: [4, 6], f2: [3, 5], action: "permit" },
  { id: "R5", f1: [6, 8], f2: [3, 5], action: "deny"   },
  { id: "R7", f1: [0, 4], f2: [4, 6], action: "permit" },
  { id: "R6", f1: [4, 8], f2: [6, 8], action: "permit" },
  { id: "R8", f1: [0, 4], f2: [6, 8], action: "deny"   },
];

const RULE_COLORS = [
  "oklch(0.62 0.15 145)", "oklch(0.55 0.18 264)", "oklch(0.68 0.16 65)",
  "oklch(0.60 0.18 25)",  "oklch(0.55 0.12 180)", "oklch(0.58 0.14 310)",
  "oklch(0.65 0.13 100)", "oklch(0.50 0.14 220)",
];

export default function HiCuts() {
  const [packet, setPacket] = useState({ f1: 5, f2: 4 });
  const [showCuts, setShowCuts] = useState(false);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef(null);

  // recursive HiCuts decision tree
  const tree = buildHiCuts(RULES);

  const W = 480, H = 280;
  const padL = 30, padR = 200, padT = 20, padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const sx = (f) => padL + (f / 8) * plotW;
  const sy = (f) => padT + (1 - f / 8) * plotH;

  // does a rule contain a (f1, f2) point?
  const contains = (r, p) =>
    p.f1 >= r.f1[0] && p.f1 < r.f1[1] && p.f2 >= r.f2[0] && p.f2 < r.f2[1];

  const matching = RULES.filter((r) => contains(r, packet));
  const winner = matching[0] || null;
  const winnerIdx = winner ? RULES.indexOf(winner) : -1;

  // pointer handlers
  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const rect = svgRef.current.getBoundingClientRect();
      const sxPx = (e.clientX - rect.left) * (W / rect.width);
      const syPx = (e.clientY - rect.top) * (H / rect.height);
      const f1 = clamp(((sxPx - padL) / plotW) * 8, 0, 8 - 0.001);
      const f2 = clamp((1 - (syPx - padT) / plotH) * 8, 0, 8 - 0.001);
      setPacket({ f1, f2 });
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", display: "block", touchAction: "none",
          cursor: dragging ? "grabbing" : "default" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* axis grid */}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={`gx-${i}`}>
            <line x1={sx(i)} y1={padT} x2={sx(i)} y2={padT + plotH}
              stroke="var(--line)" strokeWidth="0.4" />
            <text x={sx(i)} y={padT + plotH + 11} textAnchor="middle"
              fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              {i.toString(2).padStart(3, "0")}
            </text>
          </g>
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={`gy-${i}`}>
            <line x1={padL} y1={sy(i)} x2={padL + plotW} y2={sy(i)}
              stroke="var(--line)" strokeWidth="0.4" />
            <text x={padL - 4} y={sy(i) + 2.5} textAnchor="end"
              fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              {i.toString(2).padStart(3, "0")}
            </text>
          </g>
        ))}

        {/* HiCuts overlay (behind rules so rules still visible) */}
        {showCuts && tree.lines.map((ln, i) => (
          <line key={`ct-${i}`}
            x1={ln.dim === "f1" ? sx(ln.at) : sx(ln.lo)}
            x2={ln.dim === "f1" ? sx(ln.at) : sx(ln.hi)}
            y1={ln.dim === "f1" ? sy(ln.lo) : sy(ln.at)}
            y2={ln.dim === "f1" ? sy(ln.hi) : sy(ln.at)}
            stroke="oklch(0.68 0.16 65)" strokeWidth="1.3"
            strokeDasharray="4 2" opacity="0.9" />
        ))}

        {/* rules — semi-transparent fills with labels */}
        {RULES.map((r, i) => {
          const x = sx(r.f1[0]);
          const y = sy(r.f2[1]);
          const w = sx(r.f1[1]) - x;
          const h = sy(r.f2[0]) - y;
          const isWinner = i === winnerIdx;
          const isMatch = matching.includes(r);
          return (
            <g key={r.id}>
              <rect x={x} y={y} width={w} height={h}
                fill={RULE_COLORS[i]}
                fillOpacity={isWinner ? 0.34 : isMatch ? 0.16 : 0.08}
                stroke={RULE_COLORS[i]}
                strokeWidth={isWinner ? 2 : 0.9}
                strokeDasharray={isMatch && !isWinner ? "3 2" : "none"} />
              <text x={x + 3} y={y + 10}
                fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
                fill={RULE_COLORS[i]}>{r.id}</text>
            </g>
          );
        })}

        {/* packet point — draggable */}
        <g onPointerDown={(e) => { e.preventDefault(); setDragging(true); }}
           style={{ cursor: "grab" }}>
          <circle cx={sx(packet.f1)} cy={sy(packet.f2)} r="9"
            fill="var(--bg-card)" stroke="var(--text)" strokeWidth="2" />
          <circle cx={sx(packet.f1)} cy={sy(packet.f2)} r="3.5"
            fill="var(--text)" />
          <text x={sx(packet.f1) + 13} y={sy(packet.f2) - 8}
            fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
            fill="var(--text)">P</text>
        </g>

        <text x={padL + plotW / 2} y={H - 4} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">F1</text>
        <text x={10} y={padT + plotH / 2}
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)"
          transform={`rotate(-90 10 ${padT + plotH / 2})`}>F2</text>

        {/* match panel on the right */}
        <g>
          <rect x={W - padR + 14} y={padT - 4} width={padR - 24} height={H - padT - padB + 4}
            fill="var(--bg-card)" stroke="var(--line-strong)" rx="4" />
          <text x={W - padR + 24} y={padT + 10}
            fontSize="10" fontWeight="700" fontFamily="var(--font-mono)"
            fill="var(--text)">
            P = ({packet.f1.toFixed(1)}, {packet.f2.toFixed(1)})
          </text>
          <text x={W - padR + 24} y={padT + 24}
            fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
            shoda v {matching.length} pravidlech
          </text>
          {RULES.map((r, i) => {
            const isMatch = matching.includes(r);
            const isWinner = i === winnerIdx;
            const y = padT + 42 + i * 22;
            return (
              <g key={`m-${r.id}`}>
                <rect x={W - padR + 22} y={y - 9} width="8" height="13"
                  fill={RULE_COLORS[i]}
                  fillOpacity={isMatch ? 1 : 0.25}
                  rx="1" />
                <text x={W - padR + 36} y={y} fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight={isWinner ? 700 : 400}
                  fill={isWinner ? RULE_COLORS[i] : (isMatch ? "var(--text)" : "var(--text-faint)")}>
                  {r.id} {r.action === "permit" ? "✓" : "✗"}{isWinner ? " ← match" : ""}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="viz-controls" style={{ fontSize: 12, color: "var(--text-muted)" }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text)" }}>
          <input type="checkbox" checked={showCuts}
            onChange={(e) => setShowCuts(e.target.checked)} />
          HiCuts řezy
        </label>
        <button className="viz-btn"
          onClick={() => setPacket({ f1: 5, f2: 4 })}>reset P</button>
        <span className="viz-readout push">
          {winner ? (
            <span>
              vítěz: <strong style={{ color: RULE_COLORS[winnerIdx] }}>{winner.id}</strong>
              {" "}({winner.action})
            </span>
          ) : (
            <span>žádné pravidlo nematchuje — implicit deny</span>
          )}
        </span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        Pravidlo = obdélník v 2D prostoru (F<sub>1</sub>, F<sub>2</sub>). Paket = bod.
        Linear search by porovnal P proti všem 8 pravidlům podle priority.
        {showCuts && (
          <> HiCuts pre-staví strom: řezy (oranžově) dělí prostor tak, aby v každé buňce zbylo málo pravidel — pak stačí lineárně projít listu.</>
        )}
      </div>
    </div>
  );
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Build a simple HiCuts-style partition: cut on the dim with the most rule
// boundaries until any region has ≤ THRESHOLD rules. Returns the cut lines
// for overlay drawing (does not need to be a full tree for visualization).
function buildHiCuts(rules) {
  const THRESHOLD = 2;
  const lines = [];

  function rulesIn(box) {
    return rules.filter((r) =>
      r.f1[0] < box.f1[1] && r.f1[1] > box.f1[0] &&
      r.f2[0] < box.f2[1] && r.f2[1] > box.f2[0]
    );
  }

  function recurse(box, depth) {
    if (depth > 4) return;
    const inside = rulesIn(box);
    if (inside.length <= THRESHOLD) return;
    // pick dim with most distinct rule boundary inside the box
    const candidates = (dim) => {
      const xs = new Set();
      inside.forEach((r) => {
        if (r[dim][0] > box[dim][0] && r[dim][0] < box[dim][1]) xs.add(r[dim][0]);
        if (r[dim][1] > box[dim][0] && r[dim][1] < box[dim][1]) xs.add(r[dim][1]);
      });
      return [...xs];
    };
    const c1 = candidates("f1"), c2 = candidates("f2");
    const dim = c1.length >= c2.length ? "f1" : "f2";
    const candList = dim === "f1" ? c1 : c2;
    if (!candList.length) return;
    // pick median candidate
    candList.sort((a, b) => a - b);
    const at = candList[Math.floor(candList.length / 2)];
    const otherDim = dim === "f1" ? "f2" : "f1";
    lines.push({ dim, at, lo: box[otherDim][0], hi: box[otherDim][1] });
    const a = { ...box, [dim]: [box[dim][0], at] };
    const b = { ...box, [dim]: [at, box[dim][1]] };
    recurse(a, depth + 1);
    recurse(b, depth + 1);
  }

  recurse({ f1: [0, 8], f2: [0, 8] }, 0);
  return { lines };
}
