// Diffie-Hellman + Man-in-the-Middle.
// Vyberte a, b; spočítá g^a, g^b, sdílené K = g^(ab).
// Toggle "Mallory" — vloží své a', b', vytvoří dvě paralelní sessions.
import { useState } from "react";

function modPow(base, exp, mod) {
  let r = 1n;
  base = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) r = (r * base) % m;
    base = (base * base) % m;
    e >>= 1n;
  }
  return Number(r);
}

const PRESETS = {
  "Malé prvočíslo (p=23, g=5)": { p: 23, g: 5 },
  "Středně velké (p=809, g=3)": { p: 809, g: 3 },
  "Větší (p=10007, g=5)": { p: 10007, g: 5 },
};

export default function DhMitm() {
  const [presetKey, setPresetKey] = useState(Object.keys(PRESETS)[0]);
  const [a, setA] = useState(6);
  const [b, setB] = useState(15);
  const [mitm, setMitm] = useState(false);
  const [aPrime, setAPrime] = useState(4);
  const [bPrime, setBPrime] = useState(11);

  const { p, g } = PRESETS[presetKey];
  const A = modPow(g, a, p);
  const B = modPow(g, b, p);
  const K_AB = modPow(B, a, p); // Alice's view (no MITM)
  const K_AB_check = modPow(A, b, p);

  // MITM
  const A_prime = modPow(g, aPrime, p);
  const B_prime = modPow(g, bPrime, p);
  const K_AM = modPow(B_prime, a, p); // Alice ↔ Mallory
  const K_AM_check = modPow(A, bPrime, p);
  const K_MB = modPow(A_prime, b, p); // Mallory ↔ Bob
  const K_MB_check = modPow(B, aPrime, p);

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Skupina:</label>
        <select className="viz-select" value={presetKey} onChange={(e) => setPresetKey(e.target.value)}>
          {Object.keys(PRESETS).map((k) => <option key={k}>{k}</option>)}
        </select>
        <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={mitm} onChange={(e) => setMitm(e.target.checked)} />
          Mallory uprostřed
        </label>
      </div>

      <div className="viz-controls">
        <label style={lbl}>a (Alice):</label>
        <input type="number" min={1} max={p - 1} value={a} onChange={(e) => setA(Math.max(1, Math.min(p - 1, +e.target.value)))} style={num} />
        <label style={lbl}>b (Bob):</label>
        <input type="number" min={1} max={p - 1} value={b} onChange={(e) => setB(Math.max(1, Math.min(p - 1, +e.target.value)))} style={num} />
        {mitm && (
          <>
            <label style={lbl}>a' (Mallory):</label>
            <input type="number" min={1} max={p - 1} value={aPrime} onChange={(e) => setAPrime(Math.max(1, Math.min(p - 1, +e.target.value)))} style={num} />
            <label style={lbl}>b' (Mallory):</label>
            <input type="number" min={1} max={p - 1} value={bPrime} onChange={(e) => setBPrime(Math.max(1, Math.min(p - 1, +e.target.value)))} style={num} />
          </>
        )}
      </div>

      <svg viewBox="0 0 540 280" style={{ width: "100%", maxWidth: 640 }}>
        <defs>
          <marker id="aDhArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
        {/* Alice box */}
        <rect x={20} y={30} width={140} height={220} rx={8} fill="var(--bg-inset)" stroke="var(--accent)" />
        <text x={90} y={50} fontSize="13" fill="var(--text)" textAnchor="middle">Alice</text>
        <text x={30} y={75} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">a = {a}</text>
        <text x={30} y={92} fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">A = g^a = {A}</text>

        {/* Bob box */}
        <rect x={380} y={30} width={140} height={220} rx={8} fill="var(--bg-inset)" stroke="var(--accent)" />
        <text x={450} y={50} fontSize="13" fill="var(--text)" textAnchor="middle">Bob</text>
        <text x={390} y={75} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">b = {b}</text>
        <text x={390} y={92} fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">B = g^b = {B}</text>

        {mitm && (
          <>
            <rect x={200} y={80} width={140} height={120} rx={8} fill="#3a1a1a" stroke="#e07a5f" />
            <text x={270} y={100} fontSize="13" fill="#e07a5f" textAnchor="middle">Mallory</text>
            <text x={210} y={125} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">a'={aPrime} b'={bPrime}</text>
            <text x={210} y={142} fontSize="10" fill="#e07a5f" fontFamily="var(--font-mono)">A' = g^a' = {A_prime}</text>
            <text x={210} y={158} fontSize="10" fill="#e07a5f" fontFamily="var(--font-mono)">B' = g^b' = {B_prime}</text>
          </>
        )}

        {/* Arrows */}
        {!mitm && (
          <>
            <path d={`M160,${110} L380,${110}`} stroke="var(--accent)" strokeWidth="1.2" markerEnd="url(#aDhArrow)" />
            <text x={270} y={104} fontSize="11" fill="var(--accent)" textAnchor="middle" fontFamily="var(--font-mono)">A = {A}</text>
            <path d={`M380,${135} L160,${135}`} stroke="var(--accent)" strokeWidth="1.2" markerEnd="url(#aDhArrow)" />
            <text x={270} y={150} fontSize="11" fill="var(--accent)" textAnchor="middle" fontFamily="var(--font-mono)">B = {B}</text>
          </>
        )}
        {mitm && (
          <>
            <path d={`M160,${110} L200,${110}`} stroke="var(--accent)" strokeWidth="1.2" markerEnd="url(#aDhArrow)" />
            <path d={`M340,${110} L380,${110}`} stroke="#e07a5f" strokeWidth="1.2" markerEnd="url(#aDhArrow)" />
            <text x={180} y={104} fontSize="9" fill="var(--accent)" textAnchor="middle" fontFamily="var(--font-mono)">A</text>
            <text x={360} y={104} fontSize="9" fill="#e07a5f" textAnchor="middle" fontFamily="var(--font-mono)">A'</text>
            <path d={`M380,${175} L340,${175}`} stroke="var(--accent)" strokeWidth="1.2" markerEnd="url(#aDhArrow)" />
            <path d={`M200,${175} L160,${175}`} stroke="#e07a5f" strokeWidth="1.2" markerEnd="url(#aDhArrow)" />
            <text x={360} y={170} fontSize="9" fill="var(--accent)" textAnchor="middle" fontFamily="var(--font-mono)">B</text>
            <text x={180} y={170} fontSize="9" fill="#e07a5f" textAnchor="middle" fontFamily="var(--font-mono)">B'</text>
          </>
        )}

        {/* Computed shared keys */}
        {!mitm ? (
          <>
            <text x={30} y={185} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">K = B^a mod p</text>
            <text x={30} y={205} fontSize="12" fill="#81b29a" fontFamily="var(--font-mono)">K = {K_AB}</text>
            <text x={390} y={185} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">K = A^b mod p</text>
            <text x={390} y={205} fontSize="12" fill="#81b29a" fontFamily="var(--font-mono)">K = {K_AB_check}</text>
            <text x={270} y={235} fontSize="11" fill="#81b29a" textAnchor="middle">Sdílený klíč: {K_AB === K_AB_check ? "✓ shoda" : "neshoda"}</text>
          </>
        ) : (
          <>
            <text x={30} y={185} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">K = (B')^a mod p</text>
            <text x={30} y={205} fontSize="11" fill="#e07a5f" fontFamily="var(--font-mono)">K_AM = {K_AM}</text>
            <text x={390} y={185} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">K = (A')^b mod p</text>
            <text x={390} y={205} fontSize="11" fill="#e07a5f" fontFamily="var(--font-mono)">K_MB = {K_MB}</text>
            <text x={210} y={220} fontSize="10" fill="#e07a5f" fontFamily="var(--font-mono)">Mallory zná:</text>
            <text x={210} y={235} fontSize="11" fill="#e07a5f" fontFamily="var(--font-mono)">K_AM = {K_AM_check}</text>
            <text x={210} y={250} fontSize="11" fill="#e07a5f" fontFamily="var(--font-mono)">K_MB = {K_MB_check}</text>
            <text x={270} y={272} fontSize="11" fill="#e07a5f" textAnchor="middle">Alice & Bob mají rozdílné klíče — Mallory tlumočí.</text>
          </>
        )}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Bez autentizace nemá DH ochranu proti MITM. Obrana: podpis efemérních klíčů long-term klíčem
        (Station-to-Station, TLS 1.3 ServerCertificateVerify), nebo PKI.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 12, color: "var(--text-muted)" };
const num = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 60 };
