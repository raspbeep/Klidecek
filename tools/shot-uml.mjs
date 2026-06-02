import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5195/';
const HASH = '#/c/AIS/uml/strukturni-diagramy';
const OUT = process.env.TMPDIR + '/shots';
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', '5195', '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_uml`] });
const page = await b.newPage();
await page.setViewport({ width: 1000, height: 1300, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
await page.goto('about:blank');
await page.goto(BASE + HASH, { waitUntil: 'networkidle0' });
await sleep(800);
// find the ais-uml-class-relations viz block
const idx = await page.evaluate(() => {
  const blks = [...document.querySelectorAll('.block-viz')];
  return blks.findIndex(b => (b.querySelector('.block-viz-head span')?.textContent || '').toLowerCase().includes('class-relations'));
});
console.log('uml viz block index:', idx);
const handle = await page.evaluateHandle((idx) => [...document.querySelectorAll('.block-viz')][idx], idx);
const blk = handle.asElement();
await blk.scrollIntoView();
await sleep(600);
// wait for a select (relation picker) to appear inside it
const hasSelect = await page.evaluate((idx) => {
  const blk = [...document.querySelectorAll('.block-viz')][idx];
  return !!blk && !!blk.querySelector('select');
}, idx);
console.log('has select:', hasSelect, '| svg present:', await page.evaluate((idx) => !![...document.querySelectorAll('.block-viz')][idx]?.querySelector('svg'), idx));
// click the "Generalizace" button
const clicked = await page.evaluate((idx) => {
  const blk = [...document.querySelectorAll('.block-viz')][idx];
  const btn = [...blk.querySelectorAll('button')].find(b => /generaliz/i.test(b.textContent));
  if (btn) { btn.click(); return btn.textContent; }
  return null;
}, idx);
console.log('clicked button:', clicked);
await sleep(500);
await blk.screenshot({ path: `${OUT}/fix-uml-generalization.png` });
console.log('saved fix-uml-generalization.png');
await b.close();
process.exit(0);
