---
title: Use Case model a artefakty UP
---

Unified Process organizuje požadavky do sady formálních **artefaktů**, jejichž *naplněnost* se vyvíjí podle fáze projektu — žádný artefakt není na začátku kompletní, naopak roste s tím, jak postupuje iterativní upřesňování. Centrálním artefaktem pro funkční požadavky je **Model případů použití** (Use-Case Model). Tato sekce nejprve shrnuje, jaké artefakty UP vytváří a jak se plní, a poté se věnuje tvorbě samotného modelu případů použití.

## Artefakty UP související s požadavky

| Artefakt | Obsah | Naplněnost dle fáze |
|----------|-------|---------------------|
| **Vize** (Vision) | Krátký manažerský dokument: klíčové vlastnosti, byznys případ, hlavní omezení, definice rozsahu (scope). | Hotová brzy, dále se mění málo. |
| **Model případů použití** | Soubor typických scénářů používání systému; funkční (behaviorální) specifikace a aktéři. | Na konci Inception ~10–20 %, na konci Elaboration ~80 %. |
| **Doplňková specifikace** (Supplementary Specification) | Vše, co nelze vyjádřit jako případ užití: nefunkční požadavky (dle FURPS+) a globální systémová pravidla. | Roste s identifikací atributů kvality. |
| **Slovník** (Glossary) | Datový slovník a definice doménových i projektových termínů; datová omezení, pravidla formátování. | Doplňuje se průběžně. |
| **Obchodní pravidla** (Business / Domain Rules) | Obecná pravidla a politiky přesahující samotný projekt (např. zákony, daňová pravidla). | Sdílí se napříč organizací. |

Klíčový poznatek o naplněnosti: na konci úvodní fáze **Inception** je model případů použití hotov jen zhruba z **10–20 %** (jen několik kritických případů je popsáno detailně), zatímco na konci fáze **Elaboration** by měl dosáhnout přibližně **80 %**. To přímo odráží evoluční přístup — detailně se nejprve zpracuje malá množina rizikových a architektonicky významných případů, ostatní se upřesňují později.

## Aktér a případ užití

Diagram případů užití je jeden z diagramů chování jazyka UML. Jeho hlavním účelem je zachytit *vnější* pohled na systém, rozpoznat jeho *hranice* a zobrazit aktéry komunikující se systémem. Sám diagram je ale jen doplněk — **případy užití jsou textové dokumenty, nikoli diagramy**, a modelování případů užití je především psaní textu.

* **Aktér** (*Actor*) — cokoli s chováním, co interaguje se systémem: člověk (identifikovaný rolí, např. *pokladní*), jiný softwarový systém nebo organizace. V diagramu se značí figurou panáčka. Rozlišujeme tři druhy aktérů:
  * *primární* — má cíle, které plní pomocí služeb systému (pokladní);
  * *podporující* (supporting) — poskytuje systému službu (např. externí autorizace platby);
  * *zákulisní* (offstage) — má zájem na chování systému, ale není primární ani podporující (např. daňový úřad).
* **Případ užití** (*Use Case*) — kolekce souvisejících úspěšných a neúspěšných scénářů popisujících aktéra, který používá systém k dosažení cíle. V diagramu se značí oválem. **Scénář** je jedna konkrétní posloupnost akcí a interakcí — jedna cesta případem užití (např. úspěšný nákup za hotové, nebo selhání kvůli zamítnuté platbě).

::: svg "Diagram případů užití: hranice systému, aktéři a případy užití"
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="520" height="200" fill="var(--bg-inset)" rx="6"/>
  <!-- system boundary -->
  <rect x="170" y="20" width="190" height="160" rx="8" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="265" y="38" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted)">Systém (SuD)</text>
  <!-- use cases -->
  <ellipse cx="265" cy="70" rx="72" ry="20" fill="oklch(0.62 0.14 264 / 0.16)" stroke="var(--accent)"/>
  <text x="265" y="74" text-anchor="middle" font-size="11" fill="var(--text)">Zpracuj prodej</text>
  <ellipse cx="265" cy="125" rx="72" ry="20" fill="oklch(0.62 0.14 264 / 0.16)" stroke="var(--accent)"/>
  <text x="265" y="129" text-anchor="middle" font-size="11" fill="var(--text)">Vyřiď vrácení</text>
  <!-- primary actor (left) -->
  <g stroke="var(--text)" stroke-width="1.6" fill="none">
    <circle cx="60" cy="74" r="9"/>
    <line x1="60" y1="83" x2="60" y2="108"/>
    <line x1="44" y1="93" x2="76" y2="93"/>
    <line x1="60" y1="108" x2="46" y2="126"/>
    <line x1="60" y1="108" x2="74" y2="126"/>
  </g>
  <text x="60" y="142" text-anchor="middle" font-size="10.5" fill="var(--text)">Pokladní</text>
  <text x="60" y="156" text-anchor="middle" font-size="9" fill="var(--text-faint)">primární</text>
  <!-- supporting actor (right) -->
  <g stroke="var(--text-muted)" stroke-width="1.6" fill="none">
    <circle cx="462" cy="74" r="9"/>
    <line x1="462" y1="83" x2="462" y2="108"/>
    <line x1="446" y1="93" x2="478" y2="93"/>
    <line x1="462" y1="108" x2="448" y2="126"/>
    <line x1="462" y1="108" x2="476" y2="126"/>
  </g>
  <text x="462" y="142" text-anchor="middle" font-size="10.5" fill="var(--text)">Platební</text>
  <text x="462" y="156" text-anchor="middle" font-size="10.5" fill="var(--text)">služba</text>
  <text x="462" y="170" text-anchor="middle" font-size="9" fill="var(--text-faint)">podporující</text>
  <!-- associations -->
  <line x1="78" y1="86" x2="193" y2="70" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="78" y1="100" x2="193" y2="123" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="337" y1="70" x2="444" y2="78" stroke="var(--line-strong)" stroke-width="1"/>
