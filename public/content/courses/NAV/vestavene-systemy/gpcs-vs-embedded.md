---
title: Vymezení a společné znaky
---

Pojmem **vestavěný systém** (*embedded system*) označujeme počítač, který je *integrální součástí* nějakého většího celku — produktu, stroje nebo zařízení — a uvnitř něj vykonává jednu *předem definovanou* řídicí nebo monitorovací funkci. Protipólem je **univerzální počítačový systém** (*GPCS — General-Purpose Computer System*): PC, notebook nebo server, který je naopak navržen tak, aby zvládl libovolnou výpočetní úlohu, jakou na něj uživatel naloží.

Hranice mezi nimi není dána velikostí ani výkonem (dnešní vestavěný SoC bývá silnější než PC z 90. let), nýbrž **rolí, kterou počítač v zařízení hraje**, a tím, na co je optimalizován.

## Univerzální systém — platforma pro libovolný software

GPCS je samostatný produkt sám o sobě: kupujete *počítač*, ne pračku s počítačem uvnitř. Jeho hodnota spočívá ve **flexibilitě**. Tentýž stroj dnes upravuje fotky, zítra překládá kód, pozítří streamuje video — a to vše proto, že:

* dovoluje instalovat **libovolný software** (uživatel rozhoduje, co poběží),
* tvoří **platformu pro komplexní interakci s uživatelem** — klávesnice, myš, monitor, GUI,
* je optimalizovaný na **všestrannost a celkovou propustnost** (kolik práce zvládne za jednotku času).

Uživatel je u GPCS přítomen, vede dialog se strojem a očekává, že stroj reaguje *„dostatečně rychle"* — drobné a nepravidelné zpoždění (systém zrovna indexuje soubory) je nepříjemné, ale ne fatální.

## Vestavěný systém — skrytá specifická funkce

Vestavěný systém je naproti tomu *prostředkem*, ne cílem. Uživatel pračky neví (a nechce vědět), že uvnitř je mikrokontrolér; vnímá jen *funkci* „vyper prádlo". Charakteristické rysy:

* plní **jedinou, úzce specifikovanou funkci** — software je pevně daný a po celou životnost zařízení se nemění (případně jen řízeně aktualizuje),
* pracuje převážně **autonomně, v pozadí**, s minimální nebo žádnou přímou interakcí s člověkem,
* je **integrální součástí většího celku** a komunikuje hlavně s *fyzickým světem* — měří veličiny, ovládá motory, ventily, displeje.

::: svg "GPCS jako samostatný produkt vs. vestavěný systém skrytý uvnitř zařízení"
<svg viewBox="0 0 540 196" xmlns="http://www.w3.org/2000/svg">
  <!-- GPCS panel -->
  <rect x="14" y="14" width="240" height="168" rx="10" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="134" y="36" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Univerzální systém</text>
  <text x="134" y="52" text-anchor="middle" font-size="11" fill="var(--text-muted)">počítač = samostatný produkt</text>
  <!-- monitor -->
  <rect x="64" y="72" width="140" height="78" rx="6" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <rect x="80" y="86" width="108" height="48" rx="3" fill="oklch(0.62 0.14 264 / 0.18)" stroke="var(--accent)"/>
  <text x="134" y="114" text-anchor="middle" font-size="10" fill="var(--accent)" font-family="var(--font-mono)">GUI</text>
  <line x1="118" y1="150" x2="118" y2="160" stroke="var(--accent)" stroke-width="3"/>
  <line x1="150" y1="150" x2="150" y2="160" stroke="var(--accent)" stroke-width="3"/>
  <rect x="96" y="160" width="76" height="6" rx="2" fill="var(--accent)"/>
  <text x="134" y="180" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">uživatel ↔ stroj (dialog)</text>
  <!-- Embedded panel -->
  <rect x="286" y="14" width="240" height="168" rx="10" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="406" y="36" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Vestavěný systém</text>
  <text x="406" y="52" text-anchor="middle" font-size="11" fill="var(--text-muted)">počítač = skrytá součást</text>
  <!-- product outline -->
  <rect x="318" y="68" width="176" height="98" rx="8" fill="var(--bg-card)" stroke="var(--text-muted)" stroke-dasharray="4 3"/>
  <text x="406" y="84" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">zařízení (produkt)</text>
  <!-- tiny MCU inside -->
  <rect x="372" y="100" width="68" height="40" rx="4" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.55 0.14 142)" stroke-width="1.5"/>
  <text x="406" y="118" text-anchor="middle" font-size="9.5" font-weight="600" fill="oklch(0.50 0.14 142)">MCU</text>
  <text x="406" y="131" text-anchor="middle" font-size="8" fill="oklch(0.50 0.14 142)" font-family="var(--font-mono)">fixní fce</text>
  <text x="406" y="180" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">autonomně v pozadí</text>
