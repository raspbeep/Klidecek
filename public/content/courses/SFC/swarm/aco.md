---
title: Ant Colony Optimization (ACO)
---

# Ant Colony Optimization (ACO)

Představ si kolonii mravenců, kteří hledají nejkratší cestu od mraveniště k jídlu. Žádný mravenec nemá mapu ani nevidí celou trasu — přesto kolonie jako celek krátkou cestu spolehlivě najde. **ACO** je rodina optimalizačních algoritmů, která tenhle trik napodobuje: spousta jednoduchých „mravenců" (agentů) hledá řešení a komunikuje spolu jen nepřímo přes **stopy v prostředí**.

Tomuhle stylu se říká **rojová inteligence** (swarm intelligence): chytré chování vzniká *emergentně* z mnoha jednoduchých jedinců, kteří se řídí lokálními pravidly. Žádné centrální řízení neexistuje — a přesto roj řeší globální problém.

## Biologická intuice: feromonová stopa

Skutečný mravenec při chůzi vylučuje na zem chemickou látku — **feromon**. Když jiný mravenec narazí na cestu s feromonem, je *pravděpodobnější*, že po ní půjde taky. To je **pozitivní zpětná vazba**: čím víc mravenců cestou prošlo, tím je voňavější a tím víc dalších mravenců přiláká.

Proč z toho vyjde *krátká* cesta? Mravenec na krátké trase se vrátí dřív, takže za stejnou dobu po ní projde *vícekrát* a uloží víc feromonu. Krátká cesta se tak „nabíjí" rychleji než dlouhá.

A aby se kolonie nezasekla na první náhodné trase, feromon se časem **vypařuje**. Stopy, které nikdo neobnovuje, vyblednou. Vypařování je tedy způsob, jak zapomínat na slepé uličky.

::: svg
<svg viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="75" r="11" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.2"/>
  <text x="30" y="79" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text)">hnízdo</text>
  <circle cx="250" cy="75" r="11" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.2"/>
  <text x="250" y="79" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text)">jídlo</text>
  <!-- short path (top): thick = lots of pheromone -->
  <path d="M 41 70 Q 140 25 239 70" fill="none" stroke="var(--accent)" stroke-width="5" opacity="0.9" stroke-linecap="round"/>
  <text x="140" y="30" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--accent)">krátká → silný feromon</text>
  <!-- long path (bottom): thin = faded pheromone -->
  <path d="M 41 82 Q 140 145 239 82" fill="none" stroke="var(--accent-line)" stroke-width="1.2" opacity="0.5" stroke-linecap="round"/>
  <text x="140" y="138" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-muted)">dlouhá → stopa vyprchá</text>
</svg>
:::

## Od mravenců k algoritmu

V počítači reprezentujeme úlohu jako **graf**: uzly jsou body, mezi kterými se rozhodujeme, hrany jsou možné přechody. Každá hrana $(i,j)$ nese množství feromonu $\tau_{ij}$. Mravenci postupně staví řešení tím, že přecházejí z uzlu do uzlu.

Klasická úloha pro ACO je **problém obchodního cestujícího (TSP)**: navštívit každé město právě jednou a vrátit se, s co nejkratší celkovou trasou. Uzly = města, hrana = silnice mezi nimi, řešení = jeden uzavřený okruh.

**Umělí mravenci** mají oproti reálným pár vylepšení, která dávají smysl jen ve výpočtu:

- **Paměť (tabu seznam):** každý mravenec si pamatuje, kde už byl, aby v rámci jednoho okruhu nenavštívil město dvakrát. Množina $\text{Allowed}_k$ jsou města, která mravenec $k$ ještě nemá v tabu seznamu.
- Feromon obvykle **ukládají až po dokončení okruhu** — když znají jeho celkovou délku, a tedy i jeho kvalitu.
- Znají dopředu **délky hran**, takže můžou kromě feromonu zohlednit i „jak daleko to je".

## Pravděpodobnostní volba hrany

Když mravenec $k$ stojí v uzlu $i$ a vybírá, kam dál, nerozhoduje se natvrdo — losuje. Pravděpodobnost, že zvolí hranu do uzlu $j$, je úměrná dvěma věcem: **kolik je tam feromonu** ($\tau_{ij}$) a **jak je ta hrana výhodná** podle heuristiky ($\eta_{ij}$).

::: math
p_{ij}^{k} = \frac{[\tau_{ij}]^{\alpha}\,[\eta_{ij}]^{\beta}}{\sum_{l \in \text{Allowed}_k} [\tau_{il}]^{\alpha}\,[\eta_{il}]^{\beta}}, \qquad j \in \text{Allowed}_k
:::

Pro $j$ mimo povolené uzly je $p_{ij}^k = 0$. Jmenovatel jen normalizuje, aby součet přes všechna povolená $j$ dal 1.

Co znamenají symboly:

