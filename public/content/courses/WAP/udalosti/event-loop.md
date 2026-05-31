---
title: Smyčka událostí (event loop)
---

Webové aplikace musí reagovat na vnější podněty — kliknutí myší, stisk klávesy, příchod síťové odpovědi — a přitom nesmí *zamrznout*. JavaScript je přitom **jednovláknový** (single-threaded): má jeden zásobník volání a v jeden okamžik vykonává právě jednu funkci. Klíč k řešení tohoto rozporu je **neblokující, asynchronní model** řízený smyčkou událostí (*event loop*): zdlouhavé operace se předají na pozadí a jejich dokončení se obslouží později, až je hlavní vlákno volné.

## Stavební díly běhového prostředí

Běhové prostředí (prohlížeč, případně Node.js) se na asynchronní práci skládá z několika částí. Samotný jazykový engine (např. V8) poskytuje jen zásobník volání a haldu; zbytek dodává *hostitelské prostředí*.

* **Call Stack (zásobník volání)** — drží rámce právě běžících funkcí. Funguje jako **LIFO** (last-in, first-out): zavolání funkce přidá rámec navrch, návrat ho odebere. Je *jen jeden* — proto se v jeden okamžik nic jiného neděje.
* **Web API / Node API** — rozhraní, která neposkytuje samotný JavaScript, ale prostředí: `setTimeout`, DOM události, `fetch`, čtení souborů. Spouštějí práci *na pozadí* (časovač, síť, I/O), zcela mimo hlavní vlákno.
* **Fronta makroúloh (task queue / macrotask queue)** — sem prostředí ukládá callbacky, které mají běžet po dokončení asynchronní operace: vypršení `setTimeout`, doručená uživatelská událost, dokončené I/O.
* **Fronta mikroúloh (microtask queue)** — vyhrazená fronta s **vyšší prioritou** pro asynchronní práci vzniklou přímo v JS: reakce na `Promise` (`.then`/`.catch`/`.finally`), `queueMicrotask()` a `MutationObserver`.

::: svg "Běhové prostředí: zásobník, API na pozadí a dvě fronty s rozdílnou prioritou"
<svg viewBox="0 0 540 210" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="20" width="150" height="170" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="89" y="38" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Call Stack</text>
  <text x="89" y="52" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">LIFO · 1 vlákno</text>
  <rect x="34" y="120" width="110" height="22" rx="3" fill="oklch(0.62 0.14 264 / 0.20)" stroke="oklch(0.62 0.14 264)"/>
  <text x="89" y="135" text-anchor="middle" font-size="10" fill="var(--text)" font-family="var(--font-mono)">fn()</text>
  <rect x="34" y="146" width="110" height="22" rx="3" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="89" y="161" text-anchor="middle" font-size="10" fill="var(--text)" font-family="var(--font-mono)">main()</text>

  <rect x="186" y="20" width="160" height="74" rx="8" fill="oklch(0.62 0.14 65 / 0.10)" stroke="oklch(0.62 0.14 65)"/>
  <text x="266" y="40" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text)">Web / Node API</text>
  <text x="266" y="58" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">na pozadí, mimo vlákno</text>
  <text x="266" y="74" text-anchor="middle" font-size="9" fill="var(--text-faint)" font-family="var(--font-mono)">timer · fetch · I/O · DOM</text>

  <rect x="186" y="108" width="160" height="36" rx="6" fill="oklch(0.62 0.14 142 / 0.14)" stroke="oklch(0.62 0.14 142)"/>
  <text x="266" y="124" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">mikroúlohy</text>
  <text x="266" y="138" text-anchor="middle" font-size="8.5" fill="var(--text-faint)" font-family="var(--font-mono)">.then · queueMicrotask</text>

  <rect x="186" y="150" width="160" height="36" rx="6" fill="oklch(0.62 0.18 22 / 0.12)" stroke="oklch(0.62 0.18 22)"/>
  <text x="266" y="166" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">makroúlohy</text>
  <text x="266" y="180" text-anchor="middle" font-size="8.5" fill="var(--text-faint)" font-family="var(--font-mono)">setTimeout · událost · I/O</text>

  <circle cx="450" cy="105" r="52" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="450" y="100" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">event</text>
  <text x="450" y="115" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">loop</text>
  <path d="M 405 95 A 52 52 0 0 1 470 56" fill="none" stroke="var(--accent)" stroke-width="2" marker-end="url(#elArr)"/>

  <line x1="164" y1="130" x2="186" y2="126" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="346" y1="126" x2="398" y2="105" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="346" y1="168" x2="398" y2="115" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="2 2"/>
  <defs>
    <marker id="elArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Jak smyčka pracuje

Smyčka událostí je nekonečný cyklus, který hlídá zásobník volání. Jakmile je **Call Stack prázdný** (synchronní kód doběhl a vrátil řízení), provede jednu *otáčku*:

