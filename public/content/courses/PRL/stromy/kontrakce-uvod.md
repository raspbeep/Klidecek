---
title: Kontrakce stromu — Rake + Compress
---

# Tree contraction — Rake + Compress

Předchozí kapitoly ([[euler-tour]], [[euler-aplikace]]) ukázaly, jak řešit *informační* úlohy nad stromem (preorder, hloubky, počet potomků) v $O(\log n)$ pomocí Euler tour. **Některé úlohy ale Euler tour neumí** — třeba *vyhodnocení aritmetického výrazu* uloženého v binárním stromě, kde hodnota každého vnitřního uzlu *závisí* na hodnotách jeho synů. Pro tyto úlohy se používá **tree contraction** — dvě komplementární operace **Rake** (odstranění listů) a **Compress** (zkrácení řetězů). Tato kapitola probírá *koncept* tree contraction; [[expression-eval]] potom aplikuje pro vyhodnocení výrazů.

## Motivace — proč ne Euler tour

Vyhodnocení aritmetického výrazu:

```
        +
       / \
      *   /
     / \ / \
    2  3 12 4
```

Hodnota kořene = $2 \cdot 3 + 12 / 4 = 9$. Sekvenčně **post-order** evaluation: spočítej levý podstrom (= 6), spočítej pravý podstrom (= 3), spočítej kořen (= 9). $O(n)$.

Paralelně chceme $O(\log n)$. Euler tour ne — *hodnota* kořene závisí *funkčně* na *hodnotách* synů, ne jen na jejich existenci. Suma prefixů nemá takovou strukturu.

Řešení: **strukturálně měnit strom**. Postupně *odstraňujeme* listy a *zkracujeme* řetězy, dokud nezůstane jeden uzel = kořen s vyhodnocenou hodnotou.

## Definice — chain (řetěz)

**Chain (řetěz)** je posloupnost uzlů *stupně 1* (jeden syn) — tj. lineární cesta ve stromě.

::: svg "Řetěz ve stromě — uzly s právě jedním synem"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="270" cy="30" r="13"/>
    <circle cx="210" cy="65" r="11"/>
    <circle cx="330" cy="65" r="11"/>
    <circle cx="170" cy="100" r="10"/>
    <circle cx="250" cy="100" r="10"/>
    <circle cx="170" cy="135" r="10"/>
    <circle cx="170" cy="165" r="10"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="34">A</text>
    <text x="210" y="69">B</text>
    <text x="330" y="69">C</text>
    <text x="170" y="104">D</text>
    <text x="250" y="104">E</text>
    <text x="170" y="139">F</text>
    <text x="170" y="169">G</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="262" y1="40" x2="218" y2="56"/>
    <line x1="278" y1="40" x2="322" y2="56"/>
    <line x1="204" y1="74" x2="176" y2="92"/>
    <line x1="216" y1="74" x2="244" y2="92"/>
    <line x1="170" y1="110" x2="170" y2="125"/>
    <line x1="170" y1="145" x2="170" y2="155"/>
  </g>
  <g stroke="var(--accent)" stroke-width="2.4" fill="none">
    <line x1="170" y1="110" x2="170" y2="125"/>
    <line x1="170" y1="145" x2="170" y2="155"/>
  </g>
  <text x="190" y="135" fill="var(--accent)" font-size="10">řetěz D-F-G</text>
  <text x="270" y="178" fill="var(--text-muted)" text-anchor="middle" font-size="10">Uzly D, F mají jen jednoho syna — tvoří řetěz</text>
</svg>
:::

**Pozorování**: ve *vyváženém* binárním stromě nejsou žádné dlouhé řetězy. V *patologickém* stromě (lineární seznam) je *celý* strom jeden řetěz.

## Rake — odstranění listů

**Rake** *odstraní* všechny *listy* stromu a jejich příspěvek *přiřadí* rodiči (např. *upraví* hodnotu rodiče).

```
RAKE:
  for each leaf v with parent p in parallel:
    "absorb" v into p   (update p's value with v's contribution)
    remove edge (v, p) and node v
```

