import fs from 'fs';
const top = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
function find(o) {
  if (!o || typeof o !== 'object') return null;
  if (Array.isArray(o.perFile)) return o;
  for (const k of Object.keys(o)) { const f = find(o[k]); if (f) return f; }
  return null;
}
const d = find(top);
console.log('filesProcessed:', d.filesProcessed, 'fixed:', d.totalFixed, 'skipped:', d.totalSkipped);
console.log('\n=== SKIPPED ===');
for (const f of d.perFile) for (const s of (f.skipped || [])) {
  console.log('•', f.file.replace(/^.*courses\//, '').replace(/^.*\/src\//, 'src/'), '::', (s.figure || '').slice(0, 45));
  console.log('   →', (s.reason || '').slice(0, 220));
}
// list all fixed (short) for review
console.log('\n=== FIXED (one line each) ===');
const fixedList = [];
for (const f of d.perFile) for (const x of (f.fixed || [])) fixedList.push({ file: f.file, change: x.change });
fs.writeFileSync(process.env.TMPDIR + '/fix-fixed.json', JSON.stringify(fixedList, null, 2));
for (const f of d.perFile) {
  const n = (f.fixed || []).length;
  if (n) console.log(`  [${n}] ${f.file.replace(/^.*courses\//, '').replace(/^.*\/src\//, 'src/')}`);
}
