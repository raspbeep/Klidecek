---
title: Gibbsovo vzorkování a MCMC
---

# Gibbsovo vzorkování a MCMC

Variační Bayes posterior **aproximuje** jednoduchou distribucí $q$. Vzorkovací metody jdou na to jinak: z posterioru $p(\theta \mid X)$ přímo **generují vzorky** — aniž by ho musely analyticky vyjádřit. Stačí mít velkou hromadu vzorků a s nimi už spočítáme, co potřebujeme.

## Proč vůbec vzorkovat?

V bayesovském přístupu nás typicky zajímá **prediktivní distribuce** — pravděpodobnost nového bodu $x'$ po vidění dat $X$:

::: math
p(x' \mid X) = \int p(x' \mid \theta)\,p(\theta \mid X)\,d\theta.
:::

Tenhle integrál je obecně neřešitelný. Ale pokud máme $L$ vzorků $\hat\theta_1, \dots, \hat\theta_L$ z posterioru $p(\theta \mid X)$, můžeme integrál nahradit **empirickým průměrem** (to je princip Monte Carlo):

::: math
p(x' \mid X) \approx \frac{1}{L}\sum_{l=1}^{L} p(x' \mid \hat\theta_l).
:::

Intuice: integrál „přes všechny $\theta$ vážený posteriorem" nahradíme „průměrem přes $\theta$ natažené z posterioru". Čím víc vzorků, tím přesnější odhad. Otázka pak zní: **jak efektivně generovat vzorky z komplikovaného vysokodimenzionálního posterioru?**

Jeden klasický pokus je metoda **accept–reject**: vzorkuje z jednoduché náhradní distribuce $M\,g(x) \ge p(x)$ a vzorky náhodně přijímá/odmítá. Funguje, ale ve vyšších dimenzích je téměř všechno odmítnuto a metoda je beznadějně neefektivní. Lepší nápad je vzorky **negenerovat nezávisle**, ale využít strukturu prostoru — k tomu slouží MCMC.

## MCMC: vzorky jako trajektorie Markovova řetězce

**MCMC** (*Markov Chain Monte Carlo*) je rodina algoritmů, které generují vzorky jako **trajektorii Markovova řetězce**:

::: math
X_0 \to X_1 \to X_2 \to X_3 \to \cdots
:::

**Markovova vlastnost** znamená, že každý nový vzorek $X_{t+1}$ závisí **pouze na předchozím** $X_t$, ne na celé historii. Přechod řídí **přechodová pravděpodobnost** $T(y \mid x)$ — šance, že z aktuálního stavu $x$ skočíme do $y$.

Kouzlo MCMC je v tom, že $T$ navrhneme tak, aby **stacionární** (ustálené) rozdělení řetězce bylo právě naše cílové posteriorní $p(x)$. „Stacionární" znamená: jakmile se řetězec do tohoto rozdělení dostane, další kroky ho už nezmění. Postačující (ne nutnou) podmínkou je **detailed balance**:

::: math
p(x)\,T(y \mid x) = p(y)\,T(x \mid y) \qquad \forall\, x, y.
:::

Intuice: „tok pravděpodobnosti" ze stavu $x$ do $y$ je v rovnováze s tokem z $y$ zpět do $x$. Když to platí pro všechny dvojice, systém se neustálí v žádném jiném rozdělení než $p(x)$. (Sečteme-li detailed balance přes $x$, vyjde maticově $p^\top T = p^\top$ — $p$ je levý vlastní vektor přechodové matice příslušející vlastní hodnotě 1, tedy stacionární rozdělení.)

## Burn-in a autokorelace: dva háčky MCMC

**Burn-in.** Řetězec startuje v nějakém libovolném bodě $X_0$, který obvykle neleží v oblasti vysoké pravděpodobnosti. První vzorky tedy posterior nereprezentují — řetězec se teprve „zahřívá". Tuto úvodní fázi nazýváme **burn-in** a vzorky z ní **zahazujeme**. Až po dostatečném počtu kroků řetězec „dorazí" ke stacionárnímu rozdělení a teprve další vzorky $X_B, X_{B+1}, \dots$ bereme jako (korelované) vzorky z $p(x)$.

