---
title: Objektový model dat — přehled
---

V přednášce o základech IS jsme viděli několik [[databazove-modely|databázových modelů]] a věnovali se hlavně tomu **relačnímu**. Objektový model přistupuje k uložení dat z jiného úhlu: místo *tabulek a řádků* pracuje s **třídami a objekty** — tedy s pojmy známými z objektově orientovaného programování, ale použitými pro *modelování dat*, nikoli pro procedurální logiku.

## Třída jako datový typ

Ústřední myšlenka objektového modelu: **třída je datový typ** (strukturovaný). To znamená:

* je to **množina hodnot** (objektů) — potenciálně nekonečná,
* každý objekt má **jednoznačnou identitu** (OID, *Object ID*),
* třída popisuje **vlastnosti** objektu (atributy + vztahy), nikoli procedurální metody — *metody zde nemodelujeme, pracujeme s datovým aspektem* (rozdíl proti OO návrhu softwaru, kde má třída plnohodnotnou business logiku).

::: svg "Třída v OO návrhu softwaru vs. třída v objektovém modelu dat"
<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="15" width="255" height="150" rx="6" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.62 0.14 22)"/>
  <text x="137" y="36" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.42 0.14 22)">OO návrh SW (Java, UML…)</text>
  <text x="137" y="56" text-anchor="middle" font-size="12" fill="var(--text)">Třída = jednotka chování</text>
  <text x="22" y="82" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ atributy (stav)</text>
  <text x="22" y="100" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ konstruktor</text>
  <text x="22" y="118" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ metody (business)</text>
  <text x="22" y="136" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ dědičnost chování</text>
  <text x="22" y="154" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ polymorfismus</text>
  <rect x="275" y="15" width="255" height="150" rx="6" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="402" y="36" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 142)">Objektový model dat</text>
  <text x="402" y="56" text-anchor="middle" font-size="12" fill="var(--text)">Třída = strukturovaný typ</text>
  <text x="287" y="82" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ atributy (stav)</text>
  <text x="287" y="100" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ vztahy 1:1, 1:N (OID)</text>
  <text x="287" y="118" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ identita (OID)</text>
  <text x="287" y="136" font-size="12" fill="var(--text-muted)" font-family="var(--font-mono)">+ dědičnost strukturní</text>
  <text x="287" y="154" font-size="12" fill="var(--text-faint)" font-family="var(--font-mono)">− procedurální metody</text>
</svg>
:::

Třídu si tedy můžeme představit jako **„datovou ER-entitu na steroidech"** — strukturovaný typ, jehož instance mají identifikátor a mohou mezi sebou tvořit přímé vztahy.

## Relační vs. objektový model — srovnání

Stejnou doménu modelovanou *relačně* a *objektově* lze postavit vedle sebe a podívat se, kde se modely liší:

| | Relační model | Objektový model |
|---|---|---|
| **Metadata** | Definice tabulek (jména sloupců, typy, constraints). | Definice tříd (vlastnosti, typy, vztahy, dědičnost). |
| **Data** | Řádky tabulek — n-tice hodnot **jednoduchých** typů. | Objekty — instance tříd; n-tice mohou obsahovat **strukturované** typy i kolekce. |
| **Vztahy** | *Nejsou součástí* metadat ani dat — vznikají až za běhu (při `JOIN`). „Referenční integrita" je *jen omezení*, ne vlastní vztah. | **Jsou součástí modelu** — uložené v datech jako *vnořené objekty* nebo *odkazy přes OID* (i kolekce). |
| **Identita** | Přirozený nebo umělý primární klíč (řetězec/číslo). | OID — systémem spravovaný identifikátor objektu, mimo doménu. |
| **Vstupní bod** | **Dotaz** (SQL), typicky nad konkrétní tabulkou. | **Extent** — kolekce všech objektů daného typu; navigace přes vztahy. |

Klíčová pozorování:

* **Vztahy v relačním modelu se vyrábějí *až při dotazu*** — `JOIN` spojí dvě tabulky na základě hodnoty primárního/cizího klíče. Schéma vztah jen *implicitně* podporuje (FK constraint).
* **Vztahy v objektovém modelu jsou uložené přímo** — buďto jako *vnoření* (struktura B je součástí struktury A) nebo jako *odkaz přes OID*.
* Pojem **referenční integrita** v relačním modelu (FK musí ukazovat na existující PK) **není totéž** co vztah — je to jen integritní omezení, které se kontroluje, ale neukládá se jako navigovatelná vazba.

