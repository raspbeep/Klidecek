---
title: Životní cyklus a MVP
---

Vývoj mobilní aplikace se neliší od softwarového inženýrství obecně tím, *co* dělá, ale tím, do jakých **omezení** musí výsledek zapadnout: hardwarová a verzová fragmentace zařízení, proměnlivá síť, výkonnostní limity a distribuce výhradně přes schvalovací procesy obchodů. Volba metodiky životního cyklu a brzké vymezení rozsahu (MVP) jsou proto první rozhodnutí, která rámují celý projekt.

## Vodopád vs. agile pro mobil

Dva základní modely životního cyklu (SDLC) se liší tím, **kdy** se hodnota dostane k uživatelům a jak snadno se reaguje na změnu zadání.

| Hledisko | Vodopádový model | Agilní přístup |
|---|---|---|
| Průběh | lineární fáze za sebou (analýza → návrh → vývoj → test → nasazení) | iterativní, dodávka po inkrementech (releasech) |
| Zadání | fixní, předem kompletně specifikované | vyvíjí se, práce z prioritizovaného *backlogu* |
| Zpětná vazba | až po dodání celku | po každém releasu / sprintu |
| Vhodné, když | rozsah je přesně daný a aplikace dává smysl jen jako celek, změny se neplánují | trh i požadavky se mění, chceme brzy validovat |

Na mobilu agilní přístup obvykle vyhrává: store distribuce stejně vynucuje sérii verzí (1.0, 1.1, …) a brzká zpětná vazba od reálných uživatelů snižuje riziko, že se postaví aplikace, kterou nikdo nechce. Vodopád má místo tam, kde je zadání smluvně zafixované (např. dodávka na míru s pevnou specifikací).

::: viz tama-vodopad-vs-agile "Posuvníkem posouvej čas projektu. Vodopád dodá použitelnou hodnotu až jedním releasem na konci; agile ji dodává po inkrementech, takže zpětná vazba (a tržby) přicházejí dřív."
:::

## Fáze procesu

Bez ohledu na zvolenou metodiku prochází mobilní projekt typicky těmito fázemi. V agilním pojetí se neprovádějí jen jednou, ale opakovaně v každé iteraci.

### Discovery a validace

Než se napíše řádek kódu, byznys analytik s klientem vymezí **účel, cílovou skupinu a případy užití** (use-cases). Klíčové je *ověřit poptávku trhu dřív*, než se investuje do vývoje — typicky vstupní stránkou (landing page) s předběžnou registrací, která změří skutečný zájem. Tím se odhalí, zda problém vůbec existuje a zda je o řešení zájem.

### Definice MVP

**MVP** (*Minimum Viable Product*, minimální životaschopný produkt) je verze s nejmenším počtem funkcí, která je už **použitelná** a dokáže přinést **okamžitou zpětnou vazbu** od reálných uživatelů. Pojem pochází z metodiky *Lean Startup* a smyslem je co nejlevněji ověřit hypotézu o produktu, ne dodat „osekanou" verzi cílové aplikace.

Pro rychlé vymezení rozsahu se používají **design sprinty** — časově ohraničený pětidenní formát (mapování problému → skicování řešení → rozhodnutí → prototyp → testování s uživateli), který během jednoho týdne dovede tým od otázky k otestovanému prototypu bez nutnosti cokoli naplno programovat.

::: quiz "Co dělá z verze aplikace MVP?"
- [ ] Že obsahuje všechny plánované funkce, jen v základní kvalitě.
  > To je spíš beta. MVP záměrně neobsahuje většinu funkcí.
- [x] Že je s minimem funkcí už použitelná a umožní změřit reálný zájem a získat zpětnou vazbu.
  > Přesně. MVP je nejlevnější způsob, jak ověřit hypotézu o produktu na skutečných uživatelích.
- [ ] Že je to neveřejný prototyp jen pro interní testování.
  > Prototyp se netestuje na reálné poptávce. MVP se vydává uživatelům právě kvůli zpětné vazbě.
:::

