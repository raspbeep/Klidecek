// 5-stage MIPS pipeline visualizer with hazard detection and forwarding.
import { useState } from "react";

const STAGES = ["IF", "ID", "EX", "MA", "WB"];
// WB uses a deeper teal (not a pale cyan) so the white label keeps enough contrast.
const STAGE_COLORS = ["#5b8def", "#7c5bef", "#ef5b8d", "#ef8d5b", "#1a8f9e"];

const PROGRAMS = {
  noHazards: {
    name: "Bez konfliktů",
    insts: [
      { id: 0, txt: "add r1, r2, r3", dst: "r1", src: ["r2", "r3"], type: "alu" },
      { id: 1, txt: "sub r4, r5, r6", dst: "r4", src: ["r5", "r6"], type: "alu" },
      { id: 2, txt: "mul r7, r8, r9", dst: "r7", src: ["r8", "r9"], type: "alu" },
      { id: 3, txt: "or  r10,r11,r12", dst: "r10", src: ["r11", "r12"], type: "alu" },
    ],
  },
  rawHazard: {
    name: "RAW konflikt (EX→EX bypass)",
    insts: [
      { id: 0, txt: "add r1, r2, r3", dst: "r1", src: ["r2", "r3"], type: "alu" },
      { id: 1, txt: "sub r4, r1, r5", dst: "r4", src: ["r1", "r5"], type: "alu" },
      { id: 2, txt: "or  r6, r4, r7", dst: "r6", src: ["r4", "r7"], type: "alu" },
      { id: 3, txt: "and r8, r9, r10", dst: "r8", src: ["r9", "r10"], type: "alu" },
    ],
  },
  loadUse: {
    name: "Load-use stall (1 takt)",
    insts: [
      { id: 0, txt: "lw  r4, 0(r1)", dst: "r4", src: ["r1"], type: "load" },
      { id: 1, txt: "add r5, r4, r2", dst: "r5", src: ["r4", "r2"], type: "alu" },
      { id: 2, txt: "sub r6, r5, r3", dst: "r6", src: ["r5", "r3"], type: "alu" },
      { id: 3, txt: "or  r7, r8, r9", dst: "r7", src: ["r8", "r9"], type: "alu" },
    ],
  },
};

function simulate(insts, forwarding) {
  const schedule = [];
  for (let i = 0; i < insts.length; i++) {
    const inst = insts[i];
    const prev = i > 0 ? schedule[i - 1] : null;

    // Structural constraints of an in-order pipe: one unit per stage, so a
    // younger instruction can never share a stage with an older one. Fetch when
    // the predecessor leaves IF (enters ID); decode after our own fetch AND
    // after the predecessor vacates ID (which happens when it enters EX);
    // execute after our own decode AND after the predecessor vacates EX.
    const IF = prev ? prev.ID : 0;
    const ID = Math.max(IF + 1, prev ? prev.EX : 0);
    let EX = Math.max(ID + 1, prev ? prev.EX + 1 : 0);

    // Data hazard (RAW): hold in ID until every source operand is ready. Take
    // the latest over all producers — the closest is usually the binding one,
    // but scanning all is robust if the programs grow.
    for (let j = i - 1; j >= 0; j--) {
      const p = insts[j];
      if (p.dst && inst.src.includes(p.dst)) {
        let ready;
        if (p.type === "load") ready = schedule[j].MA + 1; // load value ready end of MA
        else if (forwarding) ready = schedule[j].EX + 1; // ALU result forwarded end of EX
        else ready = schedule[j].WB + 1; // no forwarding: wait for write-back
        if (ready > EX) EX = ready;
      }
    }

    schedule.push({ IF, ID, EX, MA: EX + 1, WB: EX + 2 });
  }
  return schedule;
}

const CELL = 36;
const ROW = 30;
const LABEL_W = 130;

