// Kerberos v5 — 3-fázový protokol: AS-REQ/REP, TGS-REQ/REP, AP-REQ.
// Stepper s kliknutím "krok" — vidí se obsah tikets a session keys.
import { useState } from "react";

const STEPS = [
  {
    label: "1. AS-REQ",
    from: "C", to: "AS",
    payload: "C, TGS, lifetime, N₁",
    note: "Klient žádá AS o TGT pro službu TGS.",
  },
  {
    label: "2. AS-REP",
    from: "AS", to: "C",
    payload: "E_{K_C}(K_{C,TGS}, TGS, lifetime, N₁, TGT)\nTGT = E_{K_{TGS}}(K_{C,TGS}, C, addr, life, ts)",
    note: "AS dešifruje K_C ze své DB. Klient zadá heslo, odvodí K_C, rozšifruje. Získá session klíč pro TGS a TGT.",
  },
  {
    label: "3. TGS-REQ",
    from: "C", to: "TGS",
    payload: "V, lifetime, N₂, TGT, Auth_C\nAuth_C = E_{K_{C,TGS}}(C, addr, ts)",
    note: "Klient žádá ticket pro službu V. Pošle TGT + čerstvý autentikátor (důkaz znalosti K_{C,TGS}).",
  },
  {
    label: "4. TGS-REP",
    from: "TGS", to: "C",
    payload: "E_{K_{C,TGS}}(K_{C,V}, V, lifetime, N₂, Ticket)\nTicket = E_{K_V}(K_{C,V}, C, addr, life, ts)",
    note: "TGS rozšifruje TGT (svým klíčem), ověří Auth_C, vydá service ticket pro V.",
  },
  {
    label: "5. AP-REQ",
    from: "C", to: "V",
    payload: "Ticket, Auth_C\nAuth_C = E_{K_{C,V}}(C, addr, ts)",
    note: "Klient se autentizuje serveru V. Pošle ticket + autentikátor pro V.",
  },
  {
    label: "6. AP-REP (volitelné)",
    from: "V", to: "C",
    payload: "E_{K_{C,V}}(ts+1)",
    note: "Mutual auth: server odpoví zašifrovaným timestampem, klient ověří identitu serveru.",
  },
];

const NODES = {
  C:   { x: 80,  y: 220, label: "Klient (C)" },
  AS:  { x: 280, y: 60,  label: "AS" },
  TGS: { x: 280, y: 220, label: "TGS" },
  V:   { x: 460, y: 220, label: "Server V" },
};

export default function Kerberos() {
  const [step, setStep] = useState(0);
  const W = 540, H = 320;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>◀</button>
        <span className="viz-readout">
          krok {step + 1} / {STEPS.length}: {STEPS[step].label}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>▶</button>
        <button className="viz-btn" onClick={() => setStep(0)}>Reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 620 }}>
        <defs>
          <marker id="aKrbA" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* nodes */}
        {Object.entries(NODES).map(([k, n]) => (
          <g key={k}>
            <rect x={n.x - 50} y={n.y - 22} width={100} height={44} rx={6}
              fill="var(--bg-inset)" stroke="var(--accent)" strokeWidth="1.2" />
            <text x={n.x} y={n.y + 4} fontSize="12" fill="var(--text)" textAnchor="middle">{n.label}</text>
          </g>
        ))}

        {/* KDC bracket */}
        <text x={280} y={150} fontSize="10" fill="var(--text-faint)" textAnchor="middle">— KDC —</text>
        <line x1={230} y1={155} x2={330} y2={155} stroke="var(--text-faint)" strokeDasharray="3 3" />

        {/* All step arrows so far */}
        {STEPS.slice(0, step + 1).map((s, i) => {
          const from = NODES[s.from], to = NODES[s.to];
          const isCurrent = i === step;
          const offset = i * 6 - 18;
          const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2 + offset;
          return (
            <g key={i} opacity={isCurrent ? 1 : 0.4}>
              <path d={`M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`}
                stroke={isCurrent ? "var(--accent)" : "var(--text-muted)"}
                strokeWidth={isCurrent ? 2 : 1} fill="none" markerEnd="url(#aKrbA)" />
              <text x={midX} y={midY - 4} fontSize="10" textAnchor="middle"
                fill={isCurrent ? "var(--accent)" : "var(--text-muted)"}
                fontWeight={isCurrent ? "bold" : "normal"}>
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 4 }}>{STEPS[step].label}: {STEPS[step].from} → {STEPS[step].to}</div>
        <pre style={{
          fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)",
          margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5,
        }}>{STEPS[step].payload}</pre>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{STEPS[step].note}</div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Klíčové vlastnosti: <b>SSO</b> (heslo jen 1× při loginu — TGT pak slouží pro všechny služby),{" "}
        <b>autentikátor</b> proti replay (timestamp ve 5 min toleranci),{" "}
        <b>žádný transport hesla</b> (klient odvodí K_C lokálně, KDC ho zná z DB).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
