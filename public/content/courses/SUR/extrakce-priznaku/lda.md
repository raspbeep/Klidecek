---
title: Lineární diskriminační analýza (LDA)
---

# Lineární diskriminační analýza (LDA)

PCA hledá směr, kde se data nejvíc rozprostírají — ale to nemusí být směr, který *odděluje třídy*. Představ si dva protáhlé, rovnoběžné mraky bodů: největší rozptyl běží podél jejich délky, jenže třídy se liší *napříč*. PCA by ponechalo tu dlouhou osu a obě třídy by na ni slila na sebe. To je špatně, když chceme klasifikovat.

**Lineární diskriminační analýza (Linear Discriminant Analysis, LDA)** dělá to, co PCA dělat neumí: hledá projekci, na které se **třídy co nejlépe oddělí**. Na rozdíl od PCA je **supervizovaná (supervised)** — při výpočtu používá informaci o tom, do které třídy každý bod patří.

## Intuice: daleko mezi třídami, těsně uvnitř tříd

Dobrá projekce pro klasifikaci má současně splnit dvě věci:

1. **střední hodnoty (těžiště) tříd mají být po projekci co nejdál od sebe** — velký rozptyl *mezi* třídami,
2. **každá třída se má po projekci stlačit do těsného shluku** — malý rozptyl *uvnitř* tříd.

Samotná vzdálenost těžišť nestačí: kdyby byly mraky rozplizlé, i vzdálené střední hodnoty se překryjí. Proto LDA dělí vzdálenost těžišť rozptylem uvnitř tříd. Tomuto poměru se říká **Fisherovo kritérium**.

::: viz lda-projection "Dvě 2D třídy (modrá, červená); přepínej projekční osu mezi PCA (maximální celkový rozptyl) a LDA (maximální oddělení tříd) a sleduj histogramy 1D projekcí dole. Na PCA ose se třídy překryjí, na LDA ose se rozdělí; Fisherovo skóre to měří."
:::

V obrázku přepni z „PCA osa" na „LDA osa": dole jsou histogramy projekcí obou tříd. Na PCA ose se histogramy překrývají (třídy splynou), na LDA ose se rozjedou od sebe (třídy se oddělí). PCA přitom o třídách nic neví — jen sleduje rozptyl; LDA barvy bodů využívá.

## Formalismus: scatter matice a Fisherovo kritérium

Mějme data v $C$ třídách, $x_i \in \mathbb{R}^d$, třída $c$ má $N_c$ vzorků, celkem $N$. Pro každou třídu spočteme její těžiště $\mu_c$ a pro celá data globální těžiště $\mu$.

**Rozptyl uvnitř tříd (within-class scatter).** Sčítá rozptyl dat kolem těžiště *vlastní* třídy přes všechny třídy:

::: math
S_W = \sum_{c=1}^{C} \sum_{i \in c} (x_i - \mu_c)(x_i - \mu_c)^{\mathsf{T}}
:::

**Rozptyl mezi třídami (between-class scatter).** Měří, jak daleko jsou těžiště tříd od globálního těžiště:

::: math
S_B = \sum_{c=1}^{C} N_c\,(\mu_c - \mu)(\mu_c - \mu)^{\mathsf{T}}
:::

> Pozn.: některé texty (i zdrojový) obě matice ještě dělí $N$, tedy berou *průměrné* kovariance. Konstanta se ale v poměru níže vykrátí a optimální směr projekce zůstane stejný — na výsledku nezáleží.

**Fisherovo kritérium.** Pro projekční směr $w$ chceme maximalizovat poměr rozptylu mezi třídami ku rozptylu uvnitř tříd:

::: math
J(w) = \frac{w^{\mathsf{T}} S_B\, w}{w^{\mathsf{T}} S_W\, w}
:::

Čitatel je velký, když jsou těžiště po projekci daleko; jmenovatel je malý, když jsou třídy po projekci těsné. Chceme to maximální.

## Řešení: zobecněný problém vlastních čísel

Maximalizovat poměr $J(w)$ je totéž jako maximalizovat čitatel $w^{\mathsf{T}}S_B w$ za podmínky pevného jmenovatele $w^{\mathsf{T}}S_W w = 1$. Lagrangeovými multiplikátory ($L = w^{\mathsf{T}}S_B w - \lambda(w^{\mathsf{T}}S_W w - 1)$) a derivací podle $w$ dostaneme

