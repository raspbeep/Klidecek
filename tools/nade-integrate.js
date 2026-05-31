#!/usr/bin/env node
// NADE integration: add 6 courses to manifest, wire exam.NADE refs (scoped),
// register all new viz in index.js, write 6 mindmaps. Targeted text surgery to
// keep the manifest diff reviewable. Run AFTER all content (.md + viz) is on disk.
import fs from 'node:fs'

const ROOT = '/home/tmokenc/workspace/vut/aio'
const MF = ROOT + '/public/content/manifest.json'
const IDX = ROOT + '/src/viz/index.js'
const MM = ROOT + '/public/content/mindmaps'

// ---- course catalogue (ordered topics → subtopics) ----------------------
const COURSES = [
  { id: 'AIS', name: 'Analýza a návrh informačních systémů', credits: 5, semester: 'Winter',
    specializations: ['NADE', 'NISD', 'NSEN'],
    blurb: 'Životní cyklus SW (UP, agile, MDA), modelování v UML, získávání požadavků (FURPS+), objektově orientovaný návrh (GRASP, SOLID), návrhové vzory a kvalita kódu (TDD, refaktorizace, správa kódu).',
    res: [
      ['Larman — Applying UML and Patterns (3rd ed.)', 'https://www.craiglarman.com/wiki/index.php?title=Books_by_Craig_Larman', 'book', 'Kanonický zdroj pro GRASP, Unified Process a OOA/D.'],
      ['Gamma, Helm, Johnson, Vlissides — Design Patterns (GoF)', 'https://www.oreilly.com/library/view/design-patterns-elements/0201633612/', 'book', 'Původní katalog 23 návrhových vzorů.'],
      ['Robert C. Martin — Design Principles and Design Patterns (SOLID)', 'https://web.archive.org/web/20150906155800/http://www.objectmentor.com/resources/articles/Principles_and_Patterns.pdf', 'paper', 'Původní formulace principů SOLID.'],
      ['Fowler — Refactoring (2nd ed.)', 'https://refactoring.com/', 'book', 'Refaktorizace, code smells, katalog úprav.'],
      ['OMG — Unified Modeling Language 2.5.1', 'https://www.omg.org/spec/UML/2.5.1/', 'spec', 'Oficiální specifikace UML.'],
      ['Manifesto for Agile Software Development', 'https://agilemanifesto.org/', 'spec', 'Čtyři hodnoty agilního vývoje.'],
    ],
    topics: [
      ['zivotni-cyklus', 'Životní cyklus a metodiky vývoje SW', ['vodopad-iterativni', 'unified-process', 'agilni-vyvoj', 'mda-agilni-modelovani']],
      ['uml', 'Modelovací techniky UML', ['uml-charakteristika-rozsiritelnost', 'strukturni-diagramy', 'diagramy-chovani']],
      ['pozadavky', 'Získávání a modelování požadavků', ['evoluce-pozadavku', 'furps-plus', 'techniky-elicitace', 'use-case-model']],
      ['oo-navrh', 'Objektově orientovaný návrh', ['oo-podstata', 'rdd-crc', 'grasp', 'solid']],
      ['navrhove-vzory', 'Návrhové vzory', ['vzory-podstata', 'creational-singleton-factory', 'structural-composite-facade', 'behavioral-strategy-observer', 'anti-vzory']],
      ['kvalita-kodu', 'TDD, refaktorizace a správa kódu', ['tdd', 'refaktorizace', 'vlastnictvi-kodu', 'vetveni-git']],
    ]},
  { id: 'NAV', name: 'Návrh vestavěných systémů', credits: 5, semester: 'Winter',
    specializations: ['NADE', 'NCPS', 'NEMB'],
    blurb: 'Vestavěné vs. univerzální systémy, HW/SW co-design, číslicové vstupy a výstupy (level shifting, debouncing, H-můstek), architektura SW (smyčka, FSM, přerušení), řízení spotřeby a snímání neelektrických veličin.',
    res: [
      ['White — Making Embedded Systems (O\'Reilly)', 'https://www.oreilly.com/library/view/making-embedded-systems/9781449308889/', 'book', 'Architektura vestavěného SW: super-loop, FSM, přerušení.'],
      ['Yiu — The Definitive Guide to ARM Cortex-M3/M4', 'https://www.sciencedirect.com/book/9780124080829/the-definitive-guide-to-arm-cortex-m3-and-cortex-m4-processors', 'book', 'Jádro, přerušení, nízkopříkonové režimy.'],
      ['STMicroelectronics — AN4365 / nízkopříkonové režimy STM32', 'https://www.st.com/resource/en/application_note/an4365-low-power-modes-and-system-power-consumption-on-stm32-mcus-stmicroelectronics.pdf', 'docs', 'Run/Sleep/Stop/Standby/Shutdown a clock/power gating v praxi.'],
      ['Horowitz & Hill — The Art of Electronics (3rd ed.)', 'https://artofelectronics.net/', 'book', 'Spínání zátěže, MOSFET, H-můstek, úprava analogového signálu.'],
      ['Ganssle — A Guide to Debouncing', 'http://www.ganssle.com/debouncing.htm', 'reference', 'HW i SW odrušení zákmitů kontaktů.'],
    ],
    topics: [
      ['vestavene-systemy', 'Vestavěný vs. univerzální systém', ['gpcs-vs-embedded', 'architektura-odlisnosti']],
      ['hw-sw-codesign', 'Implementace funkcí SW a HW prostředky', ['partitioning', 'sw-vs-hw-implementace']],
      ['gpio', 'Číslicové vstupy a výstupy', ['level-shifting', 'debouncing', 'ovladani-zateze', 'h-mustek']],
      ['sw-architektura', 'Architektura SW pro vestavěné systémy', ['super-loop', 'stavovy-automat', 'preruseni-isr']],
      ['rizeni-spotreby', 'Řízení spotřeby', ['spotreba-podstata', 'rezimy-cinnosti', 'spotreba-perifierii']],
      ['senzory', 'Snímání neelektrických veličin', ['merici-retezec', 'typy-senzoru', 'analogove-pripojeni', 'digitalni-rozhrani']],
    ]},
  { id: 'PDI', name: 'Prostředí distribuovaných aplikací', credits: 5, semester: 'Summer',
    specializations: ['NADE', 'NNET'],
    blurb: 'Konzistentní globální stav distribuovaného systému (řezy, Chandy–Lamport, vektorové hodiny), distribuované zpracování MapReduce (Hadoop, Spark) a integrace přes Enterprise Service Bus (MOM, EIP).',
    res: [
      ['Chandy & Lamport — Distributed Snapshots (1985)', 'https://lamport.azurewebsites.net/pubs/chandy.pdf', 'paper', 'Původní snapshot algoritmus pro globální stav.'],
      ['Dean & Ghemawat — MapReduce (OSDI 2004)', 'https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf', 'paper', 'Původní paper o MapReduce.'],
      ['Zaharia et al. — Resilient Distributed Datasets (NSDI 2012)', 'https://www.usenix.org/system/files/conference/nsdi12/nsdi12-final138.pdf', 'paper', 'Spark RDD, lineage, in-memory výpočet.'],
      ['Hohpe & Woolf — Enterprise Integration Patterns', 'https://www.enterpriseintegrationpatterns.com/', 'book', 'Katalog EIP: router, filter, splitter, aggregator.'],
      ['Tanenbaum & van Steen — Distributed Systems (3rd ed.)', 'https://www.distributed-systems.net/index.php/books/ds3/', 'book', 'Logické/vektorové hodiny, globální stav, konsensus.'],
    ],
    topics: [
      ['globalni-stav', 'Konzistentní globální stav', ['konzistentni-rez', 'chandy-lamport', 'vektorove-hodiny']],
      ['mapreduce', 'Distribuované zpracování MapReduce', ['mapreduce-model', 'mapreduce-faze', 'hadoop-spark']],
      ['esb', 'Enterprise Service Bus', ['esb-kontejner', 'mom', 'eip-smerovani']],
    ]},
  { id: 'TAMa', name: 'Tvorba aplikací pro mobilní zařízení', credits: 5, semester: 'Summer',
    specializations: ['NADE'],
    blurb: 'Specifika uživatelských rozhraní mobilních telefonů, architektury moderních mobilních aplikací (MVC/MVVM/MVI, deklarativní UI, paralelismus, životní cyklus) a proces návrhu, vývoje a distribuce mobilních aplikací.',
    res: [
      ['Android Developers — Activity lifecycle', 'https://developer.android.com/guide/components/activities/activity-lifecycle', 'docs', 'Životní cyklus aktivity a obnova stavu.'],
      ['Apple — UIViewController', 'https://developer.apple.com/documentation/uikit/uiviewcontroller', 'docs', 'Životní cyklus obrazovky v iOS.'],
      ['Kotlin — Coroutines guide', 'https://kotlinlang.org/docs/coroutines-overview.html', 'docs', 'Strukturovaná asynchronie, suspend, Dispatchers.'],
      ['Nielsen Norman Group — Thumb zone / mobile UX', 'https://www.nngroup.com/articles/mobile-ux/', 'reference', 'Ergonomie dotyku a mobilní použitelnost.'],
      ['OWASP — Mobile Application Security (MASVS)', 'https://mas.owasp.org/MASVS/', 'tool', 'Bezpečnostní standard pro mobilní aplikace.'],
    ],
    topics: [
      ['mobilni-ui', 'Principy a prvky UI mobilních telefonů', ['odlisnosti-desktop', 'ergonomie-thumb-zone', 'principy-navrhu', 'mobilni-formulare']],
      ['architektury-aplikaci', 'Princip činnosti moderních mobilních aplikací', ['mvc-mvvm-mvi', 'deklarativni-ui', 'paralelismus', 'zivotni-cyklus']],
      ['vyvojovy-proces', 'Proces návrhu a vývoje mobilních aplikací', ['sdlc-mvp', 'technologicke-pristupy', 'offline-bezpecnost', 'devops-distribuce']],
    ]},
  { id: 'UXIa', name: 'User Experience a návrh uživatelských rozhraní', credits: 5, semester: 'Winter',
    specializations: ['NADE', 'NGRI'],
    blurb: 'Konceptuální model funkčnosti aplikace (doménový model, verifikace a validace, prototypování) a návrh zaměřený na uživatele (UCD) — proces dle ISO 9241-210, pojmy a metody evaluace použitelnosti.',
    res: [
      ['ISO 9241-210 — Human-centred design for interactive systems', 'https://www.iso.org/standard/77520.html', 'spec', 'Norma definující iterativní proces UCD.'],
      ['Nielsen — 10 Usability Heuristics', 'https://www.nngroup.com/articles/ten-usability-heuristics/', 'reference', 'Heuristiky pro expertní inspekci rozhraní.'],
      ['ISO 9241-11 — Usability: Definitions and concepts', 'https://www.iso.org/standard/63500.html', 'spec', 'Definice použitelnosti (efektivnost, účinnost, spokojenost).'],
      ['Norman — The Design of Everyday Things', 'https://mitpress.mit.edu/9780262525671/the-design-of-everyday-things/', 'book', 'Mentální modely, afordance, kognitivní zátěž.'],
      ['Brooke — System Usability Scale (SUS)', 'https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html', 'reference', 'Standardizovaný dotazník použitelnosti.'],
    ],
    topics: [
      ['konceptualni-model', 'Konceptuální model funkčnosti', ['domenovy-model', 'verifikace-validace', 'prototypovani-fidelity']],
      ['ucd', 'User Centered Design (UCD)', ['ucd-pojmy', 'ucd-proces-iso', 'evaluace-metody']],
    ]},
  { id: 'WAP', name: 'Internetové aplikace', credits: 5, semester: 'Summer',
    specializations: ['NADE', 'NNET'],
    blurb: 'Jazyk JavaScript (typy, uzávěry, prototypy) a události, reprezentace dat (MIME, XML, JSON, DOM, validace), přenos webových dat (URI, HTTP/1-3, CDN, proudy), webové služby (XML-RPC, SOAP, REST) a bezpečnost webových aplikací.',
    res: [
      ['MDN Web Docs', 'https://developer.mozilla.org/', 'docs', 'Referenční dokumentace pro JS, DOM, HTTP, bezpečnost.'],
      ['ECMAScript Language Specification (TC39)', 'https://tc39.es/ecma262/', 'spec', 'Oficiální specifikace jazyka JavaScript.'],
      ['WHATWG — HTML Living Standard', 'https://html.spec.whatwg.org/multipage/', 'spec', 'Smyčka událostí, DOM, parsování.'],
      ['OWASP Top 10 + Cheat Sheet Series', 'https://owasp.org/www-project-top-ten/', 'tool', 'Webové zranitelnosti a obrany (XSS, CSRF).'],
      ['RFC 9110 — HTTP Semantics', 'https://datatracker.ietf.org/doc/html/rfc9110', 'RFC', 'Sémantika metod, stavových kódů a hlaviček HTTP.'],
      ['Fielding — Architectural Styles (REST), Ch. 5', 'https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm', 'paper', 'Původní definice architektonického stylu REST.'],
    ],
    topics: [
      ['javascript', 'Jazyk JavaScript', ['datove-typy', 'scope-uzavery', 'prototypy-delegace']],
      ['udalosti', 'Události v JavaScriptu', ['event-loop', 'asynchronni-programovani', 'dom-events']],
      ['reprezentace-dat', 'Reprezentace dat', ['mime-types', 'znackovaci-jazyky', 'validace-dat']],
      ['http', 'Přenos a distribuce webových dat', ['uri-url-urn', 'http-protokol', 'cdn-anycast', 'http-streams']],
      ['webove-sluzby', 'Webová aplikační rozhraní a webové služby', ['xml-rpc', 'soap-wsdl-uddi', 'rest']],
      ['bezpecnost', 'Bezpečnost webových aplikací', ['sop-cors', 'xss', 'csrf', 'bezpecnostni-hlavicky']],
    ]},
]

