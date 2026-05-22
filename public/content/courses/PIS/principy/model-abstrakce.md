---
title: IS jako model — izomorfismus a abstrakce
---

Informační systém je vždy **modelem** nějakého fyzického systému (podniku, výrobní linky, dopravního systému, knihovny, …). Modeluje na *virtuální, nehmotné* úrovni to, co se reálně děje ve světě, pro jehož řízení byl IS vytvořen. Tato perspektiva má dvě důležité praktické důsledky.

## Izomorfismus mezi IS a fyzickým systémem

Mezi modelem (informačním systémem) a vzorem (fyzickým systémem) by ideálně měl existovat **izomorfismus** — bijektivní zobrazení, které *zachovává strukturu*. Jinými slovy: každému zdroji ve fyzickém systému odpovídá právě jeden objekt v IS a tatáž korespondence platí pro funkce nad zdroji.

::: math
φ : F → I,    φ je bijekce a pro každou funkci f nad F existuje její obraz f' nad I tak, že
φ(f(x₁, …, xₙ)) = f'(φ(x₁), …, φ(xₙ))
:::

Praktický význam: pokud v podniku probíhá operace „vystav fakturu z objednávky", musí v IS existovat analogická operace, která ze záznamu objednávky vytvoří záznam faktury — a *výsledek obou postupů musí navzájem odpovídat*. Tato vlastnost umožňuje na IS spolehlivě řídit reálný systém.

::: svg "Izomorfismus mezi fyzickým systémem a informačním systémem"
<svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="180" height="170" rx="10" fill="oklch(0.65 0.18 22 / 0.06)" stroke="oklch(0.65 0.18 22 / 0.4)" stroke-width="1"/>
  <rect x="260" y="20" width="180" height="170" rx="10" fill="oklch(0.55 0.18 264 / 0.06)" stroke="oklch(0.55 0.18 264 / 0.4)" stroke-width="1"/>
  <text x="110" y="40" text-anchor="middle" font-size="11" font-weight="600" font-style="italic" fill="var(--text)">fyzický systém</text>
  <text x="350" y="40" text-anchor="middle" font-size="11" font-weight="600" font-style="italic" fill="var(--text)">informační systém</text>
  <circle cx="60" cy="80" r="10" fill="oklch(0.65 0.18 22 / 0.7)"/>
  <circle cx="105" cy="75" r="10" fill="oklch(0.65 0.18 22 / 0.7)"/>
  <circle cx="155" cy="105" r="10" fill="oklch(0.65 0.18 22 / 0.7)"/>
  <rect x="80" y="135" width="60" height="22" rx="3" fill="oklch(0.65 0.18 22 / 0.8)"/>
  <text x="110" y="151" text-anchor="middle" font-size="10" fill="white" font-style="italic">f</text>
  <circle cx="110" cy="180" r="9" fill="oklch(0.65 0.18 22 / 0.7)"/>
  <line x1="65" y1="88" x2="98" y2="135" stroke="oklch(0.65 0.18 22)" stroke-width="0.8"/>
  <line x1="105" y1="85" x2="110" y2="135" stroke="oklch(0.65 0.18 22)" stroke-width="0.8"/>
  <line x1="148" y1="112" x2="125" y2="135" stroke="oklch(0.65 0.18 22)" stroke-width="0.8"/>
  <line x1="110" y1="157" x2="110" y2="172" stroke="oklch(0.65 0.18 22)" stroke-width="0.8"/>
  <circle cx="300" cy="80" r="10" fill="oklch(0.55 0.18 264 / 0.7)"/>
  <circle cx="345" cy="75" r="10" fill="oklch(0.55 0.18 264 / 0.7)"/>
  <circle cx="395" cy="105" r="10" fill="oklch(0.55 0.18 264 / 0.7)"/>
  <rect x="320" y="135" width="60" height="22" rx="3" fill="oklch(0.55 0.18 264 / 0.8)"/>
  <text x="350" y="151" text-anchor="middle" font-size="10" fill="white" font-style="italic">f'</text>
  <circle cx="350" cy="180" r="9" fill="oklch(0.55 0.18 264 / 0.7)"/>
  <line x1="305" y1="88" x2="338" y2="135" stroke="oklch(0.55 0.18 264)" stroke-width="0.8"/>
  <line x1="345" y1="85" x2="350" y2="135" stroke="oklch(0.55 0.18 264)" stroke-width="0.8"/>
  <line x1="388" y1="112" x2="365" y2="135" stroke="oklch(0.55 0.18 264)" stroke-width="0.8"/>
  <line x1="350" y1="157" x2="350" y2="172" stroke="oklch(0.55 0.18 264)" stroke-width="0.8"/>
  <line x1="70" y1="80" x2="290" y2="80" stroke="var(--text-muted)" stroke-dasharray="3 3" stroke-width="0.7"/>
  <line x1="115" y1="75" x2="335" y2="75" stroke="var(--text-muted)" stroke-dasharray="3 3" stroke-width="0.7"/>
  <line x1="165" y1="105" x2="385" y2="105" stroke="var(--text-muted)" stroke-dasharray="3 3" stroke-width="0.7"/>
  <line x1="140" y1="146" x2="320" y2="146" stroke="var(--text-muted)" stroke-dasharray="3 3" stroke-width="0.7"/>
  <line x1="119" y1="180" x2="341" y2="180" stroke="var(--text-muted)" stroke-dasharray="3 3" stroke-width="0.7"/>
  <text x="230" y="73" text-anchor="middle" font-size="11" fill="var(--accent)" font-style="italic" font-weight="600">φ</text>
  <text x="230" y="142" text-anchor="middle" font-size="11" fill="var(--accent)" font-style="italic" font-weight="600">φ</text>
