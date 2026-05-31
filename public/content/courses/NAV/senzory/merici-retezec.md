---
title: Měřicí řetězec
---

Mikrokontrolér umí pracovat jen s čísly — s diskrétními binárními hodnotami. Měřená veličina je ale obvykle **neelektrická** (teplota, tlak, síla, poloha) a spojitá v čase i v hodnotě. Mezi fyzikálním jevem a registrem procesoru proto stojí řetězec převodních a úpravných bloků, jehož úkolem je veličinu postupně transformovat na číslo v inženýrských jednotkách. Tomuto řetězci se říká **měřicí řetězec**.

Každý článek řetězce signál buď **převádí** (mění jeho fyzikální podstatu), nebo **upravuje** (zachovává podstatu, ale mění tvar — zesiluje, filtruje, přizpůsobuje impedanci). Pochopení toho, *co se kde děje*, je klíčem k celému tématu: chyba v kterémkoli článku se promítne až do výsledné hodnoty.

## Články řetězce

::: viz nav-merici-retezec "Projděte řetězec krok po kroku — sledujte, jak se teplota (neelektrická veličina) postupně mění na číslo ve °C v registru MCU."
:::

Řetězec čte zleva (fyzikální svět) doprava (program):

* **Snímač / čidlo (senzor)** — vstupní prvek v přímém kontaktu s měřeným objektem. Transformuje neelektrickou veličinu na *měronosný* elektrický signál: změnu odporu, kapacity, napětí nebo náboje. Je to jediný článek, který je „venku" ve fyzikálním světě.
* **Analog Front-End (AFE)** — analogová úprava signálu před digitalizací. Zahrnuje **zesílení** slabého signálu, **filtraci** šumu a rušení a **impedanční přizpůsobení** mezi vysokoimpedančním zdrojem (čidlem) a vstupem převodníku.
* **Analogový multiplexer (MUX)** — elektronický přepínač integrovaný v MCU. Umožňuje sdílet jediný interní A/D převodník mezi více analogovými vstupy: procesor postupně přepíná, který kanál je k převodníku připojen.
* **A/D převodník (ADC)** — převádí spojitý analogový signál na diskrétní binární kód. Toto je hranice mezi analogovou a číslicovou doménou.
* **Mikrokontrolér (MCU)** — provádí **číslicové zpracování**: další (softwarovou) filtraci, linearizaci charakteristiky čidla a hlavně **přepočet** surového kódu ADC na fyzikální jednotky. Výsledek pak používá k řízení nebo jej posílá dál.

## Převod versus úprava signálu

Rozlišení dvou rolí článků je oblíbená zkoušková otázka:

| Operace | Co dělá | Příklad článku |
|---|---|---|
| **Převod** | mění fyzikální podstatu veličiny | čidlo (teplota → odpor), ADC (napětí → kód) |
| **Úprava** | zachovává podstatu, mění tvar | zesilovač, filtr, sledovač napětí, MUX |

Snímač a ADC jsou tedy *měniče* (transducery), zatímco AFE a MUX jen *upravují* už elektrický signál, aby jej ADC zvládl správně zpracovat.

## Proč nestačí čidlo připojit přímo na ADC

Surový výstup čidla bývá pro převodník nepoužitelný hned z několika důvodů, které postupně řeší jednotlivé bloky AFE:

* **Příliš malá amplituda** — tenzometrický můstek dá při plném zatížení jednotky milivoltů, zatímco ADC očekává rozsah řádově voltů. Bez zesílení by se využila jen nepatrná část rozlišení převodníku.
* **Vysoká výstupní impedance** — vzorkovací kondenzátor ADC se musí během krátkého okna nabít na vstupní napětí. Vysokoimpedanční zdroj jej nestihne nabít, a vzorek je zkreslený. Řeší to sledovač napětí (impedanční přizpůsobení).
* **Šum a rušení** — vodiče k čidlu fungují jako anténa. Dolní propust (anti-aliasing filtr) odřízne vysokofrekvenční složky dřív, než je ADC podvzorkuje.

