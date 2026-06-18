---
title: Lineární gaussovský klasifikátor
---

# Lineární gaussovský klasifikátor

Tenhle klasifikátor jde na věc úplně jinak než perceptron. Je **generativní**: místo aby přímo hledal dělicí přímku, **modeluje, jak data vznikají** — předpokládá, že body každé třídy jsou "vygenerované" z nějakého pravděpodobnostního rozdělení. Konkrétně z **Gaussova** (normálního) rozdělení. Z těchto modelů pak Bayesovým pravidlem odvodí, do které třídy nový bod nejspíš patří.

Intuice: každou třídu si představ jako **mrak bodů ve tvaru elipsy** (vrstevnice Gaussovky). Klasifikátor se ptá: "Z kterého mraku tenhle bod pravděpodobněji vypadl?" Hranice mezi třídami je tam, kde jsou obě odpovědi stejně pravděpodobné.

Pozdě v této sekci uvidíme pointu okruhu: **se společnou kovariancí vyjde hranice lineární, s různými kovariancemi kvadratická.**

## Generativní model: každá třída je Gaussovka

Pro každou třídu $\omega_c$ modelujeme hustotu příznaků jako vícerozměrné normální rozdělení:

::: math
p(x \mid \omega_c) = \mathcal{N}(x; \mu_c, \Sigma_c) =
\frac{1}{(2\pi)^{D/2}\,|\Sigma_c|^{1/2}}
\exp\!\left(-\tfrac{1}{2}(x-\mu_c)^{\top}\Sigma_c^{-1}(x-\mu_c)\right)
:::

kde $\mu_c$ je **střední vektor** (těžiště mraku) a $\Sigma_c$ **kovarianční matice** (tvar a natočení elipsy). K tomu máme **apriorní pravděpodobnosti** tříd $P(\omega_c)$ (jak časté která třída je).

## Bayesovo optimální rozhodnutí

Chceme zařadit bod $x$ do třídy s **nejvyšší aposteriorní pravděpodobností** $P(\omega_c \mid x)$ — to je **MAP** (maximum a posteriori) pravidlo a je to **Bayesovsky optimální** rozhodnutí (minimalizuje pravděpodobnost chyby). Aposteriorní pravděpodobnost dostaneme Bayesovým vzorcem:

::: math
P(\omega_c \mid x) = \frac{p(x\mid \omega_c)\,P(\omega_c)}{p(x)}.
:::

Pro dvě třídy rozhodneme pro $\omega_1$, když $P(\omega_1\mid x) > P(\omega_2\mid x)$. Jmenovatel $p(x)$ je u obou tříd stejný, takže se zkrátí:

::: math
p(x\mid\omega_1)\,P(\omega_1) \;>\; p(x\mid\omega_2)\,P(\omega_2).
:::

Šikovné je pracovat s **logaritmem poměru** (log-likelihood ratio) — definujme diskriminační funkci $g(x)$ jako:

::: math
g(x) = \ln \frac{p(x\mid\omega_1)\,P(\omega_1)}{p(x\mid\omega_2)\,P(\omega_2)},
\qquad g(x) > 0 \Rightarrow \omega_1,\;\; g(x) < 0 \Rightarrow \omega_2.
:::

## Společná kovariance ⇒ lineární hranice (LDA)

Teď přijde klíčový předpoklad: **všechny třídy sdílejí stejnou kovarianční matici**

::: math
\Sigma_1 = \Sigma_2 = \dots = \Sigma.
:::

Geometricky to znamená, že všechny elipsy mají **stejný tvar i natočení**, liší se jen polohou těžiště. Dosaďme Gaussovky do $g(x)$ a logaritmujme. Konstanty $-\tfrac{D}{2}\ln(2\pi)$ a $-\tfrac{1}{2}\ln|\Sigma|$ jsou u obou tříd **identické** (díky společné $\Sigma$), takže se odečtou. Zůstanou kvadratické formy:

::: math
g(x) = -\tfrac{1}{2}(x-\mu_1)^{\top}\Sigma^{-1}(x-\mu_1)
       +\tfrac{1}{2}(x-\mu_2)^{\top}\Sigma^{-1}(x-\mu_2)
       + \ln\frac{P(\omega_1)}{P(\omega_2)}.
:::

Po roznásobení obou závorek se objeví člen $x^{\top}\Sigma^{-1}x$ v **obou** — a protože mají opačné znaménko, **kvadratické členy se vyruší**. Zbude pouze funkce **lineární** v $x$:

::: math
g(x) = w^{\top} x + w_0,
:::

kde

::: math
w = \Sigma^{-1}(\mu_1 - \mu_2),
\qquad
w_0 = -\tfrac{1}{2}\mu_1^{\top}\Sigma^{-1}\mu_1
      +\tfrac{1}{2}\mu_2^{\top}\Sigma^{-1}\mu_2
      + \ln\frac{P(\omega_1)}{P(\omega_2)}.
:::

