import fs from 'fs';
const TMP = process.env.TMPDIR;
const norm = (f) => (f || '').replace(/^\/home\/tmokenc\/workspace\/vut\/aio\//, '');
const c1 = JSON.parse(fs.readFileSync(TMP + '/fig-confirmed.json', 'utf8'));
const c2 = JSON.parse(fs.readFileSync(TMP + '/fig-confirmed2.json', 'utf8'));
// HIGH files already fixed by hand — exclude their high finding, but KEEP medium/low in those files
const all = [...c1, ...c2].map((f) => ({ ...f, file: norm(f.file) }));
// dedupe by file+figure+issue-prefix
const seen = new Set();
const dedup = [];
for (const f of all) {
  if (f.severity === 'high') continue; // highs handled manually
  const key = f.file + '|' + (f.figure || '').slice(0, 30) + '|' + (f.issue || '').slice(0, 50);
  if (seen.has(key)) continue;
  seen.add(key);
  dedup.push(f);
}
// group by file
const byFile = {};
for (const f of dedup) (byFile[f.file] = byFile[f.file] || []).push(f);
const files = Object.keys(byFile).sort();
fs.writeFileSync(TMP + '/fig-medium-all.json', JSON.stringify(dedup, null, 2));
const med = dedup.filter((f) => f.severity === 'medium').length;
const low = dedup.filter((f) => f.severity === 'low').length;
console.log(`deduped medium/low: ${dedup.length} (medium=${med}, low=${low}) across ${files.length} files`);
console.log('FILES_JSON_START');
console.log(JSON.stringify(files));
