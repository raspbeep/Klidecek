---
title: Mobilní formuláře
---

Formulář je na mobilu jedním z nejnáročnějších míst rozhraní: kombinuje pomalé psaní, malou plochu a vysunutou klávesnici, která zakryje půl obrazovky. Dobrý mobilní formulář proto minimalizuje počet polí i nutné psaní (viz minimalizace vstupu v [[principy-navrhu]]) a každé pole navrhuje tak, aby zůstalo srozumitelné i ve chvíli, kdy je dole klávesnice.

## Jednosloupcový layout

Pole se na mobilu řadí **zásadně do jednoho svislého sloupce**. Víceslupcové formuláře z desktopu na úzké obrazovce nutí k vodorovnému scrollu nebo mačkají pole do nečitelné šířky a navíc rozbíjejí přirozený svislý průchod (oko → palec → další pole). Jeden sloupec dává jednoznačné pořadí vyplňování a klávesnici „Další" jasný cíl.

## Štítky nad poli, ne placeholdery

Štítek (*label*) se umisťuje **nad vstupní pole**, ne vlevo a ne jen dovnitř jako zástupný text. Důvod je čistě mobilní: jakmile se zespodu vysune **softwarová klávesnice**, zakryje spodní polovinu obrazovky — štítek nad polem zůstane viditelný, kdežto štítek vedle pole nebo pod ním zmizí.

::: viz tama-form-keyboard "Přepni klávesnici nahoru/dolů a změň input type. Label nad polem zůstává vidět i při psaní; placeholder po začátku psaní zmizí a kontext se ztratí. Typ pole navíc mění vyvolanou klávesnici."
:::

**Placeholder není label.** Zástupný text uvnitř pole **zmizí, jakmile uživatel začne psát**. Uživatel pak ztratí kontext (co do pole vlastně patří) a musí spoléhat na krátkodobou paměť, aby ověřil, zda vyplnil správné pole. Placeholder se proto hodí nanejvýš jako **příklad formátu** („např. jan@example.com") nad rámec viditelného štítku, nikdy jako jeho náhrada.

## Správná klávesnice pro kontext

Mobil dokáže podle typu pole zobrazit **upravenou klávesnici**. V (mobilním) webu to řídí HTML5 atribut `type` (a doplňkově `inputmode`):

```html
<label for="mail">E-mail</label>
<input id="mail" type="email" autocomplete="email">

<label for="tel">Telefon</label>
<input id="tel" type="tel" autocomplete="tel">

<label for="psc">PSČ</label>
<input id="psc" inputmode="numeric" pattern="[0-9]*">
```

* `type="email"` → klávesnice s viditelným **@** a **.**,
* `type="tel"` → **numerická telefonní** klávesnice (číselník),
* `inputmode="numeric"` → číselná klávesnice i tam, kde sémanticky nejde o telefon (PSČ, kód).

Správný typ šetří uživateli přepínání mezi vrstvami klávesnice a snižuje chybovost. Atribut `autocomplete` navíc umožní prohlížeči pole předvyplnit.

## Eliminace dělených polí a masky

Oproti desktopu se pole na mobilu **nedělí**. Místo odděleného křestního jména a příjmení, nebo telefonního čísla rozsekaného do tří okének, se používá **jediné pole**. Méně polí = méně klepnutí, méně přeskoků fokusu a méně chyb.

Pro vizuální kontrolu dlouhých hodnot pomáhá **maska** — automatické formátování mezerami či pomlčkami během psaní (`+420 777 123 456`, `1234 5678 9012 3456`). Maska zlepší čitelnost, aniž by uživatel musel oddělovače psát ručně; výslednou hodnotu aplikace před odesláním normalizuje.

## Dynamická inline validace

Chyby se **nesmí** hromadit do textu na vrcholu stránky až po stisku „Odeslat" — na mobilu by uživatel musel scrollovat zpět polí nahoru a hádat, které pole text zmiňuje. Validace má probíhat **inline**, tedy **dynamicky u konkrétního pole** ihned poté, co ho uživatel opustí (nebo během psaní u zjevně chybného vstupu).

Chybová zpráva musí být **dobře čitelná** a **nesmí spoléhat pouze na barvu**. Červené orámování samo o sobě je nedostupné pro uživatele s poruchou barvocitu (a neviditelné, když pole zakrývá prst). Proto se barva **doplňuje ikonou a textem**, který říká, *co* je špatně a *jak to napravit* — ne jen „chyba", ale „E-mail musí obsahovat @".

::: svg "Inline validace u pole: ikona + text, ne jen červená barva. Vlevo neplatné, vpravo platné."
<svg viewBox="0 0 540 150" xmlns="http://www.w3.org/2000/svg">
  <!-- chybné -->
  <text x="36" y="24" font-size="11" font-weight="600" fill="var(--text)">E-mail</text>
  <rect x="36" y="30" width="210" height="30" rx="5" fill="var(--bg-inset)" stroke="oklch(0.6 0.19 25)" stroke-width="1.6"/>
  <text x="46" y="49" font-size="11" font-family="var(--font-mono)" fill="var(--text)">jan.example.com</text>
  <circle cx="262" cy="45" r="9" fill="oklch(0.6 0.19 25)"/>
  <text x="262" y="49" text-anchor="middle" font-size="12" font-weight="700" fill="var(--bg-card)">!</text>
  <text x="36" y="80" font-size="10" fill="oklch(0.6 0.19 25)">⚠ E-mail musí obsahovat znak @</text>
  <!-- platné -->
  <text x="300" y="24" font-size="11" font-weight="600" fill="var(--text)">E-mail</text>
  <rect x="300" y="30" width="210" height="30" rx="5" fill="var(--bg-inset)" stroke="oklch(0.6 0.15 150)" stroke-width="1.6"/>
  <text x="310" y="49" font-size="11" font-family="var(--font-mono)" fill="var(--text)">jan@example.com</text>
  <circle cx="526" cy="45" r="9" fill="oklch(0.6 0.15 150)"/>
  <path d="M 522 45 l 3 3 l 5 -6" fill="none" stroke="var(--bg-card)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="300" y="80" font-size="10" fill="oklch(0.5 0.15 150)">✓ formát v pořádku</text>
</svg>
:::

::: quiz "Proč štítek nad polem, a ne placeholder uvnitř pole, ani štítek vedle pole?"
- [x] Placeholder po začátku psaní zmizí a štítek vedle pole zakryje vysunutá klávesnice — štítek nad polem zůstává viditelný po celou dobu.
  > Přesně. Mobilní klávesnice zabere spodní část obrazovky; jen štítek nad polem přežije začátek psaní i vysunutou klávesnici, takže uživatel pořád ví, co vyplňuje.
- [ ] Placeholder je zakázán ve specifikaci HTML5.
  > Placeholder je platný; jen sémanticky nenahrazuje label, protože při psaní mizí.
- [ ] Štítek nad polem se rychleji načítá.
  > Důvod je v použitelnosti (viditelnost při psaní), ne ve výkonu.
:::

::: link "MDN — <input type=\"tel\"> a mobilní klávesnice" "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel"
:::

::: link "NN/g — Placeholders in Form Fields Are Harmful" "https://www.nngroup.com/articles/form-design-placeholders/"
:::

::: link "MDN — inputmode global attribute" "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: MDN Web Docs, Nielsen Norman Group.*