::: svg
<svg viewBox="0 0 460 110" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="460" height="110" fill="var(--bg-inset)"/>
  <rect x="14" y="22" width="170" height="34" rx="4" fill="none" stroke="oklch(0.6 0.18 22)" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="99" y="16" text-anchor="middle" font-size="10" fill="oklch(0.6 0.18 22)">burn-in (zahazujeme)</text>
  <!-- burn-in samples -->
  <g fill="oklch(0.6 0.18 22)">
    <circle cx="36" cy="39" r="7"/><circle cx="78" cy="39" r="7"/><circle cx="120" cy="39" r="7"/><circle cx="162" cy="39" r="7"/>
  </g>
  <g fill="var(--bg-inset)" font-size="9" text-anchor="middle">
    <text x="36" y="42">X₀</text><text x="78" y="42">X₁</text><text x="120" y="42">X₂</text><text x="162" y="42">X₃</text>
  </g>
  <!-- kept samples -->
  <g fill="var(--accent)">
    <circle cx="236" cy="39" r="7"/><circle cx="288" cy="39" r="7"/><circle cx="340" cy="39" r="7"/><circle cx="392" cy="39" r="7"/>
  </g>
  <g fill="var(--bg-inset)" font-size="8.5" text-anchor="middle">
    <text x="236" y="42">X_B</text><text x="288" y="42">X₊₁</text><text x="340" y="42">X₊₂</text><text x="392" y="42">X₊₃</text>
  </g>
  <text x="206" y="42" text-anchor="middle" font-size="12" fill="var(--text-muted)">···</text>
  <!-- arrows -->
  <g stroke="var(--line-strong)" stroke-width="1">
    <line x1="45" y1="39" x2="69" y2="39"/><line x1="87" y1="39" x2="111" y2="39"/><line x1="129" y1="39" x2="153" y2="39"/>
    <line x1="245" y1="39" x2="279" y2="39"/><line x1="297" y1="39" x2="331" y2="39"/><line x1="349" y1="39" x2="383" y2="39"/>
  </g>
  <text x="314" y="74" text-anchor="middle" font-size="10" fill="var(--accent)">∼ p(x)  (vzorky z cíle)</text>
  <text x="314" y="90" text-anchor="middle" font-size="9" fill="var(--text-faint)">po konvergenci ke stacionárnímu rozdělení</text>
</svg>
:::

