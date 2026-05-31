---
title: Podstata OO návrhu, vstupy a výstupy
---

Objektově orientovaný návrh (OOD) je disciplína softwarového inženýrství, která transformuje **analytické modely a požadavky** (*co* má systém dělat) do **technické specifikace** (*jak* to systém udělá) připravené k implementaci v konkrétním programovacím jazyce. Tvoří tak most mezi objektově orientovanou *analýzou* a *kódem* — typicky jako návrhová aktivita v rámci iterativního procesu (Unified Process).

Zatímco starší **strukturovaný přístup** striktně oddělil data (struktury, záznamy) od procedur (funkcí, které nad daty operují), objektově orientovaný přístup obě složky **sjednocuje** uvnitř objektu. Systém je modelován jako komunita autonomních spolupracujících entit, které si navzájem posílají zprávy a vzájemně si plní zodpovědnosti.

## Čtyři pilíře OO paradigmatu

Podstata OO myšlení stojí na čtyřech principech. Návrh, který je všechny vědomě používá, je pružnější a snáze se mění než procedurální kód.

| Princip | Co znamená | K čemu slouží |
|---|---|---|
| **Abstrakce** | zaměření na podstatné vlastnosti a chování, ignorování nepodstatných detailů | model je srozumitelný, řeší doménu, ne implementaci |
| **Zapouzdření** | oddělení vnějšího rozhraní od vnitřního stavu a implementace | stav je chráněn, vnitřek lze měnit bez dopadu na klienty |
| **Dědičnost** | sdílení dat a chování mezi hierarchicky uspořádanými třídami | znovupoužitelnost, vyjádření vztahu *„je druhem"* |
| **Polymorfismus** | přístup k různým typům objektů jednotným rozhraním | flexibilita, rozšiřitelnost bez větvení podle typu |

Pozor na rozdíl mezi *abstrakcí* a *zapouzdřením* — bývá to zkušební otázka. Abstrakce rozhoduje, **co** objekt navenek nabízí (které rysy jsou podstatné); zapouzdření rozhoduje, **jak je to schované** (skrytí stavu a implementace za rozhraním). Abstrakce je o pohledu zvenčí, zapouzdření o ochraně zevnitř.

::: svg "Zapouzdření: veřejné rozhraní obklopuje skrytý stav a implementaci"
<svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="320" height="140" rx="14" fill="var(--accent)" opacity="0.10" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="180" y="40" text-anchor="middle" font-size="12" font-weight="600" fill="var(--accent)">veřejné rozhraní (metody)</text>
  <rect x="70" y="56" width="220" height="86" rx="10" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1"/>
  <text x="180" y="78" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">skrytý vnitřní stav</text>
  <text x="180" y="98" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">privátní atributy</text>
  <text x="180" y="116" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">implementace metod</text>
  <text x="180" y="133" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-family="var(--font-mono)">private</text>
  <circle cx="40" cy="90" r="5" fill="var(--accent)"/>
  <circle cx="320" cy="90" r="5" fill="var(--accent)"/>
  <line x1="45" y1="90" x2="68" y2="90" stroke="var(--accent)" stroke-width="1.5"/>
  <line x1="292" y1="90" x2="315" y2="90" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="180" y="173" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">klienti vidí jen rozhraní — vnitřek lze měnit bez dopadu na ně</text>
</svg>
:::

## Co jde do návrhu — vstupy

Vstupy OOD pocházejí z fáze analýzy. Jsou to artefakty, které říkají, *co* má systém dělat, ale ještě ne *jak*.

* **Případy užití (Use Cases)** — definují funkční požadavky, scénáře a navenek viditelné chování, které musí objekty nakonec realizovat. Hlavní úspěšný scénář dává posloupnost kroků, jež se v návrhu promítnou do toku zpráv.
* **Doménový model** — vizuální mapa pojmů a entit reálného světa (*konceptuální* třídy, ne softwarové). Slouží jako *inspirace* a slovník pro pojmenování softwarových tříd; snižuje tzv. *reprezentační mezeru* mezi modelem a doménou.
* **Systémové sekvenční diagramy (SSD)** — zachycují interakce mezi externími aktéry a systémem jako **černou skříňkou**; definují vstupní *systémové události* (volání, na která systém reaguje).
* **Doplňkové specifikace** — nefunkční požadavky (výkon, bezpečnost, persistence, použitelnost). Často nutí návrháře zavést **technické třídy**, které v doméně neexistují (např. perzistentní vrstva, logování).

## Co z návrhu vychází — výstupy

> **Doménový model** popisuje pojmy *reálného světa* (zákazník, objednávka). **Designový diagram tříd** popisuje *softwarové* třídy s metodami, typy a viditelností. Záměna obou je klasická chyba u zkoušky — doménový model nemá metody ani signatury.

