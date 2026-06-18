---
title: Posteriorní prediktivní rozdělení a neurčitost odhadu
---

# Posteriorní prediktivní rozdělení a neurčitost odhadu

V praxi nás málokdy zajímá parametr $\theta$ sám o sobě. Chceme **predikovat nová data** $x'$ — jaký bude další hod mincí, jaká bude příští naměřená hodnota. Otázka tedy zní: jak z toho, co víme o parametrech (posterior), spočítat rozdělení nového pozorování $p(x' \mid X)$?

Tady se bayesovský přístup odlišuje nejvíc. Bodový odhad (MLE/MAP) vybere **jediné nejlepší $\hat\theta$** a predikuje čistě s ním — tomu se říká **plug-in** ("dosazení"). Bayes místo toho **zprůměruje predikce přes všechna možná $\theta$**, každou váží její posteriorní pravděpodobností. Tím do predikce promítne i to, jak (ne)jistí jsme si parametrem.

## Odvození: marginalizace přes parametry

Bayesovský model nepredikuje nová data přímo ze starých — vždycky jde "přes parametry". Proto $\theta$ do rovnice nejdřív zavedeme a hned zase vyintegrujeme pryč (to je **marginalizace**). Postup má čtyři krůčky:

**1.** Hledané $p(x' \mid X)$ rozepíšeme jako marginalizaci sdruženého rozdělení přes všechna $\theta$:

::: math
p(x' \mid X) = \int p(x', \theta \mid X)\,\mathrm{d}\theta
:::

**2.** Vnitřek rozložíme pravidlem součinu (řetězovým pravidlem):

::: math
p(x' \mid X) = \int p(x' \mid \theta, X)\,p(\theta \mid X)\,\mathrm{d}\theta
:::

**3.** Použijeme klíčový předpoklad **podmíněné nezávislosti**: pokud bychom $\theta$ znali s jistotou, generování nového $x'$ už na starých datech $X$ nijak nezávisí. Tedy $p(x' \mid \theta, X) = p(x' \mid \theta)$.

**4.** Dostáváme finální vzorec:

::: math
\boxed{\;p(x' \mid X) = \int \underbrace{p(x' \mid \theta)}_{\text{predikce při }\theta}\;\underbrace{p(\theta \mid X)}_{\text{posterior (váha)}}\,\mathrm{d}\theta\;}
:::

