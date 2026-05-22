---
title: Gödelovo číslování a vyjádřitelnost
---

# Gödelovo číslování

Než formulujeme **Gödelovy věty o neúplnosti** ([[godel-neuplnost]]), zavedeme klíčový technický nástroj: **Gödelovo číslování** — kódování *formulí*, *důkazů*, *Turingových strojů* — jako *přirozená čísla*. To umožňuje formulím *mluvit o sobě samých* skrz aritmetiku, což je nezbytné pro diagonalizační konstrukci Gödelovy věty.

## Idea Gödelova číslování

Symboly, formule, posloupnosti formulí — jsou *syntaktické objekty*. Gödel ukázal, jak je *unikátně přiřadit přirozeným číslům*, tedy "vrátit zpět" do aritmetiky.

**Cíl**: získat **vyjádřitelné** predikáty $D(m, n)$:

::: math
D(m, n) \iff m \text{ je Gödelovo číslo důkazu formule s Gödelovým číslem } n.
:::

Pokud máme $D$ vyjádřitelný *v PA*, můžeme uvnitř PA mluvit o "dokazatelnosti" — což je *centrální* mechanismus Gödelových vět.

## Gödelovo číslování — konkrétní volba

Pro jazyk Peanovy aritmetiky (PA) zvolíme symboly a *přiřadíme jim čísla*:

| Symbol | $'$ | $0$ | $($ | $)$ | $f$ | $,$ | $v$ | $\neg$ | $\to$ | $\forall$ | $=$ | $\leq$ | $\#$ |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| $G(\cdot)$ | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |

Speciální:
* **Číslovky** $0, 0', 0'', 0''', \dots$ kódují přirozená čísla $0, 1, 2, 3, \dots$
* **Jména proměnných** $v, v', v'', v''', \dots$ pro $v_0, v_1, v_2, \dots$
* **$+, \cdot$** se konstruují přes $f$ s indexy.
* **$\#$** je *oddělovač* formulí v důkazech.

**Slovo** $w = a_0 a_1 \dots a_n$ (kde každý $a_i$ je výše uvedený symbol) má Gödelovo číslo:

::: math
G(w) = (a_0 \cdot 13^n) + (a_1 \cdot 13^{n-1}) + \dots + (a_n \cdot 13^0).
:::

Tj. **slovo se interpretuje jako číslo ve třinácti-soustavě**, kde každý symbol je jedna cifra.

> **Důležité**: $G$ je *injektivní* — různé řetězce dají *různá* Gödelova čísla (díky volbě cifer 0–12). Z čísla lze *jednoznačně rekonstruovat* původní řetězec.

## Konkrétní příklad

Vezměme formuli $0 = 0$:

* Symboly: $0$, $=$, $0$.
* Gödelova čísla symbolů: 1, 10, 1.
* Slovo: $\langle 1, 10, 1\rangle$.

$$
G(0 = 0) = 1 \cdot 13^2 + 10 \cdot 13^1 + 1 \cdot 13^0 = 169 + 130 + 1 = 300.
$$

Tedy formule "$0 = 0$" má Gödelovo číslo 300.

## Co Gödelovo číslování umožňuje

Z čísla $n$ můžeme *aritmeticky* zjišťovat *vlastnosti syntaxe*:

* **Je $n$ Gödelovým číslem proměnné?** Stačí ověřit, že $n = 6 \cdot 13^k$ pro nějaké $k$ (= řetězec $v''\dots'$).
* **Je $n$ Gödelovým číslem formule?** Vyžaduje rekurzivní rozklad.
* **Je $n$ Gödelovým číslem důkazu?** Vyžaduje ověření, že každá podformule splňuje pravidla.

Klíčové: všechny tyto otázky jsou **aritmeticky vyjádřitelné** — predikáty nad přirozenými čísly, které lze popsat formulemi PA. Tj. **syntax je aritmetizovatelná**.

## Konkatenace v Gödelových číslech

Pro slova $u$ a $v$ s Gödelovými čísly $G(u)$ a $G(v)$:

::: math
G(u \cdot v) = G(u) \cdot 13^{|v|} + G(v).
:::

Zapisujeme $G(u) \circ G(v) = G(u \cdot v)$ — *operace konkatenace v Gödelově prostoru*.

Důsledek: pokud máme vyjádření *délky* slova $|v|$ jako funkce $G(v)$, máme i konkatenaci aritmeticky.

## Vyjádřitelnost predikátů

**Definice.** Množina $A \subseteq \mathbb{N}$ je **vyjádřitelná v PA**, pokud existuje formule $\varphi_A(x)$ s jednou volnou proměnnou taková, že:

::: math
n \in A \iff \mathbb{N} \models \varphi_A(\bar{n}),
:::

kde $\bar{n}$ je *číslovka* $n$ (v PA tvar $0''\dots'$ s $n$ čárkami).

**Příklady vyjádřitelných množin:**

* Sudá čísla: $\varphi(x) \equiv \exists y\, (x = y + y)$.
* Prvočísla: $\varphi(x) \equiv x > 1 \land \forall y \forall z\, (x = y \cdot z \to y = 1 \lor z = 1)$.
* Mocniny 2: $\varphi(x) \equiv \exists y\, (x = 2^y)$ — *technicky* netriviální, $2^y$ musíme rozepsat přes opakované násobení.

## Klíčové uzávěrové vlastnosti

Pro důkaz Gödelových vět potřebujeme dvě vlastnosti vyjádřitelných množin:

**G1.** Pro vyjádřitelnou $A \subseteq \mathbb{N}$ je *také* $A^* = \{n \mid G(E_n(n)) \in A\}$ **vyjádřitelná**.

Zde $E_n$ označuje formuli s Gödelovým číslem $n$ (s volnou proměnnou). $E_n(n)$ je substituce číslovky $\bar{n}$ za tuto proměnnou.

**G2.** Pro vyjádřitelnou $A$ je *doplněk* $\tilde{A} = \mathbb{N} \setminus A$ vyjádřitelná.

**G2 je triviální** — stačí použít negaci predikátu: $\varphi_{\tilde{A}}(x) \equiv \neg\varphi_A(x)$.

**G1 je netriviální**, ale lze dokázat aritmetizací konkatenace a substituce.

**G3 (klíčové pro Gödela).** Množina $P = \{G(e) \mid e \text{ je dokazatelná v PA}\}$ je **vyjádřitelná**.

> **G3 je velmi komplikovaná** — vyžaduje *aritmetizovat celý dokazovací proces*. Gödel věnoval většinu své práce právě této konstrukci.

## Vyjádření substituce $G(E_n(n))$

Substituce číslovky $\bar{n}$ za proměnnou $v$ ve formuli $E_e$ se *aritmetizuje* takto:

* Kód číslovky $\bar{n}$ (= $0''\dots'$ s $n$ čárkami): $G(\bar{n}) = 13^n$.
   *Důvod*: $G(0) = 1, G(') = 0$, a $n$ čárek dá $1 \cdot 13^n + 0 \cdot 13^{n-1} + \dots = 13^n$.

* Pokud $E_e$ má volnou proměnnou $v$, můžeme $E_e(n)$ vyjádřit jako $\forall v\, (v = \bar{n} \to E_e)$.

* Gödelovo číslo této formule:

::: math
G(E_e(n)) = k \circ 13^n \circ 8 \circ e \circ 3,
:::

kde:
* $k$ = Gödelovo číslo "$\forall v\, (v = $",
* $13^n$ = Gödelovo číslo $\bar{n}$,
* 8 = Gödelovo číslo "$\to$",
* $e$ = Gödelovo číslo $E_e$,
* 3 = Gödelovo číslo "$)$".

Toto vyjádření je **konstruktivní** — z $e$ a $n$ aritmeticky spočítáme $G(E_e(n))$.

## Aritmetizace dokazatelnosti

Klíčový krok — vyjádřit predikát $D(m, n)$ "$m$ je Gödelovým číslem důkazu formule $G^{-1}(n)$":

* Důkaz je *posloupnost* formulí oddělených $\#$.
* Každá formule v důkazu je *buď* axiom, *nebo* odvozena MP z předchozích.
* Pro každou formuli ověříme: je *axiom*? Je *MP z formulí $\varphi_j, \varphi_k$* pro nějaké $j, k < i$?

Tyto otázky jsou *rozhodnutelné aritmeticky* — predikáty "je axiom", "je MP" lze vyjádřit jako konjunkce a disjunkce nad Gödelovým číslováním komponent.

Po formalizaci máme:

::: math
P(n) \equiv \exists m\, D(m, n),
:::

kde $P(n)$ vyjadřuje "$n$ je Gödelovo číslo *dokazatelné* formule".

## Důsledek: PA je *dostatečně expresivní*

Z výše uvedené konstrukce:

* **G1 platí** v PA (díky aritmetizaci substituce a konkatenace).
* **G2 platí** (triviálně, negací).
* **G3 platí** (díky aritmetizaci dokazatelnosti).

**Důsledek**: PA *splňuje* všechny tři podmínky G1, G2, G3, proto je *dostatečně expresivní pro sebereferenci*. To je technický základ Gödelovy 1. věty ([[godel-neuplnost]]).

## Diagonalizační lemma (fixed-point lemma)

**Věta (Carnap 1934).** Pro každou formuli $\varphi(x)$ s jednou volnou proměnnou existuje *věta* $\psi$ taková, že:

::: math
\mathrm{PA} \vdash \psi \leftrightarrow \varphi(\bar{G(\psi)}).
:::

Tj. existuje věta $\psi$, která *říká o sobě* "platí pro mě vlastnost $\varphi$".

**Aplikace**: pro $\varphi(x) = \neg P(x)$ ("$x$ není Gödelovým číslem dokazatelné formule") existuje věta $\psi$ s

::: math
\psi \leftrightarrow \neg P(\bar{G(\psi)}).
:::

Tj. $\psi$ tvrdí *"Nejsem dokazatelná"*. To je **Gödelova věta** $G$ z [[godel-neuplnost]].

## Žádná konkrétní hodnota Gödelových čísel

V praxi nikdy nepočítáme konkrétní Gödelovo číslo věty $\psi$ — je to obrovské číslo (formule v PA mají stovky symbolů, Gödelovo číslo je 13 na tu hloubku). Důležitá je **existence** vyjádřitelné aritmetické formule, ne konkrétní hodnota.

> Gödelovo číslování je *čistě technický nástroj* pro důkaz neúplnosti. *Pojem se aritmetizuje*, ne *konkrétní hodnota se počítá*.

## Souvislost s [[univerzalni-ts]]

Připomenutí: Univerzální Turingův stroj ([[univerzalni-ts]]) také používá *kódování TS jako řetězec*. Tato dvě kódování (Gödelovo formulí, kódování TS) jsou **strukturálně analogická** — obě umožňují *sebereferenci*:

* **TS**: $M$ může dostat kód *jiného* TS $M'$ na vstup.
* **PA**: formule může mluvit o *jiné* formuli skrz její Gödelovo číslo.

To je *společná pružina* obou výsledků — Gödelovy věty *a* nerozhodnutelnosti HP. Detailněji v [[godel-neuplnost]].

## Co Gödelovo číslování umožnilo

Před Gödelovou prací (1931) bylo dělení mezi *syntax* a *sémantikou* striktně oddělené. Gödelovo číslování *propojilo* obě úrovně — *syntax se stala objektem aritmetické sémantiky*. To otevřelo cestu k:

* Důkazu **neúplnosti** PA ([[godel-neuplnost]]).
* Nerozhodnutelnosti aritmetiky ([[pa-nerozhodnutelnost]]).
* Pojmu *vyčíslitelnosti* — Gödel zavedl pojem *primitivně rekurzivních funkcí* k aritmetizaci.
* Hilbertova programu *redukcionismu* matematiky na konečnou syntax — *zlomil* ho.

[[godel-neuplnost]] formuluje hlavní výsledek: pomocí G1–G3 zkonstruujeme větu "Nejsem dokazatelná", jejíž *existence* dokáže neúplnost PA.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Gödel, K.: *Über formal unentscheidbare Sätze der Principia Mathematica und verwandter Systeme* (Monatshefte Math. Phys., 1931); Smullyan, R.: *Gödel's Incompleteness Theorems* (Oxford 1991); Mendelson, E.: *Introduction to Mathematical Logic* (6th ed., CRC 2015), kap. 3.5–3.7; Boolos, G., Burgess, J.P., Jeffrey, R.C.: *Computability and Logic* (5th ed., Cambridge 2007), kap. 16.*
