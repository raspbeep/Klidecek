---
title: Vyhodnocení (forward) a dekódování (Viterbi)
---

# Vyhodnocení (forward) a dekódování (Viterbi)

Máme model $\lambda = (A, B, \pi)$ a sekvenci pozorování $X = x_1,\dots,x_T$. Chceme dvě věci. Za prvé: **jak pravděpodobné je, že tenhle model vygeneroval $X$**? To je $P(X \mid \lambda)$ — počítá ho **forward algoritmus**. Za druhé: **kterou skrytou cestou model nejspíš prošel**? To je nejlepší posloupnost stavů — najde ji **Viterbiho algoritmus**.

## Proč to nejde naivně

Pravděpodobnost pozorování dostaneme tak, že **sečteme přes všechny možné skryté cesty** $S$:

::: math
P(X \mid \lambda) = \sum_{\text{všechny } S} P(X, S \mid \lambda) = \sum_{S} P(X \mid S)\,P(S)
:::

Jenže cest je $N^T$ (každý z $T$ kroků může být v jednom z $N$ stavů). Pro $N=2$ a sekvenci délky 100 je to $2^{100} \approx 10^{30}$ cest — **nespočítatelné**. Záchranou je **dynamické programování**: spousta cest sdílí stejné začátky, tak je počítejme jen jednou.

## Forward algoritmus: počítáme α přes trellis

Pomocnou strukturou je **trellis** (mřížka): svislá osa = stavy, vodorovná = čas. Definujeme **dopřednou proměnnou**

::: math
\alpha_t(j) = P(x_1, x_2, \dots, x_t,\ s_t = j \mid \lambda)
:::

slovně: „pravděpodobnost, že model vygeneroval **začátek** sekvence až do času $t$ **a** skončil ve stavu $j$". Klíč je rekurze — $\alpha_t(j)$ poskládám z hodnot z předchozího sloupce:

::: math
\alpha_1(j) = \pi_j\, b_j(x_1), \qquad
\alpha_t(j) = \left[\sum_{i=1}^{N} \alpha_{t-1}(i)\, a_{ij}\right] b_j(x_t)
:::

Čteme to takhle: abych byl v čase $t$ ve stavu $j$, musel jsem v čase $t-1$ být v **nějakém** stavu $i$ (proto **suma** přes $i$), přejít $i\to j$ (váha $a_{ij}$) a vyemitovat aktuální pozorování $x_t$ (váha $b_j(x_t)$). Na konci celkovou pravděpodobnost dostanu sečtením posledního sloupce:

::: math
P(X \mid \lambda) = \sum_{j=1}^{N} \alpha_T(j)
:::

## Viterbi: stejná mřížka, ale max místo sumy

Při dekódování nás nezajímá součet přes všechny cesty, ale **jediná nejlepší cesta**:

::: math
\hat{S} = \arg\max_{S} P(S \mid X) = \arg\max_{S} P(X, S \mid \lambda)
:::

(Maximalizovat $P(S\mid X)$ je totéž jako maximalizovat $P(X,S)$, protože $P(X)$ je vůči $S$ konstanta.) Viterbiho proměnná $\delta_t(j)$ je **pravděpodobnost nejlepší cesty**, která končí v čase $t$ ve stavu $j$:

::: math
\delta_t(j) = \max_{s_1,\dots,s_{t-1}} P(x_1,\dots,x_t,\ s_1,\dots,s_{t-1},\ s_t=j \mid \lambda)
:::

Rekurze je **úplně stejná jako forward, jen suma se vymění za maximum**:

::: math
\delta_1(j) = \pi_j\, b_j(x_1), \qquad
\delta_t(j) = \max_{i}\!\left[\delta_{t-1}(i)\, a_{ij}\right] b_j(x_t)
:::

