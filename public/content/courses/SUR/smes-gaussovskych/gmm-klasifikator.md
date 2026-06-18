---
title: GMM jako klasifikátor
---

# GMM jako klasifikátor

GMM modeluje, **jak vypadají data** — proto se hodí postavit z něj **generativní klasifikátor**. Myšlenka: pro každou třídu zvlášť se naučíme, jak její data vypadají (jednu směs Gaussovek na třídu), a nový vzorek pak zařadíme tam, kde „nejlíp zapadá" — s ohledem na to, jak je která třída vůbec častá.

Kontrast s diskriminativním přístupem (logistická regrese, SVM): ten se neptá, jak data vznikla, jen rovnou modeluje hranici / $P(\text{třída} \mid \mathbf{x})$. Generativní přístup je oklika přes model dat, ale dává navíc hustotu $p(\mathbf{x})$ (umí třeba detekovat odlehlé vzorky) a snadno zvládá chybějící hodnoty.

## Trénování: jeden GMM na třídu

Pro každou třídu $\omega_c$ natrénujeme **samostatný GMM** jen z jejích trénovacích vzorků — pomocí EM. Tím získáme **class-conditional hustotu** (podmíněnou hustotu třídy):

::: math
p(\mathbf{x} \mid \omega_c) = \sum_{k=1}^{K_c} \pi_{ck}\, \mathcal{N}(\mathbf{x}; \boldsymbol{\mu}_{ck}, \boldsymbol{\Sigma}_{ck})
:::

Každá třída tedy může mít vlastní počet komponent $K_c$. Současně odhadneme **apriorní pravděpodobnosti tříd** $P(\omega_c)$ — typicky jako podíl trénovacích vzorků dané třídy ($P(\omega_c) = N_c / N$). Apriori říká, jak je třída častá *předtím*, než se podíváme na vzorek.

## Klasifikace: Bayesovo pravidlo a MAP rozhodnutí

Nový vzorek $\mathbf{x}$ zařadíme přes **posteriorní pravděpodobnost** třídy, kterou složíme Bayesovým pravidlem z class-conditional hustoty a apriori:

::: math
P(\omega_c \mid \mathbf{x}) = \frac{p(\mathbf{x} \mid \omega_c)\, P(\omega_c)}{\sum_{j} p(\mathbf{x} \mid \omega_j)\, P(\omega_j)}
:::

Rozhodneme se pro třídu s **nejvyšší posteriorní pravděpodobností** — to je **MAP klasifikátor** (Maximum A Posteriori):

::: math
\hat{\omega} = \arg\max_{c}\; P(\omega_c \mid \mathbf{x}) = \arg\max_{c}\; p(\mathbf{x} \mid \omega_c)\, P(\omega_c)
:::

Druhá rovnost platí, protože jmenovatel (normalizace) je pro všechny třídy stejný, takže na $\arg\max$ nemá vliv — počítat ho nemusíme, stačí porovnat čitatele.

## Rozhodovací hranice

**Rozhodovací hranice** je množina bodů, kde si jsou dvě třídy posteriorně rovny, tj. $p(\mathbf{x}\mid\omega_1)P(\omega_1) = p(\mathbf{x}\mid\omega_2)P(\omega_2)$. Na jedné straně vyhrává jedna třída, na druhé druhá. Tvar hranice závisí na komponentách: u jediné Gaussovky na třídu vyjde kvadratická křivka (a lineární, když mají třídy stejnou $\boldsymbol{\Sigma}$), u plných GMM může být hranice **silně nelineární a klidně i nesouvislá** — to je síla generativního přístupu nad lineárním klasifikátorem.

Klíčový postřeh je, že hranice **není daná jen tvarem hustot** — posouvá ji i **apriori** $P(\omega)$. Když je jedna třída apriori častější, její vážená hustota $p(\mathbf{x}\mid\omega)\,P(\omega)$ se „zvedne" a vyhraje i na území, kde má nižší hustotu — hranice se posune **směrem od té častější třídy**. To je často první věc, kterou si studenti nepřipustí, proto si to vyzkoušej v interaktivní viz níže.

::: viz gmm-boundary "Dvě 1D class-conditional hustoty (každá GMM), škálované apriori P(ω). Posuň P(ω₁) (P(ω₂)=1−P(ω₁)) a rozestup tříd — svislá čára (rozhodovací hranice) leží v průsečíku vážených hustot a viditelně se posouvá. Když se hustoty protnou víckrát, hranice je nesouvislá (víc čar)."
:::

Všimni si tří věcí: (1) zvýšení $P(\omega_1)$ posune hranici **doprava**, k území ω₂ — častější třída si „ukousne" víc prostoru; (2) přiblížení tříd zmenší jejich oddělení a hranice je míň jistá; (3) protnou-li se vážené hustoty na více místech, vznikne **víc hranic** — to je ta nesouvislá hranice, kterou lineární klasifikátor nesvede.

## Generativní vs. diskriminativní — shrnutí kontrastu

- **Generativní (GMM + Bayes)**: modeluje $p(\mathbf{x}\mid\omega_c)$ a $P(\omega_c)$, z nich odvodí $P(\omega_c\mid\mathbf{x})$. Naučí se „jak třída vypadá". Plus: dává hustotu dat, zvládá chybějící hodnoty, lze přidávat třídy bez přetrénování ostatních. Minus: modeluje víc, než je k rozhodnutí nutné, a špatný model dat ublíží i klasifikaci.
- **Diskriminativní (logistická regrese, SVM, …)**: modeluje přímo $P(\omega_c\mid\mathbf{x})$ nebo rovnou hranici, bez modelu $p(\mathbf{x})$. Při dost datech bývá přesnější v samotné klasifikaci, protože „neplýtvá" kapacitou na modelování dat.

::: quiz "Jak GMM klasifikátor rozhodne o třídě nového vzorku x?"
- [ ] Přiřadí vzorek komponentě s nejvyšší odpovědností napříč všemi třídami
- [x] Spočte $p(\mathbf{x}\mid\omega_c)P(\omega_c)$ pro každou třídu a vybere maximum (MAP přes Bayesovo pravidlo)
  > Každá třída má vlastní GMM ($p(\mathbf{x}\mid\omega_c)$); Bayesovo pravidlo z nich a z apriori $P(\omega_c)$ složí posterior. Jmenovatel je pro všechny třídy stejný, takže stačí maximalizovat čitatel.
- [ ] Vybere třídu, jejíž nejbližší střed $\boldsymbol{\mu}$ je nejblíž vzorku
- [ ] Natrénuje jediný společný GMM přes všechny třídy a vzorek zařadí podle nejbližší komponenty
:::

::: link "Bishop — PRML (kap. 4.2 generativní modely, kap. 9 směsi)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Ng & Jordan — On Discriminative vs. Generative Classifiers (NIPS 2001)" "https://papers.nips.cc/paper/2020-on-discriminative-vs-generative-classifiers-a-comparison-of-logistic-regression-and-naive-bayes"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 4 a 9](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — generativní klasifikátory a směsi; Ng, A. Y., Jordan, M. I.: „On Discriminative vs. Generative Classifiers" ([NIPS 2001](https://papers.nips.cc/paper/2020-on-discriminative-vs-generative-classifiers-a-comparison-of-logistic-regression-and-naive-bayes)).*
