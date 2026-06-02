---
title: Diagramy chování
---

**Diagramy chování** (behavior diagrams) popisují *dynamiku* systému — co se v něm děje v čase a jak reaguje na události. UML 2.5 jich má sedm; podmnožinu tvoří **interakční diagramy** (sekvenční, komunikační, časování, přehled interakcí). Zde rozebereme čtyři nejčastěji zkoušené: případů užití, aktivit, stavový a sekvenční. (Statickou strukturu pokrývají [[strukturni-diagramy]].)

## Diagram případů užití

Vychází z **funkčních požadavků** a popisuje systém *z pohledu uživatele* — co systém umožní dělat, ne jak. Dva základní prvky a obdélníkový rámec hranice systému:

* **Aktér (actor)** — role vně systému (osoba nebo jiný systém), kreslí se jako *figurka*. Aktér iniciuje nebo se účastní případů užití.
* **Případ užití (use case)** — souvislá funkcionalita poskytnutá aktérovi, kreslí se jako *ovál*.

Mezi případy užití existují tři vztahy. Směr šipky u `«include»` a `«extend»` je **opačný** — to je nejčastější chyba u zkoušky. Přepínejte a sledujte ho:

::: viz ais-usecase-relations "Přepínej vztah a sleduj směr šipky a stereotyp. include a extend míří opačně!"
:::

* **«include»** — základní případ **vždy (povinně)** provede zahrnutý dílčí případ. Šipka (čárkovaná) míří **od základního k zahrnutému**. Používá se na vytknutí společného opakovaného kroku.
* **«extend»** — rozšiřující případ se provede **jen někdy (volitelně)**, v definovaném *bodě rozšíření*. Šipka míří **od rozšiřujícího k základnímu** (proti intuici). Pozor na pravopis stereotypu: standardní tvar je `«extend»`, ne „extends".
* **Generalizace** — specializovaný případ (či aktér) dědí chování obecného; prázdný trojúhelník míří na předka.

## Diagram aktivit

V podstatě pokročilý **vývojový diagram** — modeluje kroky algoritmu, business workflow nebo paralelní procesy. Prvky: **akce** (zaoblený obdélník), **řídicí hrany** (šipky toku), **rozhodnutí** (kosočtverec — větvení podle podmínky) a uzly pro **paralelismus**:

* **Fork** — tlustá vodorovná čára, která *rozdělí* jeden tok do více souběžných větví.
* **Join** — tlustá čára, která souběžné větve *synchronizuje* zpět do jednoho toku (čeká na všechny).

::: svg "Diagram aktivit: počátek ●, fork na paralelní akce, join, konec ◉"
<svg viewBox="0 0 300 218" xmlns="http://www.w3.org/2000/svg">
  <!-- počáteční uzel -->
  <circle cx="150" cy="18" r="8" fill="var(--text)"/>
  <line x1="150" y1="26" x2="150" y2="40" stroke="var(--text)" stroke-width="1.4" marker-end="url(#acA)"/>
  <!-- akce: přijmout -->
  <rect x="108" y="42" width="84" height="26" rx="13" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="150" y="59" text-anchor="middle" font-size="10.5" fill="var(--text)">Přijmout obj.</text>
  <line x1="150" y1="68" x2="150" y2="80" stroke="var(--text)" stroke-width="1.4"/>
  <!-- fork -->
  <rect x="70" y="80" width="160" height="6" rx="2" fill="var(--accent)"/>
  <text x="244" y="86" font-size="9" fill="var(--text-faint)">fork</text>
  <line x1="100" y1="86" x2="100" y2="100" stroke="var(--text)" stroke-width="1.4" marker-end="url(#acA)"/>
  <line x1="200" y1="86" x2="200" y2="100" stroke="var(--text)" stroke-width="1.4" marker-end="url(#acA)"/>
  <!-- dvě paralelní akce -->
  <rect x="58" y="102" width="84" height="26" rx="13" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="100" y="119" text-anchor="middle" font-size="10.5" fill="var(--text)">Rezervovat</text>
  <rect x="158" y="102" width="84" height="26" rx="13" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="200" y="119" text-anchor="middle" font-size="10.5" fill="var(--text)">Účtovat</text>
  <line x1="100" y1="128" x2="100" y2="142" stroke="var(--text)" stroke-width="1.4"/>
  <line x1="200" y1="128" x2="200" y2="142" stroke="var(--text)" stroke-width="1.4"/>
  <!-- join -->
  <rect x="70" y="142" width="160" height="6" rx="2" fill="var(--accent)"/>
  <text x="244" y="148" font-size="9" fill="var(--text-faint)">join</text>
  <line x1="150" y1="148" x2="150" y2="162" stroke="var(--text)" stroke-width="1.4" marker-end="url(#acA)"/>
  <!-- akce odeslat -->
  <rect x="108" y="164" width="84" height="26" rx="13" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="150" y="181" text-anchor="middle" font-size="10.5" fill="var(--text)">Odeslat</text>
  <line x1="150" y1="190" x2="150" y2="200" stroke="var(--text)" stroke-width="1.4"/>
  <!-- koncový uzel -->
  <circle cx="150" cy="208" r="8" fill="none" stroke="var(--text)" stroke-width="1.4"/>
  <circle cx="150" cy="208" r="4" fill="var(--text)"/>
  <defs>
    <marker id="acA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--text)"/>
    </marker>
  </defs>
