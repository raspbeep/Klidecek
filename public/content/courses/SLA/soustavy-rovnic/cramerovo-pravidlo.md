---
title: Cramerovo pravidlo
---

# Cramerovo pravidlo

**Cramerovo pravidlo** je elegantní vzoreček, který vyjádří řešení soustavy lineárních rovnic přímo pomocí **determinantů** — bez krokované eliminace. Krása je v tom, že každou neznámou dostaneme samostatným zlomkem, takže můžeme spočítat třeba jen jednu z nich a o ostatní se nestarat. Daň za eleganci je výpočetní cena, ke které se dostaneme.

## Kdy ho lze použít

Cramerovo pravidlo má **dvě omezení**, obě nutná:

1. soustava musí být **čtvercová** — stejně rovnic jako neznámých, tedy $A$ je $n\times n$,
2. matice soustavy musí být **regulární**, tedy $\det(A) \neq 0$.

Pokud obojí platí, má soustava $Ax = b$ právě jedno řešení (regularita $A$ přesně to zaručuje) a Cramerovo pravidlo nám ho dá. Když $\det(A) = 0$, vzoreček by dělil nulou a nelze ho použít — soustava pak má buď nekonečně mnoho řešení, nebo žádné (rozhodne Frobeniova věta).

## Samotný vzorec

Pro každou neznámou $x_i$ vytvoříme **pomocnou matici** $A_i$ tak, že v matici $A$ nahradíme **$i$-tý sloupec** vektorem pravých stran $b$ (ostatní sloupce necháme). Pak:

::: math
x_i = \frac{\det(A_i)}{\det(A)},\qquad i = 1, 2, \dots, n.
:::

Slovy: ve jmenovateli je pořád stejný determinant matice soustavy, v čitateli determinant matice, kde jsme „přepsali" sloupec patřící k té neznámé pravými stranami. Determinant ve jmenovateli spočítáme jen jednou, čitatel $n$-krát (pokaždé s jiným nahrazeným sloupcem).

::: viz cramer-lines "2×2 soustava jako dvě přímky v rovině: táhni koeficienty posuvníky a sleduj průsečík = řešení; vpravo se počítají determinanty det(A), det(A₁), det(A₂) a podíly. Když det(A)→0, přímky se stanou rovnoběžnými."
:::

## Příklad: soustava 2×2

Vyřešme

::: math
\begin{aligned}
2x + y &= 5,\\
x - y &= 1.
\end{aligned}
:::

Matice soustavy a její determinant:

::: math
A = \begin{pmatrix} 2 & 1\\ 1 & -1\end{pmatrix},\qquad \det(A) = 2\cdot(-1) - 1\cdot 1 = -3.
:::

Protože $\det(A) = -3 \neq 0$, řešení existuje a je jediné. Pro $x$ nahradíme **první** sloupec pravými stranami $b = \binom{5}{1}$, pro $y$ ten **druhý**:

::: math
A_1 = \begin{pmatrix} 5 & 1\\ 1 & -1\end{pmatrix},\quad \det(A_1) = 5\cdot(-1) - 1\cdot 1 = -6,
:::

::: math
A_2 = \begin{pmatrix} 2 & 5\\ 1 & 1\end{pmatrix},\quad \det(A_2) = 2\cdot 1 - 5\cdot 1 = -3.
:::

A výsledek:

::: math
x = \frac{\det(A_1)}{\det(A)} = \frac{-6}{-3} = 2,\qquad
y = \frac{\det(A_2)}{\det(A)} = \frac{-3}{-3} = 1.
:::

Řešení je $(x, y) = (2, 1)$ — což je přesně bod, kde se obě přímky protnou.

## Geometrie 2×2: průsečík dvou přímek

Každá rovnice soustavy $2\times 2$ je rovnice **přímky** v rovině. Řešení soustavy je jejich **průsečík**. Tady se krásně ukáže význam determinantu:

- $\det(A) \neq 0$ — přímky mají **různé směry**, protnou se v jediném bodě → právě jedno řešení.
- $\det(A) = 0$ — přímky jsou **rovnoběžné** (jejich směrové vektory jsou kolineární). Pak buď splývají (nekonečně mnoho řešení), nebo jsou různé rovnoběžky bez společného bodu (žádné řešení). V obou případech Cramerovo pravidlo selže, protože by dělilo nulou.

