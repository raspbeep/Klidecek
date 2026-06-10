// pdi-mom-models — Point-to-Point (fronta, 1 konzument, load balancing)
// vs Publish-Subscribe (téma, doručení 1:N). Přepni model a pošli zprávu;
// sleduj, kdo ji dostane. V PTP rotuje příjemce (round-robin), v Pub/Sub
// ji dostanou všichni odběratelé.
import { useState } from "react";

const W = 520, H = 200;
const CONSUMERS = [
  { id: "C1", y: 55 },
  { id: "C2", y: 110 },
  { id: "C3", y: 165 },
];
const PROD_X = 60, HUB_X = 250, CONS_X = 430;

export default function PdiMomModels() {
  const [model, setModel] = useState("ptp"); // "ptp" | "pubsub"
  const [sent, setSent] = useState(0);       // počet odeslaných zpráv
  const [rr, setRr] = useState(0);           // round-robin ukazatel pro PTP

  const isPtp = model === "ptp";

  // Kdo dostane aktuálně poslední zprávu?
  let receivers = [];
  if (sent > 0) {
    if (isPtp) receivers = [CONSUMERS[(rr - 1 + CONSUMERS.length) % CONSUMERS.length].id];
    else receivers = CONSUMERS.map((c) => c.id);
  }

  const send = () => {
    setSent((n) => n + 1);
    if (isPtp) setRr((r) => (r + 1) % CONSUMERS.length);
  };
  const switchModel = (m) => { setModel(m); setSent(0); setRr(0); };

  const hubHue = isPtp ? 264 : 142;
  const hubLabel = isPtp ? "FRONTA (queue)" : "TÉMA (topic)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: 11.5 }}>model:</span>
        <button className="viz-btn" data-active={isPtp} onClick={() => switchModel("ptp")} style={isPtp ? { background: "oklch(0.62 0.14 264 / 0.2)", borderColor: "oklch(0.6 0.14 264)" } : undefined}>Point-to-Point</button>
        <button className="viz-btn" data-active={!isPtp} onClick={() => switchModel("pubsub")} style={!isPtp ? { background: "oklch(0.62 0.14 142 / 0.2)", borderColor: "oklch(0.6 0.14 142)" } : undefined}>Publish-Subscribe</button>
        <div style={{ flex: 1 }} />
        <button className="viz-btn primary" onClick={send}>▶ poslat zprávu</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* producent */}
        <rect x={PROD_X - 38} y={95} width={76} height={34} rx={6} fill="oklch(0.62 0.14 22 / 0.14)" stroke="oklch(0.6 0.16 22)" />
        <text x={PROD_X} y={109} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text)">producent</text>
        <text x={PROD_X} y={123} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{sent}× sent</text>

        {/* hub: fronta / téma */}
        <rect x={HUB_X - 46} y={88} width={92} height={48} rx={7}
          fill={`oklch(0.62 0.14 ${hubHue} / 0.16)`} stroke={`oklch(0.6 0.14 ${hubHue})`} strokeWidth="1.3" />
        <text x={HUB_X} y={106} textAnchor="middle" fontSize="9.5" fontWeight="600" fontFamily="var(--font-mono)" fill={`oklch(0.5 0.14 ${hubHue})`}>{hubLabel}</text>
        <text x={HUB_X} y={122} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{isPtp ? "1 zpráva → 1×" : "1 zpráva → N×"}</text>

        {/* producent → hub */}
        <line x1={PROD_X + 38} y1={112} x2={HUB_X - 46} y2={112} stroke="oklch(0.6 0.16 22)" strokeWidth="1.6" markerEnd="url(#mom-arr-r)" />

        {/* konzumenti */}
        {CONSUMERS.map((c, i) => {
          const got = receivers.includes(c.id);
          const subscribed = true; // všichni naslouchají
          const lineCol = got ? `oklch(0.55 0.16 ${hubHue})` : "var(--line-strong)";
          return (
            <g key={c.id}>
              <line x1={HUB_X + 46} y1={112} x2={CONS_X - 36} y2={c.y}
                stroke={lineCol} strokeWidth={got ? 1.9 : 1} strokeDasharray={got ? "0" : "3 3"}
                markerEnd={got ? "url(#mom-arr-g)" : undefined} />
              <rect x={CONS_X - 36} y={c.y - 16} width={80} height={32} rx={6}
                fill={got ? `oklch(0.62 0.14 ${hubHue} / 0.2)` : "var(--bg-card)"}
                stroke={got ? `oklch(0.6 0.14 ${hubHue})` : "var(--line)"} strokeWidth={got ? 1.4 : 1} />
              <text x={CONS_X + 4} y={c.y - 1} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text)">{c.id}</text>
              <text x={CONS_X + 4} y={c.y + 11} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)"
                fill={got ? `oklch(0.5 0.14 ${hubHue})` : "var(--text-faint)"}>
                {got ? "✓ doručeno" : isPtp ? "naslouchá" : "odběratel"}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="mom-arr-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.6 0.16 22)" />
          </marker>
          <marker id="mom-arr-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill={`oklch(0.55 0.16 ${hubHue})`} />
          </marker>
        </defs>
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {isPtp ? (
          <span><b style={{ color: "var(--text)" }}>Point-to-Point:</b> zprávu z fronty dostane <b>právě jeden</b> konzument. Více naslouchajících = automatické rozkládání zátěže (round-robin) mezi pracovní instance.</span>
        ) : (
          <span><b style={{ color: "var(--text)" }}>Publish-Subscribe:</b> zprávu z tématu dostanou <b>všichni</b> přihlášení odběratelé (1:N) — typicky pro plošné notifikace a události.</span>
        )}
      </div>
    </div>
  );
}
