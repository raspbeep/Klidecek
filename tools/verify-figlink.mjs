import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5190/';
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', '5190', '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell', args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_fig`] });
const page = await b.newPage();
await page.setViewport({ width: 1100, height: 900 });
// capture clipboard writes
await page.evaluateOnNewDocument(() => {
  window.__clip = [];
  if (!navigator.clipboard) Object.defineProperty(navigator, 'clipboard', { value: {}, configurable: true });
  navigator.clipboard.writeText = (t) => { window.__clip.push(t); return Promise.resolve(); };
  window.toast = () => {};
});
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));

const route = '#/c/AVS/pipelining/pipelining-faze';
await page.goto(BASE + route, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => document.querySelector('.block-viz, .block-svg, .block-image'), { timeout: 12000 }).catch(()=>{});
await sleep(500);

const survey = await page.evaluate(() => {
  const figs = [...document.querySelectorAll('[id*="--fig"]')];
  const withAnchor = figs.filter(f => f.querySelector(':scope > .fig-anchor, .block-viz-head .fig-anchor'));
  const types = { image: 0, svg: 0, viz: 0 };
  figs.forEach(f => { if (f.classList.contains('block-image')) types.image++; else if (f.classList.contains('block-svg')) types.svg++; else if (f.classList.contains('block-viz')) types.viz++; });
  // also: total figure blocks vs ones with an id
  const allFigBlocks = document.querySelectorAll('.block-image, .block-svg, .block-viz').length;
  return { figCount: figs.length, withAnchor: withAnchor.length, types, allFigBlocks, sampleId: figs[0] && figs[0].id };
});
console.log('figures with --fig id:', survey.figCount, '/ total fig blocks:', survey.allFigBlocks);
console.log('  with a .fig-anchor button:', survey.withAnchor, '| by type:', JSON.stringify(survey.types));
console.log('  sample id:', survey.sampleId);

// click the first figure's copy button, capture the URL
const clip = await page.evaluate(() => {
  const fig = document.querySelector('[id*="--fig"]');
  const btn = fig.querySelector(':scope > .fig-anchor') || fig.querySelector('.fig-anchor');
  btn.click();
  return { id: fig.id, url: window.__clip[window.__clip.length - 1] };
});
console.log('copied URL:', clip.url);

// navigate to the EXACT copied URL's hash; check highlight + scroll
const deepHash = '#' + clip.url.split('#')[1];
await page.evaluate(h => { location.hash = h; }, deepHash);
await sleep(2500);
const hl = await page.evaluate((id) => {
  const el = document.getElementById(id);
  const r = el.getBoundingClientRect();
  return { hasHighlight: el.classList.contains('fig-highlight'), inView: r.top > -50 && r.top < window.innerHeight, top: Math.round(r.top) };
}, clip.id);
console.log('deep-link', deepHash, '-> highlighted:', hl.hasHighlight, '| scrolled into view:', hl.inView, '(top', hl.top + ')');

const ok = survey.figCount > 0 && survey.withAnchor === survey.figCount
  && /#\/c\/AVS\/pipelining\/[a-z-]+\/fig\d+$/.test(clip.url || '')
  && hl.hasHighlight && hl.inView;
console.log('\nRESULT:', ok ? 'PASS ✓' : 'FAIL ✗');
await b.close();
try { vite.kill('SIGTERM'); } catch {}
process.exit(ok ? 0 : 1);