</svg>
:::

## Stavový diagram

Modeluje **životní cyklus jednoho reaktivního objektu** — jeho stavy od vzniku po zánik a **přechody** mezi nimi vyvolané přesně definovanými **událostmi**. Přechod má syntaxi `událost [stráž] / akce`. Počáteční pseudo-stav je plný kroužek `●`, koncový stav `◉`.

Vyzkoušejte si to na turniketu: zkuste vyvolat událost, která v daném stavu *nezmění stav* — FSM ji efektivně ignoruje (přechod sám do sebe):

::: viz ais-state-machine "Vyvolej událost coin/push. Událost, která v aktuálním stavu nezmění stav (přechod sám do sebe), se efektivně ignoruje."
:::

Rozdíl od diagramu aktivit, na který se examinátoři ptají: stavový diagram je **řízen událostmi** (event-driven, popisuje *jeden* objekt), zatímco diagram aktivit je **řízen dokončením** kroku (popisuje *tok* napříč objekty/procesy).

## Sekvenční diagram

Patří mezi **interakční** diagramy. Zachycuje **chronologické předávání zpráv** mezi objekty. Účastníci jsou nahoře jako *čáry života* (lifelines) — svislé čárkované čáry; **čas běží shora dolů**. Zpráva je vodorovná šipka mezi čarami; obdélník na čáře je *aktivace* (objekt právě něco vykonává).

