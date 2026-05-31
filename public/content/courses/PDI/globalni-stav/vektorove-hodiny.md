---
title: Vektorové hodiny a ověření konzistence
---

Chandy–Lamportův algoritmus (viz [[chandy-lamport]]) snímek *konstruuje* tak, aby byl konzistentní z principu. Často ale stojíme před opačnou úlohou: centrální monitor posbírá lokální stavy z různých procesů — pořízené v různých, nezávislých okamžicích — a potřebuje **ověřit**, zda dohromady dávají kauzálně smysl, tedy zda tvoří konzistentní řez. Přesně k tomu se hodí **vektorové hodiny**.

## Proč nestačí Lamportovy hodiny

[[logicky-cas|Lamportovy skalární hodiny]] umí události *uspořádat* — platí implikace $a \to b \Rightarrow C(a) < C(b)$. Opačně to ale neplatí: z $C(a) < C(b)$ nelze poznat, zda jsou události kauzálně závislé, nebo jen **souběžné** (paralelní). A právě rozlišení kauzality od souběžnosti je jádrem ověřování konzistence.

**Vektorové hodiny** (Mattern, Fidge 1988) přiřazují každé události vektor $V$ délky $N$ (počet procesů) a poskytují plnou ekvivalenci:

::: math
a \to b \iff V(a) < V(b), \qquad a \parallel b \iff V(a) \not< V(b) \wedge V(b) \not< V(a)
:::

kde $V < W$ znamená „$V \le W$ po složkách a alespoň v jedné složce ostře menší“. Mechanika aktualizace vektorů (inkrement vlastní složky, po složkách maximum při příjmu) je probrána v [[logicky-cas]]; zde se vektory použijí jako *měřítko kauzality* pro test řezu.

## Hraniční události musí být vzájemně souběžné

Řez je dán svou **hranicí (frontier)** — pro každý proces $P_i$ poslední událostí $s_i$, kterou řez na tomto procesu ještě obsahuje (okamžik pořízení lokálního snímku). Platí čistá charakterizace:

> Řez je konzistentní **právě tehdy**, když jsou jeho hraniční události po dvojicích **vzájemně souběžné** — žádná z nich kauzálně nepředchází jiné.

Intuice je jednoduchá. Kdyby pro nějakou dvojici platilo $s_i \to s_k$, znamenalo by to, že $P_k$ zaznamenal něco, co kauzálně závisí na události $s_i$ — tedy na *budoucnosti* procesu $P_i$ vzhledem k jeho vlastnímu řezu. To je porušení uzavřenosti vůči nastalo-před, a tím i podmínky C2.

::: svg "Konzistentní vs nekonzistentní řez: hraniční události a směr zpráv přes řez"
<svg viewBox="0 0 540 210" font-family="ui-sans-serif, system-ui" font-size="11">
  <text x="135" y="16" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">konzistentní řez</text>
  <text x="405" y="16" text-anchor="middle" font-size="11" font-weight="600" fill="oklch(0.6 0.2 22)">nekonzistentní řez</text>
  <!-- LEFT: consistent -->
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="30" y1="60" x2="250" y2="60"/>
    <line x1="30" y1="140" x2="250" y2="140"/>
  </g>
  <text x="18" y="63" fill="var(--text-muted)" font-size="10">Pᵢ</text>
  <text x="18" y="143" fill="var(--text-muted)" font-size="10">Pₖ</text>
  <line x1="150" y1="40" x2="150" y2="170" stroke="var(--accent)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <circle cx="95" cy="60" r="5"/><circle cx="150" cy="60" r="5"/>
    <circle cx="110" cy="140" r="5"/><circle cx="150" cy="140" r="5"/>
  </g>
  <line x1="95" y1="65" x2="195" y2="135" stroke="var(--accent)" stroke-width="0.9" marker-end="url(#ok)" fill="none"/>
  <text x="150" y="190" text-anchor="middle" font-size="9" fill="var(--text-muted)">zpráva přes řez: minulost → budoucnost ✓</text>
  <!-- RIGHT: inconsistent -->
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="300" y1="60" x2="520" y2="60"/>
    <line x1="300" y1="140" x2="520" y2="140"/>
  </g>
  <text x="288" y="63" fill="var(--text-muted)" font-size="10">Pᵢ</text>
  <text x="288" y="143" fill="var(--text-muted)" font-size="10">Pₖ</text>
  <line x1="420" y1="40" x2="420" y2="170" stroke="oklch(0.6 0.2 22)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <circle cx="465" cy="60" r="5"/><circle cx="365" cy="140" r="5"/>
  </g>
  <line x1="465" y1="65" x2="365" y2="135" stroke="oklch(0.6 0.2 22)" stroke-width="1.1" marker-end="url(#bad)" fill="none"/>
  <text x="410" y="190" text-anchor="middle" font-size="9" fill="oklch(0.6 0.2 22)">zpráva přes řez: budoucnost → minulost ✗</text>
  <defs>
    <marker id="ok" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/></marker>
    <marker id="bad" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="oklch(0.6 0.2 22)"/></marker>
  </defs>