Determinant $\det(A) = a_{11}a_{22} - a_{12}a_{21}$ je tedy přímo měřítkem toho, „jak moc se přímky kříží" — čím blíž k nule, tím jsou rovnoběžnější a tím **citlivější** je řešení na malé změny koeficientů (soustava je *špatně podmíněná*).

## Proč ho na velké soustavy nepoužíváme

Cramerovo pravidlo je teoreticky pěkné, ale **prakticky nevhodné pro velké soustavy**. Důvod je čistě výpočetní: musíme spočítat $n+1$ determinantů matic $n\times n$.

Pokud bychom determinanty počítali rozvojem (Laplace), stojí jeden determinant $O(n!)$ operací — pro $n = 20$ je $20! \approx 2{,}4\cdot 10^{18}$, což je i pro počítač beznadějné. Naproti tomu **Gaussova eliminace** vyřeší tutéž soustavu v $O(n^3)$ operacích, tedy pro $n = 20$ řádově **tisíce** operací místo astronomického čísla.

Proto je dělba rolí v praxi jasná: na malé soustavy (typicky $2\times 2$ nebo $3\times 3$) nebo když potřebujeme symbolický vzorec pro jednu neznámou, je Cramer pohodlný; na cokoli většího se **vždy** používá Gaussova eliminace.

::: svg
<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="320" height="120" fill="var(--bg-inset)"/>
  <text x="160" y="18" text-anchor="middle" font-size="11" fill="var(--text)">Náročnost pro soustavu n × n</text>
  <line x1="40" y1="95" x2="300" y2="95" stroke="var(--line-strong)" stroke-width="0.5"/>
  <text x="40" y="110" font-size="8.5" fill="var(--text-muted)">malé n</text>
  <text x="300" y="110" text-anchor="end" font-size="8.5" fill="var(--text-muted)">velké n</text>
  <path d="M 40 90 Q 150 88 300 80" fill="none" stroke="var(--accent)" stroke-width="1.8"/>
  <text x="262" y="74" font-size="9" fill="var(--accent)">Gauss O(n³)</text>
  <path d="M 40 90 Q 120 88 175 60 Q 210 30 235 25" fill="none" stroke="var(--accent-line)" stroke-width="1.8"/>
  <text x="200" y="38" font-size="9" fill="var(--accent-line)">Cramer (Laplace) O(n!)</text>
  <text x="40" y="35" font-size="8.5" fill="var(--text-faint)">operací</text>
</svg>
:::

::: quiz "Kdy lze pro soustavu $Ax = b$ použít Cramerovo pravidlo?"
- [ ] Pro libovolnou soustavu, i obdélníkovou
  > Cramer vyžaduje čtvercovou matici — stejně rovnic jako neznámých. Pro obdélníkové soustavy vzorec není definován.
- [x] Když je $A$ čtvercová a $\det(A) \neq 0$
  > Obě podmínky jsou nutné: čtvercovost (jinak nelze počítat determinanty) a $\det(A) \neq 0$ (jinak by se dělilo nulou a soustava nemá jediné řešení).
- [ ] Vždy, když je soustava řešitelná
  > Soustava může být řešitelná i pro $\det(A) = 0$ (nekonečně mnoho řešení), ale tehdy Cramer nelze použít.
- [ ] Jen pro homogenní soustavy $Ax = 0$
  > Naopak — pro homogenní soustavu s $\det(A) \neq 0$ dá Cramer jen triviální řešení $x = 0$; pravidlo platí obecně pro libovolné $b$.
:::

::: link "Strang — Introduction to Linear Algebra (kap. 5.3: Cramerovo pravidlo a inverze)" "https://math.mit.edu/~gs/linearalgebra/"
:::

::: link "Cramer's rule — Wikipedia (vzorec, odvození, složitost)" "https://en.wikipedia.org/wiki/Cramer%27s_rule"
:::

---

*Zdroj: SLA státnicové okruhy NMAL, VUT FIT. Externí reference: Strang, G.: „Introduction to Linear Algebra" ([math.mit.edu/~gs/linearalgebra](https://math.mit.edu/~gs/linearalgebra/)) — kap. 5.3; Cramer, G. (1750): „Introduction à l'analyse des lignes courbes algébriques" — původní formulace pravidla.*
