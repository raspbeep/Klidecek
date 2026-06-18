---
title: Markovovo náhodné pole a faktorový graf
---

# Markovovo náhodné pole a faktorový graf

Bayesovská síť (viz [[bayesovske-site]]) potřebuje **orientované** šipky — někdo musí být příčina a někdo důsledek. Jenže spousta vztahů žádný směr nemá. Sousední pixely v obraze "spolu ladí" symetricky, atomy v krystalu se ovlivňují vzájemně. Pro takové **symetrické** závislosti se hodí **neorientovaný** model: Markovovo náhodné pole.

## Markovovo náhodné pole (MRF)

**Markovovo náhodné pole** (*Markov random field*, MRF, též *Markov network*) je neorientovaný grafový model. Uzly jsou náhodné proměnné, hrany jsou neorientované a vyjadřují, že dvě proměnné spolu *přímo* souvisí.

Hlavní výhoda neorientovaného grafu: **podmíněnou nezávislost čteš přímo z grafu úplně jednoduchým pravidlem**. Dva uzly (nebo množiny uzlů) jsou podmíněně nezávislé daným množinou $S$, **pokud každá cesta mezi nimi prochází nějakým uzlem z $S$**. $S$ funguje jako "plot", který graf rozdělí — odtud *separace*.

**Příklad — čtyřcyklus.** Mějme čtverec $x_1 - x_2$, $x_1 - x_3$, $x_2 - x_4$, $x_3 - x_4$ (hrany po obvodu, úhlopříčky chybí). Je $x_1 \perp x_4 \mid \{x_2, x_3\}$? Každá cesta z $x_1$ do $x_4$ musí projít buď $x_2$, nebo $x_3$ — oba jsou v podmiňující množině. Takže **ano**, $x_1 \perp x_4 \mid x_2, x_3$.

## Faktory, potenciály a partiční funkce Z

MRF nepoužívá podmíněné pravděpodobnosti (ty by potřebovaly směr). Místo nich definuje **potenciálové funkce** $\psi_C(\mathbf{x}_C) > 0$ — kladné funkce, které měří *"jak moc spolu hodnoty v dané skupině ladí"*. Nejsou to pravděpodobnosti, jen **míry kompatibility** (vyšší = preferovanější konfigurace).

Skupiny, nad kterými potenciály definujeme, jsou **maximální kliky** grafu:

- **Klika** = podmnožina uzlů, kde je každá dvojice spojena hranou (úplný podgraf).
- **Maximální klika** = klika, ke které už nelze přidat další uzel a zachovat klikovost.

Uzly nespojené hranou nesmí sdílet faktor — proto faktorizujeme přesně přes maximální kliky. Sdružené rozdělení je **normalizovaný součin** potenciálů:

::: math
P(\mathbf{x}) = \frac{1}{Z} \prod_{C} \psi_C(\mathbf{x}_C), \qquad Z = \sum_{\mathbf{x}} \prod_{C} \psi_C(\mathbf{x}_C).
:::

**Partiční funkce $Z$** (normalizační konstanta) zajistí, že se vše sečte na 1. Je to ta zákeřná část: výpočet $Z$ vyžaduje sumu přes *všechny* konfigurace $\mathbf{x}$, což je exponenciálně drahé. Na rozdíl od BN, kde se sdružené rozdělení normalizuje "zadarmo" ($Z=1$, protože je to součin korektních podmíněných rozdělení), v MRF je $Z$ obecně netriviální a často se aproximuje (belief propagation, viz [[belief-propagation]]).

**Energetický zápis (Gibbsovo/Boltzmannovo rozdělení).** Potenciál se obvykle zapisuje exponenciálně přes energii $E(\mathbf{x}_C)$:

::: math
\psi_C(\mathbf{x}_C) = \exp\!\big(-E(\mathbf{x}_C)\big), \qquad P(\mathbf{x}) = \frac{1}{Z}\exp\!\Big(-\sum_C E(\mathbf{x}_C)\Big).
:::

Místo součinu potenciálů sčítáme energie (numericky stabilnější). Konfigurace s **nízkou energií** mají **vysokou pravděpodobnost**.

## Markovovy vlastnosti

To, že "separace v grafu = podmíněná nezávislost", je formalizováno **Markovovými vlastnostmi**. Pro pozitivní rozdělení ($\psi_C > 0$ všude) jsou ekvivalentní:

- **Párová (pairwise):** dva nesousední uzly jsou nezávislé daných *všech* ostatních uzlů.
- **Lokální (local):** uzel je nezávislý na zbytku grafu daný svými sousedy (jeho *Markov blanket* = množina sousedů).
- **Globální (global):** množiny $A$ a $B$ jsou nezávislé daných $S$, pokud $S$ odděluje $A$ od $B$ v grafu (to je to obecné pravidlo cest výše).

Že tyto tři vlastnosti splývají, garantuje **Hammersley–Cliffordova věta**: pozitivní rozdělení splňuje Markovovy vlastnosti vzhledem ke grafu *právě tehdy*, když se faktorizuje jako součin potenciálů nad klikami.

## Faktorový graf — sjednocující reprezentace

BN a MRF jsou různé třídy modelů (viz srovnání níže), ale **obě se dají zapsat jako faktorový graf** — proto je faktorový graf nejobecnější reprezentace a algoritmy nad ním (belief propagation) fungují pro oba.