1. **Vyprázdnit *celou* frontu mikroúloh.** Mikroúlohy se odbavují jedna po druhé, dokud fronta není prázdná. Pokud některá mikroúloha během svého běhu naplánuje další mikroúlohu, ta se zařadí na konec a smyčka ji *stále ještě v téže otáčce* odbaví. Tomuto kroku se říká *microtask checkpoint*.
2. **Zvážit překreslení (render).** Prostředí se rozhodne, zda je čas aktualizovat layout a paint. To nastává typicky v rytmu obnovovací frekvence displeje (na běžném monitoru ~60 Hz, tedy zhruba každých 16,7 ms). Render *není* každou otáčku — prohlížeč ho přeskočí, pokud se od minula nemá co měnit nebo není čas.
3. **Vzít *právě jednu* makroúlohu** z fronty, přesunout ji na zásobník a vykonat. Po jejím doběhnutí se cyklus opakuje od kroku 1.

Zásadní je nesymetrie: **mikroúlohy se vyprazdňují všechny najednou, makroúlohy po jedné za otáčku.** Mezi dvěma makroúlohami se vždy stihne kompletní microtask checkpoint (a případně render).

::: viz wap-event-loop "Krokuj smyčku: sleduj zásobník, obě fronty a render. Všimni si, že microtask fronta se vyprázdní celá dřív než další makroúloha."
:::

```js
console.log("1 — synchronně");                 // hned

setTimeout(() => console.log("4 — makroúloha"), 0);

Promise.resolve().then(() => console.log("3 — mikroúloha"));

console.log("2 — synchronně");                 // hned
// Pořadí výpisu: 1, 2, 3, 4
```

Synchronní kód (`1`, `2`) doběhne celý jako první. Teprve při prázdném zásobníku se vyprázdní mikroúlohy (`3`) a až v další otáčce přijde na řadu makroúloha (`4`) — i když měla nulové zpoždění.

## requestAnimationFrame — háček těsně před renderem

`requestAnimationFrame(cb)` zaregistruje callback do kroku *render* — provede se **těsně před** tím, než prohlížeč vykreslí příští snímek, a synchronizovaně s obnovovací frekvencí displeje. To není pevných 60 Hz: na 120Hz monitoru se callback vyvolá ~120× za sekundu. Pro animace je proto vhodnější než `setTimeout`, který o cyklu vykreslování nic neví a snadno vyrobí trhání nebo zbytečné snímky.

## Node.js: libuv a šest fází

V Node.js funguje fronta mikroúloh stejně jako v prohlížeči, ale makroúlohy řídí knihovna **libuv**, která rozděluje běh do **šesti striktních fází**. Smyčka jimi prochází stále dokola; v každé fázi odbaví callbacky z její vlastní fronty.

| Fáze | Co se odbaví |
|------|-------------|
| **timers** | callbacky `setTimeout` / `setInterval`, jimž vypršel čas |
| **pending callbacks** | některé systémové I/O callbacky odložené z minulé otáčky |
| **idle, prepare** | jen interní použití libuv (není v JS API) |
| **poll** | čekání na I/O a vykonání většiny I/O callbacků |
| **check** | callbacky `setImmediate()` |
| **close callbacks** | `close` události (např. `socket.on('close')`) |

Navíc má Node **`process.nextTick()`** s *absolutní prioritou*: jeho fronta se vyprázdní **dříve než standardní mikroúlohy** (a tedy i dříve, než smyčka přejde do další fáze). Pořadí mezi jednotlivými přechody fází je tedy: nejprve `nextTick`, pak Promise/`queueMicrotask` mikroúlohy, teprve potom callbacky další fáze.

```js
// Node.js
setImmediate(() => console.log("check"));
setTimeout(() => console.log("timers"), 0);
Promise.resolve().then(() => console.log("microtask"));
process.nextTick(() => console.log("nextTick"));

// Typické pořadí: nextTick, microtask, (timers nebo check podle kontextu)
// nextTick a microtask se vyprázdní před přechodem do kterékoli fáze.
```

::: quiz "Po jaké události se ve smyčce zaručeně odbaví VŠECHNY čekající mikroúlohy, než se spustí další makroúloha?"
- [ ] Až po vykreslení snímku (render).
  > Naopak — microtask checkpoint proběhne *před* zvážením renderu, nikoli po něm.
- [x] Vždy, jakmile se vyprázdní zásobník po dokončení aktuální makroúlohy (a synchronního kódu).
  > Přesně tak. Microtask checkpoint nastává při prázdném Call Stacku a vyprázdní frontu mikroúloh úplně — včetně těch, které během toho vzniknou — než se vezme příští makroúloha.
- [ ] Maximálně jedna mikroúloha za otáčku, stejně jako makroúlohy.
  > To je popis makroúloh. Mikroúlohy se vyprazdňují *všechny* v jednom checkpointu.
:::

::: link "WHATWG HTML — Event loops: processing model" "https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model"
:::

::: link "MDN — Microtask guide (queueMicrotask)" "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide"
:::

::: link "Node.js — The event loop, timers, and process.nextTick()" "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick"
:::

::: link "MDN — Window.requestAnimationFrame()" "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame"
:::

---

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: WHATWG HTML Living Standard, MDN Web Docs, Node.js docs (libuv).*
