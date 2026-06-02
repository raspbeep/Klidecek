import fs from 'fs';
const OUT = process.argv[2];
const top = JSON.parse(fs.readFileSync(OUT, 'utf8'));
function findC(o) {
  if (!o || typeof o !== 'object') return null;
  if (Array.isArray(o.confirmed)) return o;
  for (const k of Object.keys(o)) { const f = findC(o[k]); if (f) return f; }
  return null;
}
const data = findC(top);
const c = data.confirmed;
const norm = (f) => (f || '').replace(/^\/home\/tmokenc\/workspace\/vut\/aio\//, '');
c.forEach((f) => (f.file = norm(f.file)));
fs.writeFileSync(process.env.TMPDIR + '/fig-confirmed2.json', JSON.stringify(c, null, 2));
const bySev = {};
for (const f of c) bySev[f.severity] = (bySev[f.severity] || 0) + 1;
console.log('run2 reviewed:', data.figuresReviewed, 'candidates:', data.candidateIssues, 'confirmed:', c.length, '|', JSON.stringify(bySev));

// load run1 confirmed to dedupe (by file)
const c1 = JSON.parse(fs.readFileSync(process.env.TMPDIR + '/fig-confirmed.json', 'utf8'));
const filesFixed = new Set(c1.map((f) => norm(f.file)));

const rank = { high: 0, medium: 1, low: 2 };
const sorted = c.sort((a, b) => rank[a.severity] - rank[b.severity]);
console.log('\n=== run2 confirmed (★ = file NOT in run1, likely newly-covered course) ===');
for (const f of sorted) {
  const isNew = !filesFixed.has(f.file);
  console.log(`${isNew ? '★' : ' '} [${f.severity}] ${f.file} :: ${(f.figure || '').slice(0, 50)}`);
}
// write a focused file with full detail for the NEW high+medium ones
const newImportant = sorted.filter((f) => !filesFixed.has(f.file) && f.severity !== 'low');
let out = `# ${newImportant.length} NEW (not in run1) high/medium findings\n`;
for (const f of newImportant) {
  out += `\n###### [${f.severity}] ${f.file} (${f.type})\nFIGURE: ${f.figure}\nISSUE: ${f.issue}\nFIX: ${f.fix}\n`;
}
fs.writeFileSync(process.env.TMPDIR + '/fig-new.txt', out);
console.log(`\nwrote ${newImportant.length} NEW high/medium findings -> fig-new.txt`);