Navíc si u každé buňky pamatujeme **zpětný ukazatel** $\psi_t(j) = \arg\max_i\,[\delta_{t-1}(i)\,a_{ij}]$ — odkud jsme do $j$ přišli. Po vyplnění celé mřížky vezmeme nejlepší koncový stav $\hat s_T = \arg\max_j \delta_T(j)$ a podle ukazatelů se **zpětným průchodem (backtrace)** doplazíme zpět na začátek a zrekonstruujeme celou cestu $\hat S$.

::: viz hmm-viterbi "Krokuj Viterbiho DP přes trellis: nejdřív se plní sloupce zleva doprava (každá buňka = nejlepší log-pravděpodobnost cesty končící v tom stavu), pak se zpětnými ukazateli vykreslí backtrace a zvýrazní se nejpravděpodobnější cesta."
:::

## Numerický trik: pracujeme v logaritmech

Násobíme spoustu pravděpodobností < 1, takže hodnoty rychle padají k nule (**podtečení**, underflow). V praxi se proto vše počítá v **logaritmech**: součin se mění na součet a hodnoty zůstanou rozumné. Ve Viterbim je to obzvlášť čisté — $\max$ a $+$ místo $\max$ a $\times$:

::: math
\log \delta_t(j) = \max_{i}\!\left[\log \delta_{t-1}(i) + \log a_{ij}\right] + \log b_j(x_t)
:::

(Proto jsou čísla ve viz nahoře záporná — jsou to log-pravděpodobnosti.)

## Složitost a rozdíl forward vs Viterbi

Obě procházky mají stejnou strukturu: $T$ sloupců, v každém $N$ buněk, a každá buňka se počítá z $N$ předchozích. Celkem tedy **$O(N^2 T)$ času** a **$O(NT)$ paměti** (stačí držet mřížku, resp. u forwardu jen poslední sloupec — u Viterbiho ale potřebujeme všechny ukazatele kvůli backtrace).

| | **Forward** | **Viterbi** |
|---|---|---|
| operace v uzlu | **suma** přes $i$ | **maximum** přes $i$ |
| co vrací | $P(X\mid\lambda)$ (skalár) | nejlepší cesta $\hat S$ |
| otázka | „jak pravděpodobné je $X$?" | „kudy model nejspíš šel?" |
| backtrace | netřeba | ano, podle $\psi$ |

Hezká intuice: **forward sečte pravděpodobnost všech cest, Viterbi vybere tu jednu nejtěžší.** Proto $P(X) \ge P(X, \hat S)$ — forward je nikdy menší, protože nejlepší cesta je jen jeden ze sčítanců.

::: quiz "Jaký je hlavní rozdíl mezi forward a Viterbiho algoritmem?"
- [ ] Forward je O(N²T), Viterbi je exponenciální
- [ ] Forward dekóduje cestu, Viterbi počítá P(X)
- [x] V uzlu trellis forward sčítá přes předchozí stavy (dá P(X)), Viterbi bere maximum (dá nejlepší cestu)
  > Rekurze mají stejný tvar a stejnou složitost O(N²T). Forward marginalizuje (suma) → celková věrohodnost; Viterbi maximalizuje (max) a navíc si pamatuje zpětné ukazatele → nejpravděpodobnější skrytá cesta.
- [ ] Viterbi nepotřebuje matici přechodů A
:::

::: link "Rabiner — A Tutorial on Hidden Markov Models (1989)" "https://doi.org/10.1109/5.18626"
:::

::: link "Forney — The Viterbi Algorithm (Proc. IEEE 1973)" "https://doi.org/10.1109/PROC.1973.9030"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Rabiner, L.R.: „A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition" (Proc. IEEE 1989, [doi:10.1109/5.18626](https://doi.org/10.1109/5.18626)); Forney, G.D.: „The Viterbi Algorithm" (Proc. IEEE 1973, [doi:10.1109/PROC.1973.9030](https://doi.org/10.1109/PROC.1973.9030)).*
