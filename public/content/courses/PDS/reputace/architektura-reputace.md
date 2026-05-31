---
title: Architektura reputačního systému
---

# Architektura reputačního systému

Důvěra a reputace ([[duvera-reputace]]) potřebují *mechanismus*, který svědectví posbírá a převede na číslo. Tím je **reputační systém**. V této sekci popíšeme jeho obecnou architekturu a dvě hlavní topologie — *centralizovanou* a *distribuovanou*.

## Obecná architektura

Reputační systém má tři role:

- **Hodnotitelé (reputation agents)** — entity, které zasílají hodnocení.
- **Reputační systém** — jádro, které z hodnocení spočítá skóre.
- **Hodnocené entity (rated entities)** — entity, jejichž reputace se počítá.

Formálně: hodnotitel *X* zašle hodnocení **R_X(x)** entity *x*. Reputační systém z příchozích hodnocení spočítá **reputační skóre (rating)** dané entity — přičemž bere v úvahu **modely a metriky**, **historii** hodnocení a **důvěryhodnost hodnotitelů**.

::: svg "Obecná architektura: hodnotitelé A–E zasílají hodnocení R_X(x), systém počítá skóre s využitím modelů, metrik a historie"
<svg viewBox="0 0 520 200" font-family="ui-sans-serif, system-ui" font-size="12">
  <!-- agents -->
  <g>
    <circle cx="40" cy="40" r="15" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
    <text x="40" y="44" text-anchor="middle" fill="var(--text)" font-weight="600">A</text>
    <circle cx="40" cy="90" r="15" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
    <text x="40" y="94" text-anchor="middle" fill="var(--text)" font-weight="600">B</text>
    <circle cx="40" cy="140" r="15" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
    <text x="40" y="144" text-anchor="middle" fill="var(--text)" font-weight="600">C</text>
    <circle cx="95" cy="65" r="15" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
    <text x="95" y="69" text-anchor="middle" fill="var(--text)" font-weight="600">D</text>
    <circle cx="95" cy="115" r="15" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
    <text x="95" y="119" text-anchor="middle" fill="var(--text)" font-weight="600">E</text>
  </g>
  <text x="50" y="178" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">hodnotitelé (agents)</text>
  <!-- arrows to system -->
  <g stroke="var(--line-strong)" stroke-width="1.2" marker-end="url(#arRA)">
    <line x1="56" y1="42" x2="185" y2="80"/>
    <line x1="56" y1="90" x2="185" y2="90"/>
    <line x1="56" y1="138" x2="185" y2="100"/>
    <line x1="111" y1="67" x2="185" y2="86"/>
    <line x1="111" y1="113" x2="185" y2="94"/>
  </g>
  <text x="135" y="62" fill="var(--accent)" font-size="10.5" font-style="italic">R_X(x)</text>
  <!-- reputation system -->
  <rect x="185" y="62" width="130" height="56" rx="7" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="250" y="86" text-anchor="middle" fill="var(--text)" font-weight="600">Reputační</text>
  <text x="250" y="102" text-anchor="middle" fill="var(--text)" font-weight="600">systém</text>
  <!-- models / history -->
  <rect x="350" y="20" width="150" height="26" rx="6" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="425" y="37" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">modely · metriky</text>
  <rect x="350" y="52" width="150" height="26" rx="6" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="425" y="69" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">historie hodnocení</text>
  <g stroke="var(--line)" stroke-width="1" stroke-dasharray="3 2" marker-end="url(#arRA)">
    <line x1="350" y1="40" x2="316" y2="72"/>
    <line x1="350" y1="66" x2="316" y2="82"/>
  </g>
  <!-- rated entities -->
  <path d="M360 110 a45 9 0 0 0 90 0 v32 a45 9 0 0 1 -90 0 Z" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
  <ellipse cx="405" cy="110" rx="45" ry="9" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="1.4"/>
  <text x="405" y="160" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">hodnocené entity</text>
  <line x1="315" y1="100" x2="358" y2="120" stroke="var(--line-strong)" stroke-width="1.2" marker-end="url(#arRA)"/>
  <defs>
    <marker id="arRA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)"/>
    </marker>
  </defs>
</svg>
:::

**Kvalita reputace závisí na dvou věcech:** na *vstupních datech* (kdo a co hodnotí) i na *způsobu výpočtu* (jaká metrika a model). Špatná data zkazí i nejlepší algoritmus; špatný algoritmus zkazí i dobrá data.

## Centralizovaný vs. distribuovaný systém

Reputační systémy se liší tím, *kdo* hodnocení sbírá a počítá skóre. Přepni topologii v ukázce:

::: viz pds-reputation-arch
:::

### Centralizovaný reputační systém

- Hodnotitelé předávají hodnocení do **jednoho centrálního systému** (např. *Reputation Centre*).
- Centrum vyhodnocuje reputaci na základě příchozích hodnocení a dalších informací.
- **Příklad:** hodnocení reputace na základě **minulých transakcí** — z historie (*past*) se spočítá skóre, které se použije pro *budoucí potenciální transakci* (*present*).

Výhoda: jednoduchý a konzistentní pohled, snadná správa. Nevýhoda: jediný bod selhání i kontroly (komu centrum patří? komu věří?).

### Distribuovaný reputační systém

- Pro výměnu hodnocení se využívá **spolehlivý partner (relaying party)**.
- Tento partner počítá reputační skóre na základě získaných hodnocení.
- **Využití například v sítích P2P** pro hodnocení spolehlivosti uzlu (free-rider vs. poctivý uzel).

Výhoda: žádný centrální bod, vhodné do decentralizovaných sítí ([[duvera-reputace]] — Sybil/eclipse hrozby ale zůstávají). Nevýhoda: obtížnější garance konzistence a odolnosti.

| | Centralizovaný | Distribuovaný |
| :--- | :--- | :--- |
| Sběr hodnocení | do jednoho centra | přes relaying party / peery |
| Výpočet skóre | centrálně | distribuovaně |
| Typický příklad | tržiště (eBay), Reputation Centre | hodnocení spolehlivosti uzlu v P2P |
| Slabina | jediný bod selhání / kontroly | konzistence, odolnost vůči kolizi |

Konkrétní metody výpočtu skóre (součet, průměr, Beta, modely toků) rozebírá [[vypocet-skore]].

::: link "Jøsang, Ismail, Boyd: A Survey of Trust and Reputation Systems (2007)" "https://doi.org/10.1016/j.dss.2005.05.019"
:::

*Zdroj: PDS — přednáška Reputační systémy, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Jøsang, A., Ismail, R., Boyd, C.: „A Survey of Trust and Reputation Systems for Online Service Provision" (Decision Support Systems 43(2), 2007, [DOI 10.1016/j.dss.2005.05.019](https://doi.org/10.1016/j.dss.2005.05.019)); Slee, T.: „Some Obvious Things About Internet Reputation Systems" (2013).*
