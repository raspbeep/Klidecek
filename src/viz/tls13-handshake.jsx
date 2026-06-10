// TLS 1.3 1-RTT handshake — krok po kroku.
import { useState } from "react";

const STEPS = [
  {
    label: "1. ClientHello",
    from: "C", to: "S",
    payload: "ClientHello {\n  version: TLS 1.3\n  random: 32 B nonce\n  cipher_suites: [AES-128-GCM, ChaCha20-Poly1305, …]\n  key_share: X25519 pk_C\n  signature_algorithms: [Ed25519, ECDSA-P256, RSA-PSS]\n  server_name: example.com (SNI)\n}",
    note: "Klient odešle nabídku šifrových sad, podpisových algoritmů a vlastní efemérní ECDH veřejný klíč pk_C.",
    encrypted: false,
  },
  {
    label: "2. ServerHello",
    from: "S", to: "C",
    payload: "ServerHello {\n  selected_cipher: AES-128-GCM\n  random: 32 B nonce\n  key_share: X25519 pk_S\n}",
    note: "Server vybere cipher suite, odešle svůj efemérní pk_S. Sdílené tajemství: ECDH(sk_C, pk_S) = ECDH(sk_S, pk_C). Od této chvíle jsou všechny další zprávy šifrované.",
    encrypted: false,
  },
  {
    label: "3. EncryptedExtensions",
    from: "S", to: "C",
    payload: "EncryptedExtensions {\n  ALPN: h2\n  max_fragment_length: 16384\n  ...\n}",
    note: "Šifrováno handshake klíčem. Negociace L7 protokolu, fragment size, atd.",
    encrypted: true,
  },
  {
    label: "4. Certificate",
    from: "S", to: "C",
    payload: "Certificate {\n  X.509 chain: [server_cert, intermediate_CA, ...]\n  extensions: SCT (Cert Transparency), OCSP staple\n}",
    note: "Server pošle svůj certifikát a chain. Klient ověří podpis intermediate ← root z trust store.",
    encrypted: true,
  },
  {
    label: "5. CertificateVerify",
    from: "S", to: "C",
    payload: "CertificateVerify {\n  signature_algorithm: Ed25519\n  signature: Sign(SK_S, transcript_hash || context)\n}",
    note: "Server podepíše transcript handshake svým soukromým klíčem (z certifikátu). Klient ověří VK_S z cert — důkaz, že server VLASTNÍ SK_S.",
    encrypted: true,
  },
  {
    label: "6. Server Finished",
    from: "S", to: "C",
    payload: "Finished {\n  verify_data: HMAC(finished_key, transcript_hash)\n}",
    note: "MAC nad celým handshake transcript → klient ověří integritu.",
    encrypted: true,
  },
  {
    label: "7. Client Finished + Application data (1-RTT)",
    from: "C", to: "S",
    payload: "Finished + ApplicationData {\n  AEAD encrypted under application_traffic_secret\n}",
    note: "Klient pošle své Finished — ihned může poslat application data ve stejné zprávě (1-RTT). Forward secrecy: sk_C/sk_S se zničí po sessionu.",
    encrypted: true,
  },
];

const NODES = {
  C: { x: 80, y: 200 },
  S: { x: 460, y: 200 },
};

export default function Tls13Handshake() {
  const [step, setStep] = useState(0);

  const W = 540, H = 380;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>◀</button>
        <span className="viz-readout" style={{ color: "var(--accent)" }}>
          {STEPS[step].label}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>▶</button>
        <button className="viz-btn" onClick={() => setStep(0)}>Reset</button>
        <span className="viz-readout push">{step + 1}/{STEPS.length}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 620 }}>
        <defs>
          <marker id="aTlsA" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
          <marker id="aTlsB" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="#81b29a" />
          </marker>
        </defs>

        {/* C, S nodes */}
        <rect x={NODES.C.x - 50} y={20} width={100} height={36} rx={6} fill="var(--bg-inset)" stroke="var(--accent)" />
        <text x={NODES.C.x} y={42} fontSize="12" fill="var(--text)" textAnchor="middle">Klient</text>
        <rect x={NODES.S.x - 50} y={20} width={100} height={36} rx={6} fill="var(--bg-inset)" stroke="var(--accent)" />
        <text x={NODES.S.x} y={42} fontSize="12" fill="var(--text)" textAnchor="middle">Server</text>

        {/* vertical lifelines */}
        <line x1={NODES.C.x} y1={56} x2={NODES.C.x} y2={H - 20} stroke="var(--line)" strokeDasharray="3 3" />
        <line x1={NODES.S.x} y1={56} x2={NODES.S.x} y2={H - 20} stroke="var(--line)" strokeDasharray="3 3" />

        {/* messages */}
        {STEPS.slice(0, step + 1).map((s, i) => {
          const y = 80 + i * 38;
          const fromX = NODES[s.from].x, toX = NODES[s.to].x;
          const isCurrent = i === step;
          const color = s.encrypted ? "#81b29a" : "var(--accent)";
          const marker = s.encrypted ? "url(#aTlsB)" : "url(#aTlsA)";
          return (
            <g key={i} opacity={isCurrent ? 1 : 0.4}>
              <line x1={fromX + (fromX < toX ? 50 : -50)} y1={y} x2={toX + (toX < fromX ? 50 : -50)} y2={y}
                stroke={color} strokeWidth={isCurrent ? 2 : 1} markerEnd={marker} />
              <text x={(fromX + toX) / 2} y={y - 4} fontSize="10" textAnchor="middle"
                fill={color} fontWeight={isCurrent ? "bold" : "normal"}>
                {i + 1}. {s.label.replace(/^\d+\.\s*/, "")} {s.encrypted && "🔒"}
              </text>
            </g>
          );
        })}

        {/* legend */}
        <text x={20} y={H - 6} fontSize="9" fill="var(--text-muted)">— plain &nbsp;&nbsp; 🔒 šifrované AEAD klíči odvozenými z ECDH</text>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: STEPS[step].encrypted ? "#81b29a" : "var(--accent)", marginBottom: 4 }}>
          {STEPS[step].from} → {STEPS[step].to} {STEPS[step].encrypted ? "(šifrováno)" : "(plaintext)"}
        </div>
        <pre style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
          {STEPS[step].payload}
        </pre>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{STEPS[step].note}</div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        TLS 1.3 vyžaduje <b>forward secrecy</b> — efemérní ECDH, žádný RSA key transport (na rozdíl od TLS 1.2).
        Kompromitace dlouhodobého SK_S nedovolí rozšifrovat zaznamenané minulé sessions.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
