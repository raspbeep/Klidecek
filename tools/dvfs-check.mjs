// Prototype the fixed DVFS energy model: busy duration scales inversely with
// frequency (fixed work), idle uses each strategy's sleep-state power (race=deep
// C6), and an always-on platform/static floor makes run-slow's long active time
// costly. Goal: race-to-idle must come out lowest-energy (page thesis).

const FLOOR = 10;            // always-on platform/static power during active (W)
const refF = 3500;           // reference frequency (balanced)
const tMax = 64;
const TASKS = [{ arrive: 4, work: 10 }, { arrive: 20, work: 30 }]; // work in ref-ms

const STRATS = {
  race:     { busyF: 4500, busyV: 1.35, idleP: 0.3 },  // deep C6 idle
  slow:     { busyF: 2500, busyV: 0.9,  idleP: 3 },
  balanced: { busyF: 3500, busyV: 1.1,  idleP: 1.5 },
};

function powerOfF(f, v) {
  if (f === 0 && v === 0) return 0.3;          // C6 leakage
  return 0.001 * v * v * f + (v > 0 ? FLOOR : 0);
}

function busyIntervals(s) {
  const iv = [];
  let prevEnd = 0;
  for (const tk of TASKS) {
    const start = Math.max(tk.arrive, prevEnd);
    const dur = tk.work * (refF / s.busyF);
    const end = start + dur;
    iv.push([start, end]);
    prevEnd = end;
  }
  return iv;
}

function sim(s) {
  const iv = busyIntervals(s);
  const isBusy = (t) => iv.some(([a, b]) => t >= a && t < b);
  let energy = 0, busyMs = 0;
  const samples = [];
  for (let t = 0; t < tMax; t++) {
    const busy = isBusy(t);
    const f = busy ? s.busyF : 0;
    const v = busy ? s.busyV : 0;
    const p = busy ? powerOfF(s.busyF, s.busyV) : s.idleP;
    if (busy) busyMs++;
    energy += p;
    samples.push({ t, busy, p: +p.toFixed(2) });
  }
  return { energy, busyMs, idleMs: tMax - busyMs, busyP: +powerOfF(s.busyF, s.busyV).toFixed(2), iv };
}

const results = {};
for (const [k, s] of Object.entries(STRATS)) {
  const r = sim(s);
  results[k] = r;
  console.log(`${k.padEnd(9)} busyP=${String(r.busyP).padStart(6)}W  busy=${String(r.busyMs).padStart(2)}ms idle=${String(r.idleMs).padStart(2)}ms  E=${r.energy.toFixed(0)} J   intervals=${JSON.stringify(r.iv.map(p => p.map(x => +x.toFixed(1))))}`);
}
const order = Object.entries(results).sort((a, b) => a[1].energy - b[1].energy).map(x => x[0]);
console.log('\nenergy ranking (best→worst):', order.join(' < '));
console.log('race wins:', order[0] === 'race' ? 'YES ✓' : 'NO ✗');
