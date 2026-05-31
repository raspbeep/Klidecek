#!/usr/bin/env node
// Integrate the two new PDS topics (reputace, anonymita) into manifest + exam + viz + mindmap.
// Targeted text surgery to keep the manifest diff reviewable. Run AFTER content is on disk.
import fs from 'node:fs'
const ROOT = '/home/tmokenc/workspace/vut/aio'
const MF = ROOT + '/public/content/manifest.json'
const IDX = ROOT + '/src/viz/index.js'
const MMF = ROOT + '/public/content/mindmaps/PDS.json'

const TOPICS = [
  ['reputace', 'Důvěra a reputace',
    ['duvera-reputace', 'architektura-reputace', 'vypocet-skore', 'sitovy-system', 'priklady-rizika']],
  ['anonymita', 'Anonymita na Internetu',
    ['identifikace-uzivatele', 'ip-geolokace', 'vpn-proxy', 'onion-tor']],
]
// exam wiring: [spec, examTopicId] -> PDS topic id
const EXAM = [
  ['NSEC', 't56', 'reputace'], ['NSEC', 't57', 'anonymita'],
  ['NNET', 't54', 'reputace'], ['NNET', 't55', 'anonymita'],
]

let text = fs.readFileSync(MF, 'utf8')

// helper: bracket-match the array starting at the '[' at/after `from`
function matchArray(s, from) {
  const start = s.indexOf('[', from)
  let d = 0
  for (let i = start; i < s.length; i++) {
    if (s[i] === '[') d++
    else if (s[i] === ']') { d--; if (d === 0) return [start, i] }
  }
  throw new Error('unmatched [ from ' + from)
}

// --- 1. insert 2 topics into PDS course topics[] ---
const pdsIdx = text.indexOf('"id": "PDS"')
const pdsTopicsKey = text.indexOf('"topics": [', pdsIdx)
const [, pdsTopicsEnd] = matchArray(text, pdsTopicsKey)
function topicObj([id, title, subs]) {
  return {
    id, title,
    subtopics: subs.map(s => ({ id: s, src: `content/courses/PDS/${id}/${s}.md` })),
  }
}
const topicsText = TOPICS.map(t =>
  JSON.stringify(topicObj(t), null, 2).split('\n').map(l => '        ' + l).join('\n')
).join(',\n')
// pdsTopicsEnd points at the closing ']' of the topics array (at 6-space indent)
// the char before it (trimmed) is the last topic's '}' at 8-space. Insert ",\n<topics>\n      " before ']'.
const beforeClose = text.slice(0, pdsTopicsEnd).replace(/\s*$/, '')
text = beforeClose + ',\n' + topicsText + '\n      ' + text.slice(pdsTopicsEnd)

// --- 2. exam refs, scoped per spec array ---
function fmtRefs(refs) {
  return '[\n' + refs.map(r => `          ["${r[0]}", "${r[1]}", "${r[2]}"]`).join(',\n') + '\n        ]'
}
function setRefs(spec, topicId, pdsTopic) {
  const subs = TOPICS.find(t => t[0] === pdsTopic)[2]
  const refs = subs.map(s => ['PDS', pdsTopic, s])
  const specKey = text.indexOf(`"${spec}": [`)
  const [specStart, specEnd] = matchArray(text, specKey)
  let block = text.slice(specStart, specEnd + 1)
  const idIdx = block.indexOf(`"id": "${topicId}"`)
  if (idIdx < 0) throw new Error(`${spec} ${topicId} not found`)
  const refsKey = block.indexOf('"refs": ', idIdx)
  const [aStart, aEnd] = matchArray(block, refsKey)
  block = block.slice(0, aStart) + fmtRefs(refs) + block.slice(aEnd + 1)
  text = text.slice(0, specStart) + block + text.slice(specEnd + 1)
}
for (const [spec, tid, pdsTopic] of EXAM) setRefs(spec, tid, pdsTopic)

JSON.parse(text)
fs.writeFileSync(MF, text)
const m = JSON.parse(text)
const pds = m.courses.find(c => c.id === 'PDS')
console.log('PDS topics now:', pds.topics.length, '(added reputace, anonymita)')
for (const [spec, tid] of EXAM.map(e => [e[0], e[1]])) {
  const t = m.exam[spec].find(x => x.id === tid)
  console.log(`  ${spec} ${tid} refs: ${t.refs.length}`)
}

// --- 3. register new pds-* viz ---
let idx = fs.readFileSync(IDX, 'utf8')
const registered = new Set([...idx.matchAll(/from "\.\/([a-z0-9-]+)\.jsx"/g)].map(x => x[1]))
const allViz = fs.readdirSync(ROOT + '/src/viz').filter(f => f.endsWith('.jsx')).map(f => f.replace('.jsx', ''))
const newViz = allViz.filter(v => !registered.has(v) && v.startsWith('pds-')).sort()
if (newViz.length) {
  const pascal = s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
  const imports = newViz.map(v => `import ${pascal(v)} from "./${v}.jsx";`).join('\n')
  const regs = newViz.map(v => `register("${v}", ${pascal(v)});`).join('\n')
  idx = idx.replace(/\s*$/, '') + '\n\n// === PDS: Důvěra a reputace + Anonymita ===\n' + imports + '\n\n' + regs + '\n'
  fs.writeFileSync(IDX, idx)
}
console.log('viz registered:', newViz.length, newViz.join(', '))

// --- 4. extend PDS mindmap with a new branch ---
const mm = JSON.parse(fs.readFileSync(MMF, 'utf8'))
if (!mm.branches.some(b => b.id === 'trust-anon')) {
  mm.branches.push({
    id: 'trust-anon', label: 'Důvěra a anonymita', hue: 340,
    summary: 'Reputační systémy a anonymita na Internetu',
    clusters: [
      { id: 'reputace', label: 'Reputační systémy', leaves: TOPICS[0][2].map(s => ({ ref: s })) },
      { id: 'anonymita', label: 'Anonymita', leaves: TOPICS[1][2].map(s => ({ ref: s })) },
    ],
  })
  fs.writeFileSync(MMF, JSON.stringify(mm, null, 2) + '\n')
}
console.log('PDS mindmap branches:', mm.branches.length)
console.log('DONE')
