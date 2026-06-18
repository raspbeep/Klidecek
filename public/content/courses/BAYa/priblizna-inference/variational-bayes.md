---
title: Variační Bayes (Variational inference)
---

# Variační Bayes (Variational inference)

V bayesovské statistice nás po vidění dat $X$ zajímá **posterior** $p(\theta \mid X)$ — rozdělení, které říká, jak moc věříme jednotlivým hodnotám parametru $\theta$. Z Bayesova vzorce:

::: math
p(\theta \mid X) = \frac{p(X \mid \theta)\,p(\theta)}{p(X)}, \qquad p(X) = \int p(X \mid \theta)\,p(\theta)\,d\theta.
:::

Jmenovatel $p(X)$ se jmenuje **evidence** (nebo *marginal likelihood*). Je to jen normalizační konstanta — zaručuje, že posterior se integruje do jedničky. Háček je v tom, že ji téměř nikdy neumíme spočítat.

## Proč je posterior obvykle neřešitelný

Evidence je integrál přes **všechny** možné hodnoty $\theta$. Když je $\theta$ jediné číslo a model je jednoduchý (třeba normální rozdělení s konjugovaným priorem), jde integrál vyřešit tužkou. Jenže v reálných modelech je $\theta$ vektor o desítkách až tisících složek a integrál nabývá tvaru

::: math
p(X) = \int p(X \mid \theta)\,p(\theta)\,d\theta_1 \cdots d\theta_D.
:::

Museli bychom projít všechny kombinace hodnot všech $D$ parametrů. Počet kombinací roste exponenciálně s $D$ (**prokletí dimenzionality**), takže přesný výpočet je prakticky nemožný. Modely jako směs gaussovek (GMM) nebo bayesovské sítě posterior v uzavřené formě prostě nemají.

Když exaktní posterior nejde spočítat, použijeme **přibližnou inferenci** — místo přesného $p(\theta \mid X)$ hledáme jeho co nejlepší náhradu. Variační Bayes (VB) je deterministický přístup: nahradí posterior jednoduchou distribucí a problém integrace převede na **optimalizaci**.

## Základní idea: nahradit posterior jednoduchým $q(\theta)$

Zvolíme nějakou jednoduchou **rodinu** rozdělení $q(\theta)$ — třeba všechny gaussovky, nebo všechny faktorizované distribuce — a v té rodině najdeme to $q$, které se skutečnému posterioru $p(\theta \mid X)$ podobá nejvíc. Místo „spočítej posterior" tedy řešíme „najdi nejbližší $q$ z rodiny".

Vzdálenost dvou rozdělení měříme **Kullback–Leiblerovou (KL) divergencí**:

::: math
D_{\mathrm{KL}}\!\big(q(\theta) \,\|\, p(\theta \mid X)\big) = \int q(\theta)\,\ln \frac{q(\theta)}{p(\theta \mid X)}\,d\theta \ge 0.
:::

KL divergence je vždy $\ge 0$ a rovná se nule právě tehdy, když $q = p$. Je to tedy přirozená míra „jak daleko" je naše $q$ od cíle. Pozor: **není symetrická** — obecně $D_{\mathrm{KL}}(q\|p) \neq D_{\mathrm{KL}}(p\|q)$ — a na tom směru, který zvolíme, opravdu záleží (viz dále).

Cílem VB je tedy minimalizovat $D_{\mathrm{KL}}(q \,\|\, p(\theta \mid X))$. Jenže… v tom vzorci pořád figuruje neznámý posterior $p(\theta \mid X)$. Tahle slepá ulička nás dovede k ELBO.

## ELBO: trik, jak se zbavit neznámého posterioru

Do KL divergence dosadíme Bayesův vzorec $p(\theta \mid X) = p(X, \theta)/p(X)$, kde $p(X,\theta)=p(X\mid\theta)p(\theta)$ je **sdružené** rozdělení (to spočítat umíme — je to jen likelihood krát prior). Po roznásobení logaritmu vyjde:

