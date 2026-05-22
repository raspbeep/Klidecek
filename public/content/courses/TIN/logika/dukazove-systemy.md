---
title: Hilbertův kalkul a formální důkazy
---

# Hilbertův dokazovací systém

[[vyrokova-logika]] zavedl *sémantiku* — definici, kdy je formule pravdivá (splnitelná). Tato kapitola zavádí *syntax dokazování* — **Hilbertův kalkul** s axiomatickými schématy a *modus ponens*. Centrální otázka: souvisí *dokazatelnost* (syntax) s *platností* (sémantika)? Pro VL ano (věta o úplnosti — [[vlastnosti-pl]]).

## Hilbertův kalkul pro VL

**Schémata výrokových axiomů** (libovolné formule $A, B, C$):

::: math
\begin{aligned}
\text{(A1)}\quad & A \to (B \to A) \\
\text{(A2)}\quad & (A \to (B \to C)) \to ((A \to B) \to (A \to C)) \\
\text{(A3)}\quad & (\neg B \to \neg A) \to ((\neg B \to A) \to B)
\end{aligned}
:::

**Odvozovací pravidlo (modus ponens, MP):**

::: math
\frac{A \quad A \to B}{B}.
:::

> Z předpokladů $A$ a $A \to B$ odvodíme závěr $B$.

**Intuitivní výklad:**
* **(A1)**: Pokud $A$ určitě platí a dovíme se *libovolnou* dodatečnou informaci $B$, pak $A$ stále platí.
* **(A2)**: Tranzitivita implikace v jistém smyslu — z $A \to (B \to C)$ plyne, že implikace se "propaguje".
* **(A3)**: Důkaz sporem — pokud z $\neg B$ plyne *zároveň* $\neg A$ a $A$, pak $\neg B$ nemůže platit, tedy $B$.
* **(MP)**: Klasická "z prší a (prší → mokro) odvodím mokro".

## Definice důkazu

**Definice.** *Důkaz* formule $\varphi$ z množiny předpokladů $P$ je posloupnost formulí $\varphi_1, \varphi_2, \dots, \varphi_n$ taková, že:

* $\varphi_n = \varphi$ (poslední je co dokazujeme),
* pro každé $i$: $\varphi_i$ je *buď*:
  * axiom (instance některého schématu A1, A2, A3),
  * prvek $P$,
  * odvozeno z $\varphi_j, \varphi_k$ ($j, k < i$) pomocí MP.

Píšeme $P \vdash \varphi$ (čteno "$P$ dokazuje $\varphi$"). Pokud $P = \emptyset$, píšeme jen $\vdash \varphi$ — *teorém* (dokazatelný bez předpokladů).

## Příklad důkazu: $\vdash A \to A$

Cíl: formálně odvodit, že "$A$ implikuje $A$" je *teorém* Hilbertova kalkulu.

| Krok | Formule | Odůvodnění |
| :-: | :--- | :--- |
| 1 | $A \to ((A \to A) \to A)$ | (A1) s $A := A$, $B := A \to A$ |
| 2 | $(A \to ((A \to A) \to A)) \to ((A \to (A \to A)) \to (A \to A))$ | (A2) s $A := A$, $B := A \to A$, $C := A$ |
| 3 | $(A \to (A \to A)) \to (A \to A)$ | (1), (2), MP |
| 4 | $A \to (A \to A)$ | (A1) s $A := A$, $B := A$ |
| 5 | $A \to A$ | (3), (4), MP |

Tedy $\vdash A \to A$. Důkaz je *čistě syntaktický* — žádná pravdivostní tabulka, žádné sémantické úvahy.

> Tento příklad ukazuje, jak *technický* je Hilbertův kalkul — i banální fakt "$A \to A$" vyžaduje 5 kroků. Pro praktické dokazování se používají *odvozená pravidla* (např. *dedukce*) nebo systémy *Natural Deduction* / *Sequent Calculus*, které jsou pohodlnější.

## Věta o dedukci

**Věta.** $P \cup \{A\} \vdash B \iff P \vdash A \to B$.