::: svg "Rake — všechny listy se odstraní paralelně"
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="80" cy="30" r="13"/>
    <circle cx="50" cy="70" r="11"/>
    <circle cx="110" cy="70" r="11"/>
    <circle cx="30" cy="110" r="10"/>
    <circle cx="70" cy="110" r="10"/>
    <circle cx="90" cy="110" r="10"/>
    <circle cx="130" cy="110" r="10"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="73" y1="42" x2="56" y2="60"/>
    <line x1="87" y1="42" x2="104" y2="60"/>
    <line x1="44" y1="80" x2="34" y2="100"/>
    <line x1="56" y1="80" x2="66" y2="100"/>
    <line x1="104" y1="80" x2="94" y2="100"/>
    <line x1="116" y1="80" x2="126" y2="100"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="10" font-weight="600">
    <text x="30" y="135">×</text>
    <text x="70" y="135">×</text>
    <text x="90" y="135">×</text>
    <text x="130" y="135">×</text>
  </g>
  <text x="80" y="155" fill="var(--text-muted)" text-anchor="middle" font-size="10">Před RAKE: 7 uzlů</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#rakearr)">
    <line x1="180" y1="70" x2="240" y2="70"/>
  </g>
  <defs>
    <marker id="rakearr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="210" y="65" fill="var(--accent)" text-anchor="middle" font-size="10">RAKE</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="350" cy="30" r="13"/>
    <circle cx="320" cy="70" r="11"/>
    <circle cx="380" cy="70" r="11"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="343" y1="42" x2="326" y2="60"/>
    <line x1="357" y1="42" x2="374" y2="60"/>
  </g>
  <text x="350" y="155" fill="var(--text-muted)" text-anchor="middle" font-size="10">Po RAKE: 3 uzly (vše listy → kořen)</text>
</svg>
:::

**Problém**: pokud je strom *lineární seznam* (řetěz délky $n$), RAKE odstraní *jen jeden* uzel za krok — $O(n)$ kroků celkem. **Pomalé!**

## Compress — zkrácení řetězu

**Compress** rezolvuje problém s řetězy: *sloučí dva po sobě jdoucí* uzly stupně 1 do jednoho.

```
COMPRESS:
  for each chain of length ≥ 2 do in parallel:
    pair up every other node in the chain
    merge pairs into single nodes
```

Po jednom Compress kroku se řetěz délky $k$ zkrátí na $\lceil k/2 \rceil$ uzlů. Po $\log k$ Compress operacích je řetěz délky 1.

::: svg "Compress — sudé uzly řetězu se sloučí s lichými"
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="40" cy="50" r="10"/>
    <circle cx="80" cy="50" r="10"/>
    <circle cx="120" cy="50" r="10"/>
    <circle cx="160" cy="50" r="10"/>
    <circle cx="200" cy="50" r="10"/>
    <circle cx="240" cy="50" r="10"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="50" y1="50" x2="70" y2="50"/>
    <line x1="90" y1="50" x2="110" y2="50"/>
    <line x1="130" y1="50" x2="150" y2="50"/>
    <line x1="170" y1="50" x2="190" y2="50"/>
    <line x1="210" y1="50" x2="230" y2="50"/>
  </g>
  <text x="140" y="35" fill="var(--text-muted)" text-anchor="middle" font-size="10">Řetěz 6 uzlů</text>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none">
    <ellipse cx="60" cy="50" rx="22" ry="14"/>
    <ellipse cx="140" cy="50" rx="22" ry="14"/>
    <ellipse cx="220" cy="50" rx="22" ry="14"/>
  </g>
  <text x="140" y="85" fill="var(--accent)" text-anchor="middle" font-size="10">páry: 2 ↔ 3, 4 ↔ 5, 6 (single)</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#carr)">
    <line x1="140" y1="100" x2="140" y2="110"/>
  </g>
  <defs>
    <marker id="carr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="100" cy="130" r="10"/>
    <circle cx="160" cy="130" r="10"/>
    <circle cx="220" cy="130" r="10"/>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="110" y1="130" x2="150" y2="130"/>
    <line x1="170" y1="130" x2="210" y2="130"/>
  </g>
  <text x="160" y="150" fill="var(--text-muted)" text-anchor="middle" font-size="10">Po COMPRESS: 3 uzly</text>
</svg>
:::

## Rake + Compress = Tree Contraction

**Tree contraction** střídá Rake a Compress:

```
while strom má > 1 uzel:
  RAKE        // odstraní listy
  COMPRESS    // zkrátí řetězy
```

**Klíčové tvrzení**: po **$O(\log n)$** iterací každý strom (i lineární) je redukován na *jeden* uzel.

### Intuitivní argument