### Návrh UX a UI

Designéři oddělují **UX** (architekturu uživatelské zkušenosti — toky, struktura, navigace) od **UI** (vizuální vzhled). Artefakty rostou v přesnosti:

* **Wireframy** (drátěné modely) — rozložení obrazovek bez grafiky, řeší informační strukturu.
* **Interaktivní prototypy** — proklikatelný model (např. ve Figmě) pro uživatelské testování ještě před vývojem.
* **Design manuál** — vizuální standardy (barvy, typografie, komponenty), aby výsledek byl konzistentní.

::: svg "Rostoucí přesnost designových artefaktů — od struktury k pixelům"
<svg viewBox="0 0 520 130" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="24" width="150" height="90" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="89" y="18" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Wireframe</text>
  <rect x="28" y="38" width="122" height="12" rx="2" fill="var(--bg-inset)" stroke="var(--line)"/>
  <rect x="28" y="56" width="80" height="40" rx="2" fill="var(--bg-inset)" stroke="var(--line)"/>
  <rect x="116" y="56" width="34" height="40" rx="2" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="89" y="108" text-anchor="middle" font-size="9" fill="var(--text-faint)">struktura, bez grafiky</text>

  <rect x="186" y="24" width="150" height="90" rx="6" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)"/>
  <text x="261" y="18" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Prototyp</text>
  <rect x="200" y="38" width="122" height="12" rx="2" fill="oklch(0.62 0.14 264 / 0.18)"/>
  <rect x="200" y="56" width="122" height="40" rx="2" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)"/>
  <circle cx="305" cy="88" r="6" fill="oklch(0.62 0.14 264)"/>
  <text x="261" y="108" text-anchor="middle" font-size="9" fill="var(--text-faint)">proklikatelný, testovatelný</text>

  <rect x="358" y="24" width="150" height="90" rx="6" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
  <text x="433" y="18" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Design manuál</text>
  <circle cx="378" cy="44" r="6" fill="oklch(0.6 0.16 22)"/>
  <circle cx="396" cy="44" r="6" fill="oklch(0.62 0.14 264)"/>
  <circle cx="414" cy="44" r="6" fill="oklch(0.6 0.14 142)"/>
  <rect x="372" y="58" width="124" height="10" rx="2" fill="oklch(0.6 0.14 142 / 0.25)"/>
  <rect x="372" y="74" width="90" height="8" rx="2" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="433" y="108" text-anchor="middle" font-size="9" fill="var(--text-faint)">vizuální standardy</text>

  <path d="M164 69 L186 69 M336 69 L358 69" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#ar)"/>
  <defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/></marker></defs>
</svg>
:::

### Návrh architektury a vývoj

Solution architekt volí technologický přístup (viz [[technologicke-pristupy]]), navrhuje **API rozhraní** a strukturu backendu. Důležitým ohledem je eliminace **vendor lock-in** — závislosti na jednom dodavateli (cloudu, knihovně, BaaS platformě), z níž by byl pozdější odchod drahý. Volí se proto raději otevřené standardy a abstrakce nad konkrétními službami.

Kód se dělí na dvě vrstvy:

* **frontend** — uživatelská strana aplikace běžící na zařízení,
* **backend** — serverová logika, autentizace a databáze.

### Testování, nasazení a údržba

Testuje se **bezpečnost, výkon a funkčnost** napříč mnoha verzemi OS a třídami zařízení (fragmentace). Aplikace se nasazuje do obchodů (viz [[devops-distribuce]]) a dlouhodobě udržuje, aby fungovala i na nových verzích operačních systémů — bez údržby aplikace „shnije", protože platforma se mění pod ní.

::: link "GV — The Design Sprint (Jake Knapp, Google Ventures)" "https://www.gv.com/sprint/"
:::

::: link "Wikipedia — Minimum viable product" "https://en.wikipedia.org/wiki/Minimum_viable_product"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Knapp et al. „Sprint" (Google Ventures), Ries „The Lean Startup", Wikipedia (Design sprint, MVP, Software development process).*
