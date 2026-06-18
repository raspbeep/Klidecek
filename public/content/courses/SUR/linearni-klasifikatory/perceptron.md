---
title: Perceptron
---

# Perceptron

Perceptron je nejjednodušší **lineární klasifikátor** pro dvě třídy. Myšlenka je triviální: vezmeme vstupní vektor příznaků $x$, spočítáme jedno **vážené skóre** a podle jeho znaménka rozhodneme, do které třídy bod patří. Žádné pravděpodobnosti, žádný předpoklad o rozdělení dat — jen "na které straně přímky bod leží".

Představ si dva mraky bodů v rovině (např. e-maily: osa $x_1$ = počet vykřičníků, osa $x_2$ = počet odkazů; spam vs. ham). Perceptron hledá **přímku**, která je oddělí. V $D$ rozměrech je to **nadrovina** (hyperplane).

## Lineární rozhodovací funkce

Jádrem je **diskriminační funkce** — lineární kombinace příznaků plus posun:

::: math
g(x) = w^{\top} x + b
:::

kde $w \in \mathbb{R}^D$ je **vektor vah** (určuje *sklon* / orientaci nadroviny) a $b$ je **práh** neboli **bias** (posouvá nadrovinu od počátku). Rozhodnutí je dané **znaménkem**:

::: math
\hat{y} = \operatorname{sign}(w^{\top} x + b) =
\begin{cases}
+1 & w^{\top} x + b \ge 0 \quad(\text{třída } \omega_1)\\
-1 & \text{jinak} \quad(\text{třída } \omega_2)
\end{cases}
:::

Samotná **rozhodovací hranice** je množina bodů s nulovým skóre:

::: math
w^{\top} x + b = 0.
:::

To je rovnice přímky (2D), roviny (3D), obecně nadroviny. Vektor $w$ je k této nadrovině **kolmý** (je to její normála) a ukazuje do poloprostoru třídy $+1$. Hodnota $g(x)$ je (až na faktor $\|w\|$) **se znaménkem orientovaná vzdálenost** bodu od hranice — čím větší $|g(x)|$, tím dál bod od hranice leží.

> **Trik s biasem.** Často se píše jen $w^{\top}x$ bez $b$. Toho se dosáhne tak, že ke každému $x$ připojíme konstantní složku $x_0 = 1$ a do $w$ přidáme $w_0 = b$. Pak $w^{\top}x$ už $b$ obsahuje. V dalším budeme $b$ psát zvlášť kvůli názornosti.

## Perceptronové pravidlo učení

Učení je iterativní a krásně intuitivní: **dokud nějaký bod klasifikuješ špatně, posuň nadrovinu směrem k němu**. Cíle značíme $t_i \in \{-1,+1\}$ (správná třída), predikce $\hat{y}_i = \operatorname{sign}(w^{\top}x_i + b)$.

Procházíme trénovací body jeden po druhém. Pokud je bod $x_i$ klasifikován **správně**, neděláme nic. Pokud **špatně**, upravíme váhy:

::: math
w \leftarrow w + \eta\,(t_i - \hat{y}_i)\,x_i, \qquad
b \leftarrow b + \eta\,(t_i - \hat{y}_i)
:::

Protože $t_i,\hat{y}_i \in \{-1,+1\}$, je rozdíl $(t_i - \hat{y}_i)$ buď $0$ (správně — žádná změna), nebo $\pm 2$ (chyba). Pokud zvolíme **rychlost učení** $\eta = \tfrac{1}{2}$, sčlene se přírůstek na jednoduchý tvar **pro chybně klasifikovaný bod**:

::: math
w \leftarrow w + t_i\, x_i, \qquad b \leftarrow b + t_i.
:::

To je klasické **perceptronové pravidlo** (Rosenblatt, 1958). Čteme ho takto: když měl být bod ve třídě $+1$, ale spadl na špatnou stranu, **přičteme $x_i$** k vahám — tím zvýšíme $g(x_i) = w^\top x_i + b$ pro tento bod (skutečně, nové skóre vzroste o $\|x_i\|^2 + 1 > 0$) a posuneme hranici tak, aby ho příště zařadila lépe. U třídy $-1$ naopak $x_i$ **odečteme**.

Jeden průchod všemi trénovacími body se nazývá **epocha**. Iterujeme přes epochy, dokud se nějaký bod klasifikuje špatně.

::: viz perceptron-learn "Dvě lineárně separabilní třídy. Tlačítko „krok učení“ najde první chybně klasifikovaný bod (kroužek) a provede na něm jednu perceptronovou aktualizaci — sleduj, jak se rozhodovací přímka otáčí a po několika krocích zařadí všechny body správně."
:::

