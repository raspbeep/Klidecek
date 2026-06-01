---
title: Normální formy bezkontextových gramatik
---

# Normální formy CFG

Bezkontextové gramatiky z [[cfg-derivace]] mohou mít *libovolná* pravidla typu $A \to \alpha$. Pro některé úlohy — důkaz pumping lemmatu, parsovací algoritmy, konverze na PDA — potřebujeme **omezený tvar**, kde každé pravidlo má vždy stejnou strukturu. Této formě říkáme **normální forma**.

Dvě nejdůležitější:

* **Chomského normální forma (CNF)** — pravidla typu $A \to BC$ nebo $A \to a$.
* **Greibachova normální forma (GNF)** — pravidla typu $A \to a\alpha$, kde $\alpha \in N^*$.

Obě přijímají *tutéž třídu jazyků* jako obecné bezkontextové gramatiky, ale dají se z nich snadno odvodit silné věty.

## Příprava: úklid gramatiky

Před převodem do CNF/GNF se gramatika *předzpracuje* — odstraní se "balast", který nepřispívá k jazyku. Toto úklidové schéma využívá tzv. **fixpointové algoritmy** — iterativní výpočty, které opakují přidávání prvků do množiny, dokud se množina nestabilizuje.

### Generující neterminály

**Definice.** Neterminál $A$ je *generující*, pokud $A \stackrel{+}{\Rightarrow} w$ pro nějaké $w \in \Sigma^*$.

**Algoritmus** (výpočet $N_t = \{A \in N \mid A \stackrel{+}{\Rightarrow} w, w \in \Sigma^*\}$):

```
N0 := ∅; i := 1
repeat
   N_i := { A | A → α ∈ P, α ∈ (N_(i-1) ∪ Σ)* }
   i := i + 1
until N_i = N_(i-1)
N_t := N_i
```

Pravidla obsahující neterminál mimo $N_t$ se *odstraní* — takový neterminál nikdy nevygeneruje žádné slovo.

### Dostupné symboly

**Definice.** Symbol $X$ (terminál nebo neterminál) je *dostupný*, pokud $S \stackrel{*}{\Rightarrow} \alpha X \beta$ pro nějaké $\alpha, \beta$.

**Algoritmus**:

```
V0 := {S}; i := 1
repeat
   V_i := V_(i-1) ∪ { X | A → αXβ ∈ P, A ∈ V_(i-1) }
   i := i + 1
until V_i = V_(i-1)
V := V_i
```

Symboly mimo $V$ — a všechna pravidla, která je obsahují — se odstraní.

### Odstranění $\varepsilon$-pravidel

Pravidla typu $A \to \varepsilon$ lze odstranit (s výjimkou $S \to \varepsilon$, pokud $\varepsilon \in L(G)$). Nejprve najdeme **anulovatelné** neterminály $N_\varepsilon = \{A \in N \mid A \stackrel{*}{\Rightarrow} \varepsilon\}$, pak pro každé pravidlo $A \to X_1 X_2 \dots X_k$ přidáme všechny varianty s vynechanými anulovatelnými $X_i$.

### Odstranění jednoduchých pravidel

Pravidla typu $A \to B$ (kde $A, B$ jsou neterminály) lze odstranit — pro každý takový "řetězec" $A \stackrel{*}{\Rightarrow} B$ a každé "nejednoduché" pravidlo $B \to \beta$ přidáme $A \to \beta$.

## Chomského normální forma (CNF)

**Definice.** Bezkontextová gramatika $G = (N, \Sigma, P, S)$ je v **CNF**, pokud každé pravidlo z $P$ má jeden z tvarů:

1. $A \to BC$, kde $A, B, C \in N$,
2. $A \to a$, kde $a \in \Sigma$,
3. (pokud $\varepsilon \in L(G)$) $S \to \varepsilon$ je *jediné* $\varepsilon$-pravidlo a $S$ se nevyskytuje na pravé straně žádného jiného pravidla.