## Identita — OID

Aby šly objekty mezi sebou navzájem odkazovat, potřebujeme **datový typ, který jednoznačně identifikuje strukturovanou hodnotu** — tomu se říká **OID** (*Object Identifier*).

Důležité vlastnosti OID:

* je **unikátní v rámci celé databáze**,
* **neměnné po celou dobu života objektu** (i když se mění hodnoty atributů),
* **mimo doménu** (nemá obchodní význam — narozdíl od ISBN, IČO apod.),
* obvykle **neviditelné pro uživatele** — slouží systému pro navigaci.

V relační databázi se OID v zásadě „simuluje" surrogate klíčem (`id BIGINT GENERATED BY DEFAULT AS IDENTITY` apod.); v objektových databázích (ObjectDB, db4o, Versant) je OID *vestavěná systémová věc*.

## Extent — kolekce všech objektů daného typu

V objektovém modelu má každá konkrétní třída svůj **extent** — *systémovou kolekci všech objektů, které jsou instancemi této třídy*. Databázový systém si pro celou DB udržuje jeden „systémový objekt Databáze", který drží odkazy na všechny extenty:

::: svg "Systémový objekt Databáze drží odkazy na všechny extenty"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="15" width="170" height="175" rx="6" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)" stroke-width="1.2"/>
  <text x="95" y="34" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.40 0.14 264)">Systémový objekt</text>
  <text x="95" y="50" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.40 0.14 264)">Databáze</text>
  <line x1="20" y1="60" x2="170" y2="60" stroke="oklch(0.62 0.14 264)" stroke-width="0.5"/>
  <text x="20" y="84" font-size="12" fill="var(--text)" font-family="var(--font-mono)">Extent[Person]</text>
  <text x="20" y="106" font-size="12" fill="var(--text)" font-family="var(--font-mono)">Extent[Order]</text>
  <text x="20" y="128" font-size="12" fill="var(--text)" font-family="var(--font-mono)">Extent[Product]</text>
  <text x="20" y="148" font-size="12" fill="var(--text-faint)" font-family="var(--font-mono)">…</text>
  <text x="20" y="178" font-size="11" fill="var(--text-muted)">ostatní metadata</text>
  <rect x="290" y="15" width="240" height="46" rx="6" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="410" y="34" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.40 0.14 142)">Kolekce objektů Person</text>
  <text x="410" y="50" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">{ p1, p2, p3, … }</text>
  <rect x="290" y="75" width="240" height="46" rx="6" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.62 0.14 22)"/>
  <text x="410" y="94" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.14 22)">Kolekce objektů Order</text>
  <text x="410" y="110" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">{ o1, o2, o3, … }</text>
  <rect x="290" y="135" width="240" height="46" rx="6" fill="oklch(0.62 0.14 80 / 0.10)" stroke="oklch(0.62 0.14 80)"/>
  <text x="410" y="154" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.40 0.14 80)">Kolekce objektů Product</text>
  <text x="410" y="170" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">{ pr1, pr2, … }</text>
  <line x1="180" y1="80" x2="290" y2="38" stroke="oklch(0.62 0.14 142)" stroke-width="1.4" marker-end="url(#arrow-g)"/>
  <line x1="180" y1="102" x2="290" y2="98" stroke="oklch(0.62 0.14 22)" stroke-width="1.4" marker-end="url(#arrow-r)"/>
  <line x1="180" y1="124" x2="290" y2="158" stroke="oklch(0.62 0.14 80)" stroke-width="1.4" marker-end="url(#arrow-y)"/>
  <defs>
    <marker id="arrow-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.62 0.14 142)"/></marker>
    <marker id="arrow-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.62 0.14 22)"/></marker>
    <marker id="arrow-y" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.62 0.14 80)"/></marker>
  </defs>
</svg>
:::

Extent slouží jako **vstupní bod do databáze**:

* V relačních DB začíná typický přístup *dotazem* (`SELECT … FROM …`).
* V objektových DB začíná typická navigace *od extentu* (např. „dej mi všechny Person, pak naviguj po vztahu *objednávky* k jejich Order objektům…").

Z tohoto pohledu je extent ekvivalent **tabulky** v relačním modelu — jen je to *first-class kolekce objektů* spravovaná systémem.

## Jmenný prostor — vnoření vs. odkaz

Strukturovaný typ může mít vlastnost, jejíž hodnotou je **další struktura**. Pak je rozdíl mezi:

* **Vnořením** (`Data=Value`) — vlastnost obsahuje *prostou strukturu*, která žije *uvnitř* mateřského objektu, sdílí jeho jmenný prostor a nemá vlastní OID. Přístup: `parent.D.jméno_k`.
* **Odkazem** (`Data=Ref`) — vlastnost obsahuje *OID jiného objektu*. Cílový objekt žije *samostatně* (má svůj OID a může být součástí extentu). Přístup: `parent.B.C`.

Toto rozlišení je v PIS notaci `concept`:

```
concept TypD [Data=Value]              concept TypD [Data=Ref]
    properties …                          properties …
end concept                            end concept

concept TypB                           concept TypB
    properties                            properties
        C: integer                            C: integer
        D: TypD                               D: TypD     -- odkaz, ne vnoření
end concept                            end concept
```

Tento rozdíl je *zásadní pro pochopení vztahů*: vnoření modeluje *kompozici* (objekt B vlastní D, D s ním zaniká); odkaz modeluje *asociaci* (B ukazuje na D, ale D žije nezávisle). Detaily 1:1, 1:N a inverzních vztahů jsou v [[vztahy-objekty|samostatném subtopicu]].

## Vlastní hodnoty a rozsah hodnot

Stejně jako základní typ `integer` má rozsah hodnot (např. 32 bitů), má i každý strukturovaný typ svůj **obor všech možných hodnot** — to je jeho extent v daném okamžiku. Důležité: extent se mění *za běhu* (vznikem/zánikem objektů), ale typ samotný se nemění.

## Co si odnést

* Objektový model dat staví na **třídách jako datových typech** s identitou (OID).
* Vztahy jsou *součástí modelu*, ne jen výsledkem dotazu — vyjadřují se *vnořením* nebo *odkazem přes OID*.
* **Extent** = systémová kolekce všech objektů daného typu; v objektových DB je to základní vstupní bod (analog tabulky).
* Pojmy z OO programování (třída, dědičnost) se přebírají, ale *pouze pro modelování dat* — žádná procedurální logika.

::: link "Object Data Management Group — ODMG 3.0 (standard objektových databází, 2000)" "https://en.wikipedia.org/wiki/Object_Data_Management_Group"
:::

::: link "Wikipedia: Object database" "https://en.wikipedia.org/wiki/Object_database"
:::

::: link "Atkinson et al. — The Object-Oriented Database System Manifesto (1989) — klasický článek definující požadavky" "https://www.cl.cam.ac.uk/teaching/2003/Databases/odbms.pdf"
:::

::: quiz "Čím se zásadně liší vyjádření vztahu v relačním a objektovém modelu?"
- [x] Relační model vztah neukládá — vzniká až při dotazu přes JOIN. Objektový model vztah ukládá přímo (vnořením nebo OID odkazem).
  > Přesně. To je definující vlastnost: relace = množina n-tic, ne graf objektů. Objektový model naopak graf přímo vyjadřuje.
- [ ] Relační model neumí 1:N vztahy.
  > Umí — typicky cizím klíčem v tabulce na „mnoha" straně. Ale vztah *jako struktura* tam není.
- [ ] Objektový model nemá obdobu cizího klíče.
  > Má — OID je v zásadě stejný princip („odkaz na jiný objekt"), jen ho spravuje systém a typicky není exponován uživateli.
:::

::: quiz "Co je extent v objektové databázi?"
- [x] Systémová kolekce všech objektů daného typu, sloužící jako vstupní bod pro navigaci.
  > Ano. Pro typ `Person` existuje extent, který obsahuje všechny instance této třídy v DB.
- [ ] Velikost objektu v bajtech.
  > To je *size*, ne extent. Pojmy mají nešťastně podobný kořen v angličtině.
- [ ] Maximální počet instancí, který může typ mít.
  > Není to limit, ale aktuální množina existujících instancí.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška & doc. R. Burget, VUT FIT, přednáška „Objektový model dat" (slidy 1–10, 41–48). Doplněno o pojem OID a srovnání s odbornou literaturou.*
