#!/usr/bin/env node
// Insert a `### Videa` section (one ::: youtube block per video) into each
// subtopic .md that has curated videos. Idempotent & re-runnable: the section
// is placed at the very end of the body, just before the `*Zdroj:` citation
// footer, and any prior `### Videa` section is replaced (not duplicated).
//   input: tools/video-data/final-videos.json
import fs from 'node:fs';

const ROOT = '/home/tmokenc/workspace/vut/aio';
const DIR = ROOT + '/tools/video-data';
const catalogue = JSON.parse(fs.readFileSync(DIR + '/catalogue.json', 'utf8'));
const srcOf = new Map(catalogue.map(r => [`${r.course}/${r.topic}/${r.sub}`, r.src]));
const videos = JSON.parse(fs.readFileSync(DIR + '/final-videos.json', 'utf8'));

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\s+/g, ' ').trim();

// group by subtopic, preserve order (kocotom first as written by resolver)
const bySub = new Map();
for (const v of videos) { const k = `${v.course}/${v.topic}/${v.sub}`; (bySub.get(k) || bySub.set(k, []).get(k)).push(v); }

function buildSection(vids) {
  const blocks = vids.map(v =>
    `::: youtube "https://www.youtube.com/watch?v=${v.videoId}" "${esc(v.title)}" "${esc(v.channel)}"\n:::`
  ).join('\n\n');
  return `### Videa\n\n${blocks}\n`;
}

let files = 0, total = 0, missing = 0, lostFooter = 0;
for (const [key, vids] of bySub) {
  const src = srcOf.get(key);
  if (!src) { console.warn('NO SRC for', key); missing++; continue; }
  const path = ROOT + '/public/' + src.replace(/^\//, '');
  if (!fs.existsSync(path)) { console.warn('MISSING FILE', path); missing++; continue; }
  let md = fs.readFileSync(path, 'utf8');

  // peel off trailing `*Zdroj: …*` footer (if any)
  const fm = md.match(/\n*(\*Zdroj:[^\n]*)\s*$/);
  const hadFooter = !!fm;
  let body = fm ? md.slice(0, fm.index) : md;
  const footer = fm ? fm[1] : '';

  // strip any previously-inserted video section (always lives at body end)
  body = body.replace(/\n*###\s+Videa\s*\n[\s\S]*$/, '');

  const section = buildSection(vids);
  let next = body.replace(/\s+$/, '') + '\n\n' + section.replace(/\s+$/, '') + '\n';
  if (hadFooter) next += '\n' + footer + '\n';

  fs.writeFileSync(path, next);
  if (hadFooter && !/\*Zdroj:/.test(next)) lostFooter++;
  files++; total += vids.length;
}
console.log(`integrated ${total} videos into ${files} subtopic files (${missing} missing, ${lostFooter} lost-footer)`);
