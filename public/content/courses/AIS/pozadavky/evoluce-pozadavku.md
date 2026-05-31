---
title: Evoluce požadavků
---

Požadavek je vlastnost nebo podmínka, které musí systém — a šířeji celý projekt — vyhovět. Klíčovou výzvou analýzy požadavků je tyto potřeby *objevit*, *srozumitelně zaznamenat* a *udržovat aktuální* po celou dobu projektu. Způsob, jakým se k této práci přistupuje, zásadně odlišuje tradiční vodopádový (waterfall) model od moderních iterativních a evolučních přístupů, mezi které patří Unified Process i agilní metodiky (Scrum, XP).

## Vodopád požadavky „zmrazí"

Vodopádový přístup předpokládá, že lze všechny požadavky kompletně specifikovat, stabilizovat a *zmrazit* v první fázi projektu, ještě před zahájením návrhu a programování. Teprve po schválení takto „dokončené" specifikace se přechází k další fázi.

Tento předpoklad je v praxi chybný. Studie faktorů na problémových projektech ukazují, že problémy s požadavky tvoří největší jednotlivý zdroj potíží — přibližně **37 %** všech faktorů selhání souvisí právě s požadavky. Vodopádovou odpovědí na tento údaj je snaha požadavky vyleštit a uzamknout ještě pečlivěji; historie však tuto strategii vyhodnocuje jako prohranou bitvu, protože vychází z mylného předpokladu, že zákazník i tým na začátku přesně vědí, co chtějí.

## Požadavky se v průběhu mění

Dva empirické údaje vysvětlují, proč zmrazení nefunguje:

* **Změna rozsahu.** V průměrném softwarovém projektu se přibližně **25 %** požadavků v jeho průběhu změní (Boehm a Papaccio). Specifikace „dokončená" na začátku tedy zákonitě zastará.
* **Nízká hodnota předem specifikovaných funkcí.** Studie čtyř interních aplikací prezentovaná na konferenci XP 2002 (Standish Group) ukázala, že u funkcí specifikovaných předem se *vždy* používá jen **7 %**, *často* **13 %**, *občas* **16 %**, *zřídka* **19 %** a *nikdy* **45 %**. Téměř dvě třetiny dodaných funkcí — **64 %** (zřídka i nikdy dohromady) — tedy přinášejí jen minimální hodnotu.

Tyto údaje znamenají, že úsilí vložené do detailní specifikace všech funkcí předem je z velké části promarněné: tým pečlivě popisuje funkce, které se z nadpoloviční většiny nikdy nebo téměř nikdy nepoužijí.

::: svg "Využití funkcí specifikovaných předem (XP 2002, 4 interní aplikace)"
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="520" height="180" fill="var(--bg-inset)" rx="6"/>
  <text x="16" y="26" font-size="13" font-weight="600" fill="var(--text)">Jak často se používají předem specifikované funkce</text>
  <!-- 100% baseline bar split into segments; total width 488 from x=16 to x=504 -->
  <g font-size="11" font-family="var(--font-mono)">
    <!-- vždy 7% -->
    <rect x="16"  y="54" width="34"  height="34" fill="oklch(0.62 0.14 142 / 0.55)" stroke="oklch(0.55 0.14 142)"/>
    <text x="33"  y="76" text-anchor="middle" fill="var(--text)">7%</text>
    <text x="33"  y="106" text-anchor="middle" font-size="10" fill="var(--text-muted)">vždy</text>
    <!-- často 13% -->
    <rect x="50"  y="54" width="63"  height="34" fill="oklch(0.62 0.14 142 / 0.35)" stroke="oklch(0.55 0.14 142)"/>
    <text x="81"  y="76" text-anchor="middle" fill="var(--text)">13%</text>
    <text x="81"  y="106" text-anchor="middle" font-size="10" fill="var(--text-muted)">často</text>
    <!-- občas 16% -->
    <rect x="113" y="54" width="78"  height="34" fill="oklch(0.65 0.10 95 / 0.40)" stroke="oklch(0.58 0.12 95)"/>
    <text x="152" y="76" text-anchor="middle" fill="var(--text)">16%</text>
    <text x="152" y="106" text-anchor="middle" font-size="10" fill="var(--text-muted)">občas</text>
    <!-- zřídka 19% -->
    <rect x="191" y="54" width="93"  height="34" fill="oklch(0.62 0.16 22 / 0.35)" stroke="oklch(0.55 0.18 22)"/>
    <text x="237" y="76" text-anchor="middle" fill="var(--text)">19%</text>
    <text x="237" y="106" text-anchor="middle" font-size="10" fill="var(--text-muted)">zřídka</text>
    <!-- nikdy 45% -->
    <rect x="284" y="54" width="220" height="34" fill="oklch(0.62 0.16 22 / 0.55)" stroke="oklch(0.55 0.18 22)"/>
    <text x="394" y="76" text-anchor="middle" fill="var(--text)">45%</text>
    <text x="394" y="106" text-anchor="middle" font-size="10" fill="var(--text-muted)">nikdy</text>
  </g>
  <!-- bracket marking 64% rarely+never -->
  <line x1="191" y1="124" x2="504" y2="124" stroke="oklch(0.55 0.18 22)" stroke-width="1.2"/>
  <line x1="191" y1="120" x2="191" y2="128" stroke="oklch(0.55 0.18 22)" stroke-width="1.2"/>
  <line x1="504" y1="120" x2="504" y2="128" stroke="oklch(0.55 0.18 22)" stroke-width="1.2"/>
  <text x="347" y="144" text-anchor="middle" font-size="12" fill="oklch(0.55 0.18 22)" font-weight="600">64 % přináší minimální hodnotu (zřídka + nikdy)</text>
  <text x="16" y="168" font-size="10" fill="var(--text-faint)">Šířka segmentu odpovídá podílu funkcí v dané kategorii používání.</text>
