// pdi-fault-tolerance — odolnost MapReduce: master sleduje workery přes
// heartbeaty; vyber scénář (pád uzlu vs. straggler) a krokuj, jak framework
// reaguje (re-exekuce na jiném uzlu / spekulativní záložní kopie).
import { useState } from "react";

const WORKERS = [
  { id: "W1", x: 130 },
  { id: "W2", x: 270 },
  { id: "W3", x: 410 },
];

function makeSteps(scenario) {
  if (scenario === "crash") {
    return [
      {
        title: "Běžný stav — heartbeaty proudí",
        detail: "Master pravidelně dostává heartbeat od každého workeru. Tři map tasky běží paralelně, každý nad svým splitem.",
        states: { W1: "run", W2: "run", W3: "run" },
        beats: ["W1", "W2", "W3"],
        log: ["W1 ♥ master", "W2 ♥ master", "W3 ♥ master"],
      },
      {
        title: "W2 přestal odpovídat",
        detail: "Heartbeat od W2 nedorazil v časovém limitu. Selhání uzlu je v clusteru z komoditního HW běžná událost, ne výjimka.",
        states: { W1: "run", W2: "dead", W3: "run" },
        beats: ["W1", "W3"],
        log: ["⚠ master: timeout heartbeatu W2"],
      },
      {
        title: "Re-exekuce tasku na jiném uzlu",
        detail: "Master označí W2 za mrtvý a jeho map task přeplánuje na zdravý uzel. Mezivýsledky map tasku byly jen lokálně na W2, takže se task musí spustit celý znovu — proto se restartují i hotové mapy padlého uzlu.",
        states: { W1: "run", W2: "dead", W3: "rerun" },
        beats: ["W1", "W3"],
        log: ["master: task W2 → přeplánován na W3", "W3 spouští náhradní map task"],
      },
      {
        title: "Dokončeno bez ztráty dat",
        detail: "Náhradní task doběhl. Díky idempotenci (deterministické Map/Reduce nad neměnným vstupem) je výsledek identický, jako by W2 nikdy nespadl.",
        states: { W1: "done", W2: "dead", W3: "done" },
        beats: ["W1", "W3"],
        log: ["✓ všechny tasky hotové", "výsledek nezávisí na selhání"],
      },
    ];
  }
  // straggler
  return [
    {
      title: "Běžný stav — heartbeaty proudí",
      detail: "Tři tasky běží. Master sleduje jejich postup, nejen živost.",
      states: { W1: "run", W2: "run", W3: "run" },
      beats: ["W1", "W2", "W3"],
      log: ["W1 ♥ 90 %", "W2 ♥ 30 %", "W3 ♥ 88 %"],
    },
    {
      title: "W2 je straggler (zpomalený)",
      detail: "W2 stále žije (heartbeat chodí), ale postupuje mnohem pomaleji než ostatní — třeba kvůli vadnému disku či sdílenému zatížení uzlu. Brzdí celou úlohu, protože job čeká na poslední task.",
      states: { W1: "done", W2: "slow", W3: "done" },
      beats: ["W1", "W2", "W3"],
      log: ["W1 ✓, W3 ✓", "W2 stále 35 % — straggler"],
    },
    {
      title: "Spekulativní exekuce — záložní kopie",
      detail: "Když se úloha blíží konci, master spustí záložní (spekulativní) kopii pomalého tasku na volném uzlu. Obě kopie běží souběžně.",
      states: { W1: "done", W2: "slow", W3: "backup" },
      beats: ["W1", "W2", "W3"],
      log: ["master: spekulativní kopie W2 → W3", "běží 2 kopie téhož tasku"],
    },
    {
      title: "Vyhrává rychlejší, druhá se zruší",
      detail: "Task je hotový, jakmile dokončí kteroukoli kopii. Zbylá běžící kopie se zabije (kill). Spekulativní exekuce zkracuje ocas (tail latency), za cenu pár procent přebytečných tasků.",
      states: { W1: "done", W2: "killed", W3: "done" },
      beats: ["W1", "W3"],
      log: ["✓ záložní kopie na W3 doběhla první", "kill pomalé kopie na W2"],
    },
  ];
}

