---
title: Refaktorizace
---

**Refaktorizace** je úprava vnitřní struktury zdrojového kódu tak, aby se **nezměnilo jeho vnější chování**, ale kód se stal srozumitelnějším a snadněji modifikovatelným. To je celá podstata: refaktorizace *není* psaní nové funkcionality ani oprava chyby — je to disciplinovaná restrukturalizace už fungujícího kódu při zachování pozorovatelného chování.

Cílem je zlepšit návrh: zkrátit dlouhé metody a velké třídy, odstranit duplicity a nepřehledné konstrukce, zpřesnit pojmenování. Lépe strukturovaný kód se snáz udržuje, snáz se v něm hledají chyby a další vývoj je rychlejší, protože vývojáři tráví méně času luštěním zamotaných pasáží.

## Code smells — kde refaktorovat

Refaktorizace se nedělá náhodně. Spouští ji **„pach v kódu"** (*code smell*) — viditelný symptom, který naznačuje hlubší problém v návrhu. Pach sám o sobě není chyba; kód funguje, ale jeho struktura volá po zlepšení. Katalog pachů a k nim příslušných refaktorizačních „tahů" zavedl Martin Fowler.

| Code smell | Symptom | Typická refaktorizace |
|---|---|---|
| Dlouhá metoda | metoda dělá příliš mnoho věcí najednou | *Extract Method* (vytknout část do nové metody) |
| Duplicitní kód | stejná logika na více místech | vytknout do sdílené metody/třídy |
| Velká třída | jedna třída drží příliš mnoho zodpovědností | *Extract Class*, rozdělit zodpovědnosti |
| Dlouhý seznam parametrů | volání s mnoha argumenty | seskupit parametry do objektu |
| Feature envy | metoda sahá hlavně do dat cizí třídy | *Move Method* k té druhé třídě |

## Malé kroky + sada testů

Bezpečnost refaktorizace stojí na dvou pilířích. Za prvé se mění kód **po malých krocích** — každá úprava je tak drobná, že je zřejmá a snadno se ověří. Když se po malém kroku něco rozbije, příčina je zjevná; po jedné velké „přestavbě" se chyba hledá těžko.

Druhým pilířem je **kvalitní sada automatizovaných testů**. Po každém kroku se spustí a potvrdí, že vnější chování zůstalo nezměněné. Bez testů refaktorizace přechází v hazard — nelze totiž odlišit úspěšnou restrukturalizaci od tiše zanesené regrese. Odtud silná provázanost s [[tdd]]: regresní sada testů z TDD je přesně to, co refaktorizaci dělá bezpečnou.

```java
// PŘED — dlouhá metoda míchá výpočet a formátování
double cenaSDani(Objednavka o) {
    double soucet = 0;
    for (Polozka p : o.polozky()) soucet += p.cena() * p.pocet();
    double dan = soucet * 0.21;
    return soucet + dan;
}

// PO — Extract Method, chování beze změny, testy zůstávají zelené
double cenaSDani(Objednavka o) {
    double zaklad = mezisoucet(o);
    return zaklad + dan(zaklad);
}
double mezisoucet(Objednavka o) {
    return o.polozky().stream().mapToDouble(p -> p.cena() * p.pocet()).sum();
}
double dan(double zaklad) { return zaklad * 0.21; }
```

## Princip dvou klobouků

Aby zůstala definice čistá, dodržuje se **princip dvou klobouků** (*two hats*, Martin Fowler): vývojář má vždy nasazený právě jeden klobouk. Buď **přidává funkci** — mění chování, ale nepřeorganizovává strukturu — nebo **refaktoruje** — mění strukturu, ale nepřidává chování. Tyto dvě činnosti se nesmí míchat v jedné úpravě.

::: viz ais-two-hats "Přepni klobouk. Vždy je nasazený právě jeden — režim určuje, co je dovoleno měnit."
:::

Důvod je praktický. Když se obojí míchá, nelze už říct, co konkrétní změna dělá: rozbil se test kvůli novému chování, nebo kvůli zpackané restrukturalizaci? Oddělení klobouků udržuje každý commit pochopitelný a každou regresi dohledatelnou. Klobouky se během práce přepínají často — typicky se chvíli refaktoruje, aby kód dobře „seděl" pro novou funkci, pak se přepne klobouk a funkce se přidá.

## Pravidlo tří — kdy refaktorovat duplicitu

Kdy je duplicita ještě snesitelná a kdy už volá po vytknutí? Odpověď dává **pravidlo tří**: poprvé něco prostě napíšeš; podruhé se nad duplicitou ušklíbneš, ale zopakuješ ji; **při třetím výskytu** stejného vzoru je čas refaktorovat a vytknout sdílený kód.

Dva výskyty totiž ještě nemusí znamenat skutečnou duplicitu — můžou se časem rozejít a předčasné sjednocení by vytvořilo špatnou abstrakci. Tři výskyty jsou silnější signál, že jde o opravdu společný vzor. Vedle pravidla tří se refaktoruje také **před přidáním nové funkce** (aby pro ni byl kód připravený) a **při opravě chyby** (jako součást úklidu kolem opravy).

::: quiz "Co znamená, že refaktorizace „nemění vnější chování"?"
- [x] Mění se vnitřní struktura kódu, ale pozorovatelné chování (vstupy → výstupy, API) zůstává stejné.
  > Ano. Proto je nutná sada testů — potvrzuje, že chování po restrukturalizaci nezměnilo. Nová funkce ani oprava chyby nejsou refaktorizace.
- [ ] Že se nesmí měnit žádný kód, jen komentáře.
  > Refaktorizace mění strukturu kódu (přejmenování, vytýkání metod). Beze změny zůstává jen *vnější chování*, ne kód sám.
- [ ] Že se přitom zároveň přidává nová funkcionalita.
  > To by porušilo princip dvou klobouků. Přidávání funkce je samostatná činnost, ne refaktorizace.
:::

::: link "Martin Fowler — Refactoring (bliki)" "https://martinfowler.com/bliki/Refactoring.html"
:::

::: link "Refactoring.Guru — katalog code smells" "https://refactoring.guru/refactoring/smells"
:::

::: link "Martin Fowler — Rule of Three (Refactoring, kap. 2)" "https://martinfowler.com/books/refactoring.html"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Martin Fowler (Refactoring: Improving the Design of Existing Code), Refactoring.Guru.*