* **Interakční diagramy** (sekvenční a komunikační) — *stěžejní* výstup. Zobrazují kolaboraci, tedy tok zpráv mezi softwarovými objekty. Právě tady se reálně **přidělují zodpovědnosti** — když objekt přijme zprávu, stává se za příslušnou činnost zodpovědným.
* **Designový diagram tříd (DCD)** — statický pohled s detaily: signatury metod, datové typy atributů, viditelnost (`+ - #`) a navigovatelnost vazeb. DCD vzniká *z* interakčních diagramů — třídám se přidají právě ty metody, jejichž zprávy přijímají.
* **Návrh datové (perzistentní) vrstvy** — mapování objektů na trvalé úložiště (objektově-relační mapování, schéma databáze).
* **Stavové diagramy** — popisují složitý životní cyklus *reaktivních* objektů (stavy a přechody řízené událostmi).

::: svg "OOD jako most: vstupy z analýzy → návrhové výstupy"
<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg">
  <text x="90" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted)">VSTUPY (analýza)</text>
  <text x="430" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted)">VÝSTUPY (návrh)</text>
  <g font-size="9.5" fill="var(--text)">
    <rect x="14" y="32" width="152" height="22" rx="5" fill="var(--bg-card)" stroke="var(--line)"/><text x="22" y="47">Případy užití</text>
    <rect x="14" y="60" width="152" height="22" rx="5" fill="var(--bg-card)" stroke="var(--line)"/><text x="22" y="75">Doménový model</text>
    <rect x="14" y="88" width="152" height="22" rx="5" fill="var(--bg-card)" stroke="var(--line)"/><text x="22" y="103">Systémové sekv. diagramy</text>
    <rect x="14" y="116" width="152" height="22" rx="5" fill="var(--bg-card)" stroke="var(--line)"/><text x="22" y="131">Doplňkové specifikace</text>
  </g>
  <rect x="206" y="58" width="108" height="54" rx="10" fill="var(--accent)" opacity="0.16" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="260" y="82" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent)">OOD</text>
  <text x="260" y="98" text-anchor="middle" font-size="9" fill="var(--text-muted)">co → jak</text>
  <g font-size="9.5" fill="var(--text)">
    <rect x="354" y="32" width="152" height="22" rx="5" fill="var(--bg-card)" stroke="var(--line)"/><text x="362" y="47">Interakční diagramy</text>
    <rect x="354" y="60" width="152" height="22" rx="5" fill="var(--bg-card)" stroke="var(--line)"/><text x="362" y="75">Designový diagram tříd</text>
    <rect x="354" y="88" width="152" height="22" rx="5" fill="var(--bg-card)" stroke="var(--line)"/><text x="362" y="103">Datová / perzist. vrstva</text>
    <rect x="354" y="116" width="152" height="22" rx="5" fill="var(--bg-card)" stroke="var(--line)"/><text x="362" y="131">Stavové diagramy</text>
  </g>
  <line x1="168" y1="85" x2="204" y2="85" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arrPod)"/>
  <line x1="316" y1="85" x2="352" y2="85" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#arrPod)"/>
  <defs><marker id="arrPod" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)"/></marker></defs>
</svg>
:::

Klíčová myšlenka, na které stojí celé další učivo: **návrh = přidělování zodpovědností objektům**. Z případů užití plyne, *co* se má stát; otázkou návrhu je, *která třída* za to bude zodpovědná. Jak se rozhodovat racionálně, popisují principy návrhu řízeného zodpovědností a vzory [[grasp]] a [[solid]].

::: quiz "Čím se liší doménový model od designového diagramu tříd (DCD)?"
- [x] Doménový model popisuje pojmy reálného světa bez metod; DCD popisuje softwarové třídy se signaturami metod, typy a viditelností.
  > Doménový model je analytický artefakt (konceptuální třídy, inspirace), DCD je návrhový artefakt s technickými detaily nutnými pro implementaci.
- [ ] Jsou to dva názvy pro tentýž diagram používaný v různých fázích.
  > Nejsou. Liší se účelem i obsahem: doménový model nemá metody ani datové typy, DCD ano.
- [ ] Doménový model obsahuje signatury metod, DCD jen pojmy.
  > Je to přesně naopak — signatury metod patří do DCD.
:::

::: link "Larman — Applying UML and Patterns (kap. 9, doménový model)" "https://www.craiglarman.com/wiki/index.php?title=Books_by_Craig_Larman"
:::
::: link "Wikipedia — Object-oriented design" "https://en.wikipedia.org/wiki/Object-oriented_design"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Larman (Applying UML and Patterns), Wikipedia.*
