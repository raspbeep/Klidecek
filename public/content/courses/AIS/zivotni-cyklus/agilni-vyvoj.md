---
title: Agilní vývoj — Scrum a Kanban
---

Agilní vývoj není jedna konkrétní metodika, ale rodina přístupů sdílejících společnou **filozofii** zachycenou v *Agilním manifestu* (2001). Jejím těžištěm je pružnost: dodávat hodnotu po malých krocích, krátké zpětnovazební smyčky a ochotu měnit plán podle nově pochopené reality. Zákazník je ideálně součástí týmu.

## Agilní manifest — čtyři hodnoty

Manifest staví čtyři dvojice proti sobě a říká: *ceníme si položek vlevo více, i když položky vpravo mají také hodnotu.*

| Ceníme si více… | …než |
|---|---|
| **Jednotlivců a interakcí** | procesů a nástrojů |
| **Fungujícího softwaru** | obsáhlé dokumentace |
| **Spolupráce se zákazníkem** | vyjednávání o smlouvě |
| **Reakce na změnu** | dodržování plánu |

Pointa není „dokumentace je zbytečná", ale priorita: když dojde na kompromis, vyhrává levá strana. Z manifestu vychází řada rámců; nejrozšířenější jsou Scrum a Kanban.

## Scrum — práce v sprintech

Scrum organizuje práci do krátkých, časově ohraničených iterací zvaných **sprinty** (obvykle 1–4 týdny, vždy maximálně jeden měsíc, konstantní délka). Cílem každého sprintu je dodat použitelný přírůstek produktu (*Increment*).

**Role (accountabilities):**

* **Product Owner** — odpovídá za *maximalizaci hodnoty* produktu. Spravuje a prioritizuje **Product Backlog** (uspořádaný seznam všeho, co je třeba udělat). Rozhoduje *co* a *v jakém pořadí*.
* **Scrum Master** — odpovídá za to, že tým funguje podle Scrumu. Odstraňuje překážky (impediments), kouči samoorganizaci, facilituje události. Není to klasický manažer ani „šéf".
* **Vývojáři (Developers)** — tým, který sprint plánuje a dodává přírůstek; *jak* se práce udělá, je na nich.

**Události a artefakty:**

* **Sprint Planning** — výběr položek z backlogu do **Sprint Backlogu** a stanovení cíle sprintu.
* **Daily Scrum** — 15minutová denní synchronizace vývojářů; kontroluje pokrok k cíli sprintu a upravuje plán na další den. Není to statusový report manažerovi.
* **Sprint Review** — ukázka přírůstku zainteresovaným stranám, zpětná vazba.
* **Sprint Retrospective** — jak zlepšit *způsob práce* týmu.

::: svg "Scrumový cyklus — z Product Backlogu se vybírá do sprintu, denní synchronizace, na konci přírůstek a zpětná vazba"
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="520" height="200" fill="var(--bg-inset)" rx="6"/>
  <!-- product backlog -->
  <rect x="18" y="55" width="92" height="100" rx="5" fill="oklch(0.62 0.14 264 / 0.14)" stroke="oklch(0.62 0.14 264)"/>
  <text x="64" y="48" text-anchor="middle" font-size="11" fill="var(--text)">Product Backlog</text>
  <g font-size="9" fill="var(--text-muted)" font-family="var(--font-mono)">
    <rect x="26" y="64" width="76" height="12" rx="2" fill="oklch(0.62 0.14 264 / 0.25)"/><text x="30" y="73">item · prio 1</text>
    <rect x="26" y="80" width="76" height="12" rx="2" fill="oklch(0.62 0.14 264 / 0.18)"/><text x="30" y="89">item · prio 2</text>
    <rect x="26" y="96" width="76" height="12" rx="2" fill="oklch(0.62 0.14 264 / 0.12)"/><text x="30" y="105">item · prio 3</text>
    <rect x="26" y="112" width="76" height="12" rx="2" fill="oklch(0.62 0.14 264 / 0.10)"/><text x="30" y="121">item · prio 4</text>
  </g>
  <!-- arrow planning -->
  <path d="M114,90 L150,90" stroke="var(--text-muted)" stroke-width="1.4" fill="none" marker-end="url(#sca)"/>
  <text x="132" y="82" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">planning</text>
  <!-- sprint circle -->
  <circle cx="260" cy="100" r="64" fill="none" stroke="oklch(0.62 0.14 142)" stroke-width="2" stroke-dasharray="4 4"/>
  <path d="M324,100 a64,64 0 1 1 -1,-5" fill="none" stroke="oklch(0.62 0.14 142)" stroke-width="0" />
  <text x="260" y="58" text-anchor="middle" font-size="11" fill="var(--text)">Sprint (1–4 týdny)</text>
  <text x="260" y="100" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">Daily Scrum</text>
  <text x="260" y="114" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">15 min / den</text>
  <!-- recurring arrow -->
  <path d="M214,138 a64,64 0 0 1 -8,-70" fill="none" stroke="oklch(0.6 0.14 142)" stroke-width="1.4" marker-end="url(#scb)"/>
  <!-- increment -->
  <path d="M324,100 L364,100" stroke="var(--text-muted)" stroke-width="1.4" fill="none" marker-end="url(#sca)"/>
  <rect x="368" y="78" width="130" height="44" rx="5" fill="oklch(0.62 0.14 142 / 0.16)" stroke="oklch(0.62 0.14 142)"/>
  <text x="433" y="98" text-anchor="middle" font-size="11" fill="var(--text)">Přírůstek</text>
  <text x="433" y="113" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">(Increment) → review</text>
  <defs>
    <marker id="sca" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/></marker>
    <marker id="scb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.6 0.14 142)"/></marker>
  </defs>
