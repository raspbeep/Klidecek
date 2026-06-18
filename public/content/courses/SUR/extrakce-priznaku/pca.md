---
title: Analýza hlavních komponent (PCA)
---

# Analýza hlavních komponent (PCA)

Představ si protáhlý, šikmo položený mrak bodů ve 2D — dvě veličiny, které jdou „ruku v ruce" (jsou korelované). I když data leží ve dvou rozměrech, skoro všechna jejich proměnlivost se odehrává podél jednoho směru, té dlouhé osy elipsy. Kdybychom data popsali jen souřadnicí *podél* té osy, ztratíme málo a ušetříme jeden rozměr.

To je celá myšlenka **analýzy hlavních komponent (Principal Component Analysis, PCA)**: najít nové osy zarovnané se směry, ve kterých se data nejvíc rozprostírají (mají největší **rozptyl, varianci**), a ty nejméně významné zahodit. PCA je tedy metoda **extrakce příznaků** a **redukce dimenze**.

Klíčové: PCA je **nesupervizovaná (unsupervised)** — při výpočtu vůbec nevidí, do které třídy bod patří. Hledá jen směry maximálního rozptylu *všech* dat dohromady.

## Intuice: rotace os do směrů rozptylu

PCA dělá vlastně jen dvě věci. Nejdřív **rotaci** souřadného systému: místo původních os $x, y$ zvolí nové, na sebe kolmé osy — **hlavní komponenty**. První z nich (**PC1**) míří do směru *největšího* rozptylu. Druhá (**PC2**) je na ni kolmá a bere největší *zbývající* rozptyl. V $d$ rozměrech pokračujeme: každá další komponenta je kolmá na všechny předchozí a maximalizuje zbylý rozptyl.

Pak (volitelně) **projekci**: ponecháme jen prvních $K$ komponent (těch s největším rozptylem) a zbytek zahodíme. Tím klesne dimenze z $d$ na $K$.

Rotace samotná data nemění — jen je popisuje v jiné bázi; vzdálenosti mezi body zůstávají. Informaci ztrácíme až tou projekcí, a to schválně tu „nejlevnější" (směry s nejmenším rozptylem).

::: viz pca-projection "2D mrak bodů; přetahuj body a sleduj, jak se stáčí hlavní komponenty (červená PC1, zelená PC2) a kovarianční elipsa. Vlastní čísla λ₁, λ₂ = rozptyl podél os; dole je 1D projekce na PC1 a oranžové úsečky jsou rezidua (chyba rekonstrukce, kterou PC1 minimalizuje)."
:::

Všimni si v obrázku dvou ekvivalentních pohledů na PC1: je to směr **maximálního rozptylu** projekce *a zároveň* směr, který **minimalizuje kolmá rezidua** (vzdálenosti bodů od osy). Maximalizovat rozptyl podél osy a minimalizovat odchylky od osy je totéž — proto je PCA „nejlepší" lineární projekce ve smyslu nejmenší chyby rekonstrukce.

## Formalismus: vlastní vektory kovarianční matice

Mějme $N$ vzorků $x_1, \dots, x_N$, kde $x_i \in \mathbb{R}^d$.

**1. Centrování.** PCA pracuje s rozptylem kolem středu, takže nejdřív přesuneme počátek do těžiště. Spočteme střední hodnotu (těžiště) a odečteme ji:

::: math
\mu = \frac{1}{N}\sum_{i=1}^{N} x_i, \qquad \tilde{x}_i = x_i - \mu
:::

**2. Kovarianční matice.** Ta popisuje, jak jsou centrovaná data rozprostřena: na diagonále je rozptyl jednotlivých příznaků, mimo diagonálu jejich vzájemné korelace.

::: math
\Sigma = \frac{1}{N}\sum_{i=1}^{N} \tilde{x}_i \tilde{x}_i^{\mathsf{T}} \;\in\; \mathbb{R}^{d\times d}
:::

Matice $\Sigma$ je symetrická a pozitivně semidefinitní.

**3. Hledání směru maximálního rozptylu.** Promítneme centrovaný bod na jednotkový směr $u$ ($\lVert u\rVert = 1$): projekce je číslo $z_i = u^{\mathsf{T}}\tilde{x}_i$. Rozptyl těchto projekcí vyjde elegantně:

::: math
\sigma_z^2 = \frac{1}{N}\sum_{i=1}^{N}\left(u^{\mathsf{T}}\tilde{x}_i\right)^2 = u^{\mathsf{T}}\!\left(\frac{1}{N}\sum_i \tilde{x}_i\tilde{x}_i^{\mathsf{T}}\right)\!u = u^{\mathsf{T}}\Sigma\, u
:::

Chceme $u$, které **maximalizuje** $u^{\mathsf{T}}\Sigma u$ za podmínky $u^{\mathsf{T}}u = 1$ (jinak by stačilo $u$ nafouknout). To je vázaný extrém — řešíme přes Lagrangeovy multiplikátory $L(u,\lambda) = u^{\mathsf{T}}\Sigma u - \lambda(u^{\mathsf{T}}u - 1)$. Derivace podle $u$ položená na nulu dá:

::: math
\Sigma\, u = \lambda\, u
:::

