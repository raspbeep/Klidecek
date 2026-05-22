---
title: Strukturované datové typy — struktury, kolekce, objekty
---

Abychom mohli ve formálním modelu vyjádřit *stav* informačního systému, potřebujeme mechanismy pro popis složitých dat. Z hlediska metadat (popisu typů) se data dělí na **nestrukturované základní typy** a **strukturované typy**.

## Základní (nestrukturované) typy

Atomické datové typy, ze kterých skládáme vše ostatní:

* celočíselné (`integer`)
* reálná čísla (`real`)
* znaky a řetězce (`char`, `string`)
* datum a čas (`date`, `timestamp`)
* výčtové typy (`enum`)

Tyto typy nejdou dále členit — pracujeme s nimi jako s jednou hodnotou.

## Strukturované typy: struktura a kolekce

Strukturovaný typ skládá z jednodušších typů typ složitější. Slouží k tomu **dva základní mechanismy**:

::: svg "Taxonomie strukturovaných datových typů"
<svg viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="120" y="15" width="140" height="40" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/>
  <text x="190" y="40" text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent)">Strukturovaný typ</text>
  <line x1="160" y1="55" x2="100" y2="92" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#a)"/>
  <line x1="220" y1="55" x2="280" y2="92" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#a)"/>
  <rect x="40" y="95" width="120" height="36" rx="6" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="100" y="118" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.62 0.14 264)">Struktura (record)</text>
  <rect x="220" y="95" width="120" height="36" rx="6" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.62 0.14 142)"/>
  <text x="280" y="118" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.62 0.14 142)">Kolekce</text>
  <line x1="70" y1="131" x2="40" y2="170" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#a)"/>
  <line x1="130" y1="131" x2="160" y2="170" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#a)"/>
  <rect x="5" y="170" width="80" height="30" rx="5" fill="oklch(0.62 0.14 22 / 0.12)" stroke="oklch(0.62 0.14 22)"/>
  <text x="45" y="190" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.62 0.14 22)">Objekt (OID)</text>
  <rect x="115" y="170" width="100" height="30" rx="5" fill="oklch(0.62 0.14 22 / 0.12)" stroke="oklch(0.62 0.14 22)"/>
  <text x="165" y="190" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.62 0.14 22)">Prostá struktura</text>
  <text x="280" y="175" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-style="italic">stejné typy</text>
  <text x="280" y="190" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-style="italic">neomezený počet</text>
  <defs>
    <marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

### Struktura

**Struktura** (record, tuple, n-tice) je tvořena *pevným počtem* pojmenovaných hodnot *obecně různých* typů. Formálně jde o prvek kartézského součinu množin dílčích datových typů. K hodnotám se přistupuje přes *jméno vlastnosti*.

```text
structure FyzOsoba
    properties
        UplneJmeno: string
        Jmeno:      string
        Prijmeni:   string
        DatumNaroz: date
    end structure
```

Schéma struktury (datový typ) je *metadata*; konkrétní hodnoty struktury (pojmenovaná n-tice typu `("Prof. Ing. Jan Novák, CSc.", "Jan", "Novák", 1954-05-24)`) jsou data této struktury.

### Kolekce

**Kolekce** je tvořena *předem neomezeným počtem* hodnot **stejného** datového typu. Synonyma: řetězec, posloupnost, seznam, soubor. Matematicky se může jednat o *množinu*, *multimnožinu* (každý prvek může být přítomen vícekrát) nebo *uspořádanou multimnožinu* (klasický seznam).

Základní operace nad kolekcí:

* `add(item)` — vložení prvku
* `item(i)` — získání prvku (typicky přes kurzor nebo index)
* `count` — počet prvků
* `remove(item)` — odebrání prvku
* `forall(op)` — provedení operace nad všemi prvky

**Kurzor (iterator)** je ukazovátko do kolekce, kterým lze posouvat. *Stabilní* kurzor ignoruje změny v kolekci, *nestabilní* je reflektuje. Nad jednou kolekcí může existovat více *uspořádání* (řazení podle různých klíčů).

**Agregáty** jsou statistické vlastnosti kolekce (typicky pro číselné hodnoty): počet prvků, minimum, maximum, součet, průměr, medián. Tvoří základ analytického zpracování (viz OLAP).

### Vnořování

Strukturu a kolekci lze libovolně vzájemně vnořovat: kolekce struktur, struktura obsahující kolekci, kolekce kolekcí struktur atd. Tím vzniká model libovolně složitých dat. Hodnota takového typu má strukturu *stromu*; v případě, že strom obsahuje odkazy mezi uzly, vzniká obecnější *graf* hodnoty.

## Objekt vs. prostá struktura

Strukturu, ve které jedna z vlastností je **jednoznačný identifikátor** (typicky systémem generovaný **OID** — object identifier), nazýváme **objekt**. Díky OID je objekt *identifikovatelný* a tudíž *odkazovatelný* — může vystupovat jako *člen* ve vztazích.

Strukturu bez identifikátoru nazýváme **prostá struktura**. Prostá struktura není odkazovatelná zvenčí; existuje pouze jako součást objektu, který ji vlastní.

```text
object Clovek
    properties
        OID:        oid                    -- systémové
        Jmeno:      string
        Adresa:     structure              -- prostá vnořená struktura
            properties
                Ulice:  string
                Mesto:  string
            end structure
        Auta:       collection of OID      -- odkazy na jiné objekty
    end object
```

Toto rozlišení je klíčové pro objektový datový model i pro ORM (objektově-relační mapování) — viz následující subtopic.

::: link "Wikipedia — Algebraic data type" "https://en.wikipedia.org/wiki/Algebraic_data_type"
:::

::: link "Cardelli & Wegner — On Understanding Types, Data Abstraction" "https://dl.acm.org/doi/10.1145/6041.6042"
:::

::: link "Wikipedia — Iterator pattern" "https://en.wikipedia.org/wiki/Iterator_pattern"
:::

::: quiz "Která tvrzení o struktuře a kolekci platí?"
- [x] Struktura má pevný počet pojmenovaných hodnot obecně různých typů; kolekce neomezený počet hodnot téhož typu.
  > Ano — to je klíčové rozlišení. Struktura odpovídá n-tici (kartézský součin), kolekce odpovídá množině/seznamu.
- [ ] Objekt je totéž co prostá struktura.
  > Ne. Objekt má OID a je odkazovatelný; prostá struktura OID nemá a žije pouze uvnitř svého vlastníka.
- [ ] Kolekce může obsahovat prvky různých datových typů.
  > Obecně ne — kolekce má jeden typ prvku. (Polymorfismus přes dědičnost je výjimka řešená objektovým modelem.)
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška a doc. R. Burget, VUT FIT, část „Struktura a kolekce".*
