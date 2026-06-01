#!/usr/bin/env node
// Resolve the video-curation workflow output into REAL, validated YouTube ids.
//   input : tools/video-data/wf-output.json  ({ koco:[...], rel:[...] })
//   output: tools/video-data/final-videos.json  (array of validated video rows)
// Every id is produced by yt-dlp (search or metadata), never by a model — so
// no id is hallucinated. Reliable picks are only accepted from the channel the
// agent named, which must be on the curated allowlist. yt-dlp results are cached
// under tools/video-data/cache/ so re-runs are fast and offline-friendly.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';

const DIR = '/home/tmokenc/workspace/vut/aio/tools/video-data';
const CACHE = DIR + '/cache';
fs.mkdirSync(CACHE, { recursive: true });

const catalogue = JSON.parse(fs.readFileSync(DIR + '/catalogue.json', 'utf8'));
const validKey = new Set(catalogue.map(r => `${r.course}/${r.topic}/${r.sub}`));
// recover the real topic when an agent put a topic *title* (or wrong id) in the
// topic field: a subtopic id is unique within a course, so (course, sub) → topic.
const subTopics = new Map();
for (const r of catalogue) { const k = `${r.course}/${r.sub}`; (subTopics.get(k) || subTopics.set(k, new Set()).get(k)).add(r.topic); }
function realTopic(course, topic, sub) {
  if (validKey.has(`${course}/${topic}/${sub}`)) return topic;
  const set = subTopics.get(`${course}/${sub}`);
  return set && set.size === 1 ? [...set][0] : null;
}
const wf = JSON.parse(fs.readFileSync(DIR + '/wf-output.json', 'utf8'));

// kocotom truth
const kocoRows = fs.readFileSync(DIR + '/kocotom-videos.tsv', 'utf8').trim().split('\n')
  .map(l => { const [id, dur, ...t] = l.split('\t'); return { id, dur: Math.round(+dur), title: t.join('\t') }; });
const kocoById = new Map(kocoRows.map(v => [v.id, v]));

// allowlist (parsed from the generated workflow so it can't drift)
const wfSrc = fs.readFileSync(DIR + '/curation-wf.js', 'utf8');
const ALLOWLIST = JSON.parse(wfSrc.match(/const ALLOWLIST = (\[[\s\S]*?\]);/)[1]);
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const allowNorm = ALLOWLIST.map(norm).filter(x => x.length >= 3);
const fuzzy = (a, b) => { a = norm(a); b = norm(b); if (!a || !b) return false; if (a === b) return true; const lo = a.length < b.length ? a : b; return lo.length >= 4 && (a.includes(b) || b.includes(a)); };
const inAllow = ch => allowNorm.some(a => fuzzy(ch, a));

const sleep = ms => new Promise(r => setTimeout(r, ms));
function ytdlp(args, cacheKey) {
  const cf = CACHE + '/' + crypto.createHash('sha1').update(cacheKey).digest('hex') + '.txt';
  if (fs.existsSync(cf)) return Promise.resolve(fs.readFileSync(cf, 'utf8'));
  return new Promise((resolve) => {
    execFile('yt-dlp', args, { maxBuffer: 64 * 1024 * 1024, timeout: 90000 }, (err, stdout) => {
      const out = stdout || '';
      if (!err) fs.writeFileSync(cf, out);
      resolve(out);
    });
  });
}

// simple concurrency pool
async function pool(items, n, fn) {
  const res = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; res[k] = await fn(items[k], k); }
  }));
  return res;
}

const PR = '\t';
const searchFields = '%(id)s\t%(title)s\t%(channel)s\t%(duration)s\t%(view_count)s';
const metaFields = '%(id)s\t%(title)s\t%(channel)s\t%(availability)s\t%(playable_in_embed)s\t%(duration)s';

// some agents echo the course as "MSP — Statistika …"; keep only the id token
const cid = c => String(c).trim().split(/[\s—–-]+/)[0];

// ---- 1. kocotom maps -> rows (validate id + key) -------------------------
const rows = [];
const seen = new Set();
const add = r => { const k = `${r.course}/${r.topic}/${r.sub}|${r.videoId}`; if (seen.has(k)) return; seen.add(k); rows.push(r); };
let kocoBad = 0;
for (const res of wf.koco || []) {
  const course = cid(res.course);
  for (const m of res.maps || []) {
    const topic = realTopic(course, m.topic, m.sub);
    const v = kocoById.get(m.videoId);
    if (!topic) { kocoBad++; continue; }
    if (!v) { kocoBad++; continue; }
    add({ course, topic, sub: m.sub, videoId: v.id, title: v.title, channel: 'Tomáš Kocourek', source: 'kocotom', dur: v.dur });
  }
}
console.log(`kocotom: ${rows.length} valid maps (${kocoBad} dropped: bad key/id)`);