</svg>
:::

## Pravidlo pro ověření shromážděného stavu

Souběžnost hraničních událostí lze z vektorových razítek přečíst exaktně. Pro globální stav $S = \{s_1, \dots, s_N\}$ složený z lokálních stavů platí:

::: math
S \text{ je konzistentní} \iff \forall i,k:\ V(s_k)[k] \ge V(s_i)[k]
:::

Čte se to po složkách: **$k$-tá složka** vektoru každého stavu sleduje, kolik událostí proběhlo u procesu $P_k$. Hodnota $V(s_k)[k]$ je „pravdivý“ čítač $P_k$ v okamžiku jeho vlastního snímku. Hodnota $V(s_i)[k]$ je to, kolik událostí $P_k$ má proces $P_i$ *započteno* (skrze zprávy, které od $P_k$ — přímo či tranzitivně — dostal). Podmínka říká, že žádný cizí proces nesmí o $P_k$ vědět víc, než kolik $P_k$ sám u sebe stihl zaznamenat.

::: math
\underbrace{V(s_k)[k]}_{\text{co } P_k \text{ stihl u sebe}} \ \ge\ \underbrace{V(s_i)[k]}_{\text{co } P_i \text{ o } P_k \text{ ví}}
:::

Pokud by pro nějaké $i,k$ vyšlo $V(s_i)[k] > V(s_k)[k]$, znamenalo by to, že $P_i$ zaznamenal příjem zprávy od $P_k$, kterou $P_k$ ve svém snímku ještě **neodeslal** — tedy zprávu z budoucnosti odesílatele. To je matematický důkaz porušení C2: efekt bez příčiny.

## Ochrana před zprávou z budoucnosti

Fyzikální význam pravidla je tedy přesně ten, který v [[konzistentni-rez]] popisuje C2: žádný proces ve svém lokálním stavu nesmí evidovat **přijetí zprávy, jejíž odeslání spadá až do budoucnosti odesílatele**. Vektorové hodiny tuto vlastnost neformulují slovně, ale **dokazatelně** — stačí porovnat $N \times N$ čísel. Tím se ze sbírky nezávisle pořízených lokálních stavů stane verifikovatelný objekt: monitor jediným porovnáním vektorů rozhodne, zda jde o platný globální stav, nebo o kauzální nesmysl.

| Test na dvojici $(s_i, s_k)$ | Význam |
| :--- | :--- |
| $V(s_k)[k] \ge V(s_i)[k]$ pro všechna $i,k$ | hraniční události jsou souběžné → řez **konzistentní** |
| $\exists\, i,k:\ V(s_i)[k] > V(s_k)[k]$ | $P_i$ ví o $P_k$ víc, než $P_k$ stihl → zpráva z budoucnosti → **nekonzistentní** |

::: quiz "Monitor sebral stavy a zjistil V(s_i)[k] = 5, ale V(s_k)[k] = 3. Co to znamená?"
- [x] Stav je nekonzistentní — P_i započítal události od P_k, které P_k ve svém snímku ještě nestihl (zpráva z budoucnosti).
  > Správně. P_i o P_k „ví“ víc (5), než kolik P_k sám u sebe zaznamenal (3) — porušení V(s_k)[k] ≥ V(s_i)[k], tedy C2.
- [ ] Stav je konzistentní, P_i je jen napřed.
  > Naopak: to, že P_i započítal víc událostí P_k, než P_k stihl, je právě efekt bez příčiny. Konzistentní stav vyžaduje V(s_k)[k] ≥ V(s_i)[k].
- [ ] Nelze rozhodnout bez Lamportových hodin.
  > Vektorové hodiny rozhodnou samy — to je jejich výhoda nad skalárními Lamportovými hodinami, které souběžnost od kauzality nerozliší.
:::

::: link "Mattern, F. — Virtual Time and Global States of Distributed Systems (1988)" "https://courses.csail.mit.edu/6.852/01/papers/VirtTime_GlobState.pdf"
:::

::: link "Schwarz, R., Mattern, F. — Detecting Causal Relationships in Distributed Computations (Distributed Computing, 1994)" "https://doi.org/10.1007/BF02277859"
:::

---

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Mattern (Virtual Time and Global States, 1988), Fidge (Timestamps in Message-Passing Systems, 1988), Schwarz & Mattern (Detecting Causal Relationships, Distributed Computing 7(3), 1994), Kshemkalyani & Singhal (Distributed Computing, kap. 4).*
