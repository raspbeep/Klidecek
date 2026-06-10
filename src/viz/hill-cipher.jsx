// Hillova šifra: lineární algebra v Z_26.
// E: C = K·M mod 26. D: M = K⁻¹·C mod 26. KPA útok: K = C·M⁻¹.
import { useMemo, useState } from "react";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function modPos(x, m) { return ((x % m) + m) % m; }
function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
function modInv(a, m) {
  a = modPos(a, m);
  for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
  return null;
}

function det2(M) { return modPos(M[0][0] * M[1][1] - M[0][1] * M[1][0], 26); }
function inv2(M) {
  const d = det2(M);
  const di = modInv(d, 26);
  if (di === null) return null;
  return [
    [modPos(M[1][1] * di, 26), modPos(-M[0][1] * di, 26)],
    [modPos(-M[1][0] * di, 26), modPos(M[0][0] * di, 26)],
  ];
}
function mul2(A, v) {
  return [modPos(A[0][0] * v[0] + A[0][1] * v[1], 26), modPos(A[1][0] * v[0] + A[1][1] * v[1], 26)];
}
function mul2Mat(A, B) {
  return [
    [modPos(A[0][0] * B[0][0] + A[0][1] * B[1][0], 26), modPos(A[0][0] * B[0][1] + A[0][1] * B[1][1], 26)],
    [modPos(A[1][0] * B[0][0] + A[1][1] * B[1][0], 26), modPos(A[1][0] * B[0][1] + A[1][1] * B[1][1], 26)],
  ];
}

function toIdx(c) { return ALPHA.indexOf(c.toUpperCase()); }
function fromIdx(i) { return ALPHA[modPos(i, 26)]; }
function encrypt(plaintext, K) {
  const out = [];
  for (let i = 0; i < plaintext.length; i += 2) {
    const a = toIdx(plaintext[i]), b = toIdx(plaintext[i + 1] || "X");
    const c = mul2(K, [a, b]);
    out.push(fromIdx(c[0]), fromIdx(c[1]));
  }
  return out.join("");
}

export default function HillCipher() {
  const [k00, setK00] = useState(3);
  const [k01, setK01] = useState(3);
  const [k10, setK10] = useState(2);
  const [k11, setK11] = useState(5);
  const [plain, setPlain] = useState("HELLO");
  const [showAttack, setShowAttack] = useState(false);

  const K = [[k00, k01], [k10, k11]];
  const det = det2(K);
  const invertible = gcd(det, 26) === 1;
  const Kinv = useMemo(() => invertible ? inv2(K) : null, [k00, k01, k10, k11, invertible]);
  const cleaned = plain.toUpperCase().replace(/[^A-Z]/g, "");
  const padded = cleaned + (cleaned.length % 2 ? "X" : "");
  const cipher = invertible ? encrypt(padded, K) : "—";

  // KPA: dáno 2 dvojice (m1, m2) plaintextu a odpovídající ciphertext c1, c2 → K = C * M^-1
  const M_kpa = [[toIdx(padded[0]), toIdx(padded[2] || "A")], [toIdx(padded[1]), toIdx(padded[3] || "A")]];
  const C_kpa = invertible && padded.length >= 4 ? [[toIdx(cipher[0]), toIdx(cipher[2])], [toIdx(cipher[1]), toIdx(cipher[3])]] : null;
  const Minv = inv2(M_kpa);
  const K_recovered = (Minv && C_kpa) ? mul2Mat(C_kpa, Minv) : null;
  const recoveryOK = K_recovered && K_recovered[0][0] === K[0][0] && K_recovered[0][1] === K[0][1] && K_recovered[1][0] === K[1][0] && K_recovered[1][1] === K[1][1];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>Klíč K (2×2 v Z₂₆):</label>
        <input type="number" min={0} max={25} value={k00} onChange={(e) => setK00(modPos(+e.target.value, 26))} style={num} />
        <input type="number" min={0} max={25} value={k01} onChange={(e) => setK01(modPos(+e.target.value, 26))} style={num} />
        <span style={{ color: "var(--text-faint)" }}>|</span>
        <input type="number" min={0} max={25} value={k10} onChange={(e) => setK10(modPos(+e.target.value, 26))} style={num} />
        <input type="number" min={0} max={25} value={k11} onChange={(e) => setK11(modPos(+e.target.value, 26))} style={num} />
      </div>
      <div style={row}>
        <label style={lbl}>Plaintext:</label>
        <input value={plain} onChange={(e) => setPlain(e.target.value)} style={inp} maxLength={12} />
        <span style={{ fontSize: 11, color: invertible ? "#81b29a" : "#e07a5f", fontFamily: "var(--font-mono)" }}>
          det K = {det}, gcd(det,26) = {gcd(det, 26)} {invertible ? "✓ invertibilní" : "✗ ne-invertibilní"}
        </span>
      </div>

      <div style={section}>
        <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6 }}>Šifrování:</div>
        <div style={mono}>
          M (dvojice indexů): [{[...padded].map(toIdx).join(", ")}]<br />
          C = K · M mod 26 = <b style={{ color: "var(--accent)" }}>{cipher}</b>
          {Kinv && (
            <>
              <br />
              K⁻¹ = [[{Kinv[0][0]}, {Kinv[0][1]}], [{Kinv[1][0]}, {Kinv[1][1]}]]
            </>
          )}
        </div>
      </div>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setShowAttack(!showAttack)}>
          {showAttack ? "Skrýt" : "Ukázat"} KPA útok
        </button>
      </div>

      {showAttack && (
        <div style={section}>
          <div style={{ fontSize: 11, color: "#e07a5f", marginBottom: 6 }}>
            KPA útok: útočník zná 2 dvojice plaintext-ciphertext (z 4+ známých znaků).
          </div>
          {C_kpa && Minv ? (
            <div style={mono}>
              Známé:<br />
              M = [[{M_kpa[0][0]},{M_kpa[0][1]}],[{M_kpa[1][0]},{M_kpa[1][1]}]] (z plaintextu)<br />
              C = [[{C_kpa[0][0]},{C_kpa[0][1]}],[{C_kpa[1][0]},{C_kpa[1][1]}]] (z ciphertextu)<br /><br />
              M⁻¹ = [[{Minv[0][0]},{Minv[0][1]}],[{Minv[1][0]},{Minv[1][1]}]]<br />
              K = C · M⁻¹ = <b style={{ color: "#e07a5f" }}>
                [[{K_recovered[0][0]},{K_recovered[0][1]}],[{K_recovered[1][0]},{K_recovered[1][1]}]]
              </b>
              {recoveryOK && <span style={{ color: "#81b29a" }}> ✓ klíč obnoven (matches!)</span>}
            </div>
          ) : (
            <div style={{ color: "var(--text-faint)", fontSize: 11 }}>
              {!Minv ? "M není invertibilní v Z₂₆ — zkuste jiný plaintext." : "Plaintext příliš krátký pro 2×2 matici (potřeba 4+ znaky)."}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Hillova šifra je <b>lineární</b> — pro n×n matici stačí <b>n²</b> známých plaintext-ciphertext bytů, abyste vyřešili K
        soustavou. To je *katastrofa* z hlediska kryptografie. Moderní šifry (AES) mají proto <b>nelineární</b> S-boxy.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const num = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", width: 50 };
const inp = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 140 };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const mono = { fontFamily: "var(--font-mono)", color: "var(--text)", fontSize: 12, lineHeight: 1.6 };
