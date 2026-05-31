---
title: Model FURPS+
---

Ne všechny požadavky jsou stejného druhu. Aby je bylo možné systematicky pokrýt a žádný důležitý aspekt nezůstal opomenut, používá Unified Process klasifikaci **FURPS+**. Jde o mnemotechnickou pomůcku pocházející ze společnosti Hewlett-Packard (Grady, 1992), kterou lze chápat jako kontrolní seznam (checklist) kategorií, jež je při sběru požadavků vhodné projít. Standard ISO 9126 (resp. jeho nástupce ISO/IEC 25010) definuje velmi podobné členění.

## Pět hlavních kategorií

Akronym FURPS označuje pět kategorií kvality softwaru:

| Písmeno | Kategorie | Co zahrnuje |
|---------|-----------|-------------|
| **F** | Functionality (funkčnost) | Vlastnosti, schopnosti a chování systému; bezpečnost; zda software naplňuje procesy a požadavky byznysu. |
| **U** | Usability (použitelnost) | Lidské faktory, snadnost použití, celkový dojem, uživatelské rozhraní, nápověda a dokumentace. |
| **R** | Reliability (spolehlivost) | Četnost a závažnost selhání, obnovitelnost (recoverability), předvídatelnost, přesnost, střední doba mezi poruchami (MTBF). |
| **P** | Performance (výkon) | Doba odezvy, propustnost, přesnost, dostupnost, vytížení zdrojů (procesor, paměť, síť). |
| **S** | Supportability (udržovatelnost) | Adaptabilita, udržovatelnost, konfigurovatelnost, testovatelnost, internacionalizace a lokalizace. |

Spolehlivost je často kvantifikovaná právě metrikou **MTBF** (*Mean Time Between Failures*) — střední doby mezi dvěma poruchami opravitelného systému. Vyšší MTBF znamená spolehlivější systém; jde o měřitelné kritérium, které lze v požadavku přímo uvést (např. „MTBF alespoň 5000 hodin").

## Znak „+": doplňková omezení

Znak `+` rozšiřuje FURPS o další pomocné a podružné faktory, typicky ve formě *omezení* (constraints). Larman je uvádí v tomto členění:

* **Implementation (implementační omezení)** — omezení zdrojů, povinné jazyky a nástroje, požadovaný hardware.
* **Interface (rozhraní)** — omezení daná komunikací s externími systémy a výměnou dat.
* **Operations (provoz)** — správa systému v jeho provozním prostředí (administrace, monitoring).
* **Packaging (balení)** — způsob distribuce a fyzického dodání.
* **Legal (právní)** — licencování a právní omezení, případně specifická pro různé regiony.

## Funkční vs. nefunkční požadavky

Klíčové rozlišení, na které se zkoušející ptají, vychází přímo z tohoto modelu. Kategorie **F** popisuje *funkční požadavky* — tedy chování systému, co má dělat. Kategorie **U, R, P, S** a znak **+** dohromady popisují *nefunkční požadavky* (vše ostatní).

Nefunkční požadavky se souhrnně nazývají také **atributy kvality** (*quality attributes*), požadavky na kvalitu nebo „-ility" vlastnosti systému (usabil*ity*, reliabil*ity* atd.).

::: svg "FURPS+: funkční jádro (F) vs. nefunkční atributy kvality (URPS) a doplňková omezení (+)"
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="520" height="200" fill="var(--bg-inset)" rx="6"/>
  <!-- F functional box -->
  <rect x="14" y="40" width="120" height="120" rx="8" fill="oklch(0.62 0.14 264 / 0.14)" stroke="oklch(0.55 0.14 264)"/>
  <text x="74" y="30" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">funkční</text>
  <text x="74" y="92" text-anchor="middle" font-size="30" font-weight="700" fill="oklch(0.55 0.14 264)">F</text>
  <text x="74" y="122" text-anchor="middle" font-size="11" fill="var(--text-muted)">funkčnost</text>
  <text x="74" y="138" text-anchor="middle" font-size="10" fill="var(--text-faint)">co systém dělá</text>
  <!-- URPS non-functional group -->
  <rect x="158" y="40" width="200" height="120" rx="8" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.52 0.13 142)"/>
  <text x="258" y="30" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">nefunkční — atributy kvality</text>
  <g font-size="12" font-weight="600" font-family="var(--font-mono)" fill="oklch(0.45 0.13 142)" text-anchor="middle">
    <text x="184" y="78">U</text><text x="232" y="78">R</text><text x="282" y="78">P</text><text x="332" y="78">S</text>
  </g>
  <g font-size="9.5" fill="var(--text-muted)" text-anchor="middle">
    <text x="184" y="100">použit.</text><text x="232" y="100">spolehl.</text><text x="282" y="100">výkon</text><text x="332" y="100">udržov.</text>
  </g>
  <text x="258" y="136" text-anchor="middle" font-size="10" fill="var(--text-faint)">jak dobře to systém dělá</text>
  <!-- + constraints -->
  <rect x="382" y="40" width="124" height="120" rx="8" fill="oklch(0.65 0.10 60 / 0.16)" stroke="oklch(0.58 0.12 60)"/>
  <text x="444" y="30" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">omezení</text>
  <text x="444" y="78" text-anchor="middle" font-size="26" font-weight="700" fill="oklch(0.55 0.12 60)">+</text>
  <g font-size="9.5" fill="var(--text-muted)" text-anchor="middle">
    <text x="444" y="100">implementace</text>
    <text x="444" y="114">rozhraní · provoz</text>
    <text x="444" y="128">balení · právní</text>
  </g>
  <text x="260" y="182" text-anchor="middle" font-size="11" fill="var(--text-faint)">U R P S + zásadně ovlivňují volbu architektury systému.</text>
