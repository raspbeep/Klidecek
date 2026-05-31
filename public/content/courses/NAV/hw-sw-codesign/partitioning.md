---
title: HW/SW co-design a partitioning
---

Vestavěný systém je specializované zařízení optimalizované pro jednu úlohu uvnitř většího celku, takže návrh nemá luxus „univerzálního" řešení — musí současně splnit přísné meze na reálný čas, spotřebu a cenu. Centrální rozhodnutí celého návrhu proto zní: *kterou funkci realizovat softwarově* (jako program běžící na procesoru) *a kterou hardwarově* (jako dedikovaný logický obvod v ASIC nebo FPGA). Tomuto rozhodovacímu procesu se říká **hardware-software partitioning** (HSP, rozdělení funkcí mezi HW a SW).

HSP je jádrem širší metodiky **HW/SW co-designu**. Klasický „waterfall" postup nejdřív zafixoval hardware a teprve potom k němu psal software; co-design tuto sekvenci opouští a vede **paralelní, provázaný vývoj obou vrstev** od společné specifikace. Rozhraní mezi HW a SW (registrová mapa akcelerátoru, formát zpráv na sběrnici) se navrhuje společně, takže lze funkci přesouvat přes hranici HW/SW i pozdě v projektu, aniž by se přepisovala celá architektura.

## Co vstupuje a co vystupuje

Vstupem partitioningu je **graf úloh** (task graph) — funkce systému rozložená na bloky a datové závislosti mezi nimi. Každý blok má dvě sady metrik: kolik *času, energie a kódu* spotřebuje jako SW na cílovém procesoru, a kolik *latence, energie a plochy* (hradel / LUT) spotřebuje jako dedikovaný HW. K tomu přistupuje **cena komunikace** každé hrany, pokud její dva konce skončí na opačných stranách hranice HW/SW (přenos dat přes sběrnici).

Výstupem je **přiřazení** každého bloku na SW nebo HW takové, které minimalizuje zvolenou účelovou funkci (typicky latenci nebo energii) při dodržení omezujících podmínek (rozpočet plochy čipu, strop spotřeby, deadline reálného času).

::: svg "Tentýž graf úloh, dvě různá rozdělení — řez hranicí HW/SW protíná hrany, jejichž přenos přes sběrnici se musí zaplatit"
<svg viewBox="0 0 540 210" xmlns="http://www.w3.org/2000/svg">
  <text x="135" y="18" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text)">rozdělení A</text>
  <text x="405" y="18" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text)">rozdělení B</text>
  <!-- panel A -->
  <line x1="135" y1="30" x2="135" y2="200" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="70" y="42" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">SW (CPU)</text>
  <text x="200" y="42" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">HW</text>
  <circle cx="55" cy="80" r="15" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="55" y="84" text-anchor="middle" font-size="11" fill="var(--text)">T1</text>
  <circle cx="55" cy="140" r="15" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="55" y="144" text-anchor="middle" font-size="11" fill="var(--text)">T2</text>
  <circle cx="200" cy="80" r="15" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="200" y="84" text-anchor="middle" font-size="11" fill="var(--text)">T3</text>
  <circle cx="200" cy="140" r="15" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="200" y="144" text-anchor="middle" font-size="11" fill="var(--text)">T4</text>
  <line x1="70" y1="80" x2="185" y2="80" stroke="var(--accent)" stroke-width="2"/>
  <line x1="55" y1="95" x2="55" y2="125" stroke="var(--line-strong)" stroke-width="1.2"/>
  <line x1="200" y1="95" x2="200" y2="125" stroke="var(--line-strong)" stroke-width="1.2"/>
  <line x1="70" y1="135" x2="185" y2="90" stroke="var(--accent)" stroke-width="2"/>
  <text x="128" y="60" text-anchor="middle" font-size="8.5" fill="var(--accent)" font-family="var(--font-mono)">2 řezy</text>
  <!-- panel B -->
  <line x1="405" y1="30" x2="405" y2="200" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="335" y="42" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">SW (CPU)</text>
  <text x="470" y="42" text-anchor="middle" font-size="9.5" fill="var(--text-muted)" font-family="var(--font-mono)">HW</text>
  <circle cx="325" cy="80" r="15" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="325" y="84" text-anchor="middle" font-size="11" fill="var(--text)">T1</text>
  <circle cx="325" cy="140" r="15" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="325" y="144" text-anchor="middle" font-size="11" fill="var(--text)">T2</text>
  <circle cx="325" cy="110" r="0" />
  <circle cx="470" cy="80" r="15" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="470" y="84" text-anchor="middle" font-size="11" fill="var(--text)">T4</text>
  <circle cx="408" cy="140" r="0"/>
  <circle cx="345" cy="110" r="0"/>
  <line x1="340" y1="80" x2="340" y2="80" stroke="none"/>
  <line x1="325" y1="95" x2="325" y2="125" stroke="var(--line-strong)" stroke-width="1.2"/>
  <line x1="340" y1="75" x2="455" y2="80" stroke="var(--accent)" stroke-width="2"/>
  <circle cx="395" cy="140" r="15" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.62 0.14 142)"/>
  <text x="395" y="144" text-anchor="middle" font-size="11" fill="var(--text)">T3</text>
  <line x1="340" y1="135" x2="382" y2="135" stroke="var(--accent)" stroke-width="2"/>
  <line x1="395" y1="125" x2="465" y2="92" stroke="var(--line-strong)" stroke-width="1.2"/>
  <text x="398" y="60" text-anchor="middle" font-size="8.5" fill="var(--accent)" font-family="var(--font-mono)">2 řezy</text>
