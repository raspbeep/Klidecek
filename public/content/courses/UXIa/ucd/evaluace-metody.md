---
title: Testování a evaluace
---

Evaluace je v UCD nezbytná kontrola kvality: jejím účelem je zjistit, zda cílový uživatel dokáže produkt bez problémů ovládat a zda návrh splňuje specifikované cíle použitelnosti. Žádná jediná metoda neodhalí všechno — proto se kombinují přístupy, které se liší v tom, *kdy* v procesu se nasazují, *kdo* je provádí (experti vs. reální uživatelé) a *co* měří (kvalitativní příčiny vs. kvantitativní čísla).

## Uživatelské testování (usability testing)

Empirická metoda, při které se na vzorku **reálných uživatelů** testují předem připravené scénáře a úkoly. Pozoruje se, kde uživatel váhá, kde chybuje, co řekne nahlas (*think-aloud*).

Nejdůležitější princip a častá past u zkoušky: **netestuje se uživatel, testuje se systém.** Když uživatel neuspěje, není to jeho selhání — je to nalezený defekt rozhraní. Toto rámcování je nutné jak eticky, tak metodicky (jinak by moderátor uživateli „pomáhal" a zkreslil výsledek).

Podle toho, *kdy* v procesu testování probíhá, rozlišujeme dva druhy:

| | Formativní | Sumativní |
|---|---|---|
| **Kdy** | průběžně během návrhu | na (téměř) finálním systému |
| **Účel** | rychle odhalit a odstranit problémy | komplexně vyhodnotit vůči cílům |
| **Výstup** | kvalitativní — *proč* to nefunguje | kvantitativní — *jak dobré* to je |
| **Analogie** | ochutnávání během vaření | hodnocení hotového pokrmu |

Formativní testování běží v každé iteraci a řídí další návrh; sumativní přichází na konci a ověřuje, zda byly splněny počáteční požadavky (často s číselnou metrikou jako SUS nebo úspěšnost úkolu).

## Heuristická analýza (expertní inspekce)

Zkušené hodnocení, které provádějí **3–5 expertů** na UX — **bez** běžných uživatelů. Každý expert nezávisle projde rozhraní a hlásí, kde porušuje zavedená pravidla (heuristiky); poté se nálezy spojí a ohodnotí závažnost. Je to velmi rychlá a levná metoda, která odhalí principiální chyby ještě před nákladným uživatelským testováním.

Proč právě 3 až 5 expertů? Jeden hodnotitel najde podle Nielsenova výzkumu jen kolem **35 %** problémů, ale vícero hodnotitelů odhalí různé chyby. Při **pěti** se kumulativně dostáváme zhruba k **75 %** problémů; každý další expert pak přidává stále méně nových nálezů, takže náklady přerostou přínos.

::: svg "Kumulativní podíl nalezených problémů roste s počtem nezávislých hodnotitelů, ale s klesajícím přínosem"
<svg viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg">
  <rect width="460" height="170" fill="var(--bg-inset)" rx="8"/>
  <line x1="40" y1="140" x2="430" y2="140" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="40" y1="20" x2="40" y2="140" stroke="var(--line-strong)" stroke-width="1"/>
  <text x="20" y="30" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">% problémů</text>
  <text x="430" y="158" text-anchor="end" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">počet hodnotitelů →</text>
  <text x="36" y="40" text-anchor="end" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-faint)">100</text>
  <text x="36" y="143" text-anchor="end" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-faint)">0</text>
  <path d="M40 140 C 90 70, 150 48, 230 40 C 310 33, 380 30, 430 29" fill="none" stroke="oklch(0.6 0.16 264)" stroke-width="2"/>
  <line x1="245" y1="20" x2="245" y2="140" stroke="oklch(0.6 0.18 22)" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="245" y="16" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="oklch(0.55 0.18 22)">5 ≈ 75 %</text>
  <circle cx="80" cy="98" r="3" fill="oklch(0.6 0.16 264)"/>
  <text x="86" y="96" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-muted)">1 ≈ 35 %</text>
  <circle cx="245" cy="40" r="3.5" fill="oklch(0.6 0.18 22)"/>
</svg>
:::

Hodnotí se proti sadě **10 Nielsenových heuristik** (1994). Není nutné znát je doslovně, ale zkoušející očekává, že několik vyjmenujete a vysvětlíte princip:

1. **Viditelnost stavu systému** — systém dává včasnou zpětnou vazbu, co se děje.
2. **Shoda systému s reálným světem** — jazyk a koncepty známé uživateli, ne žargon.
3. **Uživatelská kontrola a svoboda** — jasný „nouzový východ", *undo/redo*.
4. **Konzistence a standardy** — stejná věc se značí stejně; platí konvence platformy.
5. **Prevence chyb** — návrh předchází chybám, ne jen je hlásí.
6. **Rozpoznání místo vybavování** — možnosti jsou vidět, uživatel si je nemusí pamatovat.
7. **Flexibilita a efektivita** — zkratky pro experty, vodítka pro začátečníky.
8. **Estetický a minimalistický design** — žádný obsah navíc, který konkuruje podstatnému.
9. **Pomoc při rozpoznání a zotavení z chyb** — srozumitelné chybové hlášky s návrhem řešení.
10. **Nápověda a dokumentace** — dohledatelná, zaměřená na úkol.

