---
title: Bayesovské sítě a podmíněná nezávislost
---

# Bayesovské sítě a podmíněná nezávislost

Představ si, že chceš popsat společné rozdělení mnoha náhodných proměnných — třeba "prší", "tráva je mokrá", "kropič běžel". Naivně bys musel vyplnit obrovskou tabulku: pro $N$ binárních proměnných má sdružené rozdělení $2^N - 1$ nezávislých čísel. To je nepoužitelné už pro pár desítek proměnných.

**Bayesovská síť (Bayesian network, BN)** je trik, jak tuhle tabulku rozbít na malé kousky pomocí grafu. Místo jedné gigantické tabulky uložíš ke každé proměnné jen malou tabulku, která říká *"jak tahle proměnná závisí na svých přímých příčinách"*. Graf nám zároveň vizuálně ukáže, **které proměnné spolu (ne)souvisí**.

## Struktura: orientovaný acyklický graf

Bayesovská síť je **orientovaný acyklický graf** (DAG, *directed acyclic graph*):

- **Uzly** jsou náhodné proměnné $X_i$ (mohou být diskrétní i spojité). V obrázcích bývá prázdný kroužek = skrytá/latentní proměnná, vyplněný = pozorovaná.
- **Hrany** jsou orientované šipky $X_i \to X_j$ a čteme je jako *"$X_i$ je přímou příčinou (rodičem) $X_j$"*.
- **Acyklický** znamená, že po šipkách se nikdy nevrátíš do výchozího uzlu — žádná příčina není svým vlastním důsledkem. To je nutné, aby graf definoval korektní rozdělení.

Množinu všech rodičů uzlu $X_i$ (uzly, ze kterých vede šipka přímo do $X_i$) značíme $\mathrm{pa}(X_i)$.

## Faktorizace sdruženého rozdělení

Klíčová myšlenka: sdružené rozdělení se rozpadne na **součin malých podmíněných rozdělení**, jedno pro každý uzel za podmínky jeho rodičů.

::: math
P(X_1, \dots, X_N) = \prod_{i=1}^{N} P\!\big(X_i \mid \mathrm{pa}(X_i)\big)
:::

Pro uzel bez rodičů je $P(X_i \mid \mathrm{pa}(X_i)) = P(X_i)$ prostě marginál (apriorní rozdělení).

**Konkrétní příklad — řetězec $A \to B \to C$.** Uzel $A$ nemá rodiče, $B$ má rodiče $A$, $C$ má rodiče $B$. Tedy:

::: math
P(A, B, C) = P(A)\, P(B \mid A)\, P(C \mid B)
:::

Spočítejme úsporu: kdyby všechny tři proměnné byly binární a my je modelovali plnou tabulkou, potřebovali bychom $2^3 - 1 = 7$ čísel. Faktorizace nad řetězcem potřebuje $1 + 2 + 2 = 5$ čísel ($P(A)$ je 1 číslo, každá podmíněná tabulka 2 čísla). U dlouhých řetězců je rozdíl exponenciální vs. lineární.

## Podmíněná nezávislost

Graf nám zdarma prozradí, **které proměnné jsou na sobě nezávislé** — a to je k inferenci to nejcennější.

Dvě proměnné jsou **nezávislé** ($A \perp B$), když znalost jedné vůbec nemění pravděpodobnost druhé:

::: math
A \perp B \iff P(A, B) = P(A)\,P(B).
:::

**Podmíněná nezávislost** ($A \perp B \mid C$) je slabší pojem: $A$ a $B$ spolu obecně souvisí, ale jakmile *pozorujeme* hodnotu $C$, vazba mezi nimi zmizí:

::: math
A \perp B \mid C \iff P(A, B \mid C) = P(A \mid C)\,P(B \mid C).
:::

Intuitivně: podmíněná nezávislost říká, že "celý vztah mezi $A$ a $B$ se dá vysvětlit znalostí $C$". Po zafixování $C$ už $A$ o $B$ nic nového neřekne.

## Tři kanonické trojice (a d-separace)

Jak poznat z grafu, jestli $A \perp B \mid C$? Stačí znát **tři základní zapojení** tří uzlů. Každá cesta mezi $A$ a $B$ je buď **aktivní** (informace teče → uzly závisí), nebo **blokovaná** (informace neteče → uzly jsou nezávislé). Pravidlo, které to vyhodnotí pro celý graf, se jmenuje **d-separace** ("directed separation").

**1) Tail-to-tail — společná příčina: $A \leftarrow C \to B$.**
Šipky z $C$ vedou na obě strany ("ocas-ocas" u $C$). Faktorizace: $P(A,B,C) = P(C)\,P(A\mid C)\,P(B\mid C)$.

