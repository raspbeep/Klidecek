---
title: Třídy P a NP — polynomiální čas
---

# Třídy P a NP

Mezi všemi třídami složitosti ([[slozitost-ts]]) jsou **$P$** a **$NP$** *centrálními* — vymezují *prakticky řešitelné* problémy a *problémy s rychle ověřitelným řešením*. Otázka **$P \stackrel{?}{=} NP$** je jeden ze sedmi *Millennium Prize Problems* a *otevřená* od formulace v 1971 ([[cook-levin]]).

## Třída P

**Definice.** $\mathrm{P}$ je třída jazyků přijímaných *deterministickým* TS v *polynomiálním čase*:

::: math
\mathrm{P} = \bigcup_{k \geq 0} \mathrm{DTIME}(n^k).
:::

Tj. existuje polynom $p(n) = a_d n^d + \dots + a_0$ a DTS $M$ takový, že $L(M) = L$ a $T_M(n) \leq p(n)$.

> **Intuice.** $\mathrm{P}$ = "*prakticky řešitelné*" problémy. Polynomiální čas zaručuje, že zdvojnásobení velikosti vstupu zhoršuje běh jen *konstantní násobně*, ne exponenciálně. Pro $n = 10^6$ je $n^3$ stále trakovatelné, $2^n$ není.

**Příklady problémů v $\mathrm{P}$:**

| Problém | Algoritmus | Složitost |
| :--- | :--- | :-: |
| Řazení pole čísel | Quicksort, Mergesort | $O(n \log n)$ |
| Násobení dvou matic | Strassen | $O(n^{2.81})$ |
| Test prvočíselnosti | AKS (2002) | $O(\log^{12} n)$ |
| Nejkratší cesta v grafu | Dijkstra, BFS | $O(V + E)$ |
| 2-SAT | Implication graph | $O(V + E)$ |
| Maximum matching v bipartitním grafu | Hopcroft-Karp | $O(\sqrt{V} \cdot E)$ |
| Lineární programování | Karmarkar | $O(n^{3.5} \cdot L)$ |

## Třída NP

**Definice.** $\mathrm{NP}$ je třída jazyků přijímaných *nedeterministickým* TS v polynomiálním čase:

::: math
\mathrm{NP} = \bigcup_{k \geq 0} \mathrm{NTIME}(n^k).
:::

### Ekvivalentní definice: certifikát

$L \in \mathrm{NP}$ právě když existuje:

* **DTS $V$** (verifikátor) a polynom $p$ takové, že pro každé $w$:

::: math
w \in L \iff \exists\,c \in \Sigma^*, |c| \leq p(|w|),\ V \text{ přijme dvojici } (w, c).
:::

Tj. existuje *krátký certifikát* $c$ (= *svědek*), na základě kterého lze v polynomiálním čase ověřit, že $w \in L$.

> **Intuice.** $\mathrm{NP}$ = problémy, kde *řešení lze rychle ověřit*, i když není jasné, jak ho rychle *najít*. NTS si "uhádne" certifikát a deterministicky ověří.

::: svg "P vs NP: P = polynomiálně řešitelné, NP = polynomiálně ověřitelné"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="none" stroke-width="1.4" stroke="var(--accent)">
    <ellipse cx="180" cy="105" rx="120" ry="80"/>
    <ellipse cx="360" cy="105" rx="160" ry="100"/>
  </g>
  <g fill="var(--accent)" font-size="13" text-anchor="middle">
    <text x="180" y="50">P</text>
    <text x="430" y="50">NP</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="115" y="100">Řadit</text>
    <text x="115" y="115">Dijkstra</text>
    <text x="115" y="130">AKS prvočísla</text>
    <text x="115" y="145">Matrix mult.</text>
    <text x="115" y="160">2-SAT</text>
    <text x="380" y="80">3-SAT (NP-úplný)</text>
    <text x="380" y="100">TSP (NP-úplný)</text>
    <text x="380" y="120">CLIQUE (NP-úplný)</text>
    <text x="380" y="140">VertexCover</text>
    <text x="380" y="160">Subset Sum</text>
  </g>
  <text x="270" y="200" text-anchor="middle" fill="var(--text-muted)" font-size="10">P ⊆ NP. Zda P = NP je otevřená otázka.</text>
</svg>
:::

## Vztah $P \subseteq NP$

Triviálně: $\mathrm{P} \subseteq \mathrm{NP}$. Pokud lze problém řešit deterministicky v polynomiálním čase, jistě lze i nedeterministicky.

