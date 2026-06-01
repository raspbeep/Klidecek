---
title: Redukce mezi problémy
---

# Redukce — nástroj pro dokazování (ne)rozhodnutelnosti

Nerozhodnutelnost problému zastavení ([[problem-zastaveni]]) byla dokázána *diagonalizací*. Tato technika je *univerzální*, ale *náročná* — pro každý nový problém bychom museli sestavit speciální diagonální argument. **Redukce** poskytuje *systematickou* metodu: pokud již víme, že problém $A$ je nerozhodnutelný, a *převedeme* ho na problém $B$, pak je $B$ také nerozhodnutelný.

## Definice redukce

**Definice.** Pro jazyky $A \subseteq \Sigma^*$ a $B \subseteq \Psi^*$ je **redukce** $A$ na $B$ totální *rekurzivně vyčíslitelná* funkce

$$
\sigma : \Sigma^* \to \Psi^*,
$$

splňující:

::: math
\forall w \in \Sigma^*: \quad w \in A \iff \sigma(w) \in B.
:::

Funkce $\sigma$ je *vyčíslitelná totálním TS* — pro každý vstup $w$ stroj zastaví a vypíše $\sigma(w)$.

Pokud existuje redukce $A$ na $B$, píšeme $A \leq B$ (čteno *"$A$ je redukovatelný na $B$"*).

::: svg "Redukce: vstup z A se převede na ekvivalentní vstup pro B"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="none" stroke-width="1.4" stroke="var(--accent)">
    <ellipse cx="130" cy="100" rx="100" ry="65"/>
    <ellipse cx="410" cy="100" rx="100" ry="65"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle">
    <text x="130" y="40">Σ*</text>
    <text x="410" y="40">Ψ*</text>
  </g>
  <g fill="var(--accent)" stroke-width="1.2" stroke="var(--accent)" fill-opacity="0.15">
    <ellipse cx="130" cy="110" rx="55" ry="35"/>
    <ellipse cx="410" cy="110" rx="55" ry="35"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-weight="bold">
    <text x="130" y="115">A</text>
    <text x="410" y="115">B</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10.5">
    <text x="80" y="160">w ∈ A</text>
    <text x="200" y="160">w' ∉ A</text>
    <text x="360" y="160">σ(w) ∈ B</text>
    <text x="480" y="160">σ(w') ∉ B</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <path d="M165,100 C240,80 280,80 375,95" stroke-dasharray="4 3" marker-end="url(#aRed)"/>
    <path d="M165,135 C240,165 280,165 375,140" stroke-dasharray="4 3" marker-end="url(#aRed)"/>
  </g>
  <defs>
    <marker id="aRed" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="85" text-anchor="middle" fill="var(--accent)" font-size="11">σ: Σ* → Ψ*</text>
  <text x="270" y="190" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">σ zachovává členství: σ(A) ⊆ B, σ(Σ* \ A) ⊆ Ψ* \ B</text>
</svg>
:::

> Tato definice se nazývá **many-one** nebo **mapping reduction**. Existují silnější varianty (Turingova redukce, polynomiální redukce v [[cook-levin]]), ale pro rozhodnutelnost nám stačí many-one.

## Zákony zachování

**Věta.** Pokud $A \leq B$, pak:

1. Je-li $A$ **nerekurzivně vyčíslitelný** (¬RE), pak i $B$ je ¬RE.
2. Je-li $A$ **nerozhodnutelný** (¬R), pak i $B$ je ¬R.
3. **(Pozitivní směr)** Je-li $B \in \text{RE}$, pak i $A \in \text{RE}$.
4. **(Pozitivní směr)** Je-li $B \in \text{R}$, pak i $A \in \text{R}$.

> **Pozn.** Body (3, 4) jsou *kontrapozice* (1, 2). Často je *praktičtější* pamatovat si pozitivní směr ("$B$ je 'horní mez'") a používat kontrapozici pro nerozhodnutelnost.

## Důkaz tvrzení 3 (a kontrapozičně 1)

**Tvrzení 3.** Je-li $B \in \text{RE}$, pak $A \in \text{RE}$.

**Důkaz.** Nechť $M_R$ je totální TS počítající redukci $\sigma$ z $A$ na $B$, a $M_B$ je TS přijímající $B$. Sestrojíme TS $M_A$ přijímající $A$:

1. $M_A$ na vstupu $w$ **spustí $M_R$**, čímž transformuje obsah pásky na $\sigma(w)$.
2. Pak **spustí $M_B$** na vstupu $\sigma(w)$.
3. Pokud $M_B$ přijme, $M_A$ taky přijme. Jinak $M_A$ buď cyklí, nebo zamítne.

Korektnost:

$$
M_A \text{ přijme } w \iff M_B \text{ přijme } \sigma(w) \iff \sigma(w) \in B \iff w \in A. \quad \square
$$

Pro pozitivní směr (4 — pokud $B \in \text{R}$, pak $A \in \text{R}$) je důkaz analogický, jen místo "přijetí" / "cyklení" pracujeme s "přijetí" / "abnormální zamítnutí" — totální TS $M_B$ vždy odpoví, takže $M_A$ je také totální.

::: viz reduction-wiring "Vyber cílový problém (L_M, L=∅, L=Σ*) a uvidíš, jak je z ⟨M, w⟩ zkonstruovaný stroj M'. Přepínač 'M zastaví / cyklí' ukazuje, jak se mění L(M') a tedy příslušnost ⟨M'⟩ k cíli."
:::

## Aplikace: nerozhodnutelnost problému členství

**Tvrzení (problém členství).** Jazyk

$$
L_\mathrm{M} = \{\langle M\rangle \# \langle w\rangle \mid w \in L(M)\}
$$

není rekurzivní.

**Důkaz** redukcí $L_\mathrm{HP} \leq L_\mathrm{M}$.

Dán vstup $\langle M\rangle \# \langle w\rangle$ pro HP. Sestrojíme nový TS $M'$ pro problém členství:

```
M':  vstup y → simulovat M na w
     pokud M zastaví na w  →  přijmout y (libovolné)
     pokud M cyklí na w    →  cyklit
```

Pak:
* $M$ zastaví na $w \iff M'$ přijme každé $y \iff L(M') = \Psi^* \neq \emptyset$.
* $M$ nezastaví na $w \iff M'$ nepřijme žádné $y \iff L(M') = \emptyset$.

