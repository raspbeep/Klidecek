// Textbook RSA na malých prvočíslech — KeyGen, encrypt, decrypt, CRT.
// Pozor: textbook RSA ŽÁDNÉ produkční použití, jen pedagogická demonstrace.
import { useMemo, useState } from "react";

function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }
function modInverse(a, m) {
  // Extended Euclidean
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return ((old_s % m) + m) % m;
}
function modPow(base, exp, mod) {
  let r = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return r;
}

const PRIMES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];

export default function RsaToy() {
  const [p, setP] = useState(11);
  const [q, setQ] = useState(13);
  const [e, setE] = useState(7);
  const [M, setM] = useState(9);
  const [showCRT, setShowCRT] = useState(false);

  const result = useMemo(() => {
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    if (gcd(e, phi) !== 1) return { error: `gcd(e=${e}, φ=${phi}) ≠ 1 — zvol jiné e` };
    const d = Number(modInverse(BigInt(e), BigInt(phi)));
    if (M >= n) return { error: `M=${M} musí být < n=${n}`, n, phi };
    const bn = BigInt(n);
    const C = Number(modPow(BigInt(M), BigInt(e), bn));
    const Mdec = Number(modPow(BigInt(C), BigInt(d), bn));

    // CRT decryption
    const dp = d % (p - 1);
    const dq = d % (q - 1);
    const Mp = Number(modPow(BigInt(C), BigInt(dp), BigInt(p)));
    const Mq = Number(modPow(BigInt(C), BigInt(dq), BigInt(q)));
    // CRT recombination: m = Mp + p * ((Mq - Mp) * (p^-1 mod q) mod q)
    const pInvQ = Number(modInverse(BigInt(p), BigInt(q)));
    const Mcrt = (Mp + p * (((Mq - Mp) * pInvQ) % q + q)) % n;

    return { n, phi, d, C, Mdec, dp, dq, Mp, Mq, pInvQ, Mcrt };
  }, [p, q, e, M]);

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>p:</label>
        <select className="viz-select" value={p} onChange={(ev) => setP(+ev.target.value)}>
          {PRIMES.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <label style={lbl}>q:</label>
        <select className="viz-select" value={q} onChange={(ev) => setQ(+ev.target.value)}>
          {PRIMES.filter((x) => x !== p).map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <label style={lbl}>e:</label>
        <input type="number" min={2} value={e} onChange={(ev) => setE(+ev.target.value)} style={num} />
        <label style={lbl}>M:</label>
        <input type="number" min={0} value={M} onChange={(ev) => setM(+ev.target.value)} style={num} />
        <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={showCRT} onChange={(ev) => setShowCRT(ev.target.checked)} />
          CRT
        </label>
      </div>

      {result.error ? (
        <div style={{ padding: 10, background: "#3a1a1a", color: "#e07a5f", borderRadius: 6, fontSize: 12 }}>
          ⚠ {result.error}
        </div>
      ) : (
        <>
          <div style={section}>
            <div style={sectionTitle}>1. KeyGen</div>
            <div style={mono}>
              n = p · q = <b>{p}·{q} = {result.n}</b><br />
              φ(n) = (p−1)·(q−1) = <b>{p - 1}·{q - 1} = {result.phi}</b><br />
              e = <b>{e}</b> &nbsp; (gcd(e, φ) = 1 ✓)<br />
              d = e⁻¹ mod φ(n) = <b style={{ color: "var(--accent)" }}>{result.d}</b> &nbsp;
              <span style={{ color: "var(--text-faint)" }}>
                (check: {e}·{result.d} = {e * result.d} = {Math.floor(e * result.d / result.phi)}·{result.phi} + 1)
              </span><br />
              VK = (n={result.n}, e={e})<br />
              SK = (n={result.n}, d={result.d})
            </div>
          </div>

          <div style={section}>
            <div style={sectionTitle}>2. Šifrování</div>
            <div style={mono}>
              C = M^e mod n = <b>{M}^{e} mod {result.n}</b> = <span style={{ color: "var(--accent)" }}>{result.C}</span>
            </div>
          </div>

          <div style={section}>
            <div style={sectionTitle}>3. Dešifrování {showCRT && "(s CRT optimalizací)"}</div>
            {!showCRT ? (
              <div style={mono}>
                M = C^d mod n = <b>{result.C}^{result.d} mod {result.n}</b> ={" "}
                <span style={{ color: result.Mdec === M ? "#81b29a" : "#e07a5f" }}>
                  {result.Mdec} {result.Mdec === M ? "✓ stejné jako M" : "✗"}
                </span>
              </div>
            ) : (
              <div style={mono}>
                d_p = d mod (p−1) = {result.d} mod {p - 1} = <b>{result.dp}</b><br />
                d_q = d mod (q−1) = {result.d} mod {q - 1} = <b>{result.dq}</b><br />
                M_p = C^d_p mod p = {result.C}^{result.dp} mod {p} = <b>{result.Mp}</b><br />
                M_q = C^d_q mod q = {result.C}^{result.dq} mod {q} = <b>{result.Mq}</b><br />
                p⁻¹ mod q = <b>{result.pInvQ}</b><br />
                M = M_p + p·((M_q − M_p)·p⁻¹ mod q) ={" "}
                <span style={{ color: result.Mcrt === M ? "#81b29a" : "#e07a5f" }}>
                  {result.Mcrt} {result.Mcrt === M ? "✓ stejné jako M" : "✗"}
                </span><br />
                <span style={{ color: "var(--text-faint)" }}>
                  CRT je ~4× rychlejší — d_p, d_q jsou kratší než d, a operace probíhají v menších modulech.
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        ⚠ Toto je <i>textbook</i> RSA na malých prvočíslech jen pro demonstraci. Pro reálné použití:
        p, q ≥ 1024 b, padding (OAEP pro šifrování, PSS pro podpis), constant-time umocnění.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 12, color: "var(--text-muted)" };
const num = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 70 };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const sectionTitle = { fontSize: 11, color: "var(--accent)", marginBottom: 6, fontWeight: "bold" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)", lineHeight: 1.7 };
