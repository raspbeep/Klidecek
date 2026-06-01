---
title: Modifikace TS — vícepáskový, nedeterministický, vícestopý
---

# Modifikace Turingova stroje

Základní TS z [[ts-definice]] má jedinou pásku a deterministické řízení. Pro pohodlnější konstrukce — i pro řešení složitostních otázek — se zavádějí *modifikace*. Klíčový výsledek: *žádná z těchto modifikací neměňuje sílu modelu* (třídu přijímaných jazyků), jen *konstrukční pohodlí* a *časovou složitost*.

## Vícepáskový TS

**Definice.** $k$-páskový TS má $k$ pásek se samostatnými páskovými abecedami $\Gamma_1, \dots, \Gamma_k$ a $k$ hlavami. Přechodová funkce:

$$
\delta : (Q \setminus \{q_F\}) \times \Gamma_1 \times \dots \times \Gamma_k \to Q \times \Gamma_1' \times \dots \times \Gamma_k',
$$

kde $\Gamma_i' = \Gamma_i \cup \{L, R\}$. V jednom kroku tedy stroj přečte *vrcholový symbol z každé pásky*, podle nich přejde do nového stavu a *na každé pásce* nezávisle provede operaci (zápis nebo posun).

::: svg "Třípáskový TS: tři pásky, tři hlavy, jediné stavové řízení"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="0.9">
    <rect x="40" y="40" width="260" height="20"/>
    <rect x="40" y="90" width="260" height="20"/>
    <rect x="40" y="140" width="260" height="20"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="20" y="55">P₁:</text>
    <text x="20" y="105">P₂:</text>
    <text x="20" y="155">P₃:</text>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="55">a</text>
    <text x="80" y="55">b</text>
    <text x="100" y="55">a</text>
    <text x="120" y="55">b</text>
    <text x="60" y="105">∆</text>
    <text x="80" y="105">x</text>
    <text x="100" y="105">y</text>
    <text x="60" y="155">∆</text>
    <text x="80" y="155">∆</text>
    <text x="100" y="155">1</text>
    <text x="120" y="155">0</text>
  </g>
  <g fill="var(--accent)">
    <polygon points="95,65 105,65 100,72"/>
    <polygon points="75,115 85,115 80,122"/>
    <polygon points="115,165 125,165 120,172"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="var(--bg-card)">
    <rect x="350" y="80" width="160" height="60" rx="8"/>
  </g>
  <text x="430" y="105" text-anchor="middle" fill="var(--accent)">stavové řízení</text>
  <text x="430" y="123" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">δ(q, a₁, …, aₖ) →</text>
  <text x="430" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">(q', op₁, …, opₖ)</text>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none" stroke-dasharray="3 3">
    <line x1="100" y1="68" x2="350" y2="105"/>
    <line x1="80" y1="118" x2="350" y2="115"/>
    <line x1="120" y1="168" x2="350" y2="125"/>
  </g>
</svg>
:::

### Konstrukce 1-páskové simulace

**Věta.** Pro každý $k$-páskový TS $M$ existuje 1-páskový TS $M'$ s $L(M) = L(M')$.

**Idea.** Páska $M'$ obsahuje obsah $k$ pásek $M$ uspořádaný *za sebou* a oddělený speciálním oddělovačem (např. `#`). Pozice hlavy každé z pásek $M$ je zakódována *označením symbolu* (např. ⌃ nad symbolem).

```
M:    | a b a a | ∆ x y | 1 0 1 |
      |     ^   |   ^   |     ^ |

M':   # a b â a # ∆ x̂ y # 1 0 1̂ # ...
```

Při simulaci jednoho kroku $M$ stroj $M'$:
1. *Projde celou pásku* a sebere označené symboly (jeden per "pásku").
2. *Vyhodnotí* $\delta_M$ podle těchto symbolů.
3. *Znovu projde* a aplikuje patřičné operace na každý označený symbol.

Pokud potřeba zápisu *prodlouží* některou virtuální pásku, $M'$ musí *posunout* zbytek pásky doprava — to zvedne časovou cenu.

**Cena.** Pokud $M$ pracuje v čase $t(n)$, pak $M'$ pracuje v čase $O(t(n)^2)$ — kvadratická simulace. Důvod: každý krok $M'$ je $O(t(n))$ délka pásky × konstanta operací.

::: math
\text{Věta 7.1.}\quad \mathrm{DTIME}_{k\text{-páska}}(t(n)) \subseteq \mathrm{DTIME}_{1\text{-páska}}(t(n)^2).
:::

## Nedeterministický TS (NTS)

**Definice.** *Nedeterministický TS* má přechodovou funkci

$$
\delta : (Q \setminus \{q_F\}) \times \Gamma \to \mathcal{P}_\text{fin}(Q \times (\Gamma \cup \{L, R\})).
$$

Funkce vrací *konečnou množinu* možných pokračování. NTS *přijímá* $w$, pokud *existuje* posloupnost přechodů vedoucí do $q_F$.

### Simulace NTS deterministickým TS

**Věta.** Pro každý NTS $M_n$ existuje DTS $M_d$ takový, že $L(M_n) = L(M_d)$.

**Idea (BFS po výpočetních cestách).** Pokud má NTS *maximální větvení* $b$ (počet možných přechodů z konfigurace), existuje nejvýše $b^t$ různých výpočetních cest délky $t$. Sestrojíme deterministický 3-páskový TS:

* **1. páska**: vstup $w$ (jen pro čtení).
* **2. páska**: aktuální *cesta* — řetězec čísel z $\{1, 2, \dots, b\}$, který určuje, který přechod $M_n$ vybrat v $i$-tém kroku.
* **3. páska**: pracovní páska — simulace $M_n$ podle aktuální cesty.

