// Head-of-line blocking vs virtual output queues.
// Toggle VOQ on/off, step the scheduler, watch which packets get blocked.
import { useState, useRef } from "react";

const INITIAL = () => [
  [{ to: 1, id: "a" }, { to: 2, id: "b" }, { to: 1, id: "c" }],
  [{ to: 1, id: "d" }, { to: 0, id: "e" }],
  [{ to: 2, id: "f" }, { to: 1, id: "g" }, { to: 3, id: "h" }],
  [{ to: 0, id: "i" }],
];

export default function HolVoq() {
  const [voq, setVoq] = useState(false);
  const [inputs, setInputs] = useState(INITIAL);
  const [delivered, setDelivered] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [step, setStep] = useState(0);
  const [lastMoves, setLastMoves] = useState([]);
  const N = 4;

  const reset = (newVoq = voq) => {
    setVoq(newVoq);
    setInputs(INITIAL());
    setDelivered(0);
    setBlocked(0);
    setStep(0);
    setLastMoves([]);
  };

  const advance = () => {
    const used = new Set();
    const moves = [];
    const next = inputs.map((q) => [...q]);
    let d = delivered, b = blocked;

    if (voq) {
      // VOQ: scheduler may pick any packet from any input's queue
      // (matching one packet per input to one packet per output)
      const matchedInputs = new Set();
      for (let i = 0; i < next.length; i++) {
        if (matchedInputs.has(i)) continue;
        for (let k = 0; k < next[i].length; k++) {
          const pkt = next[i][k];
          if (!used.has(pkt.to)) {
            used.add(pkt.to);
            matchedInputs.add(i);
            moves.push({ from: i, to: pkt.to, id: pkt.id });
            next[i].splice(k, 1);
            d++;
            break;
          }
        }
      }
    } else {
      // FIFO: only the head of each input can be served
      for (let i = 0; i < next.length; i++) {
        const q = next[i];
        if (!q.length) continue;
        const head = q[0];
        if (!used.has(head.to)) {
          used.add(head.to);
          q.shift();
          moves.push({ from: i, to: head.to, id: head.id });
          d++;
        } else {
          b++;
        }
      }
    }

    setInputs(next);
    setDelivered(d);
    setBlocked(b);
    setStep((s) => s + 1);
    setLastMoves(moves);
  };

  const W = 540, H = 220;
  const inputX = 50, outputX = W - 50;
  const rowY = (i) => 36 + i * 42;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* output ports on the right */}
        {Array.from({ length: N }, (_, o) => {
          const wasServed = lastMoves.some((m) => m.to === o);
          return (
            <g key={`o-${o}`}>
              <rect x={outputX - 22} y={rowY(o) - 11} width="44" height="22"
                fill={wasServed ? "color-mix(in oklch, oklch(0.62 0.15 145) 18%, var(--bg-card))" : "var(--bg-card)"}
                stroke={wasServed ? "oklch(0.62 0.15 145)" : "var(--line-strong)"}
                strokeWidth="1" rx="3" />
              <text x={outputX} y={rowY(o) + 3} textAnchor="middle"
                fontSize="10" fontFamily="var(--font-mono)" fontWeight="700"
                fill={wasServed ? "oklch(0.62 0.15 145)" : "var(--text-muted)"}>
                out{o}
              </text>
            </g>
          );
        })}

        {/* inputs (queues) on the left */}
        {inputs.map((q, i) => {
          const y = rowY(i);
          if (voq) {
            // Per-output sub-queues
            return (
              <g key={`i-${i}`}>
                <text x={inputX - 14} y={y + 3} textAnchor="end"
                  fontSize="10" fontFamily="var(--font-mono)" fontWeight="700"
                  fill="var(--text)">in{i}</text>
                {Array.from({ length: N }, (_, o) => {
                  const bin = q.filter((p) => p.to === o);
                  const bx = inputX + 8 + o * 86;
                  return (
                    <g key={`voq-${i}-${o}`}>
                      <rect x={bx} y={y - 11} width="78" height="22"
                        fill="var(--bg-card)" stroke="var(--line-strong)"
                        strokeWidth="0.7" rx="3" />
                      <text x={bx + 4} y={y - 13} fontSize="7"
                        fontFamily="var(--font-mono)" fill="var(--text-faint)">
                        →{o}
                      </text>
                      {bin.slice(0, 4).map((p, k) => (
                        <g key={`p-${i}-${o}-${k}`}>
                          <circle cx={bx + 10 + k * 15} cy={y} r="6"
                            fill="var(--accent)" />
                          <text x={bx + 10 + k * 15} y={y + 2.5}
                            textAnchor="middle" fontSize="8"
                            fontFamily="var(--font-mono)" fontWeight="700"
                            fill="white">{p.id}</text>
                        </g>
                      ))}
                    </g>
                  );
                })}
              </g>
            );
          }
          // FIFO: single queue
          return (
            <g key={`i-${i}`}>
              <text x={inputX - 14} y={y + 3} textAnchor="end"
                fontSize="10" fontFamily="var(--font-mono)" fontWeight="700"
                fill="var(--text)">in{i}</text>
              <rect x={inputX} y={y - 11} width="380" height="22"
                fill="var(--bg-card)" stroke="var(--line-strong)"
                strokeWidth="0.7" rx="3" />
              {q.slice(0, 8).map((p, k) => {
                const isHead = k === 0;
                const isBlocked = isHead && lastMoves.length > 0
                  && !lastMoves.some((m) => m.from === i)
                  && step > 0;
                return (
                  <g key={`p-${i}-${k}`}>
                    <circle cx={inputX + 18 + k * 45} cy={y} r="9"
                      fill={isHead ? (isBlocked ? "oklch(0.60 0.18 25)" : "var(--accent)") : "color-mix(in oklch, var(--accent) 70%, var(--bg-card))"}
                      stroke={isHead ? "var(--text)" : "none"} strokeWidth="0.4" />
                    <text x={inputX + 18 + k * 45} y={y + 3}
                      textAnchor="middle" fontSize="10"
                      fontFamily="var(--font-mono)" fontWeight="700"
                      fill="white">{p.id}</text>
                    <text x={inputX + 18 + k * 45} y={y + 22}
                      textAnchor="middle" fontSize="8"
                      fontFamily="var(--font-mono)" fill="var(--text-faint)">
                      →{p.to}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* arrows for last moves */}
        {lastMoves.map((m, k) => (
          <line key={`mv-${k}`}
            x1={voq ? inputX + 8 + m.to * 86 + 40 : inputX + 18}
            y1={rowY(m.from)}
            x2={outputX - 24} y2={rowY(m.to)}
            stroke="oklch(0.62 0.15 145)" strokeWidth="1.5"
            opacity="0.85" markerEnd="url(#hv-arrow)" />
        ))}

        <defs>
          <marker id="hv-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 z" fill="oklch(0.62 0.15 145)" />
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
        fontSize: 12 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text)" }}>
          <input type="checkbox" checked={voq} onChange={(e) => reset(e.target.checked)} />
          <span>VOQ (virtual output queueing)</span>
        </label>
        <button className="btn" onClick={advance}>krok →</button>
        <button className="btn ghost" onClick={() => reset(voq)}>reset</button>
        <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>
          cyklus <strong style={{ color: "var(--text)" }}>{step}</strong>
          {" · "}doručeno <strong style={{ color: "oklch(0.62 0.15 145)" }}>{delivered}</strong>
          {" · "}blokováno <strong style={{ color: "oklch(0.60 0.18 25)" }}>{blocked}</strong>
        </span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        {voq ? (
          <span>
            <strong style={{ color: "oklch(0.62 0.15 145)" }}>VOQ</strong>: každý vstup má samostatnou
            frontu pro každý výstup. Scheduler vidí všechny VOQ a páruje 1 ku 1 — žádný HoL.
          </span>
        ) : (
          <span>
            <strong style={{ color: "oklch(0.60 0.18 25)" }}>Bez VOQ</strong>: FIFO. Když více vstupů
            míří na stejný výstup, jen jeden projde; čela ostatních front čekají — i když paket
            <em> za ním </em>by mohl jít na volný výstup. Teoretický limit propustnosti ≈ 58,6 %.
          </span>
        )}
      </div>
    </div>
  );
}