To je přesně tvar, který už známe od perceptronu — **lineární rozhodovací funkce**, hranice je nadrovina $w^\top x + w_0 = 0$. Tomuto modelu se říká **LDA** (Linear Discriminant Analysis) nebo lineární gaussovský klasifikátor. Apriorní pravděpodobnosti vstupují **jen do posunu** $w_0$ (přes člen $\ln \tfrac{P(\omega_1)}{P(\omega_2)}$): když je jedna třída a priori častější, hranice se posune směrem k té vzácnější.

## Různé kovariance ⇒ kvadratická hranice (QDA)

Pokud předpoklad společné kovariance **neplatí** ($\Sigma_1 \ne \Sigma_2$), konstanty $-\tfrac{1}{2}\ln|\Sigma_c|$ se už neodečtou a hlavně se **nevyruší** kvadratické členy — v $g(x)$ zůstane člen $x^{\top}(\Sigma_2^{-1} - \Sigma_1^{-1})\,x$. Hranice je pak **kvadratická** (elipsa, parabola, hyperbola). Tento obecnější model se jmenuje **QDA** (Quadratic Discriminant Analysis).

Trade-off mezi nimi: QDA je pružnější (umí zakřivené hranice), ale má **víc parametrů** (vlastní kovariance pro každou třídu), takže potřebuje víc dat a snáz **přeučí**. LDA je úspornější a robustnější, když společná kovariance zhruba platí.

::: viz gaussian-linear-clf "Dvě Gaussovy třídy (elipsy = vrstevnice hustoty). Přepínač „společná Σ“ vs „různé Σ“: při společné kovarianci se kvadratické členy vyruší a rozhodovací hranice (zvýrazněná čára) je rovná; při různých kovariancích se zakřiví."
:::

## Vztah k logistické regresi a Bayesovu klasifikátoru

Dvě věci stojí za zapamatování. Za prvé, lineární gaussovský klasifikátor je **speciální případ Bayesova optimálního klasifikátoru** — je optimální *za předpokladu*, že data jsou skutečně gaussovská se společnou kovariancí. Když tento předpoklad neplatí, optimalitu ztrácí.

Za druhé, **aposteriorní pravděpodobnost vyjde jako sigmoida**. Z definice $g(x) = \ln\frac{P(\omega_1\mid x)}{P(\omega_2\mid x)} = \ln\frac{P(\omega_1\mid x)}{1 - P(\omega_1\mid x)}$ — pravá strana je **logit**. Vyřešením pro $P(\omega_1\mid x)$ dostaneme:

::: math
P(\omega_1\mid x) = \sigma\big(g(x)\big) = \frac{1}{1 + e^{-(w^{\top}x + w_0)}}.
:::

To je **úplně stejný funkční tvar** jako u logistické regrese (viz [[logisticka-regrese-sur]])! Rozdíl je v tom, **odkud** se váhy $w, w_0$ berou. Lineární gaussovský klasifikátor je odvozuje z odhadnutých $\mu_c, \Sigma$ (**generativně**), kdežto logistická regrese je odhadne **přímo** maximalizací věrohodnosti aposteriorní pravděpodobnosti (**diskriminativně**).

> Totéž téma je z bayesovské perspektivy rozebráno i v kurzu SUI (podtéma „Gaussovský klasifikátor"). Tady je pohled spíš geometrický (elipsy a tvar hranice), v SUI důsledněji pravděpodobnostní.

::: quiz "Proč má gaussovský klasifikátor se SPOLEČNOU kovarianční maticí lineární rozhodovací hranici?"
- [ ] Protože Gaussovo rozdělení je samo o sobě lineární
  > Gaussova hustota je naopak silně nelineární (exponenciála kvadratické formy); linearita hranice vzniká až rozdílem dvou log-hustot.
- [x] V log-poměru hustot se díky stejné Σ kvadratické členy x⊤Σ⁻¹x obou tříd vyruší
  > Oba kvadratické členy jsou identické a mají opačné znaménko, takže se odečtou; zbude funkce lineární v x, w = Σ⁻¹(μ₁−μ₂).
- [ ] Protože apriorní pravděpodobnosti tříd jsou stejné
  > Apriorní pravděpodobnosti ovlivní jen posun w₀; i s nestejnými prioritami zůstane hranice při společné Σ lineární.
- [ ] Protože se používá MAP místo ML odhadu
  > Volba MAP vs ML mění práh, ne tvar hranice; ten určuje právě (ne)společnost kovariancí.
:::

::: link "Bishop — Pattern Recognition and Machine Learning (4.2: Probabilistic Generative Models)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Linear discriminant analysis — odvození lineární hranice (Wikipedia)" "https://en.wikipedia.org/wiki/Linear_discriminant_analysis"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, kap. 4.2 — [PRML](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)); Duda, Hart, Stork: „Pattern Classification" (2. vyd., Wiley 2001, kap. 2 — Bayesovská teorie rozhodování); Hastie, Tibshirani, Friedman: „The Elements of Statistical Learning" (kap. 4.3 — LDA/QDA, [ESL](https://hastie.su.domains/ElemStatLearn/)).*
