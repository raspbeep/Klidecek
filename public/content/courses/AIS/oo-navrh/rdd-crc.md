---
title: Návrh řízený zodpovědností a CRC karty
---

Návrh řízený zodpovědností (**RDD — Responsibility-Driven Design**) je přístup, který posouvá pohled na objekt od *„balíku dat a algoritmů"* k **behaviorálnímu pojetí**. Software je chápán jako komunita spolupracujících objektů, z nichž každý má jasně vymezené **role** a **zodpovědnosti**. Návrhář se neptá *„jaká data tu jsou?"*, ale *„kdo je za co zodpovědný a s kým spolupracuje?"*.

## Knowing vs. doing — dva druhy zodpovědností

Zodpovědnosti objektu se dělí do dvou kategorií. Rozlišovat je je základ celého přístupu.

| Druh | Anglicky | Co objekt umí | Příklad |
|---|---|---|---|
| **Vědění** | *knowing* | znát svá soukromá data, znát související objekty, umět odvodit informaci | `Order` zná své položky a umí spočítat celkovou cenu |
| **Konání** | *doing* | provádět úkon, vytvářet jiné objekty, řídit a koordinovat ostatní | `OrderService` vytvoří objednávku, zařídí platbu, uloží ji |

Zodpovědnost je *abstraktnější* než metoda — jedna zodpovědnost se může promítnout do více metod, nebo dokonce do spolupráce více objektů. Návrh se dělá na úrovni zodpovědností, teprve pak vznikají konkrétní metody.

## Role objektů (stereotypy)

Aby se zodpovědnosti přidělovaly konzistentně, RDD třídí objekty do **rolí (stereotypů)** — záměrných zjednodušení, která ostře vymezí, k čemu objekt slouží. Jeden objekt může nést jednu i více rolí (časté kombinace: *poskytovatel služeb + držitel informací*).

* **Držitel informací** (*information holder*) — zná a poskytuje informace; sám s nimi mnoho nedělá.
* **Strukturér** (*structurer*) — udržuje vztahy mezi objekty a informace o jejich uspořádání.
* **Poskytovatel služeb** (*service provider*) — vykonává práci, nabízí výpočetní službu.
* **Koordinátor** (*coordinator*) — reaguje na události tím, že **deleguje** úkoly jiným; sám rozhodnutí nedělá.
* **Controller** (*controller*) — činí rozhodnutí a **řídí** činnost ostatních (viz princip Controller v [[grasp]]).
* **Rozhraní** (*interfacer*) — transformuje informace a požadavky mezi oddělenými částmi systému (např. mezi UI a doménou, mezi systémem a okolím).

## Klient-server kontrakty

Komunikace mezi objekty je v RDD řízena vztahem **klient — server**: objekt-klient požádá objekt-server o službu, server ji poskytne. Co server slibuje, popisuje **kontrakt** — množina zpráv, které objekt přijímá, a co za ně garantuje. Klient zná *jen kontrakt*, ne implementaci serveru. Tím je zajištěno plné **zapouzdření**: server může vnitřek libovolně přepsat, dokud kontrakt drží.

::: svg "Klient žádá službu přes kontrakt; implementaci serveru nevidí"
<svg viewBox="0 0 420 130" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="40" width="120" height="50" rx="8" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="74" y="62" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Klient</text>
  <text x="74" y="78" text-anchor="middle" font-size="9" fill="var(--text-muted)">potřebuje službu</text>
  <rect x="286" y="40" width="120" height="50" rx="8" fill="var(--accent)" opacity="0.12" stroke="var(--accent)"/>
  <text x="346" y="62" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">Server</text>
  <text x="346" y="78" text-anchor="middle" font-size="9" fill="var(--text-muted)">skrytá implementace</text>
  <line x1="135" y1="55" x2="284" y2="55" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#crcReq)"/>
  <text x="210" y="48" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text)">požadavek (zpráva)</text>
  <line x1="284" y1="76" x2="137" y2="76" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#crcRes)"/>
  <text x="210" y="92" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">odpověď (garance kontraktu)</text>
  <text x="210" y="120" text-anchor="middle" font-size="9" fill="var(--text-faint)">klient zná jen kontrakt — co server umí, ne jak to dělá</text>
  <defs>
    <marker id="crcReq" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)"/></marker>
    <marker id="crcRes" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/></marker>
  </defs>
</svg>
:::

## CRC karty

Praktickým nástrojem RDD jsou **CRC karty** (*Class — Responsibilities — Collaborators*). Je to obyčejná kartička (nebo její digitální ekvivalent) rozdělená do tří částí:

* **Class** — jméno třídy nahoře.
* **Responsibilities** — co třída ví a co dělá (levý sloupec).
* **Collaborators** — které jiné třídy potřebuje, aby svou zodpovědnost splnila (pravý sloupec).

Karty se používají v rané fázi, **bez psaní kódu**. Tým si je rozloží na stůl a *prochází scénář* případu užití — jeden člověk „mluví za" třídu a předává zprávy dál. Když některá karta na splnění úkolu nestačí, objeví se nový kolaborátor nebo se zodpovědnost přesune jinam. Tak se levně odladí přidělení zodpovědností dřív, než cokoli vznikne v IDE.

::: viz ais-crc-card "Procházej kartu objednávkového scénáře — každá CRC karta drží zodpovědnosti (knowing/doing) a kolaboranty."
:::

## Delegované vs. centralizované řízení

Při procházení scénářů se ukáže, *jak* je řízení rozloženo. RDD preferuje **delegované řízení** před **centralizovaným**.

| | Centralizované řízení | Delegované řízení (preferované) |
|---|---|---|
| Kde je logika | jeden „mozkový" objekt zná vše a řídí | rozprostřena mezi mnoho „chytrých" objektů |
| Ostatní objekty | pasivní držitelé dat (*hloupé* objekty) | každý nese svou část zodpovědnosti |
| Vazba (coupling) | vysoká — řídicí objekt závisí na všem | nízká — objekty znají jen své sousedy |
| Riziko | „God object", těžko se mění | rovnoměrné rozložení, snadná změna |

Centralizovaný styl připomíná procedurální program převlečený do objektů: jediný `Manager` vše orchestruje a ostatní třídy jsou jen kontejnery na data. Delegovaný styl rozdá práci tam, kde jsou data a schopnosti — což je přesně princip *Information Expert* z [[grasp]].

::: quiz "Objekt jen reaguje na událost tím, že rozdělí podúkoly jiným objektům a sám nerozhoduje. Jaká je to role?"
- [ ] Controller
  > Controller činí rozhodnutí a řídí ostatní. Tady objekt nerozhoduje, jen rozděluje práci.
- [x] Koordinátor (coordinator)
  > Přesně — koordinátor reaguje na události delegováním úkolů, aniž by sám prováděl rozhodovací logiku.
- [ ] Držitel informací (information holder)
  > Držitel informací poskytuje data; tento objekt naopak rozděluje práci, žádná data nedrží.
:::

::: link "Wirfs-Brock — A Brief Tour of Responsibility-Driven Design (PDF)" "https://www.wirfs-brock.com/PDFs/A_Brief-Tour-of-RDD.pdf"
:::
::: link "Wikipedia — Responsibility-driven design" "https://en.wikipedia.org/wiki/Responsibility-driven_design"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Wirfs-Brock & McKean (Object Design: Roles, Responsibilities, and Collaborations), Wikipedia.*
