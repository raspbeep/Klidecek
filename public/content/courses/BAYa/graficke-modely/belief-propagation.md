---
title: Šíření přesvědčení a EM algoritmus
---

# Šíření přesvědčení a EM algoritmus

Máme model — Bayesovskou síť nebo MRF — a chceme **inferenci**: spočítat marginály jednotlivých proměnných, případně podmíněné na pozorování. Naivně to znamená sestavit celé sdružené rozdělení a vysčítat ostatní proměnné. Pro $N$ proměnných po $K$ stavech je to $O(K^N)$ — beznadějně drahé.

**Šíření přesvědčení (belief propagation, BP)**, známé také jako **sum-product algoritmus**, je trik, jak místo jedné velké sumy provést mnoho malých lokálních výpočtů. Uzly si mezi sebou posílají **zprávy**, z nichž každá odpovídá na otázku *"co si zbytek grafu myslí o hodnotě této proměnné?"*. Na stromech to dá **přesné** marginály v lineárním čase.

## Intuice: forward-backward na řetězci

Začneme nejjednodušším případem — **řetězcem** $N$ proměnných (každá $K$ stavů) s párovými potenciály:

::: math
P(\mathbf{x}) = \frac{1}{Z}\,\psi_{1,2}(x_1, x_2)\,\psi_{2,3}(x_2, x_3)\cdots \psi_{N-1,N}(x_{N-1}, x_N).
:::

Chceme marginál $P(x_n) = \sum_{\mathbf{x}\setminus x_n} P(\mathbf{x})$. Trik je **distributivita**: sumu "zatlačíme dovnitř" co nejblíž k proměnným, kterých se týká. Tím vzniknou dvě řady zpráv:

**Dopředná zpráva $\alpha(x_n)$** akumuluje vliv všeho *nalevo* od $x_n$:

::: math
\alpha(x_1) = 1, \qquad \alpha(x_n) = \sum_{x_{n-1}} \psi_{n-1,n}(x_{n-1}, x_n)\,\alpha(x_{n-1}).
:::

**Zpětná zpráva $\beta(x_n)$** akumuluje vliv všeho *napravo* od $x_n$:

::: math
\beta(x_N) = 1, \qquad \beta(x_n) = \sum_{x_{n+1}} \psi_{n,n+1}(x_n, x_{n+1})\,\beta(x_{n+1}).
:::

Marginál je pak součin obou vlivů (a normalizace):

::: math
P(x_n) = \frac{1}{Z}\,\alpha(x_n)\,\beta(x_n).
:::

**Co se ušetří.** Spočítáním všech $\alpha$ zleva doprava a všech $\beta$ zprava doleva (celkem $2N$ vektorů délky $K$) získáš marginály *všech* uzlů najednou, se složitostí $O(N K^2)$ — polynomiálně místo exponenciálně. Tomuto schématu na řetězci/HMM se říká **forward-backward algoritmus**; sum-product je jeho zobecnění na libovolné stromy a faktorové grafy.

## Sum-product na faktorovém grafu

Na faktorovém grafu (viz [[mrf-faktorovy-graf]]) jsou dva druhy uzlů, takže máme dva druhy zpráv. Obě jsou funkce nad stavy proměnné, na kterou míří. Značíme $\mathrm{ne}(\cdot)$ sousedy uzlu.

**Zpráva z proměnné $v$ do faktoru $f$.** Proměnná jen *posbírá* vše, co dostala od ostatních sousedních faktorů, a pošle součin dál:

::: math
\mu_{v\to f}(v) = \prod_{f^* \in \mathrm{ne}(v)\setminus\{f\}} \mu_{f^*\to v}(v).
:::

List grafu nemá od koho přijímat → posílá neutrální zprávu $\mu_{v\to f}(v) = 1$.

**Zpráva z faktoru $f$ do proměnné $v$.** Faktor zkombinuje svou funkci se zprávami od ostatních proměnných a *vymarginalizuje* všechny proměnné kromě cílové $v$:

::: math
\mu_{f\to v}(v) = \sum_{\mathbf{x}\setminus v} \Big( f(\mathbf{x}) \prod_{y \in \mathrm{ne}(f)\setminus\{v\}} \mu_{y\to f}(y) \Big).
:::

Dvě operace: (a) vynásob faktor příchozími zprávami, (b) sečti pryč všechny proměnné kromě $v$. Odtud "sum-product" — sumace součinu.

**Marginál (belief).** Jakmile uzel obdrží zprávy ze *všech* směrů, jeho marginál je součin příchozích zpráv (až na normalizaci):

::: math
P(v) \propto \prod_{f \in \mathrm{ne}(v)} \mu_{f\to v}(v).
:::

**Příklad aritmetiky.** Dostane-li proměnná $X$ zprávy $\mu_{f_1\to X} = [0.3, 0.7]$ a $\mu_{f_2\to X} = [0.4, 0.2]$, pak $P(X) \propto [0.12, 0.14]$, po normalizaci $[0.46, 0.54]$.

::: viz belief-propagation "Krokuj sum-product na řetězci faktorového grafu: nejdřív se pošlou dopředné zprávy (zleva doprava), pak zpětné (zprava doleva). Sleduj, jak po každém kroku přibyde zpráva a jak se v uzlech, které už mají zprávy z obou stran, složí marginál."
:::

## Stromy vs. cykly: loopy BP

Proč zdůrazňujeme strom? **Na stromě (a faktorovém grafu bez cyklů) projde každá zpráva každou hranou právě jednou v každém směru** a algoritmus dá **přesné** marginály. Existuje rozvrh ("od listů ke kořeni a zpět"), po kterém je hotovo a výsledek je správný.