- $C$ *nepozorováno*: $A$ a $B$ obecně závisí — sdílí společnou příčinu.
- $C$ *pozorováno*: dosazením do definice vyjde $P(A,B\mid C) = P(A\mid C)\,P(B\mid C)$, tedy $A \perp B \mid C$. **Pozorování $C$ cestu blokuje.**

**2) Head-to-tail — řetězec: $A \to C \to B$.**
Šipka do $C$ vchází a zase vychází. Faktorizace: $P(A,B,C) = P(A)\,P(C\mid A)\,P(B\mid C)$.

- $C$ *nepozorováno*: informace protéká přes $C$, $A$ a $B$ závisí.
- $C$ *pozorováno*: opět $A \perp B \mid C$. **Pozorování prostředního uzlu cestu blokuje.**

**3) Head-to-head — kolider (v-struktura): $A \to C \leftarrow B$.**
Obě šipky míří *do* $C$ ("hlava-hlava"). Faktorizace: $P(A,B,C) = P(A)\,P(B)\,P(C\mid A,B)$. Tady je to **přesně naopak**:

- $C$ *nepozorováno*: vysčítáním $C$ (protože $\sum_C P(C\mid A,B)=1$) vyjde $P(A,B)=P(A)\,P(B)$, tedy $A \perp B$. **Bez pozorování kolideru je cesta blokovaná.**
- $C$ *pozorováno* (nebo pozorován jeho potomek): cesta se **otevře**, $A \not\perp B \mid C$.

Pozor na tu asymetrii: u prvních dvou trojic pozorování prostředního uzlu cestu *blokuje*, u koliderů ji pozorování naopak *otevírá*.

::: viz bayes-net-dsep "Klikni uzel, abys ho přidal/odebral z pozorování (žlutě). Sleduj, jak se cesty mezi A a B mění z aktivních (oranžové, informace teče) na blokované (šedé) — a tím i podmíněná (ne)závislost A ⊥ B."
:::

## Explaining away (vysvětlení pryč)

Kolider má slavný důsledek zvaný **explaining away** ("jedna příčina vysvětlí důkaz, takže druhá je méně pravděpodobná").

Klasický příklad: $A$ = zloděj, $B$ = zemětřesení, $C$ = alarm zvoní, se sítí $A \to C \leftarrow B$. Zloděj i zemětřesení mohou spustit alarm, ale spolu navzájem nesouvisí — předem platí $P(A,B) = P(A)\,P(B)$, tedy $A \perp B$.

Teď *pozorujeme, že alarm zvoní* ($C=1$). Najednou:

::: math
P(A \mid B, C{=}1) \neq P(A \mid C{=}1).
:::

Když se dozvíš, že bylo zemětřesení ($B$), alarm je už "vysvětlený" a pravděpodobnost zloděje **klesne** — i když zloděj se zemětřesením fyzikálně nesouvisí. Tahle indukovaná závislost mezi dvěma jinak nezávislými příčinami je to, co orientované sítě umí a co se v neorientovaných modelech reprezentuje obtížně (viz [[mrf-faktorovy-graf]]).

::: quiz "V síti A → C ← B (kolider) jsou A a B předem nezávislé. Co se stane s jejich vztahem, když pozorujeme C?"
- [ ] Zůstanou nezávislé — pozorování koliderů nikdy nic nezmění
  > Pozor, kolider se chová opačně než řetězec/společná příčina. Pozorování koliderů vztah naopak vytváří, ne ruší.
- [x] Stanou se podmíněně závislými (cesta se otevře) — to je explaining away
  > Správně. Člen P(C | A, B) propojí A a B, jakmile C zafixujeme. Pozorování kolideru (nebo jeho potomka) cestu aktivuje.
- [ ] Stanou se podmíněně nezávislými — pozorování každého uzlu cestu blokuje
  > To platí pro tail-to-tail a head-to-tail, ale u koliderů je tomu naopak.
- [ ] Stane se z nich jeden uzel
  > Pozorování nemění strukturu grafu, jen aktivuje/blokuje cesty.
:::

::: link "Bishop — PRML, kap. 8: Graphical Models" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Koller & Friedman — Probabilistic Graphical Models" "https://mitpress.mit.edu/9780262013192/probabilistic-graphical-models/"
:::

---

*Zdroj: BAYa státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 8](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — Bayesovské sítě a d-separace; Koller, D., Friedman, N.: „Probabilistic Graphical Models: Principles and Techniques" (MIT Press 2009, [odkaz](https://mitpress.mit.edu/9780262013192/probabilistic-graphical-models/)); Pearl, J.: „Probabilistic Reasoning in Intelligent Systems" (Morgan Kaufmann 1988) — d-separace a explaining away.*
