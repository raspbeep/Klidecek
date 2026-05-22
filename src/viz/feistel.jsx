// Feistelova síť — krok po kroku.
// Blok 16 bitů (L=8b, R=8b), 4 kola s jednoduchou F(R, K) = (R+K) ⊕ rot(R).
// Toggle E/D: dešifrování má identickou strukturu, jen klíče v opačném pořadí.
import { useMemo, useState } from "react";

const ROUNDS = 4;
const W_BITS = 8;
const MASK = (1 << W_BITS) - 1;

const SUBKEYS = [0x3A, 0x71, 0xC2, 0x5E];

function rotL(x, n) { return ((x << n) | (x >>> (W_BITS - n))) & MASK; }
function F(R, K) { return ((R + K) ^ rotL(R, 3)) & MASK; }

function feistelEncrypt(L0, R0) {
  const states = [{ L: L0, R: R0, K: null }];
  let L = L0, R = R0;
  for (let i = 0; i < ROUNDS; i++) {
    const K = SUBKEYS[i];
    const newR = L ^ F(R, K);
    const newL = R;
    states.push({ L: newL, R: newR, K });
    L = newL; R = newR;
  }
  return states;
}

function feistelDecrypt(L0, R0) {
  const states = [{ L: L0, R: R0, K: null }];
  let L = L0, R = R0;
  for (let i = ROUNDS - 1; i >= 0; i--) {
    const K = SUBKEYS[i];
    // reverse: L_i = R_{i+1}, R_i = L_{i+1} ⊕ F(R_{i+1}, K_i)
    const newL = R ^ F(L, K);
    const newR = L;
    states.push({ L: newL, R: newR, K });
    L = newL; R = newR;
  }
  return states;
}

function bin(x) { return x.toString(2).padStart(W_BITS, "0"); }
function hex(x) { return x.toString(16).padStart(2, "0").toUpperCase(); }