</svg>
:::

V běžné praxi je toto rozdělení velmi rozšířené, byť někteří autoři proti tak hrubému zobecnění namítají. Důležitý je praktický důsledek: **nefunkční požadavky mají silný vliv na architekturu systému**. Požadavek na vysoký výkon a vysokou spolehlivost ovlivní volbu softwarových i hardwarových komponent a jejich konfiguraci; potřeba snadné adaptability kvůli častým změnám funkčnosti zase zásadně formuje návrh softwaru.

## Kam se který požadavek v UP zapisuje

Klasifikace FURPS+ se promítá do toho, kde je požadavek v Unified Process zaznamenán:

* **Funkční požadavky (F)** se zachycují v *Modelu případů použití* a v seznamu vlastností *Vize*.
* **Nefunkční požadavky (U, R, P, S, +)**, které nelze vyjádřit jako konkrétní případ užití, se zaznamenávají v *Doplňkové specifikaci* (Supplementary Specification).

::: quiz "Požadavek zní: „Odezva na potvrzení objednávky nesmí překročit 2 sekundy při 500 souběžných uživatelích." Do které kategorie FURPS+ patří a jakého je typu?"
- [x] Performance (P) — nefunkční požadavek (atribut kvality).
  > Správně. Doba odezvy, propustnost a souběžné vytížení spadají pod výkon (P), což je nefunkční atribut kvality.
- [ ] Functionality (F) — funkční požadavek.
  > F popisuje, *co* systém dělá (potvrzení objednávky). To, *jak rychle* to dělá, je nefunkční výkonový požadavek.
- [ ] Supportability (S) — nefunkční požadavek.
  > S se týká udržovatelnosti, testovatelnosti a konfigurovatelnosti, nikoli rychlosti odezvy.
:::

::: link "Larman — Types of Requirements / FURPS+ (Applying UML and Patterns)" "https://www.oreilly.com/library/view/applying-uml-and/0130925691/0130925691_ch05lev1sec2.html"
:::

::: link "FURPS — přehled modelu a kategorií (Wikipedia)" "https://en.wikipedia.org/wiki/FURPS"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: C. Larman — Applying UML and Patterns (kap. 5); R. Grady — Practical Software Metrics (FURPS, HP, 1992); ISO/IEC 9126 a 25010.*
