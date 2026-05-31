import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5190/';
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', '5190', '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell', args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_hl`] });
const page = await b.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));
await page.setViewport({ width: 1100, height: 1000 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));

const routes = {
  FLP: '#/c/FLP/haskell-zaklady/type-classes',
  UPA: '#/c/UPA/xml-json/xml-zaklady',
  AVS: '#/c/AVS/pipelining/pipelining-faze',
  PIS: '#/c/PIS/jakarta-ee/jpa-persistence',
};
const byLang = {};
for (const [cid, route] of Object.entries(routes)) {
  await page.goto(BASE + route, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('.block-code'), { timeout: 12000 }).catch(()=>{});
  await sleep(400);
  const blocks = await page.evaluate(() => {
    return [...document.querySelectorAll('.block-code')].map(b => {
      const lang = (b.querySelector('.block-code-head span') || {}).textContent || '?';
      const pre = b.querySelector('pre');
      const spans = {};
      pre.querySelectorAll('[class^="tok-"]').forEach(s => { const c = s.className; spans[c] = (spans[c]||0)+1; });
      const txt = pre.textContent || '';
      return { lang, spanKinds: spans, hasLt: txt.includes('<'), leak: /tok-|<span/.test(txt), len: txt.length, childEls: pre.querySelectorAll('*').length };
    });
  });
  for (const blk of blocks) {
    const L = byLang[blk.lang] || (byLang[blk.lang] = { blocks: 0, withSpans: 0, leak: 0, kinds: new Set() });
    L.blocks++; if (Object.keys(blk.spanKinds).length) L.withSpans++;
    if (blk.leak) L.leak++;
    Object.keys(blk.spanKinds).forEach(k => L.kinds.add(k.replace('tok-','')));
  }
}
console.log('=== syntax highlighting coverage ===');
let anyLeak = false;
for (const [lang, L] of Object.entries(byLang).sort()) {
  if (L.leak) anyLeak = true;
  console.log(`  ${lang.padEnd(12)} blocks:${L.blocks}  highlighted:${L.withSpans}  kinds:{${[...L.kinds].sort().join(',')}}` + (L.leak?`  LEAK:${L.leak}`:''));
}
console.log('console/page errors:', errors.length, errors.slice(0,3));

// screenshots: a haskell block and an xml block
async function shot(route, lang, name) {
  await page.goto(BASE + route, { waitUntil: 'networkidle0' }); await sleep(400);
  const h = await page.evaluateHandle((lang) => [...document.querySelectorAll('.block-code')].find(b => (b.querySelector('.block-code-head span')||{}).textContent === lang), lang);
  const el = h.asElement(); if (el) { await el.screenshot({ path: `${process.env.TMPDIR}/shots/hl-${name}.png` }); console.log('saved hl-'+name); }
}
await shot(routes.FLP, 'haskell', 'haskell');
await shot(routes.UPA, 'xml', 'xml');
await shot(routes.PIS, 'java', 'java');
await b.close();
try { vite.kill('SIGTERM'); } catch {}
process.exit(anyLeak || errors.length ? 1 : 0);
