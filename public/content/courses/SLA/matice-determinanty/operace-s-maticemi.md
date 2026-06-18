---
title: Matice a operace s nimi
---

# Matice a operace s nimi

**Matice** je jen obdélníková tabulka čísel uspořádaná do řádků a sloupců. Z hlediska informatika je to vlastně 2D pole, ale lineární algebra jí dává navíc význam: matice typicky **kóduje lineární zobrazení** (transformaci prostoru — rotaci, škálování, projekci) nebo **koeficienty soustavy rovnic**. Většina operací níže přitom odpovídá nějaké přirozené operaci se zobrazeními.

Matici typu $m \times n$ (čteme „m krát n") zapisujeme obecně takto, kde $a_{ij}$ je prvek v $i$-tém řádku a $j$-tém sloupci:

::: math
A = \begin{pmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ a_{m1} & a_{m2} & \cdots & a_{mn} \end{pmatrix}, \qquad m = \text{počet řádků}, \; n = \text{počet sloupců}
:::

Konvence indexů je „**řádek, pak sloupec**" — $a_{23}$ je 2. řádek, 3. sloupec. Pár pojmenovaných speciálních případů, které se hodí znát: **čtvercová** matice ($m=n$), **diagonální** (nenulové prvky jen na hlavní diagonále $a_{ii}$), **nulová** (samé nuly) a **jednotková** matice $I$ (k té se vrátíme).

## Sčítání a násobení skalárem — „po prvcích"

Tyhle dvě operace jsou nudné, ale důležité: dějí se **prvek po prvku** a fungují, jen když matice odpovídají rozměrově. Sčítat lze pouze matice **stejného typu** $m \times n$:

::: math
(A + B)_{ij} = a_{ij} + b_{ij}
:::

Násobení skalárem (číslem) $c$ jen přenásobí každý prvek:

::: math
(cA)_{ij} = c \cdot a_{ij}
:::

Konkrétně třeba $\begin{pmatrix}1 & 2\\3 & 4\end{pmatrix} + \begin{pmatrix}0 & 5\\1 & 1\end{pmatrix} = \begin{pmatrix}1 & 7\\4 & 5\end{pmatrix}$ a $3\cdot\begin{pmatrix}1 & 2\\3 & 4\end{pmatrix} = \begin{pmatrix}3 & 6\\9 & 12\end{pmatrix}$. Obě operace jsou komutativní i asociativní, přesně jako u obyčejných čísel.

## Maticový součin — řádek krát sloupec

Maticové násobení je jiný kalibr a je to **nejdůležitější operace** v lineární algebře. Intuice: násobit matice znamená **složit dvě zobrazení za sebou** — nejdřív aplikuju $B$, pak $A$, a $AB$ je výsledná transformace, která dělá obojí najednou.

Aby součin $A \cdot B$ existoval, musí **počet sloupců $A$ odpovídat počtu řádků $B$**. Pro $A \in \mathbb{R}^{m\times n}$ a $B \in \mathbb{R}^{n\times p}$ vznikne matice $C = AB$ typu $m \times p$, kde prvek $c_{ij}$ je **skalární součin $i$-tého řádku $A$ a $j$-tého sloupce $B$**:

::: math
c_{ij} = \sum_{k=1}^{n} a_{ik}\, b_{kj}
:::

To je přesně to „řádek krát sloupec", co počítáš na tabuli: vezmeš $i$-tý řádek vlevo, $j$-tý sloupec vpravo, vynásobíš je po dvojicích a sečteš. V interaktivní figuře níže si můžeš nechat zvýraznit, který řádek a sloupec se zrovna sčítají do dané buňky.

::: viz matrix-multiply "Klikni na buňku výsledku C = A·B a nech si zvýraznit řádek A a sloupec B, jejichž skalární součin tu buňku tvoří; přepni mezi rozměrem 2×2 a 3×3 a uprav vstupní čísla."
:::

### Proč součin NENÍ komutativní

Obecně platí $AB \neq BA$ — a často ani nedávají oba stejný rozměr (může existovat $AB$, ale ne $BA$). I u čtvercových matic se pořadí téměř nikdy nezamění. Intuice je geometrická: „nejdřív otoč o 90°, pak zrcadli" dá jiný výsledek než „nejdřív zrcadli, pak otoč o 90°". Pořadí transformací prostě hraje roli.

Konkrétně: $\begin{pmatrix}0 & 1\\0 & 0\end{pmatrix}\begin{pmatrix}0 & 0\\1 & 0\end{pmatrix} = \begin{pmatrix}1 & 0\\0 & 0\end{pmatrix}$, ale $\begin{pmatrix}0 & 0\\1 & 0\end{pmatrix}\begin{pmatrix}0 & 1\\0 & 0\end{pmatrix} = \begin{pmatrix}0 & 0\\0 & 1\end{pmatrix}$. Jiné matice. Násobení je ale **asociativní** ($(AB)C = A(BC)$) a **distributivní** vůči sčítání.

## Transpozice — překlopení podle diagonály

**Transpozice** $A^T$ vznikne překlopením matice podle hlavní diagonály: z řádků se stanou sloupce. Formálně $(A^T)_{ij} = a_{ji}$. Matice typu $m\times n$ se transpozicí změní na typ $n \times m$.

Užitečné pravidlo, které se plete: transpozice součinu **obrací pořadí**:

::: math
(AB)^T = B^T A^T
:::

Matice, pro kterou $A = A^T$, se nazývá **symetrická** (je zrcadlově shodná podle diagonály, $a_{ij}=a_{ji}$). Pokud $A = -A^T$ (tedy $a_{ij} = -a_{ji}$, na diagonále nuly), je **antisymetrická**. Symetrické matice jsou v ML všudypřítomné — kovarianční matice, Gramovy matice, Hessián — a mají hezké vlastnosti (reálná vlastní čísla), o tom v podtématu o vlastních hodnotách.

## Jednotková matice a inverze

**Jednotková matice** $I$ je čtvercová matice s jedničkami na diagonále a nulami jinde. Hraje roli „jedničky" při násobení: pro libovolnou matici vhodného rozměru platí $AI = IA = A$. Pro $2\times 2$ je to $I = \begin{pmatrix}1 & 0\\0 & 1\end{pmatrix}$.

**Inverzní matice** $A^{-1}$ je k tomu „převrácená hodnota": je to taková matice, že po vynásobení s $A$ vznikne jednotková matice (zobrazení a jeho zpětné zobrazení se zruší):

::: math
A A^{-1} = A^{-1} A = I
:::

Inverze existuje **jen pro čtvercové matice** a **jen když matice není singulární** — tedy právě když $\det(A) \neq 0$ (determinant probereme v dalším podtématu). Pro $2\times 2$ existuje hezký vzoreček: prohodíš prvky na diagonále, otočíš znaménka mimo ni a vydělíš determinantem:

::: math
A = \begin{pmatrix} a & b \\ c & d \end{pmatrix} \quad\Longrightarrow\quad A^{-1} = \frac{1}{ad - bc} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}
:::

Vidíš tu, proč musí být $\det = ad - bc \neq 0$ — jinak dělíš nulou a inverze neexistuje.

### Inverze přes Gaussovu–Jordanovu eliminaci

Pro větší matice se $A^{-1}$ počítá **Gaussovou–Jordanovou eliminací**. Trik: napíšeš vedle sebe $A$ a $I$ do **rozšířené matice** $(A \mid I)$ a elementárními řádkovými úpravami převedeš levou část na $I$. To, co mezitím vznikne vpravo, je přesně $A^{-1}$ (děláš na obou stranách totéž — kroky, co z $A$ udělají $I$, udělají z $I$ právě $A^{-1}$):

::: math
(A \mid I) \;\xrightarrow{\text{řádkové úpravy}}\; (I \mid A^{-1})
:::

Spočítejme $A^{-1}$ pro $A = \begin{pmatrix}1 & 2\\3 & 4\end{pmatrix}$. Začneme rozšířenou maticí a postupně eliminujeme:

::: math
\left(\begin{array}{cc|cc} 1 & 2 & 1 & 0 \\ 3 & 4 & 0 & 1 \end{array}\right) \xrightarrow{R_2 - 3R_1} \left(\begin{array}{cc|cc} 1 & 2 & 1 & 0 \\ 0 & -2 & -3 & 1 \end{array}\right) \xrightarrow{-\frac{1}{2}R_2} \left(\begin{array}{cc|cc} 1 & 2 & 1 & 0 \\ 0 & 1 & \frac{3}{2} & -\frac{1}{2} \end{array}\right) \xrightarrow{R_1 - 2R_2} \left(\begin{array}{cc|cc} 1 & 0 & -2 & 1 \\ 0 & 1 & \frac{3}{2} & -\frac{1}{2} \end{array}\right)
:::

Vlevo máme $I$, takže vpravo čteme výsledek:

::: math
A^{-1} = \begin{pmatrix} -2 & 1 \\ \frac{3}{2} & -\frac{1}{2} \end{pmatrix}
:::

Kontrola: $\det A = 1\cdot 4 - 2\cdot 3 = -2$, vzoreček dá $\frac{1}{-2}\begin{pmatrix}4 & -2\\-3 & 1\end{pmatrix} = \begin{pmatrix}-2 & 1\\1{,}5 & -0{,}5\end{pmatrix}$ — sedí. Třetí možnost je inverze **přes adjungovanou matici** (transponovanou matici kofaktorů), $A^{-1} = \frac{1}{\det A}\,\text{adj}(A)$; je elegantní, ale pro $n > 3$ výpočetně drahá, takže se v praxi používá eliminace.

## Stopa matice (trace)

**Stopa** $\operatorname{tr}(A)$ čtvercové matice je prostě **součet prvků na hlavní diagonále**:

::: math
\operatorname{tr}(A) = \sum_{i=1}^{n} a_{ii}
:::

Pro $A = \begin{pmatrix}1 & 2\\3 & 4\end{pmatrix}$ je $\operatorname{tr}(A) = 1 + 4 = 5$. Vypadá to triviálně, ale stopa má překvapivě užitečné vlastnosti:

- **Linearita:** $\operatorname{tr}(A + B) = \operatorname{tr}(A) + \operatorname{tr}(B)$ a $\operatorname{tr}(cA) = c\operatorname{tr}(A)$.
- **Cyklická záměna:** $\operatorname{tr}(AB) = \operatorname{tr}(BA)$ (přestože $AB \neq BA$!), a obecněji $\operatorname{tr}(ABC)=\operatorname{tr}(BCA)$. Tohle se hodí při počítání gradientů v ML.
- **Stopa = součet vlastních čísel:** $\operatorname{tr}(A) = \sum_i \lambda_i$. To je krásný most k vlastním hodnotám — k němu se dostaneme v posledním podtématu.

::: quiz "Pro matice $A \in \mathbb{R}^{3\times 2}$ a $B \in \mathbb{R}^{2\times 4}$ — který součin je definovaný a jakého je rozměru?"
- [x] $AB$ je definovaný, rozměr $3 \times 4$
  > Vnitřní rozměry sedí (sloupce $A$ = 2 = řádky $B$), výsledek má vnější rozměry: řádky $A$ (3) krát sloupce $B$ (4).
- [ ] $BA$ je definovaný, rozměr $2 \times 2$
  > $BA$ by potřebovalo sloupce $B$ (4) = řádky $A$ (3), což neplatí — $BA$ vůbec neexistuje.
- [ ] Oba $AB$ i $BA$, oba $3\times 4$
  > $BA$ není definovaný, vnitřní rozměry nesedí.
- [ ] Ani jeden, rozměry nesedí
  > $AB$ definovaný je — sloupce $A$ (2) se rovnají řádkům $B$ (2).
:::

::: link "Strang — Introduction to Linear Algebra (kap. 1–2: matice a násobení)" "https://math.mit.edu/~gs/linearalgebra/"
:::

::: link "Axler — Linear Algebra Done Right (open access, kap. 3: lineární zobrazení a matice)" "https://linear.axler.net/"
:::

---

*Zdroj: SLA státnicové okruhy NMAL, VUT FIT. Externí reference: Strang, G.: „Introduction to Linear Algebra" ([math.mit.edu/~gs/linearalgebra](https://math.mit.edu/~gs/linearalgebra/)); Axler, S.: „Linear Algebra Done Right" (4. vyd., open access, [linear.axler.net](https://linear.axler.net/)).*
