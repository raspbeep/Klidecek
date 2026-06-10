// HMAC = H((K ⊕ opad) ∥ H((K ⊕ ipad) ∥ M))
// Animace dvou vnořených volání hashe; ukazuje, proč length-extension neprochází.
import { useMemo, useState } from "react";

const IPAD = 0x36;
const OPAD = 0x5C;
const BLOCK = 8; // toy blok 8 bajtů místo 64

// Toy hash 16-bit
function toyHash(bytes) {
  let h = 0x1234;
  for (const b of bytes) {
    h = ((h << 5) ^ b ^ (h >>> 11)) & 0xFFFF;
    h = (h * 31 + 0x9C) & 0xFFFF;
  }
  return h;
}

function preparedKey(k) {
  if (k.length > BLOCK) {
    // K' = hash(K), padded to block
    const h = toyHash(k);
    return [h & 0xFF, (h >> 8) & 0xFF, ...new Array(BLOCK - 2).fill(0)];
  }
  return [...k, ...new Array(BLOCK - k.length).fill(0)];
}

function hex16(x) { return x.toString(16).padStart(4, "0").toUpperCase(); }
function hex8(x) { return x.toString(16).padStart(2, "0").toUpperCase(); }

export default function HmacStructure() {
  const [keyStr, setKeyStr] = useState("SECRET");
  const [msgStr, setMsgStr] = useState("hello");
  const [step, setStep] = useState(0);

  const K = useMemo(() => keyStr.split("").map((c) => c.charCodeAt(0)), [keyStr]);
  const M = useMemo(() => msgStr.split("").map((c) => c.charCodeAt(0)), [msgStr]);

  const Kprime = useMemo(() => preparedKey(K), [K]);
  const Kipad = useMemo(() => Kprime.map((b) => b ^ IPAD), [Kprime]);
  const Kopad = useMemo(() => Kprime.map((b) => b ^ OPAD), [Kprime]);

  const innerHash = useMemo(() => toyHash([...Kipad, ...M]), [Kipad, M]);
  const innerBytes = [innerHash & 0xFF, (innerHash >> 8) & 0xFF];
  const outerHash = useMemo(() => toyHash([...Kopad, ...innerBytes]), [Kopad, innerBytes]);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>Klíč K:</label>
        <input value={keyStr} onChange={(e) => setKeyStr(e.target.value.slice(0, 16))} style={inp} maxLength={16} />
        <label style={lbl}>Zpráva M:</label>
        <input value={msgStr} onChange={(e) => setMsgStr(e.target.value.slice(0, 16))} style={inp} maxLength={16} />
      </div>
      <div className="viz-controls">
        {[0, 1, 2, 3].map((s) => (
          <button key={s} className="viz-btn" data-active={step >= s} onClick={() => setStep(s)}>
            {s + 1}. {["pad klíč", "vnitřní hash", "vnější hash", "MAC"][s]}
          </button>
        ))}
      </div>

      {step >= 0 && (
        <div style={section}>
          <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 4 }}>1. Padding klíče na velikost bloku ({BLOCK} B):</div>
          <div style={mono}>
            K' = [{Kprime.map(hex8).join(" ")}]<br />
            K' ⊕ ipad ({hex8(IPAD)}…) = [<span style={{ color: "#81b29a" }}>{Kipad.map(hex8).join(" ")}</span>]<br />
            K' ⊕ opad ({hex8(OPAD)}…) = [<span style={{ color: "#e9c46a" }}>{Kopad.map(hex8).join(" ")}</span>]
          </div>
        </div>
      )}

      {step >= 1 && (
        <div style={section}>
          <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 4 }}>2. Vnitřní hash: H( K'⊕ipad ∥ M ):</div>
          <div style={mono}>
            vstup = [<span style={{ color: "#81b29a" }}>{Kipad.map(hex8).join(" ")}</span>] ∥ [{M.map(hex8).join(" ")}]<br />
            inner_h = H(...) = <b style={{ color: "var(--accent)" }}>0x{hex16(innerHash)}</b>
          </div>
        </div>
      )}

      {step >= 2 && (
        <div style={section}>
          <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 4 }}>3. Vnější hash: H( K'⊕opad ∥ inner_h ):</div>
          <div style={mono}>
            vstup = [<span style={{ color: "#e9c46a" }}>{Kopad.map(hex8).join(" ")}</span>] ∥ [{innerBytes.map(hex8).join(" ")}]<br />
            outer_h = H(...) = <b style={{ color: "var(--accent)" }}>0x{hex16(outerHash)}</b>
          </div>
        </div>
      )}

      {step >= 3 && (
        <div style={{ ...section, borderLeft: "3px solid var(--accent)" }}>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>
            HMAC<sub>K</sub>(M) = <b style={{ color: "var(--accent)" }}>0x{hex16(outerHash)}</b>
          </div>
        </div>
      )}

      <svg viewBox="0 0 540 140" style={{ width: "100%", maxWidth: 620 }}>
        <defs>
          <marker id="aHmacA" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
        {/* K, M boxes */}
        <rect x={20} y={40} width={80} height={28} rx={4} fill="var(--bg-inset)" stroke="#81b29a" />
        <text x={60} y={58} fontSize="11" fill="var(--text)" textAnchor="middle">K'⊕ipad ∥ M</text>
        {/* Inner H */}
        <rect x={170} y={40} width={50} height={28} rx={4} fill={step >= 1 ? "var(--accent)" : "var(--bg-inset)"} stroke="var(--accent)" />
        <text x={195} y={58} fontSize="11" fill={step >= 1 ? "var(--bg-card)" : "var(--text)"} textAnchor="middle">H</text>
        <line x1={100} y1={54} x2={170} y2={54} stroke="var(--text-muted)" markerEnd="url(#aHmacA)" />
        {/* K'⊕opad ∥ inner_h */}
        <rect x={260} y={40} width={120} height={28} rx={4} fill="var(--bg-inset)" stroke="#e9c46a" />
        <text x={320} y={58} fontSize="11" fill="var(--text)" textAnchor="middle">K'⊕opad ∥ inner</text>
        <line x1={220} y1={54} x2={260} y2={54} stroke="var(--text-muted)" markerEnd="url(#aHmacA)" />
        {/* Outer H */}
        <rect x={420} y={40} width={50} height={28} rx={4} fill={step >= 2 ? "var(--accent)" : "var(--bg-inset)"} stroke="var(--accent)" />
        <text x={445} y={58} fontSize="11" fill={step >= 2 ? "var(--bg-card)" : "var(--text)"} textAnchor="middle">H</text>
        <line x1={380} y1={54} x2={420} y2={54} stroke="var(--text-muted)" markerEnd="url(#aHmacA)" />
        {/* MAC */}
        <text x={500} y={58} fontSize="11" fill="var(--accent)" fontWeight="bold">MAC</text>
        <line x1={470} y1={54} x2={490} y2={54} stroke="var(--accent)" markerEnd="url(#aHmacA)" />

        <text x={270} y={120} fontSize="11" fill="var(--text-muted)" textAnchor="middle">
          Vnější hash zaobalí finální stav vnitřního → length-ext neprochází
        </text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Naivní MAC <code>H(K ∥ M)</code> padá pod length-extension (Merkle-Damgård).
        HMAC vnořením do druhého volání hashe blokuje útok — vnitřní finální stav je <i>vstup</i> druhého hashe,
        nikoli jeho výstup. Útočník bez znalosti K nedokáže pokračovat.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const inp = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 140 };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const mono = { fontFamily: "var(--font-mono)", color: "var(--text)", fontSize: 11, lineHeight: 1.6 };
