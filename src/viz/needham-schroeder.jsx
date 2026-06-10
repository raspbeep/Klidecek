// Needham-Schroeder protokol — normální průběh + Denning-Sacco replay útok.
// Toggle scénáře: 1) standardní 1978, 2) replay s starým K_AB.
import { useState } from "react";

const SCENARIOS = {
  "Normální průběh": [
    { from: "A", to: "S", text: "A, B, N_A", note: "Alice žádá KDC o klíč pro komunikaci s Bobem.", color: "var(--accent)" },
    { from: "S", to: "A", text: "E_{K_A}(N_A, B, K_AB, E_{K_B}(K_AB, A))", note: "KDC odpoví: nonce N_A (důkaz čerstvosti), identita Boba, sdílený klíč K_AB, plus ticket pro Boba.", color: "var(--accent)" },
    { from: "A", to: "B", text: "E_{K_B}(K_AB, A)", note: "Alice přepošle ticket. Bob rozšifruje a získá K_AB i identitu Alice.", color: "var(--accent)" },
    { from: "B", to: "A", text: "E_{K_AB}(N_B)", note: "Bob vyzve Alici: znáš K_AB? Pošli N_B-1.", color: "var(--accent)" },
    { from: "A", to: "B", text: "E_{K_AB}(N_B − 1)", note: "Alice odpoví. Bob ověří → mutual auth.", color: "var(--accent)" },
  ],
  "Denning-Sacco replay": [
    { from: "M", to: "B", text: "E_{K_B}(K_AB^old, A)", note: "Mallory přehraje STARÝ ticket od minulé session (kdy ještě měl Mallory K_AB starý z kompromitace dávno).", color: "#e07a5f" },
    { from: "B", to: "M(A)", text: "E_{K_AB^old}(N_B)", note: "Bob nemá způsob, jak zjistit, že K_AB je starý — žádné časové razítko. Posílá nonce zašifrovaný starým K_AB.", color: "#e07a5f" },
    { from: "M(A)", to: "B", text: "E_{K_AB^old}(N_B − 1)", note: "Mallory dešifruje (zná K_AB^old), správně odpoví. Bob věří, že komunikuje s Alicí.", color: "#e07a5f" },
    { from: "—", to: "—", text: "✗ Bob now talks to Mallory, thinking it's Alice", note: "Slabost: chybí timestamp v ticketu. Denning-Sacco (1981) navrhli přidat T, KDC: E_{K_A}(..., T, E_{K_B}(K_AB, A, T)).", color: "#e07a5f" },
  ],
  "Lowe (PK varianta)": [
    { from: "A", to: "M", text: "E_{VK_M}(N_A, A)", note: "Alice komunikuje s Malorym (kterého považuje za legitimního partnera).", color: "#e07a5f" },
    { from: "M(A)", to: "B", text: "E_{VK_B}(N_A, A)", note: "Mallory paralelně zahájí komunikaci s Bobem, vystupuje jako Alice. Pošle Alicin N_A.", color: "#e07a5f" },
    { from: "B", to: "M(A)", text: "E_{VK_A}(N_A, N_B)", note: "Bob odpoví Alici (přes Malloryho jako prostředníka).", color: "#e07a5f" },
    { from: "M", to: "A", text: "E_{VK_A}(N_A, N_B)", note: "Mallory přepošle Bobovu odpověď Alici. Alice myslí, že to dostala od Malloryho.", color: "#e07a5f" },
    { from: "A", to: "M", text: "E_{VK_M}(N_B)", note: "Alice pošle N_B zpět (svému domnělému partnerovi Malorymu).", color: "#e07a5f" },
    { from: "M(A)", to: "B", text: "E_{VK_B}(N_B)", note: "Mallory dešifruje, přepošle Bobovi. Bob věří, že komunikuje s Alicí. Mallory zná všechny nonce.", color: "#e07a5f" },
    { from: "Oprava", to: "", text: "Lowe (1996): B→A: E_{VK_A}(N_A, N_B, B) — identita B v zprávě brání MITM.", note: "Pokud B explicitně zařadí svou identitu do podepsané zprávy, Mallory by musel mít VK_A, aby vyrobil falešnou zprávu jménem Mallory s identitou Mallory uvnitř.", color: "#81b29a" },
  ],
};

const NODES = {
  A: { x: 80, y: 60, label: "Alice (A)" },
  B: { x: 460, y: 60, label: "Bob (B)" },
  S: { x: 270, y: 30, label: "KDC (S)" },
  M: { x: 270, y: 200, label: "Mallory" },
  "M(A)": { x: 270, y: 200, label: "Mallory" },
};

export default function NeedhamSchroeder() {
  const [scenario, setScenario] = useState(Object.keys(SCENARIOS)[0]);
  const [step, setStep] = useState(0);
  const steps = SCENARIOS[scenario];
  const W = 540, H = 260;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        {Object.keys(SCENARIOS).map((k) => (
          <button key={k} className="viz-btn" data-active={scenario === k} onClick={() => { setScenario(k); setStep(0); }}>{k}</button>
        ))}
      </div>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>◀</button>
        <span className="viz-readout">krok {step + 1} / {steps.length}</span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>▶</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 620 }}>
        <defs>
          <marker id="aNsA" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
        {Object.entries(NODES).filter(([k]) => {
          if (scenario === "Normální průběh") return ["A", "S", "B"].includes(k);
          if (scenario === "Denning-Sacco replay") return ["A", "B", "M"].includes(k);
          return ["A", "B", "M"].includes(k);
        }).map(([k, n]) => (
          <g key={k}>
            <rect x={n.x - 50} y={n.y - 20} width={100} height={40} rx={6}
              fill={k === "M" || k === "M(A)" ? "#3a1a1a" : "var(--bg-inset)"}
              stroke={k === "M" || k === "M(A)" ? "#e07a5f" : "var(--accent)"} />
            <text x={n.x} y={n.y + 4} fontSize="11" fill="var(--text)" textAnchor="middle">{n.label}</text>
          </g>
        ))}
        {steps.slice(0, step + 1).map((s, i) => {
          const from = NODES[s.from], to = NODES[s.to];
          if (!from || !to) return null;
          const isCurrent = i === step;
          const offset = i * 5 - 10;
          const midX = (from.x + to.x) / 2 + offset, midY = (from.y + to.y) / 2;
          return (
            <g key={i} opacity={isCurrent ? 1 : 0.35}>
              <path d={`M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`}
                stroke={s.color} strokeWidth={isCurrent ? 2 : 1} fill="none" markerEnd="url(#aNsA)" />
            </g>
          );
        })}
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: steps[step].color, marginBottom: 4, fontFamily: "var(--font-mono)" }}>
          {steps[step].from} → {steps[step].to}: {steps[step].text}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{steps[step].note}</div>
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
