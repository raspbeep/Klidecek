---
title: Konečné automaty (NKA, DKA, RKA)
---

# Konečné automaty

Konečný automat je *nejjednodušší* netriviální výpočetní model — stroj s konečnou pamětí, bez možnosti zápisu, který čte vstupní řetězec zleva doprava. Přijímá právě **regulární jazyky** ($\mathcal{L}_3$ z [[chomsky-hierarchie]]). Triviální vzhled neznamená triviální využití — KA stojí za regulárními výrazy v editorech, za lexery v překladačích, za protokolovými automaty v sítích.

## Nedeterministický konečný automat (NKA)

Začínáme nedeterministickou variantou — je o něco volnější definice než deterministická a teoreticky elegantnější.

**Definice.** Nedeterministický konečný automat je pětice

$$
M = (Q, \Sigma, \delta, q_0, F),
$$

kde:

1. $Q$ je konečná **množina stavů**,
2. $\Sigma$ je konečná **vstupní abeceda**,
3. $\delta : Q \times \Sigma \to 2^Q$ je **přechodová funkce** — vrací *množinu* možných následujících stavů,
4. $q_0 \in Q$ je **počáteční stav**,
5. $F \subseteq Q$ je **množina koncových (přijímajících) stavů**.

::: svg "Diagram NKA: dvě možné cesty z q₀ po symbolu '0'"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="12">
  <defs>
    <marker id="aFA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="80" cy="90" r="22"/>
    <circle cx="220" cy="60" r="22"/>
    <circle cx="220" cy="120" r="22"/>
    <circle cx="380" cy="90" r="22"/>
    <circle cx="380" cy="90" r="17" fill="none"/>
  </g>
  <g fill="var(--accent)" font-size="12.5" text-anchor="middle">
    <text x="80" y="94">q₀</text>
    <text x="220" y="64">q₁</text>
    <text x="220" y="124">q₂</text>
    <text x="380" y="94">q_F</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aFA1)">
    <path d="M40,90 L60,90"/>
    <path d="M100,82 Q160,55 200,55"/>
    <path d="M100,98 Q160,125 200,125"/>
    <path d="M242,55 Q300,40 360,80"/>
    <path d="M242,125 Q300,140 360,100"/>
    <path d="M80,70 Q60,40 80,40 Q105,40 105,67"/>
    <path d="M220,40 Q220,18 240,40"/>
  </g>
  <g fill="var(--text-muted)" font-size="11">
    <text x="155" y="50">0</text>
    <text x="155" y="140">0</text>
    <text x="295" y="50">0</text>
    <text x="295" y="135">1</text>
    <text x="85" y="35">0</text>
    <text x="245" y="33">1</text>
    <text x="15" y="93" font-size="11">start</text>
  </g>
</svg>
:::

V tomto NKA přechod $\delta(q_0, 0) = \{q_0, q_1\}$ znamená: ze stavu $q_0$ při čtení symbolu $0$ se *nedeterministicky* dostaneme buď zpět do $q_0$, nebo do $q_1$. NKA "hádá", kterou cestu zvolit.

## Deterministický konečný automat (DKA)

**Definice.** NKA $M = (Q, \Sigma, \delta, q_0, F)$ je *deterministický*, jestliže $\forall q \in Q\ \forall a \in \Sigma : |\delta(q, a)| \leq 1$. V tom případě přechodovou funkci zapisujeme zjednodušeně jako $\delta : Q \times \Sigma \to Q$ (parciální).

DKA je **úplně definovaný**, pokud $\delta$ je *totální* — tj. v každém stavu pro každý symbol je *právě jeden* přechod. Z parciálního DKA lze úplně definovaný snadno udělat: přidáme **fail stav** ("sink") $q_\bot$ a všechny chybějící přechody nasměrujeme do něj. $q_\bot$ je nekoncový a má smyčky pro všechny symboly.

> **Lemma.** Ke každému DKA $M$ existuje ekvivalentní úplně definovaný DKA $M'$ s $L(M) = L(M')$.

Důkaz konstrukce sink stavu je triviální. V dalším pracujeme zpravidla s úplně definovanými DKA.

## Reprezentace přechodové funkce

NKA $M = (\{q_0, q_1, q_2, q_F\}, \{0, 1\}, \delta, q_0, \{q_F\})$ z předchozího obrázku má přechodovou funkci

$$
\begin{array}{l}
\delta(q_0, 0) = \{q_0, q_1\},\quad \delta(q_0, 1) = \{q_0, q_2\}, \\
\delta(q_1, 0) = \{q_1, q_F\},\quad \delta(q_1, 1) = \{q_1\}, \\
\delta(q_2, 0) = \{q_2\},\quad \delta(q_2, 1) = \{q_2, q_F\}, \\
\delta(q_F, 0) = \emptyset,\quad \delta(q_F, 1) = \emptyset.
\end{array}
$$

Existují tři ekvivalentní reprezentace:

1. **Vyjmenování přechodů** (viz výše).
2. **Tabulka (matice) přechodů**:

   | $\delta$ | $0$ | $1$ |
   | :-: | :-: | :-: |
   | $\to q_0$ | $\{q_0, q_1\}$ | $\{q_0, q_2\}$ |
   | $q_1$ | $\{q_1, q_F\}$ | $\{q_1\}$ |
   | $q_2$ | $\{q_2\}$ | $\{q_2, q_F\}$ |
   | $* q_F$ | $\emptyset$ | $\emptyset$ |

3. **Stavový diagram** (orientovaný graf s ohodnocenými hranami) — viz obrázek výše. Šipka bez stavu vlevo označuje *počáteční stav*; dvojitý obvod označuje *koncový stav*.

Většinou pro intuici používáme diagram, pro formální argumenty tabulku.

## Konfigurace, krok výpočtu, přijímání

**Konfigurace** $C$ NKA $M$ je dvojice

$$
C = (q, w) \in Q \times \Sigma^*,
$$

kde $q$ je aktuální stav a $w$ je *zbývající dosud nezpracovaná část vstupu*. Konfiguraci na začátku výpočtu nazýváme **počáteční** ($(q_0, w)$) a konfiguraci, ve které je vstup *celý zpracován* a stroj v přijímajícím stavu, nazýváme **koncovou** ($(q_F, \varepsilon)$, $q_F \in F$).

**Krok výpočtu** definujeme binární relací $\vdash_M$ na konfiguracích:

::: math
(q, w) \vdash_M (q', w') \quad \stackrel{\mathrm{def.}}{\iff}\quad w = a w' \land q' \in \delta(q, a).
:::

Tedy "v aktuálním stavu $q$ přečteme symbol $a$, stav přejde do nějakého $q' \in \delta(q, a)$ a $w$ se zkrátí o jeden symbol".

Pro $k$-tou mocninu, tranzitivní a reflexivní tranzitivní uzávěr používáme standardní notaci:

* $\vdash^k_M$ — $k$ kroků (přesně),
* $\vdash^+_M$ — alespoň 1 krok,
* $\vdash^*_M$ — 0 nebo více kroků.

**Přijímané slovo a jazyk.** Řetězec $w \in \Sigma^*$ je *přijímán* NKA $M$, pokud

$$
(q_0, w) \vdash^*_M (q, \varepsilon) \quad \text{pro nějaké } q \in F.
$$

**Jazyk přijímaný automatem $M$**:

::: math
L(M) = \big\{w \in \Sigma^* \mid (q_0, w) \vdash^*_M (q, \varepsilon) \land q \in F\big\}.
:::

> *Nedeterminismus* znamená: stroj **přijímá**, pokud *existuje* posloupnost přechodů vedoucí do koncového stavu. *Nezáleží* na ostatních (zamítajících) cestách.

## Příklad výpočtu

Pro NKA $M_1$ z výše uvedeného diagramu a vstup $w = 1010$ existuje (mimo jiné) výpočet:

$$
(q_0, 1010) \vdash (q_0, 010) \vdash (q_1, 10) \vdash (q_1, 0) \vdash (q_F, \varepsilon).
$$

Tedy $(q_0, 1010) \vdash^* (q_F, \varepsilon)$ a $q_F \in F$ — slovo je přijato. Existují i jiné výpočty z konfigurace $(q_0, 1010)$, které končí v nekoncovém stavu — to pro přijetí nevadí. Naopak $(q_0, \varepsilon)$ nelze přijmout, protože $q_0 \notin F$ a žádný přechod bez čtení symbolu nevede do $q_F$.

Jazyk tohoto automatu:

$$
L(M_1) = \{w \in \{0,1\}^* \mid w \text{ končí symbolem, který je v něm už dříve obsažen}\}.
$$

## Konstrukce KA: interpretace stavů

Při návrhu KA pro daný jazyk je *klíčové* zvolit, **co stav reprezentuje** — jakou informaci o průběhu výpočtu nese.