::: svg "Sekvenční diagram: čas teče dolů, zprávy mezi lifelines, fragment alt"
<svg viewBox="0 0 460 200" xmlns="http://www.w3.org/2000/svg">
  <!-- hlavičky lifelines -->
  <rect x="40" y="12" width="80" height="24" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="80" y="28" text-anchor="middle" font-size="11" fill="var(--text)">:Uživatel</text>
  <rect x="200" y="12" width="80" height="24" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="240" y="28" text-anchor="middle" font-size="11" fill="var(--text)">:Systém</text>
  <rect x="350" y="12" width="80" height="24" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="390" y="28" text-anchor="middle" font-size="11" fill="var(--text)">:DB</text>
  <!-- lifelines -->
  <line x1="80" y1="36" x2="80" y2="190" stroke="var(--line-strong)" stroke-width="0.6" stroke-dasharray="3 3"/>
  <line x1="240" y1="36" x2="240" y2="190" stroke="var(--line-strong)" stroke-width="0.6" stroke-dasharray="3 3"/>
  <line x1="390" y1="36" x2="390" y2="190" stroke="var(--line-strong)" stroke-width="0.6" stroke-dasharray="3 3"/>
  <!-- aktivace -->
  <rect x="235" y="50" width="10" height="120" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <rect x="385" y="92" width="10" height="40" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <!-- zpráva 1 -->
  <line x1="80" y1="52" x2="235" y2="52" stroke="var(--text)" stroke-width="1.3" marker-end="url(#seqA)"/>
  <text x="156" y="48" text-anchor="middle" font-size="9.5" font-family="ui-monospace, monospace" fill="var(--text-muted)">login(u,p)</text>
  <!-- fragment alt -->
  <rect x="200" y="78" width="232" height="84" fill="none" stroke="var(--accent)" stroke-width="0.9"/>
  <rect x="200" y="78" width="34" height="14" fill="var(--accent)"/>
  <text x="217" y="89" text-anchor="middle" font-size="9" fill="white" font-weight="700">alt</text>
  <text x="244" y="89" font-size="9" fill="var(--accent)">[platné heslo]</text>
  <!-- zpráva 2 -->
  <line x1="245" y1="100" x2="385" y2="100" stroke="var(--text)" stroke-width="1.3" marker-end="url(#seqA)"/>
  <text x="315" y="96" text-anchor="middle" font-size="9.5" font-family="ui-monospace, monospace" fill="var(--text-muted)">findUser()</text>
  <!-- návratová zpráva (čárkovaná) -->
  <line x1="385" y1="124" x2="245" y2="124" stroke="var(--text-muted)" stroke-width="1.1" stroke-dasharray="4 3" marker-end="url(#seqA)"/>
  <text x="315" y="120" text-anchor="middle" font-size="9.5" font-family="ui-monospace, monospace" fill="var(--text-faint)">user</text>
  <!-- oddělovač alt -->
  <line x1="200" y1="138" x2="432" y2="138" stroke="var(--accent)" stroke-width="0.7" stroke-dasharray="4 3"/>
  <text x="244" y="150" font-size="9" fill="var(--accent)">[jinak]</text>
  <line x1="245" y1="154" x2="83" y2="154" stroke="var(--text-muted)" stroke-width="1.1" stroke-dasharray="4 3" marker-end="url(#seqA)"/>
  <text x="160" y="150" text-anchor="middle" font-size="9.5" font-family="ui-monospace, monospace" fill="var(--text-faint)">chyba 401</text>
  <text x="60" y="186" font-size="9" fill="var(--text-faint)">↓ čas</text>
  <defs>
    <marker id="seqA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="currentColor"/>
    </marker>
  </defs>
</svg>
:::

Pro vložení řízení toku přímo do sledu zpráv slouží **kombinované fragmenty** — orámované oblasti s **operátorem** v levém horním rohu:

| Operátor | Význam | Analogie v kódu |
|---|---|---|
| `alt` | alternativa — provede se jeden z operandů podle stráže | if / else, switch |
| `opt` | volitelný — operand se provede, nebo nic | if (bez else) |
| `loop` | smyčka — operand se opakuje | for / while |
| `par` | paralelně — operandy běží souběžně | concurrent |

::: quiz "Případ „Vybrat hotovost\" se může (ne vždy) doplnit o „Vytisknout výpis\". Který vztah a směr šipky?"
- [ ] «include», šipka od „Vytisknout výpis" k „Vybrat hotovost".
  > include znamená *povinné vždy* a šipka by mířila od základního k zahrnutému. Zde jde o volitelné doplnění.
- [x] «extend», šipka od „Vytisknout výpis" k „Vybrat hotovost".
  > Správně. Volitelné rozšíření = «extend», a jeho šipka míří od rozšiřujícího (Vytisknout výpis) k základnímu (Vybrat hotovost).
- [ ] Generalizace, trojúhelník u „Vytisknout výpis".
  > Není to vztah dědičnosti „je-druhem". Jde o volitelné rozšíření chování.
:::

::: link "UML Use Case Diagrams — include & extend (uml-diagrams.org)" "https://www.uml-diagrams.org/use-case-reference.html"
:::

::: link "UML Sequence Diagrams — Combined Fragments (uml-diagrams.org)" "https://www.uml-diagrams.org/sequence-diagrams-combined-fragment.html"
:::

::: link "UML State Machine Diagrams (uml-diagrams.org)" "https://www.uml-diagrams.org/state-machine-diagrams.html"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: OMG UML 2.5.1, uml-diagrams.org.*
