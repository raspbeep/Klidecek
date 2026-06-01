---
title: Prototypování a žebříček věrnosti
---

V raných fázích návrhu — ještě než se napíše produkční kód — je nejlevnější způsob, jak ověřit konceptuální model, **experimentální prototypování**. Smyslem je otestovat hypotézu o návrhu na uživateli za pár hodin, ne za pár týdnů. Prototyp je *záměrně neúplný*: zahodí se, jakmile splní svůj úkol.

## Design Thinking jako rámec

Prototypování zapadá do iterativní metodiky **Design Thinking**, která se obvykle popisuje pěti fázemi. Nejde o lineární průchod — fáze se opakují a tým se mezi nimi vrací podle toho, co se dozví od uživatelů.

::: svg "Pět fází Design Thinking — iterativní, ne lineární cyklus"
<svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="dtArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)"/>
    </marker>
  </defs>
  <g fontSize="12" fontWeight="600" textAnchor="middle">
    <circle cx="55" cy="60" r="34" fill="oklch(0.62 0.14 264 / 0.14)" stroke="oklch(0.6 0.14 264)" strokeWidth="1.4"/>
    <text x="55" y="58" fill="var(--text)">Vcítění</text>
    <text x="55" y="74" fontSize="9.5" fontWeight="400" fill="var(--text-muted)">empathize</text>
    <circle cx="155" cy="60" r="34" fill="oklch(0.62 0.14 200 / 0.14)" stroke="oklch(0.58 0.14 200)" strokeWidth="1.4"/>
    <text x="155" y="58" fill="var(--text)">Definice</text>
    <text x="155" y="74" fontSize="9.5" fontWeight="400" fill="var(--text-muted)">define</text>
    <circle cx="255" cy="60" r="34" fill="oklch(0.62 0.15 142 / 0.14)" stroke="oklch(0.55 0.15 142)" strokeWidth="1.4"/>
    <text x="255" y="58" fill="var(--text)">Nápady</text>
    <text x="255" y="74" fontSize="9.5" fontWeight="400" fill="var(--text-muted)">ideate</text>
    <circle cx="355" cy="60" r="34" fill="oklch(0.62 0.15 80 / 0.14)" stroke="oklch(0.55 0.15 80)" strokeWidth="1.4"/>
    <text x="355" y="58" fill="var(--text)">Prototyp</text>
    <text x="355" y="74" fontSize="9.5" fontWeight="400" fill="var(--text-muted)">prototype</text>
    <circle cx="455" cy="60" r="34" fill="oklch(0.6 0.16 22 / 0.14)" stroke="oklch(0.58 0.16 22)" strokeWidth="1.4"/>
    <text x="455" y="58" fill="var(--text)">Test</text>
    <text x="455" y="74" fontSize="9.5" fontWeight="400" fill="var(--text-muted)">test</text>
  </g>
  <g stroke="var(--line-strong)" strokeWidth="1.3" markerEnd="url(#dtArr)">
    <line x1="91" y1="60" x2="119" y2="60"/>
    <line x1="191" y1="60" x2="219" y2="60"/>
    <line x1="291" y1="60" x2="319" y2="60"/>
    <line x1="391" y1="60" x2="419" y2="60"/>
  </g>
  <path d="M 455 96 Q 255 138 55 96" fill="none" stroke="var(--line-strong)" strokeWidth="1.2" strokeDasharray="4 4" markerEnd="url(#dtArr)"/>
  <text x="255" y="136" textAnchor="middle" fontSize="10.5" fontStyle="italic" fill="var(--text-faint)">poznatky z testu → zpět k vcítění/definici</text>
</svg>
:::

## Žebříček věrnosti (Fidelity Ladder)

K ověřování hypotéz slouží **žebříček věrnosti** — škála, jak moc se prototyp blíží hotovému produktu. Platí zásadní kompromis: čím nižší věrnost, tím **levnější** prototyp a tím **upřímnější** kritika; čím vyšší věrnost, tím **realističtější** reakce uživatele, ale i vyšší náklady a riziko, že se uživatel bojí kritizovat „hotovou" věc.

::: viz uxi-fidelity-ladder "Posuňte se po žebříčku věrnosti a sledujte, jak roste realismus a náklady, ale klesá ochota uživatele k upřímné kritice."
:::