**Příklad.** Jazyk $L = \{w \in \{a, b\}^* \mid \#_a(w) \bmod 2 \neq \#_b(w) \bmod 2\}$ — slova, kde počty $a$ a $b$ mají *opačnou paritu*.

Stav kóduje dvojici $(p, q)$, kde $p = \#_a(u) \bmod 2$ a $q = \#_b(u) \bmod 2$ pro dosud přečtený řetězec $u$. Stačí 4 stavy reprezentující paritní kombinace $\{(0,0), (0,1), (1,0), (1,1)\}$. Koncové stavy = ty, kde $p \neq q$.

::: svg "DKA pro {w | #a(w) mod 2 ≠ #b(w) mod 2}"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aFA2" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.2">
    <circle cx="130" cy="70" r="26"/>
    <circle cx="410" cy="70" r="26"/>
    <circle cx="130" cy="170" r="26"/>
    <circle cx="410" cy="170" r="26"/>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4">
    <circle cx="410" cy="70" r="26"/>
    <circle cx="410" cy="70" r="22" fill="none"/>
    <circle cx="130" cy="170" r="26"/>
    <circle cx="130" cy="170" r="22" fill="none"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="130" y="74">(0,0)</text>
    <text x="410" y="74">(1,0)</text>
    <text x="130" y="174">(0,1)</text>
    <text x="410" y="174">(1,1)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.1" fill="none" marker-end="url(#aFA2)">
    <path d="M156,70 L384,70"/>
    <path d="M384,75 L156,75" stroke="var(--accent)"/>
    <path d="M130,96 L130,144"/>
    <path d="M135,144 L135,96"/>
    <path d="M156,170 L384,170"/>
    <path d="M384,175 L156,175"/>
    <path d="M410,96 L410,144"/>
    <path d="M415,144 L415,96"/>
    <path d="M65,70 L104,70"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="270" y="63" text-anchor="middle">a</text>
    <text x="270" y="88" text-anchor="middle">a</text>
    <text x="270" y="163" text-anchor="middle">a</text>
    <text x="270" y="188" text-anchor="middle">a</text>
    <text x="120" y="120" text-anchor="end">b</text>
    <text x="148" y="120">b</text>
    <text x="400" y="120" text-anchor="end">b</text>
    <text x="428" y="120">b</text>
    <text x="35" y="74">start</text>
  </g>
</svg>
:::

Po každém $a$ překlopíme paritu $p$ (horizontální šipka), po každém $b$ překlopíme paritu $q$ (vertikální). Začínáme v $(0,0)$, přijímáme v $(1,0)$ a $(0,1)$.

## Rozšířený konečný automat (RKA)

Praktický mezistupeň mezi NKA a DKA — **rozšířený konečný automat** umožňuje *přechody bez čtení vstupního symbolu*, tzv. **$\varepsilon$-přechody**.

**Definice.** RKA je pětice $M = (Q, \Sigma, \delta, q_0, F)$, kde

$$
\delta : Q \times (\Sigma \cup \{\varepsilon\}) \to 2^Q.
$$

Tedy $\delta(q, \varepsilon)$ udává množinu stavů, do nichž lze přejít *bez konzumace symbolu*.

::: svg "RKA: ε-přechod ze stavu q₁ do q₂ bez čtení symbolu"
<svg viewBox="0 0 540 130" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aFA3" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="80" cy="65" r="22"/>
    <circle cx="220" cy="65" r="22"/>
    <circle cx="360" cy="65" r="22"/>
    <circle cx="490" cy="65" r="22"/>
    <circle cx="490" cy="65" r="18" fill="none"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="80" y="69">q₀</text>
    <text x="220" y="69">q₁</text>
    <text x="360" y="69">q₂</text>
    <text x="490" y="69">q_F</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aFA3)">
    <path d="M102,65 L198,65"/>
    <path d="M242,65 L338,65"/>
    <path d="M382,65 L468,65"/>
    <path d="M30,65 L58,65"/>
  </g>
  <g fill="var(--text-muted)" font-size="11">
    <text x="150" y="58" text-anchor="middle">a</text>
    <text x="290" y="58" text-anchor="middle">ε</text>
    <text x="425" y="58" text-anchor="middle">b</text>
  </g>
</svg>
:::

RKA usnadňuje *konstrukci* — můžeme skládat menší podautomaty a propojovat je $\varepsilon$-přechody. Síla je *stejná* jako u NKA: každý RKA lze převést na ekvivalentní NKA a (přes [[determinizace]]) na DKA. Klíčovým konstrukčním kamenem převodu je **$\varepsilon$-uzávěr** stavu $q$:

$$
\mathrm{ECLOSE}(q) = \{q' \in Q \mid q \vdash^*_\varepsilon q'\},
$$

tedy množina všech stavů dosažitelných z $q$ pomocí libovolného počtu $\varepsilon$-přechodů (včetně $q$ samotného). Rozšířeno na množinu $T \subseteq Q$: $\mathrm{ECLOSE}(T) = \bigcup_{q \in T} \mathrm{ECLOSE}(q)$.

## Postavení v hierarchii

Trojice **NKA, DKA, RKA** je *ekvivalentní* — všechny tři přijímají právě regulární jazyky ($\mathcal{L}_3$). Jejich vzájemné převody jsou:

* RKA → NKA: spočítej $\varepsilon$-uzávěry a "absorbuj" $\varepsilon$-přechody do běžných.
* NKA → DKA: **podmnožinová konstrukce** ([[determinizace]]) — exponenciální nárůst stavů v nejhorším případě.
* DKA → NKA: triviální (každý DKA *je* NKA).

[[regularni-vyrazy]] zavádí *třetí* ekvivalentní formalismus — regulární výrazy — a [[minimalizace]] ukáže, jak najít *nejmenší* DKA pro daný regulární jazyk.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=g8md4gN8PK0" "Teoretická informatika - Regulární jazyky I" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=5dxN6kG7wz4" "SZZ: Konečné automaty" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=hOzc4BUIXRk" "Minimization of Deterministic Finite Automata (DFA)" "Neso Academy"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), kap. 2; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), kap. 1; Kozen, D.C.: *Automata and Computability* (Springer 1997), kap. 3.*