To je přesně rovnice **vlastních vektorů**! Hledané směry jsou tedy vlastní vektory kovarianční matice. Navíc, vynásobíme-li $\Sigma u = \lambda u$ zleva $u^{\mathsf{T}}$, dostaneme $u^{\mathsf{T}}\Sigma u = \lambda$ — **rozptyl podél vlastního vektoru je roven jeho vlastnímu číslu** $\lambda$. Maximální rozptyl tedy znamená *největší vlastní číslo*.

## Spektrální rozklad a projekce

Protože je $\Sigma$ symetrická, lze ji rozložit (diagonalizovat) jako

::: math
\Sigma = E\,\Lambda\,E^{\mathsf{T}},\qquad \lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_d \ge 0
:::

kde sloupce $E = [e_1, \dots, e_d]$ jsou ortonormální vlastní vektory (směry hlavních komponent) a $\Lambda = \mathrm{diag}(\lambda_1,\dots,\lambda_d)$ jsou rozptyly podél nich, seřazené sestupně.

**Transformace.** Nové souřadnice bodu (skóre v prostoru hlavních komponent) získáme rotací centrovaného vektoru:

::: math
y = E^{\mathsf{T}}(x - \mu)
:::

Kovarianční matice transformovaných dat vyjde $\Sigma_y = E^{\mathsf{T}}\Sigma E = \Lambda$ — je **diagonální**. To znamená, že nové příznaky jsou navzájem **nekorelované** (jeden z hlavních důvodů, proč PCA děláme).

**Redukce dimenze.** Chceme-li snížit dimenzi na $K < d$, vezmeme jen prvních $K$ vlastních vektorů $E_K = [e_1, \dots, e_K]$ (ty s největšími $\lambda$) a promítneme:

::: math
y_K = E_K^{\mathsf{T}}(x - \mu) \;\in\; \mathbb{R}^K
:::

## Kolik komponent zachovat: vysvětlený rozptyl

Kolik komponent $K$ vzít? Pomůže **vysvětlený rozptyl (explained variance)** — podíl rozptylu zachyceného prvními $K$ komponentami z celku:

::: math
\text{vysvětlený rozptyl}(K) = \frac{\lambda_1 + \dots + \lambda_K}{\lambda_1 + \dots + \lambda_d}
:::

Typicky se $K$ volí tak, aby tento podíl dosáhl třeba 95 %. Ve viz výše hodnota `explained` ukazuje přesně tohle pro $K=1$ (jen PC1).

**Malý příklad.** Mějme už vycentrovaná data s kovarianční maticí $\Sigma = \begin{bmatrix} 4 & 2 \\ 2 & 4 \end{bmatrix}$. Z charakteristické rovnice $\det(\Sigma - \lambda I) = 0$ dostaneme $\lambda^2 - 8\lambda + 12 = 0$, tedy $\lambda_1 = 6$, $\lambda_2 = 2$. Vlastní vektory vyjdou $e_1 = \tfrac{1}{\sqrt2}[1,1]^{\mathsf{T}}$ (směr PC1, podél diagonály) a $e_2 = \tfrac{1}{\sqrt2}[1,-1]^{\mathsf{T}}$. PC1 vysvětluje $\tfrac{6}{6+2} = 75\,\%$ rozptylu. Promítneme-li na PC1, zahodíme jen 25 % rozptylu, ale ušetříme polovinu dimenzí.

## Na co si dát pozor

- **Citlivost na škálování.** PCA reaguje na absolutní velikost rozptylu. Mají-li příznaky různé jednotky (kg vs. mm), dominuje ten s největšími čísly. Proto se před PCA data obvykle **standardizují** (z-score: odečíst průměr, vydělit směrodatnou odchylkou).
- **Jen lineární struktury.** PCA hledá pouze lineární kombinace. Na zakřivené (nelineární) struktury je slabá — tam pomohou kernelové či neuronové varianty.
- **Numerika.** V praxi se místo explicitní $\Sigma$ často počítá rovnou **SVD** (singulární rozklad) centrované datové matice — je numericky stabilnější a dá tytéž hlavní komponenty.
- **Ignoruje třídy.** Protože je PCA nesupervizovaná, může klidně zahodit směr, který sice má malý rozptyl, ale skvěle odděluje třídy. Na to je lepší LDA.

::: quiz "Co udává největší vlastní číslo λ₁ kovarianční matice v PCA?"
- [ ] Počet tříd v datech
- [x] Rozptyl dat podél první hlavní komponenty (směru maximální variability)
  > Z odvození u^T Σ u = λ plyne, že rozptyl projekce na vlastní vektor je roven jeho vlastnímu číslu; λ₁ je tedy největší možný rozptyl podél jednoho směru.
- [ ] Chybu klasifikace po projekci
- [ ] Vzdálenost mezi středy tříd
:::

::: link "Shlens — A Tutorial on Principal Component Analysis" "https://arxiv.org/abs/1404.1100"
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 12.1: Principal Component Analysis)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Shlens, J.: „A Tutorial on Principal Component Analysis" (2014, [arXiv:1404.1100](https://arxiv.org/abs/1404.1100)); Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [PRML](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — kap. 12; Jolliffe, I. T.: „Principal Component Analysis" (Springer 2002).*