</svg>
:::

## Společný základ — proč jsou si v jádru podobné

Přes opačné určení **oba systémy vycházejí ze stejných principů výpočetní techniky** a sdílejí tytéž stavební bloky. Examinátoři tuto „shodu" rádi vyžadují, protože je snadné přeceňovat rozdíly a zapomenout, že obojí je *počítač*:

| Společný prvek | Co plní | GPCS | Vestavěný systém |
|---|---|---|---|
| **Procesor (CPU)** | vykonává sled instrukcí | výkonný MPU | jádro v MCU/SoC |
| **Operační paměť (RAM)** | běh programu, data za běhu | GB | typicky kB–MB |
| **Trvalá paměť (ROM/Flash)** | uchování kódu a dat | SSD/HDD | vestavěná Flash |
| **Vstupy/výstupy (I/O)** | komunikace s okolím | USB, HDMI, síť | GPIO, ADC, sběrnice |
| **Vykonávání instrukcí** | zpracování algoritmů a dat | totožný princip | totožný princip |

Jádrem obojího je tedy klasická počítačová architektura: procesorová jednotka, která načítá a provádí *instrukce*, operační paměť pro běh programu, trvalá paměť pro kód i data a vstupně-výstupní rozhraní pro styk s vnějším prostředím. Z tohoto pohledu je vestavěný systém *plnohodnotný počítač* — jen zabalený do role, kde jej uživatel nevnímá jako počítač.

Tatáž základní architektura však bývá *jinak naladěná*: zatímco GPCS skládá výkonný procesor z mnoha čipů na základní desce a běží na něm univerzální operační systém, vestavěný systém integruje co nejvíce do jediného čipu a optimalizuje na spolehlivost, efektivitu a předvídatelnost odezvy. Tyto rozdíly v naladění — od typu pouzdra procesoru přes architekturu paměti až po způsob plánování — rozebírá navazující subtopic [[architektura-odlisnosti]].

::: quiz "Co primárně odlišuje vestavěný systém od univerzálního počítače?"
- [ ] Vestavěný systém je vždy menší a méně výkonný než PC.
  > Není to dáno velikostí ani výkonem — moderní SoC překoná staré PC. Rozlišujícím kritériem je role, ne výkon.
- [x] Role v zařízení: vestavěný systém plní jednu pevně danou funkci jako součást většího celku, GPCS je univerzální platforma pro libovolný software.
  > Přesně. Hranici určuje účel a optimalizace (specifická funkce, autonomie v pozadí vs. flexibilita a interakce s uživatelem), nikoli absolutní výkon.
- [ ] Vestavěný systém nemá procesor ani paměť, jen logické obvody.
  > Naopak — sdílí s GPCS tytéž stavební bloky: CPU, RAM, ROM/Flash a I/O. To je právě ta „shoda".
:::

::: link "Wikipedia — Embedded system (definice a vymezení)" "https://en.wikipedia.org/wiki/Embedded_system"
:::

::: link "ScienceDirect — Von Neumann Architecture (společný výpočetní základ)" "https://www.sciencedirect.com/topics/computer-science/von-neumann-architecture"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Wikipedia (Embedded system), ScienceDirect (Computer Architecture topics).*