// ---- 2. reliable picks -> resolve via yt-dlp search ----------------------
const picks = [];
for (const res of wf.rel || []) for (const p of res.picks || []) picks.push({ ...p, course: cid(res.course) });
const relValidKey = picks.map(p => { const t = realTopic(p.course, p.topic, p.sub); return t ? { ...p, topic: t } : null; }).filter(Boolean);
const relAllow = relValidKey.filter(p => inAllow(p.channel));
console.log(`reliable picks: ${picks.length} total | ${relValidKey.length} valid-key | ${relAllow.length} allowlisted-channel`);

let resolved = 0, noHit = 0;
const relRows = await pool(relAllow, 5, async (p) => {
  const q = `ytsearch15:${p.query}`;
  const out = await ytdlp(['--flat-playlist', '--no-warnings', '--print', searchFields, q], 'search::' + p.query);
  const cands = out.trim().split('\n').filter(Boolean).map(l => { const [id, title, channel, dur, views] = l.split(PR); return { id, title, channel, dur: +dur || 0, views: +views || 0 }; }).filter(c => /^[\w-]{11}$/.test(c.id));
  let best = null, bestScore = -1e9;
  for (const c of cands) {
    const chan = fuzzy(c.channel, p.channel);
    const kw = (p.keywords || []).filter(k => (c.title || '').toLowerCase().includes(String(k).toLowerCase())).length;
    if (!chan || kw < 1) continue;                       // require correct channel + topical title
    let score = 1000 + kw * 100 + Math.log10(c.views + 1) * 15;
    if (c.dur < 90) score -= 500; else if (c.dur > 18000) score -= 80;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  if (!best) { noHit++; return null; }
  resolved++;
  return { course: p.course, topic: p.topic, sub: p.sub, videoId: best.id, title: best.title, channel: best.channel, source: 'reliable', dur: best.dur, query: p.query };
});
for (const r of relRows) if (r) add(r);
console.log(`reliable resolved: ${resolved} | no channel/keyword hit: ${noHit}`);

// ---- 3. validate EVERY id (existence + embeddable) -----------------------
const uniqIds = [...new Set(rows.map(r => r.videoId))];
console.log(`validating ${uniqIds.length} unique ids ...`);
const meta = new Map();
await pool(uniqIds, 5, async (id) => {
  const out = await ytdlp(['--skip-download', '--no-warnings', '--print', metaFields, `https://www.youtube.com/watch?v=${id}`], 'meta::' + id);
  const line = out.trim().split('\n').filter(Boolean)[0];
  if (!line) return;
  const [vid, title, channel, availability, embed, dur] = line.split(PR);
  if (vid !== id) return;
  meta.set(id, { title, channel, availability, embed, dur: +dur || 0 });
});

const final = [];
let dropped = 0;
for (const r of rows) {
  const m = meta.get(r.videoId);
  if (!m) { dropped++; continue; }                                  // unresolvable / private / removed
  if (m.embed === 'False') { dropped++; continue; }                 // embedding disabled
  if (m.availability && !['public', 'unlisted', 'NA', 'null'].includes(m.availability)) { dropped++; continue; }
  final.push({ ...r, title: m.title || r.title, channel: r.source === 'kocotom' ? 'Tomáš Kocourek' : (m.channel || r.channel), dur: m.dur || r.dur });
}
console.log(`validated: ${final.length} rows (${dropped} dropped at validation)`);

// ---- 4. per-subtopic cap & ordering --------------------------------------
const bySub = new Map();
for (const r of final) { const k = `${r.course}/${r.topic}/${r.sub}`; (bySub.get(k) || bySub.set(k, []).get(k)).push(r); }
const capped = [];
for (const [, arr] of bySub) {
  arr.sort((a, b) => (a.source === 'kocotom' ? 0 : 1) - (b.source === 'kocotom' ? 0 : 1));
  const koco = arr.filter(r => r.source === 'kocotom').slice(0, 2);
  const rel = arr.filter(r => r.source === 'reliable');
  // de-dup reliable by id, cap reliable at 2, kocotom at 2, total at 3 per subtopic
  const relSeen = new Set();
  const relKeep = rel.filter(r => !relSeen.has(r.videoId) && relSeen.add(r.videoId)).slice(0, 2);
  capped.push(...[...koco, ...relKeep].slice(0, 3));
}

fs.writeFileSync(DIR + '/final-videos.json', JSON.stringify(capped, null, 2));
const subs = new Set(capped.map(r => `${r.course}/${r.topic}/${r.sub}`));
const byCourse = {};
for (const r of capped) byCourse[r.course] = (byCourse[r.course] || 0) + 1;
console.log(`\nFINAL: ${capped.length} videos across ${subs.size} subtopics`);
console.log('  kocotom:', capped.filter(r => r.source === 'kocotom').length, '| reliable:', capped.filter(r => r.source === 'reliable').length);
console.log('  by course:', Object.entries(byCourse).map(([c, n]) => `${c}:${n}`).join(' '));