// ---- exam.NADE ref mapping: examTopicNumber -> [[course,topic,sub]...] ----
// (existing legacy refs for 13/14/26 are read from the manifest and prepended)
const EXAM = {}
for (const c of COURSES) for (const [tp, , subs] of c.topics) {} // noop
// map each exam number to its course/topic via SPEC order
const EXAM_MAP = {
  1: ['AIS', 'zivotni-cyklus'], 2: ['AIS', 'uml'], 3: ['AIS', 'pozadavky'], 4: ['AIS', 'oo-navrh'],
  5: ['AIS', 'navrhove-vzory'], 6: ['AIS', 'kvalita-kodu'],
  7: ['NAV', 'vestavene-systemy'], 8: ['NAV', 'hw-sw-codesign'], 9: ['NAV', 'gpio'],
  10: ['NAV', 'sw-architektura'], 11: ['NAV', 'rizeni-spotreby'], 12: ['NAV', 'senzory'],
  13: ['PDI', 'globalni-stav'], 14: ['PDI', 'mapreduce'], 15: ['PDI', 'esb'],
  16: ['TAMa', 'mobilni-ui'], 17: ['TAMa', 'architektury-aplikaci'], 18: ['TAMa', 'vyvojovy-proces'],
  19: ['UXIa', 'konceptualni-model'], 20: ['UXIa', 'ucd'],
  21: ['WAP', 'javascript'], 22: ['WAP', 'udalosti'], 23: ['WAP', 'reprezentace-dat'],
  24: ['WAP', 'http'], 25: ['WAP', 'webove-sluzby'], 26: ['WAP', 'bezpecnost'],
}
const findSubs = (cid, tid) => COURSES.find(c => c.id === cid).topics.find(t => t[0] === tid)[2]
for (const [n, [cid, tid]] of Object.entries(EXAM_MAP)) {
  EXAM[n] = findSubs(cid, tid).map(s => [cid, tid, s])
}

