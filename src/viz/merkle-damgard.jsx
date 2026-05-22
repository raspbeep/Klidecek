// Merkle-Damgård konstrukce + length-extension attack.
// Animace iterace h_i = f(h_{i-1}, M_i); pak útok pokračuje od h_L novými bloky.
import { useMemo, useState } from "react";

// Toy 8-bit kompresní funkce f(h, m) = (h * 31 + m * 17 + 0x9C) mod 256 ⊕ rotate
function compress(h, m) {
  let r = ((h * 31 + m * 17 + 0x9C) ^ ((h << 3) | (h >>> 5))) & 0xFF;
  r ^= ((m << 5) | (m >>> 3)) & 0xFF;
  return r;
}
function pad(msg, totalLenBits) {
  // simplistic: append 0x80, fill zeros, append 8-bit length (modulo 256)
  const out = [...msg, 0x80];
  while (out.length % 4 !== 3) out.push(0);
  out.push(totalLenBits & 0xFF);
  return out;
}
function hash(msg) {
  const IV = 0x42;
  const padded = pad(msg, msg.length * 8);
  let h = IV;
  const trace = [{ h, m: null }];
  for (const m of padded) {
    h = compress(h, m);
    trace.push({ h, m });
  }
  return { hash: h, trace, padded };
}

function hex(b) { return b.toString(16).padStart(2, "0").toUpperCase(); }

export default function MerkleDamgard() {
  const [showAttack, setShowAttack] = useState(false);

  // Scénář: MAC = hash(K || M)
  const K = useMemo(() => [0xC0, 0xDE, 0xC0], []);
  const M = useMemo(() => [0x4D, 0x53, 0x47], []); // "MSG"
  const Mextend = useMemo(() => [0x42, 0x41, 0x44], []); // "BAD"

  // Útočník zná hash(K || M) a |K|+|M|, nezná K.
  const legitMac = useMemo(() => hash([...K, ...M]), [K, M]);

  // Forged MAC: pokračuj v iteraci s padding (K||M) a poté přidej Mextend.
  // Útočník musí emulovat: state = legitMac.hash; pak iteruje přes [padding_of_K||M, Mextend, padding_of_total]
  const forgedMessage = useMemo(() => {
    const KM = [...K, ...M];
    const padKM = pad(KM, KM.length * 8).slice(KM.length); // jen padding, ne data
    return [...M, ...padKM, ...Mextend]; // pohled útočníka: ví o M a padKM a Mextend; K předpokládá
  }, [K, M, Mextend]);

  const forgedFullMsg = useMemo(() => [...K, ...forgedMessage], [K, forgedMessage]);
  const forgedMacFromServer = useMemo(() => hash(forgedFullMsg), [forgedFullMsg]);

  // Útok: simulujeme stav h = legitMac.hash a pokračujeme iterací bez znalosti K
  const attackTrace = useMemo(() => {
    let h = legitMac.hash;
    const padTotal = pad([...K, ...M, ...Mextend], (K.length + M.length + Mextend.length) * 8);
    // části za |K|+|M|: padding of K||M + Mextend + length-of-total
    const continuation = padTotal.slice(K.length + M.length);
    const trace = [{ h, m: null, label: "start (uznané hash(K||M))" }];
    for (const m of continuation) {
      h = compress(h, m);
      trace.push({ h, m, label: null });
    }
    return { trace, finalHash: h };
  }, [K, M, Mextend, legitMac.hash]);

  const matches = attackTrace.finalHash === forgedMacFromServer.hash;

  return (
    <div style={ctn}>
      <div style={row}>
        <button onClick={() => setShowAttack(false)} style={{ ...btn, background: !showAttack ? "var(--accent)" : "var(--bg-inset)", color: !showAttack ? "var(--bg-card)" : "var(--text)" }}>
          1. Normální MAC = hash(K∥M)
        </button>
        <button onClick={() => setShowAttack(true)} style={{ ...btn, background: showAttack ? "var(--accent)" : "var(--bg-inset)", color: showAttack ? "var(--bg-card)" : "var(--text)" }}>
          2. Length-extension útok
        </button>
      </div>

      {!showAttack ? (
        <>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Iterace přes padded(K ∥ M). IV = 0x42. h_i = f(h_{"{i-1}"}, M_i).
          </div>
          <div style={chainBox}>
            {legitMac.trace.map((t, i) => (
              <div key={i} style={chainStep}>
                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{i === 0 ? "IV" : `f${i}`}</div>
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--text)", fontSize: 11 }}>{hex(t.h)}</div>
                {t.m !== null && <div style={{ fontSize: 9, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>m={hex(t.m)}</div>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#81b29a", fontFamily: "var(--font-mono)" }}>
            MAC = hash(K∥M) = <b>0x{hex(legitMac.hash)}</b>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Útočník odposlechne (M, MAC) ale nezná K. Stačí mu však MAC a |K|+|M| pro útok →
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Útočník inicializuje stav h = 0x{hex(legitMac.hash)} (legitimní MAC) a <b>pokračuje</b> iterací:
            přidá padding K∥M, pak Mextend = "BAD", pak finální length padding. Bez znalosti K!
          </div>
          <div style={chainBox}>
            {attackTrace.trace.map((t, i) => (
              <div key={i} style={chainStep}>
                <div style={{ fontSize: 9, color: i === 0 ? "var(--accent)" : "var(--text-muted)" }}>
                  {i === 0 ? "start" : `f`}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", color: i === 0 ? "var(--accent)" : "var(--text)", fontSize: 11 }}>{hex(t.h)}</div>
                {t.m !== null && <div style={{ fontSize: 9, color: "#e07a5f", fontFamily: "var(--font-mono)" }}>m={hex(t.m)}</div>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>
            <div style={{ color: "#e07a5f" }}>Falešný MAC = <b>0x{hex(attackTrace.finalHash)}</b></div>
            <div style={{ color: "var(--text-muted)" }}>Server by spočítal hash(K ∥ M ∥ padding ∥ Mextend) = <b>0x{hex(forgedMacFromServer.hash)}</b></div>
            <div style={{ color: matches ? "#81b29a" : "#e07a5f", marginTop: 4 }}>
              {matches ? "✓ Útočník vyrobil platný MAC bez znalosti K!" : "✗ neshoda"}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            <b>Obrana:</b> HMAC vnořuje vnitřní hash do vnějšího → finální stav nelze "pokračovat".
            Také SHA-3 (sponge) má vnitřní stav větší než výstup → length-ext nepostihuje.
          </div>
        </>
      )}
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const btn = { padding: "5px 12px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 11, cursor: "pointer" };
const chainBox = { display: "flex", gap: 4, flexWrap: "wrap", background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const chainStep = { padding: "4px 6px", background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 4, textAlign: "center", minWidth: 36 };