::: math
S_B\, w = \lambda\, S_W\, w \quad\Longleftrightarrow\quad S_W^{-1} S_B\, w = \lambda\, w
:::

To je **zobecněný problém vlastních čísel**. Optimální projekční směry jsou vlastní vektory matice $S_W^{-1}S_B$ s největšími vlastními čísly.

**Kolik směrů dostaneme?** Matice $S_B$ je součtem $C$ matic hodnosti 1, navíc vázaných vztahem $\sum_c N_c(\mu_c - \mu) = 0$, takže má hodnost nejvýše $C-1$. Proto má LDA **nanejvýš $C-1$ použitelných (nenulových) směrů**. Pro 2 třídy je to jediný směr; pro 10 tříd nejvýš 9. To je zásadní rozdíl oproti PCA, kde můžeme vzít až $d$ komponent.

**Malý příklad (2 třídy).** Vezměme dvě třídy s těžišti $\mu_1 = [1,1]^{\mathsf{T}}$, $\mu_2 = [3,3]^{\mathsf{T}}$ a sdílenou $S_W = \begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}$. Pro 2 třídy se optimální směr zjednoduší na $w \propto S_W^{-1}(\mu_2 - \mu_1)$. Spočteme $S_W^{-1} = \tfrac{1}{3}\begin{bmatrix} 2 & -1 \\ -1 & 2 \end{bmatrix}$ a $\mu_2 - \mu_1 = [2,2]^{\mathsf{T}}$, takže $w \propto \tfrac{1}{3}[2,2]^{\mathsf{T}}$, po normalizaci $w = \tfrac{1}{\sqrt2}[1,1]^{\mathsf{T}}$. Projekce na tento směr dá maximální oddělení obou tříd.

## PCA vs. LDA: kdy co

|                 | PCA                              | LDA                                   |
|-----------------|----------------------------------|---------------------------------------|
| supervize       | nesupervizovaná (ignoruje třídy) | supervizovaná (využívá třídy)         |
| co maximalizuje | celkový rozptyl dat              | poměr mezitřídního a vnitrotřídního rozptylu |
| počet komponent | až $d$                           | nejvýše $C-1$                          |
| cíl             | zachovat informaci / dekorelovat | oddělit třídy                         |

- **LDA pomůže**, když máš popisky tříd a chceš dimenzi snížit *kvůli klasifikaci* — typicky když směr maximálního rozptylu nemíří podél oddělení tříd.
- **PCA je lepší**, když popisky nemáš (nesupervizovaná úloha), když chceš jen kompresi či vizualizaci, nebo když máš málo dat na třídu (LDA potřebuje odhadnout a invertovat $S_W$, což je u vysoké dimenze a málo vzorků nestabilní — pak se občas dělá PCA jako předkrok a LDA až na výsledku).

**Předpoklady LDA.** LDA implicitně počítá s tím, že data v každé třídě mají přibližně **normální rozdělení** a všechny třídy sdílejí **stejnou kovarianční matici** (proto jedna společná $S_W$). Když to neplatí výrazně, projekce nemusí být optimální.

::: quiz "Kolik nenulových diskriminačních směrů poskytne LDA pro úlohu s C třídami?"
- [ ] Vždy d (dimenze dat)
- [ ] Vždy přesně C
- [x] Nejvýše C − 1
  > Matice S_B má hodnost nejvýše C − 1, proto má S_W⁻¹S_B nejvýš C − 1 nenulových vlastních čísel; pro 2 třídy tak LDA dává jediný směr.
- [ ] Tolik, kolik je nenulových vlastních čísel matice Σ
:::

::: link "Fisher — The Use of Multiple Measurements in Taxonomic Problems (1936)" "https://onlinelibrary.wiley.com/doi/10.1111/j.1469-1809.1936.tb02137.x"
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 4.1.4: Fisher's Linear Discriminant)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Fisher, R. A.: „The Use of Multiple Measurements in Taxonomic Problems" (Annals of Eugenics 1936, [DOI](https://onlinelibrary.wiley.com/doi/10.1111/j.1469-1809.1936.tb02137.x)); Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [PRML](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — kap. 4.1.*
