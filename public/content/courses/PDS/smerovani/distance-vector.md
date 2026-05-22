---
title: Distance vector — Bellman-Ford a sousedské drby
---

# Distance vector — routing by rumor

První rodina směrovacích protokolů, *historicky i koncepčně*. **Distance vector** (DV) protokoly nevidí celou topologii — vidí jen *sousedy* a *věří*, co jim sousedé říkají. *"Routing by rumor"* — drbárna. Algoritmický základ: **Bellman-Ford**. Tato sekce probere matematiku, hlavní problém (count-to-infinity) a obranné mechanismy.

## Princip

Každý router udržuje **distance vector** — pro každou destinaci `D` zná:

$$
\text{DV}_r(D) = (\text{distance}, \text{next-hop})
$$

Router *nezná topologii* — neví, kudy paket půjde za next-hopem. Jediná znalost:

- Mám sousedy `n_1, n_2, …, n_k`.
- Znám *cost na linku* ke každému (`cost(r, n_i)`).
- Soused `n_i` mi *občas pošle* svůj DV: "k destinaci `D` mám distanci `d_i`".

Z toho router počítá vlastní vzdálenost:

$$
\text{distance}_r(D) = \min_i \left[ \text{cost}(r, n_i) + d_i \right]
$$

A jako next-hop si zapamatuje souseda, který minimum přinesl.

## Bellman-Fordův algoritmus

Iterativní algoritmus pro nejkratší cesty v grafu *bez* znalosti celé topologie. Klasický zápis:

```
INIT:
  for each node v in V:
    d[v] = infinity
  d[source] = 0

ITERATE:
  while changes:
    for each edge (u, v) with weight w:
      if d[u] + w < d[v]:
        d[v] = d[u] + w
```

V routingu se to *distribuuje* — každý router je *autonomní agent*:

1. **Init**: znám sousedy a jejich link costs. Pro každého souseda `n_i`: `d[n_i] = cost(r, n_i)`, ostatní destinace `d = ∞`.
2. **Periodically**: posli svůj DV všem sousedům.
3. **Receive**: když soused `n_i` pošle `DV_{n_i}`, pro každou destinaci `D`:

$$
\text{new\_d}(D) = \text{cost}(r, n_i) + \text{DV}_{n_i}(D)
$$

Pokud `new_d(D) < current_d(D)`, *aktualizuj* DV a *next-hop = n_i*.

::: svg "Bellman-Ford v jedné iteraci"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.5">
    <circle cx="100" cy="100" r="22"/>
    <circle cx="270" cy="60" r="22"/>
    <circle cx="270" cy="140" r="22"/>
    <circle cx="430" cy="100" r="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="105">U</text>
    <text x="270" y="65">V</text>
    <text x="270" y="145">X</text>
    <text x="430" y="105">Z</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5">
    <line x1="120" y1="92"  x2="252" y2="68"/>
    <line x1="120" y1="108" x2="252" y2="132"/>
    <line x1="288" y1="68"  x2="412" y2="92"/>
    <line x1="288" y1="132" x2="412" y2="108"/>
  </g>
  <g fill="var(--text)" font-size="10" text-anchor="middle">
    <text x="180" y="78">cost=2</text>
    <text x="180" y="135">cost=3</text>
    <text x="350" y="78">cost=5</text>
    <text x="350" y="135">cost=4</text>
  </g>
  <text x="105" y="40" fill="var(--text-muted)" font-size="10">U vidí: přes V → 2+5=7</text>
  <text x="105" y="180" fill="var(--text-muted)" font-size="10">U vidí: přes X → 3+4=7</text>
  <text x="280" y="180" fill="var(--text)" font-size="11" font-weight="600">d[Z] u U = min(7, 7) = 7</text>
</svg>
:::

Router U počítá: do Z se jde přes V (cost 2+5=7) nebo přes X (cost 3+4=7). Volí jednu (ECMP nebo arbitrární). Po další iteraci se může lepší cesta objevit.

## Konvergence

V *statickém* grafu (žádné změny topologie) konverguje BF v `O(|V|)` iterací — po `|V|−1` iteracích jsou všechny vzdálenosti optimal.

Časová náročnost na jednotlivém routeru: `O(k·d)` kde `k = počet sousedů`, `d = počet destinací` (řádek z DV souseda × všechny entries).

## Problémy — count-to-infinity

Klasický defekt DV protokolů. Příklad:

```
A ─── B ─── C
1     1
```

`A` má distanci `B=1, C=2 (přes B)`. `B` má `A=1, C=1`. `C` má `A=2 (přes B), B=1`.

**Link B-C selže.** `B` to detekuje (zmizel pojem souseda C), nastaví `d[C] = ∞`. Ale ještě před tím, než stihne *pošle update*, dostane od `A` jeho DV:

```
A → B: "do C mám distanci 2"
```

`B` si myslí: *"Aha, A umí do C v ceně 2 → zkusím to přes A"*. Nastaví `d[C] = 2 + 1 = 3`, next-hop A.

