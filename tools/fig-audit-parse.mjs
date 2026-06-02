import fs from 'fs';
const OUT = process.argv[2];
const top = JSON.parse(fs.readFileSync(OUT, 'utf8'));
function findConfirmed(o) {
  if (!o || typeof o !== 'object') return null;
  if (Array.isArray(o.confirmed)) return o;
  for (const k of Object.keys(o)) { const f = findConfirmed(o[k]); if (f) return f; }
  return null;
}
const data = findConfirmed(top);
const c = data.confirmed;
fs.writeFileSync(process.env.TMPDIR + '/fig-confirmed.json', JSON.stringify(c, null, 2));
const bySev = {}, byArea = {};
for (const f of c) {
  bySev[f.severity] = (bySev[f.severity] || 0) + 1;
  const mc = (f.file || '').match(/courses\/([A-Za-z]+)\//);
  const mv = (f.file || '').match(/^src\/viz\//);
  const area = mc ? mc[1] : (mv ? 'viz-component' : 'other');
  byArea[area] = (byArea[area] || 0) + 1;
}
console.log('confirmed:', c.length);
console.log('by severity:', JSON.stringify(bySev));
console.log('by area:', JSON.stringify(byArea));
console.log('\n=== HIGH severity (file :: figure) ===');
for (const f of c.filter(x => x.severity === 'high')) {
  console.log(`\n• [${f.type}] ${f.file}\n  FIG: ${f.figure}\n  ISSUE: ${(f.issue||'').slice(0,240)}`);
}