Definujme $\sigma(\langle M\rangle \# \langle w\rangle) = \langle M'\rangle \# \langle\varepsilon\rangle$ (členství prázdného řetězce).

Pak $\langle M\rangle \# \langle w\rangle \in L_\mathrm{HP} \iff M'$ přijme $\varepsilon \iff \sigma(\langle M\rangle \# \langle w\rangle) \in L_\mathrm{M}$.

Tedy $L_\mathrm{HP} \leq L_\mathrm{M}$. Protože $L_\mathrm{HP} \notin \text{R}$, je i $L_\mathrm{M} \notin \text{R}$. ∎

## Aplikace: $L(M) = \emptyset$ není ani RE

**Tvrzení.** Jazyk $\{\langle M\rangle \mid L(M) = \emptyset\}$ není ani rekurzivně vyčíslitelný.

**Důkaz** redukcí $\mathrm{co}\text{-}\mathrm{HP} \leq \{\langle M\rangle \mid L(M) = \emptyset\}$.

Dán vstup $\langle M\rangle \# \langle w\rangle$. Sestrojíme $M'$:

```
M':  vstup y → ignorovat y
            → simulovat M na w
            → pokud M zastaví, přejít do koncového stavu (přijmout y)
            → pokud M cyklí, cyklit
```

Pak:
* $M$ *nezastaví* na $w \iff M'$ cyklí (přijme nic) $\iff L(M') = \emptyset$.
* $M$ *zastaví* na $w \iff M'$ přijme každé $y \iff L(M') = \Psi^* \neq \emptyset$.

$\sigma(\langle M\rangle \# \langle w\rangle) = \langle M'\rangle$.

Pak $\langle M\rangle \# \langle w\rangle \in \mathrm{co}\text{-}\mathrm{HP} \iff L(M') = \emptyset \iff \langle M'\rangle \in \{\langle M\rangle \mid L(M) = \emptyset\}$.

Tedy $\mathrm{co}\text{-}\mathrm{HP} \leq \{\langle M\rangle \mid L(M) = \emptyset\}$. Protože $\mathrm{co}\text{-}\mathrm{HP} \notin \text{RE}$ ([[problem-zastaveni]]), není $\{\langle M\rangle \mid L(M) = \emptyset\}$ ani v RE. ∎

> **Klíčový postřeh.** Pro nerozhodnutelnost stačí redukce z HP nebo některé jeho varianty. Pro **¬RE** (silnější tvrzení) potřebujeme redukci z co-HP nebo jiné ¬RE-úplné množiny.

## Aplikace: $L(M_1) = L(M_2)$ je nerozhodnutelný

**Tvrzení.** Ekvivalence dvou TS — $\{(\langle M_1\rangle, \langle M_2\rangle) \mid L(M_1) = L(M_2)\}$ — není rozhodnutelná.

**Důkaz.** Speciální případ: dáme za $M_2$ TS, který nepřijímá nic ($L(M_2) = \emptyset$). Pak ekvivalence je *přesně* problém prázdnosti $L(M_1)$. Ten už víme, že není rekurzivní. ∎

> Tato redukce z prázdnosti na ekvivalenci je *triviální*, ale dokazuje silný výsledek: nelze obecně zjistit, zda dva algoritmy řeší tutéž úlohu.

## Aplikace: $L(M) = \Sigma^*$ není ani RE

Sestrojíme redukci $\mathrm{co}\text{-}\mathrm{HP} \leq \{\langle M\rangle \mid L(M) = \Sigma^*\}$:

$M'$ na vstupu $y$:
1. **Ověří**, zda $y \in \{a^n b^n c^n \mid n > 0\}$ — pokud ano, *přijme*.
2. Jinak spustí simulaci $M$ na $w$.
3. Pokud $M$ cyklí, $M'$ cyklí.
4. Pokud $M$ zastaví, $M'$ přijme.

Pak:
* $M$ *nezastaví* na $w \iff M'$ přijme jen $\{a^n b^n c^n\} \iff L(M') \neq \Sigma^*$.
* $M$ *zastaví* na $w \iff M'$ přijme každé $y \iff L(M') = \Sigma^*$.

