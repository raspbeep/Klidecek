// Two-time pad / OTP crib-dragging.
// 2 ciphertexty se stejným klíčem → C₁ ⊕ C₂ = M₁ ⊕ M₂.
// Slider posouvá hádaný "crib" přes C₁ ⊕ C₂; pokud se trefí, vyjde čitelný text z M₂.
import { useMemo, useState } from "react";

function toBytes(s) { return [...s].map((c) => c.charCodeAt(0)); }
function fromBytes(b) { return b.map((x) => String.fromCharCode(x)).join(""); }
function xorBytes(a, b) { return a.map((x, i) => x ^ (b[i] || 0)); }

const M1 = "THE ATTACK BEGINS AT MIDNIGHT - SEND REINFORCEMENTS";
const M2 = "WEATHER REPORT IS CLEAR FOR TOMORROW - PROCEED EAST";

// Stejný klíč (KGB-style mistake)
function genKey(len, seed = 42) {
  const key = [];
  let s = seed;
  for (let i = 0; i < len; i++) {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    key.push((s >>> 16) & 0xFF);
  }
  return key;
}

const KEY = genKey(Math.max(M1.length, M2.length));
const C1 = xorBytes(toBytes(M1), KEY);
const C2 = xorBytes(toBytes(M2), KEY);
const C1XorC2 = xorBytes(C1, C2);

export default function OtpCribDrag() {
  const [crib, setCrib] = useState("THE ATTACK");
  const [pos, setPos] = useState(0);

  const cribBytes = toBytes(crib);
  // If we hypothesize this crib is in M₁ at position `pos`, then M₂ at pos = (C₁⊕C₂)[pos..pos+len] ⊕ crib
  const recovered = useMemo(() => {
    const slice = C1XorC2.slice(pos, pos + cribBytes.length);
    return xorBytes(slice, cribBytes);
  }, [pos, cribBytes]);

  function isReadable(b) {
    return b.every((x) => (x >= 32 && x < 127) || x === 0);
  }
  const looksReadable = isReadable(recovered);

  // Build view: ciphertext as hex, with crib highlight at position
  const W = 540;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>Hádaný crib (předpokládáme v M₁ na pozici {pos}):</label>
        <input value={crib} onChange={(e) => setCrib(e.target.value.toUpperCase())} style={inp} maxLength={20} />
      </div>
      <div style={row}>
        <label style={lbl}>posun:</label>
        <input type="range" min={0} max={Math.max(0, M1.length - cribBytes.length)} value={pos}
          onChange={(e) => setPos(+e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{pos}</span>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Útočník zachytil 2 ciphertexty zašifrované <i>stejným</i> klíčem (KGB / VENONA scénář).
        Spočítá C₁ ⊕ C₂ = M₁ ⊕ M₂ — klíč zmizí, zůstal XOR plaintextů.
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11, overflowX: "auto" }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>C₁ ⊕ C₂ (XOR plaintextů):</div>
        <div style={{ whiteSpace: "pre", color: "var(--text)" }}>
          {C1XorC2.map((b, i) => {
            const inHighlight = i >= pos && i < pos + cribBytes.length;
            return (
              <span key={i} style={{
                background: inHighlight ? "rgba(81,131,219,0.25)" : "transparent",
                color: inHighlight ? "var(--accent)" : "var(--text)",
                padding: "0 2px",
              }}>
                {b.toString(16).padStart(2, "0")}
              </span>
            );
          }).reduce((acc, el, i) => i === 0 ? [el] : [...acc, " ", el], [])}
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>
          Pokud crib „<span style={{ color: "var(--accent)" }}>{crib}</span>" je v M₁ na pozici {pos}, pak M₂[{pos}…] =
        </div>
        <div style={{
          color: looksReadable ? "#81b29a" : "#e07a5f",
          fontSize: 14, letterSpacing: 1,
          fontWeight: looksReadable ? "bold" : "normal",
        }}>
          „{fromBytes(recovered).replace(/[\x00-\x1F\x7F]/g, "·")}"
        </div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>
          {looksReadable ? "✓ Vypadá to čitelně — pravděpodobně správná hypotéza." : "✗ Smetí — crib na této pozici v M₁ není."}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Posouvejte crib po pozicích. Jakmile najdete čitelný úsek M₂, máte částečné rozluštění. Jazyková redundance dělá zbytek.
        Skutečné M₁ = "{M1}", M₂ = "{M2}".
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const inp = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 220 };
