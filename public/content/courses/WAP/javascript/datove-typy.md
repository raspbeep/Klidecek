---
title: Datové typy a typový systém
---

JavaScript (norma **ECMAScript**) je jazyk s **dynamickým** a zároveň **slabým** typováním. Tyto dvě vlastnosti spolu úzce souvisejí, ale popisují různé věci a u zkoušky se nesmí zaměňovat.

**Dynamické typování** znamená, že typ není svázán s proměnnou, ale s **hodnotou** v paměti. Proměnná je jen pojmenovaný odkaz — během běhu do ní lze postupně uložit číslo, řetězec i objekt. Typová kontrola tak probíhá až za běhu, ne při překladu.

```js
let x = 42;        // hodnota typu Number
x = "čtyřicet dva"; // tatáž proměnná teď drží String — žádná chyba
x = { val: 42 };    // a teď Object
```

**Slabé typování** znamená, že jazyk při operaci mezi nekompatibilními typy hodnoty **implicitně přetypuje** (*type coercion*) místo toho, aby vyhodil chybu. Operátor `+` je přetížený: pokud je alespoň jeden operand řetězec, provede se **konkatenace** (druhý operand se převede na řetězec); jinak se obě strany převedou na čísla a sčítají se. Ostatní aritmetické operátory (`-`, `*`, `/`) vždy konvertují na čísla.

```js
1 + "2"    // "12"   — String, protože "2" vynutí konkatenaci
1 - "2"    // -1     — Number, "-" konvertuje "2" na číslo
"5" * "2"  // 10     — Number
[] + {}    // "[object Object]"  — obě strany na řetězec
true + 1   // 2      — true → 1
```

Právě tato „pohotová" konverze je zdrojem proslulých záludností. U zkoušky stačí umět vysvětlit pravidlo (`+` s řetězcem = konkatenace, ostatní = numerická konverze) a rozdíl mezi *dynamickým* (typ váže hodnota) a *slabým* (implicitní coercion) typováním.

## Osm datových typů

Specifikace ECMAScript definuje **8 datových typů**: 7 z nich je **primitivních** a jeden je **referenční** (Object). Primitiva jsou **neměnná** (immutable) a sama o sobě nemají vlastnosti ani metody — jsou to čisté hodnoty.

| Typ | Kategorie | Popis |
|-----|-----------|-------|
| `Undefined` | primitivum | jediná hodnota `undefined`; neinicializovaná proměnná, chybějící argument, neexistující vlastnost |
| `Null` | primitivum | jediná hodnota `null`; záměrná absence objektu, finální článek prototypového řetězce |
| `Boolean` | primitivum | `true` / `false` |
| `Number` | primitivum | 64bit IEEE 754 double; celá i desetinná čísla, `Infinity`, `-Infinity`, `NaN` |
| `BigInt` | primitivum | celá čísla bez omezení velikosti; literál s příponou `n` (`10n`) |
| `String` | primitivum | neměnná posloupnost jednotek v kódování UTF-16; JS nemá samostatný typ `char` |
| `Symbol` | primitivum | garantovaně unikátní a neměnný identifikátor, typicky jako klíč vlastnosti |
| `Object` | referenční | dynamická kolekce slotů klíč–hodnota na haldě; sem patří i pole a funkce |

### Number — proč „jen" ±(2^53 − 1)

`Number` je 64bitová hodnota podle **IEEE 754 (double precision)**. Z 64 bitů je 1 znaménkový, 11 pro exponent a **52 pro mantisu**. Implicitní vedoucí jednička dává 53 platných bitů — proto lze přesně reprezentovat **celá čísla jen v rozsahu** od `Number.MIN_SAFE_INTEGER` do `Number.MAX_SAFE_INTEGER`:

::: math
±(2^53 − 1) = ±9 007 199 254 740 991
:::

Za touto hranicí přestávají být celá čísla jednoznačná — mezera mezi sousedními reprezentovatelnými hodnotami je větší než 1, takže `2^53` a `2^53 + 1` mají stejnou reprezentaci. Pro přesnou celočíselnou aritmetiku mimo tento rozsah (kryptografie, identifikátory z databáze) existuje samostatný typ **`BigInt`**, který velikostí omezen není.

```js
Number.MAX_SAFE_INTEGER          // 9007199254740991
2 ** 53 === 2 ** 53 + 1          // true (!) — ztráta přesnosti
9007199254740991n + 2n           // 9007199254740993n — BigInt je přesný
typeof 10n                       // "bigint"
```

`BigInt` a `Number` se **nemíchají** — `10n + 1` vyhodí `TypeError`; je nutná explicitní konverze.

### Object, funkce a pole

Vše, co není jedním ze 7 primitiv, je **Object** — alokuje se na **haldě** (heap) a proměnná drží jen referenci. Do této kategorie technicky spadají i **funkce** (objekty první kategorie, navíc *volatelné*) a **pole** (objekty s celočíselnými klíči a vlastností `length`).

## Autoboxing

