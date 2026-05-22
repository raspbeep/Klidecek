---
title: Prostorová složitost a Savitchova věta
---

# Prostorová složitost

[[slozitost-ts]] zavedl *prostorovou* složitost analogicky k časové. Hlavní výsledek této kapitoly: **Savitchova věta** — prostor je k nedeterminismu *podstatně robustnější* než čas. Zatímco převod NTS → DTS stojí *exponenciální* čas, převod NSPACE → DSPACE stojí pouze *kvadratický* prostor.

## Klíčové prostorové třídy

::: math
\begin{array}{ll}
\mathrm{L} = \mathrm{DSPACE}(\log n) & \text{deterministický logaritmický prostor} \\
\mathrm{NL} = \mathrm{NSPACE}(\log n) & \text{nedeterministický logaritmický prostor} \\
\mathrm{PSPACE} = \bigcup_k \mathrm{DSPACE}(n^k) & \text{deterministický polynomiální prostor} \\
\mathrm{NPSPACE} = \bigcup_k \mathrm{NSPACE}(n^k) & \text{nedeterministický polynomiální prostor} \\
\mathrm{EXPSPACE} = \bigcup_k \mathrm{DSPACE}(2^{n^k}) & \text{deterministický exponenciální prostor} \\
\end{array}
:::

**Konvence.** Pro prostor menší než lineární (logaritmický) potřebujeme model TS s *odděleným* vstupem (read-only pásku se vstupem + pracovní páskou, kde počítáme prostor). Jinak by nelze říct "logaritmický prostor", když samotný vstup zabírá $n$ buněk.

## $\mathrm{L} \subseteq \mathrm{NL} \subseteq \mathrm{P}$

Jasně $\mathrm{L} \subseteq \mathrm{NL}$ (DTS je speciální NTS).

**Lemma.** $\mathrm{NL} \subseteq \mathrm{P}$.

*Důkaz.* NTS pracující v prostoru $s(n) = O(\log n)$ má jen *polynomiálně mnoho různých konfigurací*: stavů $O(1)$, pozic hlavy $O(n)$ (na vstupu) $\times$ $O(\log n)$ (na pracovní pásce), obsahů pracovní pásky $2^{O(\log n)} = n^{O(1)}$. Celkem $n^{O(1)}$ konfigurací.

DTS může simulovat NTS *grafovým průchodem* — vytvořit *graf konfigurací* a BFS od $C_0$. Pokud z $C_0$ vede cesta do akceptující konfigurace, NTS přijme. BFS běží v $O(|\text{konfigurace}|^2) = n^{O(1)}$ → polynomiální čas. ∎

> **Důsledek.** Pokud chceme $\mathrm{P} = \mathrm{NL}$, museli bychom najít *prostorově efektivnější* simulaci než BFS. Otevřená otázka.

## Savitchova věta

**Věta (Savitch, 1970).** Pro každou *prostorově zkonstruovatelnou* funkci $s(n) \geq \log n$:

::: math
\mathrm{NSPACE}(s(n)) \subseteq \mathrm{DSPACE}(s(n)^2).
:::

**Důsledek.** $\mathrm{PSPACE} = \mathrm{NPSPACE}$.

*Důvod.* Pro libovolný polynom $p$ platí $p^2$ je *opět polynom* — proto $\mathrm{NSPACE}(n^k) \subseteq \mathrm{DSPACE}(n^{2k}) \subseteq \mathrm{PSPACE}$.

## Důkaz Savitchovy věty (procedura `test`)

Nechť $M$ je NTS s prostorovou složitostí $s(n)$. Sestrojíme DTS $M'$ v prostoru $O(s(n)^2)$.

**Pozorování.** Konfigurace $M$ mají velikost $O(s(n))$ (obsah pásky + pozice hlavy + stav). Celkem různých konfigurací $|C| \leq k^{s(n)}$ pro nějakou konstantu $k$ (závisí na $|Q|, |\Gamma|$).

