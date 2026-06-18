---
title: Fuzzy množiny a fuzzy logika
---

# Fuzzy množiny a fuzzy logika

Klasická (ostrá) množina je striktní: prvek do ní **buď patří, nebo nepatří** — žádné mezistupně. Když ale řekneme „dnes je teplo", svět takhle ostře nefunguje. Je 24 °C ještě „akorát", nebo už „horko"? Hranice je rozmazaná a člověk to vnímá jako **plynulý přechod**, ne jako skok.

**Fuzzy množina** (Zadeh, 1965) tuhle rozmazanost zachytí: prvek do ní patří **částečně**, se *stupněm příslušnosti* mezi 0 a 1. Místo otázky „patří 24 °C do množiny *horko*?" (ano/ne) se ptáme „**do jaké míry** patří 24 °C do *horka*?" — a odpověď může být třeba 0,3.

## Funkce příslušnosti

Stupeň příslušnosti přiřazuje každému prvku tzv. **funkce příslušnosti** (membership function). Je to zobrazení z univerza $U$ (množiny všech přípustných hodnot, např. teploty $\langle 0, 40 \rangle$ °C) do intervalu $\langle 0, 1 \rangle$:

::: math
\mu_A : U \rightarrow \langle 0, 1 \rangle
:::

Hodnota $\mu_A(x) = 1$ znamená „prvek $x$ patří do $A$ plně", $\mu_A(x) = 0$ „vůbec nepatří" a cokoli mezi tím je částečná příslušnost. U ostré množiny by funkce příslušnosti nabývala jen hodnot 0 a 1 — fuzzy množina je tedy její zobecnění.

V praxi se tvary nevolí libovolně, ale jednoduché po částech lineární křivky stačí. Nejčastější jsou:

- **Trojúhelníková** — tři čísla $(a, b, c)$: stoupá z 0 v bodě $a$ do 1 ve vrcholu $b$ a zase klesá k 0 v bodě $c$. Hodí se pro pojem „přibližně $b$".
- **Lichoběžníková** — čtyři čísla $(a, b, c, d)$: stoupá od $a$, drží hodnotu 1 na celém plató mezi $b$ a $c$, pak klesá k $d$. Hodí se pro pojem s „širokým jádrem" („tak akorát").
- **Gaussova** — hladká zvonovitá křivka daná středem a šířkou; používá se tam, kde chceme spojitou derivaci (např. v ANFIS).

::: viz fuzzy-membership "Táhni teploměrem. Pro každou teplotu uvidíš tři stupně příslušnosti do překrývajících se množin studeno / akorát / horko — a uvědomíš si, že jeden bod může patřit do dvou množin zároveň."
:::

## Slovník pojmů (a malý příklad)

Kolem funkce příslušnosti se točí pár pojmů, které se u zkoušky hodí umět. Vezměme trojúhelníkovou množinu *akorát* s vrcholem v 22 °C, rozprostřenou od 18 do 26 °C:

- **Nosič** (support) — ostrá množina prvků, kde je příslušnost nenulová: $\mathrm{supp}(A) = \{x \mid \mu_A(x) > 0\}$. Tady interval $(18, 26)$.
- **Jádro** (core) — prvky s plnou příslušností: $\mathrm{core}(A) = \{x \mid \mu_A(x) = 1\}$. Tady jediný bod 22.
- **Výška** — maximum funkce příslušnosti, $h(A) = \max_x \mu_A(x)$. Tady 1.
- **Normální množina** — má neprázdné jádro, tj. výšku rovnou 1. (Naše *akorát* je normální.)
- **Bod zvratu** (crossover) — kde je $\mu_A(x) = 0{,}5$. Tady 20 a 24 °C.
- **$\alpha$-řez** — ostrá množina prvků s příslušností $\geq \alpha$: $A_\alpha = \{x \mid \mu_A(x) \geq \alpha\}$. Pro $\alpha = 0{,}5$ dostaneme interval $\langle 20, 24 \rangle$.

**Fuzzy číslo** je speciální případ: normální a konvexní (jednovrcholová) fuzzy množina na reálné ose, jejíž jádro je jediný bod — reprezentuje vyjádření typu „přibližně 30".

## Lingvistická proměnná

To, co dělá fuzzy logiku užitečnou, je **lingvistická proměnná** — proměnná, jejíž hodnoty nejsou čísla, ale **slova** (tzv. *termy*), a každé slovo je definováno jednou fuzzy množinou.

Příklad: lingvistická proměnná *Věk* na univerzu $\langle 0, 100 \rangle$ let s termy $\{$ *mladý*, *střední*, *starý* $\}$. Konkrétní věk 35 let pak může mít $\mu_{\text{mladý}}(35) = 0{,}4$ a $\mu_{\text{střední}}(35) = 0{,}7$ — patří do obou pojmů zároveň, jen různou měrou. Právě tahle vrstva propojuje matematiku s tím, jak lidé skutečně mluví a uvažují.

## Fuzzy operace

Klasické množinové operace (průnik, sjednocení, doplněk) se musí zobecnit tak, aby pracovaly se stupni příslušnosti. **Standardní** (Zadehovy) definice jsou:

::: math
\mu_{A \cap B}(x) = \min(\mu_A(x),\, \mu_B(x)) \qquad \mu_{A \cup B}(x) = \max(\mu_A(x),\, \mu_B(x)) \qquad \mu_{A'}(x) = 1 - \mu_A(x)
:::

Intuitivně: průnik (logické AND) bere **minimum** — řetěz je tak silný, jak silný je jeho nejslabší článek; sjednocení (OR) bere **maximum**; doplněk (NOT) odečítá od jedničky. Pro hodnoty 0/1 se tyhle vzorce přesně shodují s klasickou logikou — fuzzy logika ji obsahuje jako speciální případ.

Minimum a maximum nejsou jediná možná volba. Obecně se průnik realizuje libovolnou **T-normou** a sjednocení **S-normou** (T-konormou) — operátory na $\langle 0, 1 \rangle$, které splňují komutativitu, asociativitu, monotónnost a okrajové podmínky. Vedle min/max se často používá **algebraický součin** $T(a,b) = a \cdot b$ pro průnik a **pravděpodobnostní součet** $S(a,b) = a + b - a \cdot b$ pro sjednocení.

::: svg
<svg viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="280" height="150" fill="var(--bg-inset)"/>
  <line x1="20" y1="120" x2="265" y2="120" stroke="var(--line-strong)" stroke-width="0.6"/>
  <line x1="20" y1="20" x2="20" y2="120" stroke="var(--line-strong)" stroke-width="0.6"/>
  <text x="6" y="26" font-size="8" fill="var(--text-faint)">μ=1</text>
  <text x="6" y="120" font-size="8" fill="var(--text-faint)">0</text>
  <!-- set A: triangle -->
  <polyline points="40,120 100,30 160,120" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="90" y="42" font-size="9" fill="var(--accent)">A</text>
  <!-- set B: triangle -->
  <polyline points="120,120 180,30 240,120" fill="none" stroke="var(--accent-line)" stroke-width="1.5"/>
  <text x="186" y="42" font-size="9" fill="var(--accent-line)">B</text>
  <!-- intersection min: lower envelope between 120 and 160 -->
  <polyline points="120,120 140,90 160,120" fill="none" stroke="var(--text)" stroke-width="2"/>
  <text x="118" y="138" font-size="8.5" fill="var(--text-muted)">A∩B = min(μ_A, μ_B) — spodní obálka v překryvu</text>
</svg>
:::

## Fuzzy vs. pravděpodobnost — častá záměna

Nejčastější nepochopení: „není stupeň příslušnosti 0,3 totéž co pravděpodobnost 0,3?" **Není.** Liší se tím, co modelují:

- **Pravděpodobnost** popisuje *náhodu / nejistotu o ostré události*. „Je 30% pravděpodobnost, že je voda horká" znamená, že voda *buď je, nebo není* horká — my jen nevíme jistě a po změření se nejistota rozplyne na 0 nebo 1.
- **Fuzzy příslušnost** popisuje *míru / vágnost samotného pojmu*. „Příslušnost 0,3 do *horka*" znamená, že voda je horká *částečně* — to je vlastnost dané hodnoty vzhledem k vágnímu pojmu, ne nedostatek informace. I když teplotu změříme přesně, příslušnost zůstane 0,3.

Formální stopa rozdílu: pravděpodobnosti přes výlučné jevy se musí sečíst na 1, fuzzy příslušnosti do různých termů **nemusí** ($\mu_{\text{mladý}}(35) + \mu_{\text{střední}}(35)$ může být cokoli). A komplement: $P(A) + P(\bar{A}) = 1$ vždy, kdežto u fuzzy množiny $\mu_A(x) \wedge \mu_{A'}(x) = \min(\mu, 1-\mu)$ obecně **není 0** — fuzzy množina a její doplněk se mohou překrývat (zákon vyloučení třetího v fuzzy logice neplatí).

::: quiz "Voda má teplotu, kterou jsme přesně změřili. Co znamená, že její příslušnost do fuzzy množiny *horko* je 0,3?"
- [ ] Je 30% pravděpodobnost, že je voda horká, a po změření se to rozhodne
  > To by byla pravděpodobnost (nejistota o ostré události). Tady jsme ale teplotu už přesně změřili a žádná nejistota nezbývá.
- [x] Voda je *částečně* horká — pojem „horko" je vágní a tato teplota do něj patří jen z 30 %
  > Přesně tak: fuzzy příslušnost je míra vágního pojmu, ne nejistota. Zůstane 0,3 i při přesně známé teplotě.
- [ ] Voda patří do *horka* a zároveň nepatří, s pravděpodobností 0,5
  > Ne — 0,3 je konkrétní stupeň částečné příslušnosti, nikoli pravděpodobnostní výrok.
- [ ] Příslušnosti do *studeno*, *akorát*, *horko* se musí sečíst na 1, takže zbývá 0,7
  > Fuzzy příslušnosti do různých termů se sčítat na 1 nemusí — to platí jen pro pravděpodobnosti výlučných jevů.
:::

::: link "Zadeh — Fuzzy Sets (1965)" "https://doi.org/10.1016/S0019-9958(65)90241-X"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Zadeh, L.A.: „Fuzzy Sets" (Information and Control, 1965, [DOI:10.1016/S0019-9958(65)90241-X](https://doi.org/10.1016/S0019-9958(65)90241-X)); Klir, G.J., Yuan, B.: „Fuzzy Sets and Fuzzy Logic: Theory and Applications" (Prentice Hall, 1995).*
