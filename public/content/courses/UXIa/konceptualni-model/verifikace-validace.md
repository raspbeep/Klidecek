---
title: Verifikace a validace (V&V)
---

**Testování** je proces měření kvality softwaru: hledá chyby a zjišťuje, zda systém produkuje očekávané výsledky. Aby měla kontrola kvality smysl už nad konceptuálním modelem (ne až nad hotovým kódem), je nutné důsledně rozlišovat dva odlišné procesy — **verifikaci** a **validaci** (souhrnně *V&V*). Pletou se snadno, protože obojí „ověřuje", ale ptají se na úplně jinou otázku.

Klasické rozlišení pochází od B. Boehma: **verifikace** se ptá *„Děláme produkt správně?"* (Are we building the product right?), zatímco **validace** se ptá *„Děláme správný produkt?"* (Are we building the right product?). První kontroluje shodu se zadáním, druhá shodu se skutečnou potřebou.

::: svg "Dvě různé otázky: verifikace vs. validace"
<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg">
  <rect x="16" y="20" width="230" height="132" rx="8" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.6 0.14 264)" strokeWidth="1.5"/>
  <text x="131" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">VERIFIKACE</text>
  <text x="131" y="64" textAnchor="middle" fontSize="12" fontStyle="italic" fill="var(--text-muted)">„Děláme produkt správně?"</text>
  <text x="131" y="90" textAnchor="middle" fontSize="11.5" fill="var(--text)">shoda se zadáním a modely</text>
  <text x="131" y="112" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="oklch(0.55 0.14 264)">STATICKÁ</text>
  <text x="131" y="130" textAnchor="middle" fontSize="11" fill="var(--text-faint)">nespouští se kód</text>
  <rect x="274" y="20" width="230" height="132" rx="8" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.55 0.14 142)" strokeWidth="1.5"/>
  <text x="389" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">VALIDACE</text>
  <text x="389" y="64" textAnchor="middle" fontSize="12" fontStyle="italic" fill="var(--text-muted)">„Děláme správný produkt?"</text>
  <text x="389" y="90" textAnchor="middle" fontSize="11.5" fill="var(--text)">shoda s potřebou uživatele</text>
  <text x="389" y="112" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="oklch(0.5 0.14 142)">DYNAMICKÁ</text>
  <text x="389" y="130" textAnchor="middle" fontSize="11" fill="var(--text-faint)">spouští se kód / scénáře</text>
</svg>
:::

## Verifikace — statické ověření návrhu

Verifikace zkoumá soulad s **formálními specifikacemi a modely**. Je to primárně **statický** proces: nevyžaduje spuštění kódu, protože pracuje s artefakty (dokumentací, diagramy, specifikací). Typické techniky:

* **revize a inspekce** dokumentace a UML diagramů (např. strukturovaná Faganova inspekce),
* **kontroly konzistence** — že jména v datovém slovníku, v diagramu tříd a v sekvenčních diagramech sedí dohromady,
* **formální matematické důkazy** korektnosti tam, kde je to opodstatněné.

Klíčový bod pro zkoušku: verifikací lze odhalit chybu **dřív, než vznikne kód** — třeba nekonzistentní doménový model. To je její hlavní hodnota.

## Validace — dynamické ověření účelu

Validace zkoumá shodu se **skutečnými potřebami, mentálními modely a očekáváními uživatelů**. Je to **dynamický** proces — zahrnuje skutečné spouštění systému podle uživatelských scénářů:

* **black-box** testy (ověřují chování proti specifikaci, bez znalosti vnitřku),
* **white-box** testy (využívají znalost vnitřní struktury, např. pokrytí větví),
* **uživatelské akceptační testy (UAT)** — zákazník/uživatel potvrdí, že systém řeší jeho problém.

Pozor na záludnost: systém může projít *všemi* verifikačními kontrolami (přesně splňuje zadání) a přitom selhat ve validaci — protože *zadání samo bylo špatné*. Proto se obě V potřebují navzájem.

