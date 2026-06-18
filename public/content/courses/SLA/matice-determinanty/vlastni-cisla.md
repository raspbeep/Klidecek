---
title: Vlastní hodnoty a vlastní vektory
---

# Vlastní hodnoty a vlastní vektory

Většina vektorů po aplikaci matice $A$ změní **směr i délku** — matice je „roztočí". Ale skoro každá matice má pár **výjimečných směrů**, které transformace neotočí: vektor zůstane na své přímce a jen se **natáhne nebo smrskne**. Takovým směrům říkáme **vlastní vektory** a faktoru natažení **vlastní číslo** (vlastní hodnota).

Intuice je mocná: vlastní vektory jsou „osy", podél kterých se transformace chová nejjednodušeji — jako pouhé škálování. Najít je znamená najít souřadnou soustavu, ve které je matice „diagonální". Proto jsou vlastní čísla jádrem PCA, spektrálního shlukování, stability dynamických systémů i PageRanku.

## Definiční rovnice $Av = \lambda v$

Hledáme **nenulový** vektor $v$ a skalár $\lambda$ takové, že:

::: math
A\,v = \lambda\, v, \qquad v \neq 0
:::

Levá strana je „aplikuj transformaci", pravá je „jen přeškáluj". Rovnice tedy říká: směr $v$ se zachová, mění se jen délka, a to $\lambda$-krát. Vektor $v$ je **vlastní vektor**, číslo $\lambda$ je k němu **přidružené vlastní číslo**.

V interaktivní figuře níže táhneš vstupní vektor po jednotkové kružnici a sleduješ, kam ho matice pošle: skoro pro všechny směry se vektor pootočí, ale **přesně ve směrech vlastních vektorů** zůstane na své přímce a jen se prodlouží/zkrátí $\lambda$-krát.

::: viz eigenvector-transform "Táhni vstupní vektor po kružnici a sleduj jeho obraz Av: obecně se otáčí, ale ve směrech vlastních vektorů zůstane na přímce a jen se škáluje λ-krát. Přepínej mezi maticemi (škálování, smyk, rotace) a sleduj, jak rotace nemá reálné vlastní směry."
:::

### Co znamená velikost a znaménko $\lambda$

Vlastní číslo přesně popisuje, co se s vektorem podél jeho směru stane:

- $|\lambda| > 1$ — vektor se **prodlouží**,
- $0 < |\lambda| < 1$ — vektor se **zkrátí**,
- $\lambda < 0$ — vektor se otočí na **opačnou stranu** (a podle velikosti zároveň škáluje),
- $\lambda = 0$ — vektor se zobrazí do **nulového vektoru**; to znamená, že $A$ je singulární a $v$ leží v jejím **jádře** (nullspace).

## Jak je spočítat — charakteristický polynom

Z definice $Av = \lambda v$ odvodíme algoritmus. Převedeme vše na jednu stranu a — abychom mohli vytknout $v$ — nahradíme skalár $\lambda$ maticovým výrazem $\lambda I$ (protože $\lambda v = \lambda I v$):

::: math
A v = \lambda v \;\Longrightarrow\; Av - \lambda I v = 0 \;\Longrightarrow\; (A - \lambda I)\, v = 0
:::

Matice $(A - \lambda I)$ vznikne tak, že od **diagonály** $A$ odečteš $\lambda$. Hledáme **nenulové** řešení $v$ téhle homogenní soustavy. Klíčový moment: homogenní soustava $(A-\lambda I)v = 0$ má netriviální (nenulové) řešení **právě tehdy, když je její matice singulární**, tedy když má nulový determinant:

::: math
\det(A - \lambda I) = 0
:::

Tahle rovnice se jmenuje **charakteristická rovnice**. Po rozvinutí determinantu z ní vznikne **charakteristický polynom** stupně $n$ v proměnné $\lambda$. Jeho **kořeny** jsou hledaná vlastní čísla $\lambda_1, \dots, \lambda_n$. Pro každé $\lambda$ pak zpětně dosadíš do $(A - \lambda I)v = 0$ a dořešíš příslušné vlastní vektory.

### Příklad — celý výpočet

Vezmeme $A = \begin{pmatrix}1 & 2 & 0\\2 & 1 & 0\\0 & 0 & 3\end{pmatrix}$. Sestavíme $\det(A - \lambda I) = 0$. Díky bloku $3-\lambda$ vpravo dole rozvineme podle 3. sloupce:

::: math
\det\!\begin{pmatrix}1-\lambda & 2 & 0\\2 & 1-\lambda & 0\\0 & 0 & 3-\lambda\end{pmatrix} = (3-\lambda)\,\bigl[(1-\lambda)^2 - 4\bigr] = 0
:::

Roznásobíme a rozložíme na kořenové činitele:

::: math
(3-\lambda)(\lambda^2 - 2\lambda - 3) = (3-\lambda)(\lambda - 3)(\lambda + 1) = 0
:::

Kořeny — a tedy vlastní čísla — jsou:

::: math
\lambda_1 = 3, \quad \lambda_2 = 3, \quad \lambda_3 = -1
:::