Z bodů 2 a 6 je vidět přímá vazba na [[ucd-pojmy]]: heuristiky jsou v podstatě návod, jak snížit kognitivní zátěž a respektovat mentální model uživatele.

## Kontextový rozhovor a pozorování

**Kontextový rozhovor** (*contextual inquiry*) i přímé **pozorování** jsou kvalitativní terénní metody: výzkumník jde **přímo za uživatelem** a sleduje ho při plnění rutinní práce v jeho přirozeném prostředí, případně se průběžně doptává. Odhalí se tak reálné problémy, improvizace a praktiky, které by od stolu (*desk research*) nikdy nevyšly najevo — uživatelé si totiž řadu zvyklostí ani neuvědomují a v dotazníku by je nepopsali. Tyto metody primárně živí aktivitu „specifikace kontextu použití" v [[ucd-proces-iso]].

## A/B testování a kvantitativní analytika

Vyžadují **nasazení hotového řešení** (nebo jeho variant) k reálným uživatelům. **A/B testování** ukáže dvěma srovnatelným skupinám dvě varianty (A a B) a měří, **která dosahuje lepšího výsledku** podle definované metriky (konverze, dokončení úkolu). **Webová analytika** sleduje reálné chování v provozu — na co lidé klikají, kde stránku opouštějí, jak dlouho úkol trvá.

Tyto metody jsou silné v *kvantitě a reprezentativnosti* (statisticky průkazné na velkém vzorku), ale slabé v *vysvětlení* — řeknou *co* se děje, ne *proč*. Proto se kombinují s kvalitativními metodami výše, které příčinu odhalí.

## System Usability Scale (SUS)

**SUS** je rychlý standardizovaný dotazník o **10 položkách** (Likertova škála 1–5), jehož výsledkem je jediné **skóre 0–100**. Je oblíbený u managementu, protože dává srozumitelné číslo srovnatelné napříč produkty. Klíčová vlastnost a častý dotaz: SUS **nedokáže odhalit příčiny** problémů — vyčíslí *jak* je systém použitelný, ne *proč* je špatný. Slouží tedy k sumativnímu srovnání, ne k diagnostice.

Past ve výpočtu: položky se **střídají** kladné (liché: 1, 3, 5, 7, 9) a záporné (sudé: 2, 4, 6, 8, 10). U kladných se od odpovědi odečte 1; u záporných se odpověď odečte od 5. Součet příspěvků (0–40) se vynásobí **2,5**, čímž vznikne skóre 0–100. Toto skóre **není procento** — je to index, který se interpretuje proti normě: průměrná hodnota napříč tisíci studiemi je přibližně **68**.

::: viz uxia-sus-skore "Posouvejte odpovědi u všech 10 položek. Sledujte, jak se liché (kladné) a sudé (záporné) položky převádějí a jak výsledné skóre 0–100 padne do pásma vůči normě 68."
:::

## Jak metody zapadají do procesu

| Metoda | Kdo | Uživatelé? | Co dává |
|---|---|---|---|
| Uživatelské testování (formativní) | moderátor + uživatelé | ano | příčiny problémů, průběžně |
| Uživatelské testování (sumativní) | moderátor + uživatelé | ano | hodnocení vůči cílům |
| Heuristická analýza | 3–5 expertů | ne | rychlé principiální chyby |
| Kontextový rozhovor / pozorování | výzkumník | ano (v terénu) | reálné praktiky, kontext |
| A/B testování / analytika | nasazený systém | ano (v provozu) | kvantitativní srovnání variant |
| SUS | uživatelé (dotazník) | ano | jedno číslo 0–100 (bez příčin) |

::: quiz "Manažer chce jediné číslo o použitelnosti produktu a tým mu dodá SUS skóre 72. Co z toho lze a nelze vyvodit?"
- [ ] Produkt je použitelný ze 72 % a víme, které obrazovky jsou problematické.
  > Dvě chyby: SUS skóre není procento (je to index 0–100) a neidentifikuje konkrétní problémová místa.
- [x] Produkt je mírně nad průměrnou normou (~68), ale SUS sám neřekne, kde a proč problémy jsou.
  > Správně. 72 je nad normou 68, ale k odhalení příčin je nutná kvalitativní metoda (uživatelské testování, heuristická analýza).
- [ ] Je třeba přidat další experty do heuristické analýzy, aby se skóre zvýšilo.
  > Heuristická analýza a SUS jsou různé metody s různým výstupem; počet expertů SUS skóre neovlivní.
:::

::: link "Nielsen Norman Group — 10 Usability Heuristics for User Interface Design" "https://www.nngroup.com/articles/ten-usability-heuristics/"
:::

::: link "Nielsen Norman Group — How Many Test Users in a Usability Study?" "https://www.nngroup.com/articles/how-many-test-users/"
:::

::: link "Measuring U — Measuring Usability with the System Usability Scale (SUS)" "https://measuringu.com/sus/"
:::

::: link "J. Brooke — SUS: A 'quick and dirty' usability scale (original)" "https://digital.ahrq.gov/sites/default/files/docs/survey/systemusabilityscale%2528sus%2529_comp%255B1%255D.pdf"
:::

---

*Zdroj: SZZ NADE — předmět User Experience a návrh uživatelských rozhraní, VUT FIT. Externí reference: J. Nielsen (10 Usability Heuristics, 1994; Heuristic Evaluation), J. Brooke (System Usability Scale, 1986), Nielsen Norman Group, MeasuringU.*
