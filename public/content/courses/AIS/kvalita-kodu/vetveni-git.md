---
title: Repozitáře a větvení
---

Vyvíjený kód žije ve společném **repozitáři**, do kterého členové týmu zasahují — implementují nové funkce, opravují chyby (*bug-fix*) nebo refaktorizují. Klíčová otázka je, jak tyto souběžné změny organizovat, aby si vývojáři navzájem nepřekáželi a aby se jejich práce dala bezpečně spojit. Odpověď leží mezi dvěma krajnostmi: lineární historií a větvenou historií.

## Lineární vs. větvená historie

Při **lineární historii** existuje jen jedna posloupnost commitů — kód má v každém okamžiku právě jednu „aktuální" podobu. Při **větvené historii** připomíná repozitář strom (přesněji orientovaný acyklický graf): veřejně existuje více variant kódu vedle sebe. Každá větev má svůj účel — hlavní stabilní větev (*main*/*master*), aktuální vývoj a odštěpené větve pro konkrétní úkoly.

Větve umožňují souběžnou práci, ale za cenu, že se rozcházejí: čím déle větev žije odděleně, tím víc se od hlavní větve liší a tím těžší je ji nakonec spojit zpět.

## Feature branching

Při **feature branchingu** si vývojář pro každý úkol odštěpí vlastní větev (*feature branch*), pracuje na ní **izolovaně** od ostatních a po dokončení ji slije zpět do hlavní větve. Izolace je hlavní výhodou — rozpracovaná funkce nezasahuje do práce ostatních a hlavní větev zůstává v každém okamžiku „čistá".

Cena izolace se projeví při slévání. Pokud větev žije dlouho (dny až týdny), hlavní větev se mezitím posune a obě verze se výrazně rozejdou. Výsledkem je velký, těžko řešitelný **merge konflikt** — Git nedokáže automaticky sloučit změny, které sahají na stejná místa, a vývojář je musí ručně rozhodnout.

::: viz ais-branching-strategy "Přepni strategii. Feature branching drží dlouhou izolovanou větev (riziko velkého konfliktu při pozdním slévání); TBD slévá malé změny do jedné větve neustále."
:::

## Trunk Based Development

**Trunk Based Development** (TBD) je opačná strategie, typická pro agilní vývoj a DevOps. Všichni vývojáři spolupracují v **jedné jediné hlavní větvi** (*trunk*) a posílají do ní **malé, postupné změny velmi často** — klidně i několikrát denně. Vedlejší větve buď neexistují vůbec, nebo žijí jen krátce (hodiny, ne týdny).

Klíčový trik je, jak se do trunku integruje *nehotová* funkce, aniž by rozbila produkci: pomocí **feature toggles** (přepínačů funkcí). Nedokončený kód se zabalí do neaktivní cesty, která se zapne až později — kód je v trunku, ale uživatel ho zatím nevidí.

```java
// Feature toggle: kód je v trunku, ale skrytý za přepínačem
if (features.isEnabled("nova-platebni-brana")) {
    novaPlatba(objednavka);     // rozpracovaná funkce — zatím vypnutá
} else {
    puvodniPlatba(objednavka);  // stabilní cesta běžící v produkci
}
```

Přínos je přímý důsledek častého slévání: konflikty jsou **malé a vzácné**, protože se nikdy nenahromadí velký rozdíl. Integrace i zpětná vazba jsou rychlejší a celý tým má neustálý přehled o stavu projektu. TBD podporuje kvalitu kódu i [[vlastnictvi-kodu|kolektivní vlastnictví]] — ale právě proto je závislé na pevné záchranné síti.

| | Feature branching | Trunk Based Development |
|---|---|---|
| Počet aktivních větví | mnoho, dlouhožijících | jedna hlavní + krátké |
| Frekvence slévání | nízká (po dokončení funkce) | vysoká (i vícekrát denně) |
| Velikost merge konfliktů | velké, řešené pozdě | malé, řešené průběžně |
| Skrývání nehotové funkce | izolací ve větvi | feature toggle v trunku |
| Izolace vývojáře | vysoká | nízká (sdílený trunk) |

## Nároky na automatizované testy

TBD klade na tým mnohem **vyšší nároky na důsledné automatizované testování**. Protože každá změna jde rovnou do sdílené hlavní větve, jediná vadná úprava může „rozbít" stabilní verzi, na které staví všichni ostatní. Bez automatické sady testů spuštěné při každé integraci (v rámci [[tdd|CI]]) by se chyby šířily celým týmem dřív, než by si jich kdokoli všiml.

Proto jsou TBD a kontinuální integrace prakticky neoddělitelné — TBD je dokonce uváděno jako podmínka CI/CD. Feature branching je v tomhle shovívavější: dokud větev nebyla slita, případná chyba zůstává izolovaná. Cena za tuto shovívavost je ovšem ten velký konflikt nakonec.

::: quiz "Proč Trunk Based Development klade vyšší nároky na automatizované testy než feature branching?"
- [x] Každá změna jde rovnou do sdílené hlavní větve, takže vadná úprava okamžitě ohrozí celý tým — testy to musí zachytit hned.
  > Přesně. Při častém slévání do jednoho trunku není „izolovaná" zóna, kde by chyba mohla počkat; záchrannou sítí je automatická sada testů při každé integraci.
- [ ] Protože feature branching žádné testy nepotřebuje.
  > Testy potřebují obě strategie. Rozdíl je v naléhavosti: u TBD chrání sdílený trunk před každou jednotlivou změnou v reálném čase.
- [ ] Protože feature toggles nahrazují testování.
  > Feature toggle jen skryje nehotovou funkci před uživatelem. Nijak neověřuje, že kód funguje — to je úkol testů.
:::

::: link "Trunk Based Development — oficiální web" "https://trunkbaseddevelopment.com/"
:::

::: link "Atlassian — Trunk-based development" "https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development"
:::

::: link "Martin Fowler — Feature Toggles (Feature Flags)" "https://martinfowler.com/articles/feature-toggles.html"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=ecK3EnyGD8o" "13 Advanced (but useful) Git Techniques and Shortcuts" "Fireship"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: trunkbaseddevelopment.com (Paul Hammant), Atlassian, Martin Fowler.*
