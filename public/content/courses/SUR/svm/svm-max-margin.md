---
title: Maximální margin a support vektory
---

# Maximální margin a support vektory

Představ si dvě hromádky teček na papíře — modré a červené — které jdou oddělit jednou rovnou čárou. Takových čar, které je perfektně oddělí, je obvykle **nekonečně mnoho**. Která je nejlepší? Intuitivně ta, která vede **co nejdál od obou hromádek** — má kolem sebe nejširší "bezpečnostní pás". Přesně tuhle čáru hledá **Support Vector Machine (SVM)**.

SVM je supervizovaný klasifikátor (učí se z označených dat). Pracuje s trénovací množinou $N$ vzorků $(\mathbf{x}_i, y_i)$, kde $\mathbf{x}_i \in \mathbb{R}^d$ je vektor příznaků a $y_i \in \{-1, +1\}$ je třída (kladná / záporná). V 2D je oddělovač čára, v 3D rovina a obecně to říkáme **nadrovina** (hyperplane).

## Nadrovina a rozhodovací pravidlo

Nadrovinu popíšeme jednou lineární rovnicí. Vektor $\mathbf{w}$ je její **normála** (kolmý směr, který určuje sklon), skalár $b$ je **posunutí** (bias, jak daleko je od počátku):

::: math
\mathbf{w}^\top \mathbf{x} + b = 0
:::

Nový bod $\mathbf{x}$ klasifikujeme podle toho, na které straně nadroviny leží — tedy podle znaménka výrazu $\mathbf{w}^\top\mathbf{x}+b$:

::: math
\hat{y} = \operatorname{sign}\!\left(\mathbf{w}^\top \mathbf{x} + b\right)
:::

Je-li výraz kladný, bod patří do třídy $+1$, je-li záporný, do třídy $-1$. Hodnota výrazu navíc roste se vzdáleností od nadroviny — body daleko od hranice klasifikujeme "s jistotou", body blízko hranice jen "tak tak".

## Margin: jak široký je bezpečnostní pás

**Margin** je šířka pásu kolem nadroviny, ve kterém neleží žádný trénovací bod. SVM tento pás chce mít **co nejširší**.

Trik je v tom, že rovnici nadroviny můžeme přeškálovat (vynásobit $\mathbf{w}$ i $b$ stejným číslem) tak, aby nejbližší body obou tříd ležely přesně na rovnoběžných okrajích pásu:

::: math
\mathbf{w}^\top \mathbf{x} + b = +1 \quad(\text{okraj kladné třídy}), \qquad \mathbf{w}^\top \mathbf{x} + b = -1 \quad(\text{okraj záporné třídy})
:::

Tomuto se říká **kanonická** forma. Body, které leží přesně na těchto okrajích, jsou ty kritické — drží nadrovinu na místě. Říká se jim **support vektory** (vektory podpory).

::: viz svm-margin "Táhni body myší. Sleduj, jak se max-margin nadrovina (plná čára), pásmo marginu (čárkované okraje) a množina support vektorů (zvýrazněné kroužky) mění podle toho, kde body leží — hranici určují jen nejbližší body, ne ty vzdálené."
:::

### Proč je margin roven 2/‖w‖

Šířku pásu spočítáme jako kolmou vzdálenost mezi oběma okraji. Vezmeme bod $\mathbf{x}_1$ na okraji $+1$ a bod $\mathbf{x}_2$ na okraji $-1$. Šířka $M$ je délka průmětu spojnice $(\mathbf{x}_1-\mathbf{x}_2)$ do směru jednotkové normály $\mathbf{w}/\|\mathbf{w}\|$:

::: math
M = (\mathbf{x}_1 - \mathbf{x}_2)^\top \frac{\mathbf{w}}{\|\mathbf{w}\|} = \frac{\mathbf{w}^\top\mathbf{x}_1 - \mathbf{w}^\top\mathbf{x}_2}{\|\mathbf{w}\|}
:::

Z rovnic okrajů víme, že $\mathbf{w}^\top\mathbf{x}_1 = 1-b$ a $\mathbf{w}^\top\mathbf{x}_2 = -1-b$. Dosadíme:

::: math
M = \frac{(1-b) - (-1-b)}{\|\mathbf{w}\|} = \frac{2}{\|\mathbf{w}\|}
:::

Klíčové pozorování: čím **menší** je norma $\|\mathbf{w}\|$, tím **širší** margin. Maximalizace marginu je tedy totéž co minimalizace $\|\mathbf{w}\|$.