// ---- 1. MANIFEST surgery -------------------------------------------------
let text = fs.readFileSync(MF, 'utf8')
const parsed = JSON.parse(text)

// 1a. build & insert course objects before the courses[] closing
function courseObj(c) {
  return {
    id: c.id, name: c.name, credits: c.credits, semester: c.semester,
    specializations: c.specializations, blurb: c.blurb,
    resources: c.res.map(([title, url, kind, note]) => ({ title, url, kind, note })),
    topics: c.topics.map(([id, title, subs]) => ({
      id, title,
      subtopics: subs.map(s => ({ id: s, src: `content/courses/${c.id}/${id}/${s}.md` })),
    })),
  }
}
const coursesText = COURSES.map(c =>
  JSON.stringify(courseObj(c), null, 2).split('\n').map(l => '    ' + l).join('\n')
).join(',\n')

const closeMarker = '\n  ],\n\n  "exam": {'
if (!text.includes(closeMarker)) throw new Error('courses-close marker not found')
text = text.replace(closeMarker, ',\n' + coursesText + closeMarker)

// 1b. set exam.NADE refs (scoped to the NADE array only)
const nadeOpen = text.indexOf('"NADE": [')
if (nadeOpen < 0) throw new Error('NADE exam array not found')
// find matching close bracket of the NADE array
let depth = 0, i = text.indexOf('[', nadeOpen), nadeClose = -1
for (; i < text.length; i++) {
  if (text[i] === '[') depth++
  else if (text[i] === ']') { depth--; if (depth === 0) { nadeClose = i; break } }
}
let nade = text.slice(nadeOpen, nadeClose + 1)