::: svg "Tok signálu měřicím řetězcem: levá část je analogová doména, ADC je hranice, vpravo už pracuje procesor s čísly."
<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <text x="120" y="16" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted)">analogová doména</text>
  <text x="430" y="16" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-muted)">číslicová doména</text>
  <line x1="270" y1="24" x2="270" y2="150" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="4 4"/>
  <rect x="14" y="60" width="80" height="46" rx="6" fill="var(--bg-inset)" stroke="var(--accent)"/>
  <text x="54" y="80" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">čidlo</text>
  <text x="54" y="95" text-anchor="middle" font-size="9" fill="var(--text-muted)">převod</text>
  <rect x="110" y="60" width="80" height="46" rx="6" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="150" y="80" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">AFE</text>
  <text x="150" y="95" text-anchor="middle" font-size="9" fill="var(--text-muted)">úprava</text>
  <rect x="206" y="60" width="54" height="46" rx="6" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="233" y="82" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">MUX</text>
  <text x="233" y="96" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">přepínač</text>
  <rect x="282" y="60" width="70" height="46" rx="6" fill="oklch(0.62 0.14 22 / 0.12)" stroke="oklch(0.55 0.18 22)"/>
  <text x="317" y="80" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">ADC</text>
  <text x="317" y="95" text-anchor="middle" font-size="9" fill="var(--text-muted)">převod</text>
  <rect x="368" y="60" width="158" height="46" rx="6" fill="oklch(0.62 0.14 264 / 0.12)" stroke="var(--accent)"/>
  <text x="447" y="80" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">MCU — zpracování</text>
  <text x="447" y="95" text-anchor="middle" font-size="9" fill="var(--text-muted)">filtrace, přepočet na jednotky</text>
  <g stroke="var(--text-muted)" stroke-width="1.4" fill="none" marker-end="url(#mrArr)">
    <line x1="94" y1="83" x2="108" y2="83"/>
    <line x1="190" y1="83" x2="204" y2="83"/>
    <line x1="260" y1="83" x2="280" y2="83"/>
    <line x1="352" y1="83" x2="366" y2="83"/>
  </g>
  <text x="54" y="128" text-anchor="middle" font-size="9" fill="var(--text-faint)">°C → Ω</text>
  <text x="150" y="128" text-anchor="middle" font-size="9" fill="var(--text-faint)">mV → V</text>
  <text x="317" y="128" text-anchor="middle" font-size="9" fill="var(--text-faint)">V → kód</text>
  <text x="447" y="128" text-anchor="middle" font-size="9" fill="var(--text-faint)">kód → 23.7 °C</text>
  <defs>
    <marker id="mrArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

## Přepočet na jednotky v MCU

ADC vrací bezrozměrné celé číslo — *kód* v rozsahu 0 až 2^N−1. Procesor jej musí přepočítat na napětí a poté přes známou charakteristiku čidla na fyzikální veličinu. Pro lineární čidlo a referenční napětí *V_ref* platí:

::: math
U_in = (kód / (2^N − 1)) · V_ref
:::

Reálná čidla ale často lineární nejsou (např. termočlánek), takže MCU navíc provádí **linearizaci** — buď výpočtem polynomu, nebo vyhledávací tabulkou. Tento „poslední krok" rozhoduje o přesnosti celého měření stejně jako kvalita čidla na začátku řetězce.

::: quiz "Který článek měřicího řetězce tvoří hranici mezi analogovou a číslicovou doménou?"
- [ ] Snímač (čidlo)
  > Čidlo je celé v analogové (a fyzikální) doméně — převádí neelektrickou veličinu na analogový elektrický signál.
- [ ] Analog Front-End
  > AFE je čistě analogový blok (zesílení, filtrace). Signál po něm je stále spojitý.
- [x] A/D převodník (ADC)
  > Přesně. ADC vzorkuje a kvantuje spojitý signál na diskrétní binární kód — vše vlevo od něj je analogové, vše vpravo číslicové.
- [ ] Analogový multiplexer
  > MUX jen přepíná, který analogový kanál je připojen k ADC; signál zůstává analogový.
:::

::: link "Texas Instruments — A Basic Guide to the Analog Front End (AFE)" "https://www.ti.com/lit/an/sboa516/sboa516.pdf"
:::

::: link "Analog Devices — Front-End Amplifier and RC Filter Design for a SAR ADC" "https://www.analog.com/en/resources/technical-articles/frontend-amplifier-and-rc-filter-design-for-a-precision-sar-adc.html"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Texas Instruments AFE guide, Analog Devices ADC front-end design.*