**Hluboká otázka**: $\mathrm{P} \stackrel{?}{=} \mathrm{NP}$. Zda existují problémy v $\mathrm{NP}$, které **nelze** řešit v polynomiálním čase deterministicky. Většina expertů věří $\mathrm{P} \neq \mathrm{NP}$ — ale *nemá pro to důkaz*.

## NP-úplnost a polynomiální redukce

**Definice.** *Polynomiální redukce* (many-one) jazyka $L_1$ na $L_2$ je funkce

$$
f : \Sigma_1^* \to \Sigma_2^*
$$

splňující:

1. $\forall w \in \Sigma_1^*: w \in L_1 \iff f(w) \in L_2$,
2. $f$ je vyčíslitelná DTS v polynomiálním čase.

Píšeme $L_1 \leq^m_P L_2$.

**Věta.** Je-li $L_1 \leq^m_P L_2$ a $L_2 \in \mathrm{P}$, pak $L_1 \in \mathrm{P}$.

*Důkaz.* Komposice TS $M_f$ (počítající redukci $f$) a $M_2$ (přijímající $L_2$). Pro vstup $w$:
1. Spustíme $M_f$ — $O(p(|w|))$ kroků, výstup $|f(w)| \leq p(|w|) + |w|$.
2. Spustíme $M_2$ na $f(w)$ — $O(q(|f(w)|)) \subseteq O(q(p(|w|) + |w|))$ kroků.

Celkem $O(p(|w|) + q(p(|w|) + |w|))$ — polynom v $|w|$. ∎

**Definice (NP-úplnost).** Jazyk $L$ je **NP-úplný**, jestliže:

1. $L \in \mathrm{NP}$, a
2. *Každý* $L' \in \mathrm{NP}$ se polynomiálně redukuje na $L$ ($L' \leq^m_P L$).

NP-úplné problémy jsou *nejtěžší* v $\mathrm{NP}$. Pokud bychom našli polynomiální algoritmus pro jeden NP-úplný problém, dostali bychom polynomiální algoritmy *pro celou třídu $\mathrm{NP}$* — což by dokázalo $\mathrm{P} = \mathrm{NP}$.

> [[cook-levin]] dokazuje existenci NP-úplných problémů — *SAT problém* je NP-úplný (Cookova-Levinova věta, 1971).

## Schéma redukcí

Tisíce problémů jsou dokázány *NP-úplné* postupnou redukcí. Klasické řetězce redukcí:

::: svg "Schéma důkazů NP-úplnosti: každý problém je dokázán redukcí z dříve dokázaného NP-úplného problému"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aNPC" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="20" width="100" height="32" rx="6"/>
    <rect x="200" y="20" width="100" height="32" rx="6"/>
    <rect x="360" y="20" width="100" height="32" rx="6"/>
    <rect x="40" y="80" width="100" height="32" rx="6"/>
    <rect x="200" y="80" width="100" height="32" rx="6"/>
    <rect x="360" y="80" width="100" height="32" rx="6"/>
    <rect x="40" y="140" width="100" height="32" rx="6"/>
    <rect x="200" y="140" width="100" height="32" rx="6"/>
    <rect x="360" y="140" width="100" height="32" rx="6"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="11">
    <text x="90" y="40">SAT</text>
    <text x="250" y="40">3-SAT</text>
    <text x="410" y="40">CLIQUE</text>
    <text x="90" y="100">VERTEX COVER</text>
    <text x="250" y="100">HAM. CYCLE</text>
    <text x="410" y="100">TSP</text>
    <text x="90" y="160">SUBSET SUM</text>
    <text x="250" y="160">PARTITION</text>
    <text x="410" y="160">SCHEDULING</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aNPC)">
    <line x1="140" y1="36" x2="200" y2="36"/>
    <line x1="300" y1="36" x2="360" y2="36"/>
    <line x1="410" y1="52" x2="140" y2="100"/>
    <line x1="140" y1="96" x2="200" y2="96"/>
    <line x1="300" y1="96" x2="360" y2="96"/>
    <line x1="250" y1="112" x2="90" y2="156"/>
    <line x1="140" y1="156" x2="200" y2="156"/>
    <line x1="300" y1="156" x2="360" y2="156"/>
  </g>
  <text x="270" y="200" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">Cook 1971: SAT NP-úplný. Karp 1972: 21 dalších klasických NP-úplných problémů.</text>
  <text x="270" y="220" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">Garey & Johnson 1979: stovky NP-úplných problémů s redukcemi.</text>
</svg>
:::

## Uzávěr P na doplněk

**Věta.** Třída $\mathrm{P}$ je *uzavřena na doplněk*: $L \in \mathrm{P} \Rightarrow \overline{L} \in \mathrm{P}$.

