// SAGA pattern — interaktivní simulátor distribuované transakce s kompenzacemi.
// E-commerce sekvence: order → reservation → payment → shipping. Vyber, kde
// to selže, a sleduj, jak se postupně vyvolá kompenzace v opačném pořadí.
import { useState } from "react";

const STEPS_DEF = [
  { id: "order", title: "T₁  Vytvořit objednávku", service: "Order Service", compensation: "C₁  Zrušit objednávku" },
  { id: "reserve", title: "T₂  Rezervovat zboží", service: "Inventory Service", compensation: "C₂  Uvolnit rezervaci" },
  { id: "pay", title: "T₃  Stáhnout platbu", service: "Payment Service", compensation: "C₃  Vrátit peníze + storno" },
  { id: "ship", title: "T₄  Naplánovat dopravu", service: "Shipping Service", compensation: "C₄  Zrušit dopravu" },
];

const COLORS = [264, 22, 142, 80];

function makePhases(failAt) {
  const phases = [];
  // initial
  phases.push({
    desc: "Začátek — všechny lokální transakce čekají.",
    status: STEPS_DEF.map(() => "pending"),
    compStatus: STEPS_DEF.map(() => "none"),
    log: ["Saga zahájena"],
  });

  for (let i = 0; i < STEPS_DEF.length; i++) {
    const willFail = failAt === i;
    if (willFail) {
      phases.push({
        desc: `${STEPS_DEF[i].title} — selhání. ${STEPS_DEF[i].service} hlásí chybu.`,
        status: [
          ...phases[phases.length - 1].status.slice(0, i),
          "failed",
          ...STEPS_DEF.slice(i + 1).map(() => "pending"),
        ],
        compStatus: phases[phases.length - 1].compStatus,
        log: [...phases[phases.length - 1].log, `✗ ${STEPS_DEF[i].title} selhalo`],
      });
      // compensations in reverse
      for (let j = i - 1; j >= 0; j--) {
        phases.push({
          desc: `Kompenzace: ${STEPS_DEF[j].compensation}. ${STEPS_DEF[j].service} vrací efekt T${j + 1}.`,
          status: phases[phases.length - 1].status,
          compStatus: [
            ...phases[phases.length - 1].compStatus.slice(0, j),
            "running",
            ...phases[phases.length - 1].compStatus.slice(j + 1),
          ],
          log: [...phases[phases.length - 1].log, `↩ ${STEPS_DEF[j].compensation} běží`],
        });
        phases.push({
          desc: `${STEPS_DEF[j].compensation} hotová.`,
          status: phases[phases.length - 1].status,
          compStatus: [
            ...phases[phases.length - 1].compStatus.slice(0, j),
            "done",
            ...phases[phases.length - 1].compStatus.slice(j + 1),
          ],
          log: [...phases[phases.length - 1].log, `✓ ${STEPS_DEF[j].compensation} dokončena`],
        });
      }
      phases.push({
        desc: "Saga zrušena. Žádný krok nezůstal v efektu — systém je v původním stavu (eventual consistency).",
        status: phases[phases.length - 1].status,
        compStatus: phases[phases.length - 1].compStatus,
        log: [...phases[phases.length - 1].log, "✗ Saga ABORTED — všechny kompenzace dokončeny"],
        terminal: "fail",
      });
      return phases;
    } else {
      phases.push({
        desc: `${STEPS_DEF[i].title} úspěšně. ${STEPS_DEF[i].service} commitne svou lokální transakci a publikuje událost.`,
        status: [
          ...phases[phases.length - 1].status.slice(0, i),
          "done",
          ...STEPS_DEF.slice(i + 1).map(() => "pending"),
        ],
        compStatus: phases[phases.length - 1].compStatus,
        log: [...phases[phases.length - 1].log, `✓ ${STEPS_DEF[i].title} commit`],
      });
    }
  }

  phases.push({
    desc: "Všechny kroky úspěšné. Saga dokončena. Systém je nyní konzistentní s objednávkou.",
    status: STEPS_DEF.map(() => "done"),
    compStatus: phases[phases.length - 1].compStatus,
    log: [...phases[phases.length - 1].log, "✓ Saga COMPLETED"],
    terminal: "ok",
  });
  return phases;
}

