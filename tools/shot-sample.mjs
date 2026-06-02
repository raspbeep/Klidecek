import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5196/';
const OUT = process.env.TMPDIR + '/shots';
fs.mkdirSync(OUT, { recursive: true });
const FIGS = [
  { name: 'blp-rules', hash: '#/c/BIS/access-control/bell-lapadula', match: 'Secret subject' },
  { name: 'anatomie',  hash: '#/c/BIO/duhovka-sitnice/anatomie-oka', match: 'Anatomie oka' },
];
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', '5196', '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 80; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_sample`] });
const page = await b.newPage();
await page.setViewport({ width: 1000, height: 1300, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
for (const fig of FIGS) {
  try {
    await page.goto('about:blank');
    await page.goto(BASE + fig.hash, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.querySelector('.block-viz-body, .block-svg'), { timeout: 8000 }).catch(() => {});
    await sleep(700);
    const ok = await page.evaluate((m) => { const blk = [...document.querySelectorAll('.block-viz, .block-svg')].find(b => (b.textContent||'').includes(m)); if (!blk) return false; blk.scrollIntoView({ block: 'center' }); return true; }, fig.match);
    if (!ok) { console.log(`✗ ${fig.name}: not found`); continue; }
    await sleep(400);
    const h = await page.evaluateHandle((m) => [...document.querySelectorAll('.block-viz, .block-svg')].find(b => (b.textContent||'').includes(m)), fig.match);
    await h.asElement().screenshot({ path: `${OUT}/${fig.name}.png` });
    console.log(`✓ ${fig.name}`);
  } catch (e) { console.log(`✗ ${fig.name}: ${String(e).slice(0,70)}`); }
}
await b.close();
process.exit(0);