function fmtRefs(refs) {
  return '[\n' + refs.map(r => `          ["${r[0]}", "${r[1]}", "${r[2]}"]`).join(',\n') + '\n        ]'
}
function replaceRefs(block, n, refs) {
  const idIdx = block.indexOf(`"id": "t${String(n).padStart(2, '0')}"`)
  if (idIdx < 0) throw new Error('topic t' + n + ' not found in NADE block')
  const refsKey = block.indexOf('"refs": ', idIdx)
  const arrStart = block.indexOf('[', refsKey)
  let d = 0, j = arrStart, arrEnd = -1
  for (; j < block.length; j++) { if (block[j] === '[') d++; else if (block[j] === ']') { d--; if (d === 0) { arrEnd = j; break } } }
  return block.slice(0, arrStart) + fmtRefs(refs) + block.slice(arrEnd + 1)
}
const LEGACY = { 13: [['PRL', 'synchronizace', 'logicky-cas']], 14: [['UPA', 'nosql-dotazovani', 'mapreduce']], 26: [['BIS', 'sw-zranitelnosti', 'injekce-utoky']] }
for (let n = 1; n <= 26; n++) {
  if (!EXAM[n]) continue
  const legacy = LEGACY[n] || []
  nade = replaceRefs(nade, n, legacy.concat(EXAM[n]))
}
text = text.slice(0, nadeOpen) + nade + text.slice(nadeClose + 1)

