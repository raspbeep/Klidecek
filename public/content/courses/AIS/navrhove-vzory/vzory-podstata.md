---
title: Podstata a kategorie návrhových vzorů
---

**Návrhový vzor** (*design pattern*) je ověřená, znovupoužitelná **konceptuální šablona** řešení často se opakujícího problému v objektovém návrhu softwaru. Zásadní je, co vzorem **není**: není to hotový kód k zkopírování ani knihovna. Je to *obecný návod*, jak uspořádat třídy a objekty, jejich odpovědnosti a vztahy — vždy přizpůsobený konkrétní situaci, ne mechanicky vložený.

Pojem zpopularizovala kniha *Design Patterns: Elements of Reusable Object-Oriented Software* (1994) čtveřice autorů známé jako **Gang of Four (GoF)**. Ti katalogizovali 23 vzorů a každý popsali jednotnou strukturou: *záměr* (intent), *motivace*, *účastníci* (participating classes), *důsledky* a *implementace*.

## Proč vzory používat

Význam návrhových vzorů má tři roviny:

* **Rychlost a kvalita návrhu** — místo opakovaného vymýšlení řešení se sáhne po prověřeném schématu, které předchází typickým strukturálním chybám (těsné vazby, duplicitní logika, neflexibilní hierarchie).
* **Společný slovník týmu** — vzory dávají jména abstraktním strukturám. Když někdo řekne *„obalil jsem subsystém Facade"* nebo *„platby řeším přes Strategy"*, ostatní okamžitě vědí, jaká je struktura tříd, jaké jsou role a kde hledat rozšiřitelnost. Komunikace o návrhu probíhá na vyšší úrovni abstrakce.
* **Udržovatelnost a rozšiřitelnost** — většina vzorů cíleně zavádí *abstrakci* (rozhraní, abstraktní třídu) tam, kde se očekává změna, a tím izoluje to, co se mění, od toho, co zůstává stabilní.

Vzor není samoúčelný. Aplikovat ho má smysl jen tam, kde řeší skutečný problém — nadužívání vzorů je samo o sobě [anti-vzor](anti-vzory) (*Golden Hammer*).

## Tři kategorie podle GoF

GoF dělí vzory podle toho, **čeho se primárně týkají** — vytváření objektů, jejich skládání do větších struktur, nebo rozdělení odpovědností a komunikace mezi nimi.

| Kategorie | Co řeší | Klíčová otázka | Příklady (zde) |
|---|---|---|---|
| **Creational** (vytvářecí) | Způsob *vzniku* objektů — odstiňuje klienta od konkrétních tříd a `new`. | „Jak vytvořit objekt, aniž se vážu na jeho konkrétní třídu?" | Singleton, Abstract Factory |
| **Structural** (strukturální) | *Skládání* tříd a objektů do větších celků a zjednodušení jejich rozhraní. | „Jak poskládat objekty, aby vznikla pružná struktura?" | Composite, Facade |
| **Behavioral** (behaviorální) | *Komunikaci* mezi objekty a rozdělení **odpovědností** a algoritmů. | „Jak si objekty rozdělí práci a předají si řízení?" | Strategy, Observer |

::: svg "Tři kategorie GoF vzorů — podle toho, čeho se vzor primárně dotýká"
<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="166" height="146" rx="8" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)"/>
  <text x="93" y="44" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.45 0.14 264)">Creational</text>
  <text x="93" y="62" text-anchor="middle" font-size="11" fill="var(--text-muted)">vytváření objektů</text>
  <text x="93" y="92" text-anchor="middle" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">Singleton</text>
  <text x="93" y="110" text-anchor="middle" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">Abstract Factory</text>
  <text x="93" y="146" text-anchor="middle" font-size="10" fill="var(--text-faint)">odstiňuje od `new`</text>
  <rect x="187" y="20" width="166" height="146" rx="8" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="270" y="44" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.14 142)">Structural</text>
  <text x="270" y="62" text-anchor="middle" font-size="11" fill="var(--text-muted)">skládání struktur</text>
  <text x="270" y="92" text-anchor="middle" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">Composite</text>
  <text x="270" y="110" text-anchor="middle" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">Facade</text>
  <text x="270" y="146" text-anchor="middle" font-size="10" fill="var(--text-faint)">tvar tříd a objektů</text>
  <rect x="364" y="20" width="166" height="146" rx="8" fill="oklch(0.62 0.16 22 / 0.10)" stroke="oklch(0.62 0.16 22)"/>
  <text x="447" y="44" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.45 0.16 22)">Behavioral</text>
  <text x="447" y="62" text-anchor="middle" font-size="11" fill="var(--text-muted)">komunikace, role</text>
  <text x="447" y="92" text-anchor="middle" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">Strategy</text>
  <text x="447" y="110" text-anchor="middle" font-size="11.5" fill="var(--text)" font-family="var(--font-mono)">Observer</text>
  <text x="447" y="146" text-anchor="middle" font-size="10" fill="var(--text-faint)">rozdělení odpovědností</text>
</svg>
:::

## Vzor je popsán strukturou, ne kódem

Že vzor není kód, je vidět už na úrovni *zápisu*: vzor se popisuje **UML diagramem tříd** (jaké jsou role, kdo z koho dědí, kdo koho drží), nikoli konkrétní implementací. Tentýž vzor proto vypadá v Javě, C++ i Pythonu jinak, ale **struktura rolí zůstává stejná**. Při zkoušce se proto u každého vzoru očekává, že nakreslíte jeho UML a pojmenujete role účastníků — to je jádro vzoru, kód je jen jedna z jeho realizací.

Vztah vzorů k principům: vzory jsou *aplikací* obecnějších návrhových principů (zapouzdření toho, co se mění; programování proti rozhraní, ne implementaci; preference skládání před děděním). Proto se mnoho vzorů opírá o **polymorfismus přes společné rozhraní** — to je společný jmenovatel téměř všech vzorů z této kapitoly.

::: quiz "Co nejlépe vystihuje, čím návrhový vzor je?"
- [ ] Hotový kus kódu (např. třída z knihovny), který se zkopíruje do projektu.
  > Ne. Vzor není kód — knihovní třída je konkrétní implementace. Vzor je obecné schéma rolí a vztahů.
- [x] Ověřené obecné schéma řešení opakovaného návrhového problému, popsané rolemi tříd a jejich vztahy.
  > Přesně. Vzor je konceptuální šablona (typicky zapsaná UML diagramem), kterou v každém jazyce realizujete jinak.
- [ ] Programovací jazyk specializovaný na objektový návrh.
  > Vzor je nezávislý na jazyce; popisuje strukturu, ne syntaxi.
- [ ] Pravidlo, které musí splnit každá objektová aplikace.
  > Vzory jsou doporučení pro konkrétní situace, ne univerzální povinnost — nadužívání je naopak anti-vzor.
:::

::: link "Refactoring.guru — Design Patterns (katalog GoF)" "https://refactoring.guru/design-patterns"
:::

::: link "Design Patterns (GoF, 1994) — přehled na Wikipedii" "https://en.wikipedia.org/wiki/Design_Patterns"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Gamma, Helm, Johnson, Vlissides — Design Patterns (GoF, 1994), Refactoring.guru.*
