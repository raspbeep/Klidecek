---
title: Particle Swarm Optimization (PSO)
---

# Particle Swarm Optimization (PSO)

Představ si hejno ptáků, kteří společně hledají místo s nejvíc potravou. Každý pták létá nad krajinou, pamatuje si nejlepší místo, kde *sám* byl, a zároveň pokukuje po tom, kde to vyšlo *nejlíp celému hejnu*. Mezi těmito dvěma tahy laviruje — a hejno se postupně sletí nad nejbohatším místem.

**Particle Swarm Optimization (PSO)** přesně tohle dělá v matematice. Hledáme minimum (nebo maximum) nějaké **fitness funkce** $f(\vec{x})$ ve **spojitém** $n$-rozměrném prostoru. Roj **částic** prolétává prostorem řešení a každá si pamatuje, kde už bylo dobře.

PSO je další příklad **rojové inteligence**: žádná částice neřídí ostatní, sdílejí jen jedinou informaci — kde je dosud nejlepší nalezené řešení. Z těchto lokálních pravidel emergentně vznikne sbíhání k optimu.

## Co si částice nese

Každá částice $k$ má v každém kroku:

- **polohu** $\vec{x}_k$ — bod v prostoru řešení (kandidátní řešení),
- **rychlost** $\vec{v}_k$ — vektor, kterým se právě pohybuje (kam a jak rychle letí),
- **osobní nejlepší** $\vec{p}_k$ (**pbest**) — nejlepší poloha, kterou tahle částice za celý běh navštívila,
- a sdílí **globální nejlepší** $\vec{g}$ (**gbest**) — nejlepší poloha napříč *celým* rojem.

Na začátku jsou částice **náhodně rozházené** po prostoru a fitness každé pozice se ohodnotí funkcí $f$. To připomíná genetický algoritmus (GA): populace jedinců, náhodná inicializace, fitness funkce.

