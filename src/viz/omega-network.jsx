// Omega network (multistage) — interaktivní self-routing.
// p=8 procesorů, log p = 3 stupně 2×2 přepínačů, perfect-shuffle mezi stupni.
// Vyber zdroj a cíl; cesta se vykreslí podle bitů cíle (self-routing).
// Ověřeno: P_0 → M_5 = 101 → cesta přes switche s nastavením podle bitů 1,0,1.
import { useState, useMemo } from "react";

const P = 8;
const Q = 3; // log2(P)

const W_SVG = 580;
const H_SVG = 340;
const ROW_Y0 = 60;
const ROW_DY = 30;
const rowY = (i) => ROW_Y0 + i * ROW_DY;

const STAGE_X = [150, 280, 410];
const PROC_X = 50;
const MEM_X = 490;
const SWITCH_W = 36;

const switchLeft = (k) => STAGE_X[k] - SWITCH_W / 2;
const switchRight = (k) => STAGE_X[k] + SWITCH_W / 2;

function perfectShuffle(i) {
  return ((i << 1) | (i >> (Q - 1))) & (P - 1);
}

// At stage k, the destination bit (Q-1-k) determines which output of the 2x2 switch.
// outRow = 2 * switchIdx + bit (top output if bit=0, bottom if bit=1).
function computeRoute(src, dest) {
  const path = [];
  let row = src;
  for (let stage = 0; stage < Q; stage++) {
    const switchIdx = Math.floor(row / 2);
    const bit = (dest >> (Q - 1 - stage)) & 1;
    const outRow = 2 * switchIdx + bit;
    const inIsTop = row % 2 === 0;
    const outIsTop = bit === 0;
    const switchSetting = inIsTop === outIsTop ? "straight" : "cross";
    const shuffleTo = stage < Q - 1 ? perfectShuffle(outRow) : null;
    path.push({ stage, inRow: row, outRow, switchIdx, bit, switchSetting, shuffleTo });
    row = shuffleTo !== null ? shuffleTo : outRow;
  }
  return path;
}

