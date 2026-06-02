// One-shot: rewrite src/viz/index.js from static imports + register(id, Comp)
// into code-split register(id, () => import("./file.jsx")) form. Idempotent-ish:
// re-running on already-transformed output is a no-op (no static imports left).
import fs from 'fs';
const path = 'src/viz/index.js';
const src = fs.readFileSync(path, 'utf8');
const lines = src.split('\n');

const imp = new Map();                              // Name -> "./path.jsx"
const reImport = /^import\s+([A-Za-z0-9_$]+)\s+from\s+"(\.\/[^"]+)";\s*$/;
const reRegOld = /^register\(\s*"([^"]+)"\s*,\s*([A-Za-z0-9_$]+)\s*\)\s*;\s*$/;
const reRegNew = /^register\(\s*"([^"]+)"\s*,\s*\(\)\s*=>\s*import\("([^"]+)"\)\s*\)\s*;\s*$/;
const regs = [];                                    // {id, path}

for (const raw of lines) {
  const l = raw.trim();
  let m = reImport.exec(l);
  if (m) { imp.set(m[1], m[2]); continue; }
  m = reRegOld.exec(l);
  if (m) { regs.push({ id: m[1], name: m[2] }); continue; }
  m = reRegNew.exec(l);
  if (m) { regs.push({ id: m[1], path: m[2] }); continue; }
}

for (const r of regs) if (!r.path) r.path = imp.get(r.name);
const missing = regs.filter(r => !r.path);
if (missing.length) { console.error('UNRESOLVED:', missing.map(r => r.id)); process.exit(2); }

const seen = new Set(), dup = [];
for (const r of regs) { if (seen.has(r.id)) dup.push(r.id); seen.add(r.id); }
if (dup.length) console.error('WARN duplicate ids:', dup);

const header = `// src/viz/index.js — viz registry barrel (code-split).
//
// To add a new interactive visualisation:
//   1. Create a JSX file in this directory that default-exports a React component.
//   2. Add one line below:  register("<id>", () => import("./your-file.jsx"));
//   3. Reference it from markdown:  ::: viz <id> "optional caption"
//
// Each viz is registered with a DYNAMIC-IMPORT LOADER (not a static import), so
// Vite splits every viz into its own chunk, fetched only when that viz first
// scrolls into view. Keep the id short, lowercase, stable.

import { register } from "../framework/viz-registry.js";
`;

const idW = Math.min(48, Math.max(...regs.map(r => r.id.length + 3)));
const body = regs
  .map(r => `register(${('"' + r.id + '",').padEnd(idW)} () => import("${r.path}"));`)
  .join('\n');

fs.writeFileSync(path, header + '\n' + body + '\n');
console.log(`transformed: ${regs.length} registrations (${imp.size} static imports collapsed)`);
