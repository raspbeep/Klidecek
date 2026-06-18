---
title: LBF vs RBF sítě a back propagation
---

# LBF vs RBF sítě a back propagation

Neuron je v jádru jednoduchá věc: spočítá si z příchozích vstupů jedno číslo (svůj **vnitřní potenciál**, někdy se mu říká **báze**) a to pak protlačí **aktivační funkcí**, která dá výstup. Celé kouzlo různých typů neuronů je v tom, **jak to vstupní číslo spočítají** — a tomu se říká **bázová funkce**. Dva nejdůležitější druhy jsou LBF a RBF a liší se zásadně: jeden se ptá *„kterým směrem od nadroviny ležíš?"*, druhý *„jak daleko jsi od mého středu?"*.

## LBF — lineární bázová funkce (klasický perceptron)

**LBF** znamená, že vnitřní potenciál $\xi$ vzniká jako **vážený součet** vstupů plus práh (bias) $b$. To je přesně ten neuron, který znáte z perceptronu a běžných vícevrstvých sítí.

::: math
\xi = \sum_{i=1}^{n} w_i x_i + b = \mathbf{w}^{\top}\mathbf{x} + b
:::

Výstup pak dostaneme aplikací aktivační funkce $f$, typicky sigmoidy $\sigma$:

::: math
a = f(\xi) = \sigma\!\left(\mathbf{w}^{\top}\mathbf{x} + b\right), \qquad \sigma(\xi) = \frac{1}{1+e^{-\xi}}
:::

Klíčová intuice: rovnice $\mathbf{w}^{\top}\mathbf{x} + b = 0$ je **nadrovina** (v 2D přímka) a neuron v podstatě měří, **na které straně té nadroviny** vstup leží a jak daleko. Proto má LBF neuron **globální** odezvu — rozdělí celý prostor na dvě poloroviny a reaguje (skoro) všude. Když jste hodně daleko od rozhodovací hranice na "kladné" straně, sigmoida dá pořád 1, ať jste kdekoli.

Aktivačních funkcí pro LBF je celá rodina, každá řeší něco jiného:

- **Skoková (step)** — binární výstup 0/1 (nebo −1/+1) podle prahu. Historický perceptron, ale není diferencovatelná, takže se s ní nedá učit gradientem.
- **Sigmoida / tanh** — hladké "esíčko", mačká výstup do $(0,1)$ resp. $(-1,1)$. Diferencovatelná, ale pro velké $|\xi|$ má skoro nulovou derivaci (problém **mizejícího gradientu**).
- **ReLU** $=\max(0,\xi)$ — propustí kladné, záporné nuluje. Levná, derivace je 0 nebo 1, proto tolik netrpí mizejícím gradientem. Dnešní standard ve skrytých vrstvách.
- **Softmax** — vezme vektor výstupů celé vrstvy a znormalizuje ho na **pravděpodobnostní rozdělení** (suma = 1). Používá se v poslední klasifikační vrstvě.

## RBF — radiální bázová funkce (reaguje na okolí bodu)

U **RBF** neuronu nevyjadřuje vnitřní potenciál žádný vážený součet, ale **vzdálenost** vstupního vektoru $\mathbf{x}$ od **středu (centra)** $\mathbf{c}$, který je tomu neuronu pevně přiřazený:

::: math
\xi = \lVert \mathbf{x} - \mathbf{c} \rVert = \sqrt{\sum_{i=1}^{n}(x_i - c_i)^2}
:::

Aktivační funkce je nejčastěji **Gaussova** — dá nejvyšší výstup (= 1), když je vstup přesně ve středu, a s rostoucí vzdáleností hladce klesá k nule. Parametr $\sigma$ řídí **šířku** kopečku (jak rychle odezva opadá):

::: math
a = \varphi(\xi) = \exp\!\left(-\frac{\lVert \mathbf{x} - \mathbf{c}\rVert^{2}}{2\sigma^{2}}\right)
:::

