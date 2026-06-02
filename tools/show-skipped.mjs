import fs from 'fs';
const findings = JSON.parse(fs.readFileSync(process.env.TMPDIR + '/fig-medium-all.json', 'utf8'));
const top = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
function find(o) { if (!o || typeof o !== 'object') return null; if (Array.isArray(o.perFile)) return o; for (const k of Object.keys(o)) { const f = find(o[k]); if (f) return f; } return null; }
const d = find(top);
const wanted = ['anatomie-oka', 'bell-lapadula', 'prefetching'];
for (const w of wanted) {
  console.log('\n' + '='.repeat(80) + '\n### ' + w);
  // original finding(s)
  const fs2 = findings.filter((f) => (f.file || '').includes(w));
  for (const f of fs2) {
    console.log(`\n[ORIGINAL FINDING] sev=${f.severity} type=${f.type}`);
    console.log('FIGURE:', f.figure);
    console.log('ISSUE:', f.issue);
    console.log('FIX:', f.fix);
  }
  // skip reason
  for (const pf of d.perFile) {
    if (!(pf.file || '').includes(w)) continue;
    for (const s of (pf.skipped || [])) console.log(`\n[SKIP REASON] ${s.figure}\n  → ${s.reason}`);
    for (const x of (pf.fixed || [])) console.log(`\n[ALSO FIXED IN FILE] ${x.figure}: ${x.change.slice(0, 120)}`);
  }
}
