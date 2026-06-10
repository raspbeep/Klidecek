// wap-csrf-flow — krokovaný průběh CSRF útoku a obrana Synchronizer Tokenem.
// Toggle zapne/vypne anti-CSRF token. Bez tokenu projde útok (prohlížeč přiloží
// cookie), s tokenem server požadavek odmítne, protože útočník token kvůli SOP
// nezná.
import { useState } from "react";

const RED = "oklch(0.55 0.18 22)";
const GREEN = "oklch(0.52 0.16 142)";
const ACCENT = "oklch(0.55 0.16 264)";

function makeSteps(token) {
  const base = [
    {
      title: "1 — Oběť je přihlášena u banky",
      detail: "Uživatel se přihlásil na bank.example. Prohlížeč si drží relační cookie pro tuto doménu.",
      actor: "vic",
      kind: "ok",
    },
    {
      title: "2 — Oběť navštíví útočníkův web",
      detail: "Ve vedlejší záložce otevře evil.com. Ten obsahuje skrytý formulář mířící na bank.example.",
      actor: "atk",
      kind: "neutral",
    },
    {
      title: "3 — evil.com odešle cross-site požadavek",
      detail: "Stránka automaticky odešle POST na bank.example/prevod. Prohlížeč k němu PŘILOŽÍ relační cookie (důvěra serveru v prohlížeč).",
      actor: "atk",
      kind: "bad",
      cookie: true,
      tokenSent: false,
    },
  ];

  if (!token) {
    base.push({
      title: "4 — Server požadavek přijme ✗",
      detail: "Bez anti-CSRF obrany server vidí platnou cookie a požadavek zpracuje jako legitimní. Převod proběhne — útok uspěl.",
      actor: "srv",
      kind: "bad",
      result: "fail",
    });
  } else {
    base.push({
      title: "4 — Server kontroluje token ✓",
      detail: "Server čeká skryté pole s tajným tokenem ze session. Útočník ho kvůli SOP nemohl z banky přečíst, takže ho v požadavku nemá (nebo je špatný). Server požadavek ODMÍTNE (403).",
      actor: "srv",
      kind: "ok",
      result: "blocked",
    });
  }
  return base;
}

const NODES = {
  vic: { x: 60, label: "oběť" },
  atk: { x: 200, label: "evil.com" },
  srv: { x: 340, label: "bank.example" },
};

export default function WapCsrfFlow() {
  const [token, setToken] = useState(false);
  const [i, setI] = useState(0);
  const steps = makeSteps(token);
  const s = steps[Math.min(i, steps.length - 1)];
  const W = 400;
  const H = 150;

  const reset = () => setI(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, padding: "7px 10px", background: "var(--bg-inset)", borderRadius: 8, border: "1px solid var(--line)" }}>
        <input type="checkbox" checked={token} onChange={(e) => { setToken(e.target.checked); reset(); }} />
        <span style={{ fontFamily: "var(--font-mono)" }}>Synchronizer Token Pattern</span>
        <span style={{ color: token ? GREEN : "var(--text-muted)" }}>{token ? "zapnuto" : "vypnuto"}</span>
      </label>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← zpět</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {i + 1} / {steps.length}
        </span>
        <button className="viz-btn primary" onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>další →</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* aktéři */}
        {Object.entries(NODES).map(([id, n]) => {
          const active = s.actor === id;
          const c = active
            ? s.kind === "bad" ? RED : s.kind === "ok" ? GREEN : ACCENT
            : "var(--line-strong)";
          return (
            <g key={id}>
              <rect x={n.x - 46} y={30} width={92} height={36} rx={6}
                fill={active ? `${c.replace(")", " / 0.13)")}` : "var(--bg-card)"}
                stroke={c} strokeWidth={active ? 1.6 : 1} />
              <text x={n.x} y={52} textAnchor="middle" fontSize="11" fontWeight={active ? 700 : 500}
                fill="var(--text)">{n.label}</text>
            </g>
          );
        })}

        {/* cookie + token indikátory pro krok odeslání */}
        {s.cookie && (
          <g>
            <line x1={NODES.atk.x + 46} y1={84} x2={NODES.srv.x - 46} y2={84}
              stroke={RED} strokeWidth="1.6" markerEnd="url(#wapCsrfArr)" />
            <text x={(NODES.atk.x + NODES.srv.x) / 2} y={80} textAnchor="middle" fontSize="9.5"
              fontFamily="var(--font-mono)" fill={RED}>POST + cookie</text>
            <text x={(NODES.atk.x + NODES.srv.x) / 2} y={100} textAnchor="middle" fontSize="9.5"
              fontFamily="var(--font-mono)" fill={token ? RED : "var(--text-faint)"}>
              {token ? "token: chybí ✗" : "(žádný token)"}
            </text>
          </g>
        )}

        {/* výsledek */}
        {s.result && (
          <g>
            <rect x={100} y={110} width={200} height={28} rx={5}
              fill={s.result === "blocked" ? "oklch(0.52 0.16 142 / 0.14)" : "oklch(0.55 0.18 22 / 0.14)"}
              stroke={s.result === "blocked" ? GREEN : RED} strokeWidth="1.3" />
            <text x={200} y={128} textAnchor="middle" fontSize="12" fontWeight="700"
              fill={s.result === "blocked" ? GREEN : RED}>
              {s.result === "blocked" ? "403 — útok odmítnut ✓" : "převod proběhl — útok uspěl ✗"}
            </text>
          </g>
        )}

        <defs>
          <marker id="wapCsrfArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={RED} />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--text)", marginBottom: 4 }}>{s.title}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.detail}</div>
      </div>
    </div>
  );
}