Tato věta nepatří k axiomům, ale je *odvozená* — dokazuje se indukcí podle délky důkazu.

**Důsledek**: můžeme zavést pomocí dedukce nová odvozovací pravidla, např.
* *Hypotetický sylogismus*: $A \to B, B \to C \vdash A \to C$.
* *Kontrapozice*: $A \to B \vdash \neg B \to \neg A$.

Tyto odvozené pravidla *neuvádějí novou sílu*, jen *zkracují* důkazy.

## Hilbertův kalkul pro predikátovou logiku (PL)

Pro PL je systém **rozšířen** o:

**Schéma axiomu kvantifikátoru:** pokud $x$ není *volné* ve $\varphi$:

::: math
(\forall x (\varphi \to \psi)) \to (\varphi \to (\forall x \psi)).
:::

**Schéma axiomu substituce:** pokud $t$ je *term substituovatelný* za $x$ do $\varphi$ (= $t$ neobsahuje žádnou proměnnou, která by se po substituci stala zavázanou):

::: math
(\forall x \varphi) \to \varphi[x/t].
:::

**Axiomy rovnosti** (pro $f/n \in F$, $p/n \in P$, proměnné $x_i, y_i$):

::: math
\begin{aligned}
& x = x, \\
& x_1 = y_1 \to (x_2 = y_2 \to (\dots \to (x_n = y_n \to f(x_1, \dots, x_n) = f(y_1, \dots, y_n)) \dots)), \\
& x_1 = y_1 \to (x_2 = y_2 \to (\dots \to (x_n = y_n \to (p(x_1, \dots, x_n) \to p(y_1, \dots, y_n))) \dots)).
\end{aligned}
:::

**Pravidlo zobecnění (generalizace, $\forall I$):** Z předpokladu $\varphi$ odvodíme $\forall x\, \varphi$.

## Příklady PL axiomů

* **Axiom kvantifikátoru**: $(\forall x (\varphi \to \psi)) \to (\varphi \to (\forall x \psi))$, kde $x \notin FV(\varphi)$.

  *Příklad*: $(\forall \text{Brňák}\ (\text{je hezky} \to \text{Brňák je na přehradě})) \to (\text{je hezky} \to (\forall \text{Brňák}\ \text{Brňák je na přehradě}))$.

  Tj. pokud platí, že každý Brňák *při hezkém počasí* je na přehradě, a *pokud* je hezky, pak každý Brňák je na přehradě.

* **Axiom substituce**: $(\forall x\, \varphi) \to \varphi[x/t]$.

  *Příklad*: $(\forall \check{c}\ \text{zaslouží\_soucit}(\check{c})) \to \text{zaslouží\_soucit}(\text{matka}(\text{manželka}(x)))$.

  Tj. pokud *každá osoba* zaslouží soucit, pak konkrétně i matka manželky $x$.

* **Axiom rovnosti**: $x_1 = y_1 \to (\dots \to (p(x_1, \dots, x_n) \to p(y_1, \dots, y_n)) \dots)$.

  *Příklad*: $\text{pivo} = \text{chleba} \to (\text{snídaně}(\text{chleba}, \text{máslo}) \to \text{snídaně}(\text{pivo}, \text{máslo}))$.

  Tj. ekvivalentní termy lze v predikátech *zaměňovat*.

## Příklad důkazu v PL: $p(x, y) \vdash p(y, x)$

Cíl: z předpokladu "$p(x, y)$" (s volnými $x, y$) odvodit "$p(y, x)$".

| Krok | Formule | Odůvodnění |
| :-: | :--- | :--- |
| 1 | $p(x, y)$ | předpoklad |
| 2 | $\forall y\ p(x, y)$ | pravidlo zobecnění z (1) |
| 3 | $\forall x \forall y\ p(x, y)$ | pravidlo zobecnění z (2) |
| 4 | $(\forall x \forall y\ p(x, y)) \to (\forall y\ p(z, y))$ | axiom substituce, $x := z$ |
| 5 | $\forall y\ p(z, y)$ | (3), (4), MP |
| 6 | $(\forall y\ p(z, y)) \to p(z, x)$ | axiom substituce, $y := x$ |
| 7 | $p(z, x)$ | (5), (6), MP |
| 8 | $\forall z\ p(z, x)$ | pravidlo zobecnění z (7) |
| 9 | $(\forall z\ p(z, x)) \to p(y, x)$ | axiom substituce, $z := y$ |
| 10 | $p(y, x)$ | (8), (9), MP |

