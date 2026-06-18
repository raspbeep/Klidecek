---
title: Determinant
---

# Determinant

**Determinant** je jedno jediné číslo, které přiřadíme **čtvercové** matici a které o ní prozradí překvapivě hodně. Nejlepší intuice je geometrická: determinant říká, **kolikrát matice (jako lineární zobrazení) zvětší objem** a jestli přitom **převrátí orientaci**.

Vezmi jednotkový čtverec o obsahu 1. Po aplikaci matice $A$ se z něj stane rovnoběžník — a jeho obsah je přesně $|\det(A)|$. Pro $3\times 3$ se z jednotkové krychle stane rovnoběžnostěn a $|\det(A)|$ je jeho objem. Pokud je $\det(A)$ záporný, transformace navíc **otočila orientaci** (zrcadlení). A pokud je $\det(A) = 0$, zobrazení **zploští** prostor do nižší dimenze (rovnoběžník zdegeneruje na úsečku s nulovým obsahem) — matice je pak **singulární**.

## Determinant 2×2 a geometrie obsahu

Pro matici $2\times 2$ je vzoreček krátký — a stojí za to ho mít „v ruce":

::: math
A = \begin{pmatrix} a & b \\ c & d \end{pmatrix} \quad\Longrightarrow\quad \det(A) = ad - bc
:::

Geometricky bereme sloupce matice jako dva vektory v rovině, $\vec{u} = (a, c)$ a $\vec{v} = (b, d)$. Ty napínají rovnoběžník a $\det(A) = ad - bc$ je jeho **orientovaný obsah** (znaménko podle toho, zda je $\vec{v}$ „nalevo" nebo „napravo" od $\vec{u}$). V interaktivní figuře si můžeš oba vektory táhnout a sledovat, jak se obsah i znaménko mění — a jak $\det$ spadne na nulu přesně tehdy, když se vektory stanou kolineárními (leží na jedné přímce).

::: viz determinant-area "Táhni dva sloupcové vektory matice 2×2 v rovině; sleduj, jak se |det| rovná obsahu napínaného rovnoběžníku a znaménko orientaci — a jak det = 0, když vektory zkolinearizují."
:::

## Význam determinantu — regulární vs. singulární

Determinant je jednoduchý test invertibility a lineární nezávislosti:

- $\det(A) \neq 0$ — matice je **regulární** (invertovatelná). Sloupce (i řádky) jsou **lineárně nezávislé**, zobrazení zachovává dimenzi a existuje inverze $A^{-1}$.
- $\det(A) = 0$ — matice je **singulární**. Sloupce jsou **lineárně závislé** (při Gaussově eliminaci vyjde nulový řádek), zobrazení zplošťuje prostor a **inverze neexistuje**.

To je důvod, proč determinant potkáš v podmínkách typu „soustava má jediné řešení, právě když $\det \neq 0$" nebo „inverze existuje, právě když $\det \neq 0$".

## Laplaceův (kofaktorový) rozvoj

Pro matice $n > 2$ je hlavní obecná metoda **Laplaceův rozvoj** podle vybraného řádku (nebo sloupce). Myšlenka: determinant $n\times n$ rozložíme na součet $n$ menších determinantů $(n{-}1)\times(n{-}1)$.

Rozvoj podle $i$-tého řádku:

::: math
\det(A) = \sum_{j=1}^{n} a_{ij}\,(-1)^{i+j}\, M_{ij}
:::

Tady $M_{ij}$ (tzv. **minor**) je determinant matice, která vznikne **vyškrtnutím $i$-tého řádku a $j$-tého sloupce**, a člen $(-1)^{i+j}$ dává typický **šachovnicový vzor znamének** $\begin{smallmatrix}+ & - & +\\- & + & -\\+ & - & +\end{smallmatrix}$. Součinu $(-1)^{i+j}M_{ij}$ se říká **kofaktor** $C_{ij}$.

**Příklad.** Rozviňme podle 1. řádku determinant matice $A = \begin{pmatrix}1 & 2 & 3\\0 & 4 & 5\\1 & 0 & 6\end{pmatrix}$:

::: math
\det(A) = 1\cdot\begin{vmatrix}4 & 5\\0 & 6\end{vmatrix} - 2\cdot\begin{vmatrix}0 & 5\\1 & 6\end{vmatrix} + 3\cdot\begin{vmatrix}0 & 4\\1 & 0\end{vmatrix}
:::

Spočítáme tři minory $2\times 2$: $\begin{vmatrix}4 & 5\\0 & 6\end{vmatrix} = 24$, $\begin{vmatrix}0 & 5\\1 & 6\end{vmatrix} = -5$, $\begin{vmatrix}0 & 4\\1 & 0\end{vmatrix} = -4$. Dosadíme:

::: math
\det(A) = 1\cdot 24 - 2\cdot(-5) + 3\cdot(-4) = 24 + 10 - 12 = 22
:::