::: svg "Tvary pravidel v Chomského normální formě"
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="12">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="40" width="140" height="60" rx="6"/>
    <rect x="200" y="40" width="140" height="60" rx="6"/>
    <rect x="370" y="40" width="140" height="60" rx="6"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-family="ui-monospace, monospace">
    <text x="100" y="65">A → BC</text>
    <text x="100" y="85" font-size="11" fill="var(--text-muted)">dva neterminály</text>
    <text x="270" y="65">A → a</text>
    <text x="270" y="85" font-size="11" fill="var(--text-muted)">jeden terminál</text>
    <text x="440" y="65">S → ε</text>
    <text x="440" y="85" font-size="11" fill="var(--text-muted)">jen pokud ε ∈ L</text>
  </g>
  <text x="270" y="130" text-anchor="middle" fill="var(--text-muted)" font-size="11">Každý derivační strom v CNF je binární (větev nemá víc než 2 dětí).</text>
</svg>
:::

### Délka derivace v CNF

**Pozorování.** Pro $w \in L(G)$ s $G$ v CNF má levá derivace $S \stackrel{p}{\Rightarrow} w$ délku právě $p = 2|w| - 1$, tedy $|w| = (p + 1)/2$.

*Důvod:* každé pravidlo typu $A \to BC$ zvyšuje *počet symbolů* v větné formě o 1; každé pravidlo $A \to a$ "konvertuje" jeden neterminál na terminál. Pro slovo délky $n$ potřebujeme $n - 1$ pravidel typu $A \to BC$ a $n$ pravidel typu $A \to a$, dohromady $2n - 1$.

### Převod na CNF

**Věta.** Pro každou bezkontextovou gramatiku $G$ existuje ekvivalentní $G'$ v CNF s $L(G') = L(G)$.

**Algoritmus** (po úklidu gramatiky):

1. Pravidla tvaru $A \to BC$ a $A \to a$ **ponecháme**.
2. Pravidla tvaru $A \to X_1 X_2 \dots X_n$ s $n > 2$ rozložíme zavedením *nových neterminálů*. Z $A \to X_1 X_2 \dots X_n$ uděláme:

   $$
   A \to X_1' \langle X_2 X_3 \dots X_n\rangle,\ \langle X_2 X_3 \dots X_n\rangle \to X_2' \langle X_3 \dots X_n\rangle,\ \dots
   $$

   přičemž $X_i'$ je $X_i$ samotné (pokud je neterminál) nebo nový neterminál (pokud je terminál; přidáme pravidlo $X_i' \to X_i$).
3. Pravidla $A \to X_1 X_2$ s alespoň jedním terminálem transformujeme do $A \to X_1' X_2'$ stejným způsobem.

**Příklad.** $G = (\{A, B\}, \{a, b, c\}, P, A)$ s pravidly:

$$
A \to BAB \mid Ba \mid bc, \quad B \to AB \mid a \mid BBB.
$$

Po převodu na CNF:

$$
\begin{aligned}
A &\to B\langle AB\rangle \mid Ba' \mid b'c', \\
B &\to AB \mid a \mid B\langle BB\rangle, \\
\langle AB\rangle &\to AB, \\
\langle BB\rangle &\to BB, \\
a' &\to a, \quad b' \to b, \quad c' \to c.
\end{aligned}
$$

> Velikost gramatiky narůstá zhruba *lineárně* s celkovou délkou pravých stran. Pro CYK algoritmus ([[cyk-parsing]]) je tento mírný nárůst akceptovatelný — výsledná CNF má řád stovek pravidel pro realistické gramatiky.

## Greibachova normální forma (GNF)

**Definice.** Bezkontextová gramatika $G$ je v **GNF**, pokud každé pravidlo má tvar

$$
A \to a\alpha, \quad a \in \Sigma,\ \alpha \in N^*.
$$

(Případně $S \to \varepsilon$ pokud $\varepsilon \in L(G)$.)

Tj. *každé pravidlo začíná terminálem*, za kterým následuje řetězec *neterminálů*.

**Použití GNF:**

