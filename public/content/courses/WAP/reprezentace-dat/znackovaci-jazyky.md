---
title: HTML, XML, JSON a DOM
---

Data putující po webu potřebují *formát* — dohodnutou strukturu, kterou odesílatel zakóduje a příjemce dekóduje. Tři formáty dominují: **HTML** pro prezentaci stránek, **XML** pro strukturovaný popis dat a **JSON** pro odlehčenou výměnu dat mezi službami. Po načtení se značkovací dokument zpřístupní programu jako stromová struktura — **DOM**.

## Společný předek: SGML

HTML i XML historicky vycházejí z jediného rozsáhlého standardu pro publikování dokumentů — **SGML** (*Standard Generalized Markup Language*, ISO 8879). SGML je obecný meta‑jazyk pro definici značkovacích jazyků; byl ale příliš komplexní. Z něj se odštěpily dvě cesty s opačným zaměřením:

::: svg "SGML jako kořen; HTML a XML jako dvě větve s odlišným cílem"
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="200" y="12" width="120" height="34" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="260" y="29" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">SGML</text>
  <text x="260" y="41" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">ISO 8879 — meta-jazyk</text>
  <line x1="230" y1="46" x2="120" y2="78" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="290" y1="46" x2="400" y2="78" stroke="var(--line-strong)" stroke-width="1"/>
  <rect x="30" y="80" width="180" height="86" rx="6" fill="oklch(0.55 0.14 142 / 0.10)" stroke="oklch(0.50 0.16 142)"/>
  <text x="120" y="100" text-anchor="middle" font-size="12.5" font-weight="600" fill="oklch(0.45 0.16 142)">HTML</text>
  <text x="120" y="119" text-anchor="middle" font-size="10.5" fill="var(--text)">pevná sada tagů</text>
  <text x="120" y="135" text-anchor="middle" font-size="10.5" fill="var(--text)">cíl: prezentace</text>
  <text x="120" y="151" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">tolerantní k chybám</text>
  <rect x="310" y="80" width="180" height="86" rx="6" fill="oklch(0.55 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
  <text x="400" y="100" text-anchor="middle" font-size="12.5" font-weight="600" fill="oklch(0.50 0.16 264)">XML</text>
  <text x="400" y="119" text-anchor="middle" font-size="10.5" fill="var(--text)">vlastní tagy</text>
  <text x="400" y="135" text-anchor="middle" font-size="10.5" fill="var(--text)">cíl: popis dat</text>
  <text x="400" y="151" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">striktní pravidla</text>
</svg>
:::

## HTML — prezentace dokumentu

**HTML** (*HyperText Markup Language*) je konkrétní aplikace značek určená přímo k **vizuální prezentaci a strukturování dokumentů na webu**. Má **pevnou, předem definovanou sadu tagů** (`<p>`, `<div>`, `<a>`, `<table>`…) — autor si vlastní značky nevymýšlí.

Historicky byl HTML **velmi tolerantní k syntaktickým chybám**: chybějící uzavírací tag nebo neuzavřená uvozovka prohlížeč „opravil" sám. To znělo přívětivě, ale vedlo k **nekonzistencím mezi prohlížeči** — každý odpouštěl jinak. (Dnešní HTML5 sjednocuje algoritmus parsování i pro chybný vstup, takže výsledný strom je stejný napříč prohlížeči.)

## XML — striktní popis dat

**XML** (*Extensible Markup Language*) je striktní a zjednodušená podmnožina SGML, navržená tak, aby byla čitelná pro stroje i pro lidi. Na rozdíl od HTML neslouží k prezentaci, ale primárně k **uložení a popisu samotných dat**.

* **Rozšiřitelnost (vlastní tagy):** XML nemá žádné předdefinované značky. Autor si definuje vlastní názvy přesně podle sémantiky svých dat (`<produkt>`, `<cena>`). Z XML jsou odvozeny specializované jazyky — **SVG** (vektorová grafika), **MathML** (matematické zápisy) nebo kanály **RSS/Atom**.
* **Správná formovanost (well‑formed):** aby byl dokument pro parser vůbec čitelný, musí dodržet striktní pravidla — viz [[validace-dat]], kde rozebíráme rozdíl mezi *well‑formed* a *validním* dokumentem.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<objednavka id="8235">
  <zakaznik>Jan Novák</zakaznik>
  <polozka pocet="2">
    <nazev>Klávesnice</nazev>
    <cena mena="CZK">990</cena>
  </polozka>
