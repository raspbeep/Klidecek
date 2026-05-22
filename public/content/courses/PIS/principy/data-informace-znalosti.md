---
title: Data, informace, znalosti
---

V informatice je užitečné rozlišit tři vzájemně související pojmy: **data**, **informace** a **znalosti**. Hranice mezi nimi není ostrá, ale rozdíl ovlivňuje, jak systém s obsahem pracuje a co je vůbec jeho úkolem.

**Data** jsou hodnoty, které lze přenášet, uchovávat a zpracovávat. V IT jde nejčastěji o hodnoty různých datových typů. Sama o sobě **nemají sémantiku** — jsou to věty nějakého formálního jazyka. Hodnoty dat obvykle popisují *stav* nějakého systému (např. zůstatek účtu, počet kusů na skladě, čas příjezdu autobusu).

**Informace** vzniká *interpretací* dat — informací rozumíme data, kterým někdo (uživatel nebo systém s pevnou konvencí) přiřadil význam. Informace tedy mají **sémantiku**. Informační systém uchovává a transformuje *data*; teprve uživatel nebo navazující systém z výsledku odečte *informaci*. Aby všichni rozuměli stejně, je nutné zajistit jednotnou interpretaci — vzděláním, školením nebo zavedením konvence.

::: svg "Vztah mezi daty, informacemi a znalostmi (DIKW pyramida)"
<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dikw" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="oklch(0.55 0.18 264)" stop-opacity="0.85"/>
      <stop offset="1" stop-color="oklch(0.55 0.18 264)" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <polygon points="160,20 280,170 40,170" fill="url(#dikw)" stroke="var(--accent)" stroke-width="1.5"/>
  <line x1="80" y1="120" x2="240" y2="120" stroke="var(--bg-card)" stroke-width="1"/>
  <line x1="115" y1="70" x2="205" y2="70" stroke="var(--bg-card)" stroke-width="1"/>
  <text x="160" y="48" text-anchor="middle" font-size="11" font-weight="600" fill="white">Moudrost</text>
  <text x="160" y="95" text-anchor="middle" font-size="12" font-weight="600" fill="white">Znalosti</text>
  <text x="160" y="145" text-anchor="middle" font-size="13" font-weight="600" fill="white">Informace</text>
  <text x="160" y="187" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">Data</text>
  <text x="295" y="48" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)" text-anchor="end" transform="rotate(0)">proč?</text>
  <text x="295" y="95" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)" text-anchor="end">jak?</text>
  <text x="295" y="145" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)" text-anchor="end">co?</text>
  <text x="295" y="187" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)" text-anchor="end">syrové hodnoty</text>
</svg>
:::

**Příklad rozdílné interpretace.** Stejný řetězec `10-12-2005` znamená v Evropě 10. prosince 2005, v USA 12. října 2005. *Data* jsou totožná, *informace* se liší. Podobně dvojice `Jan Novák` může být buď jméno a příjmení, nebo jen křestní jméno složené ze dvou částí. Bez konvence o interpretaci ani jeden řetězec sémantiku nemá.

**Znalost** je informace zařazená do širších souvislostí — bývá popisována jako *sekundární odvozená informace* získaná agregací a analýzou většího množství primárních dat. Některé systémy s daty pracují *transakčně* (OLTP — On-Line Transaction Processing) a poskytují uživatelům informace o aktuálním stavu; jiné generují znalosti pro podporu rozhodování a plánování (OLAP, business intelligence). Specializovanou oblastí je *získávání znalostí z dat* (knowledge discovery, data mining) — té se na VUT FIT věnuje samostatný předmět ZZN.

::: link "DIKW pyramid — Wikipedia" "https://en.wikipedia.org/wiki/DIKW_pyramid"
:::

::: link "Ackoff, R. L. (1989): From Data to Wisdom" "https://faculty.ung.edu/kmelton/documents/datawisdom.pdf"
:::

::: quiz "Která z následujících tvrzení jsou pravdivá?"
- [x] Data sama o sobě nemají sémantiku; tu jim dává až interpretace.
  > Přesně tak — data jsou věty formálního jazyka, informaci z nich vytváří interpretace podle nějaké konvence.
- [ ] Informační systém transformuje data přímo na znalosti.
  > Systém ukládá a transformuje data. Interpretaci na informaci a další povýšení na znalost dělá uživatel nebo specializovaná analytická vrstva (OLAP, BI).
- [ ] OLTP systém pracuje primárně se znalostmi.
  > OLTP pracuje transakčně s informacemi o aktuálním stavu. Znalosti řeší OLAP a data mining.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška a doc. R. Burget, VUT FIT, část „Data — informace — znalosti".*
