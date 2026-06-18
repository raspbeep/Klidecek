---
title: Logistická regrese
---

# Logistická regrese

Logistická regrese je **diskriminativní** lineární klasifikátor. Slovo "regrese" mate — ve skutečnosti je to **klasifikační** metoda. Na rozdíl od gaussovského klasifikátoru *nemodeluje, jak data vznikají* (žádné Gaussovky, žádný předpoklad o rozdělení příznaků). Místo toho modeluje **přímo to, co nás zajímá**: pravděpodobnost $P(\omega_1 \mid x)$, že bod $x$ patří do třídy 1.

Intuice: vezmeme stejné lineární skóre $w^\top x + b$ jako perceptron, ale místo tvrdého "$+1$ / $-1$" ho **protlačíme sigmoidou**, která ho zmáčkne do intervalu $(0,1)$ a interpretuje jako pravděpodobnost. Velké kladné skóre → pravděpodobnost blízká 1, velké záporné → blízká 0, skóre 0 → přesně 0.5 (maximální nejistota).

## Model: sigmoida nad lineárním skóre

Nejdřív spočítáme lineární kombinaci vstupů (často značenou $a$, "aktivace"):

::: math
a = w^{\top} x + b.
:::

Tu protáhneme **logistickou (sigmoidní) funkcí** $\sigma$:

::: math
\sigma(a) = \frac{1}{1 + e^{-a}}.
:::

Sigmoida je hladká rostoucí "esíčková" křivka: $\sigma(-\infty)=0$, $\sigma(0)=\tfrac12$, $\sigma(+\infty)=1$. Výstup modelu je pravděpodobnost třídy 1:

::: math
P(\omega_1 \mid x) = \sigma(w^{\top} x + b),
\qquad
P(\omega_2 \mid x) = 1 - P(\omega_1 \mid x).
:::

## Rozhodování a lineární hranice

Klasifikujeme prahováním pravděpodobnosti na 0.5:

::: math
P(\omega_1\mid x) > 0{.}5 \;\Rightarrow\; \omega_1,
\qquad
P(\omega_1\mid x) < 0{.}5 \;\Rightarrow\; \omega_2.
:::

A tady je pointa: $\sigma(a) = 0{.}5$ nastane **právě když** $a = 0$. Rozhodovací hranice je tedy

::: math
w^{\top} x + b = 0,
:::

což je **nadrovina** — stejně lineární hranice jako u perceptronu i LDA. Sigmoida tvar hranice **nemění**, jen převádí vzdálenost od hranice na pravděpodobnost (čím dál na "kladné" straně, tím jistější třída 1).

::: viz logistic-sigmoid "1D data dvou tříd (červená = −1 vlevo, modrá = +1 vpravo) ležící na ose. Slidery w (strmost) a b (posun) mění tvar a polohu sigmoidy σ(wx+b); svislá čára je práh rozhodnutí x* = −b/w (kde σ = 0.5). Zkus body oddělit tak, aby zmizely chyby (kroužky)."
:::

## Učení: cross-entropy a gradientní sestup

Jak najít $w, b$? Logistická regrese minimalizuje **cross-entropy** (křížovou entropii) — ztrátovou funkci, která trestá sebevědomé špatné predikce. Cíle značíme $t_i \in \{0, 1\}$ a predikce $y_i = P(\omega_1\mid x_i) = \sigma(w^\top x_i + b)$. Ztráta přes $N$ trénovacích bodů:

::: math
J(w, b) = -\sum_{i=1}^{N}\Big[\,t_i \ln y_i + (1 - t_i)\ln(1 - y_i)\,\Big].
:::

Tomu odpovídá **záporná logaritmická věrohodnost** (negative log-likelihood) — minimalizace $J$ je tedy ekvivalentní **maximalizaci věrohodnosti** trénovacích dat za bernoulliho modelu. Pro jeden bod: je-li $t_i = 1$, ztráta je $-\ln y_i$ (čím menší $y_i$, tj. čím sebevědoměji se model mýlí, tím větší trest); je-li $t_i = 0$, je to $-\ln(1-y_i)$.

Na rozdíl od lineární regrese **neexistuje uzavřené řešení** — $J$ se minimalizuje iterativně **gradientním sestupem**. Krásné je, že gradient má jednoduchý tvar (sigmoida + cross-entropy se "potkají" tak, že derivace sigmoidy zmizí):

