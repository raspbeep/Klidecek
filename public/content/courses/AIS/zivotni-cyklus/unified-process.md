---
title: Unified Process (RUP)
---

**Unified Process (UP)** je iterativní a inkrementální rámec pro vývoj softwaru. Jeho nejznámější komerční verzí je **Rational Unified Process (RUP)**. Na rozdíl od jednoduchého iterativního modelu UP přesně předepisuje, *jak* iterace organizovat: rozkládá projekt do čtyř fází a uvnitř každé fáze probíhá jedna nebo více iterací, z nichž každá je malý vodopád dodávající ověřitelný přírůstek.

## Tři pilíře

UP stojí na třech vůdčích principech, které určují, čím se každá iterace řídí:

* **Use-case driven** — řízený případy užití. Funkční požadavky se zachycují jako *případy užití* (use cases) popisující, jak aktér používá systém k dosažení cíle. Případy užití pak protékají celým procesem: z nich se odvozuje analýza, návrh, implementace i testy.
* **Architecture-centric** — zaměřený na architekturu. Stabilní základní architektura systému se vytváří a ověřuje brzy (ve fázi Elaboration), protože je to kostra, na kterou se vše ostatní věší.
* **Risk-driven** — řízený riziky. Iterace se plánují tak, aby se **nejnebezpečnější rizika řešila nejdříve**. Nejistoty (technické i v zadání) se ověřují brzy, dokud je levné měnit směr.

## Čtyři fáze

Projekt se dělí do čtyř fází; každá končí milníkem a obsahuje jednu či více iterací.

| Fáze | Česky | Cíl | Klíčový milník |
|---|---|---|---|
| **Inception** | Zahájení | vize, rozsah, hrubý odhad nákladů a přínosů, byznys opodstatnění | shoda na rozsahu a životaschopnosti |
| **Elaboration** | Rozpracování | eliminace hlavních rizik a vytvoření **stabilní základní architektury** (spustitelná) | architektura je ověřená a stabilní |
| **Construction** | Konstrukce | hromadný vývoj — naplnění architektury funkčností do beta verze | systém je připraven k nasazení |
| **Transition** | Předání | nasazení u zákazníka, testování v provozu, ladění, školení | produkt akceptován uživateli |

Důležitý rozdíl oproti vodopádu: fáze **nejsou** totéž co disciplíny analýza → návrh → kód → test. Disciplíny probíhají ve *všech* fázích současně, jen s různou intenzitou. Inception není „fáze analýzy" — i v ní se trochu programuje (prototyp), a i v Construction se ještě analyzuje.

## Hump chart — úsilí disciplín v čase

Slavný „hump chart" (graf s hrby) ukazuje právě tento přesun těžiště. Vodorovná osa je čas rozdělený na čtyři fáze (a uvnitř na iterace), svislá osa jsou jednotlivé disciplíny. Plocha pod křivkou každé disciplíny ukazuje, kolik úsilí jí v dané fázi věnujeme — vznikají charakteristické „hrby".

Na začátku (Inception/Elaboration) je velký hrb u **Business Modeling**, **Requirements** a **Analysis & Design**; ve fázi Construction se těžiště přelévá k **Implementation** a **Test**; v Transition dominuje **Deployment**. Žádná disciplína ale nezmizí úplně — všechny běží průběžně, jen různě silně.

::: viz ais-rup-hump "Posouvej čas přes čtyři fáze a sleduj, jak se „hrb" úsilí přelévá mezi disciplínami. Žádná disciplína nikdy neklesne na nulu."
:::

Podpůrné disciplíny (Project Management, Configuration & Change Management, Environment) běží po celou dobu projektu rovnoměrně.

::: quiz "Co znamená, že je RUP „architecture-centric" a proč se architektura ustaluje právě ve fázi Elaboration?"
- [x] Stabilní spustitelná architektura je kostra systému; ověřuje se brzy, aby se na ni dal bezpečně věšet zbytek funkčnosti v Construction.
  > Přesně. Elaboration má za cíl eliminovat architektonická rizika a dodat ověřenou základní architekturu, na které pak Construction staví.
- [ ] Architektura se kreslí celá dopředu ve fázi Inception a už se nemění.
  > To je vodopádové myšlení. UP architekturu vyvíjí iterativně; v Inception je jen hrubá vize.
- [ ] Architekturou se míní výběr programovacího jazyka, který je hlavním milníkem Transition.
  > Architektura je struktura systému (komponenty, vrstvy, klíčová rozhraní), ne volba jazyka, a ustaluje se v Elaboration.
:::

::: quiz "V hump chartu má disciplína Test malý hrb už ve fázi Elaboration, ne až v Construction. Proč?"
- [x] Protože UP je iterativní — každá iterace má vlastní testování; v Elaboration se testuje, zda architektura skutečně funguje.
  > Ano. Testování není závěrečná fáze, ale disciplína běžící ve všech fázích, jen s různou intenzitou.
- [ ] Je to chyba v grafu; testovat lze až po dokončení implementace.
  > Naopak — průběžné testování v každé iteraci je podstatou iterativního přístupu.
- [ ] Protože Elaboration je oficiálně „fáze testování".
  > Fáze nejsou disciplíny. Elaboration je o architektuře a rizicích; testování je disciplína protékající všemi fázemi.
:::

::: link "Kruchten — The Rational Unified Process: An Introduction (přehled fází a disciplín)" "https://www.ibm.com/docs/en/rational-soft-arch/9.7.0?topic=process-rational-unified"
:::

::: link "A Manager's Introduction to the RUP — Scott Ambler (Ambysoft, PDF)" "https://www.ambysoft.com/downloads/managersIntroToRUP.pdf"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: P. Kruchten — The Rational Unified Process, Jacobson/Booch/Rumbaugh — The Unified Software Development Process.*
