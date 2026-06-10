// Two-phase commit (2PC) protokol — interaktivní průchod s injekcí selhání.
// Koordinátor a 2 účastníci. Můžeš ovlivnit hlasy a vyzkoušet pád koordinátora
// mezi fázemi (zablokovaný protokol).
import { useState } from "react";

const ACTORS = [
  { id: "C", label: "Koordinátor", x: 80, color: 264 },
  { id: "P1", label: "Účastník 1", x: 270, color: 22 },
  { id: "P2", label: "Účastník 2", x: 460, color: 142 },
];

function makeSteps(votes, coordCrash) {
  const steps = [
    {
      title: "Start — všichni v idle",
      detail: "Aplikace dokončila svou logiku a žádá koordinátora o commit. Žádné zprávy zatím neletěly.",
      msgs: [],
      states: { C: "idle", P1: "idle", P2: "idle" },
      log: [],
    },
    {
      title: "Fáze 1 — PREPARE: koordinátor žádá hlasování",
      detail: "Koordinátor pošle PREPARE všem účastníkům. Začíná fáze 1.",
      msgs: [{ from: "C", to: "P1", label: "PREPARE" }, { from: "C", to: "P2", label: "PREPARE" }],
      states: { C: "prepared", P1: "preparing", P2: "preparing" },
      log: ["C → P1: PREPARE", "C → P2: PREPARE"],
    },
    {
      title: `P1 hlasuje ${votes.p1}`,
      detail: votes.p1 === "VOTE-YES"
        ? "P1 zapsal změny do žurnálu (READY) a vrací VOTE-YES. Drží zámky, čeká na rozhodnutí."
        : "P1 nemůže commitnout (např. constraint violation, deadlock) — vrací VOTE-NO.",
      msgs: [{ from: "P1", to: "C", label: votes.p1, kind: votes.p1 === "VOTE-YES" ? "ok" : "bad" }],
      states: { C: "prepared", P1: votes.p1 === "VOTE-YES" ? "ready" : "abort", P2: "preparing" },
      log: [`P1 → C: ${votes.p1}`],
    },
    {
      title: `P2 hlasuje ${votes.p2}`,
      detail: votes.p2 === "VOTE-YES"
        ? "P2 zapsal do žurnálu READY a hlasuje YES."
        : "P2 hlasuje NO.",
      msgs: [{ from: "P2", to: "C", label: votes.p2, kind: votes.p2 === "VOTE-YES" ? "ok" : "bad" }],
      states: { C: "prepared", P1: votes.p1 === "VOTE-YES" ? "ready" : "abort", P2: votes.p2 === "VOTE-YES" ? "ready" : "abort" },
      log: [`P2 → C: ${votes.p2}`],
    },
  ];

  const allYes = votes.p1 === "VOTE-YES" && votes.p2 === "VOTE-YES";

  if (coordCrash) {
    steps.push({
      title: "💥 Koordinátor havaroval — protokol zablokován!",
      detail:
        "Koordinátor padl po PREPARE, ale před rozhodnutím. Účastníci v READY stavu drží zámky a neumějí samostatně commitnout ani rollbacknout (nevědí, jak hlasovali ostatní). Čekají, dokud se koordinátor nezotaví. Toto je hlavní slabina 2PC — proto se v moderních systémech používá SAGA.",
      msgs: [],
      states: { C: "crashed", P1: "blocked", P2: "blocked" },
      log: ["⚠ koordinátor padl", "P1 a P2 čekají — drží zámky"],
    });
  } else if (allYes) {
    steps.push({
      title: "Fáze 2 — COMMIT: všichni hlasovali YES",
      detail: "Koordinátor rozhodne o globálním commitu a pošle COMMIT všem účastníkům.",
      msgs: [{ from: "C", to: "P1", label: "COMMIT", kind: "ok" }, { from: "C", to: "P2", label: "COMMIT", kind: "ok" }],
      states: { C: "committed", P1: "committing", P2: "committing" },
      log: ["rozhodnutí: COMMIT (zapsáno do logu)", "C → P1: COMMIT", "C → P2: COMMIT"],
    });
    steps.push({
      title: "ACK od účastníků",
      detail: "Účastníci dokončili commit, uvolnili zámky a posílají ACK. Globální transakce úspěšně potvrzena.",
      msgs: [{ from: "P1", to: "C", label: "ACK" }, { from: "P2", to: "C", label: "ACK" }],
      states: { C: "done", P1: "done", P2: "done" },
      log: ["P1 → C: ACK", "P2 → C: ACK", "✓ globální COMMIT dokončen"],
    });
  } else {
    steps.push({
      title: "Fáze 2 — ROLLBACK: alespoň jeden hlas byl NO",
      detail: "Koordinátor rozhodne o globálním rollbacku. Pošle ROLLBACK všem účastníkům.",
      msgs: [{ from: "C", to: "P1", label: "ROLLBACK", kind: "bad" }, { from: "C", to: "P2", label: "ROLLBACK", kind: "bad" }],
      states: { C: "aborted", P1: "rollbacking", P2: "rollbacking" },
      log: ["rozhodnutí: ROLLBACK", "C → P1: ROLLBACK", "C → P2: ROLLBACK"],
    });
    steps.push({
      title: "ACK — všichni vrácení zpět",
      detail: "Účastníci uvolnili zámky a vrátili změny. Globální transakce zrušena, žádná data nezůstala.",
      msgs: [{ from: "P1", to: "C", label: "ACK" }, { from: "P2", to: "C", label: "ACK" }],
      states: { C: "done", P1: "rolled-back", P2: "rolled-back" },
      log: ["P1, P2 → C: ACK", "✗ globální ROLLBACK"],
    });
  }

  return steps;
}

