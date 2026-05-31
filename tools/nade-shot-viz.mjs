import { spawn } from 'child_process';
import fs from 'fs';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const PORT = 5192, BASE = `http://127.0.0.1:${PORT}/`;
const SHOTS = process.env.TMPDIR + '/nade-shots';
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-breakpad', `--user-data-dir=${process.env.TMPDIR}/cdir_shot`] });
const page = await b.newPage();
await page.setViewport({ width: 900, height: 1200, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
const targets = [
  ['WAP/udalosti/event-loop', '#/c/WAP/udalosti/event-loop', 'wap-event-loop'],
  ['NAV/gpio/h-mustek', '#/c/NAV/gpio/h-mustek', 'nav-h-bridge'],
  ['PDI/globalni-stav/chandy-lamport', '#/c/PDI/globalni-stav/chandy-lamport', 'pdi-chandy-lamport'],
  ['AIS/oo-navrh/grasp', '#/c/AIS/oo-navrh/grasp', 'ais-grasp-assign'],
];
for (const [name, hash, vizId] of targets) {
  await page.goto('about:blank');                                  // force full reload
  await page.goto(BASE + hash, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('.block-viz, .block-svg'), { timeout: 12000 }).catch(() => {});
  await sleep(600);
  // pick the .block-viz whose header text matches the expected vizId (else first)
  const h = await page.evaluateHandle((vid) => {
    const blocks = [...document.querySelectorAll('.block-viz')];
    const match = blocks.find(b => (b.textContent || '').toUpperCase().includes(vid.toUpperCase()));
    return match || blocks[0] || document.querySelector('.block-svg');
  }, vizId);
  const el = h.asElement();
  const head = el ? await page.evaluate(e => (e.querySelector('.block-viz-head, header, .viz-header') || e).textContent.slice(0, 50), el) : '';
  const f = `${SHOTS}/viz-${vizId}.png`;
  if (el) { await el.screenshot({ path: f }); console.log('saved', f, '| header:', head.replace(/\s+/g, ' ').trim()); }
  else console.log('NO viz block on', name);
}
await b.close();
try { vite.kill('SIGTERM'); } catch {}
process.exit(0);
