// Sponge construction (SHA-3 / Keccak) — absorbing + squeezing.
// Stav: r-bit rate + c-bit capacity. Vstup XORován do rate části, pak permutace f.
// Squeezing: extrahuj rate, permutace f, opakuj.
import { useMemo, useState } from "react";

// Toy permutace: stav 8 bytes (64 bits), rate = 4 bytes (32 b), capacity = 4 bytes (32 b)
const STATE_BYTES = 8;
const RATE_BYTES = 4;

function permute(state) {
  // pseudo-Keccak permutace pro pedagogiku
  const out = [...state];
  for (let i = 0; i < STATE_BYTES; i++) {
    const next = (i + 3) % STATE_BYTES;
    out[i] = ((out[i] + state[next] * 17) ^ ((state[i] << 3) | (state[i] >>> 5))) & 0xFF;
  }
  for (let i = 0; i < STATE_BYTES; i++) {
    out[i] = (out[i] ^ out[(i + 5) % STATE_BYTES]) & 0xFF;
  }
  return out;
}

function spongeHash(msg, outputBytes) {
  // padding: append 0x06, fill, 0x80 (Keccak-like multi-rate)
  const padded = [...msg, 0x06];
  while (padded.length % RATE_BYTES !== 0) padded.push(0);
  padded[padded.length - 1] |= 0x80;

  let state = new Array(STATE_BYTES).fill(0);
  const trace = [{ state: [...state], label: "init", phase: "init" }];

  // Absorbing
  for (let i = 0; i < padded.length; i += RATE_BYTES) {
    const block = padded.slice(i, i + RATE_BYTES);
    for (let j = 0; j < RATE_BYTES; j++) state[j] ^= block[j];
    trace.push({ state: [...state], label: `absorb ${i / RATE_BYTES + 1}`, phase: "absorb", block });
    state = permute(state);
    trace.push({ state: [...state], label: `f`, phase: "absorb-f" });
  }

  // Squeezing
  const output = [];
  while (output.length < outputBytes) {
    for (let j = 0; j < RATE_BYTES && output.length < outputBytes; j++) {
      output.push(state[j]);
    }
    trace.push({ state: [...state], label: `squeeze`, phase: "squeeze" });
    if (output.length < outputBytes) {
      state = permute(state);
      trace.push({ state: [...state], label: `f`, phase: "squeeze-f" });
    }
  }

  return { output, trace };
}

function hex(b) { return b.toString(16).padStart(2, "0").toUpperCase(); }

export default function Sponge() {
  const [message, setMessage] = useState("HELLO");
  const [outputBytes, setOutputBytes] = useState(8);

  const msgBytes = useMemo(() => message.split("").map((c) => c.charCodeAt(0)), [message]);
  const { output, trace } = useMemo(() => spongeHash(msgBytes, outputBytes), [msgBytes, outputBytes]);

  const W = 540;
  const cellW = 28;
  const stateRowH = 38;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Zpráva:</label>
        <input value={message} onChange={(e) => setMessage(e.target.value.slice(0, 12))} style={inp} maxLength={12} />
        <label style={lbl}>výstupní bytů: {outputBytes}</label>
        <input type="range" className="viz-slider" min={4} max={16} step={1} value={outputBytes} onChange={(e) => setOutputBytes(+e.target.value)} style={{ flex: 1 }} />
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Stav 8 bytů: prvních {RATE_BYTES} = <span style={{ color: "var(--accent)" }}>rate</span> (zde se vstup XORuje a výstup čte),
        zbylých {STATE_BYTES - RATE_BYTES} = <span style={{ color: "#81b29a" }}>capacity</span> (nikdy se přímo nedotýká vstupu/výstupu — kde sídlí bezpečnost).
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, maxHeight: 320, overflowY: "auto" }}>
        {trace.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ minWidth: 70, fontSize: 10, color: t.phase.startsWith("absorb") ? "var(--accent)" : t.phase.startsWith("squeeze") ? "#81b29a" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {t.label}
            </div>
            {t.state.map((b, j) => (
              <div key={j} style={{
                width: cellW, height: 22, lineHeight: "22px", textAlign: "center",
                background: j < RATE_BYTES ? "rgba(81,131,219,0.15)" : "rgba(129,178,154,0.15)",
                border: t.block && j < RATE_BYTES ? "1px solid var(--accent)" : "1px solid var(--line)",
                borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)",
              }}>
                {hex(b)}
              </div>
            ))}
            {t.block && (
              <div style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                ⊕ blok: [{t.block.map(hex).join(",")}]
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--text)", background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)" }}>
        výstup = <span style={{ color: "var(--accent)" }}>0x{output.map(hex).join("")}</span>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Sponge construction nemá "konečný stav" v MD smyslu. Po posledním absorb permutace přejde do squeeze fáze;
        capacity (~256 b u SHA3-256) zůstává neviditelná — proto <b>žádný length-extension útok</b>.
        Variabilní výstup: SHAKE128 / SHAKE256 můžou dát libovolně dlouhý výstup pokračováním squeeze.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const inp = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 100 };