**Tip:** rozvíjej vždy podle řádku/sloupce s **nejvíc nulami** — nulový prvek vynuluje celý svůj člen, takže minor pro něj vůbec nemusíš počítat.

## Sarrusovo pravidlo (jen pro 3×3)

Pro matice **přesně $3\times 3$** existuje rychlá mnemotechnika — **Sarrusovo pravidlo**. Diagonály „dolů" (zleva doprava) se přičítají, diagonály „nahoru" se odečítají:

::: math
\det\!\begin{pmatrix} a & b & c \\ d & e & f \\ g & h & i \end{pmatrix} = (aei + bfg + cdh) - (ceg + bdi + afh)
:::

Pomůcka: opíšeš si první dva sloupce ještě jednou napravo a sčítáš tři „úplné" diagonály dolů a odečítáš tři diagonály nahoru. **Pozor** — Sarrus platí **výhradně pro $3\times 3$**, na $4\times 4$ a větší ho použít nelze (tam jedině Laplace nebo eliminace).

## Determinant přes řádkové úpravy (eliminace)

Pro velké matice je nejefektivnější převést matici Gaussovou eliminací na **horní trojúhelníkový (schodovitý) tvar**, kde je determinant prostě **součin prvků na diagonále**:

::: math
\det(A) = \prod_{i=1}^{n} a_{ii} \quad \text{(pro trojúhelníkovou matici)}
:::

Při eliminaci ale musíš hlídat, jak jednotlivé úpravy mění determinant:

- **přičtení násobku jednoho řádku k jinému** — $\det$ se **nemění** (to je ta bezpečná úprava, kterou hlavně používáme),
- **prohození dvou řádků** — $\det$ změní **znaménko** (vynásobí $-1$),
- **vynásobení řádku číslem $k$** — $\det$ se vynásobí $k$ (proto, pokud při normalizaci pivotu dělíš, musíš to zpětně zohlednit).

Tahle metoda má složitost $O(n^3)$, zatímco naivní Laplaceův rozvoj je $O(n!)$ — pro $n=10$ je to rozdíl mezi ~1000 a ~3,6 milionu operací. Proto se determinanty velkých matic počítají eliminací.

## Klíčové vlastnosti determinantu

Pár vlastností, které je dobré umět vyjmenovat u zkoušky:

- **Multiplikativnost:** $\det(AB) = \det(A)\cdot\det(B)$. (Geometricky logické: složíš-li dvě zobrazení, objemové faktory se vynásobí.)
- **Singularita:** $\det(A) = 0$ právě tehdy, když je $A$ singulární (lineárně závislé sloupce).
- **Transpozice nemění determinant:** $\det(A^T) = \det(A)$ (proto lze rozvíjet podle řádku i sloupce stejně).
- **Inverze:** je-li $A$ regulární, $\det(A^{-1}) = 1/\det(A)$ — plyne z $\det(A)\det(A^{-1}) = \det(I) = 1$.
- **Trojúhelníková / diagonální matice:** $\det = \prod a_{ii}$, součin prvků na diagonále.

::: quiz "Matice $A$ je $4\times 4$. Jaká metoda je pro výpočet $\det(A)$ nejvhodnější a proč Sarrus nepřipadá v úvahu?"
- [x] Gaussova eliminace na trojúhelníkový tvar (nebo Laplace); Sarrus platí jen pro 3×3
  > Sarrusovo pravidlo je definováno výhradně pro 3×3. Pro 4×4 a větší se používá Laplaceův rozvoj ($O(n!)$) nebo efektivněji eliminace ($O(n^3)$).
- [ ] Sarrusovo pravidlo rozšířené o čtvrtý sloupec
  > Sarrus nelze rozšířit — pro 4×4 dává špatný výsledek, platí jen pro 3×3.
- [ ] Determinant se u 4×4 nedá spočítat
  > Dá, jen ne Sarrusem — Laplace i eliminace fungují pro libovolné $n$.
- [ ] Stačí vynásobit prvky na diagonále bez úprav
  > To platí jen pro trojúhelníkovou matici; obecnou 4×4 musíš nejprve na trojúhelníkový tvar převést.
:::

::: link "Strang — Introduction to Linear Algebra (kap. 5: determinanty)" "https://math.mit.edu/~gs/linearalgebra/"
:::

::: link "Axler — Linear Algebra Done Right (kap. 9–10: determinanty a objem)" "https://linear.axler.net/"
:::

---

*Zdroj: SLA státnicové okruhy NMAL, VUT FIT. Externí reference: Strang, G.: „Introduction to Linear Algebra" ([math.mit.edu/~gs/linearalgebra](https://math.mit.edu/~gs/linearalgebra/)) — kap. 5; Axler, S.: „Linear Algebra Done Right" (open access, [linear.axler.net](https://linear.axler.net/)).*
