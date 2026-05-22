// Count-to-infinity in distance-vector routing.
// A — B — C — dst. When A↔dst fails, naive DV bounces metrics up forever
// (until ∞ = 16 in RIP). Toggle defense: none / split horizon / poison reverse.
import { useState } from "react";

const INF = 16;

export default function CountToInf() {
  const [defense, setDefense] = useState("none");
  const [broken, setBroken] = useState(false);
  const [step, setStep] = useState(0);
  const [dA, setDA] = useState(1);   // A's distance to dst
  const [dB, setDB] = useState(2);   // B's
  const [dC, setDC] = useState(3);   // C's
  const [log, setLog] = useState([]);

  const reset = (newDefense = defense) => {
    setDefense(newDefense);
    setBroken(false);
    setStep(0);
    setDA(1); setDB(2); setDC(3);
    setLog([]);
  };

  const breakLink = () => {
    // Set link broken; A loses route to dst.
    setBroken(true);
    setDA(INF);
    setStep(1);

    // Run several update rounds based on chosen defense.
    let b = dB, c = dC;
    const messages = ["A: cesta k cíli padla — A inzeruje d=∞"];

    for (let i = 0; i < 10; i++) {
      if (defense === "none" || defense === "maximum") {
        // B believes C can still reach (B → C → B loop), so B = c + 1
        const newB = Math.min(INF, c + 1);
        const newC = Math.min(INF, newB + 1);
        messages.push(
          defense === "none"
            ? `iter ${i + 1}: B=${newB} (přes C, ten neví), C=${newC}`
            : `iter ${i + 1}: B=${newB}, C=${newC} (limit 16 = ∞)`,
        );
        b = newB; c = newC;
        if (b >= INF && c >= INF) break;
      } else if (defense === "splithorizon") {
        b = INF; c = INF;
        messages.push("Split Horizon — B i C nepošlou info zpět směrem, odkud přišlo. ∞ se šíří přímo.");
        break;
      } else if (defense === "poison") {
        b = INF; c = INF;
        messages.push("Poison Reverse — A explicitně inzeruje d=∞. B i C okamžitě 16.");
        break;
      }
    }
    setDB(b); setDC(c);
    setLog(messages);
  };

  const W = 460, H = 200;
  const nodes = [
    { id: "dst", x: 60, y: 95, label: "cíl" },
    { id: "A", x: 165, y: 95, val: dA },
    { id: "B", x: 290, y: 95, val: dB },
    { id: "C", x: 410, y: 95, val: dC },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* edges */}
        <line x1={75} y1={95} x2={150} y2={95}
          stroke={broken ? "oklch(0.60 0.18 25)" : "var(--accent)"}
          strokeWidth="2.5"
          strokeDasharray={broken ? "4 3" : "none"} />
        {broken && (
          <text x={112} y={86} textAnchor="middle"
            fontSize="14" fontWeight="700" fill="oklch(0.60 0.18 25)">✗</text>
        )}
        <line x1={180} y1={95} x2={275} y2={95} stroke="var(--accent)" strokeWidth="2" />
        <line x1={305} y1={95} x2={395} y2={95} stroke="var(--accent)" strokeWidth="2" />

        {/* nodes */}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="15"
              fill="var(--bg-card)"
              stroke={n.val >= INF ? "oklch(0.60 0.18 25)" : "var(--accent)"}
              strokeWidth="1.5" />
            <text x={n.x} y={n.y + 3.5} textAnchor="middle"
              fontSize="11" fontFamily="var(--font-mono)" fontWeight="700"
              fill="var(--text)">
              {n.id}
            </text>
            {n.val != null && (
              <text x={n.x} y={n.y + 32} textAnchor="middle"
                fontSize="9" fontFamily="var(--font-mono)"
                fill={n.val >= INF ? "oklch(0.60 0.18 25)" : "var(--accent)"}>
                d→cíl = {n.val >= INF ? "∞" : n.val}
              </text>
            )}
            {n.label && (
              <text x={n.x} y={n.y - 22} textAnchor="middle"
                fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                {n.label}
              </text>
            )}
          </g>
        ))}

        {/* log overlay */}
        <g>
          {log.slice(-4).map((line, i) => (
            <text key={`l-${i}`} x={W / 2} y={H - 36 + i * 11}
              textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
              fill={i === log.slice(-4).length - 1 ? "var(--text)" : "var(--text-muted)"}>
              {line}
            </text>
          ))}
        </g>
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
        fontSize: 12 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>obrana:</span>
          <select value={defense}
            onChange={(e) => reset(e.target.value)}
            style={{ padding: "2px 4px", border: "1px solid var(--line-strong)",
              borderRadius: 3, background: "var(--bg-card)", color: "var(--text)",
              fontSize: 12 }}>
            <option value="none">žádná</option>
            <option value="maximum">maximum = 16</option>
            <option value="splithorizon">split horizon</option>
            <option value="poison">poison reverse</option>
          </select>
        </label>
        <button className="btn" onClick={breakLink} disabled={broken}>
          ✗ shoď A↔cíl
        </button>
        <button className="btn ghost" onClick={() => reset(defense)}>reset</button>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        {defense === "none" && "Bez obrany: B se ptá C, C se ptá B (B→C→B smyčka). Metrika se vyšplhá k ∞ pomalu — RIP konverguje minuty."}
        {defense === "maximum" && "Maximum 16: ∞ je definované, ale nezabrání bouncingu — jen ho ukončí (po 16 iteracích)."}
        {defense === "splithorizon" && "Split horizon: router neinzeruje cestu zpět po směru, odkud ji slyšel. B se C neptá → ∞ se rozšíří v 1 iteraci."}
        {defense === "poison" && "Poison reverse: silnější verze SH — explicitně inzeruje d=∞ zpět po směru. Zastaví i kombinace failů."}
      </div>
    </div>
  );
}