- $\tau_{ij}$ — **feromon** na hraně. „Kolik mravenců sem už šlo (a uspělo)."
- $\eta_{ij} = 1/d_{ij}$ — **heuristika** („viditelnost"), kde $d_{ij}$ je délka hrany. Krátká hrana má vysoké $\eta$, je tedy lákavá *sama o sobě*, i bez feromonu.
- $\alpha$ — váha feromonu. $\alpha = 0$ → mravenec ignoruje feromon a řídí se jen vzdáleností (čistě hladový hledání).
- $\beta$ — váha heuristiky. $\beta = 0$ → mravenec ignoruje vzdálenost a jde jen za feromonem.

> **Malý příklad.** Mravenec v uzlu $i$ má na výběr hrany do $j$ a $l$. Dosaď $\alpha=1$, $\beta=2$. Hrana do $j$: $\tau=4$, $d=2$ (tedy $\eta=0{,}5$), váha $= 4^1 \cdot 0{,}5^2 = 1{,}0$. Hrana do $l$: $\tau=2$, $d=1$ ($\eta=1$), váha $= 2^1 \cdot 1^2 = 2{,}0$. Pravděpodobnosti: $p_{ij} = 1/3 \approx 33\,\%$, $p_{il} = 2/3 \approx 67\,\%$. Bližší uzel $l$ vyhrává, ale $j$ pořád má reálnou šanci — exploration zůstává zachována.

## Aktualizace feromonů: vypařování + odměna

Když všichni mravenci dokončí svůj okruh, přijde **globální update** feromonu na všech hranách. Děje se ve dvou krocích: nejdřív se všechno trochu vypaří, pak se přidá odměna od mravenců.

::: math
\tau_{ij}(t+1) = (1 - \rho)\,\tau_{ij}(t) + \Delta\tau_{ij}
:::

Parametr $\rho \in (0, 1]$ je **rychlost vypařování**. Člen $(1-\rho)\,\tau_{ij}$ je „kolik staré stopy zůstane". Velké $\rho$ → rychlé zapomínání (víc explorace, ale i riziko, že kolonie zahodí dobrou trasu). Malé $\rho$ → stopy přetrvávají dlouho.

Přídavek $\Delta\tau_{ij}$ je součet příspěvků všech $M$ mravenců, kteří hranu $(i,j)$ použili:

::: math
\Delta\tau_{ij} = \sum_{k=1}^{M} \Delta\tau_{ij}^{k}, \qquad
\Delta\tau_{ij}^{k} = \begin{cases} \dfrac{Q}{L_k} & \text{hrana } (i,j) \text{ je v okruhu mravence } k \\[4pt] 0 & \text{jinak} \end{cases}
:::

Klíčové je $Q/L_k$: $Q$ je konstanta, $L_k$ je **celková délka okruhu** mravence $k$. Čím *kratší* okruh, tím *víc* feromonu mravenec na své hrany uloží. Tím se krátké trasy odměňují a pozitivní zpětná vazba je přitáhne další mravence.

Po updatu se tabu seznamy vyprázdní a spustí se další iterace. Po mnoha iteracích se feromon nakoncentruje na hranách nejkratšího nalezeného okruhu.

::: viz aco-tsp "Krokuj iterace Ant System na malém TSP: mravenci staví okruhy, ukládají Q/L feromonu a slabé stopy se vypařují. Sleduj, jak hrany nejkratší trasy „tloustnou“ a krátký okruh se vynoří."
:::

## Varianty: jak se vyhnout uvíznutí

Základní **Ant System (AS)** výše má problém: může příliš rychle „zatuhnout" na jedné trase a uvíznout v lokálním optimu. Proto vznikly modifikace, které je dobré znát aspoň jmenovitě:

- **Elitist strategy** — navíc posiluje hrany dosud nejlepšího okruhu. Zrychluje konvergenci, ale zvyšuje riziko uvíznutí v lokálním extrému.
- **ACS (Ant Colony System)** — zavádí pseudonáhodné pravidlo: s pravděpodobností $q_0$ mravenec rovnou *deterministicky* zvolí nejlepší hranu (maximum součinu feromonu a viditelnosti), jinak losuje jako v AS. Parametr $q_0$ tak ladí poměr explorace/exploatace.
- **MMAS (Max–Min Ant System)** — feromon na konci iterace ukládá jen *jeden* nejlepší mravenec a hodnoty $\tau$ jsou svorkami omezeny do $[\tau_{\min}, \tau_{\max}]$. To brání tomu, aby jedna hrana úplně převálcovala ostatní (zachová se diverzita).
- **Rank-Based AS** — feromon ukládá pevný počet nejlepších mravenců, a to vážený podle pořadí (ranku): nejlepší přispívá nejvíc.

::: quiz "Proč se v ACO feromon nechává časem vypařovat?"
- [ ] Aby se ušetřila paměť při výpočtu
- [x] Aby kolonie „zapomínala“ na slabé trasy a neuvízla na první náhodně nalezené cestě
  > Bez vypařování by se feromon jen hromadil; první trasa, kterou pár mravenců náhodou posílilo, by nasbírala neúměrnou výhodu a algoritmus by uvízl. Vypařování maže stopy, které nikdo neobnovuje, a udržuje exploraci.
- [ ] Aby všechny hrany měly nakonec stejné množství feromonu
- [ ] Protože reální mravenci ukládají feromon jen jednou
:::

::: link "Dorigo, Maniezzo, Colorni — Ant System (IEEE TSMC, 1996)" "https://doi.org/10.1109/3477.484436"
:::

::: link "Ant colony optimization — Scholarpedia (Dorigo & Stützle)" "http://www.scholarpedia.org/article/Ant_colony_optimization"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Dorigo, M., Maniezzo, V., Colorni, A.: „Ant System: Optimization by a Colony of Cooperating Agents" (IEEE Trans. SMC-B, 1996, [doi:10.1109/3477.484436](https://doi.org/10.1109/3477.484436)); Dorigo, M., Gambardella, L.M.: „Ant Colony System" (IEEE Trans. Evol. Comput., 1997, [doi:10.1109/4235.585892](https://doi.org/10.1109/4235.585892)); Stützle, T., Hoos, H.: „MAX–MIN Ant System" (Future Gen. Comput. Syst., 2000, [doi:10.1016/S0167-739X(00)00043-1](https://doi.org/10.1016/S0167-739X%2800%2900043-1)).*
