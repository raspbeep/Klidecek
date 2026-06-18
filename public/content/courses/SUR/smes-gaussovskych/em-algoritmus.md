---
title: EM algoritmus
---

# EM algoritmus

GMM nejde natrénovat jedním vzorcem, protože neznáme skrytá přiřazení vzorků ke komponentám. **EM algoritmus** (Expectation–Maximization) řeší přesně tuhle situaci „slepice–vejce":

- Kdybychom znali parametry komponent, snadno bychom spočítali, ke které komponentě každý bod patří.
- Kdybychom znali přiřazení bodů, snadno bychom spočítali parametry komponent.

EM tedy **střídá** tyto dva odhady. Začne s nějakým počátečním nástřelem parametrů a opakuje dva kroky, dokud se to neustálí. Je to obecná technika pro **modely se skrytými proměnnými** — GMM je jen nejznámější příklad.

## E-krok: spočti odpovědnosti (měkké přiřazení)

V **E-kroku** (Expectation) bereme aktuální parametry za dané a ptáme se: *jaká je pravděpodobnost, že bod $\mathbf{x}_n$ vyrobila komponenta $k$?* To je posteriorní pravděpodobnost přiřazení, které se říká **odpovědnost** (responsibility) $\gamma_{nk}$. Spočte se Bayesovým pravidlem:

::: math
\gamma_{nk} = P(z_n = k \mid \mathbf{x}_n) = \frac{\pi_k\, \mathcal{N}(\mathbf{x}_n; \boldsymbol{\mu}_k, \boldsymbol{\Sigma}_k)}{\sum_{j=1}^{K} \pi_j\, \mathcal{N}(\mathbf{x}_n; \boldsymbol{\mu}_j, \boldsymbol{\Sigma}_j)}
:::

Čitatel je „kolik tahle komponenta na bod přispívá" (váha × hustota), jmenovatel normuje tak, aby $\sum_k \gamma_{nk} = 1$. Je to **měkké** přiřazení: bod si může patřit z 70 % do komponenty A a z 30 % do B, ne tvrdě jen do jedné. Konkrétně: bod přesně na půl cesty mezi dvěma stejně velkými komponentami dostane $\gamma = 0{,}5$ ke každé.

## M-krok: přepočítej parametry vážené odpovědnostmi

V **M-kroku** (Maximization) bereme odpovědnosti za dané a přepočítáme parametry tak, aby maximalizovaly věrohodnost. Vzorce jsou stejné jako klasické MLE odhady Gaussovky, jen každý bod přispívá **váhou $\gamma_{nk}$** místo „celý, nebo vůbec". Zavedeme efektivní počet bodů komponenty $N_k = \sum_{n} \gamma_{nk}$ (kolik bodů komponenta „vlastní") a píšeme:

::: math
\boldsymbol{\mu}_k^{\text{new}} = \frac{1}{N_k}\sum_{n=1}^{N} \gamma_{nk}\, \mathbf{x}_n
:::

::: math
\boldsymbol{\Sigma}_k^{\text{new}} = \frac{1}{N_k}\sum_{n=1}^{N} \gamma_{nk}\, (\mathbf{x}_n - \boldsymbol{\mu}_k^{\text{new}})(\mathbf{x}_n - \boldsymbol{\mu}_k^{\text{new}})^{\mathsf T}
:::

::: math
\pi_k^{\text{new}} = \frac{N_k}{N}, \qquad N_k = \sum_{n=1}^{N} \gamma_{nk}
:::

Nový střed je **vážený průměr** bodů, nová kovariance je **vážená výběrová kovariance** kolem toho středu a nová váha je **podíl** efektivního počtu bodů komponenty na celku. Body, které komponentě patří jen málo ($\gamma$ blízko 0), ji téměř neovlivní.

V interaktivní figuře krokuj E a M a sleduj, jak se body přebarvují podle odpovědností, elipsy se posouvají a stahují k datům a log-věrohodnost roste.

