---
title: Paralelní hierarchie jazyků a výpočetních modelů
---

# Paralelní hierarchie: automaty vedle gramatik

[[chomsky-hierarchie]] stratifikuje jazyky podle *generativní síly* gramatik. Stejnou stratifikaci lze nezávisle získat z *akceptační* (rozpoznávací) strany: navrhneme stroje s různou pamětí a sledujeme, jak široká třída jazyků jim "stačí". Výsledek je překvapivě úhledný — *každá úroveň Chomského hierarchie přesně odpovídá jednomu typu stroje*.

## Dvě strany téže mince

| Třída jazyků | Generativní model (gramatika) | Akceptační model (automat) |
| :--- | :--- | :--- |
| $\mathcal{L}_3$ — regulární | regulární gramatika | **konečný automat** (KA / FA) |
| $\mathcal{L}_2$ — bezkontextové | bezkontextová gramatika | **zásobníkový automat** (ZA / PDA) |
| $\mathcal{L}_1$ — kontextové | kontextová gramatika | **lineárně omezený automat** (LOA / LBA) |
| $\mathcal{L}_0$ — rekurzivně vyčíslitelné | obecná gramatika | **Turingův stroj** (TS / TM) |

Ekvivalence se zapisuje jako $\mathcal{L}_3 = \mathcal{L}_{\mathrm{KA}}$, $\mathcal{L}_2 = \mathcal{L}_{\mathrm{ZA}}$, $\mathcal{L}_1 = \mathcal{L}_{\mathrm{LOA}}$ a $\mathcal{L}_0 = \mathcal{L}_{\mathrm{TS}} = \mathcal{L}_{\mathrm{RE}}$. Jde o *netriviální výsledky*, jejichž důkazy přes simulační konstrukce probíráme v jednotlivých kapitolách: [[konecne-automaty]] pro $\mathcal{L}_3$, [[ekvivalence-pda-cfg]] pro $\mathcal{L}_2$, [[ts-definice]] pro $\mathcal{L}_0$.

## Společný rámec automatu

Ačkoli se automaty liší v pamětí, mají *jednotnou strukturu*:

::: svg "Schématický pohled na obecný automat: vstupní páska, stavové řízení, případná pomocná paměť"
<svg viewBox="0 0 540 250" font-family="ui-sans-serif, system-ui" font-size="12">
  <g fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1">
    <rect x="40" y="30" width="280" height="30"/>
    <line x1="80" y1="30" x2="80" y2="60"/>
    <line x1="120" y1="30" x2="120" y2="60"/>
    <line x1="160" y1="30" x2="160" y2="60"/>
    <line x1="200" y1="30" x2="200" y2="60"/>
    <line x1="240" y1="30" x2="240" y2="60"/>
    <line x1="280" y1="30" x2="280" y2="60"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="50">a</text>
    <text x="100" y="50">b</text>
    <text x="140" y="50">b</text>
    <text x="180" y="50">a</text>
    <text x="220" y="50">…</text>
  </g>
  <text x="180" y="20" text-anchor="middle" fill="var(--text-muted)" font-size="11">vstupní páska (read-only)</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="var(--bg-card)">
    <rect x="170" y="100" width="120" height="60" rx="8"/>
  </g>
  <text x="230" y="125" text-anchor="middle" fill="var(--accent)">stavové řízení</text>
  <text x="230" y="145" text-anchor="middle" fill="var(--text-muted)" font-size="11">konečná množina stavů</text>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none">
    <line x1="100" y1="60" x2="100" y2="100" marker-end="url(#arrJA)"/>
  </g>
  <text x="120" y="85" fill="var(--text-muted)" font-size="10">hlava čte</text>
  <g fill="var(--bg-inset)" stroke="var(--line)" stroke-width="0.9" stroke-dasharray="3 3">
    <rect x="370" y="80" width="140" height="120" rx="8"/>
  </g>
  <text x="440" y="100" text-anchor="middle" fill="var(--text-muted)" font-size="11">pomocná paměť</text>
  <text x="440" y="135" text-anchor="middle" fill="var(--text)" font-size="11">• KA: žádná</text>
  <text x="440" y="155" text-anchor="middle" fill="var(--text)" font-size="11">• ZA: zásobník (LIFO)</text>
  <text x="440" y="175" text-anchor="middle" fill="var(--text)" font-size="11">• LOA: páska |w| buněk</text>
  <text x="440" y="195" text-anchor="middle" fill="var(--text)" font-size="11">• TS: neomezená páska</text>
  <g stroke="var(--accent-line)" stroke-width="1.2" fill="none">
    <line x1="290" y1="130" x2="370" y2="130" marker-end="url(#arrJA)"/>
  </g>
  <defs>
    <marker id="arrJA" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

Každý automat má:

1. **Vstupní pásku** — řetězec $w \in \Sigma^*$, který se má rozhodnout, zda do jazyka patří.
2. **Konečnou množinu stavů** $Q$ s počátečním stavem $q_0$ a podmnožinou koncových stavů $F \subseteq Q$.
3. **Přechodovou funkci** $\delta$ — pravidla, jak změnit stav (a případně paměť) podle aktuálního stavu, čteného symbolu a stavu paměti.
4. **Pomocnou paměť** — toto je *jediný* rozdíl mezi typy automatů.

Stroj **přijímá** vstup $w$, pokud lze posloupností přechodů dorazit do nějakého koncového stavu se zpracovaným celým vstupem. Jazyk přijímaný strojem $M$ je $L(M) = \{w \in \Sigma^* \mid M \text{ přijímá } w\}$.

## Postup hierarchií paměti

**Konečný automat (KA)** — žádná pomocná paměť. Veškerá informace o průběhu výpočtu se musí vejít do *jednoho stavu* z konečné množiny. Proto KA dokáže "počítat" jen do konstanty — neumí např. zkontrolovat, zda počet $a$ rovná počtu $b$. Probrán v [[konecne-automaty]].

**Zásobníkový automat (ZA / PDA)** — má zásobník (LIFO). Může do něj zapisovat a vyzvedávat symboly. Stack umožňuje *párovat* — typicky "uložím *otevírací* závorku, pak při *uzavírací* odeberu". Z toho plyne, že ZA umí $\{a^n b^n\}$, palindromy, vyvážené závorky. Probrán v [[zasobnikove-automaty]].

**Lineárně omezený automat (LOA / LBA)** — Turingův stroj omezený tak, že páska má délku přesně $O(|w|)$, nemůže ji rozšířit. Toto omezení je silnější než stack, protože *libovolná pozice* je dostupná v jediném kroku — LBA umí $\{a^n b^n c^n\}$. Plně se LBA *neprobírá v této kapitole*; v kurzu se objevují hlavně jako akceptační model kontextových jazyků a v důkazu nerozhodnutelnosti některých jejich vlastností ([[pcp-jazyky]]).

**Turingův stroj (TS)** — neomezená páska s možností číst i zapisovat libovolně daleko, libovolně dlouho. Maximálně mocný *fyzikálně realizovatelný* model výpočtu. Podle Church-Turingovy teze definuje **vše, co lze efektivně spočítat**. Probrán v [[ts-definice]] a [[ts-modifikace]].

## Determinismus vs nedeterminismus

U každého typu se objevuje rozlišení mezi **deterministickou** (každý stav + vstup → jediný přechod) a **nedeterministickou** (více možností) variantou. Klíčový rozdíl:

| Model | Deterministická síla = Nedeterministická? |
| :--- | :-: |
| KA | **Ano** (NKA → DKA pomocí podmnožinové konstrukce — [[determinizace]]) |
| ZA | **Ne** — deterministické PDA přijímají *vlastní podtřídu* bezkontextových jazyků (DCFL) |
| LBA | Otevřené (zhruba 60 let) — známo jako "LBA problem" |
| TS | **Ano** (NTS → DTS, ale za cenu *exponenciálního* zpoždění — [[ts-modifikace]]) |

Pro KA a TS je nedeterminismus *užitečná abstrakce*, ale ne zvyšuje jejich *výpočetní* sílu. Pro ZA je rozdíl podstatný — to vysvětluje, proč deterministické gramatiky (LR(k), LL(k)) z [[normalni-formy]] popisují jen *vlastní část* bezkontextových jazyků.

## Souhrn ekvivalencí

Pro budoucí orientaci uvádíme všechny ekvivalence v jednom přehledu:

::: math
\begin{array}{c}
\mathcal{L}_3 \;=\; \mathcal{L}_{\mathrm{NKA}} \;=\; \mathcal{L}_{\mathrm{DKA}} \;=\; \mathcal{L}_{\mathrm{RV}} \\[4pt]
\mathcal{L}_2 \;=\; \mathcal{L}_{\mathrm{NPDA}} \;\supsetneq\; \mathcal{L}_{\mathrm{DPDA}} \;(\!=\!\mathrm{DCFL}) \\[4pt]
\mathcal{L}_1 \;=\; \mathcal{L}_{\mathrm{LBA}} \\[4pt]
\mathcal{L}_0 \;=\; \mathcal{L}_{\mathrm{TS}} \;=\; \mathcal{L}_{\mathrm{RE}}
\end{array}
:::

kde **RV** = regulární výrazy ([[regularni-vyrazy]]), **DCFL** = deterministicky bezkontextové, **RE** = recursively enumerable (rekurzivně vyčíslitelný).

---

### Videa

::: youtube "https://www.youtube.com/watch?v=m-uP64Cq9Kc" "SZZ: Chomského hierarchie a vlastnosti jazyků" "Tomáš Kocourek"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), kap. 1, 5; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), Part Two; [Wikipedia — Chomsky hierarchy](https://en.wikipedia.org/wiki/Chomsky_hierarchy).*