Slovy: **posteriorní prediktivní rozdělení je vážený průměr predikcí $p(x' \mid \theta)$ přes všechna $\theta$, kde vahami je posterior $p(\theta \mid X)$.** Parametry, které data vysvětlují špatně, mají malou váhu a do výsledku skoro nepřispívají; parametry, které data vysvětlují dobře, dominují. Má-li posterior dva vrcholy (dvě daty podporovaná vysvětlení), prediktivní rozdělení **zkombinuje oba scénáře** úměrně jejich pravděpodobnosti.

## Plug-in vs. prediktivní: proč je prediktivní širší

Porovnejme dva přístupy k téže predikci:

- **Plug-in:** $p(x' \mid X) \approx p(x' \mid \hat\theta)$ — dosadíme jeden bod $\hat\theta$ a hotovo. Předstírá, že parametr **známe přesně**.
- **Prediktivní (plný Bayes):** $p(x' \mid X) = \int p(x' \mid \theta)\,p(\theta \mid X)\,\mathrm{d}\theta$ — připustí, že parametr je **nejistý**, a tu nejistotu zahrne do predikce.

Protože prediktivní rozdělení míchá dohromady dva zdroje nejistoty — (a) náhodnost samotného procesu (i kdybychom $\theta$ znali, hod mince je náhodný) a (b) **naši nejistotu o $\theta$** — je **vždy širší (rozptýlenější)** než plug-in predikce, která zdroj (b) ignoruje. Plug-in je tedy **přehnaně sebejistý**, hlavně při málo datech.

::: viz bayes-predictive "Sleduj plug-in (jedno θ̂) vs. prediktivní (průměr přes celý posterior). Slider počtu dat: málo dat → posterior široký, prediktivní výrazně širší než plug-in; hodně dat → oba splynou."
:::

**Co v grafu vidíš (a co ne).** Tahle figura schválně ilustruje **jednodušší případ se *známým* rozptylem $\sigma^2$** a neznámou jen střední hodnotou $\mu$. Posterior nad $\mu$ je pak Gauss, a proto jsou **obě křivky Gaussovy**: plug-in $N(\hat\mu, \sigma^2)$ a prediktivní $N(\hat\mu, \sigma^2 + \tau^2)$, kde $\tau^2 = \sigma^2/n$. Prediktivní křivka je tedy jen **širší o $\tau^2$** (nejistota o $\mu$), ale pořád zvonovitá — **žádné těžší konce tu nečekej**. Těžší konce (Studentovo $t$) vznikají až v obecnějším případě **neznámého rozptylu** $\sigma^2$ z odstavce níže, kde do predikce přidáme i nejistotu o $\sigma^2$.

S rostoucím počtem dat se posterior zužuje (parametr je čím dál jistější), rozdíl mezi prediktivním a plug-in mizí a obě predikce splynou. Při málo datech je ale rozdíl podstatný — a právě tam plug-in nebezpečně podceňuje nejistotu.

## Dva klasické příklady

**Mince (Bernoulli + Beta).** Posterior po $s$ úspěších a $f$ neúspěších je $\mathrm{Beta}(\alpha+s, \beta+f)$. Pravděpodobnost, že **další hod** padne líc, je integrál $\int_0^1 \theta\, p(\theta\mid X)\,\mathrm{d}\theta$, což je přesně **posteriorní střední hodnota**:

::: math
p(x'=\text{líc} \mid X) = \mathbb{E}[\theta \mid X] = \frac{\alpha + s}{\alpha + \beta + s + f}
:::

Pro plochý prior $\alpha=\beta=1$ to dává tzv. **Laplaceovo pravidlo následnosti**: po $s$ lících z $n$ hodů je pravděpodobnost dalšího líce $(s+1)/(n+2)$. Po jediném líci to dá $2/3$, ne $1$ — rozumně opatrné, na rozdíl od MLE.

**Gaussovská data (neznámá $\mu$ i $\sigma^2$).** Tohle je obecnější případ než ten ve figuře výše: tam jsme rozptyl **znali** (a vyšly dva Gaussy), tady **neznáme ani $\sigma^2$**. Posteriorní prediktivní rozdělení pro nový bod pak **není Gauss, ale Studentovo $t$-rozdělení** — má **těžší konce (heavier tails)**. Ty těžší konce přesně kódují zvýšenou nejistotu z konečného počtu dat: protože neznáme přesně ani rozptyl, připouštíme víc extrémních hodnot, než by dovolil "sebejistý" Gauss s dosazeným $\hat\sigma$. S rostoucím $n$ se Studentovo $t$ blíží Gaussovi (plug-in).

## Neurčitost odhadu parametrů

Tohle je vlastnost, kterou bodové odhady **nemají vůbec**: Bayes nese nejistotu o parametru jako **šířku posterioru** $p(\theta \mid X)$ a chová se podle objemu dat:

- **Málo dat ($N$ malé):** data nestačí parametr jednoznačně určit. Posterior je **široký** (vysoký rozptyl), rozhodování silně ovlivňuje prior. Prediktivní rozdělení je rozmazané — a *správně* tak, protože opravdu nevíme.
- **Asymptotika ($N \to \infty$):** likelihood dominuje nad priorem. Posterior se **dramaticky zužuje** a koncentruje (konverguje k Diracově delta funkci) kolem jediné nejvěrohodnější hodnoty. Vliv prioru úplně mizí. V limitě tak bayesovská predikce **splyne s bodovým odhadem (MLE)**.

::: svg
<svg viewBox="0 0 320 175" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="320" height="175" fill="var(--bg-inset)"/>
  <text x="85" y="18" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">málo dat: posterior široký</text>
  <text x="235" y="18" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">hodně dat: posterior úzký</text>
  <line x1="20" y1="140" x2="150" y2="140" stroke="var(--line-strong)" stroke-width="0.7"/>
  <path d="M20 140 Q50 130 85 100 Q120 130 150 140" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <text x="85" y="158" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">vysoká nejistota</text>
  <line x1="170" y1="140" x2="300" y2="140" stroke="var(--line-strong)" stroke-width="0.7"/>
  <path d="M170 140 L225 140 Q232 138 235 35 Q238 138 245 140 L300 140" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <text x="235" y="158" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">téměř jistota → MLE</text>
  <text x="85" y="135" text-anchor="middle" font-size="8" fill="var(--text-faint)">p(θ|X)</text>
  <text x="235" y="135" text-anchor="middle" font-size="8" fill="var(--text-faint)">p(θ|X)</text>
</svg>
:::

::: quiz "Proč je posteriorní prediktivní rozdělení obvykle širší než plug-in predikce s $\hat\theta$?"
- [ ] Protože používá širší prior
  > Ne — šířka neplyne z prioru, ale z toho, že prediktivní zahrne i nejistotu o parametru.
- [x] Protože průměruje přes celý posterior, takže k vlastní náhodnosti procesu přidá ještě nejistotu o parametru $\theta$; plug-in tu druhou složku ignoruje
  > Přesně. Plug-in předstírá, že $\hat\theta$ je přesné, a tím podceňuje nejistotu. Prediktivní rozdělení míchá obě složky, proto je širší.
- [ ] Protože plug-in odhad je vždy chybný
  > Ne. Plug-in i prediktivní splynou, když je dat hodně; rozdíl je hlavně při málo datech.
- [ ] Protože Studentovo $t$ má vždy menší rozptyl než Gauss
  > Naopak — Studentovo $t$ má těžší konce (větší rozptyl) než odpovídající Gauss; právě to vyjadřuje zvýšenou nejistotu.
:::

::: link "Murphy — Probabilistic Machine Learning: Advanced Topics" "https://probml.github.io/pml-book/book2.html"
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 2–3, prediktivní rozdělení)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: BAYa státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [PDF](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)), kap. 2–3; Murphy, K. P.: „Probabilistic Machine Learning: Advanced Topics" (MIT Press 2023, [probml.github.io](https://probml.github.io/pml-book/book2.html)).*
