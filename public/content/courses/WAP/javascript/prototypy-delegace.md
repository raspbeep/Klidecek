---
title: Prototypy a delegace volání
---

JavaScript je ve svém jádru **bezpříznakový** (*classless*) jazyk — postrádá klasické třídy ve smyslu Javy či C++. Dědičnost je **prototypová**: objekt rovnou dědí od jiného **objektu**. Klíčové slovo `class` zavedené v ES6 je pouze **syntaktický cukr** (*syntactic sugar*) nad existujícím prototypovým mechanismem; nic nového do běhového modelu nepřidává.

```js
// class je jen jiný zápis téhož:
class Pes { ozvi() { return "haf"; } }

// …pod kapotou je to prototypový objekt:
function Pes2() {}
Pes2.prototype.ozvi = function () { return "haf"; };
// new Pes() i new Pes2() vyrobí objekt delegující na svůj .prototype
```

## Prototypový řetězec a delegace čtení

Objekt si lze představit jako dynamický **„pytel" slotů** (vlastností a metod). Každý objekt má skrytý interní slot **`[[Prototype]]`** — odkaz na svůj rodičovský objekt (čte se přes `Object.getPrototypeOf(obj)`, historicky přes `__proto__`).

Při **čtení** vlastnosti probíhá **delegace**: engine ji hledá nejprve jako vlastní vlastnost (*own property*) na samotném objektu; nenajde-li ji, deleguje hledání na jeho `[[Prototype]]`, a tak rekurzivně **stoupá po prototypovém řetězci**. Konec řetězce tvoří typicky `Object.prototype`, jehož `[[Prototype]]` je **`null`**. Dojde-li hledání až k `null`, vyhledávání skončí a výsledek je **`undefined`** (žádná výjimka).

::: viz wap-proto-chain "Klikni na vlastnost a sleduj, jak delegace stoupá po prototypovém řetězci k null. Pak zkus zápis — uvidíš, že vytvoří vlastní vlastnost (shadowing), místo aby šel do prototypu."
:::

Hlavní smysl řetězce je **sdílení kódu** — paměťová a výkonnostní optimalizace. Metoda je uložena **jednou** v prototypu (např. v `Constructor.prototype`) a všechny instance k ní mají delegovaný přístup, místo aby každá nesla vlastní kopii. To je implementace dědičnosti v bezpříznakovém jazyce.

## Zápis se nedeleguje — shadowing

Zásadní asymetrie: **delegace platí jen pro čtení**. **Zápis** (`obj.x = ...`) se do prototypu **nedeleguje** — vytvoří (nebo přepíše) **vlastní vlastnost** přímo na cílovém objektu. Stejnojmenná vlastnost dál existuje v prototypu, ale od této chvíle ji vlastní vlastnost **zastiňuje** (*shadowing*). Tak vzniká přepis metod (*overriding*): stačí na potomka přiřadit vlastnost se shodným jménem.

```js
const zaklad = { pozdrav() { return "ahoj z prototypu"; } };
const dite = Object.create(zaklad);   // dite.[[Prototype]] === zaklad

dite.pozdrav();        // "ahoj z prototypu" — delegováno čtení nahoru
dite.pozdrav = () => "ahoj z dítěte";  // ZÁPIS → vlastní vlastnost na dite
dite.pozdrav();        // "ahoj z dítěte" — zastíněno; prototyp se nemění
zaklad.pozdrav();      // "ahoj z prototypu" — prototyp zůstal netknutý
```

## `[[Prototype]]` versus `.prototype`

Tyto dva pojmy se u zkoušky často pletou, ačkoliv znamenají úplně jiné věci.

| | `[[Prototype]]` | `.prototype` |
|---|---|---|
| Co to je | interní slot **každého** objektu | běžná vlastnost **funkcí** (kromě šipkových) |
| K čemu | odkaz na objekt, od kterého se **dědí** | „vzor" pro objekty vyrobené přes `new` |
| Přístup | `Object.getPrototypeOf(o)`, `o.__proto__` | `Fn.prototype` |
| Kdy se uplatní | při delegaci čtení vlastností | při volání `new Fn()` |

Při volání **`new Fn()`** engine: (1) vytvoří nový prázdný objekt, (2) nastaví jeho `[[Prototype]]` na `Fn.prototype`, (3) zavolá `Fn` s `this` navázaným na nový objekt, (4) vrátí ten objekt (pokud `Fn` nevrátí vlastní objekt). Vztah je tedy: `Object.getPrototypeOf(new Fn()) === Fn.prototype`.

```js
function Fn() {}
const o = new Fn();
Object.getPrototypeOf(o) === Fn.prototype;  // true
Fn.prototype.constructor === Fn;            // true
```

## `this` — runtime binding

Hodnota `this` **není** určena místem, kde je funkce deklarována, ale **způsobem, jakým je v daný okamžik volána** (*runtime binding*). Toto je nejčastější zdroj nedorozumění oproti Javě či C++.

* **`obj.metoda()`** — `this` ukazuje na `obj` (objekt vlevo od tečky), tedy na ten objekt, který delegaci **začal** — i když je metoda fyzicky uložena výš v prototypu.
* **Vytržená metoda** zavolaná samostatně (`const f = obj.metoda; f();`) ztrácí příjemce: `this` je `undefined` ve striktním režimu, nebo globální objekt (`globalThis`) v nestriktním.

