---
title: Klientské události (DOM)
---

V prohlížeči vznikají události interakcí uživatele s objekty stromu **DOM** (Document Object Model) — kliknutí, pohyb myši, stisk klávesy, posun stránky. Aplikace na ně reaguje pomocí *posluchačů* (event listeners) registrovaných přes `addEventListener`. Tyto callbacky se z pohledu smyčky událostí doručují jako **makroúlohy**.

## Šíření události: capturing → target → bubbling

Když uživatel klikne na vnořený prvek, událost se nedoručí jen jemu — *prochází* DOM stromem ve třech fázích:

1. **Capturing (zachytávání)** — událost sestupuje od kořene (`window` → `document` → …) dolů k cílovému prvku.
2. **Target (cíl)** — událost dosáhne prvku, na kterém vznikla.
3. **Bubbling (probublávání)** — událost stoupá zpět od cíle nahoru ke kořeni.

Posluchač se standardně spouští ve fázi **bubbling**. Chce-li ho vývojář spustit už při sestupu, zaregistruje ho s `capture: true`. Šíření lze v posluchači zastavit pomocí `event.stopPropagation()`.

::: viz wap-event-propagation "Klikni na tlačítko a krokuj, jak událost sestupuje (capturing), zasáhne cíl a probublává zpět. Přepni, kteří posluchači jsou registrováni v capture fázi."
:::

```html
<div id="dum">
  <div id="pokoj">
    <button id="tlacitko">Klikni</button>
  </div>
</div>
```

```js
dum.addEventListener("click", () => console.log("dům"));
pokoj.addEventListener("click", () => console.log("pokoj"));
tlacitko.addEventListener("click", () => console.log("tlačítko"));

// Klik na tlačítko (všechny posluchače v bubbling fázi) vypíše:
// tlačítko, pokoj, dům   — od cíle vzhůru ke kořeni
```

Bubbling je základem **delegování událostí** (*event delegation*): místo posluchače na každém z mnoha prvků se zaregistruje *jeden* posluchač na společném předkovi a podle `event.target` se zjistí, kdo událost vyvolal. Šetří to paměť a funguje i pro prvky přidané později.

## Konfigurace addEventListener

Třetí argument `addEventListener` může být místo prostého booleanu (který nastavoval jen `capture`) konfigurační objekt:

| Volba | Význam |
|-------|--------|
| `capture` | `true` → posluchač se spustí ve fázi capturing místo bubbling |
| `once` | `true` → posluchač se po prvním spuštění automaticky odregistruje |
| `passive` | `true` → vývojář *zaručuje*, že posluchač nezavolá `preventDefault()` |
| `signal` | `AbortSignal` → posluchač se odstraní, když se zavolá `abort()` |

```js
el.addEventListener("scroll", onScroll, { passive: true, once: false });
```

### passive: true a plynulý scroll

`passive: true` je zásadní optimalizace pro plynulost. Tím vývojář prohlížeči garantuje, že posluchač **nezavolá `event.preventDefault()`**. Prohlížeč pak nemusí čekat na doběhnutí JavaScriptu, než rozhodne o výchozí akci — může **rolovat okamžitě**, paralelně s během posluchače. Bez této záruky by prohlížeč u každého `wheel`/`touchmove` musel počkat, jestli mu posluchač scroll nezruší, což u dlouhých posluchačů viditelně trhá rolování.

Pokud passive posluchač přesto zavolá `preventDefault()`, **nic se nestane** — volání je ignorováno a konzole obvykle zaloguje varování. V moderních prohlížečích je proto `passive` *implicitně `true`* pro `wheel`, `mousewheel`, `touchstart` a `touchmove` registrované na dokumentových uzlech (`window`, `document`, `document.body`). Chce-li tam vývojář `preventDefault` opravdu použít, musí nastavit `passive: false` explicitně.

## Uživatelská vs. programová událost