const stateStyle = {
  run: { fill: "oklch(0.62 0.14 264 / 0.18)", stroke: "oklch(0.62 0.14 264)", label: "běží" },
  done: { fill: "oklch(0.62 0.14 142 / 0.22)", stroke: "oklch(0.6 0.14 142)", label: "hotovo" },
  dead: { fill: "oklch(0.62 0.18 22 / 0.10)", stroke: "oklch(0.62 0.18 22)", label: "✗ mrtvý" },
  rerun: { fill: "oklch(0.7 0.14 80 / 0.20)", stroke: "oklch(0.6 0.14 80)", label: "re-exekuce" },
  slow: { fill: "oklch(0.7 0.14 80 / 0.20)", stroke: "oklch(0.6 0.14 80)", label: "straggler" },
  backup: { fill: "oklch(0.7 0.14 320 / 0.20)", stroke: "oklch(0.6 0.14 320)", label: "záloha" },
  killed: { fill: "oklch(0.62 0.18 22 / 0.10)", stroke: "oklch(0.62 0.18 22)", label: "killed" },
};

const W = 540, H = 200;

export default function PdiFaultTolerance() {
  const [scenario, setScenario] = useState("crash");
  const [step, setStep] = useState(0);
  const steps = makeSteps(scenario);
  const cur = steps[Math.min(step, steps.length - 1)];
  const logs = steps.slice(0, step + 1).flatMap((s) => s.log);

  const setSc = (s) => { setScenario(s); setStep(0); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>scénář:</span>
        <button onClick={() => setSc("crash")} style={btn(scenario === "crash")}>pád uzlu</button>
        <button onClick={() => setSc("straggler")} style={btn(scenario === "straggler")}>straggler</button>
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={navBtn}>← předchozí</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>krok {step + 1} / {steps.length}</div>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1} style={navBtn}>další →</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* master */}
        <rect x={W / 2 - 55} y={12} width={110} height={34} rx={6} fill="var(--bg-inset)" stroke="var(--line-strong)" strokeWidth="1.2" />
        <text x={W / 2} y={33} textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--text)">master</text>

        {WORKERS.map((w) => {
          const st = stateStyle[cur.states[w.id]] || stateStyle.run;
          const beats = cur.beats.includes(w.id);
          return (
            <g key={w.id}>
              {/* heartbeat čára */}
              <line x1={w.x} y1={100} x2={W / 2} y2={46}
                stroke={beats ? "oklch(0.6 0.14 142)" : "oklch(0.62 0.18 22)"}
                strokeWidth="1" strokeDasharray={beats ? "3 3" : "1 4"} opacity={0.8} />
              {beats && <text x={(w.x + W / 2) / 2} y={(100 + 46) / 2 - 2} textAnchor="middle" fontSize="11" fill="oklch(0.55 0.14 142)">♥</text>}

              {/* worker box */}
              <rect x={w.x - 50} y={100} width={100} height={70} rx={8} fill={st.fill} stroke={st.stroke} strokeWidth="1.4" />
              <text x={w.x} y={122} textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--text)">{w.id}</text>
              <text x={w.x} y={140} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">map task</text>
              <text x={w.x} y={158} textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill={st.stroke}>{st.label}</text>
            </g>
          );
        })}
        <text x={20} y={92} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">♥ = heartbeat</text>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{cur.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{cur.detail}</div>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)", maxHeight: 70, overflowY: "auto" }}>
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "4px 10px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 4, cursor: "pointer",
  };
}
const navBtn = {
  fontFamily: "var(--font-mono)", fontSize: 11, padding: "4px 10px",
  background: "var(--bg-card)", color: "var(--text)",
  border: "1px solid var(--line)", borderRadius: 4, cursor: "pointer",
};