Primitiva jsou neměnná a bez metod — přesto nad nimi lze metody volat. Když napíšeme `"text".toUpperCase()`, JS hodnotu na pozadí dočasně **obalí** odpovídajícím wrapper objektem (`new String("text")`), zavolá na něm metodu a obalový objekt hned uvolní. Tomuto mechanismu se říká **autoboxing**.

```js
"text".toUpperCase()  // "TEXT" — dočasný String wrapper
(42).toFixed(2)       // "42.00" — dočasný Number wrapper
true.toString()       // "true"
```

Důsledek autoboxingu je instruktivní: pokus přiřadit primitivu vlastnost projde bez chyby, ale **nic neuloží** — wrapper, na který se zapisuje, totiž okamžitě zmizí.

```js
let s = "ahoj";
s.lang = "cs";   // zapíše se na dočasný wrapper…
console.log(s.lang);  // undefined — wrapper byl zahozen
```

## Typové anomálie u `typeof`

Operátor `typeof` vrací řetězec s názvem typu. Dvě jeho odpovědi jsou klasické zkouškové chytáky:

| Výraz | Výsledek | Poznámka |
|-------|----------|----------|
| `typeof undefined` | `"undefined"` | |
| `typeof true` | `"boolean"` | |
| `typeof 42` | `"number"` | |
| `typeof 10n` | `"bigint"` | |
| `typeof "x"` | `"string"` | |
| `typeof Symbol()` | `"symbol"` | |
| `typeof {}` | `"object"` | |
| `typeof null` | `"object"` | **anomálie** — historická chyba |
| `typeof function(){}` | `"function"` | funkce je podtyp Object, ne 8. typ |

`typeof null === "object"` je **chyba z první verze jazyka** (1995): hodnoty byly v paměti tagovány a `null` měla stejný tag jako objektové reference. Oprava by porušila zpětnou kompatibilitu nesčetného množství stránek, proto v jazyce zůstává navždy. Pro spolehlivý test na `null` se používá `value === null`.

`typeof` na funkci vrací `"function"`, **ačkoliv funkce není jedním z 8 specifikovaných typů** — je to volatelný objekt. `typeof` ji vyčleňuje zvlášť čistě jako praktickou pohodlnost (test „je to volatelné?").

::: viz wap-typeof-coercion "Vyber hodnotu a sleduj, co vrátí typeof a jak se chová při coercion s operátorem + a v booleovském kontextu."
:::

## JavaScript je kompilovaný (JIT)

Z pohledu programátora vypadá JS jako *interpretovaný* skriptovací jazyk — distribuuje se jako čistý text bez build kroku. V moderních enginech (V8, SpiderMonkey) jde ale o **kompilovaný jazyk s JIT** (*Just-In-Time compilation*): než engine spustí první řádek, proběhne nepozorovatelná, ale **oddělená kompilační fáze** — zdroj se tokenizuje, parsuje do **AST** a teprve pak vykonává (V8: AST → bytecode interpret *Ignition* → optimalizující překladač *TurboFan* pro „horký" kód).

Že tato fáze opravdu existuje, lze dokázat dvěma pozorováními:

* **Syntaktické chyby** se ohlásí **dříve, než se provede první příkaz**. Při čisté interpretaci „řádek po řádku" by se chyba na konci souboru projevila až po vykonání předchozích řádků — což se neděje.

* **Hoisting** — deklarace proměnných a funkcí jsou „k dispozici" dříve, než na ně runtime narazí. To je možné jen proto, že je kompilační fáze předem zaregistruje do příslušných rozsahů platnosti. (Mechanismus hoistingu probírá [[scope-uzavery]].)

```js
foo();                  // vypíše "ahoj" — funkce je dostupná před deklarací
function foo() { console.log("ahoj"); }

console.log("nikdy");   // neprovede se — engine ohlásí SyntaxError ještě před během
const x = ;             // SyntaxError: nahlášeno při parsování, ne za běhu
```

::: quiz "Co vypíše `console.log(1 + 2 + "3")`?"
- [ ] `"123"`
  > Pozor na asociativitu zleva: `1 + 2` se vyhodnotí jako první (obě čísla → `3`), teprve pak `3 + "3"`.
- [x] `"33"`
  > `+` je levě asociativní: `(1 + 2)` = `3` (Number), pak `3 + "3"` má řetězcový operand → konkatenace → `"33"`.
- [ ] `6`
  > Konkatenace s `"3"` zabrání numerickému sečtení.
- [ ] `TypeError`
  > Slabé typování chybu nevyhodí — místo toho přetypuje.
:::

::: link "MDN — JavaScript data types and data structures" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures"
:::

::: link "MDN — Number.MAX_SAFE_INTEGER" "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER"
:::

::: link "ECMAScript® Language Specification — ECMAScript Language Types" "https://tc39.es/ecma262/#sec-ecmascript-language-types"
:::

---

*Zdroj: SZZ NADE — předmět Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs, ECMAScript Language Specification (TC39), V8 dokumentace (v8.dev), IEEE 754.*