const statusColor = {
  pending: { fill: "var(--bg-card)", border: "var(--line)", text: "var(--text-faint)", icon: "·" },
  done: { fill: "oklch(0.62 0.14 142 / 0.30)", border: "oklch(0.55 0.18 142)", text: "oklch(0.30 0.14 142)", icon: "✓" },
  failed: { fill: "oklch(0.62 0.18 22 / 0.30)", border: "oklch(0.55 0.18 22)", text: "oklch(0.40 0.18 22)", icon: "✗" },
};
const compColor = {
  none: { fill: "var(--bg-card)", border: "var(--line)", text: "var(--text-faint)", icon: "·" },
  running: { fill: "oklch(0.62 0.14 80 / 0.30)", border: "oklch(0.55 0.18 80)", text: "oklch(0.40 0.18 80)", icon: "↩" },
  done: { fill: "oklch(0.62 0.14 80 / 0.50)", border: "oklch(0.55 0.18 80)", text: "oklch(0.30 0.14 80)", icon: "✓" },
};

export default function Saga() {
  const [failAt, setFailAt] = useState(2);
  const [step, setStep] = useState(0);

  const phases = makePhases(failAt);
  const current = phases[Math.min(step, phases.length - 1)];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Scenario */}
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, fontSize: 11.5, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>scénář:</span>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>selhat v kroku:</span>
          <select className="viz-select" value={failAt} onChange={(e) => { setFailAt(parseInt(e.target.value)); setStep(0); }}>
            {STEPS_DEF.map((s, i) => (
              <option key={i} value={i}>T{i + 1} — {s.title.split("  ")[1]}</option>
            ))}
            <option value={-1}>(žádné selhání — Saga COMPLETED)</option>
          </select>
        </label>
      </div>

      {/* Step controls */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step + 1} / {phases.length}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(phases.length - 1, step + 1))} disabled={step === phases.length - 1}>další →</button>
        <button className="viz-btn" style={{ marginLeft: 6 }} onClick={() => setStep(0)}>↺</button>
      </div>

      {/* Forward steps */}
      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 8 }}>
        <div style={panelHeadStyle}>Forward transakce (T₁ → T₄)</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STEPS_DEF.map((st, i) => {
            const s = current.status[i];
            const c = statusColor[s];
            return (
              <div key={i} style={{
                flex: "1 1 110px", minWidth: 110, padding: 8,
                background: c.fill, border: `1.5px solid ${c.border}`, borderRadius: 6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text)" }}>T{i + 1}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{c.icon}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.3 }}>
                  {st.title.split("  ")[1]}
                </div>
                <div style={{ fontSize: 9.5, color: "var(--text-muted)", fontStyle: "italic", marginTop: 2 }}>
                  {st.service}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compensations (only show if any) */}
      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 8 }}>
        <div style={panelHeadStyle}>Kompenzace (Cₙ ← C₁, v opačném pořadí)</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STEPS_DEF.map((st, i) => {
            const cs = current.compStatus[i];
            const c = compColor[cs];
            return (
              <div key={i} style={{
                flex: "1 1 110px", minWidth: 110, padding: 8,
                background: c.fill, border: `1.5px dashed ${c.border}`, borderRadius: 6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text)" }}>C{i + 1}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{c.icon}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.3 }}>
                  {st.compensation.split("  ")[1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current description */}
      <div style={{
        padding: 10,
        background: current.terminal === "fail"
          ? "oklch(0.62 0.18 22 / 0.10)"
          : current.terminal === "ok"
            ? "oklch(0.62 0.14 142 / 0.10)"
            : "var(--bg-card)",
        border: `1px solid ${
          current.terminal === "fail" ? "oklch(0.55 0.18 22)" :
          current.terminal === "ok" ? "oklch(0.55 0.14 142)" : "var(--line)"}`,
        borderRadius: 6, fontSize: 12.5, color: "var(--text)", lineHeight: 1.5,
      }}>
        {current.desc}
      </div>

      {/* Event log */}
      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={panelHeadStyle}>Event log</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", maxHeight: 120, overflowY: "auto" }}>
          {current.log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

const panelHeadStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 8,
};