$\sigma(\langle M\rangle \# \langle w\rangle) = \langle M'\rangle$.

Pak $\langle M\rangle \# \langle w\rangle \in \mathrm{co}\text{-}\mathrm{HP} \iff L(M') \neq \Sigma^* \iff \neg(\langle M'\rangle \in \{...\})$.

Pozor — toto je redukce na *doplněk* — chceme ukázat, že problém $\{\langle M\rangle \mid L(M) = \Sigma^*\}$ není v RE.

Po reformulaci: pokud $\{\langle M\rangle \mid L(M) = \Sigma^*\} \in \text{RE}$, pak po průchodu naší konstrukcí by byl $\mathrm{co}\text{-}\mathrm{HP} \in \text{RE}$, což je spor.

## Tabulka rozhodnutelnosti

Souhrnný pohled na základní problémy pro různé jazykové třídy:

| Problém | Reg | DCF | CF | CS | R | RE |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: |
| $w \in L(G)$? | R | R | R | R | R | N |
| $L(G) = \emptyset$? | R | R | R | N | N | N |
| $L(G)$ konečný? | R | R | R | N | N | N |
| $L(G) = \Sigma^*$? | R | R | N | N | N | N |
| $L(G) = R$, $R$ regulární? | R | R | N | N | N | N |
| $L(G_1) = L(G_2)$? | R | R | N | N | N | N |
| $L(G_1) \subseteq L(G_2)$? | R | N | N | N | N | N |
| $L(G_1)$ regulární? | A | R | N | N | N | N |
| Víceznačnost $G$? | R | N | N | N | N | N |

R = rozhodnutelný, N = nerozhodnutelný, A = vždy splněno.

> **Klíčové pozorování:** *čím vyšší třída* (větší expresivita), tím *více nerozhodnutelných* problémů. Pro RE (= $\mathcal{L}_0$) je *téměř všechno* nerozhodnutelné. To je metaforicky vyjádřeno **Riceovou větou** ([[riceova-veta]]) — *každá netriviální vlastnost RE jazyků je nerozhodnutelná*.

## Tranzitivnost redukce

**Lemma.** Relace $\leq$ je *tranzitivní*: pokud $A \leq B$ a $B \leq C$, pak $A \leq C$.

**Důkaz.** Nechť $\sigma_1 : A \to B$ a $\sigma_2 : B \to C$ jsou příslušné redukce. Definujeme $\sigma = \sigma_2 \circ \sigma_1$. Pak:

$$
w \in A \iff \sigma_1(w) \in B \iff \sigma_2(\sigma_1(w)) \in C \iff \sigma(w) \in C.
$$

Tranzitivnost znamená, že po dokázání HP, $L_\mathrm{M}$, $\{L = \emptyset\}$, ... může každý další problém být *redukcí z libovolné* z dříve dokázaných nerozhodnutelností.

## Důsledky: hierarchie redukcí

Z dokázaných výsledků máme:

::: math
\mathrm{HP} \equiv L_\mathrm{M} \equiv \{(\langle M_1\rangle, \langle M_2\rangle) \mid L(M_1) = L(M_2)\} \equiv \dots
:::

(kde $A \equiv B$ znamená $A \leq B \land B \leq A$).

Naopak co-HP je *silnější* nerozhodnutelnost — leží *mimo* RE:

::: math
\mathrm{co}\text{-}\mathrm{HP} \leq \{\langle M\rangle \mid L(M) = \emptyset\} \leq \{\langle M\rangle \mid L(M) = \Sigma^*\} \dots
:::

Všechny tyto problémy patří do třídy *"ani parciálně rozhodnutelné"*.

[[riceova-veta]] poskytne **generický nástroj**: jediným tvrzením dokazuje nerozhodnutelnost *všech netriviálních* vlastností RE jazyků — bez nutnosti opakovaného konstruování redukcí pro každý problém zvlášť.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=amrvv9Lgrww" "Teoretická informatika: Nerozhodnutelnost" "Tomáš Kocourek"
:::

::: youtube "https://www.youtube.com/watch?v=Iz9RFd5ENIU" "SZZ: Nerozhodnutelnost" "Tomáš Kocourek"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Post, E.: *Recursively Enumerable Sets of Positive Integers and Their Decision Problems* (Bull. AMS, 1944); Rogers, H.: *Theory of Recursive Functions and Effective Computability* (MIT Press, 1987); Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §5.1–5.3.*