Číslo $\lambda = 3$ je kořenem dvakrát, má tedy **algebraickou násobnost 2** (kolikrát se objeví jako kořen charakteristického polynomu). Teď dopočítáme vlastní vektor pro $\lambda = -1$ — dosadíme do $(A - \lambda I)v = (A + I)v = 0$:

::: math
\begin{pmatrix}2 & 2 & 0\\2 & 2 & 0\\0 & 0 & 4\end{pmatrix}\begin{pmatrix}x\\y\\z\end{pmatrix} = 0 \;\xrightarrow{R_2 - R_1}\; \begin{pmatrix}2 & 2 & 0\\0 & 0 & 0\\0 & 0 & 4\end{pmatrix}
:::

Druhý řádek se vynuloval (očekávaná lineární závislost — proto byl $\det = 0$). Z nenulových řádků čteme $2x + 2y = 0 \Rightarrow x = -y$ a $4z = 0 \Rightarrow z = 0$. Volbou $y = -1$ dostaneme $x = 1$. Vlastní podprostor pro $\lambda = -1$ generuje vektor:

::: math
v = \begin{pmatrix}1 \\ -1 \\ 0\end{pmatrix}
:::

Můžeš ověřit: $Av = (1\cdot1 + 2\cdot(-1),\; 2\cdot1 + 1\cdot(-1),\; 0) = (-1, 1, 0) = -1\cdot v$. Sedí.

## Stopa = součet, determinant = součin vlastních čísel

Dvě nesmírně užitečné identity, které spojují vlastní čísla se stopou a determinantem (a které jsou skvělou **rychlou kontrolou** výpočtu):

::: math
\operatorname{tr}(A) = \sum_{i=1}^{n} \lambda_i, \qquad \det(A) = \prod_{i=1}^{n} \lambda_i
:::

Pro náš příklad: $\operatorname{tr}(A) = 1 + 1 + 3 = 5$ a $\sum \lambda_i = 3 + 3 + (-1) = 5$ — souhlasí. Determinant: $\det(A) = 3\cdot 3\cdot(-1) = -9 = \prod\lambda_i$. Z druhé identity hned plyne, proč $\det = 0 \Leftrightarrow$ některé $\lambda_i = 0$: nulové vlastní číslo znamená směr, který se zploští do nuly.

## Diagonalizace (stručně)

Když má matice $n\times n$ dohromady $n$ **lineárně nezávislých** vlastních vektorů, lze ji **diagonalizovat**: zapsat ji ve tvaru

::: math
A = P D P^{-1},
:::

kde sloupce $P$ jsou vlastní vektory a $D$ je diagonální matice s vlastními čísly na diagonále. Intuice: $P^{-1}$ přejde do „vlastní" souřadné soustavy, $D$ tam jen škáluje podél os a $P$ se vrátí zpět. Praktická výhoda — mocniny se počítají triviálně: $A^k = P D^k P^{-1}$, a $D^k$ je jen $\lambda_i^k$ na diagonále.

Symetrické reálné matice ($A = A^T$) jsou na tom obzvlášť dobře: mají **vždy reálná vlastní čísla** a navzájem **kolmé** vlastní vektory (spektrální věta) — proto se v PCA, kde pracujeme s kovarianční maticí, vlastní rozklad vždy „povede".

::: quiz "Matice 2×2 má vlastní čísla $\lambda_1 = 4$ a $\lambda_2 = -1$. Čemu se rovná $\operatorname{tr}(A)$ a $\det(A)$?"
- [x] $\operatorname{tr}(A) = 3$, $\det(A) = -4$
  > Stopa je součet vlastních čísel ($4 + (-1) = 3$), determinant jejich součin ($4\cdot(-1) = -4$).
- [ ] $\operatorname{tr}(A) = -4$, $\det(A) = 3$
  > Zaměněno — stopa je SOUČET ($=3$), determinant SOUČIN ($=-4$).
- [ ] $\operatorname{tr}(A) = 5$, $\det(A) = 4$
  > To by odpovídalo $\lambda$ se stejnými znaménky; tady je jedno záporné.
- [ ] Nelze určit bez znalosti vlastních vektorů
  > Stopa i determinant závisí jen na vlastních číslech, ne na vlastních vektorech.
:::

::: link "Strang — Introduction to Linear Algebra (kap. 6: vlastní čísla a vlastní vektory)" "https://math.mit.edu/~gs/linearalgebra/"
:::

::: link "Axler — Linear Algebra Done Right (kap. 5: vlastní hodnoty a invariantní podprostory)" "https://linear.axler.net/"
:::

---

*Zdroj: SLA státnicové okruhy NMAL, VUT FIT. Externí reference: Strang, G.: „Introduction to Linear Algebra" ([math.mit.edu/~gs/linearalgebra](https://math.mit.edu/~gs/linearalgebra/)) — kap. 6; Axler, S.: „Linear Algebra Done Right" (open access, [linear.axler.net](https://linear.axler.net/)) — kap. 5.*