</objednavka>
```

## JSON — odlehčená výměna dat

**JSON** (*JavaScript Object Notation*) je dnes nejrozšířenější odlehčený, **jazykově nezávislý** formát a de facto standard pro výměnu dat v REST API a webových aplikacích.

JSON má **nativní podporu datových typů**: řetězce, čísla, logické hodnoty (`true`/`false`) a `null`. Data skládá do dvou struktur — **objektů** (neuspořádané páry klíč–hodnota ve složených závorkách `{}`) a **polí** (uspořádané seznamy v hranatých závorkách `[]`), které lze libovolně vnořovat.

```json
{
  "id": 8235,
  "zakaznik": "Jan Novák",
  "polozky": [
    { "nazev": "Klávesnice", "pocet": 2, "cena": 990, "mena": "CZK" }
  ]
}
```

Oproti XML je JSON **méně upovídaný** (*verbose*). Chybějí uzavírací tagy, takže přenos je úspornější — v praxi bývá výsledek znatelně menší, což šetří přenosové pásmo. Také **parsování je rychlejší a jednodušší**: zatímco XML vyžaduje plnohodnotný engine (řešící jmenné prostory a entity), JSON zpracují přímo nativní funkce jazyka (`JSON.parse` v JavaScriptu, `json` v Pythonu). XML naopak dál dominuje tam, kde je potřeba bohatá správa dokumentů, metadata v atributech či kde panují přísné podnikové standardy (např. webové služby SOAP).

| Hledisko | XML | JSON |
|---|---|---|
| Datové typy | vše je text (typy až přes schéma) | nativní (string, number, bool, null) |
| Atributy | ano (`<x a="1">`) | ne (jen klíče a hodnoty) |
| Komentáře | ano (`<!-- … -->`) | ne |
| Jmenné prostory | ano | ne |
| Upovídanost / velikost | vyšší | nižší |
| Typické nasazení | dokumenty, SOAP, konfigurace | REST API, konfigurace, výměna dat |

## DOM — dokument jako strom objektů

Ať přijmeme HTML, nebo XML, program s daty musí interagovat. Zde nastupuje **DOM** (*Document Object Model*) — objektový, na jazyku i platformě nezávislý model, který reprezentuje strukturu dokumentu v **paměti jako hierarchický strom** uzlů.

Každý prvek dokumentu je **uzel** (*node*). Hlavní typy uzlů (s číselnou hodnotou `nodeType`):

* **`Document`** (9) — kořen celého stromu, samotný dokument;
* **`Element`** (1) — jednotlivé HTML/XML tagy (`<polozka>`);
* **`Attr`** (2) — atributy elementů (`id="8235"`);
* **`Text`** (3) — textový obsah uvnitř elementů.

::: viz wap-dom-tree "Klikni na uzel ve stromu vpravo a sleduj, kterému kusu zdrojového XML odpovídá a jakého je typu (Element / Attr / Text)."
:::

DOM dále specifikuje **API** — sadu rozhraní a metod, jimiž programovací jazyky (typicky JavaScript) za běhu strom **procházejí a mění**: `getElementById`, `querySelector`, `childNodes`, `appendChild`, `removeChild`, `setAttribute`. Manipulace s DOM je základ dynamického chování stránky; ke stejnému stromu vede HTML i odpovídající XML, jen pravidla parsování jsou jiná.

::: quiz "Proč se pro REST API obvykle volí JSON před XML?"
- [x] Má nativní datové typy a parsuje se rychleji i jednodušeji, navíc je přenos úspornější.
  > Přesně. JSON zná čísla, booleany i null přímo, zpracují ho nativní funkce jazyka a bez uzavíracích tagů je menší.
- [ ] JSON jako jediný umí popsat zanořenou strukturu.
  > Zanoření zvládá i XML; výhoda JSONu je v nativních typech, jednoduchosti a velikosti, ne ve schopnosti vnořovat.
- [ ] XML nelze přenášet přes HTTP.
  > XML se přes HTTP přenáší běžně (např. SOAP). Volba JSONu je o ergonomii a výkonu, ne o možnosti přenosu.
:::

::: link "MDN — Introduction to the DOM" "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"
:::

::: link "W3C — Extensible Markup Language (XML) 1.0" "https://www.w3.org/TR/xml/"
:::

::: link "RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format" "https://www.rfc-editor.org/rfc/rfc8259"
:::

*Zdroj: SZZ NADE — předmět Internetové aplikace (WAP), VUT FIT. Externí reference: MDN Web Docs, W3C XML 1.0, RFC 8259, ISO 8879 (SGML).*