Velmi oblíbený zkouškový rozdíl. Stejný `click` se chová jinak podle toho, kdo ho vyvolal:

* **Uživatelské kliknutí** (reálně myší) je asynchronní událost zařazená do **fronty makroúloh**. Jsou-li na prvku dva posluchače, po doběhnutí prvního se zásobník vyprázdní, smyčka odbaví **mikroúlohy** vzniklé v prvním posluchači (např. jeho `Promise.then`), a teprve potom pokračuje druhým posluchačem.
* **Programové kliknutí** `element.click()` provede prohlížeč **synchronně** jako běžné volání metody. Oba posluchače se zavolají bezprostředně za sebou **na témže zásobníku** — ten se mezi nimi *nevyprázdní*. Mikroúlohy z obou posluchačů proto musí počkat až na úplný konec celého spouštěcího skriptu (až se zásobník vyprázdní).

```js
btn.addEventListener("click", () => {
  console.log("A1");
  Promise.resolve().then(() => console.log("A2 (mikro)"));
});
btn.addEventListener("click", () => console.log("B1"));

btn.click();   // programově (synchronně):  A1, B1, A2 (mikro)
// reálný klik myší (asynchronně):           A1, A2 (mikro), B1
```

## Optimalizace vysokofrekvenčních událostí

Události jako `scroll`, `resize`, `mousemove` nebo psaní do `input` generují *záplavu* volání, která zahltí hlavní vlákno. Dva návrhové vzory tok zkrotí:

* **Debouncing** — sérii rychlých událostí *seskupí do jediné* a obsluhu spustí **až po uplynutí doby nečinnosti**. Typicky našeptávač ve vyhledávání: odešleme dotaz, až uživatel přestane psát.
* **Throttling** — omezí spouštění na **nejvýše jednou za daný interval** (např. max 1× za 100 ms). Hodí se tam, kde chceme průběžnou, ale ne přehlcenou reakci, typicky na `scroll`.

::: viz wap-debounce-throttle "Posouvej myší přes plochu a porovnej, kolikrát se spustí surová obsluha, debounced a throttled varianta. Měň interval a sleduj rozdíl v chování."
:::

Pro animace svázané s vykreslováním je lepší než časovače použít **`requestAnimationFrame`**: garantuje synchronizaci s obnovováním obrazovky (běh těsně před každým snímkem v rytmu displeje), takže nevzniká trhání ani zbytečná práce mezi snímky.

```js
// Throttle scroll přes requestAnimationFrame — max jednou za snímek
let naplanovano = false;
window.addEventListener("scroll", () => {
  if (naplanovano) return;
  naplanovano = true;
  requestAnimationFrame(() => {
    aktualizujUI();           // proběhne těsně před vykreslením snímku
    naplanovano = false;
  });
}, { passive: true });
```

::: quiz "Proč `passive: true` u posluchače `scroll`/`touchmove` zlepšuje plynulost rolování?"
- [x] Prohlížeč nemusí čekat na doběhnutí posluchače, protože má zaručeno, že nezavolá preventDefault() — může rolovat okamžitě.
  > Přesně. Záruka „nebudu rušit výchozí akci" dovolí prohlížeči spustit scroll paralelně s posluchačem, bez čekání.
- [ ] Posluchač se díky tomu spustí jen jednou.
  > To je chování `once: true`, ne `passive`.
- [ ] Událost se přestane šířit bubbling fází.
  > Šíření zastavuje `stopPropagation()`; `passive` se týká výchozí akce (preventDefault), ne propagace.
:::

::: link "MDN — EventTarget.addEventListener() (options: capture, once, passive, signal)" "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener"
:::

::: link "MDN — Event bubbling and capture" "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events"
:::

::: link "DOM Living Standard — Dispatching events (propagation phases)" "https://dom.spec.whatwg.org/#dispatching-events"
:::

---

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs, WHATWG DOM Living Standard.*
