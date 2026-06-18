---
title: Jádrové funkce (kernel trick)
---

# Jádrové funkce (kernel trick)

Měkký margin si poradí se šumem, ale pořád hledá jen **přímou** hranici. Co když jsou třídy uspořádané tak, že je žádná přímka neoddělí — třeba jedna třída tvoří **kroužek uvnitř** a druhá **prstenec kolem**? Lineární SVM tu nemá šanci.

Nápad: data nejdřív **přenes do prostoru o vyšší dimenzi**, kde už lineárně oddělitelná budou. V tom vyšším prostoru proložíš rovnou nadrovinu, a když ji "promítneš" zpět, vyjde **zakřivená** hranice. A přesně tohle umožní jádrové funkce udělat levně.

## Mapování do vyšší dimenze

Klasický příklad: dvě soustředné kružnice v 2D. Přidej třetí souřadnici $z = x_1^2 + x_2^2$ (vzdálenost od počátku na druhou). Vnitřní kroužek má malé $z$, vnější prstenec velké $z$ — v 3D je teď **vodorovnou rovinou** krásně oddělíš.

Obecně použijeme **mapovací funkci** $\varphi$, která vezme původní vektor $\mathbf{x}$ a vyrobí z něj vektor v prostoru příznaků o vyšší (klidně nekonečné) dimenzi:

::: math
\varphi: \mathbb{R}^d \to \mathbb{R}^D, \qquad D \gg d
:::

## Kernel trick: počítáme jen skalární součiny

Tady je elegance SVM. Když rozepíšeš duální formu úlohy i finální klasifikátor, ukáže se, že data v nich vystupují **výhradně přes skalární součiny** $\mathbf{x}_i^\top \mathbf{x}_j$ — nikdy jednotlivě. Po transformaci se z nich stanou součiny $\varphi(\mathbf{x}_i)^\top \varphi(\mathbf{x}_j)$.

A teď klíč: existuje **jádrová funkce** (kernel) $K$, která ten součin v cílovém prostoru spočítá **přímo z původních vektorů**, aniž bychom $\varphi$ kdy vyčíslili:

::: math
K(\mathbf{x}_i, \mathbf{x}_j) = \varphi(\mathbf{x}_i)^\top \varphi(\mathbf{x}_j)
:::

Tomu se říká **kernel trick**. Proč je tak silný:

- **Výpočetní efektivita** — explicitní cesta by znamenala vyrobit obří (třeba milionrozměrné) vektory $\varphi(\mathbf{x})$ a teprve mezi nimi násobit. Jádro $K$ vrátí stejné číslo přímo v nízké dimenzi za zlomek práce.
- **Nekonečné dimenze** — některá $\varphi$ mapují do **nekonečně rozměrného** prostoru (RBF). Vyčíslit takový vektor nejde vůbec, ale jádro $K$ ano. To je u explicitní transformace nepředstavitelné.

Stačí tedy v algoritmu nahradit každý $\mathbf{x}_i^\top\mathbf{x}_j$ za $K(\mathbf{x}_i,\mathbf{x}_j)$ a celý lineární SVM se rázem naučí nelineární hranici. Aby $K$ odpovídalo nějakému platnému skalárnímu součinu, musí být **pozitivně semidefinitní** (tzv. Mercerova podmínka).

## Nejčastější jádrové funkce

- **Lineární:** $K(\mathbf{x}_i,\mathbf{x}_j) = \mathbf{x}_i^\top\mathbf{x}_j$ — žádná transformace, obyčejný lineární SVM. Vhodný, když je dat hodně a jsou (skoro) lineárně oddělitelná.
- **Polynomiální:** $K(\mathbf{x}_i,\mathbf{x}_j) = (\gamma\,\mathbf{x}_i^\top\mathbf{x}_j + r)^d$ — mapuje na **kombinace příznaků** až do stupně $d$. Stupeň $d$ řídí ohebnost: $d=2$ dá kvadratické hranice, vyšší $d$ stále vlnitější.
- **RBF / Gaussovo:** $K(\mathbf{x}_i,\mathbf{x}_j) = \exp\!\big(-\gamma\,\|\mathbf{x}_i - \mathbf{x}_j\|^2\big)$ — nejpoužívanější. Jádro je vlastně **míra podobnosti**: blízké body → hodnota u 1, vzdálené → u 0. Odpovídá mapování do nekonečně rozměrného prostoru a kolem každého support vektoru vytváří lokální "ostrůvek" vlivu.