</svg>
:::

## Účelová funkce a omezení

HSP se formuluje jako optimalizační úloha. Pro každý blok *i* je binární proměnná `x_i` (0 = SW, 1 = HW). Hledá se přiřazení minimalizující jednu vlastnost při dodržení rozpočtů ostatních:

::: math
min  T(x)   za podmínek   A(x) ≤ A_max ,   P(x) ≤ P_max
:::

kde `T(x)` je celkový čas (latence) včetně režie komunikace na řezech, `A(x)` je obsazená plocha HW a `P(x)` spotřeba. Reálné formulace bývají *víceúčelové* — optimalizuje se vážená kombinace času, energie a plochy, případně se hledá Paretova fronta kompromisů.

| | Realizace v SW | Realizace v HW |
| :--- | :--- | :--- |
| Latence bloku | vyšší (sekvenční instrukce) | nižší (prostorový paralelismus) |
| Plocha | sdílí existující CPU → ~0 navíc | hradla / LUT navíc |
| Energie/operace | vyšší | nižší |
| Cena řezu (komunikace) | uvnitř CPU zdarma | přenos přes sběrnici se platí |
| Flexibilita | přepiš a nahraj | fixní po výrobě |

## Proč je to těžké — NP-úplnost

Volný HSP je v obecné podobě **NP-těžký**: počet možných přiřazení roste exponenciálně (2^n pro *n* bloků), protože každý blok lze nezávisle umístit na SW nebo HW. Vyčerpávající prohledání je proveditelné jen pro pár desítek bloků. Existují dvě cesty:

**Exaktní metody** najdou prokazatelně optimální řešení. Nejčastější je **MILP** (smíšené celočíselné lineární programování): účelová funkce i omezení se zapíší jako lineární výrazy nad binárními proměnnými a vyřeší ILP solverem. Výhoda je optimalita, nevýhoda škálovatelnost — MILP zvládá jen malé grafy úloh a obvykle jeden statický task graph bez preemptivního plánování.

**Heuristiky** obětují optimalitu za rozumný čas i pro velké grafy. Patří sem evoluční a rojové metody — **genetické algoritmy** (GA, populace kandidátních rozdělení křížených a mutovaných), **optimalizace rojem částic** (PSO), simulované žíhání, případně rychlé deterministické algoritmy typu dynamického programování pro speciální tvary grafu. Najdou kvalitní suboptimum blízké hranici dosažené ILP, ale bez záruky, že je nejlepší.

::: viz nav-hsp-partition "Přepínej bloky mezi SW a HW. Sleduj, jak se mění celková latence, plocha a režie sběrnice — a kdy řešení poruší rozpočet plochy."
:::

## Co-design jako iterace

Partitioning není jednorázové rozhodnutí. Po prvním rozdělení následuje **co-simulace** (společná simulace HW i SW), profilování a *re-partitioning*: blok, který se ukázal jako úzké hrdlo, se přesune do HW; blok, který by HW jen zvětšil bez měřitelného přínosu kvůli režii sběrnice, zůstane v SW. Tato smyčka „rozděl — změř — přesuň" je podstatou co-designu a vede k systému, který sedí na hranici plochy i spotřeby místo aby plýtval jednou z nich.

::: quiz "Proč se HSP řeší heuristikami jako GA nebo PSO, když MILP najde optimum?"
- [x] MILP je sice exaktní, ale jako NP-těžká úloha škáluje špatně — pro velké grafy úloh je nezvládnutelně pomalý, takže heuristiky dají blízké suboptimum v rozumném čase.
  > Přesně tak. Exaktní řešení je proveditelné jen pro malé instance; u reálných grafů se obětuje optimalita za škálovatelnost.
- [ ] MILP nedokáže pracovat s binárními proměnnými, proto je nepoužitelné.
  > Naopak — celočíselné (i binární) proměnné jsou přesně to, co ILP/MILP modeluje.
- [ ] Heuristiky vždy najdou lepší řešení než MILP.
  > Ne, najdou pouze suboptimum blízké optimu; MILP je z definice optimální tam, kde doběhne.
:::

::: link "A general approach to solving HW/SW partitioning based on evolutionary algorithms (ScienceDirect)" "https://www.sciencedirect.com/science/article/abs/pii/S0965997821000272"
:::

::: link "Algorithmic aspects of hardware/software partitioning (ACM TODAES)" "https://dl.acm.org/doi/10.1145/1044111.1044119"
:::

::: link "FPGA vs ASIC — NRE, per-unit cost a crossover volume (engineering guide)" "https://www.inovasense.com/insights/fpga-vs-asic"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Arató, P., Mann, Z.Á., Orbán, A.: „Algorithmic aspects of hardware/software partitioning" (ACM TODAES 10(1), 2005); Wang, G. et al.: evoluční přístupy k HW/SW partitioningu (Advances in Engineering Software, 2021); Knudsen & Madsen — LYCOS / PACE co-synthesis; Inovasense, AnySilicon — FPGA vs ASIC ekonomika (NRE, crossover volume).*