Pošle to `A`: *"Do C mám 3"*. `A` si přepočte: `d[C] = 3 + 1 = 4` (přes B). Update zpět B. `B` přepočte: `d[C] = 4 + 1 = 5`…

**Bouncing** — A a B inkrementují distance, ale ani jeden *nemá* skutečnou cestu. Kdy se to zastaví? Když distance dosáhne *infinity* — v RIPu se `∞ = 16`. Trvá 16 výměn → minuty. Mezitím *pakety se ztrácí v smyčce* mezi A a B.

::: viz count-to-inf "Klikni „shoď A↔cíl" — sleduj, jak B i C bouncují metrický update. Přepnutí obrany ukáže split horizon vs poison reverse vs žádná."
:::

## Obranné mechanismy

### 1. Split horizon

> **Neoznamuj** zpět souseda trasu, kterou jsi se *od něj* naučil.

Jednoduché. Když `A` se naučí `d[C] = 2 přes B`, *neoznámí* tuto trasu zpět `B`. `B` se nemůže zmást.

Implementační variant:

- **Plain split horizon** — vůbec ji neposílej.
- **Split horizon with poisoned reverse** — pošli s `cost = ∞` (mocnější signál: *"tímto směrem se ke mně do C nedostaneš"*).

V RIPu *povinné*.

### 2. Triggered updates

> Při změně **okamžitě** pošli update, *necíkej* na periodický timer.

Pomáhá rychlejší konvergenci. Kombinuje se s **damping** (krátký timer, aby se neflood-ovalo při hopping linku).

### 3. Hold-down timer

> Když se trasa stane "nedosažitelnou", *neakceptuj* nové trasy do té destinace po dobu hold-down (typicky 180 s v RIPu).

Brání obnově "starých" rumour. Cena: pomalá konvergence při legitimní obnově (link flap).

### 4. Counting to infinity → max metric

> Definuj `∞` jako *malé* číslo. Když metrik dosáhne, *nesmí to být cesta*.

V RIPu `∞ = 16` (proto max síť = 15 hopů). To **omezuje velikost sítě**, ale terminuje count-to-infinity v <16 výměnách.

## DUAL — algoritmus EIGRP

EIGRP přidává *vylepšení* nad klasický Bellman-Ford. **DUAL** (Diffusing Update Algorithm) garantuje **loop-free convergence** *bez* count-to-infinity.

Klíčové koncepty:

- **Feasible Distance (FD)** — nejlepší známá vzdálenost k destinaci.
- **Reported Distance (RD)** — co soused tvrdí.
- **Feasibility Condition (FC)** — `RD < FD`. Soused, který *blíže* než my nemůže být na cyklické cestě k nám.
- **Successor** — sousedi splňující FC; primary next-hop.
- **Feasible Successor (FS)** — backup; po pádu primary se *okamžitě* aktivuje (bez výpočtu).

Když primary umírá:

- Pokud máme FS → instalujeme za <1 s.
- Pokud ne → spustí se **diffusion** — query všem sousedům, čekáme na reply, *žádné instalování* z neověřeného source.

Důsledek: konvergence v jednotkách sekund vs RIP minuty. Cena: složitější protokol, větší paměť.

## Charakteristiky DV obecně

| Aspekt | DV |
| :--- | :--- |
| Znalost topologie | jen sousedi |
| Algoritmus | Bellman-Ford / DUAL |
| Konvergence | pomalá (count-to-infinity) |
| Paměť | malá (jen DV) |
| CPU | lehký |
| Škálování | desítky až stovky routerů |
| Robustnost na změny | slabá |
| Bandwidth na updates | vysoký (full DV každých 30 s) |

DV je *vhodný* pro:

- Malé homogenní sítě (LAN, branch).
- IoT s omezenými resources (Babel ve mesh sítích).
- Vendor-locked deployments (EIGRP v čistě-Cisco prostředí).

DV *nevhodný* pro:

- Velké páteřní sítě (poměr CPU/bandwidth nevýhodný).
- Sítě s rychlými změnami (anti-konvergence).

## Co dál

Konkrétní DV protokoly — **RIP, RIPng, EIGRP, Babel** — v [[dv-protokoly]]. Pak skok do *opačné* filosofie — **link-state** ([[link-state]]) — kde router *zná celou topologii* a počítá Dijkstrou.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Bellman, R.: „On a Routing Problem" (Quarterly of Applied Mathematics 16(1), 1958); Ford, L.R., Fulkerson, D.R.: *Flows in Networks* (Princeton 1962); Doyle, J., Carroll, J.: *Routing TCP/IP, Vol. I* (Cisco Press 2005), kap. 4; [RFC 2453 — RIPv2](https://www.rfc-editor.org/rfc/rfc2453); Garcia-Luna-Aceves, J.J.: „Loop-Free Routing Using Diffusing Computations" (IEEE/ACM Trans. Networking 1(1), 1993).*
