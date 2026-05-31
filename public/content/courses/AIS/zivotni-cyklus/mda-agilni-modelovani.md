---
title: MDA a agilní modelování
---

Modely nejsou jen dokumentace „pro úřady" — mohou být přímo zdrojem, ze kterého systém vzniká, nebo nástrojem, kterým tým rychle promyslí návrh. Dva vlivné přístupy ukazují dva konce tohoto spektra: **Model Driven Architecture (MDA)** klade modely do centra a generuje z nich kód; **agilní modelování** naopak modeluje úsporně, aby tým nezdržovalo. Společné mají to, že berou modelování vážně — jen s opačnou váhou na formálnost.

## MDA — vrstvy CIM, PIM, PSM

MDA je iniciativa **OMG** (autora UML). Posouvá těžiště vývoje od psaní kódu k tvorbě modelů: vytváří se modely na různých úrovních abstrakce a mezi nimi probíhají **transformace modelů** (model-to-model i model-to-code), z nichž poslední generuje výsledný kód. Hlavní cíl je **oddělit byznys logiku od konkrétní technologie** — co systém dělá, popisujeme nezávisle na tom, na jaké platformě poběží.

MDA pracuje se třemi úrovněmi abstrakce:

* **CIM (Computation Independent Model)** — model nezávislý na výpočtu. Popisuje čistě **byznys, procesy a požadavky**, bez jakéhokoli ohledu na IT. Mluví jazykem domény, ne softwaru. Srozumitelný i pro zákazníka, který se o kód nezajímá.
* **PIM (Platform Independent Model)** — model nezávislý na platformě. **Technický návrh** systému (struktura, chování, logika), ale bez vazby na konkrétní jazyk, databázi či framework. Zde leží skutečné *know-how* aplikace.
* **PSM (Platform Specific Model)** — model specifický pro platformu. PIM doplněný o detaily konkrétní technologie (např. Java/JPA, .NET, SQL). Z PSM se pak **generuje finální kód**.

::: viz ais-mda-layers "Klikni na vrstvu (CIM → PIM → PSM → kód) a sleduj, jak transformace přidává technologické detaily a co se na každé úrovni řeší. Šipky mezi vrstvami jsou transformace modelů."
:::

Mezi vrstvami stojí transformace: CIM → PIM přidá technický návrh, PIM → PSM přidá platformu, PSM → kód vygeneruje implementaci. Klíčová výhoda: změní-li se cílová technologie, mění se *jen* PSM a transformační pravidla — PIM s byznys know-how zůstává netknutý a lze z něj vygenerovat verzi pro jinou platformu.

| Vrstva | Co popisuje | Nezávislé na | Příměr |
|---|---|---|---|
| **CIM** | byznys a procesy | IT úplně | manažer v obleku — kód ho nezajímá |
| **PIM** | technický návrh, logika | platformě | architektonický plán budovy |
| **PSM** | návrh pro konkrétní technologii | — (váže se na platformu) | ozubená kola, výkresy pro konkrétní stroj |

::: quiz "Firma chce stejnou aplikaci vygenerovat pro Java/JPA i pro .NET. Která vrstva MDA zůstane pro obě varianty společná a nezmění se?"
- [x] PIM — platformě nezávislý model nese byznys/návrhové know-how; mění se až PSM a transformační pravidla.
  > Přesně to je smysl oddělení byznysu od technologie: PIM je sdílený, PSM je per-platforma a z něj se generuje kód.
- [ ] PSM — protože je „specific", je sdílený pro všechny platformy.
  > Naopak: PSM je *specifický* pro jednu platformu (Java vs .NET), takže pro každou existuje jiný.
- [ ] CIM — protože popisuje kód společný oběma.
  > CIM kód nepopisuje vůbec; je čistě byznysový a nezávislý na výpočtu.
:::

## Agilní modelování (AM)

Agilní modelování vyvrací mýtus, že „agilní týmy nemodelují ani nedokumentují". Ukazuje, jak tvořit modely (UML diagramy, náčrty architektury) tak, aby tým **zrychlily, ne zpomalily**. Hodí se jako doplněk k procesům jako XP nebo Unified Process.

**Klíčové principy:**

* **Model with a purpose** — modeluj vždy s konkrétním účelem (komunikovat myšlenku, promyslet riziko). Nemáš-li jasný účel ani publikum, model nekresli.
* **Travel light** — cestuj nalehko: udržuj jen modely s dlouhodobou hodnotou. Dočasné náčrty, které posloužily k pochopení, klidně zahoď — každý udržovaný artefakt stojí úsilí.
* **Content is more important than representation** — obsah je důležitější než forma. Náčrt fixou na tabuli, který tým pochopí, má větší hodnotu než dokonalý diagram v drahém nástroji.

