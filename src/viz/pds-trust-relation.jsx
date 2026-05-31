// Důvěra: asymetrická tranzitivní relace. Referral (doporučující) vs derived
// (odvozená) důvěra. Klikni na hranu — vysvětlí se její typ a zvýrazní řetězec.
import { useState } from "react";

const NODES = {
  A: { x: 70, y: 50, label: "Alice" },
  B: { x: 200, y: 50, label: "Bob" },
  C: { x: 330, y: 50, label: "Claire" },
};

// Scénář popsán pevnou prózou pro každý vybraný typ hrany.
const STEPS = [
  {
    id: "referral",
    label: "referral (doporučení)",
    desc: "Bob důvěřuje Alici, ŽE UMÍ DOBŘE PORADIT, komu věřit. To je referral trust — důvěra v doporučení, ne v samotnou transakci.",
    highlight: ["AB"],
  },
  {
    id: "direct",
    label: "přímá důvěra",
    desc: "Alice má přímou zkušenost s Claire a důvěřuje jí. Tuto důvěru může Bobovi doporučit.",
    highlight: ["AC"],
  },
  {
    id: "derived",
    label: "derived (odvozená)",
    desc: "Protože Bob věří doporučení Alice (referral) a Alice věří Claire (přímo), Bob si ODVODÍ důvěru ke Claire — derived trust. Bez referral kroku by řetězec nešel uzavřít.",
    highlight: ["AB", "AC", "BC"],
  },
];

function arrow(from, to, lift, dashed, color, width) {
  const f = NODES[from], t = NODES[to];
  const mx = (f.x + t.x) / 2;
  const my = (f.y + t.y) / 2 - lift;
  return (
    <path
      d={`M ${f.x + (t.x > f.x ? 18 : -18)} ${f.y} Q ${mx} ${my} ${t.x + (t.x > f.x ? -18 : 18)} ${t.y}`}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? "5 4" : "0"}
      markerEnd="url(#trArrow)"
    />
  );
}

export default function PdsTrustRelation() {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const hi = (k) => cur.highlight.includes(k);
  const col = (k) => (hi(k) ? "var(--accent)" : "var(--line-strong)");
  const w = (k) => (hi(k) ? 2.4 : 1.4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox="0 0 400 150" style={{ width: "100%", maxWidth: 420 }}>
        <rect width="400" height="150" fill="var(--bg-inset)" rx="8" />

        {/* Alice -> Claire : direct trust (top long curve) */}
        {arrow("A", "C", 34, false, col("AC"), w("AC"))}
        <text x="200" y="14" textAnchor="middle" fontSize="11" fill={col("AC")} fontStyle="italic">
          přímá důvěra
        </text>

        {/* Bob -> Alice : referral (dashed back arrow, below) */}
        {arrow("B", "A", -22, true, col("AB"), w("AB"))}
        <text x="135" y="96" textAnchor="middle" fontSize="11" fill={col("AB")} fontStyle="italic">
          referral
        </text>

        {/* Bob -> Claire : derived (dashed, below) */}
        {arrow("B", "C", -22, true, col("BC"), w("BC"))}
        <text x="265" y="96" textAnchor="middle" fontSize="11" fill={col("BC")} fontStyle="italic">
          derived
        </text>

        {/* nodes */}
        {Object.entries(NODES).map(([id, n]) => (
          <g key={id}>
            <circle cx={n.x} cy={n.y} r="18" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--text)">
              {n.label}
            </text>
          </g>
        ))}

        <defs>
          <marker id="trArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 6 }}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className="btn ghost"
            style={{
              flex: 1,
              padding: "5px 6px",
              fontSize: 11.5,
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: i === step ? "var(--accent-soft)" : "var(--bg-card)",
              color: i === step ? "var(--accent)" : "var(--text-muted)",
              fontWeight: i === step ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {cur.desc}
      </div>
    </div>
  );
}
