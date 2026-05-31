---
title: Vlastnictví kódu v týmu
---

**Vlastnictví kódu** určuje, kdo smí měnit kterou část společné codebase. Nejde o vlastnictví ve smyslu autorských práv, ale o pravidlo zodpovědnosti a oprávnění: může vývojář upravit cizí modul sám, jen se svolením, nebo vůbec? Volba modelu silně ovlivňuje, jak hladce v týmu probíhá refaktorizace, sdílení znalostí a celková kvalita kódu.

## Čtyři modely

Existuje škála od žádné koordinace přes individuální vlastnictví až po plně sdílené. Martin Fowler rozlišuje tři pojmenované modely (silné, slabé, kolektivní); na okraj se přidává i stav „žádné vlastnictví".

::: viz ais-code-ownership "Vyber model. Šipky ukazují, který vývojář (A/B/C) smí měnit který modul (M1/M2/M3)."
:::

* **Žádné vlastnictví** — nikdo není za žádný modul zodpovědný. Kdokoli mění cokoli bez koordinace. Bez pravidel to vede k chaosu a nikdo systematicky nehlídá kvalitu.
* **Silné (individuální) vlastnictví** — každý modul má jediného vlastníka a *jen on* ho smí měnit. Změna, která by zasahovala do cizího modulu, musí počkat na jeho vlastníka. Vzniká úzké hrdlo a znalost modulu je vázaná na jednu osobu.
* **Slabé vlastnictví** — modul má vlastníka, ale ostatní ho smí měnit po dohodě s ním. Vlastník dohlíží na změny ve svém modulu. Kompromis mezi zodpovědností a průchodností.
* **Kolektivní vlastnictví kódu** (*Collective Code Ownership*, CCO) — pojem z Extreme Programming. Codebase patří **celému týmu**; každý člen má právo *i povinnost* upravit a vylepšit jakoukoli část aplikace.

## Proč kolektivní vlastnictví (CCO)

CCO přináší dvě hlavní výhody. První je **vzájemná zastupitelnost**. Když znalost komponenty není uzamčena v jediné hlavě, nemoc, dovolená nebo odchod vývojáře nezastaví vývoj — kdokoli další může pokračovat. Mizí riziko „pojistné události u autobusu" (*bus factor*), kdy je celý projekt rukojmím jednoho člověka.

Druhou výhodou je **vyšší kvalita**. Když kód uvidí celý tým, roste motivace odvádět dobrou práci. Špatný kód jednoho vývojáře přestává být „jeho problém" a stává se problémem týmu — a kdokoli ho smí refaktorizací vylepšit, místo aby ho obcházel. Refaktorizace navíc často potřebuje sáhnout do volajícího kódu napříč moduly; silné vlastnictví to blokuje, kolektivní (a do velké míry i slabé) to umožňuje.

| Model | Kdo smí měnit modul | Refaktorizace napříč moduly | Zastupitelnost |
|---|---|---|---|
| Žádné | kdokoli, bez koordinace | možná, ale neřízená | vysoká, ale chaotická |
| Silné | jen vlastník | obtížná (blokuje vlastník) | nízká |
| Slabé | vlastník + ostatní po dohodě | možná po domluvě | střední |
| Kolektivní (CCO) | kdokoli z týmu | snadná | vysoká |

## CCO nestojí samo — podpůrné praktiky

Aby kolektivní vlastnictví neskončilo v chaosu „žádného vlastnictví", musí stát na sadě podpůrných praktik. Bez nich se z práva měnit cokoli stane riziko, že to kdokoli rozbije.

::: svg "Kolektivní vlastnictví drží pohromadě díky podpůrným praktikám"
<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg">
  <rect x="170" y="14" width="180" height="40" rx="8" fill="oklch(0.62 0.16 142 / 0.16)" stroke="oklch(0.55 0.16 142)" stroke-width="1.5"/>
  <text x="260" y="32" text-anchor="middle" font-size="13" font-weight="700" fill="oklch(0.50 0.16 142)">Kolektivní vlastnictví</text>
  <text x="260" y="47" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">každý smí měnit cokoli</text>
  <g font-size="11" fill="var(--text)">
    <rect x="14"  y="104" width="112" height="50" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="70"  y="124" text-anchor="middle" font-weight="600">Standardy</text>
    <text x="70"  y="140" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">kódování</text>
    <rect x="140" y="104" width="112" height="50" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="196" y="124" text-anchor="middle" font-weight="600">Testy + TDD</text>
    <text x="196" y="140" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">refaktor beze strachu</text>
    <rect x="266" y="104" width="112" height="50" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="322" y="124" text-anchor="middle" font-weight="600">CI</text>
    <text x="322" y="140" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">okamžité odhalení chyb</text>
    <rect x="392" y="104" width="112" height="50" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="448" y="124" text-anchor="middle" font-weight="600">Párové prog.</text>
    <text x="448" y="140" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">šíření znalostí</text>
  </g>
  <g stroke="oklch(0.55 0.16 142)" stroke-width="1.2" opacity="0.7">
    <line x1="70"  y1="104" x2="210" y2="56"/>
    <line x1="196" y1="104" x2="245" y2="56"/>
    <line x1="322" y1="104" x2="290" y2="56"/>
    <line x1="448" y1="104" x2="320" y2="56"/>
  </g>
</svg>
:::

* **Standardy kódování** — společný styl zajistí, že kód je čitelný bez ohledu na to, kdo ho napsal; jinak by sjednocená codebase vypadala jako loskuták.
* **Bohatá sada automatických testů (TDD)** — bez regresní záchranné sítě by se nikdo neodvážil sáhnout do cizího kódu. Testy dělají z „mohu měnit cokoli" praktickou realitu, ne hazard. Viz [[tdd]].
* **Kontinuální integrace (CI)** — časté slévání a automatické sestavení + testy okamžitě upozorní, když některá změna rozbila celek.
* **Párové programování** — efektivně šíří znalost kódu napříč týmem, takže skutečně každý rozumí každé části.

Provázanost je obousměrná: kolektivní vlastnictví těží z [[vetveni-git|Trunk Based Developmentu]] (časté slévání do jedné větve podporuje sdílenou zodpovědnost) a samo ho zase umožňuje.

::: quiz "Proč kolektivní vlastnictví kódu (CCO) bez podpůrných praktik snadno sklouzne do chaosu?"
- [x] Bez standardů, testů a CI nemá tým záchranu proti tomu, že kdokoli rozbije kteroukoli část kódu.
  > Přesně. CCO dává právo měnit cokoli; teprve testy (regresní síť), standardy (čitelnost) a CI (rychlá zpětná vazba) z toho dělají bezpečnou praktiku, ne „žádné vlastnictví".
- [ ] Protože kolektivní vlastnictví zakazuje refaktorizaci.
  > Naopak — CCO refaktorizaci usnadňuje, protože povoluje změny napříč moduly. Problémem je chybějící bezpečnostní síť, ne zákaz.
- [ ] Protože při CCO nikdo nesmí měnit cizí moduly.
  > To je popis *silného* (individuálního) vlastnictví. CCO znamená, že každý smí měnit jakoukoli část.
:::

::: link "Martin Fowler — Code Ownership (bliki)" "https://martinfowler.com/bliki/CodeOwnership.html"
:::

::: link "Wikipedia — Collective ownership (Extreme Programming)" "https://en.wikipedia.org/wiki/Collective_ownership"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Martin Fowler (martinfowler.com), Extreme Programming (Kent Beck).*