> Tento důkaz formálně ukazuje, že predikát $p$ je *symetrický* — pokud platí pro pár $(x, y)$, platí i pro $(y, x)$. Ale: *toto neplatí obecně*! Důkaz funguje *jen* pokud bereme $p(x, y)$ jako *univerzální* tvrzení (s volnými proměnnými), což je *silnější* než konkrétní instance.

## Efektivnost dokazovacího systému

**Definice.** Logický systém je **efektivní**, pokud lze *algoritmicky ověřit*, zda daný řetězec symbolů je platný důkaz.

**Věta.** Výroková i predikátová logika jsou efektivní.

**Důvod:**
1. *Co je dobře formulovaná formule* — rozhodnutelné (gramatika).
2. *Co je axiom* — rozhodnutelné (přesné schéma).
3. *Co je MP* — rozhodnutelné (porovnání tří formulí).

Tedy: pro libovolnou posloupnost formulí umíme v *polynomiálním* čase rozhodnout, zda je to platný důkaz.

> **Důsledek**: jazyk *dokázaných formulí* je **rekurzivně vyčíslitelný** — můžeme systematicky generovat všechny důkazy a vypisovat jejich závěry. Žádaný teorém *dříve nebo později* generujeme.

## Dokazatelnost vs. platnost

Vyvstávají dva *navzájem nezávislé* pojmy:

| **Dokazatelnost** $\vdash \varphi$ | **Platnost** $\models \varphi$ |
| :--- | :--- |
| Existuje formální důkaz z axiomů | Splňuje *každá* interpretace |
| Čistě syntaktický pojem | Sémantický pojem |
| Manipulujeme se symboly | Hodnotíme významy |
| Ve VL: ověřitelný | Ve VL: ověřitelný pravdivostní tabulkou |
| V PL: ověřitelný (semi-decision) | V PL: ne *vždy* ověřitelný |

**Klíčové otázky:**

* **Korektnost** (*soundness*): Je všechno, co se dokáže, *platné*? Tj. $\vdash \varphi \Rightarrow \models \varphi$?
* **Úplnost** (*completeness*): Je všechno *platné* taky *dokazatelné*? Tj. $\models \varphi \Rightarrow \vdash \varphi$?

Tyto otázky budou centrem [[vlastnosti-pl]].

## Hilbertův kalkul je *minimalistický*

Hilbertův styl má jen *3 axiomy* a *1 odvozovací pravidlo* — *minimální* dokazovací systém. To má *teoretickou* hodnotu (jednoduché meta-důkazy o systému samotném), ale je *prakticky* nepoužitelné pro vážnější dokazování. V praxi se používají:

* **Natural deduction** (Gentzen 1935) — pravidla typu "introdukce $\land$", "eliminace $\to$", *bližší přirozeným úvahám*.
* **Sequent calculus** (Gentzen 1935) — sekvence $\Gamma \vdash \Delta$, vhodné pro automatické dokazování.
* **Resolution** (Robinson 1965) — *jediné* pravidlo (rezoluce), *vhodné* pro mechanizované dokazování (Prolog, theorem provers).
* **Tableau methods** — *grafické* dokazování přes stromy.

[[prvoradova-logika]] rozšiřuje VL na *predikátovou logiku prvního řádu* — formální systém pro popis *struktur* s objekty, funkcemi a relacemi.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Hilbert, D., Ackermann, W.: *Grundzüge der theoretischen Logik* (Springer, 1928); Mendelson, E.: *Introduction to Mathematical Logic* (6th ed., CRC 2015), kap. 1.4; Gentzen, G.: *Untersuchungen über das logische Schließen* (1935); Robinson, J.A.: *A Machine-Oriented Logic Based on the Resolution Principle* (J. ACM, 1965).*