</svg>
:::

## Nezbytnost abstrakce

Skutečný fyzický systém je nekonečně bohatý — má barvy, hmotnost, teplotu, historii, sociální vazby, fyzikální zákony. Modelovat *všechny* jeho zdroje a procesy je nereálné a obvykle zbytečné. Při návrhu se proto vybírají pouze ty zdroje a procesy, které jsou **relevantní pro danou úroveň řízení**. Tomuto výběru se říká **abstrakce**.

Důsledek: informační systém je vždy modelem *určité abstrakce* původního systému, nikoliv jeho úplnou kopií. Při návrhu OLTP pro účetnictví modelujeme peníze jako čísla v účetních knihách (jejich *virtuální obraz*), ale ignorujeme barvu bankovek, jejich fyzickou váhu nebo místo, kde právě leží.

::: link "Wikipedia — Isomorphism" "https://en.wikipedia.org/wiki/Isomorphism"
:::

::: link "Wikipedia — Mario Bunge: ontologie systémů" "https://en.wikipedia.org/wiki/Mario_Bunge"
:::

## Návrhové otázky

Při návrhu informačního systému je tedy potřeba se ptát:

* **S jakými daty pracujeme?** — Jak je reprezentován *stav* IS? Jaká je doména, jaký *model* nejlépe vyhovuje (relační, objektový, dokumentový, …), jak zajistit *persistenci* a *konzistenci*.
* **Jaké jsou vstupy?** — Odkud a jak data přicházejí, jak se pořizují (uživatel, čidlo, jiný systém), kdo a jak je zadává.
* **Jaké jsou procesy?** — Jak se data transformují, jaké transakce probíhají, jaké jsou business funkce.
* **Jak mají vypadat výstupy?** — Jaké informace systém poskytne uživateli, jakou formou, jaké reporty, kdo komu co prezentuje.

Tyto čtyři okruhy tvoří kostru analýzy, ze které vyrůstá celý návrh — od datového modelu přes business logiku po uživatelské rozhraní.

::: quiz "Co znamená, že mezi IS a fyzickým systémem je izomorfismus?"
- [x] Každému zdroji a procesu reálného systému odpovídá v IS jednoznačný protějšek a operace dávají odpovídající výsledky.
  > Ano. Izomorfismus je bijektivní zobrazení zachovávající strukturu — to právě umožňuje IS spolehlivě řídit fyzický systém.
- [ ] IS modeluje úplně všechno, co fyzický systém dělá.
  > Ne. Realita je nekonečně bohatá; IS vždy modeluje pouze relevantní *abstrakci*.
- [ ] Stav v IS je vždy přesnou kopií fyzických objektů včetně jejich materiálních vlastností.
  > Ne. V IS pracujeme s virtuálním obrazem — barva, váha či teplota jsou abstrahovány pryč, pokud nejsou pro řízení podstatné.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška a doc. R. Burget, VUT FIT, část „Návrh informačního systému".*