JSON.parse(text) // validate
fs.writeFileSync(MF, text)
const after = JSON.parse(text)
console.log('manifest: courses', after.courses.length, '=', after.courses.map(c => c.id).join(','))
console.log('manifest: exam.NADE t01 refs', JSON.stringify(after.exam.NADE[0].refs.length),
  '| t13', after.exam.NADE.find(t => t.id === 't13').refs.length,
  '| t26', after.exam.NADE.find(t => t.id === 't26').refs.length)

// ---- 2. VIZ registration in index.js ------------------------------------
let idx = fs.readFileSync(IDX, 'utf8')
const registered = new Set([...idx.matchAll(/from "\.\/([a-z0-9-]+)\.jsx"/g)].map(m => m[1]))
const allViz = fs.readdirSync(ROOT + '/src/viz').filter(f => f.endsWith('.jsx')).map(f => f.replace('.jsx', ''))
const PFX = /^(ais|nav|pdi|tama|uxi|uxia|wap)-/
const newViz = allViz.filter(v => !registered.has(v) && PFX.test(v)).sort()
const pascal = s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
const imports = newViz.map(v => `import ${pascal(v)} from "./${v}.jsx";`).join('\n')
const regs = newViz.map(v => `register("${v}", ${pascal(v)});`).join('\n')
idx = idx.replace(/\s*$/, '') + '\n\n// === NADE specialization viz (AIS, NAV, PDI, TAMa, UXIa, WAP) ===\n' + imports + '\n\n' + regs + '\n'
fs.writeFileSync(IDX, idx)
console.log('index.js: registered', newViz.length, 'new viz')

