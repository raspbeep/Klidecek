import fs from 'fs';
const c = JSON.parse(fs.readFileSync(process.env.TMPDIR + '/fig-confirmed.json', 'utf8'));
// normalize file path -> repo-relative
const norm = (f) => (f || '').replace(/^\/home\/tmokenc\/workspace\/vut\/aio\//, '');
const byFile = {};
for (const f of c) {
  const k = norm(f.file);
  (byFile[k] = byFile[k] || []).push(f);
}
const rank = { high: 0, medium: 1, low: 2 };
const files = Object.keys(byFile).sort((a, b) => {
  const ra = Math.min(...byFile[a].map((x) => rank[x.severity] ?? 1));
  const rb = Math.min(...byFile[b].map((x) => rank[x.severity] ?? 1));
  return ra - rb;
});
let out = `# ${c.length} confirmed findings across ${files.length} files\n`;
for (const file of files) {
  const fs2 = byFile[file].sort((a, b) => (rank[a.severity] ?? 1) - (rank[b.severity] ?? 1));
  out += `\n\n${'='.repeat(90)}\n## ${file}  (${fs2.length})\n`;
  for (const f of fs2) {
    out += `\n--- [${f.severity.toUpperCase()}] (${f.type}) ${f.figure}\n`;
    out += `ISSUE: ${f.issue}\n`;
    out += `FIX: ${f.fix}\n`;
  }
}
fs.writeFileSync(process.env.TMPDIR + '/fig-grouped.txt', out);
console.log(`grouped ${c.length} findings into ${files.length} files -> $TMPDIR/fig-grouped.txt`);
// print just the file list with severity counts
for (const file of files) {
  const sevs = byFile[file].reduce((a, x) => { a[x.severity] = (a[x.severity]||0)+1; return a; }, {});
  console.log(`  ${file}  ${JSON.stringify(sevs)}`);
}