</svg>
:::

## Evoluční odpověď: postupné upřesňování

Iterativní a evoluční přístup proto na vstupní nejistotu reaguje opačně — místo zmrazení požadavky *přijímá* jako proměnné, které se v čase vyvíjejí. Programování a testování začíná již ve chvíli, kdy je do detailu specifikováno pouze **10–20 %** požadavků: konkrétně těch *nejrizikovějších* a *architektonicky nejvýznamnějších*. Zbytek se postupně upřesňuje na základě zpětné vazby od uživatelů napříč iteracemi.

Tato volba není náhodná. Časně realizované rizikové a architektonicky významné požadavky odhalí zásadní technická a koncepční rozhodnutí dříve, kdy je jejich případná změna nejlevnější. Naopak požadavky s malou hodnotou nebo nízkým rizikem se nemusí specifikovat předem vůbec — mnohé z nich by stejně spadly do oněch 64 % málo používaných funkcí.

::: viz ais-pozadavky-evoluce "Posuňte iteraci a porovnejte, jak roste zralost požadavků ve vodopádu (skoková, riziková) oproti evolučnímu přístupu (postupná, řízená zpětnou vazbou)."
:::

Cílem evolučního přístupu tedy není absence specifikace, ale *řízená* specifikace ve správném pořadí a správné chvíli. Manage requirements — jedna z osvědčených praktik Unified Process — znamená systematicky nalézat, dokumentovat, organizovat a sledovat *měnící se* požadavky, nikoli je jednorázově uzamknout.

::: quiz "Proč evoluční přístup začíná programovat už při 10–20 % specifikovaných požadavků, a které to mají být?"
- [x] Specifikuje se nejprve 10–20 % rizikových a architektonicky významných požadavků, aby se zásadní rozhodnutí ověřila brzy a levně; zbytek se upřesní podle zpětné vazby.
  > Přesně. Časná realizace rizikových a architektonicky významných požadavků odhalí klíčová rozhodnutí, dokud je změna nejlevnější.
- [ ] Specifikuje se náhodných 10–20 % požadavků, aby se ušetřil čas na analýze.
  > Výběr není náhodný — vybírají se cíleně rizikové a architektonicky významné požadavky.
- [ ] Specifikuje se 10–20 % nejlevnějších funkcí, protože se dají rychle naprogramovat.
  > Rozhodující není cena implementace, ale riziko a architektonický význam.
:::

::: link "Larman — Understanding Requirements (kapitola 5, ukázka)" "https://sites.cs.ucsb.edu/~mikec/cs48/project/RequirementsLarman.pdf"
:::

::: link "Standish Group / XP 2002 — podíl používaných funkcí (Mountain Goat Software)" "https://www.mountaingoatsoftware.com/blog/are-64-of-features-really-rarely-or-never-used"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: C. Larman — Applying UML and Patterns (3. vyd., kap. 5); C. Larman — Agile and Iterative Development; Standish Group / J. Johnson (XP 2002); Boehm a Papaccio.*
