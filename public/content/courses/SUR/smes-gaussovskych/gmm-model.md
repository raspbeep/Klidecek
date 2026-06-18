---
title: Model směsi Gaussových rozložení
---

# Model směsi Gaussových rozložení

Jedna Gaussovka (normální rozdělení) umí popsat jen data, která tvoří **jeden zvonovitý shluk** kolem svého středu. Jakmile mají reálná data víc shluků, „díru" uprostřed nebo nesymetrický tvar, jediná Gaussovka selže — natáhne se přes všechno a vystihne to špatně.

**Směs Gaussových rozložení** (Gaussian Mixture Model, **GMM**) tenhle problém řeší jednoduše: hustotu složí jako **vážený součet více Gaussovek**. Každá komponenta pokryje jeden shluk a dohromady umí aproximovat skoro libovolně členitou hustotu. Intuice: místo jednoho kopce postavíme několik kopců a sečteme je do jednoho pohoří.

## Definice modelu

Hustota GMM s $K$ komponentami je

::: math
p(\mathbf{x} \mid \Theta) = \sum_{k=1}^{K} \pi_k\, \mathcal{N}(\mathbf{x}; \boldsymbol{\mu}_k, \boldsymbol{\Sigma}_k)
:::

Parametry $\Theta = \{\pi_k, \boldsymbol{\mu}_k, \boldsymbol{\Sigma}_k\}_{k=1}^{K}$ jsou:

- **$\pi_k$ — váhy** (mixing coefficients): jak velký „díl" celkové hustoty má $k$-tá komponenta. Musí platit $\pi_k \ge 0$ a $\sum_k \pi_k = 1$, takže váhy jsou samy o sobě rozdělení pravděpodobnosti přes komponenty.
- **$\boldsymbol{\mu}_k$ — střední hodnoty**: kde každá Gaussovka leží.
- **$\boldsymbol{\Sigma}_k$ — kovarianční matice**: jak je každá Gaussovka široká a natočená.

Jedna $D$-rozměrná Gaussovka má tvar

::: math
\mathcal{N}(\mathbf{x}; \boldsymbol{\mu}, \boldsymbol{\Sigma}) = \frac{1}{(2\pi)^{D/2}\,|\boldsymbol{\Sigma}|^{1/2}} \exp\!\left(-\tfrac{1}{2}(\mathbf{x}-\boldsymbol{\mu})^{\mathsf T}\boldsymbol{\Sigma}^{-1}(\mathbf{x}-\boldsymbol{\mu})\right)
:::

V interaktivní figuře níže si pohraj s vahami a tvarem komponent a sleduj, jak se mění výsledná (modrá) hustota — to je přesně to, co GMM modeluje.

::: viz gmm-density "Tři 1D Gaussovky — posuň váhy π, středy μ a šířky σ a sleduj, jak se jejich vážený součet (modrá křivka) skládá z jednotlivých komponent (šedé křivky)."
:::

## Skryté proměnné: ze které komponenty vzorek pochází?

GMM je **generativní model** — popisuje, jak data vznikla. Vygenerovat jeden vzorek znamená:

1. Hoď kostkou podle vah $\pi$ a vyber komponentu $z \in \{1, \dots, K\}$ (tj. $P(z=k) = \pi_k$).
2. Z vybrané Gaussovky $\mathcal{N}(\boldsymbol{\mu}_z, \boldsymbol{\Sigma}_z)$ vygeneruj samotné $\mathbf{x}$.

Proměnná $z$ — která komponenta vzorek vyrobila — je **skrytá (latentní) proměnná**: v trénovacích datech vidíme jen $\mathbf{x}$, ne $z$. Kdybychom $z$ znali, byl by odhad triviální (každou komponentu bychom natrénovali z jejích vlastních bodů). Právě to, že $z$ neznáme, dělá učení GMM zajímavým.

Protože při vyhodnocení hustoty nevíme, která komponenta vzorek vyrobila, musíme přes $z$ **marginalizovat** (sečíst přes všechny možnosti) — a tím dostaneme přesně směsový vzorec nahoře:

::: math
p(\mathbf{x}) = \sum_{k=1}^{K} P(z=k)\, p(\mathbf{x} \mid z=k) = \sum_{k=1}^{K} \pi_k\, \mathcal{N}(\mathbf{x}; \boldsymbol{\mu}_k, \boldsymbol{\Sigma}_k)
:::

## Věrohodnost dat a proč nejde maximalizovat přímo

Parametry chceme zvolit tak, aby model přidělil **co nejvyšší pravděpodobnost** datům, která jsme viděli — to je princip **maximální věrohodnosti** (maximum likelihood). Pro $N$ nezávislých vzorků $\{\mathbf{x}_n\}$ je věrohodnost součin a log-věrohodnost součet:

::: math
\log L(\Theta) = \sum_{n=1}^{N} \log p(\mathbf{x}_n \mid \Theta) = \sum_{n=1}^{N} \log\!\left( \sum_{k=1}^{K} \pi_k\, \mathcal{N}(\mathbf{x}_n; \boldsymbol{\mu}_k, \boldsymbol{\Sigma}_k) \right)
:::

U **jediné** Gaussovky bychom log-věrohodnost zderivovali, položili rovnou nule a dostali hezké uzavřené vzorce ($\hat{\boldsymbol{\mu}}$ = průměr dat, $\hat{\boldsymbol{\Sigma}}$ = výběrová kovariance). U GMM to **nejde** — a vidíme to přímo z toho vzorce: je tam $\log$ **přes součet** komponent ($\log \sum_k \dots$). Logaritmus se „nedostane dovnitř" k jednotlivým $\pi_k \mathcal{N}(\cdot)$, takže derivace podle parametrů dají soustavu **provázaných nelineárních rovnic** bez analytického řešení.

Hlubší příčina je ta skrytá proměnná: kdybychom u každého bodu znali jeho $z$, log by se rozpadl na součet hezkých členů. Neznámé $z$ ty členy „slepuje" dohromady. Řešení je proto iterativní — algoritmus **EM**, který skrytá přiřazení odhaduje a parametry zpřesňuje střídavě.

::: quiz "Proč nemá maximalizace log-věrohodnosti GMM uzavřené řešení jako u jedné Gaussovky?"
- [ ] Protože kovarianční matice nemusí být invertovatelná
- [x] Protože log-věrohodnost obsahuje logaritmus přes součet komponent ($\log \sum_k \pi_k \mathcal{N}$), takže derivace dají provázané nelineární rovnice
  > U jedné Gaussovky je $\log \mathcal{N}$ a derivace vyjde čistě; u směsi logaritmus „obaluje" součet, který nejde rozdělit, a souvisí to s neznámou skrytou proměnnou $z$.
- [ ] Protože váhy $\pi_k$ se musí sčítat na 1
- [ ] Protože data nejsou nezávislá
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 9: Mixture Models and EM)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 9](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — směsové modely; Dempster, A. P., Laird, N. M., Rubin, D. B.: „Maximum Likelihood from Incomplete Data via the EM Algorithm" (J. Royal Stat. Soc. B, 1977, [doi:10.1111/j.2517-6161.1977.tb01600.x](https://doi.org/10.1111/j.2517-6161.1977.tb01600.x)).*