**Klíčové praktiky:**

* **Use the simplest tools** — nejjednodušší nástroje, které stačí. Tabule, papír a lepicí lístky často porazí těžkopádné CASE nástroje.
* **Prove it with code** — ověř návrh kódem. Teoretický model okamžitě otestuj malým kouskem skutečného kódu — když nefunguje, model byl mimo.
* **Active stakeholder participation** — aktivní účast zainteresovaných stran a společné modelování ve skupině u tabule.

::: svg "Agilní modelování — náčrt u tabule, který se ihned ověří kódem, místo měsíců kreslení v těžkém nástroji"
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="520" height="180" fill="var(--bg-inset)" rx="6"/>
  <!-- whiteboard -->
  <rect x="22" y="34" width="180" height="112" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="112" y="26" text-anchor="middle" font-size="11" fill="var(--text-muted)">tabule / papír (simple tools)</text>
  <g stroke="oklch(0.62 0.14 264)" stroke-width="1.6" fill="none">
    <rect x="44" y="54" width="40" height="24" rx="3"/>
    <rect x="140" y="54" width="40" height="24" rx="3"/>
    <path d="M84,66 L140,66" marker-end="url(#ama)"/>
    <rect x="44" y="104" width="40" height="24" rx="3"/>
    <path d="M64,78 L64,104" marker-end="url(#ama)"/>
    <path d="M84,116 C110,116 120,90 140,78" marker-end="url(#ama)"/>
  </g>
  <text x="112" y="98" text-anchor="middle" font-size="9" fill="var(--text-faint)" font-style="italic">náčrt s účelem</text>
  <!-- arrow prove it -->
  <path d="M210,90 L262,90" stroke="oklch(0.6 0.14 142)" stroke-width="1.8" fill="none" marker-end="url(#amb)"/>
  <text x="236" y="82" text-anchor="middle" font-size="9.5" fill="oklch(0.5 0.14 142)">prove it</text>
  <text x="236" y="104" text-anchor="middle" font-size="9.5" fill="oklch(0.5 0.14 142)">with code</text>
  <!-- code -->
  <rect x="270" y="40" width="156" height="100" rx="6" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.62 0.14 142)"/>
  <text x="348" y="32" text-anchor="middle" font-size="11" fill="var(--text-muted)">funkční kód</text>
  <g font-family="var(--font-mono)" font-size="9" fill="var(--text)">
    <text x="282" y="62">if (order.valid())</text>
    <text x="290" y="78">submit(order);</text>
    <text x="282" y="98">// běží → návrh OK</text>
  </g>
  <!-- travel light: discard -->
  <path d="M112,146 L112,166" stroke="oklch(0.6 0.18 22)" stroke-width="1.2" fill="none" marker-end="url(#amc)" stroke-dasharray="3 3"/>
  <text x="120" y="162" font-size="9" fill="oklch(0.55 0.18 22)" font-style="italic">travel light → dočasné zahoď</text>
  <defs>
    <marker id="ama" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.62 0.14 264)"/></marker>
    <marker id="amb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.6 0.14 142)"/></marker>
    <marker id="amc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.6 0.18 22)"/></marker>
  </defs>
</svg>
:::

Vztah k ostatním přístupům: MDA i agilní modelování stojí proti „těžkému" upfront modelování, ale jinak. MDA modely formalizuje natolik, že z nich *generuje kód* (model = zdroj). Agilní modelování modely *odlehčuje* — model slouží k myšlení a komunikaci a ověřuje se kódem (kód = zdroj). Obojí lze kombinovat s iterativně-inkrementálními procesy.

::: quiz "Tým si u tabule načrtne sekvenční diagram, společně podle něj naprogramuje prototyp, ověří že funguje, a náčrt smaže. Které principy agilního modelování právě uplatnil?"
- [x] Prove it with code, travel light a use the simplest tools.
  > Ano: ověření kódem, zahození dočasného modelu a použití nejjednoduššího nástroje (tabule) jsou přímo tyto principy/praktiky.
- [ ] Porušil agilní modelování, protože model po sobě nezdokumentoval trvale.
  > Naopak — „travel light" říká, že dočasné modely bez dlouhodobé hodnoty se mají zahodit.
- [ ] Provedl MDA transformaci z PIM na PSM.
  > To je MDA, kde se modely formalizují a generuje se z nich kód. Zde šlo o náčrt ověřený ručně napsaným kódem.
:::

::: link "OMG — Model Driven Architecture (MDA)" "https://www.omg.org/mda/"
:::

::: link "Agile Modeling — principy a praktiky (Scott Ambler)" "http://agilemodeling.com/principles.htm"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: OMG MDA Guide, S. Ambler — Agile Modeling.*