**Důkaz.** Z DTS $M$ pro $L$ v čase $p(n)$ sestrojíme $M'$ pro $\overline{L}$:
1. $M'$ na začátku vypočítá $p(|w|)$ a uloží to na pomocnou pásku jako "počitadlo".
2. Pak simuluje $M$ na $w$ a každým krokem odečte z počitadla.
3. Pokud $M$ přijme v rámci $p(|w|)$ kroků, $M'$ zamítne.
4. Pokud počitadlo dojde na 0 (a $M$ nepřijal), $M'$ přijme.
5. $M'$ je úplně definovaný a deterministický, $\overline{L} = L(M')$. ∎

Tato uzavřenost je netriviální — pro $\mathrm{NP}$ není známá:

::: math
\mathrm{NP} \stackrel{?}{=} \mathrm{co}\text{-}\mathrm{NP}.
:::

Většina expertů věří $\mathrm{NP} \neq \mathrm{co}\text{-}\mathrm{NP}$. Pokud by $\mathrm{P} = \mathrm{NP}$, plynulo by také $\mathrm{NP} = \mathrm{co}\text{-}\mathrm{NP}$ (protože $\mathrm{P}$ je uzavřená na doplněk).

## Pohled na vztah determinismu/nedeterminismu

**Věta (časová cena odstranění nedeterminismu).** $\mathrm{NTIME}(t(n)) \subseteq \mathrm{DTIME}(2^{O(t(n))})$.

*Důkaz.* BFS po výpočetních cestách NTS (viz [[ts-modifikace]]). Pro NTS s větvením $k$ a délkou výpočtu $t(n)$ existuje až $k^{t(n)}$ různých cest. DTS prochází *do šířky* — pro každou délku 1, 2, …, simuluje všechny cesty. Celkem $\sum_{i=0}^{t(n)} k^i \cdot O(t(n)) = O(k^{t(n)} \cdot t(n)) = 2^{O(t(n))}$.

**Pro polynomiální čas** to dává:

::: math
\mathrm{NP} \subseteq \mathrm{DTIME}(2^{O(n^k)}) = \mathrm{EXP}.
:::

Tedy NP je *podtřída* EXP. *Není známo*, zda striktně.

## Hierarchie tříd

Souhrn vztahů ([[savitch-prostor]] doplní hierarchii prostoru):

::: math
\mathrm{L} \subseteq \mathrm{NL} \subseteq \mathrm{P} \subseteq \mathrm{NP} \subseteq \mathrm{PSPACE} = \mathrm{NPSPACE} \subseteq \mathrm{EXP} \subseteq \mathrm{NEXP} \subseteq \mathrm{EXPSPACE} \subseteq \dots
:::

**Ostrá inkluze**:
* $\mathrm{P} \subsetneq \mathrm{EXP}$ (důkaz: časový hierarchický teorém).
* $\mathrm{NP} \subsetneq \mathrm{NEXP}$.
* $\mathrm{PSPACE} \subsetneq \mathrm{EXPSPACE}$.

**Otevřená**:
* $\mathrm{P} \stackrel{?}{=} \mathrm{NP}$
* $\mathrm{NP} \stackrel{?}{=} \mathrm{co}\text{-}\mathrm{NP}$
* $\mathrm{L} \stackrel{?}{=} \mathrm{NL}$ (Immerman-Szelepcsényi 1988: $\mathrm{NL} = \mathrm{co}\text{-}\mathrm{NL}$)
* $\mathrm{P} \stackrel{?}{=} \mathrm{PSPACE}$

> Z toho, *kolik* je *otevřených* otázek, vyplývá, že současný stav teorie složitosti je vzdálen úplnému řešení. Naopak ostré inkluze ($\mathrm{P} \subsetneq \mathrm{EXP}$) plynou z **hierarchického teorému**: jakákoli "rozumná" třída lze ostře oddělit od podstatně větší.

[[savitch-prostor]] zmrazí prostorové třídy a dokáže Savitchovu větu $\mathrm{NSPACE}(s) \subseteq \mathrm{DSPACE}(s^2)$ — *prostor* je k nedeterminismu *robustnější* než *čas*.

[[cook-levin]] dokáže konkrétní NP-úplný problém — SAT — a tím založí celou teorii NP-úplnosti.

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Cook, S.A.: *The Complexity of Theorem-Proving Procedures* (Proc. STOC, 1971); Karp, R.M.: *Reducibility Among Combinatorial Problems* (Plenum, 1972); Garey, M.R., Johnson, D.S.: *Computers and Intractability — A Guide to the Theory of NP-Completeness* (Freeman, 1979); Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §7.2–7.4; Arora, S., Barak, B.: *Computational Complexity* (Cambridge 2009), kap. 2.*
