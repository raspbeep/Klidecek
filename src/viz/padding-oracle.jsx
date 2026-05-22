// Padding oracle útok proti CBC + PKCS#7.
// Dva bloky [C₁, C₂]; útočník modifikuje poslední byte C₁ → server reaguje OK/FAIL podle paddingu.
// Postupně útočník odhalí D_K(C₂) ⊕ orig_C₁ = M₂ (poslední blok plaintextu).
// Animace: iterace 0..255 pro poslední byte; jediná hodnota dá platný padding 0x01.
import { useMemo, useState } from "react";

const BLOCK = 8;

// Simulace: server zná K, dešifruje C₂ pomocí pevného D_K(C₂).
// Reálné AES bychom mít nemuseli — stačí, že intermediate D_K(C₂) je nějaký byte string.
// Útočník je iteruje s různým C₁; výsledek M = D_K(C₂) ⊕ C₁.
const D_K_C2 = [0x9F, 0x1C, 0x4B, 0xEE, 0x32, 0x7A, 0xD0, 0x65]; // tajný intermediate
const ORIG_C1 = [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x11, 0x22]; // legitimní C₁
// Original plaintext M₂ = D_K(C₂) ⊕ ORIG_C1
const ORIG_M2 = D_K_C2.map((d, i) => d ^ ORIG_C1[i]);

function isValidPkcs7(block) {
  const last = block[block.length - 1];
  if (last < 1 || last > block.length) return false;
  for (let i = 1; i <= last; i++) {
    if (block[block.length - i] !== last) return false;
  }
  return true;
}

function checkServerResponse(modifiedC1, knownTailBytes) {
  // server dešifruje modifiedC1, C₂ → M = D_K(C₂) ⊕ modifiedC1
  const m = D_K_C2.map((d, i) => d ^ modifiedC1[i]);
  return { valid: isValidPkcs7(m), m };
}

function hex(b) { return b.toString(16).padStart(2, "0").toUpperCase(); }

