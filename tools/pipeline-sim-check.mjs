// Ground-truth checker for the pipeline-hazards viz simulate() logic.
// Runs all 3 programs × forwarding {on,off}, prints the per-cycle stage
// occupancy table, and flags STRUCTURAL COLLISIONS (two instructions in the
// same pipeline stage in the same cycle — impossible with one unit per stage).

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

// ---- CURRENT (buggy) simulate, copied verbatim from pipeline-hazards.jsx ----
function simulateCurrent(insts, forwarding) {
  const schedule = [];
  for (let i = 0; i < insts.length; i++) {
    const inst = insts[i];
    let startIF;
    if (i === 0) startIF = 0;
    else startIF = schedule[i - 1].IF + 1;
    let startID = startIF + 1;
    let startEX = startID + 1;
    for (let j = i - 1; j >= 0; j--) {
      const prev = insts[j];
      if (prev.dst && inst.src.includes(prev.dst)) {
        let availableAt;
        if (prev.type === "load") availableAt = schedule[j].MA + 1;
        else if (forwarding) availableAt = schedule[j].EX + 1;
        else availableAt = schedule[j].WB + 1;
        if (availableAt > startEX) {
          const delay = availableAt - startEX;
          startEX += delay;
          startID += delay;
        }
        break;
      }
    }
    schedule.push({ IF: startIF, ID: startID, EX: startEX, MA: startEX + 1, WB: startEX + 2 });
  }
  return schedule;
}

// ---- PROPOSED FIX: constraint-based in-order pipeline ----
// IF[i]   = firstID[i-1]                          (fetch when predecessor leaves IF)
// ID[i]   = max(IF[i]+1, EX[i-1])                 (decode after own fetch & after pred leaves ID)
// EX[i]   = max(ID[i]+1, EX[i-1]+1, operandReady) (execute after decode, pred's EX, operands)
function simulateFixed(insts, forwarding) {
  const sched = [];
  for (let i = 0; i < insts.length; i++) {
    const inst = insts[i];
    const prev = i > 0 ? sched[i - 1] : null;
    const IF = prev ? prev.ID : 0;
    const ID = Math.max(IF + 1, prev ? prev.EX : 0);
    let EX = Math.max(ID + 1, prev ? prev.EX + 1 : 0);
    for (let j = i - 1; j >= 0; j--) {
      const p = insts[j];
      if (p.dst && inst.src.includes(p.dst)) {
        let ready;
        if (p.type === "load") ready = sched[j].MA + 1;      // load: value end of MA
        else if (forwarding) ready = sched[j].EX + 1;        // alu fwd: end of EX
        else ready = sched[j].WB + 1;                        // no fwd: after WB
        if (ready > EX) EX = ready;
        // no break: take the latest over ALL producers (matches the jsx)
      }
    }
    sched.push({ IF, ID, EX, MA: EX + 1, WB: EX + 2 });
  }
  return sched;
}

function check(label, sched, insts) {
  // collision detection: map "stage@cycle" -> instruction indices
  const occ = {};
  const collisions = [];
  sched.forEach((s, i) => {
    for (const st of ["IF", "ID", "EX", "MA", "WB"]) {
      const key = `${st}@${s[st]}`;
      if (occ[key] !== undefined) collisions.push({ stage: st, cycle: s[st], a: occ[key], b: i });
      occ[key] = i;
    }
  });
  const last = sched[sched.length - 1].WB;
  const n = insts.length;
  const totalCycles = last + 1;
  const stalls = totalCycles - (n + 4);
  const cpi = 1 + stalls / n; // base CPI 1 + stall cycles per instruction

  // render an ASCII gantt
  const maxC = last + 1;
  let out = `\n=== ${label} ===\n`;
  out += "      " + Array.from({ length: maxC }, (_, c) => `t${c}`.padEnd(4)).join("") + "\n";
  sched.forEach((s, i) => {
    const cells = Array.from({ length: maxC }, () => " .  ");
    for (const st of ["IF", "ID", "EX", "MA", "WB"]) cells[s[st]] = st.padEnd(2) + "  ";
    // mark bubble cells (between IF and EX, excluding ID)
    for (let c = s.IF + 1; c < s.EX; c++) if (c !== s.ID) cells[c] = "--  ";
    out += insts[i].txt.padEnd(16).slice(0, 6) + cells.join("") + "\n";
  });
  out += `stall cykly = ${stalls}  |  CPI = ${cpi.toFixed(2)}  |  collisions: ${collisions.length}`;
  if (collisions.length) {
    out += "  <<< STRUCTURAL COLLISION";
    collisions.forEach((c) => {
      out += `\n   ! ${c.stage}@t${c.cycle}: "${insts[c.a].txt.trim()}" AND "${insts[c.b].txt.trim()}" both in ${c.stage}`;
    });
  }
  return { out, collisions: collisions.length, cpi };
}

let totalCur = 0, totalFix = 0;
for (const key of Object.keys(PROGRAMS)) {
  for (const fwd of [true, false]) {
    const insts = PROGRAMS[key].insts;
    const tag = `${PROGRAMS[key].name} | forwarding=${fwd}`;
    const cur = check(`CURRENT  ${tag}`, simulateCurrent(insts, fwd), insts);
    const fix = check(`FIXED    ${tag}`, simulateFixed(insts, fwd), insts);
    console.log(cur.out);
    console.log(fix.out);
    totalCur += cur.collisions;
    totalFix += fix.collisions;
  }
}
console.log(`\n\nTOTAL collisions — CURRENT: ${totalCur}   FIXED: ${totalFix}`);
