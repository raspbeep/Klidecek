import { spawn } from 'child_process';
import fs from 'fs';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const PORT = 5193, BASE = `http://127.0.0.1:${PORT}/`;
const SHOTS = process.env.TMPDIR + '/nade-shots';
fs.mkdirSync(SHOTS, { recursive: true });
const m = JSON.parse(fs.readFileSync('public/content/manifest.json', 'utf8'));
const pds = m.courses.find(c => c.id === 'PDS');
const routes = [];
for (const tid of ['reputace', 'anonymita'])
  for (const s of pds.topics.find(t => t.id === tid).subtopics)
    routes.push({ tid, sid: s.id, hash: `#/c/PDS/${tid}/${s.id}` });
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-breakpad', `--user-data-dir=${process.env.TMPDIR}/cdir_pds`] });
const page = await b.newPage();
await page.setViewport({ width: 1000, height: 1400, deviceScaleFactor: 1 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
const bad = [];
for (const r of routes) {
  const errs = [];
  const onMsg = msg => { if (msg.type() === 'error') errs.push(msg.text().slice(0, 200)); };
  const onErr = e => errs.push('PAGEERROR: ' + String(e).slice(0, 200));
  page.on('console', onMsg); page.on('pageerror', onErr);
  await page.goto('about:blank');
  await page.goto(BASE + r.hash, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('.block-text, .block-code, .block-viz, .block-svg'), { timeout: 12000 }).catch(() => {});
  await sleep(300);
  const info = await page.evaluate(() => {
    const o = { vizEmpty: 0, notReg: 0, overflow: 0, txt: (document.body.innerText || '').length };
    o.notReg = (document.body.innerText.match(/neregistrov|not registered|Neznámá vizual/gi) || []).length;
    for (const v of document.querySelectorAll('.block-viz')) if (!v.querySelector('svg,canvas,img')) o.vizEmpty++;
    for (const el of document.querySelectorAll('.block-viz, .block-svg')) if (el.scrollWidth > el.clientWidth + 4) o.overflow++;
    return o;
  });
  page.off('console', onMsg); page.off('pageerror', onErr);
  const real = errs.filter(e => !/favicon|Download the React DevTools|chunk/i.test(e));
  if (real.length || info.vizEmpty || info.notReg || info.overflow || info.txt < 200)
    bad.push({ key: `${r.tid}/${r.sid}`, real: real.slice(0, 2), ...info });
}
console.log('=== PDS reputace+anonymita audit ===');
console.log('routes:', routes.length, '| flagged:', bad.length);
for (const x of bad) console.log(' ', x.key, '| empty', x.vizEmpty, '| notReg', x.notReg, '| overflow', x.overflow, '| txt', x.txt, x.real.length ? '| ERR ' + JSON.stringify(x.real) : '');
// mindmap
await page.goto('about:blank'); await page.goto(BASE + '#/c/PDS/mm', { waitUntil: 'networkidle0' }); await sleep(500);
console.log('PDS mindmap svg present:', await page.evaluate(() => !!document.querySelector('svg')));
// flagship shots
await page.setViewport({ width: 900, height: 1200, deviceScaleFactor: 2 });
for (const [hash, vid] of [['#/c/PDS/reputace/vypocet-skore', 'pds-beta-reputation'], ['#/c/PDS/anonymita/onion-tor', 'pds-onion-routing']]) {
  await page.goto('about:blank'); await page.goto(BASE + hash, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('.block-viz'), { timeout: 12000 }).catch(() => {});
  await sleep(600);
  const h = await page.evaluateHandle((v) => { const bs = [...document.querySelectorAll('.block-viz')]; return bs.find(b => (b.textContent || '').toUpperCase().includes(v.toUpperCase())) || bs[0]; }, vid);
  const el = h.asElement();
  if (el) { await el.screenshot({ path: `${SHOTS}/viz-${vid}.png` }); console.log('shot', vid); }
}
await b.close(); try { vite.kill('SIGTERM'); } catch {}
process.exit(0);