export default function PipelineHazards() {
  const [progKey, setProgKey] = useState("rawHazard");
  const [forwarding, setForwarding] = useState(true);
  const prog = PROGRAMS[progKey];
  const schedule = simulate(prog.insts, forwarding);
  const maxCycle = Math.max(...schedule.map((s) => s.WB)) + 1;
  const W = LABEL_W + maxCycle * CELL + 20;
  const H = prog.insts.length * ROW + 60;

  const n = prog.insts.length;
  const totalCycles = schedule[schedule.length - 1].WB + 1;
  // An ideal (stall-free) 5-stage run of n instructions takes n + 4 cycles
  // (first WB at cycle 4, then one per cycle). Everything above that is stalls.
  const stalls = totalCycles - (n + 4);
  // Pipeline CPI = base CPI (1) + stall cycles per instruction. Steady-state
  // metric, so "no conflicts" reads as 1.00 regardless of the short sample.
  const cpi = 1 + stalls / n;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <select
          value={progKey}
          onChange={(e) => setProgKey(e.target.value)}
          style={{
            background: "var(--bg-inset)",
            color: "var(--text)",
            border: "1px solid var(--line)",
            padding: "4px 8px",
            borderRadius: 4,
          }}
        >
          {Object.keys(PROGRAMS).map((k) => (
            <option key={k} value={k}>
              {PROGRAMS[k].name}
            </option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text)" }}>
          <input
            type="checkbox"
            checked={forwarding}
            onChange={(e) => setForwarding(e.target.checked)}
          />
          Forwarding (bypass)
        </label>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
          Stall cykly: {stalls} · CPI = {cpi.toFixed(2)} (ideál: 1.00)
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", maxWidth: 700, fontFamily: "ui-sans-serif, system-ui" }}
      >
        {/* Cycle header */}
        <g fontSize="10" fill="var(--text-muted)" textAnchor="middle">
          {Array.from({ length: maxCycle }).map((_, c) => (
            <text key={c} x={LABEL_W + c * CELL + CELL / 2} y={15}>
              t{c}
            </text>
          ))}
        </g>

        {/* Grid lines */}
        <g stroke="var(--line)" strokeWidth="0.4">
          {Array.from({ length: maxCycle + 1 }).map((_, c) => (
            <line
              key={c}
              x1={LABEL_W + c * CELL}
              y1={25}
              x2={LABEL_W + c * CELL}
              y2={H - 25}
            />
          ))}
          {prog.insts.map((_, i) => (
            <line
              key={i}
              x1={0}
              y1={25 + i * ROW}
              x2={LABEL_W + maxCycle * CELL}
              y2={25 + i * ROW}
            />
          ))}
        </g>

        {/* Instructions and stages */}
        {prog.insts.map((inst, i) => {
          const s = schedule[i];
          return (
            <g key={i}>
              <text
                x={5}
                y={25 + i * ROW + ROW / 2 + 4}
                fill="var(--text)"
                fontFamily="ui-monospace, monospace"
                fontSize="11"
              >
                {inst.txt}
              </text>
              {/* Stall bubbles: every cycle the instruction is held between IF
                  and EX — waiting in IF behind an older stall, or in ID for an
                  operand. ID itself is a real stage, so skip it. */}
              {Array.from({ length: Math.max(0, s.EX - s.IF - 1) }).map((_, k) => {
                const c = s.IF + 1 + k;
                if (c === s.ID) return null;
                return (
                  <g key={"bubble" + c}>
                    <rect
                      x={LABEL_W + c * CELL + 2}
                      y={25 + i * ROW + 3}
                      width={CELL - 4}
                      height={ROW - 6}
                      fill="var(--bg-inset)"
                      stroke="var(--text-faint)"
                      strokeDasharray="2 2"
                      rx="2"
                    />
                    <text
                      x={LABEL_W + c * CELL + CELL / 2}
                      y={25 + i * ROW + ROW / 2 + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill="var(--text-faint)"
                    >
                      —
                    </text>
                  </g>
                );
              })}
              {STAGES.map((stage, si) => {
                const cyc = s[stage];
                return (
                  <g key={stage}>
                    <rect
                      x={LABEL_W + cyc * CELL + 2}
                      y={25 + i * ROW + 3}
                      width={CELL - 4}
                      height={ROW - 6}
                      fill={STAGE_COLORS[si]}
                      opacity="0.7"
                      rx="2"
                    />
                    <text
                      x={LABEL_W + cyc * CELL + CELL / 2}
                      y={25 + i * ROW + ROW / 2 + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      fontWeight="600"
                    >
                      {stage}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Footer */}
        <text
          x={W / 2}
          y={H - 5}
          textAnchor="middle"
          fill="var(--text-faint)"
          fontSize="10"
        >
          {forwarding
            ? "Forwarding zapnut: bypass EX→EX, MA→EX. Load-use stále 1 stall."
            : "Bez forwardingu: RAW = čekání na WB. Hodně stallů."}
        </text>
      </svg>
    </div>
  );
}