Na grafu **s cykly** žádný takový konečný rozvrh není — zprávy by kolovaly donekonečna. Spustí se tedy **loopy belief propagation**: zprávy se posílají iterativně (často paralelně) a doufá se v konvergenci. To má dva háčky:

- BP **nemusí konvergovat** (zprávy mohou oscilovat).
- I když zkonverguje, výsledek je obecně jen **aproximace** marginálů, ne přesná hodnota.

Přesto loopy BP v praxi často funguje překvapivě dobře (např. dekódování LDPC kódů, kde je to vlastně turbo dekódování) a je to základ řady aproximačních metod.

## EM jako iterace inference + odhad

Belief propagation počítá marginály, *když známe parametry modelu*. Co když je **neznáme** a navíc máme **skryté (latentní) proměnné**, které nepozorujeme? Pak nastupuje **EM algoritmus** (*Expectation–Maximization*), který se točí ve dvou krocích a krásně využívá inferenci jako svou součást.

**Proč nestačí prosté MLE.** U směsi gaussovek (GMM, viz [[em-algoritmus]] v SUR) je každý bod $x$ vygenerován tak, že se nejdřív vybere komponenta $z$ (latentní!) a pak se z ní nasampluje. Marginální log-věrohodnost má sumu *uvnitř* logaritmu:

::: math
\ell(\theta) = \sum_{i} \log \sum_{k} p(x^{(i)}, z^{(i)}{=}k; \theta).
:::

Logaritmus přes sumu se nedá rozdělit, takže pro $\theta$ neexistuje uzavřený vzorec. EM tenhle problém obejde.

**Klíčový nástroj — ELBO.** Pro libovolné rozdělení $Q(z)$ nad latentní proměnnou dá Jensenova nerovnost dolní mez (*evidence lower bound*):

::: math
\log p(x; \theta) \geq \mathrm{ELBO}(x; Q, \theta) = \sum_z Q(z)\log\frac{p(x, z; \theta)}{Q(z)}.
:::

Mez je **těsná** (rovnost) právě tehdy, když $Q(z) = p(z \mid x; \theta)$, tj. když je $Q$ rovno **aposteriornímu** rozdělení latentní proměnné.

**Iterace EM:**

- **E-krok (Expectation = inference):** při fixovaných parametrech $\theta$ spočítej aposteriorní rozdělení latentní proměnné $Q_i(z) = p(z \mid x^{(i)}; \theta)$. Tím se dolní mez dotkne $\log p(x;\theta)$ v aktuálním bodě. *Tohle je přesně úloha inference* — pro GMM to jsou tzv. responsibilities $r_{ik} = p(z{=}k \mid x^{(i)})$, pro řetězce/stromy by to počítalo právě belief propagation.
- **M-krok (Maximization = odhad parametrů):** při fixovaném $Q$ maximalizuj ELBO přes $\theta$. Pro GMM má uzavřený tvar — parametry se aktualizují jako vážené průměry s vahami $r_{ik}$.

**Proč to funguje.** Věrohodnost v každé iteraci **neklesá**:

::: math
\ell(\theta^{(t+1)}) \;\overset{(1)}{\geq}\; \sum_i \mathrm{ELBO}(x^{(i)}; Q_i^{(t)}, \theta^{(t+1)}) \;\overset{(2)}{\geq}\; \sum_i \mathrm{ELBO}(x^{(i)}; Q_i^{(t)}, \theta^{(t)}) \;\overset{(3)}{=}\; \ell(\theta^{(t)}).
:::

(1) ELBO je dolní mez (Jensen); (2) M-krok zvolil $\theta^{(t+1)}$ jako maximum ELBO; (3) E-krok zvolil $Q^{(t)}$ těsně pro $\theta^{(t)}$. EM konverguje do **lokálního** maxima — globální optimum zaručené není, proto se spouští opakovaně z různých inicializací (často z $k$-means).

::: quiz "Jaký je vztah mezi E-krokem EM algoritmu a inferencí v grafickém modelu?"
- [ ] E-krok odhaduje parametry θ, inference s tím nesouvisí
  > Naopak — odhad parametrů je M-krok. E-krok dělá něco jiného.
- [x] E-krok je úloha inference: počítá aposteriorní rozdělení latentní proměnné p(z | x; θ) při fixovaných parametrech
  > Správně. E-krok zafixuje θ a spočítá posterior nad skrytými proměnnými (responsibilities u GMM, forward-backward / belief propagation u řetězců a stromů). M-krok pak při fixovaném posterioru maximalizuje ELBO přes θ.
- [ ] E-krok počítá partiční funkci Z neorientovaného modelu
  > To je samostatný (těžký) problém; není to náplň E-kroku.
- [ ] E-krok a inference jsou nesouvisející algoritmy nad stejným grafem
  > E-krok inferenci přímo používá — je to její konkrétní instance.
:::

::: link "Bishop — PRML, kap. 8.4 (Sum-Product) a kap. 9 (EM)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Kschischang, Frey, Loeliger — Factor Graphs and the Sum-Product Algorithm (IEEE Trans. IT, 2001)" "https://ieeexplore.ieee.org/document/910572"
:::

---

*Zdroj: BAYa státnicové okruhy NMAL, VUT FIT. Externí reference: Kschischang, F.R., Frey, B.J., Loeliger, H.-A.: „Factor Graphs and the Sum-Product Algorithm" (IEEE Trans. Information Theory 2001, [DOI](https://ieeexplore.ieee.org/document/910572)) — sum-product; Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 8–9](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — BP a EM; Dempster, A.P., Laird, N.M., Rubin, D.B.: „Maximum Likelihood from Incomplete Data via the EM Algorithm" (J. Royal Stat. Soc. B, 1977).*