::: viz gmm-em "Dvě 2D komponenty (elipsy) nad shluky bodů. Tlačítka „E-krok" / „M-krok" / „auto" — E přebarví body podle odpovědností, M posune a přetvaruje elipsy; graf vpravo ukazuje rostoucí log-věrohodnost."
:::

## Proč to funguje: monotónní růst věrohodnosti

Klíčová záruka EM: **každá plná iterace (E + M) věrohodnost trénovacích dat nikdy nesníží** — buď ji zvýší, nebo nechá stejnou. Není to náhoda; dá se ukázat, že každá iterace maximalizuje dolní mez log-věrohodnosti (přes Jensenovu nerovnost), a proto $\log L$ roste monotónně. To je vidět i v grafu ve figuře — křivka jen stoupá nebo stojí.

::: math
\log L(\Theta^{\text{new}}) \ge \log L(\Theta^{\text{old}})
:::

Protože je věrohodnost shora omezená a monotónně roste, posloupnost **konverguje**. Pozor ale — konverguje jen do **lokálního maxima** (nebo sedlového bodu), ne nutně do globálního. Kde skončíme, závisí na startu.

## Citlivost na inicializaci

Různé počáteční parametry mohou dát různé lokální maximum, takže různě dobré řešení. Praktické rady:

- **Inicializuj středy přes k-means** místo náhodně — dá rozumný start blízko shluků.
- **Spusť EM vícekrát** z různých startů a vyber běh s nejvyšší výslednou věrohodností.
- **Hlídej degeneraci**: pokud se komponenta „přisaje" na jediný bod, její $\boldsymbol{\Sigma} \to 0$ a věrohodnost letí do nekonečna (singularita). Brání se tomu třeba spodní mezí na vlastní čísla $\boldsymbol{\Sigma}$ nebo regularizací (přičtením $\varepsilon \mathbf{I}$).

## Tvrdá varianta: Viterbi training (hard EM)

Když v E-kroku místo měkkých odpovědností přiřadíme každý bod **natvrdo** jen té nejpravděpodobnější komponentě ($\gamma_{nk} = 1$ pro $\arg\max_k$, jinak 0), dostaneme **Viterbi training** (hard EM). M-krok zůstává stejný. Je výpočetně levnější a souvisí s k-means, ale tvrdé řezy obvykle dávají **horší odhady** než plné EM — a tato hard varianta je vlastně přesně k-means, pokud navíc zafixujeme sférické kovariance.

::: quiz "Co garantuje EM algoritmus o log-věrohodnosti mezi iteracemi?"
- [ ] Že najde globální maximum bez ohledu na inicializaci
- [ ] Že se log-věrohodnost v každé iteraci ostře zvýší
- [x] Že se log-věrohodnost nikdy nesníží — monotónně roste a konverguje do lokálního maxima
  > EM zvyšuje dolní mez log-věrohodnosti, takže $\log L$ neklesá; protože je shora omezená, posloupnost konverguje — ale jen lokálně, proto záleží na startu.
- [ ] Že po jedné iteraci E+M je už konvergováno
:::

::: link "Dempster, Laird, Rubin — Maximum Likelihood from Incomplete Data via the EM Algorithm (1977)" "https://doi.org/10.1111/j.2517-6161.1977.tb01600.x"
:::

::: link "Bishop — PRML (kap. 9.2–9.4: EM pro směsi Gaussovek, obecné EM)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Dempster, A. P., Laird, N. M., Rubin, D. B.: „Maximum Likelihood from Incomplete Data via the EM Algorithm" (J. Royal Stat. Soc. B, 1977, [doi:10.1111/j.2517-6161.1977.tb01600.x](https://doi.org/10.1111/j.2517-6161.1977.tb01600.x)) — původní formulace EM; Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 9](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — EM pro GMM a důkaz monotonie.*