```js
const obj = {
  jmeno: "Anna",
  pozdrav() { return "Já jsem " + this.jmeno; },
};
obj.pozdrav();              // "Já jsem Anna"   — this = obj

const f = obj.pozdrav;      // metoda vytržena
f();                        // strict: TypeError (this je undefined)
                            // sloppy: "Já jsem undefined" (this = globalThis)
```

V kontextu dědičnosti platí důležité pravidlo: při vyhodnocování **zděděné** metody `this` vždy ukazuje na **volající (dceřiný) objekt**, který delegaci začal — **nikoli** na prototyp, kde metoda fyzicky leží. Díky tomu zděděná metoda pracuje s daty konkrétní instance.

### Šipkové funkce — lexikální `this`

**Šipkové funkce** (*arrow functions*) jsou jedinou výjimkou: nemají **vlastní** `this`, ale **lexikálně** ho přebírají z prostředí, ve kterém byly definovány (chovají se jako uzávěr nad `this`). Proto je `call`/`apply`/`bind` na jejich `this` nepřepíšou, nemají vlastní `arguments` a **nelze je použít jako konstruktor** (`new` u nich vyhodí chybu) — nemají `.prototype`.

```js
const odpocet = {
  zbyva: 3,
  start() {
    setInterval(() => {     // šipka: this = odpocet (lexikálně z metody start)
      this.zbyva--;         // funguje
    }, 1000);
    // s function() {} by zde this byl undefined / globalThis — klasický bug
  },
};
```

### call / apply / bind

Trojice metod z `Function.prototype` umožňuje **explicitně** řídit `this`:

| Metoda | Spustí ihned? | Argumenty | Vrací |
|--------|---------------|-----------|-------|
| `fn.call(thisArg, a, b)` | ano | jednotlivě | výsledek volání |
| `fn.apply(thisArg, [a, b])` | ano | jako pole | výsledek volání |
| `fn.bind(thisArg, a)` | **ne** | jednotlivě (lze parciálně) | **novou** vázanou funkci |

```js
function predstav(pozdrav) { return pozdrav + ", já jsem " + this.jmeno; }
const petr = { jmeno: "Petr" };

predstav.call(petr, "Ahoj");      // "Ahoj, já jsem Petr"
predstav.apply(petr, ["Zdar"]);   // "Zdar, já jsem Petr"

const vazanaPetr = predstav.bind(petr);  // this navždy = petr
vazanaPetr("Nazdar");             // "Nazdar, já jsem Petr"
```

`bind` vrací **novou** funkci s natrvalo „zamčeným" `this` (a případně předvyplněnými argumenty — *partial application*); tu už nelze pozdějším `bind` nebo `call` přepojit na jiné `this`. Typicky se používá pro event handlery, aby si metoda objektu udržela správný kontext (jinak by se `this` v DOM listeneru navázal na element).

## Polymorfismus: overriding a duck typing

V prototypovém modelu se polymorfismus řeší **přepisem metod** (*method overriding*): obecná metoda žije na nadřazeném prototypu, a potřebuje-li potomek jiné chování, definuje si **vlastní** vlastnost téhož jména. Delegace začíná vždy u objektu, narazí na přepsanou metodu okamžitě a zbytek řetězce ignoruje.

```js
const zvire  = { zvuk() { return "..."; } };
const kocka  = Object.create(zvire);
kocka.zvuk   = function () { return "mňau"; };   // override
const had    = Object.create(zvire);             // bez override

kocka.zvuk();  // "mňau"  — vlastní metoda
had.zvuk();    // "..."   — delegováno na zvire
```

Druhou, ještě flexibilnější formou je **duck typing** plynoucí z dynamického typování: funkce nevyžaduje objekt konkrétní třídy — stačí, že objekt **„umí" požadované rozhraní** (má danou metodu). *„Když to kváká jako kachna, je to kachna."*

```js
function prehrajZvuk(x) { return x.zvuk(); }  // nezajímá ho typ, jen metoda zvuk()
prehrajZvuk(kocka);   // "mňau"
prehrajZvuk({ zvuk: () => "bzzz" });  // "bzzz" — libovolný objekt s metodou zvuk
```

::: quiz "`const f = obj.metoda; f();` ve striktním režimu vyhodí TypeError při čtení `this.jmeno`. Proč?"
- [x] `this` se váže podle způsobu volání; samostatné `f()` nemá příjemce, takže `this` je `undefined`.
  > Přesně — runtime binding. Vytržením metody z objektu se ztratí příjemce. Volání `obj.metoda()` by `this` navázalo na `obj`; samostatné `f()` ve strict módu dá `undefined`, a čtení `.jmeno` z `undefined` je TypeError.
- [ ] Metoda byla zkopírována bez svého `this`, které je svázané s místem deklarace.
  > `this` není svázané s místem deklarace (to platí jen pro šipkové funkce). U běžné funkce rozhoduje způsob volání.
- [ ] `f` ztratila přístup k prototypu objektu.
  > Prototyp s tím nesouvisí; chyba je ve vazbě `this`, ne v delegaci čtení.
:::

::: link "MDN — Inheritance and the prototype chain" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain"
:::

::: link "MDN — this" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this"
:::

::: link "MDN — Object.getPrototypeOf()" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf"
:::

---

*Zdroj: SZZ NADE — předmět Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs, ECMAScript Language Specification (TC39).*
