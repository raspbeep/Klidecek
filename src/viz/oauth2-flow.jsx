// OAuth 2.0 Authorization Code Flow + PKCE visualizer.
// Step through the messages between User, Client, Auth Server, Resource Server.
import { useState } from "react";

const STEPS = [
  {
    n: 0,
    title: "Start — uživatel chce přístup k aplikaci",
    desc: "Klient (web aplikace) ještě nemá token. Uživatel klikne „Přihlásit přes Google\".",
    msg: null,
  },
  {
    n: 1,
    title: "Klient generuje PKCE",
    desc: "Klient vygeneruje code_verifier (náhodný řetězec) a spočte code_challenge = SHA256(verifier). Verifier zůstává u klienta.",
    msg: { from: "client", to: "client", label: "verifier = random, challenge = SHA256(verifier)" },
  },
  {
    n: 2,
    title: "Přesměrování na Auth Server",
    desc: "Klient přesměruje prohlížeč na /authorize s parametry: response_type=code, client_id, redirect_uri, scope=openid email, state, code_challenge.",
    msg: { from: "user", to: "auth", label: "GET /authorize?code_challenge=...&scope=..." },
  },
  {
    n: 3,
    title: "Uživatel se přihlásí",
    desc: "Auth Server zobrazí login formulář. Uživatel zadá heslo (případně MFA). Odsouhlasí scopes.",
    msg: { from: "user", to: "auth", label: "POST /login (username, password)" },
  },
  {
    n: 4,
    title: "Auth Server vrací authorization_code",
    desc: "Po úspěšném přihlášení Auth Server přesměruje zpět na redirect_uri klienta s ?code=... v query string. Code je krátkodobý jednorázový.",
    msg: { from: "auth", to: "user", label: "302 Redirect → redirect_uri?code=ABC123&state=..." },
  },
  {
    n: 5,
    title: "Browser doručí code klientovi",
    desc: "Browser otevře redirect_uri klienta. Klient přečte code z URL.",
    msg: { from: "user", to: "client", label: "GET /callback?code=ABC123" },
  },
  {
    n: 6,
    title: "Klient vymění code za tokeny (back-channel)",
    desc: "Klient pošle code + code_verifier na /token. Auth Server ověří: SHA256(verifier) == challenge. Pokud OK, vydá access_token + refresh_token + id_token (OIDC).",
    msg: { from: "client", to: "auth", label: "POST /token (code, verifier, client_id, client_secret)" },
  },
  {
    n: 7,
    title: "Auth Server vrací tokeny",
    desc: "Access Token (krátkodobý, JWT), Refresh Token (dlouhodobý), ID Token (jen u OIDC, obsahuje identitu).",
    msg: { from: "auth", to: "client", label: "200 OK { access_token, refresh_token, id_token, expires_in }" },
  },
  {
    n: 8,
    title: "Klient volá Resource Server s Access Tokenem",
    desc: "Pro každé API volání klient přidá Authorization: Bearer <access_token>. Resource Server ověří podpis tokenu a claims.",
    msg: { from: "client", to: "resource", label: "GET /api/data, Authorization: Bearer xxx.yyy.zzz" },
  },
  {
    n: 9,
    title: "Resource Server vrací data",
    desc: "Token ověřen, role v JWT odpovídají, server vrací data. Hotovo!",
    msg: { from: "resource", to: "client", label: "200 OK { data }" },
  },
];

const ACTORS = [
  { id: "user", label: "Uživatel", x: 60, color: 264 },
  { id: "client", label: "Klient (app)", x: 195, color: 22 },
  { id: "auth", label: "Auth Server", x: 350, color: 80 },
  { id: "resource", label: "Resource Server", x: 490, color: 142 },
];

export default function OAuth2Flow() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          className="btn ghost"
          style={{ padding: "5px 12px", fontSize: 12 }}
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          ← předchozí
        </button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step} / {STEPS.length - 1}
        </div>
        <button
          className="btn ghost"
          style={{ padding: "5px 12px", fontSize: 12 }}
          onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
          disabled={step === STEPS.length - 1}
        >
          další →
        </button>
      </div>

      <svg viewBox="0 0 560 240" style={{ width: "100%", display: "block", maxWidth: 560 }}>
        <rect width="560" height="240" fill="var(--bg-inset)" />
        {ACTORS.map((a) => (
          <g key={a.id}>
            <rect
              x={a.x - 50}
              y={20}
              width={100}
              height={30}
              rx={4}
              fill={`oklch(0.62 0.14 ${a.color} / 0.18)`}
              stroke={`oklch(0.62 0.14 ${a.color})`}
            />
            <text x={a.x} y={39} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text)">
              {a.label}
            </text>
            <line x1={a.x} y1={50} x2={a.x} y2={210} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 3" />
          </g>
        ))}

        {current.msg && (() => {
          const from = ACTORS.find((a) => a.id === current.msg.from);
          const to = ACTORS.find((a) => a.id === current.msg.to);
          const y = 95 + (step % 3) * 30;
          const isSelf = from.id === to.id;
          if (isSelf) {
            return (
              <g>
                <path
                  d={`M ${from.x + 6} ${y} Q ${from.x + 40} ${y - 12}, ${from.x + 6} ${y + 12}`}
                  stroke="oklch(0.55 0.18 22)"
                  strokeWidth="1.8"
                  fill="none"
                  markerEnd="url(#arrA)"
                />
                <text x={from.x + 24} y={y + 28} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
                  {current.msg.label}
                </text>
              </g>
            );
          }
          return (
            <g>
              <line
                x1={from.x}
                y1={y}
                x2={to.x}
                y2={y}
                stroke="oklch(0.55 0.18 22)"
                strokeWidth="1.8"
                markerEnd="url(#arrA)"
              />
              <text
                x={(from.x + to.x) / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontFamily="var(--font-mono)"
                fill="var(--text)"
              >
                {current.msg.label}
              </text>
            </g>
          );
        })()}

        <defs>
          <marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 12, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13, marginBottom: 4 }}>
          {current.title}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {current.desc}
        </div>
      </div>
    </div>
  );
}