DTS iteruje *do šířky* po cestách v $\{1, \dots, b\}^*$ — délky 1, 2, 3, … — a pro každou simuluje $M_n$. Pokud aspoň jedna cesta vede k $q_F$, $M_d$ přijme.

**Cena.** Pokud NTS pracuje v čase $t(n)$, DTS potřebuje čas $O(b^{t(n)}) \cdot O(t(n)) = 2^{O(t(n))}$ — *exponenciální* zpoždění. To je hluboce důležitý jev: pro NTS je $\mathrm{NTIME}(t) \subseteq \mathrm{DTIME}(2^{O(t)})$.

::: math
\text{Věta 7.2.}\quad \mathrm{NTIME}(t(n)) \subseteq \mathrm{DTIME}(2^{O(t(n))}).
:::

> Tato exponenciální *cena* za odstranění nedeterminismu motivuje **otázku $P \stackrel{?}{=} NP$** ([[tridy-p-np]]). Pro *prostorovou* složitost je situace dramaticky jiná: NSPACE → DSPACE má pouze *kvadratickou* cenu (Savitchova věta — [[savitch-prostor]]).

## Vícestopý (multi-track) TS

**Definice.** *Vícestopý TS* má pásku, jejíž *každá buňka* obsahuje $k$-tici symbolů (jednu na každou stopu).

Triviální ekvivalence s 1-páskovým TS: nová pásková abeceda $\Gamma' = \Gamma_1 \times \Gamma_2 \times \dots \times \Gamma_k$. Buňka $(\Delta, x, 0)$ je *jediný* symbol nové abecedy.

::: svg "Vícestopý TS: každá buňka pásky je k-tice symbolů"
<svg viewBox="0 0 540 130" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="0.9">
    <rect x="40" y="40" width="40" height="60"/>
    <rect x="80" y="40" width="40" height="60"/>
    <rect x="120" y="40" width="40" height="60"/>
    <rect x="160" y="40" width="40" height="60"/>
    <rect x="200" y="40" width="40" height="60"/>
    <line x1="40" y1="60" x2="240" y2="60"/>
    <line x1="40" y1="80" x2="240" y2="80"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="55">∆</text>
    <text x="100" y="55">a</text>
    <text x="140" y="55">b</text>
    <text x="180" y="55">c</text>
    <text x="220" y="55">∆</text>
    <text x="60" y="75">1</text>
    <text x="100" y="75">0</text>
    <text x="140" y="75">1</text>
    <text x="180" y="75">0</text>
    <text x="220" y="75">1</text>
    <text x="60" y="95">X</text>
    <text x="100" y="95">Y</text>
    <text x="140" y="95">X</text>
    <text x="180" y="95">Y</text>
    <text x="220" y="95">X</text>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="25" y="55">→</text>
    <text x="25" y="75">→</text>
    <text x="25" y="95">→</text>
  </g>
  <g fill="var(--accent)" font-size="10.5">
    <text x="300" y="55">stopa 1 (vstup)</text>
    <text x="300" y="75">stopa 2 (počítadlo)</text>
    <text x="300" y="95">stopa 3 (značky)</text>
  </g>
  <text x="270" y="120" text-anchor="middle" fill="var(--text-muted)" font-size="10.5">Nová abeceda Γ' = ∆∆∆ ⊆ Γ × {0,1} × {X,Y}</text>
</svg>
:::

Praktické využití: programovací konvence, kde jedna stopa je *vstup*, druhá *pracovní označení*, třetí *přepočítávací počítadlo*. Konstrukce zjednoduší kreslení komplexních TS.

## Univerzální Turingův stroj

**Klíčový krok** v teorii: existence *univerzálního* TS $U$, který přijímá jako vstup *kód* libovolného TS $M$ a slovo $w$, a simuluje $M$ na $w$:

$$
U(\langle M, w\rangle) = M(w).
$$

Univerzální TS dokazuje, že *jeden* fixní algoritmus může *interpretovat* libovolný TS — *programovatelný* charakter výpočtu. Tomuto se věnuje [[univerzalni-ts]].

## Shrnutí: žádná z modifikací nemění sílu modelu

::: math
\mathcal{L}(\text{1-páskový DTS}) = \mathcal{L}(\text{$k$-páskový DTS}) = \mathcal{L}(\text{NTS}) = \mathcal{L}(\text{vícestopý TS}) = \mathcal{L}(\text{univerzální TS}).
:::

Tato *robustnost* TS je jedním z hlavních argumentů pro **Church-Turingovu tezi** — všechny "rozumné" výpočetní modely (λ-kalkul, parciální rekurzivní funkce, RAM stroje, Minského stroje, …) jsou ekvivalentní s TS.

### Rozdíly co do *složitosti*

Modifikace *nezvyšují* sílu, ale *liší se časovou / prostorovou cenou*:

| Konverze | Časová cena | Prostorová cena |
| :--- | :-: | :-: |
| $k$-páskový → 1-páskový | $t \to t^2$ | $s \to k \cdot s$ |
| NTS → DTS | $t \to 2^{O(t)}$ | $s \to O(s^2)$ (Savitch) |
| Vícestopý → 1-stopý | $t \to t$ | $s \to s$ |
| Oboustranná páska → 1-stranná | $t \to O(t)$ | $s \to O(s)$ |

[[rekurzivni-jazyky]] zavádí klíčové třídy jazyků definované TS — *rekurzivní* a *rekurzivně vyčíslitelné* — a jejich vlastnosti.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=bpT5AV6j9N0" "Teoretická informatika: Turingovy stroje" "Tomáš Kocourek"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), §8.4–8.5; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), §3.2; Arora, S., Barak, B.: *Computational Complexity — A Modern Approach* (Cambridge 2009), kap. 1.*