export default function PaddingOracle() {
  const [byteIdx, setByteIdx] = useState(BLOCK - 1); // start s posledním bytem
  const [trying, setTrying] = useState(0); // 0..255
  const [recovered, setRecovered] = useState([]); // D_K(C₂) bytes recovered

  // Auto-step: nalezni další valid byte
  function findNextValid() {
    const knownBytesCount = recovered.length;
    const targetPos = BLOCK - 1 - knownBytesCount; // poslední neodhalený byte
    const expectedPad = knownBytesCount + 1;

    for (let g = trying + 1; g <= 255; g++) {
      // Sestav C₁': pro pozice za targetPos: nastav tak, aby D_K(C₂)[i] ⊕ C₁'[i] = expectedPad
      const C1prime = new Array(BLOCK).fill(0);
      for (let i = 0; i < targetPos; i++) C1prime[i] = ORIG_C1[i]; // nezáleží
      C1prime[targetPos] = g;
      for (let i = targetPos + 1; i < BLOCK; i++) {
        const dki = recovered[BLOCK - 1 - i];
        C1prime[i] = dki ^ expectedPad;
      }
      const { valid } = checkServerResponse(C1prime);
      if (valid) {
        setTrying(g);
        // odhalený byte: D_K(C₂)[targetPos] = g ⊕ expectedPad
        return { found: g, dki: g ^ expectedPad };
      }
    }
    setTrying(255);
    return null;
  }

  function step() {
    const r = findNextValid();
    if (r) {
      setRecovered([...recovered, r.dki]);
      setTrying(0);
    }
  }
  function reset() {
    setRecovered([]); setTrying(0); setByteIdx(BLOCK - 1);
  }

  // Aktuální stav: zkoušíme byte targetPos s hodnotou `trying`
  const knownBytesCount = recovered.length;
  const targetPos = BLOCK - 1 - knownBytesCount;
  const expectedPad = knownBytesCount + 1;
  const currentC1 = new Array(BLOCK).fill(0);
  for (let i = 0; i < targetPos; i++) currentC1[i] = ORIG_C1[i];
  currentC1[targetPos] = trying;
  for (let i = targetPos + 1; i < BLOCK; i++) {
    const dki = recovered[BLOCK - 1 - i];
    currentC1[i] = dki ^ expectedPad;
  }
  const { valid: currentValid, m: currentM } = checkServerResponse(currentC1);

  // Recovered plaintext (pro ověření)
  const recoveredM2 = recovered.length ? recovered.map((dki, i) => dki ^ ORIG_C1[BLOCK - 1 - i]).reverse() : [];

  const allRecovered = recovered.length === BLOCK;

  return (
    <div style={ctn}>
      <div style={row}>
        <button onClick={step} disabled={allRecovered} style={btn}>
          ▶ Najdi další byte
        </button>
        <button onClick={reset} style={btn}>Reset</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          odhaleno: <b style={{ color: "var(--accent)" }}>{recovered.length}</b> / {BLOCK} bytů
          {allRecovered && <span style={{ color: "#81b29a" }}> — všechno odhaleno ✓</span>}
        </span>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Útočník nemá klíč, ale ví, že server vrací rozdílnou odpověď podle <b>platnosti paddingu</b>.
        Modifikuje C₁ a zkouší — když padding vyjde, dovodí D_K(C₂).
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 6 }}>Současný pokus (zkouším C₁'[{targetPos}] = 0x{hex(trying)}, hledám padding 0x{hex(expectedPad)}):</div>
        <div>
          C₁' = [
          {currentC1.map((b, i) => (
            <span key={i} style={{
              color: i === targetPos ? "var(--accent)" : i > targetPos ? "#81b29a" : "var(--text-muted)",
              padding: "0 3px",
              background: i === targetPos ? "rgba(81,131,219,0.15)" : "transparent",
            }}>
              {hex(b)}
            </span>
          ))}
          ]
        </div>
        <div style={{ marginTop: 4 }}>
          D_K(C₂) = [
          {D_K_C2.map((b, i) => (
            <span key={i} style={{
              color: i < targetPos ? "var(--text-faint)" : i === targetPos ? "var(--accent)" : "#81b29a",
              padding: "0 3px",
            }}>
              {i < targetPos ? "??" : hex(b)}
            </span>
          ))}
          ] <span style={{ color: "var(--text-faint)" }}>(tajný; útočník odvozuje zprava)</span>
        </div>
        <div style={{ marginTop: 4 }}>
          M = D_K(C₂) ⊕ C₁' = [
          {currentM.map((b, i) => (
            <span key={i} style={{ color: i === targetPos ? "var(--accent)" : "var(--text-muted)", padding: "0 3px" }}>
              {hex(b)}
            </span>
          ))}
          ]
        </div>
        <div style={{ marginTop: 6, color: currentValid ? "#81b29a" : "#e07a5f" }}>
          Server odpoví: {currentValid ? "✓ padding OK" : "✗ padding INVALID"}
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontSize: 11 }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>Odhalené bytes D_K(C₂) (zprava doleva):</div>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
          {recovered.length === 0 ? <i style={{ color: "var(--text-faint)" }}>—</i> : recovered.map((b, i) => `[${BLOCK - 1 - i}]=0x${hex(b)}`).join(", ")}
        </div>
        {allRecovered && (
          <>
            <div style={{ color: "var(--text-muted)", marginTop: 6, marginBottom: 4 }}>Plaintext M₂ = D_K(C₂) ⊕ orig_C₁:</div>
            <div style={{ fontFamily: "var(--font-mono)", color: "#81b29a" }}>
              [{recoveredM2.map((b) => hex(b)).join(", ")}]
            </div>
            <div style={{ color: "var(--text-muted)", marginTop: 4 }}>
              Skutečný M₂: [{ORIG_M2.map((b) => hex(b)).join(", ")}]
              {recoveredM2.every((b, i) => b === ORIG_M2[i]) ? " ✓ shoda" : " ✗ neshoda"}
            </div>
          </>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Náklady: ~128 dotazů na byte × {BLOCK} bytů = ~1024 dotazů na blok. POODLE (2014) takto prolomil SSL 3.0 cookies.
        <br /><b>Obrana:</b> AEAD režimy (GCM, ChaCha20-Poly1305) ověřují integritu <i>před</i> dešifrováním → padding oracle nevzniká.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const btn = { padding: "5px 12px", background: "var(--accent)", color: "var(--bg-card)", border: "none", borderRadius: 5, fontSize: 12, cursor: "pointer" };