Rozdíl proti LBF je zásadní a u zkoušky se na něj rádi ptají: RBF neuron má **lokální** odezvu. Reaguje jen na malé okolí svého středu (Gaussův "kopeček"), všude jinde mlčí (výstup ≈ 0). LBF neuron má naproti tomu **globální** odezvu danou nadrovinou. Lokálnost je výhoda i nevýhoda: dobře pokryje konkrétní oblast vstupního prostoru, ale na pokrytí celého prostoru potřebujete dost center.

Nejlíp to uvidíš, když se podíváš na **odezvu jednoho neuronu nad celým 2D vstupním prostorem** — přepni mezi LBF a RBF a sleduj, jak se obarvení mění z dělící nadroviny (LBF svítí v celé polorovině) na kompaktní kopeček (RBF svítí jen kolem centra). Přesně tenhle kontrast testuje kvíz níže.

::: viz lbf-rbf-response "Přepínač LBF↔RBF nad 2D vstupním prostorem: barva ukazuje aktivaci neuronu. LBF (sigmoida nad w·x+b) obarví celou polorovinu — globální odezva; RBF (Gaussovo jádro) rozsvítí jen kopeček kolem centra — lokální odezva. Posuvníkem nakláníš nadrovinu / posouváš centrum."
:::

::: viz rbf-network "Skládej cílovou křivku z Gaussových RBF kopečků: posouvej centrum a šířku každého neuronu, měň jeho váhu a sleduj, jak se vážená suma (výstup sítě) přibližuje cíli. Vidíš i lokálnost — každý kopeček ovlivní jen své okolí."
:::

## RBF síť — dvě vrstvy s dělbou práce

RBF **síť** je typicky **dvouvrstvá** a má hezky oddělené role:

1. **Skrytá vrstva** — sada RBF neuronů, každý se svým centrem $\mathbf{c}_j$ a šířkou $\sigma_j$. Spočítá, jak blízko je vstup ke každému centru. Výstupem je vektor aktivací $\varphi_j(\mathbf{x})$ — "jak moc vstup patří do okolí $j$-tého centra".
2. **Výstupní vrstva** — **lineární** kombinace těch aktivací:

::: math
y(\mathbf{x}) = \sum_{j=1}^{m} w_j \, \varphi_j(\mathbf{x}) + b
:::

Proč je to chytré: protože výstup je lineární ve váhách $w_j$, dají se tyto váhy najít **rychle a přesně** (lineární regrese / pseudoinverze), pokud už máme zafixovaná centra a šířky. Centra se obvykle volí zvlášť — třeba shlukováním (k-means) přes trénovací data, nebo se dají položit na vybrané trénovací body. To je rychlejší než trénovat všechno gradientem najednou jako u MLP.

Funkčně tedy RBF síť **interpoluje**: ke každému kousku vstupního prostoru přiřadí "kopeček" a výstup poskládá z jejich vážené sumy — přesně to si můžeš osahat ve vizualizaci výše.

## Back propagation — jak se učí vícevrstvá LBF síť

Vícevrstvé LBF sítě (MLP) se zafixovanou strukturou učíme **gradientním sestupem** a algoritmus, který spočítá potřebné gradienty, je **back propagation** (zpětné šíření chyby). Funguje díky **řetízkovému pravidlu** (chain rule) a vyžaduje, aby všechny aktivační funkce byly **diferencovatelné**.

Smyčka učení má čtyři kroky:

1. **Dopředný průchod** — vstup projde sítí, spočítá se aktuální výstup.
2. **Chyba** — výstup se porovná s cílem $t$ chybovou funkcí (např. MSE nebo křížová entropie).
3. **Zpětný průchod** — chyba se šíří *pozpátku* od výstupu ke vstupu a v každé vrstvě se řetízkovým pravidlem spočítá gradient (parciální derivace chyby podle každé váhy).
4. **Aktualizace vah** — váhy se posunou **proti** gradientu o krok daný rychlostí učení $\eta$.

Ukažme to na nejjednodušším segmentu: vstup $x \to$ váha $w \to$ neuron s potenciálem $\xi = w x$ a aktivací $a = \sigma(\xi)$. Chyba je $E = \tfrac12 (a-t)^2$. Řetízkovým pravidlem rozložíme derivaci $\partial E/\partial w$ na tři snadné kousky:

::: math
\frac{\partial E}{\partial w}
= \underbrace{\frac{\partial E}{\partial a}}_{(a-t)} \cdot
  \underbrace{\frac{\partial a}{\partial \xi}}_{\sigma'(\xi)} \cdot
  \underbrace{\frac{\partial \xi}{\partial w}}_{x}
= (a-t)\,\sigma'(\xi)\,x
:::

a váhu aktualizujeme:

::: math
w_{\text{new}} = w_{\text{old}} - \eta\,\frac{\partial E}{\partial w} = w_{\text{old}} - \eta\,(a-t)\,\sigma'(\xi)\,x
:::

Přesně tohle "zpětné" násobení derivací vrstvu po vrstvě je celý trik back propagation — detail a obecné odvození přes všechny vrstvy najdeš v [[gradient-descent]] v SUI.

> Pozn.: Tady jde o **dva různé módy** učení. RBF síť se obvykle učí hybridně (centra zvlášť, výstupní váhy lineární regresí), ale i ona se *dá* doladit back propagation, protože Gaussova funkce je diferencovatelná. MLP s LBF neurony se naproti tomu učí čistě back propagation.

## Univerzální aproximační teorém — proč to vůbec funguje

Hezká teoretická pojistka: **dopředná síť s jednou skrytou vrstvou** nelineárních neuronů dokáže aproximovat **libovolnou spojitou funkci s libovolnou přesností** — stačí dostatek neuronů ve skryté vrstvě. Říká nám to, že síť *teoreticky umí* naučit jakýkoli vztah vstup→výstup; neříká ale, kolik neuronů potřebujeme ani že to gradientní sestup skutečně najde.

Pozor na atribuci, protože jde o **dva různé výsledky pro dva typy sítí**. Pro **sigmoidální** (LBF) neurony to dokázal Cybenko (1989). Pro **RBF sítě s Gaussovými jádry** je to *analogický, ale samostatný* výsledek — dokázali ho až Park & Sandberg (1991). Cybenkův teorém je totiž formulovaný a dokázaný specificky pro sigmoidální funkce, RBF nepokrývá; nezaměňuj je.

::: quiz "Čím se liší odezva neuronu s LBF od neuronu s RBF?"
- [ ] Obě jsou lokální — reagují jen na okolí jednoho bodu
- [x] LBF má globální odezvu (nadrovina dělí celý prostor), RBF má lokální odezvu (Gaussův kopeček kolem centra)
  > LBF počítá $\mathbf{w}^{\top}\mathbf{x}+b$ a reaguje podle strany nadroviny v celém prostoru; RBF počítá vzdálenost $\lVert\mathbf{x}-\mathbf{c}\rVert$ a má nenulový výstup jen blízko svého centra.
- [ ] LBF je lokální, RBF globální
- [ ] Liší se jen aktivační funkcí, odezva je u obou stejná
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 5: Neural Networks, RBF)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Cybenko — Approximation by Superpositions of a Sigmoidal Function (1989, univerzální aproximace pro sigmoidy)" "https://doi.org/10.1007/BF02551274"
:::

::: link "Park & Sandberg — Universal Approximation Using Radial-Basis-Function Networks (Neural Computation 1991, univerzální aproximace pro RBF)" "https://doi.org/10.1162/neco.1991.3.2.246"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [PRML](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — kap. 5 (sítě, RBF); Broomhead, D. S., Lowe, D.: „Multivariable Functional Interpolation and Adaptive Networks" (1988) — konstrukce RBF sítí; Cybenko, G.: „Approximation by Superpositions of a Sigmoidal Function" (1989, [DOI:10.1007/BF02551274](https://doi.org/10.1007/BF02551274)) — univerzální aproximace pro sigmoidy; Park, J., Sandberg, I. W.: „Universal Approximation Using Radial-Basis-Function Networks" (Neural Computation 1991, [DOI:10.1162/neco.1991.3.2.246](https://doi.org/10.1162/neco.1991.3.2.246)) — univerzální aproximace pro RBF.*