- Pokud je strom *vyvážený*, RAKE samotný stačí — $\log n$ iterací.
- Pokud je strom *lineární*, COMPRESS samotný stačí — $\log n$ iterací.
- Pokud je smíšený: každá iterace RAKE+COMPRESS *aspoň zpoloví* některou „dimenzi" stromu — celková velikost klesá *geometricky*.

### Sekvence operací pro různé stromy

Příklad pro nevyvážený strom 7 uzlů:

```
Iter 1: RAKE → odstraň 4 listy → 3 vnitřní uzly + řetěz
Iter 1: COMPRESS → zkrácen řetěz → 2 uzly
Iter 2: RAKE → odstraň poslední uzel → 1 kořen
```

V *log n* iteracích vždy hotovo.

::: viz kontrakce-uvod "Klikni RAKE / COMPRESS na vyvážený, lopsided i lineární strom — uvidíš, proč střídání obou operací kolabuje libovolný strom v O(log n) iterací."
:::

## Použití pro paralelní algoritmy

Tree contraction umožňuje:

- **Expression evaluation** (vyhodnocení aritmetického výrazu) — viz [[expression-eval]].
- **Strom rooted matching** — propojit uzly se sousedy podle nějakého kritéria.
- **Tree isomorphism** — paralelní rozhodování, zda dva stromy jsou izomorfní.
- **Strom contour / cordal cover** v geometrii.

Klíčová vlastnost: každá *unární* funkce nad stromem, kterou lze rozdělit do **Rake** (info z listu na rodiče) a **Compress** (řetěz unární operace), se dá paralelně vyhodnotit v $O(\log n)$.

## Variant pro binární stromy

Pro **binární** stromy existuje *speciální* implementace:

1. Označ všechny *listy* indexy $1, 2, \dots, n$ (zleva doprava).
2. Sudé listy se zpracovávají v jedné fázi, liché ve druhé — zaručeno, že **rodiče sousedních listů nejsou sousedi**.
3. Operace **SHUNT** (varianta RAKE) spojí list s rodičem a propaguje souroženec výš.

Tato implementace je *standardní* a používá ji většina textbooků. Detaily v [[expression-eval]].

## Analýza tree contraction

| Vlastnost | Hodnota |
| :--- | :---: |
| Počet iterací | $O(\log n)$ |
| Operací na iteraci | $O(\text{aktuální velikost stromu})$ paralelně |
| **Celkový čas** | $O(\log n)$ |
| **Procesory** | $O(n)$ |
| **Cena** | $O(n \log n)$ |

Pro *cost-optimal* implementaci (Reif & Tate 1986): $O(n)$ celková práce, $O(\log n)$ čas, $O(n/\log n)$ procesorů.

## Srovnání s Euler tour

| Metoda | Vhodná pro | Časová složitost |
| :--- | :--- | :---: |
| **Euler tour** | informační úlohy (preorder, hloubka, počet, ...) | $O(\log n)$ |
| **Tree contraction** | strukturální úlohy s *funkčním* výpočtem (expression eval, dynamic programming on trees) | $O(\log n)$ |

Obě techniky dávají *stejnou* asymptotickou složitost, ale řeší různé úlohy. Pro úlohy *kombinující* obě (např. *centroid decomposition*) se používají *společně*.

## Co dál

[[expression-eval]] aplikuje tree contraction na konkrétní úlohu: **vyhodnocení aritmetického výrazu** uloženého v binárním stromě. Klíčová operace je **SHUNT** — modifikovaná RAKE, která propaguje funkce ve tvaru $f(X) = aX + b$ od listů ke kořenu. Po $O(\log n)$ SHUNT iterací je výraz vyhodnocen v kořeni.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Miller, G.L., Reif, J.H.: „Parallel tree contraction and its application" (FOCS 1985, [DOI 10.1109/SFCS.1985.43](https://doi.org/10.1109/SFCS.1985.43)); Abrahamson, K., Dadoun, N., Kirkpatrick, D.G., Przytycka, T.: „A simple parallel tree contraction algorithm" (J. Algorithms 10(2), 1989, [DOI 10.1016/0196-6774(89)90014-1](https://doi.org/10.1016/0196-6774(89)90014-1)); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 3.8; Reif, J.: *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993), kap. 9 (Tree Contraction); Reif, J., Tate, S.: „Optimal size integer division circuits" (STOC 1989) — cost-optimal varianta.*