export default function OmegaNetwork() {
  const [src, setSrc] = useState(0);
  const [dest, setDest] = useState(5);
  const [step, setStep] = useState(Q);

  const path = useMemo(() => computeRoute(src, dest), [src, dest]);
  const finalRow = path[Q - 1].outRow;
  const verified = finalRow === dest;

  // Reset step on src/dest change
  useMemo(() => { setStep(Q); return null; }, [src, dest]);

  // Destination bits, MSB first
  const destBits = Array.from({ length: Q }, (_, k) => (dest >> (Q - 1 - k)) & 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Controls */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>zdroj:</span>
        <select value={src} onChange={(e) => setSrc(+e.target.value)} style={selectStyle}>
          {Array.from({ length: P }, (_, i) => <option key={i} value={i}>P_{i}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>cíl:</span>
        <select value={dest} onChange={(e) => setDest(+e.target.value)} style={selectStyle}>
          {Array.from({ length: P }, (_, i) => <option key={i} value={i}>M_{i}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>cíl binárně:</span>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, display: "flex", gap: 2 }}>
          {destBits.map((b, k) => (
            <span key={k} style={{
              padding: "0 4px",
              background: step >= k + 1 && step <= Q ? "oklch(0.62 0.14 252 / 0.3)" : "transparent",
              color: step >= k + 1 ? "var(--accent)" : "var(--text)",
              borderRadius: 2,
            }}>
              {b}
            </span>
          ))}
        </span>
      </div>

      {/* Step nav */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          fáze {step} / {Q}
        </div>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Math.min(Q, step + 1))} disabled={step >= Q}>další →</button>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(Q)}>⏭</button>
        <button className="btn ghost" style={navBtn} onClick={() => setStep(0)}>↻</button>
      </div>

      <svg viewBox={`0 0 ${W_SVG} ${H_SVG}`} style={{ width: "100%", maxWidth: W_SVG }}>
        <rect width={W_SVG} height={H_SVG} fill="var(--bg-inset)" />

        <text x={W_SVG / 2} y={26} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
          Omega network (p={P}, {Q} stupně)
        </text>
        <text x={W_SVG / 2} y={42} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          self-routing: stupeň k používá bit (Q−1−k) cíle pro nastavení switche
        </text>

        {/* Stage labels */}
        {STAGE_X.map((x, k) => (
          <g key={`sl-${k}`}>
            <text x={x} y={rowY(7) + 26} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill={step >= k + 1 ? "var(--accent)" : "var(--text-faint)"}>
              stupeň {k + 1}
            </text>
            <text x={x} y={rowY(7) + 40} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              bit {Q - 1 - k}
            </text>
          </g>
        ))}

        {/* Processor labels + indicator */}
        {Array.from({ length: P }, (_, i) => {
          const isSrc = i === src;
          return (
            <g key={`p-${i}`}>
              <text x={PROC_X - 4} y={rowY(i) + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fontWeight={isSrc ? 700 : 400}
                    fill={isSrc ? "oklch(0.55 0.18 22)" : "var(--text-muted)"}>
                P_{i}
              </text>
              {isSrc && (
                <circle cx={PROC_X + 8} cy={rowY(i)} r="5" fill="oklch(0.55 0.18 22)" />
              )}
            </g>
          );
        })}

        {/* Memory labels + indicator */}
        {Array.from({ length: P }, (_, i) => {
          const isDest = i === dest;
          const isReached = step === Q && i === finalRow;
          return (
            <g key={`m-${i}`}>
              <text x={MEM_X + 8} y={rowY(i) + 4} fontSize="11" fontFamily="var(--font-mono)" fontWeight={isDest ? 700 : 400}
                    fill={isReached ? "oklch(0.55 0.18 142)" : isDest ? "oklch(0.55 0.18 142)" : "var(--text-muted)"}>
                M_{i}
              </text>
              {isDest && (
                <circle cx={MEM_X - 8} cy={rowY(i)} r="5" fill={isReached ? "oklch(0.55 0.18 142)" : "oklch(0.55 0.18 142 / 0.4)"}
                        stroke="oklch(0.55 0.18 142)" strokeWidth="1" />
              )}
            </g>
          );
        })}

        {/* Wires from procs to stage 0 (uses input row = i for P_i) */}
        {Array.from({ length: P }, (_, i) => {
          const onPath = i === src && step >= 1;
          return (
            <line key={`wp-${i}`} x1={PROC_X + 14} y1={rowY(i)} x2={switchLeft(0)} y2={rowY(i)}
                  stroke={onPath ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={onPath ? 2.4 : 0.7} opacity={onPath ? 1 : 0.55} />
          );
        })}

        {/* Shuffle wires between stages 0→1 and 1→2 */}
        {[0, 1].map((k) => {
          return Array.from({ length: P }, (_, r) => {
            const targetRow = perfectShuffle(r);
            // This wire is on the path if at stage k we exited at row r
            const onPath = step >= k + 2 && path[k].outRow === r;
            return (
              <line key={`sh-${k}-${r}`} x1={switchRight(k)} y1={rowY(r)} x2={switchLeft(k + 1)} y2={rowY(targetRow)}
                    stroke={onPath ? "var(--accent)" : "var(--line-strong)"}
                    strokeWidth={onPath ? 2.4 : 0.6} opacity={onPath ? 1 : 0.45} />
            );
          });
        })}

        {/* Wires from stage Q-1 to memory */}
        {Array.from({ length: P }, (_, r) => {
          const onPath = step >= Q && path[Q - 1].outRow === r;
          return (
            <line key={`wm-${r}`} x1={switchRight(Q - 1)} y1={rowY(r)} x2={MEM_X - 14} y2={rowY(r)}
                  stroke={onPath ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={onPath ? 2.4 : 0.7} opacity={onPath ? 1 : 0.55} />
          );
        })}

        {/* Switches */}
        {[0, 1, 2].map((k) => {
          return [0, 1, 2, 3].map((s) => {
            const onPath = step >= k + 1 && path[k].switchIdx === s;
            const setting = onPath ? path[k].switchSetting : null;
            const xL = switchLeft(k);
            const xR = switchRight(k);
            const yTop = rowY(2 * s);
            const yBot = rowY(2 * s + 1);
            const boxYtop = yTop - 6;
            const boxYbot = yBot + 6;
            return (
              <g key={`sw-${k}-${s}`}>
                <rect x={xL} y={boxYtop} width={SWITCH_W} height={boxYbot - boxYtop} rx={3}
                      fill={onPath ? "oklch(0.62 0.14 252 / 0.18)" : "var(--bg-card)"}
                      stroke={onPath ? "var(--accent)" : "var(--line-strong)"} strokeWidth="0.9" />

                {/* Internal switch wiring - only visible for on-path switches */}
                {onPath && setting === "straight" && (
                  <>
                    {/* Top in → top out */}
                    <line x1={xL} y1={yTop} x2={xR} y2={yTop}
                          stroke={path[k].inRow === 2 * s ? "var(--accent)" : "var(--text-faint)"}
                          strokeWidth={path[k].inRow === 2 * s ? 2.4 : 1} opacity={path[k].inRow === 2 * s ? 1 : 0.4} />
                    {/* Bottom in → bottom out */}
                    <line x1={xL} y1={yBot} x2={xR} y2={yBot}
                          stroke={path[k].inRow === 2 * s + 1 ? "var(--accent)" : "var(--text-faint)"}
                          strokeWidth={path[k].inRow === 2 * s + 1 ? 2.4 : 1} opacity={path[k].inRow === 2 * s + 1 ? 1 : 0.4} />
                  </>
                )}
                {onPath && setting === "cross" && (
                  <>
                    {/* Top in → bottom out */}
                    <line x1={xL} y1={yTop} x2={xR} y2={yBot}
                          stroke={path[k].inRow === 2 * s ? "var(--accent)" : "var(--text-faint)"}
                          strokeWidth={path[k].inRow === 2 * s ? 2.4 : 1} opacity={path[k].inRow === 2 * s ? 1 : 0.4} />
                    {/* Bottom in → top out */}
                    <line x1={xL} y1={yBot} x2={xR} y2={yTop}
                          stroke={path[k].inRow === 2 * s + 1 ? "var(--accent)" : "var(--text-faint)"}
                          strokeWidth={path[k].inRow === 2 * s + 1 ? 2.4 : 1} opacity={path[k].inRow === 2 * s + 1 ? 1 : 0.4} />
                  </>
                )}

                {/* Bit label on switch when on path */}
                {onPath && (
                  <text x={STAGE_X[k]} y={boxYtop - 3} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
                        fill="var(--accent)">
                    bit={path[k].bit}
                  </text>
                )}
              </g>
            );
          });
        })}
      </svg>

      {/* Per-stage description */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        {step === 0 && (
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Vyber zdroj P_{src} a cíl M_{dest} (binárně <code style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>{dest.toString(2).padStart(Q, "0")}</code>). Pak klikni „další" pro postupné průchody stupni.
          </div>
        )}
        {step > 0 && step <= Q && (() => {
          const p = path[step - 1];
          const bitName = `bit ${Q - step}`;
          return (
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
              <b style={{ color: "var(--text)" }}>Stupeň {step}</b>: použij {bitName} cíle = <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>{p.bit}</code>.
              Vstup ve řádku {p.inRow} (switch S{p.switchIdx}), výstup ve řádku {p.outRow}.
              Switch nastaven na <b style={{ color: "var(--accent)" }}>{p.switchSetting === "straight" ? "přímý průchod" : "křížení"}</b>.
              {p.shuffleTo !== null && (
                <> Pak perfect shuffle: řádek {p.outRow} → {p.shuffleTo}.</>
              )}
            </div>
          );
        })()}
        {step === Q && verified && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: "oklch(0.55 0.18 142)", fontFamily: "var(--font-mono)" }}>
            ✓ ověřeno: cesta z P_{src} doručena do M_{dest} po {Q} stupních.
          </div>
        )}
      </div>

      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        Omega: <b style={{ color: "var(--text)" }}>(p log p)/2 = 12</b> přepínačů ve <b style={{ color: "var(--text)" }}>log p = 3</b> stupních.
        Cena <b style={{ color: "var(--text)" }}>Θ(p log p)</b> — mezi sběrnicí (Θ(p)) a crossbarem (Θ(p²)). Blokující — pokud dvě cesty chtějí stejný výstup switche, jedna musí čekat.
      </div>
    </div>
  );
}

const selectStyle = {
  padding: "3px 6px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 3,
  color: "var(--text)",
};
const navBtn = {
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
};