**Autokorelace.** Protože $X_{t+1}$ závisí na $X_t$, jsou sousední vzorky **korelované** — nesou méně informace než stejný počet nezávislých vzorků. Silná autokorelace znamená, že řetězec se prostorem plíží pomalu a potřebujeme jich hodně (nebo je řídce *„thinnujeme"* — bereme každý $k$-tý). Efektivní počet vzorků je proto menší než ten skutečný.

## Gibbsovo vzorkování: vzorkuj postupně z podmíněných

**Gibbsovo vzorkování** je konkrétní MCMC algoritmus pro situace, kdy:

- chceme vzorkovat ze složitého **sdruženého** rozdělení $p(x_1, x_2, \dots, x_d)$,
- přímé vzorkování z něj je obtížné,
- ale vzorkovat z **podmíněných** rozdělení $p(x_i \mid \text{ostatní})$ je snadné.

Myšlenka: místo abychom skočili na celý vektor najednou, aktualizujeme **jednu souřadnici po druhé**, vždy podmíněně na aktuálních hodnotách ostatních. Pro dvě proměnné $x, y$ (zobecnění je přímočaré):

1. Zvol počáteční bod $(x^{(0)}, y^{(0)})$.
2. Vzorkuj $x^{(t+1)} \sim p\big(x \mid y^{(t)}\big)$ — aktualizuj $x$ při zafixovaném $y$.
3. Vzorkuj $y^{(t+1)} \sim p\big(y \mid x^{(t+1)}\big)$ — aktualizuj $y$ při (právě aktualizovaném) $x$.
4. Opakuj kroky 2–3.

Lze ukázat, že takový řetězec splňuje detailed balance vůči sdruženému $p(x, y)$, takže po burn-inu generuje vzorky z $p(x,y)$. V obrázku to vypadá jako pravoúhlá „schodišťová" trajektorie: každý krok je buď čistě vodorovný (měníme $x$), nebo čistě svislý (měníme $y$).

::: viz gibbs-sampling "2D korelovaná gaussovka. Krokuj Gibbs sampler — vidíš pravoúhlé kroky (střídavě x|y a y|x). Body se hromadí a postupně vykreslí tvar rozdělení. Vyzkoušej velkou korelaci ρ: kroky se zmenší a sampler se plíží = silná autokorelace."
:::

### Příklad: 2D normální rozdělení

Vezměme 2D normální rozdělení se středem $0$ a kovarianční maticí

::: math
\Sigma = \begin{pmatrix} 1 & 1/2 \\ 1/2 & 1 \end{pmatrix}, \qquad \rho = 1/2.
:::

Pro normální rozdělení je každé podmíněné rozdělení zase normální. Při jednotkových rozptylech a korelaci $\rho$ platí obecně $p(x \mid y) = \mathcal{N}(\rho\,y,\ 1-\rho^2)$. Pro $\rho = 1/2$:

::: math
p(x \mid y) = \mathcal{N}\!\Big(\tfrac{y}{2},\ \tfrac{3}{4}\Big), \qquad p(y \mid x) = \mathcal{N}\!\Big(\tfrac{x}{2},\ \tfrac{3}{4}\Big).
:::

Z 2D normálky bychom vzorkovat uměli i přímo — Gibbs zde slouží jen jako názorná ilustrace. Každý krok posune jednu souřadnici a zůstane v oblasti vysoké hustoty, takže body postupně „obkreslí" elipsu hustoty.

## Kdy Gibbs vs Metropolis–Hastings

Gibbsovo vzorkování je **speciální případ** obecnějšího algoritmu **Metropolis–Hastings (MH)**. Rozdíl:

- **Gibbs** vzorkuje rovnou z podmíněných rozdělení $p(x_i \mid \text{ostatní})$. Je elegantní a **každý vzorek se vždy přijme** (žádné zamítání), ale potřebuje, abychom z těch podmíněných uměli vzorkovat — typicky když má model **konjugované** priory. Skvěle se hodí pro hierarchické modely (GMM, latentní proměnné).
- **Metropolis–Hastings** navrhne kandidáta z libovolné *proposal* distribuce a přijme/zamítne ho podle poměru hustot. Je **univerzálnější** (nepotřebuje podmíněná rozdělení v uzavřené formě), ale musíme ladit proposal a část navržených vzorků se zahodí.

Pravidlo palce: **umíš vzorkovat z podmíněných? Použij Gibbs. Neumíš? Použij Metropolis–Hastings.**

Pozor na společnou slabinu: pokud je posterior **multimodální** nebo proměnné **silně korelované** a módy oddělené údolím nízké hustoty, Gibbs (jako každé MCMC s lokálními kroky) může v jednom módu **uvíznout** a ostatní vůbec neprozkoumat. U silné korelace navíc krokuje jen po malých krůčcích podél os, takže autokorelace roste a konvergence se dramaticky zpomalí.

::: quiz "Co je hlavní podmínka, aby šlo na model nasadit Gibbsovo vzorkování?"
- [ ] Sdružené rozdělení $p(x_1,\dots,x_d)$ musí být normální
- [ ] Musíme znát normalizační konstantu (evidenci) posterioru
- [x] Musíme umět snadno vzorkovat z podmíněných rozdělení $p(x_i \mid \text{ostatní})$
  > Gibbs aktualizuje jednu proměnnou po druhé právě tak, že z její podmíněné distribuce vzorkuje. To bývá splněno u modelů s konjugovanými priory. Evidenci znát nepotřebujeme — to je hlavní výhoda MCMC.
- [ ] Proměnné musí být navzájem nezávislé
:::

## Gibbs pro bayesovský GMM (poznámka)

Typická aplikace: bayesovský GMM, kde chceme vzorkovat z $p(\pi, \mu, \lambda, z \mid X)$ — váhy $\pi$, středy $\mu$, přesnosti $\lambda$ a skrytá přiřazení bodů ke komponentám $z$. Sdružený posterior je neřešitelný, ale podmíněná rozdělení uzavřená jsou. Jeden *sweep* střídavě:

1. **Přiřazení $z$** — pro každý bod $x_n$ vzorkuj komponentu z $P(z_n = c \mid \cdots) \propto \mathcal{N}(x_n \mid \mu_c, \lambda_c^{-1})\,\pi_c$ (analogie EM responsibilities).
2. **Parametry komponent $\mu_c, \lambda_c$** — z Normal–Gamma posterioru z bodů přiřazených ke $c$.
3. **Váhy $\pi$** — z Dirichletova posterioru $\pi \sim \mathrm{Dir}(\alpha + N^*)$, kde $N^*$ jsou počty bodů v komponentách.

Po burn-inu (desítky až stovky iterací) máme $L$ vzorků a prediktivní distribuci aproximujeme empirickým průměrem jako výše. Varianta **collapsed Gibbs** kontinuální parametry $\mu, \lambda, \pi$ analyticky marginalizuje (vyintegruje) a vzorkuje **jen diskrétní přiřazení** $z_i$ — tím se snižuje dimenze a sampler je efektivnější.

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 11: Sampling Methods)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Geman & Geman — Stochastic Relaxation, Gibbs Distributions (IEEE PAMI 1984, původní Gibbs sampler)" "https://ieeexplore.ieee.org/document/4767596"
:::

::: link "Robert & Casella — Monte Carlo Statistical Methods (2004)" "https://link.springer.com/book/10.1007/978-1-4757-4145-2"
:::

---

*Zdroj: BAYa státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C.M.: „Pattern Recognition and Machine Learning" (2006, kap. 11, [odkaz](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)); Geman, S., Geman, D.: „Stochastic Relaxation, Gibbs Distributions, and the Bayesian Restoration of Images" (IEEE PAMI 1984, [odkaz](https://ieeexplore.ieee.org/document/4767596)); Robert, C.P., Casella, G.: „Monte Carlo Statistical Methods" (Springer 2004, [odkaz](https://link.springer.com/book/10.1007/978-1-4757-4145-2)).*