## Věta o konvergenci (Novikoff)

Klíčová teoretická záruka: **pokud jsou data lineárně separabilní, perceptron skončí v konečném počtu kroků** s nadrovinou, která je dokonale oddělí. To dokázal Novikoff (1962).

Přesněji: nechť existuje **jednotkový** váhový vektor $w^{\*}$ ($\|w^{\*}\|=1$), který data odděluje s **mezerou** (margin) $\gamma > 0$ — tedy každý bod má od ideální nadroviny vzdálenost aspoň $\gamma$:

::: math
t_i\,(w^{\*\top} x_i) \ge \gamma \quad \text{pro všechna } i.
:::

A nechť všechny body leží v kouli poloměru $R$, tj. $\|x_i\| \le R$. Pak počet **chyb** (a tedy aktualizací), které perceptron udělá, je shora omezený:

::: math
\#\text{chyb} \le \left(\frac{R}{\gamma}\right)^2.
:::

Intuice za vzorcem: každá aktualizace musí "natlačit" váhy o kousek blíž ke správnému řešení $w^{\*}$, ale velikost vah přitom nemůže růst příliš rychle. Z těchto dvou nerovností vyplyne strop $\left(R/\gamma\right)^2$. **Čím větší mezera $\gamma$ (lépe oddělitelná data), tím méně kroků.** Tahle souvislost mezi mezerou a rychlostí konvergence byla mimochodem jednou z motivací pro **SVM**, které mezeru přímo maximalizuje.

Důležité: tento strop **nezávisí na dimenzi** $D$ ani na počtu bodů $N$ — jen na geometrii ($R$ a $\gamma$).

## Co se stane u neseparabilních dat

Pokud žádná nadrovina data dokonale neoddělí (třídy se překrývají), předpoklad věty neplatí — a **perceptron nikdy nezastaví**. Hranice se donekonečna "houpe": opravuje jeden bod, čímž rozbije jiný, a tak pořád dokola; váhy necyklicky kmitají a algoritmus **nekonverguje**.

V praxi se to řeší několika způsoby:

- **Pevný počet epoch** + uložit nejlepší dosavadní řešení (**pocket algoritmus** — Gallant, 1990: drží "v kapse" váhy s nejmenší chybou, jaké zatím viděl).
- **Klesající rychlost učení** $\eta_t \to 0$, aby se kmity tlumily.
- Přechod na klasifikátor, který má **definovanou ztrátu i pro překryv** — typicky **logistickou regresi** (viz [[logisticka-regrese-sur]]) nebo **SVM** s měkkou mezí.

Druhé zásadní omezení: perceptron **nedává pravděpodobnosti**, jen tvrdé rozhodnutí $\pm 1$. Když potřebuješ míru jistoty ("85 % spam"), perceptron sám o sobě nestačí.

> **Historická poznámka.** Minsky a Papert (1969) ukázali, že jeden perceptron neumí naučit ani funkci **XOR** — ta totiž *není* lineárně separabilní. To na čas zbrzdilo výzkum neuronových sítí. Řešením je až **vícevrstvý** perceptron (skládání nelineárních vrstev), který už nelineární hranice zvládne.

::: quiz "Data dvou tříd se mírně překrývají (nejsou lineárně separabilní). Co udělá standardní perceptronové učení?"
- [ ] Konverguje k nadrovině, která minimalizuje počet chyb
  > Standardní perceptron žádnou ztrátu počtu chyb explicitně neminimalizuje; bez modifikace (pocket) tuto vlastnost nemá.
- [x] Nezastaví se — váhy donekonečna kmitají
  > Předpoklad věty o konvergenci (existence oddělující nadroviny s mezerou) neplatí, takže pravidlo střídavě opravuje konfliktní body a nikdy se neustálí. Pomáhá pevný počet epoch + pocket nebo klesající η.
- [ ] Skončí po nejvýše (R/γ)² krocích jako u separabilních dat
  > Tento strop platí jen při lineární separabilitě s kladnou mezerou γ; u překryvu γ neexistuje.
- [ ] Automaticky se přepne na kvadratickou hranici
  > Perceptron má vždy lineární hranici; nelinearitu by přinesla až transformace příznaků nebo vícevrstvá síť.
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 4: Linear Models for Classification)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Novikoff (1962): On convergence proofs for perceptrons — věta o konvergenci" "https://en.wikipedia.org/wiki/Perceptron#Convergence"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, kap. 4.1.7 — [PRML](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)); Rosenblatt, F.: „The Perceptron: A Probabilistic Model…" (Psychological Review 1958); Minsky, M., Papert, S.: „Perceptrons" (MIT Press 1969).*