const stateColors = {
  idle: { fill: "var(--bg-card)", text: "var(--text-muted)" },
  preparing: { fill: "oklch(0.62 0.14 65 / 0.20)", text: "oklch(0.40 0.18 65)" },
  prepared: { fill: "oklch(0.62 0.14 65 / 0.30)", text: "oklch(0.40 0.18 65)" },
  ready: { fill: "oklch(0.62 0.14 142 / 0.20)", text: "oklch(0.30 0.14 142)" },
  committing: { fill: "oklch(0.62 0.14 142 / 0.30)", text: "oklch(0.30 0.14 142)" },
  committed: { fill: "oklch(0.62 0.14 142 / 0.50)", text: "oklch(0.20 0.14 142)" },
  done: { fill: "oklch(0.62 0.14 142 / 0.40)", text: "oklch(0.25 0.14 142)" },
  abort: { fill: "oklch(0.62 0.18 22 / 0.25)", text: "oklch(0.40 0.18 22)" },
  rollbacking: { fill: "oklch(0.62 0.18 22 / 0.30)", text: "oklch(0.40 0.18 22)" },
  aborted: { fill: "oklch(0.62 0.18 22 / 0.40)", text: "oklch(0.35 0.18 22)" },
  "rolled-back": { fill: "oklch(0.62 0.18 22 / 0.30)", text: "oklch(0.35 0.18 22)" },
  crashed: { fill: "oklch(0.30 0.05 0)", text: "white" },
  blocked: { fill: "oklch(0.62 0.18 22 / 0.40)", text: "oklch(0.35 0.18 22)" },
};

export default function TwoPhaseCommit() {
  const [votes, setVotes] = useState({ p1: "VOTE-YES", p2: "VOTE-YES" });
  const [step, setStep] = useState(0);
  const [coordCrash, setCoordCrash] = useState(false);

  const steps = makeSteps(votes, coordCrash);
  const current = steps[Math.min(step, steps.length - 1)];
  const allLogs = steps.slice(0, step + 1).flatMap((s) => s.log);

  const reset = () => setStep(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Scenario config */}
      <div className="viz-controls">
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>scénář:</span>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>P1:</span>
          <select className="viz-select" value={votes.p1} onChange={(e) => { setVotes({ ...votes, p1: e.target.value }); reset(); }}>
            <option value="VOTE-YES">VOTE-YES</option>
            <option value="VOTE-NO">VOTE-NO</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>P2:</span>
          <select className="viz-select" value={votes.p2} onChange={(e) => { setVotes({ ...votes, p2: e.target.value }); reset(); }}>
            <option value="VOTE-YES">VOTE-YES</option>
            <option value="VOTE-NO">VOTE-NO</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 6 }}>
          <input type="checkbox" checked={coordCrash} onChange={(e) => { setCoordCrash(e.target.checked); reset(); }} />
          <span style={{ fontFamily: "var(--font-mono)" }}>💥 koordinátor padne po PREPARE</span>
        </label>
      </div>

      {/* Step controls */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step + 1} / {steps.length}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>další →</button>
      </div>

      {/* Sequence diagram */}
      <svg viewBox="0 0 560 260" style={{ width: "100%", maxWidth: 560 }}>
        <rect width="560" height="260" fill="var(--bg-inset)" />
        {ACTORS.map((a) => {
          const st = current.states[a.id];
          const c = stateColors[st] || stateColors.idle;
          return (
            <g key={a.id}>
              <rect x={a.x - 70} y={15} width="140" height="44" rx="6" fill={c.fill} stroke={`oklch(0.62 0.14 ${a.color})`} strokeWidth="1" />
              <text x={a.x} y={32} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text)">{a.label}</text>
              <text x={a.x} y={48} textAnchor="middle" fontSize="10.5" fill={c.text} fontFamily="var(--font-mono)" fontWeight="600">
                {st}
              </text>
              <line x1={a.x} y1={60} x2={a.x} y2={250} stroke="var(--line-strong)" strokeWidth="0.5" strokeDasharray="2 3" />
            </g>
          );
        })}

        {/* messages — distribute vertically */}
        {current.msgs.map((m, i) => {
          const from = ACTORS.find((a) => a.id === m.from);
          const to = ACTORS.find((a) => a.id === m.to);
          const y = 90 + i * 50;
          const color = m.kind === "bad" ? "oklch(0.55 0.18 22)" : m.kind === "ok" ? "oklch(0.55 0.18 142)" : "var(--text-muted)";
          return (
            <g key={i}>
              <line x1={from.x} y1={y} x2={to.x} y2={y} stroke={color} strokeWidth="1.8" markerEnd="url(#tpcA)" />
              <text x={(from.x + to.x) / 2} y={y - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill={color}>
                {m.label}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="tpcA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      {/* Step desc */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{current.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{current.detail}</div>
      </div>

      {/* Log */}
      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          Protocol log
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", maxHeight: 100, overflowY: "auto" }}>
          {allLogs.length === 0 ? <span style={{ color: "var(--text-faint)" }}>—</span> : allLogs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