::: viz uxi-vv-klasifikace "Klikněte na QA aktivitu a uvidíte, zda jde o verifikaci (statickou) nebo validaci (dynamickou) a proč."
:::

## Funkční vs. nefunkční testy

Podle toho, *co* se ověřuje, dělíme testy na dvě skupiny:

| Druh | Co ověřuje | Příklady |
|------|------------|----------|
| **Funkční** | požadavky zákazníka — *co* systém dělá | správnost výpočtu, validace formuláře, business pravidlo |
| **Nefunkční** | vlastnosti *jak* systém funguje | zátěžové (výkon), bezpečnostní, testy obnovy, použitelnost |

## Úrovně funkčních testů

Funkční testy se provádějí ve třech úrovních podle velikosti zkoušené části — od nejmenší jednotky až po celek. Tradičně se zobrazují jako **pyramida**: nejvíc rychlých a levných unit testů dole, nejméně drahých systémových nahoře.

::: svg "Pyramida úrovní funkčních testů — od jednotky k celému systému"
<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="210,18 300,80 120,80" fill="oklch(0.6 0.16 22 / 0.18)" stroke="oklch(0.58 0.16 22)" strokeWidth="1.3"/>
  <polygon points="120,82 300,82 350,140 70,140" fill="oklch(0.62 0.15 80 / 0.18)" stroke="oklch(0.58 0.15 80)" strokeWidth="1.3"/>
  <polygon points="70,142 350,142 392,196 28,196" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.55 0.14 142)" strokeWidth="1.3"/>
  <text x="210" y="62" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--text)">Systémové</text>
  <text x="210" y="116" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--text)">Integrační</text>
  <text x="210" y="176" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--text)">Unit (jednotkové)</text>
  <text x="305" y="50" fontSize="10.5" fill="var(--text-muted)">celý systém</text>
  <text x="356" y="120" fontSize="10.5" fill="var(--text-muted)">spolupráce tříd</text>
  <text x="398" y="176" textAnchor="end" fontSize="10.5" fill="var(--text-muted)">nejmenší části kódu</text>
</svg>
:::

* **Unit (jednotkové) testy** — ověřují nejmenší izolovanou část kódu (metodu, funkci, třídu); rychlé, jich je nejvíc.
* **Integrační testy** — ověřují *spolupráci* více tříd/modulů a jejich rozhraní.
* **Systémové testy** — ověřují celý sestavený systém jako celek proti požadavkům.

::: quiz "Tým má 100% pokrytí unit testy, všechny zelené, a kód přesně odpovídá specifikaci. Uživatel přesto říká: ‚tohle nepotřebuju'. Co selhalo?"
- [x] Validace — produkt je sice postaven *správně dle zadání*, ale není to *správný produkt* pro potřebu uživatele.
  > Ano. Zelené unit testy a shoda se specifikací jsou verifikace. To, že specifikace neodpovídala skutečné potřebě, odhalí jen validace (UAT, testy podle reálných scénářů).
- [ ] Verifikace — testy zjevně netestovaly to, co měly.
  > Verifikace prošla: kód odpovídá zadání. Problém je o úroveň výš — chyba je v zadání, ne v jeho naplnění.
- [ ] Nic, 100% pokrytí znamená bezchybný produkt.
  > Pokrytí měří jen *kolik kódu* testy projdou, ne zda kód řeší správný problém. To je rozdíl mezi verifikací a validací.
:::

::: link "Software verification and validation — přehled (Wikipedia)" "https://en.wikipedia.org/wiki/Software_verification_and_validation"
:::

::: link "ISTQB Glossary — verification, validation, test levels" "https://glossary.istqb.org/"
:::

---

*Zdroj: SZZ NADE — předmět UXIa (User Experience a návrh uživatelských rozhraní), VUT FIT. Externí reference: B. Boehm (1979) — Software Engineering Economics, ISTQB Glossary, IEEE 1012 (V&V).*