## Vliv parametru jádra (gamma u RBF)

Parametr $\gamma$ u RBF říká, **jak daleko sahá vliv** jednoho trénovacího bodu — je to převrácená hodnota poloměru jeho oblasti vlivu. A právě $\gamma$ rozhoduje o tom, jestli model podtrénuješ, nebo přetrénuješ:

- **Malé $\gamma$** — vliv bodu sahá daleko, hranice je **hladká** a globální. Příliš malé $\gamma$ → model je moc tuhý, nezachytí tvar dat (**underfitting**).
- **Velké $\gamma$** — vliv bodu je **lokální**, hranice se těsně obtáčí kolem jednotlivých bodů. Příliš velké $\gamma$ → model si "zapamatuje" i šum, oblast vlivu support vektoru obsahuje jen jeho samotného (**overfitting**), a žádné nastavení $C$ to už nezachrání.

Dobré modely leží uprostřed, $\gamma$ (i $C$) se proto ladí např. křížovou validací.

::: viz svm-kernel "Nelineárně oddělitelná data (dva kruhy). Přepni lineární / RBF jádro a táhni slider gamma: lineární jádro zvládne jen přímku (chybuje), RBF vykreslí zakřivenou hranici. Na levém kraji slideru je gamma tak malé, že hranice je až moc hladká a vnitřní kruh úplně zmizí — to je underfitting a počet chyb vyskočí. Postrč gamma doprava a hranice začne kruhy obkreslovat (0 chyb); úplně vpravo se obtáčí těsně kolem jednotlivých bodů."
:::

::: quiz "V čem přesně spočívá „kernel trick" a proč šetří výpočet?"
- [ ] Zmenší dimenzi dat, takže se SVM učí rychleji
  > Naopak — koncepčně pracujeme ve *vyšší* dimenzi; jen ji nikdy fyzicky nevyčíslíme.
- [x] Skalární součin ve vysokorozměrném prostoru spočítá přímo z původních vektorů, bez vyčíslení transformace φ(x)
  > Protože data vystupují v úloze jen přes skalární součiny, stačí nahradit $\mathbf{x}_i^\top\mathbf{x}_j$ jádrem $K(\mathbf{x}_i,\mathbf{x}_j)=\varphi(\mathbf{x}_i)^\top\varphi(\mathbf{x}_j)$. φ(x) se nikdy nevytváří — proto zvládne i nekonečné dimenze (RBF).
- [ ] Nahradí kvadratické programování gradientním sestupem
  > Kernel trick s optimalizační metodou nesouvisí; jde o náhradu skalárního součinu.
- [ ] Funguje jen pro lineárně oddělitelná data
  > Právě naopak — jeho smysl je zvládnout nelineárně oddělitelná data zakřivenou hranicí.
:::

::: link "Cortes & Vapnik — Support-Vector Networks (1995)" "https://doi.org/10.1007/BF00994018"
:::

::: link "scikit-learn — RBF SVM parameters (vliv C a gamma)" "https://scikit-learn.org/stable/auto_examples/svm/plot_rbf_parameters.html"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Cortes, C., Vapnik, V.: „Support-Vector Networks" (Machine Learning, 1995, [doi:10.1007/BF00994018](https://doi.org/10.1007/BF00994018)); Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 7](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)); Schölkopf, B., Smola, A.: „Learning with Kernels" (MIT Press 2002).*