**Faktorový graf** (*factor graph*, FG) je **bipartitní** graf se dvěma druhy uzlů:

- **Uzly proměnných** (kroužky ◦): $x_1, x_2, \dots$
- **Uzly faktorů** (čtverečky ■): $f_1, f_2, \dots$ — každý faktor je jedna funkce nad proměnnými, k nimž je připojen.
- **Hrany** vedou *vždy jen* mezi proměnnou a faktorem (nikdy proměnná–proměnná ani faktor–faktor).

Rozdělení je opět normalizovaný součin faktorů, kde $\mathbf{x}_s$ jsou proměnné připojené k faktoru $f_s$:

::: math
P(\mathbf{x}) = \frac{1}{Z}\prod_s f_s(\mathbf{x}_s).
:::

**Jak na faktorový graf převedeme BN a MRF?**

- **BN → FG:** každý podmíněný člen $P(X_i \mid \mathrm{pa}(X_i))$ se stane jedním faktorem připojeným k $X_i$ a jeho rodičům. ($Z=1$.)
- **MRF → FG:** každý klikový potenciál $\psi_C$ se stane jedním faktorem připojeným k uzlům té kliky.

Faktorový graf je *explicitnější* než MRF: stejnou trojúhelníkovou kliku v MRF lze zapsat jako jeden faktor nad třemi proměnnými, nebo jako tři párové faktory — což z grafu samotného nepoznáš, ale z faktorového grafu ano.

::: viz pgm-factor-graph "Přepínej mezi zobrazením stejného modelu jako Bayesovská síť, MRF a faktorový graf. Sleduj, jak orientované šipky zmizí (BN→MRF, moralizace přidá hranu mezi rodiče kolideru) a jak se v FG objeví čtverečkové faktory."
:::

## Orientované vs. neorientované: co umí který

**BN a MRF nejsou ekvivalentní** — některá rozdělení jdou zapsat jen v jednom z nich.

| Vlastnost | BN (orientovaný) | MRF (neorientovaný) |
| --- | --- | --- |
| Kauzální interpretace (příčina→důsledek) | ano | – |
| Explaining away (kolider) | ano | – |
| Symetrické cyklické závislosti | – | ano |
| Přímé čtení nezávislosti (separace cest) | (přes d-separaci) | ano (prostá separace) |
| Normalizace zadarmo ($Z=1$) | ano | – (nutno počítat $Z$) |

**Co neumí MRF, ale BN ano — explaining away.** V síti $A \to C \leftarrow B$ platí $A \perp B$ marginálně, ale $A \not\perp B \mid C$. V MRF: když $A$ a $B$ nespojíš hranou, jsou vždy nezávislé při podmínění na separátor; když je spojíš, ztratíš marginální nezávislost. Ani jedna varianta efekt nezachytí věrně.

**Co neumí BN, ale MRF ano — symetrický cyklus.** Čtyřcyklus s nezávislostmi $x_1 \perp x_4 \mid x_2,x_3$ a $x_2 \perp x_3 \mid x_1,x_4$ nelze věrně zakódovat orientovaným DAG (jakákoli orientace hran zavede nechtěnou v-strukturu nebo ztratí jednu z nezávislostí).

**Moralizace (BN → MRF).** Když potřebuješ z BN udělat MRF: zahodíš orientaci šipek a u každého kolideru **propojíš hranou rodiče** (sdílí faktor $P(C\mid A,B)$, takže musí být v jedné klice — "rodiče se vezmou", odtud *moralizace*). Tím ale ztratíš informaci o explaining away.

::: quiz "Proč v Markovově náhodném poli obecně nelze normalizaci považovat za „zadarmo" jako u Bayesovské sítě?"
- [ ] Protože potenciály ψ_C mohou být záporné
  > Ne, potenciály jsou z definice kladné (ψ_C > 0). Problém je jinde.
- [x] Protože partiční funkce Z = Σ_x Π ψ_C vyžaduje sumu přes všechny konfigurace, což je exponenciálně drahé
  > Správně. BN je součin korektních podmíněných rozdělení, takže se sčítá na 1 automaticky (Z=1). MRF používá nenormalizované potenciály, a tak je nutné Z explicitně dopočítat přes všechny stavy.
- [ ] Protože MRF nemá žádné hrany
  > MRF hrany má, jsou jen neorientované.
- [ ] Protože MRF neumí reprezentovat žádné rozdělení
  > MRF reprezentuje širokou třídu rozdělení; jen normalizace není zadarmo.
:::

::: link "Bishop — PRML, kap. 8.3: Markov Random Fields" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Kschischang, Frey, Loeliger — Factor Graphs and the Sum-Product Algorithm (IEEE Trans. IT, 2001)" "https://ieeexplore.ieee.org/document/910572"
:::

---

*Zdroj: BAYa státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 8.3–8.4](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — MRF a faktorové grafy; Kschischang, F.R., Frey, B.J., Loeliger, H.-A.: „Factor Graphs and the Sum-Product Algorithm" (IEEE Trans. Information Theory 2001, [DOI](https://ieeexplore.ieee.org/document/910572)); Koller, D., Friedman, N.: „Probabilistic Graphical Models" (MIT Press 2009) — Hammersley–Clifford a Markovovy vlastnosti.*