* Důkaz, že každý bezkontextový jazyk je přijímán PDA *bez $\varepsilon$-přechodů* (každý krok PDA konzumuje terminál) — přímý důsledek tvaru pravidel.
* Důkaz $\mathcal{L}_2 \subseteq \mathcal{L}_{\mathrm{NPDA}}$ s minimální zbytkovou komplikací ([[ekvivalence-pda-cfg]]).
* Některé parsovací techniky pro deterministické bezkontextové jazyky (LL(1) parsování).

**Věta.** Pro každou bezkontextovou gramatiku existuje ekvivalentní gramatika v GNF.

Konverze je *podstatně složitější* než pro CNF a v TIN se neprobírá detailně. Klíčový krok zahrnuje eliminaci *levé rekurze* (pravidel typu $A \to A\alpha$) přes Greibachovo lemma.

## Levá rekurze a její eliminace

**Definice.** Pravidlo $A \to A\alpha$ je *přímo levě rekurzivní*. Gramatika má *levou rekurzi*, pokud $A \stackrel{+}{\Rightarrow} A\alpha$ pro nějaký neterminál $A$.

**Greibachovo lemma.** Pravidla typu $A \to A\alpha_1 \mid A\alpha_2 \mid \dots \mid A\alpha_m \mid \beta_1 \mid \beta_2 \mid \dots \mid \beta_n$ (kde $\beta_i$ nezačínají $A$) lze nahradit:

$$
A \to \beta_1 \mid \beta_2 \mid \dots \mid \beta_n \mid \beta_1 A' \mid \beta_2 A' \mid \dots \mid \beta_n A',\quad A' \to \alpha_1 \mid \dots \mid \alpha_m \mid \alpha_1 A' \mid \dots \mid \alpha_m A'.
$$

*Idea.* Levou rekurzi nahradíme *pravou*: místo "začni s $A$ a postupně přidávej $\alpha_i$ doleva" děláme "začni s $\beta_j$ a postupně přidávej $\alpha_i$ doprava".

Eliminace levé rekurze je *nezbytná* pro LL(k) parsování (rekurzivní sestupný parser by zacyklil) — to je hlavní praktický důvod její důležitosti.

## Souhrn konverzí

::: svg "Konverzní řetězec: obecná CFG → úklid → CNF nebo GNF"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aNF" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="80" width="100" height="40" rx="6"/>
    <rect x="170" y="80" width="120" height="40" rx="6"/>
    <rect x="340" y="30" width="160" height="40" rx="6"/>
    <rect x="340" y="130" width="160" height="40" rx="6"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="70" y="105">obecná CFG</text>
    <text x="230" y="105">vyčištěná CFG</text>
    <text x="420" y="55">CNF — A → BC, A → a</text>
    <text x="420" y="155">GNF — A → aα</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.3" fill="none" marker-end="url(#aNF)">
    <line x1="120" y1="100" x2="166" y2="100"/>
    <line x1="290" y1="95" x2="336" y2="55"/>
    <line x1="290" y1="105" x2="336" y2="150"/>
  </g>
  <g fill="var(--text-muted)" font-size="10.5" text-anchor="middle">
    <text x="143" y="93">úklid</text>
    <text x="313" y="65">CNF conv.</text>
    <text x="313" y="140">GNF conv.</text>
    <text x="270" y="190">CNF se použije v [[cyk-parsing]] a důkazu pumping lemmatu pro CFG ([[vlastnosti-bkj]]).</text>
  </g>
</svg>
:::

Po převodu do CNF můžeme vyslovit *pumping lemma pro bezkontextové jazyky*, dokázat jeho platnost přes derivační strom (binární strom, na němž *opakovaný neterminál* odpovídá pumpovatelnému segmentu) a spustit CYK algoritmus. To probereme v [[vlastnosti-bkj]] a [[cyk-parsing]].

---

### Videa

::: youtube "https://www.youtube.com/watch?v=Vp_oBaNiIFg" "Teoretická informatika: Bezkontextové jazyky" "Tomáš Kocourek"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Chomsky, N.: *On the Notion "Rule of Grammar"* (Proc. Symp. Applied Math., 1961); Greibach, S.A.: *A New Normal Form Theorem for Context-Free Phrase Structure Grammars* (J. ACM, 1965); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §7.1.*