::: math
\ln p(X) = \underbrace{\int q(\theta)\,\ln \frac{p(X, \theta)}{q(\theta)}\,d\theta}_{\mathcal{L}(q)\ \text{(ELBO)}} \;+\; \underbrace{D_{\mathrm{KL}}\!\big(q(\theta)\,\|\,p(\theta \mid X)\big)}_{\ge\,0}.
:::

Tahle rovnost je srdce celé VB. Pojmenujme první člen $\mathcal{L}(q)$ — **ELBO** (*Evidence Lower BOund*, dolní mez log-evidence). Z rovnosti plynou dvě věci:

1. Protože $D_{\mathrm{KL}} \ge 0$, platí $\mathcal{L}(q) \le \ln p(X)$ — ELBO je vždy **pod** log-evidencí, odtud jméno.
2. Levá strana $\ln p(X)$ **vůbec nezávisí na $q$** (data jsou daná). Takže když zvyšujeme ELBO, KL divergence se musí o přesně stejnou hodnotu **snižovat**. Jejich součet je konstantní.

A v tom je celý trik. KL divergenci přímo minimalizovat neumíme (obsahuje neznámý posterior), ale ELBO maximalizovat umíme (obsahuje jen sdružené $p(X,\theta)$ a naše $q$). Tyto dva úkoly jsou ekvivalentní:

::: math
\text{minimalizovat } D_{\mathrm{KL}}\big(q \,\|\, p(\theta\mid X)\big) \iff \text{maximalizovat } \mathcal{L}(q).
:::

Bonus: maximální dosažená hodnota ELBO je zdola odhad log-evidence $\ln p(X)$ — můžeme ji použít třeba k porovnávání modelů.

::: viz variational-bayes "Cílový bimodální posterior (oranžově). Táhni střední hodnotu a šířku jedné Gaussovy q a sleduj, jak roste ELBO a klesá KL. Nejlepší q se 'usadí' jen na jeden mód — nepokryje oba."
:::

## Mean-field předpoklad: jak rodinu $q$ zvolit prakticky

Abychom mohli optimalizovat, musíme rodinu $q$ nějak omezit. Nejčastější volba je **mean-field** aproximace: rozdělíme parametry $\theta = \{\theta_1, \theta_2, \dots\}$ do skupin a předpokládáme, že se v $q$ navzájem **faktorizují**:

::: math
q(\theta) = \prod_i q(\theta_i).
:::

Tím říkáme, že jednotlivé skupiny jsou v aproximaci $q$ **nezávislé** — i když ve skutečném posterioru mezi nimi může být silná korelace. To je zdroj aproximační chyby, ale výrazně to zjednoduší výpočet. Mean-field je tedy speciální případ obecné VB, kde je tvar (struktura) aproximace pevně daný předem.

Pro modely s **konjugovanými** priory (tedy takovými, kde posterior má stejný tvar rozdělení jako prior) mají optimální faktory $q(\theta_i)$ pěkný uzavřený tvar. Optimální $j$-tý faktor je dán:

::: math
\ln q^*(\theta_j) = \mathbb{E}_{q(\theta_{\setminus j})}\!\big[\ln p(X, \theta)\big] + \text{const},
:::

kde $\theta_{\setminus j}$ jsou všechny ostatní skupiny než $j$. Slovy: **při aktualizaci jednoho faktoru držíme všechny ostatní pevně** a nahradíme je jejich očekávanými hodnotami. Faktory se pak střídavě aktualizují (jako kola algoritmu) až do konvergence. Každé takové kolo ELBO **nikdy nesníží** — pomalu šplháme nahoru, podobně jako u EM algoritmu.

Důležité: v praxi se na $D_{\mathrm{KL}} = 0$ obvykle nedostaneme. Pokud pravý posterior **neleží** ve zvolené rodině (a typicky neleží), zůstane nějaká zbytková chyba. Navíc konvergujeme jen k **lokálnímu** maximu ELBO — na startu záleží.

## Důsledek volby směru KL: zero-forcing

