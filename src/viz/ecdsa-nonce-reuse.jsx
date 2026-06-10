// ECDSA nonce reuse → key recovery (Sony PS3-style).
// Dva podpisy se stejným k odhalí d_A v 4 krocích.
import { useMemo, useState } from "react";

// Modulární operace v Z_n (n = prvočíselný řád grupy)
const N = 7919; // toy prvočíslo
function modPos(a, m) { return ((a % m) + m) % m; }
function modInv(a, m) {
  // extended Euclidean
  let [old_r, r] = [a, m];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return modPos(old_s, m);
}

export default function EcdsaNonceReuse() {
  const [d, setD] = useState(1234); // private key
  const [k, setK] = useState(5678); // reused nonce
  const [h1, setH1] = useState(42);
  const [h2, setH2] = useState(99);
  const [step, setStep] = useState(0);

  // Pretend r = (kG).x mod n — pro pedagogiku použijeme r = k mod n
  const r = k % N;
  const s1 = modPos(modInv(k, N) * (h1 + r * d), N);
  const s2 = modPos(modInv(k, N) * (h2 + r * d), N);

  // Útočníkův výpočet
  const kRecovered = useMemo(() => {
    // k = (h1 - h2) / (s1 - s2) mod N
    const num = modPos(h1 - h2, N);
    const den = modPos(s1 - s2, N);
    return modPos(num * modInv(den, N), N);
  }, [h1, h2, s1, s2]);

  const dRecovered = useMemo(() => {
    // d = (s1 * k - h1) / r mod N
    const num = modPos(s1 * kRecovered - h1, N);
    return modPos(num * modInv(r, N), N);
  }, [s1, kRecovered, h1, r]);

  const success = dRecovered === d && kRecovered === k;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>d (soukromý):</label>
        <input type="number" min={1} max={N - 1} value={d} onChange={(e) => setD(+e.target.value)} style={num} />
        <label style={lbl}>k (znovupoužitý):</label>
        <input type="number" min={1} max={N - 1} value={k} onChange={(e) => setK(+e.target.value)} style={num} />
        <label style={lbl}>h(M₁):</label>
        <input type="number" value={h1} onChange={(e) => setH1(+e.target.value)} style={num} />
        <label style={lbl}>h(M₂):</label>
        <input type="number" value={h2} onChange={(e) => setH2(+e.target.value)} style={num} />
      </div>

      <div style={{ ...section, fontSize: 12 }}>
        <div style={{ color: "var(--accent)", marginBottom: 6 }}>Alice podepíše 2 zprávy se <i>stejným</i> k:</div>
        <div style={mono}>
          σ₁ = (r, s₁) kde r = (kG).x mod n = <b>{r}</b>, s₁ = k⁻¹(h₁ + r·d) mod n = <b>{s1}</b><br />
          σ₂ = (r, s₂) — <i>stejné r</i>, jiné h: s₂ = k⁻¹(h₂ + r·d) mod n = <b>{s2}</b>
        </div>
      </div>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={() => setStep((step + 1) % 4)}>▶ Další krok útoku ({step + 1}/4)</button>
        <button className="viz-btn" onClick={() => setStep(0)}>Reset</button>
      </div>

      <div style={{ ...section, fontSize: 12 }}>
        <div style={{ color: "#e07a5f", marginBottom: 6 }}>Útočník (nezná d ani k, vidí jen σ₁, σ₂ a h₁, h₂):</div>
        <ol style={{ margin: 0, paddingLeft: 18, color: "var(--text)" }}>
          <li style={{ marginBottom: 4, opacity: step >= 0 ? 1 : 0.3 }}>
            <span style={mono}>s₁ − s₂ = k⁻¹(h₁ − h₂) mod n</span>
          </li>
          <li style={{ marginBottom: 4, opacity: step >= 1 ? 1 : 0.3 }}>
            <span style={mono}>
              k = (h₁ − h₂) · (s₁ − s₂)⁻¹ mod n = ({h1}−{h2})·({s1}−{s2})⁻¹ mod {N} = <b style={{ color: "#e07a5f" }}>{step >= 1 ? kRecovered : "?"}</b>
              {step >= 1 && kRecovered === k && <span style={{ color: "#81b29a" }}> ✓ matches</span>}
            </span>
          </li>
          <li style={{ marginBottom: 4, opacity: step >= 2 ? 1 : 0.3 }}>
            <span style={mono}>d = (s₁·k − h₁) · r⁻¹ mod n</span>
          </li>
          <li style={{ opacity: step >= 3 ? 1 : 0.3 }}>
            <span style={mono}>
              d = ({s1}·{step >= 1 ? kRecovered : "?"} − {h1}) · {r}⁻¹ mod {N} = <b style={{ color: "#e07a5f", fontSize: 14 }}>{step >= 3 ? dRecovered : "?"}</b>
              {step >= 3 && success && <span style={{ color: "#81b29a", marginLeft: 6 }}>✓ soukromý klíč odhalen!</span>}
            </span>
          </li>
        </ol>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Sony PS3 (2010): firmware používal konstantní <code>k</code>. Hacking group fail0verflow extrahovala master signing key.
        <b> Obrana:</b> deterministické ECDSA (RFC 6979) — k = HMAC(d, H(M)). Nebo lépe <b>EdDSA / Ed25519</b>,
        které jsou inherentně deterministické a bez náhody.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const num = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", width: 70 };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const mono = { fontFamily: "var(--font-mono)", color: "var(--text)" };