</svg>
:::

## Kanban — plynulý tok a WIP limity

Kanban neorganizuje práci do časových sprintů, ale do **plynulého toku (flow)**: úkoly procházejí kanban tabulí zleva doprava, jak je kapacita uvolní. Tabule má sloupce odpovídající stavům, typicky **To Do / In Progress / Done**.

Jádrem Kanbanu je **WIP limit** (Work In Progress — limit rozpracované práce): pravidlo, že v daném sloupci smí být současně jen omezený počet úkolů (např. „In Progress max 3"). Když je sloupec plný, nelze do něj přidat další úkol — tým musí nejdřív dotáhnout něco rozdělaného. To brání rozmělňování pozornosti, zviditelňuje úzká hrdla (kde se práce hromadí) a zkracuje dobu průchodu úkolu systémem.

::: viz ais-kanban-wip "Posouvej úkoly doprava a sleduj WIP limit. Když je „Rozpracováno" plné (limit 3), nový úkol nelze začít — nejdřív musíš něco dokončit. Změň limit posuvníkem."
:::

| | Scrum | Kanban |
|---|---|---|
| Rytmus | sprinty pevné délky (1–4 týdny) | plynulý tok, bez sprintů |
| Omezení práce | rozsah sprintu (Sprint Backlog) | WIP limit na sloupci |
| Předepsané role | PO, Scrum Master, vývojáři | žádné předepsané role |
| Změna v průběhu | až do dalšího sprintu (sprint chráněn) | kdykoli — vezme se další položka |
| Klíčová metrika | velocity (rychlost na sprint) | lead/cycle time, propustnost |

::: quiz "Co se stane v Kanbanu, když je sloupec „In Progress" s WIP limitem 3 plný a přijde nový úkol?"
- [x] Nový úkol nelze začít; tým musí nejprve dokončit (posunout dál) některou rozpracovanou položku.
  > Přesně to je smysl WIP limitu — tlačí na dokončování, zviditelňuje úzké hrdlo a zkracuje dobu průchodu.
- [ ] Limit se automaticky zvýší na 4, aby se práce nezdržela.
  > Limit je záměrné omezení; jeho překročení popírá celý princip. Zvyšuje se vědomě, ne automaticky.
- [ ] Úkol se zařadí do dalšího sprintu.
  > Kanban sprinty nemá — pracuje s plynulým tokem, ne s časově ohraničenými iteracemi.
:::

::: quiz "Daily Scrum (denní standup) je primárně…"
- [x] 15minutová synchronizace vývojářů ke kontrole pokroku k cíli sprintu a úpravě plánu na další den.
  > Ano — timebox 15 minut, vlastní jej vývojáři, slouží k inspekci a adaptaci, ne k reportování nahoru.
- [ ] Statusový report pro Scrum Mastera a management.
  > Není to report manažerovi; je to nástroj samoorganizace týmu pro plánování dne.
- [ ] Schůzka, kde Product Owner přiděluje úkoly jednotlivcům.
  > PO určuje prioritu položek v backlogu, ne kdo co dělá; práci si rozebírají sami vývojáři.
:::

::: link "Schwaber & Sutherland — The Scrum Guide (2020)" "https://scrumguides.org/scrum-guide.html"
:::

::: link "Manifesto for Agile Software Development (čtyři hodnoty)" "https://agilemanifesto.org/"
:::

::: link "Atlassian — Kanban: WIP limits a princip plynulého toku" "https://www.atlassian.com/agile/kanban/wip-limits"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Agile Manifesto (2001), The Scrum Guide (Schwaber & Sutherland, 2020), Atlassian Agile Coach.*
