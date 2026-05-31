---
title: Vodopád, iterativní a inkrementální model
---

Životní cyklus softwaru popisuje, v jakém pořadí a jak často se odehrávají činnosti analýzy, návrhu, implementace a testování. Nejstarší a nejnázornější je **vodopádový model** (Waterfall): fáze jdou striktně za sebou jako voda padající z kaskády a do předchozí fáze se zpětně nevracíme. Moderní modely vznikly právě jako reakce na to, že tato přísná sekvenčnost špatně zvládá změny a nejistotu.

## Vodopád a jeho nedostatky

Vodopád předpokládá, že na začátku projektu **dokážeme kompletně a správně specifikovat požadavky** a že se během vývoje nebudou měnit. Každá fáze (specifikace → návrh → implementace → testování → nasazení a údržba) se dokončí a teprve pak začíná další; výsledkem je rozsáhlá dokumentace, ale spustitelný software vzniká až úplně na konci.

::: svg "Vodopádový model — fáze se nepřekrývají a vrací se obtížně"
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="520" height="200" fill="var(--bg-inset)" rx="6"/>
  <g font-size="12" fill="var(--text)">
    <rect x="20"  y="24"  width="120" height="30" rx="4" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
    <text x="80"  y="43"  text-anchor="middle">Specifikace</text>
    <rect x="120" y="58"  width="120" height="30" rx="4" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
    <text x="180" y="77"  text-anchor="middle">Návrh</text>
    <rect x="220" y="92"  width="120" height="30" rx="4" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
    <text x="280" y="111" text-anchor="middle">Implementace</text>
    <rect x="320" y="126" width="120" height="30" rx="4" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
    <text x="380" y="145" text-anchor="middle">Testování</text>
    <rect x="380" y="160" width="120" height="30" rx="4" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
    <text x="440" y="179" text-anchor="middle">Nasazení</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1.4" fill="none" marker-end="url(#wfa)">
    <path d="M140,39 L120,58"/>
    <path d="M240,73 L220,92"/>
    <path d="M340,107 L320,126"/>
    <path d="M440,141 L440,160"/>
  </g>
  <path d="M340,156 C300,150 300,124 340,120" stroke="oklch(0.6 0.18 22)" stroke-width="1.2" fill="none" stroke-dasharray="3 3" marker-end="url(#wfb)"/>
  <text x="295" y="138" text-anchor="end" font-size="10" fill="oklch(0.55 0.18 22)" font-style="italic">drahý návrat</text>
  <defs>
    <marker id="wfa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/></marker>
    <marker id="wfb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.6 0.18 22)"/></marker>
  </defs>
</svg>
:::

Z této tuhosti plynou typické slabiny:

* **Pozdní zpětná vazba.** Zákazník vidí běžící produkt až na konci; chyba v zadání odhalená při testování znamená drahý návrat o několik fází zpět.
* **Špatná reakce na změnu.** Požadavky se v reálném světě mění (trh, legislativa, pochopení problému). Vodopád to ekonomicky trestá — čím později změna přijde, tím dráž stojí.
* **Riziko se hromadí na konec.** Integrace a ověření architektury se odkládají, takže nejnebezpečnější neznámé se řeší nejpozději.
* **„Big bang" dodávka.** Hodnota se zákazníkovi nepředává průběžně, ale jednorázově až při nasazení.

Vodopád proto dává smysl jen tam, kde jsou požadavky skutečně stabilní a dobře pochopené (např. dobře zmapovaná regulovaná doména). Jinak se používají modely, které proces rozdělí na opakované krátké cykly.

## Iterativní model — předělávat a vylepšovat

Iterativní přístup dělí vývoj na sérii **iterací**, kde každá iterace je vlastně malý vodopád: zahrnuje analýzu, návrh, implementaci i testování, ale ve zmenšeném rozsahu. Klíčové slovo je *iterace = opakování*: vytvoříme hrubou verzi celku a tu v dalších průchodech **postupně zpřesňujeme a vylepšujeme**.

Po každé iteraci existuje funkční (byť nedokonalá) verze systému a získáváme zpětnou vazbu, kterou promítneme do další iterace. Riziko klesá rovnoměrně, protože nejistoty se ověřují brzy a opakovaně.

> Příměr: malíř nejprve načrtne celou kompozici (1. iterace), pak doplní základní barvy (2. iterace) a nakonec přidá detaily a stínování (3. iterace). Pokaždé pracuje na *celém* obraze, jen ve vyšší kvalitě.

## Inkrementální model — přidávat funkce

Inkrementální přístup dodává systém po **přírůstcích (inkrementech)**: každý přírůstek přidá novou, ucelenou část funkčnosti k tomu, co už hotovo je. Klíčové slovo je *inkrement = přidání k*. Místo zpřesňování celku se rozšiřuje rozsah — nejdřív jádro, pak další moduly.

> Příměr: e-shop nejprve umí jen katalog produktů (1. inkrement), pak se přidá nákupní košík (2. inkrement) a nakonec platební brána (3. inkrement). Každý přírůstek je samostatná funkce.

## Jak se v praxi prolínají

Iterativní a inkrementální nejsou protiklady — moderní procesy je **kombinují**. Typicky se dodává po přírůstcích (inkrementálně rozšiřujeme rozsah) a uvnitř i napříč přírůstky se hotová funkčnost iterativně vylepšuje podle zpětné vazby. Tomuto spojení se říká **iterativní a inkrementální vývoj** a je základem Unified Process i agilních metod.

::: viz ais-iter-vs-inkrement "Posouvej iterace a přepínej režim. Iterativní zpřesňuje celý obraz; inkrementální přidává nové funkce. Kombinace dělá obojí najednou."
:::

| | Iterativní | Inkrementální |
|---|---|---|
| Co se v každém cyklu mění | kvalita / přesnost téhož celku | rozsah — přibude nová funkce |
| Heslo | „předělávat a vylepšovat" | „přidávat k" |
| Po jednom cyklu máš | celý systém, ale hrubší | část funkcí, ale hotovou |
| Hlavní přínos | snižuje riziko nepochopení | průběžně dodává hodnotu |

::: quiz "Tým postaví základní verzi rezervačního systému a v dalších cyklech zpřesňuje validace, UX a výkon, ale rozsah funkcí se nemění. Jaký přístup popisuje hlavně tento postup?"
- [x] Iterativní — opakovaně zpřesňuje a vylepšuje tentýž celek.
  > Ano. Mění se kvalita/přesnost, nikoli rozsah funkcí — to je definice iterace.
- [ ] Inkrementální — přidává nové funkce.
  > Inkrement přidává *novou funkčnost*. Zde se rozsah nemění, jen se zlepšuje to, co už je.
- [ ] Vodopádový — fáze jdou striktně za sebou bez návratu.
  > Vodopád nedělí vývoj na opakované cykly se zpětnou vazbou; zde naopak cykly jsou.
:::

::: link "Royce (1970) — Managing the Development of Large Software Systems (původní „vodopád")" "https://www.praxisframework.org/files/royce1970.pdf"
:::

::: link "Larman & Basili — Iterative and Incremental Development: A Brief History (IEEE Computer, 2003)" "https://www.craiglarman.com/wiki/downloads/misc/history-of-iterative-larman-and-basili-ieee-computer.pdf"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: W. W. Royce (1970), Larman & Basili (IEEE Computer 2003).*