</svg>
:::

Mezi případy užití mohou existovat tři vztahy: **«include»** (jeden případ povinně zahrnuje jiný, např. vkládání obrázku v rámci editace), **«extend»** (případ rozšiřuje jiný za určitých okolností) a **generalizace** (jeden případ je specializací jiného).

## Úrovně formálnosti scénářů

Textový popis případu užití lze psát ve třech úrovních formálnosti, podle toho, jak je daný případ rizikový a důležitý. Detailně se zpracovává jen oněch ~10 % kritických případů, zbytek zůstává stručný.

* **Brief (stručný)** — jeden hlavní scénář popsaný krátkým odstavcem. Vzniká během rané analýzy za pár minut, slouží k rychlému pochopení rozsahu.
* **Casual (neformální)** — neformální popis ve více odstavcích, pokrývá více scénářů (úspěšných i neúspěšných).
* **Fully dressed (plně formální)** — detailně strukturovaná šablona se všemi kroky a variacemi a s doplňujícími sekcemi: primární aktér, zúčastněné strany a jejich zájmy, **vstupní podmínky** (preconditions), **garance úspěchu / výstupní podmínky** (success guarantee / postconditions), **hlavní úspěšný scénář** (basic flow) a **rozšíření / alternativní toky** (extensions).

::: viz ais-use-case-formality "Přepínejte úroveň formálnosti a sledujte, jak roste detail popisu téhož případu užití — od stručného odstavce po plně formální šablonu se vstupními a výstupními podmínkami."
:::

## Black-box styl

Doporučeným a nejčastějším způsobem zápisu je **black-box** styl: scénář popisuje *odpovědnosti* systému — co má systém udělat — ale nikoli *jak* to interně provede na úrovni komponent, kódu nebo databáze. Hranice mezi analýzou a návrhem se často shrnuje jako „co" versus „jak": během analýzy požadavků se vyhýbáme rozhodnutím „jak" a specifikujeme jen vnější chování systému jako černé skříňky; teprve při návrhu vzniká řešení, které tuto specifikaci naplní.

| Black-box (správně) | Vnitřní pohled (nesprávně) |
|---------------------|----------------------------|
| „Systém zaznamená prodej." | „Systém zapíše prodej do databáze." |
| (popisuje odpovědnost) | „Systém vygeneruje SQL INSERT pro prodej." (popisuje implementaci) |

::: quiz "Který krok scénáře je napsán správně v black-box stylu?"
- [x] „Systém ověří totožnost pokladního a zaznamená položku prodeje."
  > Správně. Popisuje *odpovědnost* systému (co dělá), bez rozhodnutí o vnitřní implementaci.
- [ ] „Systém zavolá metodu saveItem() a vloží řádek do tabulky SALE."
  > To je „jak" — vnitřní implementace. Patří do návrhu, ne do analýzy požadavků.
- [ ] „Systém otevře JDBC spojení a provede SQL INSERT."
  > Stejný problém: popisuje technické provedení, nikoli odpovědnost systému jako černé skříňky.
:::

::: link "Larman — Use Cases (kapitola 6, ukázka): formáty a black-box styl" "https://www.craiglarman.com/wiki/downloads/applying_uml/larman-ch6-applying-evolutionary-use-cases.pdf"
:::

::: link "UML 2.5.1 — specifikace (OMG, UseCases)" "https://www.omg.org/spec/UML/2.5.1/"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: C. Larman — Applying UML and Patterns (kap. 5 a 6); A. Cockburn — Writing Effective Use Cases; OMG UML 2.5.1.*