::: svg
<svg viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="6" width="268" height="138" fill="var(--bg-inset)" stroke="var(--line)" stroke-width="0.6"/>
  <!-- particle -->
  <circle cx="90" cy="95" r="5" fill="var(--accent)"/>
  <text x="90" y="113" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text)">částice x⃗</text>
  <!-- inertia (current velocity) -->
  <line x1="90" y1="95" x2="135" y2="80" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#ah1)"/>
  <text x="138" y="73" font-size="8" font-family="var(--font-mono)" fill="var(--text-muted)">setrvačnost w·v⃗</text>
  <!-- cognitive toward pbest -->
  <circle cx="60" cy="40" r="3" fill="none" stroke="var(--accent)" stroke-width="1"/>
  <text x="40" y="34" font-size="8" font-family="var(--font-mono)" fill="var(--accent)">pbest</text>
  <line x1="90" y1="95" x2="63" y2="44" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 2" marker-end="url(#ah2)"/>
  <!-- social toward gbest -->
  <circle cx="215" cy="35" r="3" fill="var(--text)"/>
  <text x="200" y="29" font-size="8" font-family="var(--font-mono)" fill="var(--text)">gbest</text>
  <line x1="90" y1="95" x2="210" y2="40" stroke="var(--text)" stroke-width="1.2" stroke-dasharray="3 2" marker-end="url(#ah3)"/>
  <defs>
    <marker id="ah1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--text-muted)"/></marker>
    <marker id="ah2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)"/></marker>
    <marker id="ah3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--text)"/></marker>
  </defs>
</svg>
:::

## Pohyb částice: tři síly

Celá magie PSO je v jednom vzorci pro **aktualizaci rychlosti**. Nová rychlost je součet tří složek: kam částice *letěla*, kam ji táhne *vlastní* nejlepší zkušenost, a kam ji táhne *hejno*.

::: math
\vec{v}_k(t+1) = \underbrace{w\,\vec{v}_k(t)}_{\text{setrvačnost}} + \underbrace{c_p\, r_p \,(\vec{p}_k - \vec{x}_k(t))}_{\text{kognitivní (osobní)}} + \underbrace{c_g\, r_g \,(\vec{g} - \vec{x}_k(t))}_{\text{sociální (globální)}}
:::

A poloha se pak prostě posune o novou rychlost:

::: math
\vec{x}_k(t+1) = \vec{x}_k(t) + \vec{v}_k(t+1)
:::

Po každém posunu se přepočítá fitness; pokud je nová poloha lepší než $\vec{p}_k$, aktualizuje se pbest, a je-li lepší než $\vec{g}$, aktualizuje se i gbest.

Co dělají jednotlivé členy:

- $w$ — **setrvačnost** (inertia). Kolik si částice nese z předchozí rychlosti. Velké $w$ → částice „nabere setrvačnost", přestřeluje a víc **prozkoumává** (exploration). Malé $w$ → rychle podlehne tahům a **dolaďuje** lokálně (exploitation).
- $c_p, c_g$ — **akcelerační konstanty**. $c_p$ je síla tahu k *vlastnímu* pbestu (jak moc částici věří své paměti), $c_g$ je síla tahu ke *společnému* gbestu (jak moc následuje hejno).
- $r_p, r_g$ — **náhodná čísla** z $[0,1]$, čerstvě losovaná v *každém* kroku. Vnášejí stochastiku: částice netáhne k pbestu/gbestu pokaždé stejně silně, takže roj nezkolabuje do jediné přímky.

> **Pozor na historii vzorce.** $w\,\vec{v}_k$ člen v *původní* práci Kennedyho a Eberharta (1995) **nebyl** — tam byla rychlost jen $\vec{v}_k(t) + c_p r_p(\vec{p}_k - \vec{x}_k) + c_g r_g(\vec{g} - \vec{x}_k)$ (tedy jako by $w=1$). **Faktor setrvačnosti $w$ doplnili Shi a Eberhart až v roce 1998**, aby šlo ladit poměr explorace/exploatace. Verze s $w$ je dnes standardní, ale je dobré u zkoušky vědět, odkud pochází.

::: viz pso-swarm "Krokuj generace PSO na 2D vrstevnicové mapě s optimem uprostřed: částice se pohybují tažené pbest a gbest a sbíhají se. Posuvníkem nastav setrvačnost w a sleduj rozdíl mezi přestřelováním (velké w) a rychlým usazením (malé w)."
:::

## PSO versus genetický algoritmus

PSO i GA pracují s populací, fitness funkcí a stochastikou, ale **mechanismus hledání je úplně jiný**:

- **Žádné křížení, žádná mutace.** GA tvoří nové jedince rekombinací rodičů a mutací genů. PSO žádné jedince *nevytváří ani nezahazuje* — má pořád tytéž částice a jen jim **upravuje rychlost a polohu**. „Učení" je v paměti pbest/gbest, ne v genech.
- **Spojitý prostor.** Vzorec rychlosti počítá vektorové rozdíly $\vec{p}_k - \vec{x}_k$, takže PSO přirozeně sedí na **spojité** optimalizace v $\mathbb{R}^n$. (Pro diskrétní úlohy existují speciální varianty.)
- **Sdílení informace.** V GA se „dobré geny" šíří křížením přes generace; v PSO se nejlepší řešení šíří *okamžitě* přes sdílený gbest.

Pozor na slabinu: kvůli silnému tahu ke společnému gbestu může roj **předčasně zkonvergovat** (uvíznout v lokálním optimu). Proti tomu pomáhá dostatečné $w$, menší $c_g$, nebo varianty s lokálními pod-hejny, kde každá částice sleduje jen nejlepší ze svého okolí místo globálního gbest.

::: quiz "Čím se PSO zásadně liší od genetického algoritmu?"
- [ ] PSO nepoužívá fitness funkci
- [ ] PSO pracuje jen s diskrétními řešeními
- [x] PSO netvoří nové jedince křížením/mutací — má stálé částice a jen upravuje jejich rychlost a polohu podle pbest a gbest
  > GA generuje nové jedince rekombinací a mutací a staré zahazuje. PSO má po celou dobu stejné částice; informace o dobrých řešeních žije v paměti pbest/gbest a šíří se přes vzorec rychlosti, ne přes geny.
- [ ] PSO nemá žádný stochastický prvek
:::

::: link "Kennedy & Eberhart — Particle Swarm Optimization (ICNN 1995)" "https://doi.org/10.1109/ICNN.1995.488968"
:::

::: link "Shi & Eberhart — A Modified Particle Swarm Optimizer (inertia weight, 1998)" "https://doi.org/10.1109/ICEC.1998.699146"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Kennedy, J., Eberhart, R.: „Particle Swarm Optimization" (Proc. IEEE ICNN, 1995, [doi:10.1109/ICNN.1995.488968](https://doi.org/10.1109/ICNN.1995.488968)); Shi, Y., Eberhart, R.: „A Modified Particle Swarm Optimizer" (IEEE WCCI, 1998, [doi:10.1109/ICEC.1998.699146](https://doi.org/10.1109/ICEC.1998.699146)); Poli, R., Kennedy, J., Blackwell, T.: „Particle swarm optimization: An overview" (Swarm Intelligence, 2007, [doi:10.1007/s11721-007-0002-0](https://doi.org/10.1007/s11721-007-0002-0)).*