::: math
\nabla_w J = \sum_{i=1}^{N} (y_i - t_i)\,x_i,
\qquad
\frac{\partial J}{\partial b} = \sum_{i=1}^{N}(y_i - t_i).
:::

Aktualizace parametrů jde **proti** gradientu:

::: math
w \leftarrow w - \eta\,\nabla_w J, \qquad b \leftarrow b - \eta\,\frac{\partial J}{\partial b},
:::

kde $\eta > 0$ je **rychlost učení**. Všimni si, že chybový člen $(y_i - t_i)$ je vlastně "o kolik se pravděpodobnost spletla" — body, které jsou už správně a sebevědomě klasifikované, do gradientu skoro nepřispívají. $J$ je navíc **konvexní**, takže gradientní sestup konverguje ke **globálnímu** minimu (žádné špatné lokální minimum).

> **Pozor na perfektně separabilní data.** Když jsou třídy dokonale oddělitelné, věrohodnost roste pro $\|w\| \to \infty$ (sigmoida se mění v ostrý schod) a váhy **divergují**. V praxi se to brzdí **regularizací** (přidaný člen $\lambda\|w\|^2$ k $J$), která velikost vah omezí.

## Generativní vs. diskriminativní: Gauss vs. logistická regrese

Obě metody dají **stejný tvar** aposteriorní pravděpodobnosti $P(\omega_1\mid x) = \sigma(w^\top x + b)$ a obě mají **lineární hranici**. Liší se filozofií, jak se k vahám dostanou:

- **Generativní** (lineární gaussovský klasifikátor, viz [[linearni-gaussovsky]]): nejdřív odhadne **rozdělení dat** $p(x\mid\omega_c)$ (každou třídu jako Gaussovku), pak z něj Bayesem dopočítá $P(\omega_c\mid x)$. Váhy $w = \Sigma^{-1}(\mu_1-\mu_2)$ plynou z odhadnutých $\mu_c, \Sigma$.
- **Diskriminativní** (logistická regrese): **přeskočí** modelování $p(x\mid\omega_c)$ a optimalizuje $w, b$ **přímo** tak, aby seděla aposteriorní pravděpodobnost. Nepředpokládá nic o tvaru rozdělení příznaků.

Praktický důsledek: pokud data **opravdu** jsou gaussovská se společnou kovariancí, generativní model je efektivnější (potřebuje **méně dat** — využívá silnější předpoklad). Pokud tento předpoklad **neplatí**, je logistická regrese typicky **přesnější** a robustnější, protože neztrácí čas modelováním nesprávného rozdělení. To je klasický výsledek Ng & Jordan (2001).

::: quiz "V čem se zásadně liší logistická regrese od lineárního gaussovského klasifikátoru, když oba dávají P(ω₁|x) = σ(w⊤x+b)?"
- [ ] Logistická regrese má kvadratickou, gaussovský klasifikátor lineární hranici
  > Obě metody mají lineární hranici (gaussovský jen při společné kovarianci); tvar hranice je u obou stejný.
- [x] Logistická regrese odhaduje w přímo (diskriminativně); gaussovský model je odvodí z odhadnutého rozdělení p(x|ω) (generativně)
  > To je jádro rozdílu generativní vs. diskriminativní: stejný funkční tvar, jiný způsob získání vah a jiné předpoklady o datech.
- [ ] Logistická regrese nepotřebuje trénovací data
  > Potřebuje — váhy se učí gradientním sestupem minimalizací cross-entropy na trénovacích datech.
- [ ] Gaussovský klasifikátor nedává pravděpodobnosti
  > Dává — aposteriorní pravděpodobnosti tříd jsou jeho hlavní výstup; právě proto vychází sigmoida.
:::

::: link "Bishop — Pattern Recognition and Machine Learning (4.3.2: Logistic Regression)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Ng & Jordan: On Discriminative vs. Generative Classifiers (NIPS 2001)" "https://ai.stanford.edu/~ang/papers/nips01-discriminativegenerative.pdf"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, kap. 4.3 — [PRML](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)); Ng, A.Y., Jordan, M.I.: „On Discriminative vs. Generative Classifiers" (NIPS 2001, [PDF](https://ai.stanford.edu/~ang/papers/nips01-discriminativegenerative.pdf)); Hastie, Tibshirani, Friedman: „The Elements of Statistical Learning" (kap. 4.4 — [ESL](https://hastie.su.domains/ElemStatLearn/)).*
