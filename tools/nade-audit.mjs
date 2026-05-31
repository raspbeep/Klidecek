import { spawn } from 'child_process';
import fs from 'fs';
import puppeteer from 'puppeteer-core';

const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const PORT = 5191;
const BASE = `http://127.0.0.1:${PORT}/`;
const SHOTS = process.env.TMPDIR + '/nade-shots';
fs.mkdirSync(SHOTS, { recursive: true });

const NADE = ['AIS', 'NAV', 'PDI', 'TAMa', 'UXIa', 'WAP'];
const m = JSON.parse(fs.readFileSync('public/content/manifest.json', 'utf8'));
const routes = [];
for (const c of m.courses.filter(c => NADE.includes(c.id)))
  for (const t of c.topics) for (const s of t.subtopics)
    routes.push({ cid: c.id, tid: t.id, sid: s.id, hash: `#/c/${c.id}/${t.id}/${s.id}` });

const vite = spawn('node', ['./node_modules/.bin/vite', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }

const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-breakpad', `--user-data-dir=${process.env.TMPDIR}/cdir_nade`] });
const page = await b.newPage();
await page.setViewport({ width: 1000, height: 1400, deviceScaleFactor: 1 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));

const bad = [];
const fp = [];
const perCourse = {};
let shotCount = 0;
const FLAGSHIP = new Set(['WAP/udalosti/event-loop', 'PDI/globalni-stav/chandy-lamport', 'NAV/gpio/h-mustek', 'AIS/oo-navrh/grasp', 'TAMa/mobilni-ui/ergonomie-thumb-zone', 'UXIa/ucd/evaluace-metody']);

for (const r of routes) {
  const errs = [];
  const onMsg = msg => { if (msg.type() === 'error') errs.push(msg.text().slice(0, 200)); };
  const onErr = e => errs.push('PAGEERROR: ' + String(e).slice(0, 200));
  page.on('console', onMsg); page.on('pageerror', onErr);
  await page.goto('about:blank');                                  // force full reload of the SPA
  await page.goto(BASE + r.hash, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('.block-text, .block-code, .block-viz, .block-svg, .reading-body, article'), { timeout: 12000 }).catch(() => {});
  await sleep(250);
  const info = await page.evaluate(() => {
    const out = { vizBlocks: 0, vizEmpty: 0, svgBlocks: 0, notReg: 0, overflow: 0, txtLen: 0, head: '', vizIds: '' };
    const h = document.querySelector('h1, .reading-title, .subtopic-title, h2');
    out.head = (h ? h.textContent : '').slice(0, 60);
    out.vizIds = [...document.querySelectorAll('.block-viz')].map(v => (v.querySelector('.block-viz-head, .viz-header, header') || {}).textContent || '').join('|').slice(0, 80);
    out.txtLen = (document.body.innerText || '').length;
    out.notReg = (document.body.innerText.match(/neregistrov|not registered|Neznámá vizualizace|viz .* not found/gi) || []).length;
    for (const v of document.querySelectorAll('.block-viz')) {
      out.vizBlocks++;
      const hasGfx = v.querySelector('svg, canvas, img');
      if (!hasGfx) out.vizEmpty++;
    }
    for (const s of document.querySelectorAll('.block-svg')) out.svgBlocks++;
    // crude horizontal-overflow / clipping check on figure containers
    for (const el of document.querySelectorAll('.block-viz, .block-svg')) {
      if (el.scrollWidth > el.clientWidth + 4) out.overflow++;
    }
    return out;
  });
  page.off('console', onMsg); page.off('pageerror', onErr);
  const key = `${r.cid}/${r.tid}/${r.sid}`;
  perCourse[r.cid] = perCourse[r.cid] || { pages: 0, err: 0, empty: 0, notreg: 0, overflow: 0 };
  const pc = perCourse[r.cid]; pc.pages++;
  const realErrs = errs.filter(e => !/favicon|manifest.json 404|Download the React DevTools|chunk/i.test(e));
  if (realErrs.length || info.vizEmpty || info.notReg || info.overflow || info.txtLen < 200) {
    bad.push({ key, errs: realErrs.slice(0, 3), ...info });
    pc.err += realErrs.length ? 1 : 0; pc.empty += info.vizEmpty; pc.notreg += info.notReg; pc.overflow += info.overflow;
  }
  fp.push({ key, head: info.head, txt: info.txtLen });
  if (FLAGSHIP.has(key)) {
    await page.screenshot({ path: `${SHOTS}/${r.cid}-${r.tid}-${r.sid}.png`, fullPage: true });
    shotCount++;
  }
}

// mindmaps
const mmBad = [];
for (const cid of NADE) {
  const errs = [];
  const onErr = e => errs.push(String(e).slice(0, 150));
  page.on('pageerror', onErr);
  await page.goto(BASE + `#/c/${cid}/mm`, { waitUntil: 'networkidle0' });
  await sleep(500);
  const ok = await page.evaluate(() => !!document.querySelector('svg'));
  page.off('pageerror', onErr);
  if (!ok || errs.length) mmBad.push({ cid, ok, errs: errs.slice(0, 2) });
}

const distinctHeads = new Set(fp.map(x => x.head)).size;
console.log('=== NADE render audit ===');
console.log('routes audited:', routes.length, '| distinct headings:', distinctHeads, '(should ≈', routes.length, ')');
console.log('routes audited:', routes.length, '| flagged:', bad.length, '| screenshots:', shotCount);
console.log('per-course:', JSON.stringify(perCourse));
console.log('mindmaps with issues:', mmBad.length ? JSON.stringify(mmBad) : '(none)');
if (bad.length) {
  console.log('\n--- flagged pages ---');
  for (const x of bad.slice(0, 40)) console.log(' ', x.key, '| vizEmpty', x.vizEmpty, '| notReg', x.notReg, '| overflow', x.overflow, '| txt', x.txtLen, x.errs.length ? '| ERR ' + JSON.stringify(x.errs) : '');
}
await b.close();
try { vite.kill('SIGTERM'); } catch {}
process.exit(0);
