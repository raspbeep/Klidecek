---
title: Markovský rozhodovací proces (MDP)
---

# Markovský rozhodovací proces (MDP)

Představ si robota v bludišti. V každém okamžiku **stojí v nějakém políčku** (to je jeho *stav*), **vybere si směr** (to je jeho *akce*), a podle toho se **posune** a dostane nějaký bodový **zisk nebo trest** (to je *odměna*, reward). Robot dopředu nezná mapu — musí se chovat tak, aby celkový součet odměn za celou cestu byl co největší.

**Markovský rozhodovací proces (MDP)** je matematický model přesně téhle situace: formálně popisuje *sekvenční rozhodování v prostředí s odměnou*. Je to standardní rámec, do kterého se formuluje **posilované učení (Reinforcement Learning, RL)** — viz [[rl-framework]] v SUI. RL je metoda, *jak MDP vyřešit*, když ho předem celý neznáme; MDP je *popis světa*, ve kterém se rozhodujeme.

## Pět složek MDP

MDP je popsán pěticí $(\mathcal{S}, \mathcal{A}, P, R, \gamma)$. Pojďme je po jedné, vždy s příkladem robota v bludišti.

- **Stavy** $\mathcal{S}$ — množina situací, ve kterých se agent může nacházet (políčka bludiště). Stav $s$ shrnuje vše, co agent o světě potřebuje vědět.
- **Akce** $\mathcal{A}$ — co může agent dělat (jdi nahoru / dolů / vlevo / vpravo). Případně $\mathcal{A}(s)$ = akce dostupné ve stavu $s$.
- **Přechodová pravděpodobnost** $P(s' \mid s, a)$ — s jakou pravděpodobností skončím ve stavu $s'$, když ve stavu $s$ provedu akci $a$. Prostředí může být **stochastické**: robot chce jít nahoru, ale s pravděpodobností 10 % uklouzne doleva.
- **Odměna** $R(s, a, s')$ — skalární číslo, které agent dostane za přechod. Třeba +10 za dosažení cíle, −1 za každý krok (ať se snaží být rychlý), −100 za pád do propasti.
- **Diskontní faktor** $\gamma \in [0, 1)$ — o kolik si ceníme budoucích odměn méně než těch okamžitých.

### Markovská vlastnost — proč „Markovský"

Klíčový předpoklad, podle kterého je celý model pojmenován: **budoucnost závisí jen na současném stavu, ne na celé historii**. Formálně:

::: math
P(s_{t+1} \mid s_t, a_t, s_{t-1}, a_{t-1}, \dots, s_0) = P(s_{t+1} \mid s_t, a_t)
:::

Slovy: stačí mi vědět, *kde jsem teď* a *co udělám* — nemusím si pamatovat, jak jsem se sem dostal. Díky tomu si agent nemusí pamatovat historii a rozhodování se dramaticky zjednoduší. Pokud reálné prostředí markovské *není* (např. jeden snímek z hry neprozradí rychlost míčku), kompenzujeme to návrhem stavu (spojíme několik posledních snímků dohromady).

### K čemu je diskont γ

Cílem agenta je maximalizovat **kumulativní odměnu**, tzv. *return* $G_t$ — součet všech budoucích odměn, ale ty vzdálenější vážíme méně:

::: math
G_t = r_{t+1} + \gamma\, r_{t+2} + \gamma^2 r_{t+3} + \dots = \sum_{k=0}^{\infty} \gamma^k\, r_{t+k+1}
:::

Dva důvody pro $\gamma < 1$. Za prvé **matematický**: pro nekonečné úlohy by součet nekonečně mnoha odměn mohl být nekonečný; násobení $\gamma^k$ ho udrží konečný. Za druhé **intuitivní**: odměna teď je cennější než stejná odměna za sto kroků (jako úroková sazba). Malé $\gamma$ (např. 0,5) → agent je „krátkozraký" a žene se za okamžitým ziskem; $\gamma$ blízko 1 (např. 0,99) → agent plánuje dlouhodobě.

## Politika π — strategie agenta

**Politika** $\pi$ je předpis, *jakou akci zvolit v jakém stavu* — to je vlastně „mozek" agenta. Může být:

- **deterministická** — $a = \pi(s)$, každému stavu přiřadí jednu akci,
- **stochastická** — $\pi(a \mid s)$, rozdělení pravděpodobnosti nad akcemi (např. „70 % nahoru, 30 % vpravo").

Cílem RL je najít **optimální politiku** $\pi^*$, která maximalizuje očekávaný return. Abychom poznali, která politika je lepší, potřebujeme politiky umět *ohodnotit* — k tomu slouží hodnotové funkce.

## Hodnotová funkce V a Q

Jak poznám, že je nějaký stav „dobrý"? Dobrý je tehdy, když se z něj dá nasbírat hodně odměn. To měří **hodnotová funkce**.

**Stavová hodnota** $V^\pi(s)$ = očekávaný return, když začnu ve stavu $s$ a dále se řídím politikou $\pi$:

::: math
V^\pi(s) = \mathbb{E}_\pi\!\left[\, G_t \mid s_t = s \,\right]
:::

**Akční hodnota** $Q^\pi(s, a)$ = očekávaný return, když ve stavu $s$ provedu **konkrétně akci $a$** a teprve *pak* se řídím $\pi$:

::: math
Q^\pi(s, a) = \mathbb{E}_\pi\!\left[\, G_t \mid s_t = s,\, a_t = a \,\right]
:::

Rozdíl je drobný, ale praktický: $V$ říká „jak dobré je tady být", $Q$ říká „jak dobré je tady udělat tuhle akci". $Q$ je proto šikovnější — pokud znám $Q^*$, optimální akci dostanu prostým výběrem té nejlepší: $\pi^*(s) = \arg\max_a Q^*(s, a)$, bez znalosti přechodového modelu. (U $V$ bych musel ještě umět dopočítat, kam mě která akce zavede.)

## Bellmanovy rovnice

Hodnotu nemusíme počítat sčítáním nekonečné řady. Stačí jeden trik: **hodnota stavu = okamžitá odměna + diskontovaná hodnota toho, kam se dostanu**. Tomuhle rekurzivnímu rozkladu se říká **Bellmanova rovnice** a je základem skoro všech RL algoritmů.

Pro danou politiku $\pi$ (Bellmanova *evaluační* rovnice):

::: math
V^\pi(s) = \sum_{a} \pi(a \mid s) \sum_{s'} P(s' \mid s, a)\,\big[\, R(s, a, s') + \gamma\, V^\pi(s') \,\big]
:::

Pro **optimální** politiku, kde v každém stavu volíme nejlepší akci (Bellmanova *optimalitní* rovnice):

::: math
V^*(s) = \max_{a} \sum_{s'} P(s' \mid s, a)\,\big[\, R(s, a, s') + \gamma\, V^*(s') \,\big]
:::

::: math
Q^*(s, a) = \sum_{s'} P(s' \mid s, a)\,\big[\, R(s, a, s') + \gamma\, \max_{a'} Q^*(s', a') \,\big]
:::

Vnitřní `max` znamená „předpokládám, že dál už budu hrát optimálně". Tyhle rovnice jsou *podmínkou*, kterou optimální hodnoty splňují — a zároveň návodem, jak je iterativně dopočítat.

## Value iteration a policy iteration

Pokud MDP **známe celé** (víme $P$ i $R$), umíme optimální politiku spočítat přesně metodami **dynamického programování**. Dva klasické algoritmy:

**Value iteration** — opakovaně aplikuji Bellmanovu optimalitní rovnici jako přiřazení (tzv. Bellmanův *backup*), dokud se hodnoty neustálí:

::: math
V_{k+1}(s) \leftarrow \max_{a} \sum_{s'} P(s' \mid s, a)\,\big[\, R(s, a, s') + \gamma\, V_k(s') \,\big]
:::

Začnu třeba s $V_0(s) = 0$ pro všechny stavy a iteruji. Hodnoty se postupně „rozlévají" od cílového stavu do okolí. Po konvergenci z $V^*$ odečtu greedy politiku $\pi^*(s) = \arg\max_a \dots$. Garantovaně konverguje, protože Bellmanův operátor je *kontrakce* s faktorem $\gamma$ (každý krok zmenší chybu alespoň $\gamma$-krát).

**Policy iteration** — střídá dva kroky:
1. **Policy evaluation** — pro současnou politiku $\pi$ dopočítám $V^\pi$ (řeším Bellmanovu evaluační rovnici).
2. **Policy improvement** — v každém stavu přepnu na akci, která vypadá podle $V^\pi$ nejlépe: $\pi'(s) = \arg\max_a \sum_{s'} P[R + \gamma V^\pi(s')]$.

Opakuji, dokud se politika přestane měnit. Policy iteration typicky potřebuje **méně iterací** než value iteration (politika se stabilizuje dřív než hodnoty), ale každá iterace je dražší (uvnitř plné vyhodnocení politiky).

Na následující vizualizaci sleduj, jak value iteration „prosvětluje" gridworld: každým krokem se hodnoty $V$ šíří od cíle a šipky greedy politiky postupně ukazují správný směr.

::: viz mdp-gridworld "Krokuj value iteration v gridworldu: buňky se obarvují podle hodnoty V, šipky ukazují greedy politiku. Sleduj, jak hodnota teče od cíle a politika konverguje. Přepni stochastiku prostředí a γ."
:::

::: quiz "K čemu slouží diskontní faktor γ v MDP?"
- [ ] Určuje, jak rychle se agent pohybuje v prostředí
- [x] Váží budoucí odměny méně než okamžité a zaručuje konečnost součtu odměn
  > Return $G_t = \sum_k \gamma^k r_{t+k+1}$; pro $\gamma<1$ je geometrická řada konečná i pro nekonečný horizont a vzdálenější odměny mají menší váhu (preference okamžitého zisku).
- [ ] Je to pravděpodobnost, že prostředí přejde do nového stavu
  > To je přechodová pravděpodobnost $P(s'\mid s,a)$, ne $\gamma$.
- [ ] Udává learning rate při učení hodnotové funkce
  > Learning rate (α) se objevuje až u učení bez modelu (Q-learning), ne v definici MDP.
:::

::: link "Sutton & Barto — Reinforcement Learning: An Introduction (2nd ed.), kap. 3–4" "http://incompleteideas.net/book/the-book-2nd.html"
:::

::: link "Bellman, R.: A Markovian Decision Process (1957)" "https://www.jstor.org/stable/24900506"
:::

---

*Zdroj: KNN státnicové okruhy NMAL, VUT FIT. Externí reference: Sutton, R. S., Barto, A. G.: „Reinforcement Learning — An Introduction" (MIT Press, 2nd ed. 2018, [free PDF](http://incompleteideas.net/book/the-book-2nd.html)) — kap. 3–4 (MDP, Bellman, DP); Bellman, R.: „A Markovian Decision Process" (1957) — původní formulace MDP; Russell, S., Norvig, P.: „Artificial Intelligence: A Modern Approach" (4. vyd., 2020) — kap. 17.*
