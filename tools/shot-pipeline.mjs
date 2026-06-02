// Screenshot the pipeline-hazards viz across program/forwarding states (dark mode)
// to verify the collision fix renders correctly. Also grabs the EX->EX svg figure.
import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5193/';
const HASH = '#/c/AVS/pipelining/datove-konflikty-forwarding';
const OUT = process.env.TMPDIR + '/shots';
import fs from 'fs';
fs.mkdirSync(OUT, { recursive: true });

const vite = spawn('node', ['./node_modules/.bin/vite', '--port', '5193', '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const _sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await _sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });

const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_pipe`] });
const page = await b.newPage();
await page.setViewport({ width: 1000, height: 1300, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
await page.goto('about:blank');
await page.goto(BASE + HASH, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => document.querySelector('.block-viz-body, .block-svg'), { timeout: 8000 }).catch(()=>{});
await _sleep(400);

// Locate the interactive viz block (its caption mentions "Vyber program").
const vizIdx = await page.evaluate(() => {
  const blks = [...document.querySelectorAll('.block-viz, .block-svg')];
  return blks.findIndex(b => (b.textContent||'').includes('Vyber program'));
});
console.log('viz block index:', vizIdx);

async function shoot(name, program, forwarding) {
  // set the <select> and checkbox inside the viz block, then screenshot it.
  const handle = await page.evaluateHandle((vizIdx) => {
    return [...document.querySelectorAll('.block-viz, .block-svg')][vizIdx];
  }, vizIdx);
  const blk = handle.asElement();
  await blk.waitForSelector('select', { timeout: 8000 });
  const sel = await blk.$('select');
  await sel.select(program);
  await _sleep(150);
  // checkbox: read state, click if mismatched
  const cb = await blk.$('input[type=checkbox]');
  const checked = await (await cb.getProperty('checked')).jsonValue();
  if (checked !== forwarding) { await cb.click(); await _sleep(150); }
  // read back the rendered CPI line + svg geometry for sanity
  const info = await page.evaluate((vizIdx) => {
    const blk = [...document.querySelectorAll('.block-viz, .block-svg')][vizIdx];
    const cpiLine = [...blk.querySelectorAll('span')].map(s=>s.textContent).find(t=>/CPI/.test(t)) || '';
    const svg = blk.querySelector('svg');
    let vb=null,bbox=null; try{ vb=svg.getAttribute('viewBox'); const bb=svg.getBBox(); bbox=[bb.x,bb.y,bb.width,bb.height].map(n=>+n.toFixed(1)); }catch(e){}
    // detect overlapping stage labels: collect all <text> with IF/ID/EX/MA/WB at same x,y
    const cells = [...svg.querySelectorAll('text')].filter(t=>/^(IF|ID|EX|MA|WB)$/.test(t.textContent.trim()))
      .map(t=>({s:t.textContent.trim(), x:+t.getAttribute('x'), y:+t.getAttribute('y')}));
    const seen={}; const overlaps=[];
    for(const c of cells){ const k=c.x+','+c.y; if(seen[k]) overlaps.push(k+':'+seen[k]+'/'+c.s); seen[k]=c.s; }
    return { cpiLine, vb, bbox, overlaps };
  }, vizIdx);
  console.log(`\n[${name}] ${program} fwd=${forwarding}`);
  console.log('  ', info.cpiLine.trim());
  console.log('   viewBox', info.vb, 'bbox', JSON.stringify(info.bbox));
  console.log('   stage-cell overlaps:', info.overlaps.length ? JSON.stringify(info.overlaps) : 'none');
  await blk.screenshot({ path: `${OUT}/${name}.png` });
  console.log('   saved', `${OUT}/${name}.png`);
}

await shoot('pipe-loaduse-fwd',  'loadUse',   true);
await shoot('pipe-loaduse-nofwd','loadUse',   false);
await shoot('pipe-raw-nofwd',    'rawHazard', false);
await shoot('pipe-nohaz-fwd',    'noHazards', true);
await shoot('pipe-raw-fwd',      'rawHazard', true);

// also screenshot the static EX->EX svg figure (current, pre-redesign)
const FIGKEY = 'do EX pozdější instrukce';
const figShot = await page.evaluate((k) => {
  const blks = [...document.querySelectorAll('.block-svg, .block-viz')];
  const fig = blks.find(b => (b.textContent||'').includes(k));
  if (!fig) return false; fig.scrollIntoView(); return true;
}, FIGKEY);
if (figShot) {
  const fig = await page.evaluateHandle((k) => [...document.querySelectorAll('.block-svg, .block-viz')].find(b => (b.textContent||'').includes(k)), FIGKEY);
  await fig.asElement().screenshot({ path: `${OUT}/fig-exex-after.png` });
  console.log('\n   saved figure', `${OUT}/fig-exex-after.png`);
}

await b.close();
process.exit(0);
