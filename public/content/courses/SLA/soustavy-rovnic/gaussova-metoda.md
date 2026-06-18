---
title: Gaussova eliminace a řešitelnost
---

# Gaussova eliminace a řešitelnost

**Soustava lineárních rovnic** je sada rovnic, ve kterých se neznámé vyskytují jen v první mocnině a nikdy se mezi sebou nenásobí. Typický příklad o třech neznámých:

::: math
\begin{aligned}
x + y + z &= 6,\\
2x - y + z &= 3,\\
x + 2y - z &= 3.
\end{aligned}
:::

Geometricky je každá taková rovnice **nadrovina** (v rovině přímka, v prostoru rovina) a **řešení soustavy** je množina bodů, které leží na všech těchto nadrovinách současně — tedy jejich **průnik**. Hledáme čísla $x, y, z$, která vyhovují *všem* rovnicím najednou.

## Maticový zápis: $Ax = b$

Místo psaní rovnic vypisujeme jen koeficienty. Soustavu $m$ rovnic o $n$ neznámých zapíšeme kompaktně jako součin **matice soustavy** $A$ (rozměr $m\times n$), sloupce neznámých $x$ a sloupce pravých stran $b$:

::: math
A x = b,\qquad
A = \begin{pmatrix} a_{11} & \cdots & a_{1n}\\ \vdots & & \vdots\\ a_{m1} & \cdots & a_{mn}\end{pmatrix},\quad
x = \begin{pmatrix}x_1\\\vdots\\x_n\end{pmatrix},\quad
b = \begin{pmatrix}b_1\\\vdots\\b_m\end{pmatrix}.
:::

Pro výpočet je nejpohodlnější přilepit pravou stranu $b$ k matici $A$ jako poslední sloupec. Vznikne **rozšířená matice soustavy**, kterou značíme $(A\,|\,b)$. Svislá čára je jen vizuální oddělovač koeficientů od pravých stran — žádný matematický význam nemá.

::: math
(A\,|\,b) = \left(\begin{array}{ccc|c}
1 & 1 & 1 & 6\\
2 & -1 & 1 & 3\\
1 & 2 & -1 & 3
\end{array}\right)
:::

## Tři možné scénáře

Než začneme počítat, je dobré vědět, co vůbec může vyjít. Soustava lineárních rovnic má vždy právě jednu ze **tří** možností — víc jich není:

- **žádné řešení** — rovnice si navzájem odporují (např. „$x+y=1$ a zároveň $x+y=3$"). Říkáme, že je soustava *neřešitelná* nebo *nekonzistentní*.
- **právě jedno řešení** — nadroviny se protnou v jediném bodě.
- **nekonečně mnoho řešení** — průnik je celá přímka, rovina apod.; jeden či více parametrů zůstane volných.

Pozor — **nikdy** nemůže nastat „přesně dvě řešení". To plyne z linearity: kdyby existovala dvě různá řešení $x_1, x_2$, pak i jejich úsečka (každá kombinace $tx_1+(1-t)x_2$) řeší soustavu, takže by jich bylo hned nekonečně.

## Hodnost matice — kolik rovnic je „opravdu nezávislých"

Klíčový pojem pro řešitelnost je **hodnost matice** (anglicky *rank*), značíme $\operatorname{rank}(A)$. Je to **počet lineárně nezávislých řádků** matice — neformálně: kolik rovnic nese skutečně novou informaci. Řádek, který je součtem nebo násobkem jiných, do hodnosti nepřispívá (po eliminaci z něj vyjde samé nuly).

Příklad: rovnice $x+y+z=1$ a $2x+2y+2z=2$ vypadají různě, ale druhá je jen dvojnásobek první — nese nulu nové informace. Hodnost těch dvou řádků je proto jen **1**, ne 2.

Praktický recept: hodnost přečteme přímo ze schodovitého tvaru (viz níže) jako **počet nenulových řádků**. Mimochodem počet nezávislých *řádků* je vždy roven počtu nezávislých *sloupců*, takže je jedno, jestli hodnost počítáme po řádcích nebo sloupcích.

## Frobeniova věta — kdy řešení existuje

Otázku „má soustava vůbec řešení?" zodpovídá **Frobeniova věta** (v anglické literatuře *Rouché–Capelliho věta*). Říká jednoduchou věc: porovnej hodnost matice soustavy s hodností rozšířené matice.

::: math
A x = b \ \text{je řešitelná} \iff \operatorname{rank}(A) = \operatorname{rank}(A\,|\,b).
:::

Intuice: přidat sloupec $b$ může hodnost jedině **zvednout**, nebo nechat stejnou. Když ji zvedne ($\operatorname{rank}(A\,|\,b) > \operatorname{rank}(A)$), znamená to, že pravá strana $b$ „nejde poskládat" z levých stran — vznikne řádek typu $0 = (\text{nenula})$, tedy spor, a soustava řešení nemá. Když hodnost zůstane stejná, řešení existuje.

A je-li soustava řešitelná (o $n$ neznámých), o počtu řešení rozhodne další porovnání — tentokrát hodnosti s **počtem neznámých** $n$:

::: math
\operatorname{rank}(A) = n \ \Rightarrow\ \text{právě jedno řešení},\qquad
\operatorname{rank}(A) < n \ \Rightarrow\ \text{nekonečně mnoho řešení}.
:::

V druhém případě je počet **volných parametrů** roven $n - \operatorname{rank}(A)$ — tolik neznámých si můžeme zvolit libovolně a zbytek se dopočítá.

::: svg
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="320" height="150" fill="var(--bg-inset)"/>
  <text x="160" y="18" text-anchor="middle" font-size="11" fill="var(--text)">Rozhodovací strom řešitelnosti</text>
  <rect x="100" y="28" width="120" height="20" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="160" y="42" text-anchor="middle" font-size="9.5" fill="var(--text)">rank(A) = rank(A|b)?</text>
  <line x1="130" y1="48" x2="60" y2="70" stroke="var(--line-strong)"/>
  <line x1="190" y1="48" x2="240" y2="70" stroke="var(--line-strong)"/>
  <text x="92" y="62" font-size="8.5" fill="var(--text-muted)">NE</text>
  <text x="216" y="62" font-size="8.5" fill="var(--text-muted)">ANO</text>
  <rect x="10" y="70" width="100" height="20" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="60" y="84" text-anchor="middle" font-size="9" fill="var(--accent)">žádné řešení</text>
  <rect x="190" y="70" width="120" height="20" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="250" y="84" text-anchor="middle" font-size="9.5" fill="var(--text)">rank(A) = n?</text>
  <line x1="220" y1="90" x2="170" y2="112" stroke="var(--line-strong)"/>
  <line x1="280" y1="90" x2="300" y2="112" stroke="var(--line-strong)"/>
  <text x="184" y="105" font-size="8.5" fill="var(--text-muted)">NE</text>
  <text x="290" y="105" font-size="8.5" fill="var(--text-muted)">ANO</text>
  <rect x="110" y="112" width="120" height="20" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="170" y="126" text-anchor="middle" font-size="9" fill="var(--accent)">nekonečně mnoho</text>
  <rect x="246" y="112" width="68" height="20" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="280" y="126" text-anchor="middle" font-size="9" fill="var(--accent)">právě jedno</text>
</svg>
:::

## Gaussova eliminace: jak se k tomu dopracovat

**Gaussova eliminace** je systematický postup, jak soustavu vyřešit (a zjistit hodnosti). Myšlenka: rozšířenou matici upravujeme tak, aby se pod hlavní diagonálou objevily samé nuly — vznikne tzv. **schodovitý tvar** — a z něj už řešení vyčteme odzadu.

Smíme přitom použít jen **elementární řádkové úpravy**, které *nemění množinu řešení* soustavy:

1. **záměna dvou řádků** (přeházíme pořadí rovnic),
2. **vynásobení řádku nenulovým číslem** (rovnici vynásobíme konstantou),
3. **přičtení násobku jednoho řádku k jinému** (k jedné rovnici přičteme jinou) — to je ta hlavní pracovní úprava, kterou vytváříme nuly.

Matice je ve **schodovitém tvaru** (*row echelon form*), když všechny nulové řádky leží dole a první nenulový prvek každého řádku (tzv. **pivot**) je vždy víc vpravo než pivot řádku nad ním — vzniká tím charakteristické „schodiště". Pokud jdeme ještě dál, vynulujeme i *nad* pivoty a pivoty znormujeme na jedničky, dostaneme **redukovaný schodovitý tvar** (*RREF*), z něhož se řešení čte přímo.

::: viz gauss-elimination "Rozšířená matice 3×4: tlačítkem „další krok" provádíš elementární řádkové úpravy směrem ke schodovitému a pak RREF tvaru; sleduj, jak postupně vznikají nuly pod pivoty a jak se čísla mění."
:::

## Zpětná substituce na konkrétním příkladu

Vraťme se k úvodní soustavě. Po dvou kolech eliminace (od 2. řádku odečteme $2\times$ první, od 3. řádku odečteme první, pak $R_3 \leftarrow 3R_3 + R_2$) dostaneme schodovitý tvar:

::: math
\left(\begin{array}{ccc|c}
1 & 1 & 1 & 6\\
0 & -3 & -1 & -9\\
0 & 0 & -7 & -18
\end{array}\right)
:::

Tady jsou tři nenulové řádky a tři neznámé, takže $\operatorname{rank}(A) = \operatorname{rank}(A\,|\,b) = 3 = n$ — soustava má **právě jedno** řešení. Dopočítáme ho **zpětnou substitucí**: jdeme zdola nahoru, protože poslední řádek obsahuje už jen jednu neznámou.

Poslední řádek říká $-7z = -18$, tedy $z = \tfrac{18}{7}$. Dosadíme do prostředního, $-3y - z = -9$:

::: math
-3y - \tfrac{18}{7} = -9 \ \Rightarrow\ -3y = -\tfrac{45}{7} \ \Rightarrow\ y = \tfrac{15}{7}.
:::

A nakonec do prvního řádku, $x + y + z = 6$:

::: math
x + \tfrac{15}{7} + \tfrac{18}{7} = 6 \ \Rightarrow\ x = 6 - \tfrac{33}{7} = \tfrac{9}{7}.
:::

Řešení je tedy $(x, y, z) = \left(\tfrac{9}{7}, \tfrac{15}{7}, \tfrac{18}{7}\right)$. (Dosazením zpět do původních rovnic si snadno ověříš, že sedí.)

## Příklad neřešitelné soustavy

Pro kontrast vezměme soustavu, která řešení nemá:

::: math
\begin{aligned}
x + y + z &= 1,\\
2x + 2y + 2z &= 2,\\
x + y + z &= 3.
\end{aligned}
:::

Po úpravách (2. řádek je dvojnásobek prvního, 3. řádek minus první) vyjde:

::: math
\left(\begin{array}{ccc|c}
1 & 1 & 1 & 1\\
0 & 0 & 0 & 0\\
0 & 0 & 0 & 2
\end{array}\right)
:::

Poslední řádek znamená rovnici $0 = 2$, což je **spor** — žádná čísla ji nesplní. V řeči hodností: $\operatorname{rank}(A) = 1$ (jen jeden nezávislý řádek vlevo), ale $\operatorname{rank}(A\,|\,b) = 2$ (vpravo přibyl ten řádek s „2"). Protože $\operatorname{rank}(A) \neq \operatorname{rank}(A\,|\,b)$, Frobeniova věta říká, že soustava **není řešitelná**.

## Speciální případ: homogenní soustava

Když je pravá strana nulová, $Ax = 0$, mluvíme o **homogenní soustavě**. Ta má jednu příjemnou vlastnost: $x = 0$ (samé nuly) ji vždy splní — tomu se říká **triviální řešení**. Homogenní soustava je tedy **vždy řešitelná** a otázka zní jen, zda kromě triviálního řešení existuje i nějaké netriviální. To nastane právě tehdy, když $\operatorname{rank}(A) < n$.

::: quiz "Soustava o 4 neznámých má $\operatorname{rank}(A) = 3$ a $\operatorname{rank}(A\,|\,b) = 3$. Co o ní platí?"
- [ ] Nemá řešení
  > To by nastalo, kdyby $\operatorname{rank}(A) \neq \operatorname{rank}(A\,|\,b)$. Tady se hodnosti rovnají, takže řešení existuje.
- [ ] Má právě jedno řešení
  > Jediné řešení by vyžadovalo $\operatorname{rank}(A) = n = 4$. Tady je hodnost jen 3.
- [x] Má nekonečně mnoho řešení s jedním volným parametrem
  > Hodnosti se rovnají (řešitelná) a $\operatorname{rank}(A) = 3 < 4 = n$, takže je řešení nekonečně mnoho; počet volných parametrů je $n - \operatorname{rank}(A) = 4 - 3 = 1$.
- [ ] Nelze rozhodnout bez znalosti konkrétních čísel
  > Lze — hodnosti a počet neznámých jednoznačně určují typ řešení podle Frobeniovy věty.
:::

::: link "Strang — Introduction to Linear Algebra (kap. 2: eliminace a Ax = b)" "https://math.mit.edu/~gs/linearalgebra/"
:::

::: link "MIT OCW 18.06 — Gaussian Elimination (G. Strang, video lekce)" "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"
:::

---

*Zdroj: SLA státnicové okruhy NMAL, VUT FIT. Externí reference: Strang, G.: „Introduction to Linear Algebra" ([math.mit.edu/~gs/linearalgebra](https://math.mit.edu/~gs/linearalgebra/)) — kap. 2; Meyer, C.D.: „Matrix Analysis and Applied Linear Algebra" (SIAM 2000) — Frobeniova/Rouché–Capelliho věta.*
