// Screenshot a list of fixed figures across pages (dark mode) to visually verify.
import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5194/';
const OUT = process.env.TMPDIR + '/shots';
fs.mkdirSync(OUT, { recursive: true });

// {name, hash, match} — match is text inside the target block
const FIGS = [
  { name: 'mesi-svg',      hash: '#/c/AVS/koherence-numa/msi-mesi-moesi',        match: 'MESI state machine' },
  { name: 'markanty',      hash: '#/c/BIO/otisky/markanty',                      match: 'Typy markantů' },
  { name: 'klasifikace',   hash: '#/c/BIO/otisky/klasifikace-otisku',            match: 'Tři základní vzory' },
  { name: 'wpa2',          hash: '#/c/BIS/wifi-bezpecnost/wpa-wpa2',             match: 'WPA2 4-way handshake' },
  { name: 'elipticke-1',   hash: '#/c/KRY/asymetricka-algoritmy/elipticke',     match: 'tři reálné kořeny' },
  { name: 'elipticke-2',   hash: '#/c/KRY/asymetricka-algoritmy/elipticke',     match: 'Sčítání bodů na eliptické' },
  { name: 'skytale',       hash: '#/c/KRY/klasicke/transpozice',                match: 'Skytale' },
  { name: 'ocsp',          hash: '#/c/KRY/klice-asymetricka/revokace',          match: 'OCSP dotaz' },
  { name: 'enigma',        hash: '#/c/KRY/rotorove/enigma-utok',                match: 'Bombe' },
  { name: 'feistel',       hash: '#/c/KRY/symetricka-zaklady/feistel-spn',      match: 'Feistelova síť' },
  { name: 'msp-testing',   hash: '#/c/MSP/intervaly-hypotezy/testovani-princip', match: 'Distribuce testové statistiky' },
  { name: 'uml-relations', hash: '#/c/AIS/uml/strukturni-diagramy',             match: 'zakončení čáry' },
  { name: 'dvfs',          hash: '#/c/AVS/spotreba-gpgpu/dvfs-power-mgmt',       match: 'integrál P·dt' },
  { name: 'superpipe',     hash: '#/c/AVS/pipelining/superpipelining-vykon',    match: 'Pentium 4' },
  { name: 'mesi-viz',      hash: '#/c/AVS/koherence-numa/msi-mesi-moesi',        match: 'přepínají stavy' },
];

const vite = spawn('node', ['./node_modules/.bin/vite', '--port', '5194', '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });

const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_figs`] });
const page = await b.newPage();
await page.setViewport({ width: 1000, height: 1300, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));

for (const fig of FIGS) {
  try {
    await page.goto('about:blank');
    await page.goto(BASE + fig.hash, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.querySelector('.block-viz-body, .block-svg'), { timeout: 8000 }).catch(() => {});
    await sleep(500);
    const found = await page.evaluate((match) => {
      const blks = [...document.querySelectorAll('.block-viz, .block-svg')];
      const blk = blks.find(b => (b.textContent || '').includes(match));
      if (!blk) return false;
      blk.scrollIntoView({ block: 'center' });
      return true;
    }, fig.match);
    if (!found) { console.log(`✗ ${fig.name}: block not found ("${fig.match}")`); continue; }
    await sleep(250);
    const handle = await page.evaluateHandle((match) => {
      const blks = [...document.querySelectorAll('.block-viz, .block-svg')];
      return blks.find(b => (b.textContent || '').includes(match));
    }, fig.match);
    await handle.asElement().screenshot({ path: `${OUT}/fix-${fig.name}.png` });
    console.log(`✓ ${fig.name} -> fix-${fig.name}.png`);
  } catch (e) {
    console.log(`✗ ${fig.name}: ${String(e).slice(0, 80)}`);
  }
}
await b.close();
process.exit(0);