* **Low-fidelity** (papírové wireframy, skici) — velmi nízké náklady. Slouží k ověření základní **navigace a struktury** a k rychlé eliminaci chybných koncepčních předpokladů. Právě díky „nedokonalému" vzhledu uživatelé snáz dají **upřímnou kritiku** — papír nevypadá jako něco, co by je mrzelo rozcupovat.
* **High-fidelity** (klikatelné interaktivní modely) — testují **reálné behaviorální reakce** a odhalují nesoulad s mentálními modely uživatele při procházení scénářů. Vypadají skoro jako hotová aplikace, takže reakce jsou realistické, ale dají se vyrobit až později a dráž.

::: quiz "Proč se na začátek návrhu doporučuje papírový (low-fi) prototyp, a ne rovnou pěkný klikací high-fi model?"
- [x] Levný a „ošklivý" prototyp svádí uživatele k upřímné kritice a umožní rychle zahodit špatný směr, než se do něj investuje.
  > Ano. U vyleštěného high-fi modelu uživatelé tuší vynaloženou práci a kritizují opatrněji; navíc je dražší ho přepracovat. Low-fi maximalizuje rychlost učení na jednotku nákladů.
- [ ] Papírový prototyp testuje výkon a škálování lépe než klikací model.
  > Výkon ani škálování papír netestuje vůbec — to je doména Proof of Concept. Low-fi ověřuje navigaci a strukturu.
- [ ] High-fi prototypy nelze uživatelsky testovat.
  > Lze, a dokonce dávají realističtější behaviorální data. Důvod pro low-fi na začátku je cena a upřímnost zpětné vazby, ne nemožnost testu.
:::

## Validace zájmu a proveditelnosti bez plného kódu

Žebříček věrnosti ověřuje *použitelnost* návrhu. Jiné techniky ověřují, jestli má smysl vůbec stavět — a každá cílí na jinou hypotézu:

| Technika | Co validuje | Jak |
|----------|-------------|-----|
| **Wizard of Oz** | zájem / chování při „funkčním" produktu | backend dělá skrytě člověk, uživatel **netuší**, že nejde o automat |
| **Concierge MVP** | zájem a potřebu při osobní obsluze | hodnotu doručuje **viditelně** člověk (uživatel ví, že je obsluhován ručně) |
| **Proof of Concept (PoC)** | technickou **proveditelnost** | kód napsaný jen k ověření, že to *technicky* jde (výkon algoritmu apod.) |
| **MVP** (Minimum Viable Product) | životaschopnost na trhu | první verze řešící **jeden** klíčový problém, sbírá ranou zpětnou vazbu |

Důležitý rozdíl, který zkoušející rád prověří: **Wizard of Oz vs. Concierge** se liší *vědomím uživatele*. U Wizard of Oz uživatel věří, že komunikuje s plně funkčním systémem (data jsou proto méně zkreslená a měří se přirozené chování); u Concierge uživatel ví, že mu pomáhá člověk (vnáší to sociální zkreslení, ale je to skvělé pro objevné zkoumání, když ještě nevíme, jak má řešení vypadat).

A pozor na další běžnou záměnu: **PoC ověřuje technickou proveditelnost** („dá se to postavit?"), zatímco **MVP ověřuje hodnotu na trhu** („chce to někdo?"). PoC se zpravidla nedostane k uživatelům, MVP ano.

::: link "IxDF — The 5 Stages in the Design Thinking Process" "https://www.interaction-design.org/literature/article/5-stages-in-the-design-thinking-process"
:::

::: link "Wizard of Oz vs. Concierge testing (Kromatic)" "https://kromatic.com/blog/concierge-vs-wizard-of-oz-test/"
:::

::: link "Nielsen Norman Group — Paper Prototyping" "https://www.nngroup.com/articles/paper-prototyping/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=OlbdIXLunt4" "Paper Prototyping: How to Create & Usability-Test Simple UI Prototypes (40 min tutorial)" "NNgroup"
:::

*Zdroj: SZZ NADE — předmět UXIa (User Experience a návrh uživatelských rozhraní), VUT FIT. Externí reference: Stanford d.school / IxDF (Design Thinking), Nielsen Norman Group, E. Ries — The Lean Startup (MVP).*