Pokud $M$ přijme vstup $w$, učiní to za nanejvýš $|C| = k^{s(n)} = 2^{O(s(n))}$ kroků (jinak konfigurace cyklí).

**Klíčový algoritmus (rekurzivní procedura):**

```
procedure test(c, c', i):
    // vrátí TRUE, pokud lze v M dojít z konfigurace c do c' v ≤ 2^i krocích
    if i == 0:
        return (c == c') or (c ⊢_M c')
    else:
        for all configurations c'' of size ≤ s(n):
            if test(c, c'', i-1) and test(c'', c', i-1):
                return TRUE
        return FALSE
```

**Hlavní program**: Spočítej $c_0$ (počáteční konfigurace) a pro každou akceptační konfiguraci $c_F$ velikosti $\leq s(n)$:

* Volej `test(c_0, c_F, ⌈s(n) log k⌉)`.
* Pokud vrátí TRUE, **přijmi**.

**Korektnost.** $\lceil s(n) \log k\rceil$ úrovní rekurze pokrývá $2^{s(n) \log k} = k^{s(n)}$ kroků — což je horní mez délky výpočtu $M$. Pokud $M$ může přejít z $c_0$ do $c_F$, najde se mezikrok $c''$ uprostřed (rekurze).

**Prostorová analýza.** Každé volání `test` zabírá $O(s(n))$ prostoru (uložit $c, c', c'', i$). Hloubka rekurze je $O(s(n))$. Z prostorového hlediska *všechna volání žijí na zásobníku najednou*:

$$
\text{Prostor DTS} = O(s(n)) \times O(s(n)) = O(s(n)^2).
$$

> *Pozor*: Algoritmus *není časově efektivní* — provádí $2^{O(s(n)^2)}$ operací. Savitchova věta hovoří **jen o prostoru**, ne o času.

::: svg "Savitchova rekurze: midpoint splitting konfigurací c_0 → c_F"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="1" fill="none">
    <line x1="60" y1="30" x2="240" y2="30"/>
    <line x1="60" y1="30" x2="60" y2="80"/>
    <line x1="240" y1="30" x2="240" y2="80"/>
    <line x1="60" y1="80" x2="150" y2="120"/>
    <line x1="240" y1="80" x2="150" y2="120"/>
    <line x1="60" y1="80" x2="60" y2="120"/>
    <line x1="240" y1="80" x2="240" y2="120"/>
    <line x1="60" y1="120" x2="100" y2="170"/>
    <line x1="60" y1="120" x2="60" y2="170"/>
    <line x1="100" y1="120" x2="100" y2="170"/>
    <line x1="240" y1="120" x2="240" y2="170"/>
    <line x1="240" y1="120" x2="200" y2="170"/>
    <line x1="200" y1="120" x2="200" y2="170"/>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="60" cy="30" r="11"/>
    <circle cx="240" cy="30" r="11"/>
    <circle cx="150" cy="80" r="9"/>
    <circle cx="60" cy="80" r="9"/>
    <circle cx="240" cy="80" r="9"/>
    <circle cx="150" cy="120" r="9"/>
    <circle cx="60" cy="120" r="9"/>
    <circle cx="240" cy="120" r="9"/>
    <circle cx="100" cy="120" r="9"/>
    <circle cx="200" cy="120" r="9"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="10">
    <text x="60" y="33">c₀</text>
    <text x="240" y="33">c_F</text>
    <text x="150" y="83">c'</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="280" y="35">test(c₀, c_F, i)</text>
    <text x="280" y="55" font-size="10">↓ rozdělí na 2 podproblémy</text>
    <text x="280" y="80">test(c₀, c', i-1)</text>
    <text x="280" y="95">test(c', c_F, i-1)</text>
    <text x="280" y="135" font-size="10">↓ rekurze hloubky O(s(n))</text>
    <text x="280" y="155">každé volání: O(s(n)) prostoru</text>
    <text x="280" y="175">celkem: O(s(n)²) prostoru</text>
    <text x="280" y="195" fill="var(--accent)" font-size="11">⇒ NSPACE(s) ⊆ DSPACE(s²)</text>
  </g>
</svg>
:::

## Uzavřenost na doplněk

**Věta (Immerman-Szelepcsényi, 1988).** Pro $s(n) \geq \log n$:

::: math
\mathrm{NSPACE}(s(n)) = \mathrm{co}\text{-}\mathrm{NSPACE}(s(n)).
:::

**Důsledek.** $\mathrm{NL} = \mathrm{co}\text{-}\mathrm{NL}$, $\mathrm{NPSPACE} = \mathrm{co}\text{-}\mathrm{NPSPACE}$.

Toto je *překvapivý* výsledek — analogickou rovnost *neumíme* dokázat pro *čas* ($\mathrm{NP} \stackrel{?}{=} \mathrm{co}\text{-}\mathrm{NP}$, otevřené).

> Klíčový technický trik: **inductive counting** — NTS umí *spočítat počet konfigurací dosažitelných z $c_0$ v dané hloubce* nedeterministicky v *stejném* prostoru. Pak může odpovědět na "není dosažitelná" prokázáním, že počet dosažitelných konfigurací je *přesně rovný* tomu, co máme bez ní.

## Klasické problémy v PSPACE

PSPACE obsahuje řadu *kombinatoricky bohatých* problémů:

| Problém | Stručně |
| :--- | :--- |
| **QBF** (Quantified Boolean Formula) | Splnitelnost formule s $\forall, \exists$ kvantifikátory; **PSPACE-úplný** |
| **Šachy ($n \times n$)** | Vítězná strategie pro daný stav; **PSPACE-úplný** (Go: EXPTIME-úplný) |
| **Hex** | Vítězná strategie z daného stavu; **PSPACE-úplný** |
| **Universalita NKA** | $L(A) = \Sigma^*$ pro daný NKA $A$ — **PSPACE-úplný** |
| **Ekvivalence dvou regulárních výrazů s `^*`** | **PSPACE-úplný** |

## Univerzalita NKA: $L(A) \neq \Sigma^*$ v NPSPACE

Klasický příklad **NPSPACE = PSPACE** v praxi. Daný NKA $A$, ptáme se "$L(A) \neq \Sigma^*$?" — tj. existuje slovo, které $A$ *nepřijme*.

**Algoritmus v NPSPACE = PSPACE:**

```
1. simulovat A na nedeterministicky generovaném vstupu w
2. udržet aktuální množinu stavů S ⊆ Q
3. pokud někdy S ∩ F = ∅ → existuje wᵢ, který A nepřijme → přijmi
```

Implementace v NPSPACE: stav $S \subseteq Q$ má velikost $|Q|$ — $O(|A|)$ prostoru. Délka vstupu může být až $2^{|Q|}$, ale tento délku nemusíme *ukládat* — generujeme symbol po symbolu.

Z $\mathrm{NPSPACE} = \mathrm{PSPACE}$: stejný problém je v PSPACE.

## Prostor vs. čas

**Věta.** $\mathrm{NSPACE}(t(n)) \subseteq \mathrm{DTIME}(2^{O(t(n))})$.

*Důvod.* NTS v prostoru $t(n)$ má $2^{O(t(n))}$ konfigurací. DTS sestrojí *graf konfigurací* a BFS — celkem $2^{O(t(n))}$ kroků.

**Důsledky:**

::: math
\mathrm{L} \subseteq \mathrm{NL} \subseteq \mathrm{P} \subseteq \mathrm{NP} \subseteq \mathrm{PSPACE} \subseteq \mathrm{EXP}.
:::

> **Pozor**: hierarchie *není ostrá* všude. Ostré jsou *exponenciální mezery*:
>
> * $\mathrm{L} \subsetneq \mathrm{PSPACE}$ (z prostorového hierarchického teorému),
> * $\mathrm{P} \subsetneq \mathrm{EXP}$ (z časového hierarchického teorému),
> * $\mathrm{NP} \subsetneq \mathrm{NEXP}$.

## Komprese a zrychlení

Pro úplnost dvě "minimalizační" věty:

**Věta (komprese prostoru).** Pro každý DTS $M$ existuje ekvivalentní $M'$ s $S_{M'}(n) \leq S_M(n)/2 + 2$.

*Idea.* Pásková abeceda $M'$ obsahuje *dvojice* symbolů $M$. Obsah pásky $M$: $a_1 a_2 \dots a_n$ se reprezentuje jako $(a_1, a_2)(a_3, a_4)\dots$ — *polovina* pásky $M$.

**Věta (zrychlení).** Pro každý DTS $M$ existuje ekvivalentní $M'$ s $T_{M'}(n) \leq T_M(n)/2 + 2n$.

*Idea.* $M'$ si předpočítá výsledky všech 2-krokových výpočtů $M$ a *simuluje 2 kroky $M$ v 1 kroku*.

**Důsledek.** Třídy složitosti jsou *uzavřeny vůči konstantním faktorům*: konstanty se "absorbují" do $O(\cdot)$ notace, takže např. $\mathrm{P}$ je tatáž třída ať počítáme s "rychlým" nebo "pomalým" TS.

## Hierarchický teorém — ostré oddělení

**Věta (časový hierarchický teorém).** Pro časově zkonstruovatelnou $f(n)$ platí:

::: math
\mathrm{DTIME}(f(n) \log f(n)) \subsetneq \mathrm{DTIME}(f(n)^2).
:::

Tj. *více* polynomiálního času přidá *víc problémů*. Dává to ostré inkluze jako $\mathrm{P} \subsetneq \mathrm{EXP}$.

**Věta (prostorový hierarchický teorém).** Pro prostorově zkonstruovatelnou $f(n)$:

::: math
\mathrm{DSPACE}(f(n)) \subsetneq \mathrm{DSPACE}(f(n)^2).
:::

Tj. $\mathrm{L} \subsetneq \mathrm{PSPACE}$, $\mathrm{PSPACE} \subsetneq \mathrm{EXPSPACE}$, …

> Důkaz obou vět používá *diagonalizaci* analogickou k důkazu HP.

## Souhrn hierarchie

::: math
\boxed{\mathrm{L} \subseteq \mathrm{NL} \subseteq \mathrm{P} \subseteq \mathrm{NP} \subseteq \mathrm{PSPACE} = \mathrm{NPSPACE} \subseteq \mathrm{EXP} \subseteq \mathrm{NEXP} \subseteq \mathrm{EXPSPACE} = \mathrm{NEXPSPACE} \subseteq 2\text{-}\mathrm{EXP}.}
:::

Ostré inkluze:
* $\mathrm{L} \subsetneq \mathrm{PSPACE}$,
* $\mathrm{NL} \subsetneq \mathrm{PSPACE}$,
* $\mathrm{P} \subsetneq \mathrm{EXP}$,
* $\mathrm{NP} \subsetneq \mathrm{NEXP}$,
* $\mathrm{PSPACE} \subsetneq \mathrm{EXPSPACE}$.

Otevřené:
* $\mathrm{P} \stackrel{?}{=} \mathrm{NP}$ (Clay Millennium),
* $\mathrm{L} \stackrel{?}{=} \mathrm{NL}$,
* $\mathrm{NP} \stackrel{?}{=} \mathrm{co}\text{-}\mathrm{NP}$,
* $\mathrm{P} \stackrel{?}{=} \mathrm{PSPACE}$.

[[cook-levin]] zavádí konkrétní NP-úplný problém a buduje teorii NP-úplnosti.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Savitch, W.J.: *Relationships Between Nondeterministic and Deterministic Tape Complexities* (J. Comput. Sys. Sci., 1970); Immerman, N.: *Nondeterministic Space is Closed Under Complementation* (SIAM J. Comput., 1988); Szelepcsényi, R.: nezávisle, 1987; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §8.1–8.4; Arora, S., Barak, B.: *Computational Complexity* (Cambridge 2009), kap. 4.*