export default function Feistel() {
  const [L0, setL0] = useState(0xA3);
  const [R0, setR0] = useState(0x5C);
  const [mode, setMode] = useState("encrypt");

  const states = useMemo(() => {
    if (mode === "encrypt") return feistelEncrypt(L0, R0);
    return feistelDecrypt(L0, R0);
  }, [L0, R0, mode]);

  const final = states[states.length - 1];
  const rev = mode === "encrypt" ? feistelDecrypt(final.L, final.R) : feistelEncrypt(final.L, final.R);
  const roundTripOk = rev[rev.length - 1].L === L0 && rev[rev.length - 1].R === R0;

  const ROW_H = 56;
  const W = 540, H = 40 + (ROUNDS + 1) * ROW_H + 40;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>Mód:</label>
        <button onClick={() => setMode("encrypt")} style={{ ...btn, background: mode === "encrypt" ? "var(--accent)" : "var(--bg-inset)", color: mode === "encrypt" ? "var(--bg-card)" : "var(--text)" }}>Šifrování</button>
        <button onClick={() => setMode("decrypt")} style={{ ...btn, background: mode === "decrypt" ? "var(--accent)" : "var(--bg-inset)", color: mode === "decrypt" ? "var(--bg-card)" : "var(--text)" }}>Dešifrování</button>
        <label style={lbl}>L₀:</label>
        <input type="number" min={0} max={255} value={L0} onChange={(e) => setL0(+e.target.value & MASK)} style={{ ...num, width: 60 }} />
        <label style={lbl}>R₀:</label>
        <input type="number" min={0} max={255} value={R0} onChange={(e) => setR0(+e.target.value & MASK)} style={{ ...num, width: 60 }} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 620 }}>
        <text x={130} y={20} textAnchor="middle" fontSize="12" fill="var(--text-muted)">L (8 b)</text>
        <text x={310} y={20} textAnchor="middle" fontSize="12" fill="var(--text-muted)">R (8 b)</text>
        <text x={460} y={20} textAnchor="middle" fontSize="12" fill="var(--text-muted)">K</text>

        {states.map((s, i) => {
          const y = 40 + i * ROW_H;
          const isInput = i === 0;
          const next = states[i + 1];
          const subkeyIdx = mode === "encrypt" ? i : ROUNDS - 1 - i;
          return (
            <g key={i}>
              <rect x={70} y={y - 12} width={120} height={24} rx={4} fill="var(--bg-inset)" stroke="var(--line-strong)" />
              <text x={130} y={y + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--text)">{hex(s.L)} ({bin(s.L)})</text>
              <rect x={250} y={y - 12} width={120} height={24} rx={4} fill="var(--bg-inset)" stroke="var(--line-strong)" />
              <text x={310} y={y + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--text)">{hex(s.R)} ({bin(s.R)})</text>

              {next && (
                <>
                  {/* F-box symbol */}
                  <rect x={430} y={y + ROW_H / 2 - 10} width={60} height={20} rx={4} fill="var(--accent)" opacity="0.18" stroke="var(--accent)" />
                  <text x={460} y={y + ROW_H / 2 + 5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--accent)">F(R, K{subkeyIdx + 1})</text>

                  {/* Subkey */}
                  <text x={460} y={y + ROW_H / 2 - 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--accent)">
                    K{subkeyIdx + 1}=0x{hex(SUBKEYS[subkeyIdx])}
                  </text>

                  {/* arrows: L→swap to R, R→F→XOR L→new L */}
                  <path d={`M130,${y + 12} Q200,${y + ROW_H / 2} 310,${y + ROW_H - 12}`} stroke="var(--text-muted)" fill="none" strokeWidth="1" markerEnd="url(#aFei)" />
                  <path d={`M310,${y + 12} L370,${y + 12} L370,${y + ROW_H / 2} L430,${y + ROW_H / 2}`} stroke="var(--text-muted)" fill="none" strokeWidth="1" />
                  <path d={`M430,${y + ROW_H / 2} L370,${y + ROW_H / 2} L370,${y + ROW_H - 12} L190,${y + ROW_H - 12}`} stroke="var(--accent)" fill="none" strokeWidth="1.2" markerEnd="url(#aFei)" />
                  <text x={200} y={y + ROW_H - 16} fontSize="10" fill="var(--accent)" fontFamily="var(--font-mono)">⊕</text>
                </>
              )}
              {isInput && <text x={45} y={y + 4} fontSize="10" fill="var(--text-muted)" textAnchor="end">vstup</text>}
              {i === ROUNDS && <text x={45} y={y + 4} fontSize="10" fill="var(--accent)" textAnchor="end">výstup</text>}
            </g>
          );
        })}

        <defs>
          <marker id="aFei" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--text-muted)" />
          </marker>
        </defs>
      </svg>

      <div style={{ fontSize: 12, color: "var(--text)", background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        Vstup: <b style={{ fontFamily: "var(--font-mono)" }}>{hex(L0)}{hex(R0)}</b>{" → "}
        Výstup: <b style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{hex(final.L)}{hex(final.R)}</b>
        <br />
        {mode === "encrypt" ? "Dešifrování s opačným pořadím klíčů" : "Šifrování s opačným pořadím klíčů"} →{" "}
        <b style={{ color: roundTripOk ? "#81b29a" : "#e07a5f" }}>{roundTripOk ? "OK, obnovili jsme původní vstup" : "FAIL"}</b>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Klíčová vlastnost: F nemusí být invertibilní! Dešifrování použije <i>stejný</i> obvod, jen subklíče {SUBKEYS.map((k, i) => `K${ROUNDS - i}`).join(", ")} místo K1, K2, …. Proto byla Feistel populární v 70. letech (méně hardware).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 12, color: "var(--text-muted)" };
const btn = { padding: "4px 10px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 11, cursor: "pointer" };
const num = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)" };
