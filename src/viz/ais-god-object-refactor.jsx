// God Object → refactoring. Přepínač "před / po": vlevo jedna třída se všemi
// odpovědnostmi a klienti na ni všichni závisí (vysoká provázanost);
// vpravo rozpad do soudržných služeb, každý klient mluví jen se svou.
import { useState } from "react";

const RESP = [
  { id: "user", label: "createUser", svc: "UserService", hue: 264 },
  { id: "order", label: "saveOrder", svc: "OrderService", hue: 142 },
  { id: "email", label: "sendEmail", svc: "EmailService", hue: 80 },
  { id: "pdf", label: "generatePdf", svc: "PdfGenerator", hue: 200 },
  { id: "db", label: "connectDb", svc: "DbConnection", hue: 22 },
];

export default function AisGodObjectRefactor() {
  const [after, setAfter] = useState(false);
  const W = 460, H = 220;

  // clients on the left, responsibilities/services on the right
  const clientY = (i) => 36 + i * 36;
  const nClients = 5;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}>
        <button
          onClick={() => setAfter(false)}
          style={tab(!after, "oklch(0.62 0.16 22)")}
        >
          PŘED — God Object
        </button>
        <button
          onClick={() => setAfter(true)}
          style={tab(after, "oklch(0.55 0.14 142)")}
        >
          PO — rozpad služeb
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* clients */}
        {Array.from({ length: nClients }).map((_, i) => (
          <g key={`c${i}`}>
            <rect x="14" y={clientY(i) - 12} width="74" height="24" rx="4"
              fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1" />
            <text x="51" y={clientY(i) + 4} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
              Client {i + 1}
            </text>
          </g>
        ))}

        {!after ? (
          <>
            {/* edges: every client -> the one god object */}
            {Array.from({ length: nClients }).map((_, i) => (
              <line key={`ge${i}`} x1="88" y1={clientY(i)} x2="250" y2="110"
                stroke="oklch(0.62 0.16 22 / 0.55)" strokeWidth="1.1" />
            ))}
            {/* god object */}
            <rect x="250" y="34" width="180" height="152" rx="6"
              fill="oklch(0.62 0.16 22 / 0.13)" stroke="oklch(0.62 0.16 22)" strokeWidth="1.6" />
            <text x="340" y="52" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">ApplicationManager</text>
            <line x1="250" y1="60" x2="430" y2="60" stroke="oklch(0.62 0.16 22)" strokeWidth="1" />
            {RESP.map((r, i) => (
              <text key={r.id} x="262" y={80 + i * 20} fontSize="10"
                fontFamily="var(--font-mono)" fill="var(--text-muted)">+ {r.label}()</text>
            ))}
            <text x="340" y="198" textAnchor="middle" fontSize="9" fill="oklch(0.5 0.16 22)">
              1 třída · 5 odpovědností · {nClients * 1} vazeb dovnitř
            </text>
          </>
        ) : (
          <>
            {/* each client -> its own service (1:1) */}
            {RESP.map((r, i) => {
              const sy = 30 + i * 38;
              return (
                <g key={r.id}>
                  <line x1="88" y1={clientY(i)} x2="270" y2={sy + 13}
                    stroke={`oklch(0.62 0.14 ${r.hue} / 0.6)`} strokeWidth="1.1" />
                  <rect x="270" y={sy} width="160" height="26" rx="5"
                    fill={`oklch(0.62 0.14 ${r.hue} / 0.13)`} stroke={`oklch(0.62 0.14 ${r.hue})`} strokeWidth="1.2" />
                  <text x="350" y={sy + 17} textAnchor="middle" fontSize="10"
                    fontFamily="var(--font-mono)" fill="var(--text)">{r.svc}</text>
                </g>
              );
            })}
          </>
        )}
      </svg>

      <div style={{
        fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5,
        padding: 9, borderRadius: 6,
        background: after ? "oklch(0.62 0.14 142 / 0.08)" : "oklch(0.62 0.16 22 / 0.08)",
        border: `1px solid ${after ? "oklch(0.62 0.14 142 / 0.4)" : "oklch(0.62 0.16 22 / 0.4)"}`,
      }}>
        {after ? (
          <>
            <strong style={{ color: "oklch(0.45 0.14 142)" }}>Po refaktoringu:</strong> každá odpovědnost
            má vlastní <strong>soudržnou</strong> třídu (Single Responsibility). Klient závisí jen na té
            službě, kterou potřebuje — <strong>nízká provázanost</strong>, snadné testování i změna po částech.
          </>
        ) : (
          <>
            <strong style={{ color: "oklch(0.5 0.16 22)" }}>God Object:</strong> jedna třída řeší vše
            (uživatele, objednávky, e-maily, PDF, DB). <strong>Nízká soudržnost, vysoká provázanost</strong> —
            chyba kdekoli ohrozí celek a třída se nedá testovat po částech.
          </>
        )}
      </div>
    </div>
  );
}

function tab(active, color) {
  return {
    padding: "6px 14px",
    fontSize: 11.5,
    fontWeight: active ? 700 : 400,
    fontFamily: "var(--font-mono)",
    borderRadius: 5,
    cursor: "pointer",
    border: `1px solid ${active ? color : "var(--line)"}`,
    background: active ? `color-mix(in oklch, ${color} 16%, transparent)` : "var(--bg-card)",
    color: active ? color : "var(--text-muted)",
  };
}