// ---- 3. MINDMAPS ---------------------------------------------------------
const MIND = {
  AIS: { summary: 'Proces vývoje, modelování, návrh a kvalita softwaru', branches: [
    ['proces', 'Proces a požadavky', 142, 'Jak software vzniká a co má dělat', [['lifecycle', 'Životní cyklus', 'zivotni-cyklus'], ['reqs', 'Požadavky', 'pozadavky']]],
    ['navrh', 'Návrh', 22, 'Jak systém strukturovat', [['ood', 'OO návrh', 'oo-navrh'], ['patterns', 'Návrhové vzory', 'navrhove-vzory']]],
    ['kvalita', 'Modelování a kvalita', 200, 'Vizualizace a udržení kvality', [['uml', 'UML', 'uml'], ['quality', 'TDD a správa kódu', 'kvalita-kodu']]],
  ]},
  NAV: { summary: 'Hardware, rozhraní, software a spotřeba vestavěných systémů', branches: [
    ['platforma', 'Platforma', 315, 'Co odlišuje vestavěný systém', [['def', 'Vymezení', 'vestavene-systemy'], ['codesign', 'HW/SW co-design', 'hw-sw-codesign']]],
    ['rozhrani', 'Rozhraní s fyzickým světem', 50, 'Vstupy, výstupy a senzory', [['io', 'Číslicové I/O', 'gpio'], ['sensors', 'Senzory', 'senzory']]],
    ['software', 'Software a spotřeba', 175, 'Organizace SW a energie', [['arch', 'Architektura SW', 'sw-architektura'], ['power', 'Řízení spotřeby', 'rizeni-spotreby']]],
  ]},
  PDI: { summary: 'Globální stav, distribuované zpracování a integrace', branches: [
    ['stav', 'Globální stav', 215, 'Snímek běžícího distribuovaného výpočtu', [['gs', 'Konzistentní stav', 'globalni-stav']]],
    ['zpracovani', 'Distribuované zpracování', 142, 'Paralelní výpočet nad velkými daty', [['mr', 'MapReduce', 'mapreduce']]],
    ['integrace', 'Integrace systémů', 22, 'Propojení heterogenních aplikací', [['esb', 'ESB a MOM', 'esb']]],
  ]},
  TAMa: { summary: 'UI, architektura a vývoj mobilních aplikací', branches: [
    ['ui', 'Uživatelské rozhraní', 5, 'Specifika mobilního UI', [['mui', 'UI mobilů', 'mobilni-ui']]],
    ['arch', 'Architektura aplikace', 264, 'Jak mobilní aplikace funguje', [['app', 'Architektury a běh', 'architektury-aplikaci']]],
    ['proces', 'Vývoj a provoz', 142, 'Od návrhu po distribuci', [['proc', 'Vývojový proces', 'vyvojovy-proces']]],
  ]},
  UXIa: { summary: 'Konceptuální model a návrh zaměřený na uživatele', branches: [
    ['model', 'Konceptuální model', 285, 'Popis funkčnosti a jeho ověření', [['cm', 'Model funkčnosti', 'konceptualni-model']]],
    ['ucd', 'User Centered Design', 130, 'Návrh kolem potřeb uživatele', [['u', 'UCD', 'ucd']]],
  ]},
  WAP: { summary: 'JavaScript, data, přenos, služby a bezpečnost webu', branches: [
    ['js', 'JavaScript', 50, 'Jazyk a jeho běhový model', [['lang', 'Jazyk', 'javascript'], ['ev', 'Události', 'udalosti']]],
    ['data', 'Data a přenos', 215, 'Reprezentace a doručení dat', [['rep', 'Reprezentace dat', 'reprezentace-dat'], ['http', 'Přenos (HTTP)', 'http']]],
    ['sluzby', 'Služby a bezpečnost', 340, 'API a obrana aplikací', [['ws', 'Webové služby', 'webove-sluzby'], ['sec', 'Bezpečnost', 'bezpecnost']]],
  ]},
}
for (const c of COURSES) {
  const m = MIND[c.id]
  const subsOf = (tid) => c.topics.find(t => t[0] === tid)[2]
  const mm = {
    courseId: c.id, title: c.name, summary: m.summary,
    branches: m.branches.map(([bid, label, hue, bsum, clusters]) => ({
      id: bid, label, hue, summary: bsum,
      clusters: clusters.map(([cid, clabel, tid]) => ({
        id: cid, label: clabel, leaves: subsOf(tid).map(s => ({ ref: s })),
      })),
    })),
  }
  fs.writeFileSync(`${MM}/${c.id}.json`, JSON.stringify(mm, null, 2) + '\n')
}
console.log('mindmaps: wrote', COURSES.length, 'files')
console.log('DONE')