## Primární optimalizační úloha

Maximalizovat $2/\|\mathbf{w}\|$ je nepohodlné (zlomek, odmocnina v normě). Převedeme to na ekvivalentní, ale hezčí úlohu — **minimalizaci** $\tfrac{1}{2}\|\mathbf{w}\|^2$:

::: math
\min_{\mathbf{w},\,b} \ \tfrac{1}{2}\|\mathbf{w}\|^2 \qquad \text{za podmínek} \qquad y_i\!\left(\mathbf{w}^\top \mathbf{x}_i + b\right) \ge 1, \quad i = 1,\dots,N
:::

Pojďme to rozebrat:

- **Účelová funkce** $\tfrac{1}{2}\|\mathbf{w}\|^2$ — minimalizací zužujeme $\|\mathbf{w}\|$, tedy rozšiřujeme margin. Druhá mocnina a faktor $\tfrac12$ jsou jen kosmetika: druhá mocnina odstraní nepříjemnou odmocninu v normě a její derivace ($2 \cdot \tfrac12 \mathbf{w} = \mathbf{w}$) vyjde čistě. Na poloze minima to nic nemění, protože $z \mapsto z^2$ je pro $z \ge 0$ rostoucí.
- **Podmínky** $y_i(\mathbf{w}^\top\mathbf{x}_i + b) \ge 1$ — jeden řádek pro každý bod. Říkají: každý bod musí ležet na **správné straně** a **vně** pásu (nebo přesně na okraji). Pro $y_i=+1$ to znamená $\mathbf{w}^\top\mathbf{x}_i+b\ge 1$, pro $y_i=-1$ pak $\mathbf{w}^\top\mathbf{x}_i+b\le -1$ — obojí ošetří jediný součin s $y_i$.

Tahle úloha je **konvexní kvadratické programování (QP)**: minimalizujeme kvadratickou funkci s lineárními omezeními. Praktická výhoda je obrovská — existuje **jediné globální minimum**, takže učení se nikdy nezasekne v špatném lokálním minimu (na rozdíl od neuronových sítí). Tato základní varianta se jmenuje **hard margin**, protože nepřipouští žádné chyby: žádný bod nesmí do pásu ani na špatnou stranu.

## Support vektory drží řešení

Když úlohu vyřešíme (typicky přes Lagrangeův duální problém), ukáže se zásadní vlastnost: výsledné $\mathbf{w}$ závisí **jen na support vektorech** — bodech ležících na okrajích pásu. Všechny ostatní body bys mohl smazat a nadrovina by vyšla úplně stejně.

To je důvod jména algoritmu. A je to i intuice, proč široký margin **lépe generalizuje**: rozhodnutí stojí jen na pár nejtěžších bodech u hranice, model je díky tomu jednoduchý a robustní. Široký bezpečnostní pás navíc znamená, že malé posunutí nového bodu (šum) ho jen tak nepřehodí přes hranici. Formálně to podporuje teorie: chyba generalizace je shora omezená klesající funkcí marginu.

::: quiz "Proč hard-margin SVM hledá nadrovinu s *maximálním* marginem, a ne libovolnou oddělující nadrovinu?"
- [ ] Maximální margin minimalizuje trénovací chybu na nulu
  > Každá *oddělující* nadrovina má u separabilních dat nulovou trénovací chybu — to maximální margin nijak nevylepší.
- [x] Široký margin nechává kolem hranice rezervu, což zlepšuje generalizaci a odolnost vůči šumu
  > Rozhodnutí pak stojí jen na nejbližších bodech (support vektorech) a nový zašuměný bod se hned nepřehoupne na druhou stranu; chyba generalizace je shora omezená klesající funkcí marginu.
- [ ] Maximální margin zaručuje, že úloha má více řešení
  > Naopak — díky konvexitě má max-margin úloha jediné globální optimum.
- [ ] Bez maximalizace by $\mathbf{w}$ nešlo spočítat
  > Spočítat by šlo, jen by řešení nebylo jednoznačné a hůř by generalizovalo.
:::

::: link "Cortes & Vapnik — Support-Vector Networks (1995)" "https://doi.org/10.1007/BF00994018"
:::

::: link "Bishop — PRML (kap. 7: Kernel Methods, SVM)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Cortes, C., Vapnik, V.: „Support-Vector Networks" (Machine Learning, 1995, [doi:10.1007/BF00994018](https://doi.org/10.1007/BF00994018)); Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 7](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)).*