Proč jsme zvolili zrovna $D_{\mathrm{KL}}(q \| p)$ a ne $D_{\mathrm{KL}}(p \| q)$? Pragmaticky: $D_{\mathrm{KL}}(q\|p)$ obsahuje očekávání **podle $q$**, ze kterého umíme vzorkovat, kdežto $D_{\mathrm{KL}}(p\|q)$ by potřebovalo očekávání podle neznámého $p$ — to nemáme.

Tahle volba má ale viditelný důsledek. $D_{\mathrm{KL}}(q\|p)$ tvrdě trestá $q$ za to, že dává hmotu tam, kde $p$ je skoro nula (člen $q\ln(q/p)$ vybuchne, když $p\to 0$ a $q > 0$). Výsledkem je, že $q$ je **„zero-forcing"** / mode-seeking: u multimodálního posterioru si $q$ typicky vybere **jeden mód** a ostatní ignoruje, jen aby se vyhnulo oblastem nulové hmoty. Naopak $D_{\mathrm{KL}}(p\|q)$ by bylo „zero-avoiding" a snažilo by se pokrýt všechny módy (rozmázlo by $q$ přes celé rozdělení). Variační $q$ tak často **podceňuje rozptyl** posterioru — je „příliš sebejisté".

::: quiz "Proč při VB maximalizujeme ELBO místo toho, abychom přímo minimalizovali KL divergenci mezi q a posteriorem?"
- [ ] ELBO se počítá rychleji než KL divergence, ale dává jiný výsledek
- [x] KL obsahuje neznámý posterior (resp. evidenci $p(X)$), kdežto ELBO obsahuje jen vypočítatelné sdružené $p(X,\theta)$; přitom $\ln p(X) = \text{ELBO} + \text{KL}$, takže maximalizace ELBO je ekvivalentní minimalizaci KL
  > Protože $\ln p(X)$ na $q$ nezávisí, je součet ELBO + KL konstantní — zvýšení ELBO o stejně sníží KL. A ELBO jde spočítat, protože nepotřebuje neřešitelnou evidenci.
- [ ] Protože KL divergence může být záporná a ELBO ne
- [ ] Protože ELBO zaručuje, že najdeme globální optimum
:::

## VB versus MCMC: kdy co

Variační Bayes a vzorkovací metody (MCMC, Gibbs) jsou dvě hlavní rodiny přibližné inference a stojí proti sobě v jasném kompromisu:

- **Variační Bayes** je **rychlý a deterministický** (řeší optimalizační problém), ale **zkreslený** — i s nekonečně dlouhým výpočtem zůstane aproximační chyba, protože pravý posterior typicky neleží ve zvolené rodině $q$. Hodí se na velká data, kde potřebujeme výsledek rychle a smíříme se s podhodnoceným rozptylem.
- **MCMC** (např. Gibbs) je **pomalejší**, ale **asymptoticky přesný** — s rostoucím počtem vzorků se posterioru přiblíží libovolně blízko, bez systematického zkreslení. Hodí se, když chceme věrné rozdělení a můžeme si dovolit čekat.

Velmi zjednodušeně: **VB = rychlé, ale zaujaté; MCMC = pomalé, ale poctivé.**

::: link "Beal — Variational Algorithms for Approximate Bayesian Inference (PhD, 2003)" "https://cse.buffalo.edu/faculty/mbeal/thesis/"
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 10: Approximate Inference)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Blei, Kucukelbir, McAuliffe — Variational Inference: A Review for Statisticians (JASA 2017)" "https://arxiv.org/abs/1601.00670"
:::

---

*Zdroj: BAYa státnicové okruhy NMAL, VUT FIT. Externí reference: Beal, M.J.: „Variational Algorithms for Approximate Bayesian Inference" (PhD thesis, 2003, [odkaz](https://cse.buffalo.edu/faculty/mbeal/thesis/)); Bishop, C.M.: „Pattern Recognition and Machine Learning" (2006, kap. 10, [odkaz](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)); Blei, D.M., Kucukelbir, A., McAuliffe, J.D.: „Variational Inference: A Review for Statisticians" (JASA 2017, [arXiv:1601.00670](https://arxiv.org/abs/1601.00670)).*
