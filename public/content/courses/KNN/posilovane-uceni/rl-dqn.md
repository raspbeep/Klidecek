---
title: Posilované učení — Q-learning a DQN
---

# Posilované učení: Q-learning a DQN

V [[mdp]] jsme předpokládali, že **známe celé prostředí** — přechodové pravděpodobnosti $P$ i odměny $R$. Pak stačí value iteration. Jenže v praxi agent svět *nezná*: robot dopředu netuší, kam ho který krok pošle, ani kde je propast. Musí se to **naučit ze zkušenosti** — zkoušet akce, dívat se, co se stane, a podle toho upravovat svůj odhad.

Tomu se říká **model-free** posilované učení: učíme se přímo, *jak se chovat*, aniž bychom si stavěli model prostředí. Klasickým zástupcem je **Q-learning**.

## Q-learning — učení Q ze zkušenosti

Cílem je naučit se $Q(s, a)$ — jak dobrá je akce $a$ ve stavu $s$. Kdybychom znali $P$ a $R$, použili bychom Bellmanovu optimalitní rovnici. My ji ale neznáme, takže místo *průměrování přes pravděpodobnosti* použijeme **jeden konkrétní vzorek** z reálné interakce: agent ve stavu $s$ udělá akci $a$, prostředí mu vrátí odměnu $r$ a nový stav $s'$. Tahle jedna zkušenost $(s, a, r, s')$ nám dá *odhad* správné hodnoty.

**Pozor na časté nedorozumění:** $Q(s,a) = r + \gamma \max_{a'} Q(s', a')$ **není** updatovací pravidlo Q-learningu — to je *Bellmanova optimalitní rovnice* (cíl, kterého chceme dosáhnout). Skutečný Q-learning se k tomuto cíli postupně *přibližuje* pomocí learning rate $\alpha$.

Skutečné **updatovací pravidlo Q-learningu** (TD update, *temporal difference*) zní:

::: math
Q(s, a) \leftarrow Q(s, a) + \alpha\,\big[\, \underbrace{r + \gamma \max_{a'} Q(s', a')}_{\text{TD cíl}} - \underbrace{Q(s, a)}_{\text{starý odhad}} \,\big]
:::

Rozeber si to:
- výraz v hranatých závorkách je **TD chyba** $\delta$ — o kolik se starý odhad lišil od toho, co jsme reálně viděli,
- **learning rate** $\alpha \in (0, 1]$ říká, jak velký krok tím směrem uděláme. $\alpha = 1$ → starý odhad úplně přepíšu; malé $\alpha$ → odhady upravuji jen jemně (stabilnější, ale pomalejší).
- $\max_{a'} Q(s', a')$ je *bootstrapping*: budoucí hodnotu odhadnu vlastní (zatím nepřesnou) Q-tabulkou. To, že updatuju směrem k tomu nejlepšímu $\max$ (a ne k akci, kterou jsem reálně udělal), dělá z Q-learningu **off-policy** metodu — učí se hodnotu optimální politiky nezávisle na tom, jak právě prozkoumává.

Malý číselný příklad: ať $\alpha = 0{,}5$, $\gamma = 0{,}9$, starý $Q(s,a) = 2$. Udělám akci, dostanu $r = 1$ a v novém stavu je nejlepší $\max_{a'} Q(s', a') = 4$. TD cíl $= 1 + 0{,}9 \cdot 4 = 4{,}6$, TD chyba $= 4{,}6 - 2 = 2{,}6$, nový $Q = 2 + 0{,}5 \cdot 2{,}6 = 3{,}3$. Odhad se posunul nahoru, protože akce dopadla líp, než jsme čekali.

## Explorace vs. exploatace — ε-greedy

Když se agent učí $Q$ z vlastních akcí, vzniká dilema: **mám využít to, co už znám, nebo zkoušet nové?**

- **Exploatace** (exploitation) — zvolím akci s nejvyšším $Q$ (greedy), o které *věřím*, že je dobrá.
- **Explorace** (exploration) — zkusím *jinou* akci, abych objevil, jestli není ještě lepší.

Když budu jen exploatovat, uvíznu v první nalezené (možná podprůměrné) strategii — nikdy neobjevím lepší cestu, protože ji nevyzkouším. Když budu jen explorovat, učím se pomalu a nikdy nevyužiju, co už vím. Nejjednodušší kompromis je **ε-greedy**:

::: math
a = \begin{cases} \text{náhodná akce} & \text{s pravděpodobností } \varepsilon \\ \arg\max_a Q(s, a) & \text{s pravděpodobností } 1 - \varepsilon \end{cases}
:::

Typicky se $\varepsilon$ na začátku drží vysoké (hodně zkoušíme) a postupně **snižuje** (decay) — jak roste důvěra v $Q$, přecházíme k exploataci. Alternativou je **softmax / Boltzmann** výběr, kde je pravděpodobnost akce úměrná $\exp(Q(s,a)/T)$: lepší akce jsou pravděpodobnější, ale i horší dostanou šanci.

Na vizualizaci si projdi epizody Q-learningu v malém gridworldu: agent chodí ε-greedy, po každém kroku se provede TD update a Q-hodnoty (i nejlepší akce v buňkách) se postupně zpřesňují.

::: viz q-learning-grid "Krokuj epizody Q-learningu v gridworldu: agent jde ε-greedy, každý krok dělá TD update Q. Sleduj, jak se Q-hodnoty a šipky nejlepší akce zpřesňují. Měň ε, α, γ; reset začne znovu."
:::

## Proč neuronová síť: DQN

Q-learning v základní podobě drží $Q(s, a)$ jako **tabulku** — řádek pro každý stav, sloupec pro každou akci. To funguje, dokud je stavů málo. Jenže ve hře Atari je stavem obrázek z obrazovky: $84 \times 84$ pixelů a desítky odstínů → astronomicky mnoho stavů. Tabulka se nevejde do paměti a navíc by se každý stav musel navštívit zvlášť — žádné zobecnění.

Řešením je nahradit tabulku **neuronovou sítí** $Q_\theta(s, a)$ s parametry $\theta$, která $Q$ *aproximuje* a umí **generalizovat** na nikdy neviděné stavy. Tomu se říká **Deep Q-Network (DQN)** (Mnih et al., 2015) — síť dostane na vstup stav (u Atari surové pixely) a vrací $Q$-hodnoty pro všechny akce najednou. Trénuje se minimalizací kvadratické chyby mezi odhadem a TD cílem:

::: math
L(\theta) = \mathbb{E}\Big[\big(\, r + \gamma \max_{a'} Q_{\theta^-}(s', a') - Q_\theta(s, a) \,\big)^2 \Big]
:::

Naivní spojení Q-learningu a neuronky je ale **nestabilní** — trénink se rozjede nebo osciluje. DQN to opravuje dvěma triky:

- **Experience replay** — místo učení z každé zkušenosti hned (a okamžitého zahození) se přechody $(s, a, r, s')$ ukládají do **replay bufferu** a trénuje se z náhodně namíchaných minibatchů. To **rozbije korelaci** mezi po sobě jdoucími vzorky (sousední snímky hry jsou skoro stejné) a umožní zkušenost **použít víckrát** → vyšší sample efficiency.
- **Cílová síť (target network)** — TD cíl se počítá ze **zamrzlé kopie** sítě s parametry $\theta^-$, která se aktualizuje jen jednou za čas (zkopíruje se z hlavní sítě každých pár tisíc kroků). Bez ní bychom „honili pohyblivý cíl": měnili bychom odhad i cíl současně, což rozkolísá trénink.

Touhle kombinací DQN poprvé zvládl naučit se hrát desítky Atari her **na lidské úrovni přímo z pixelů**, jednou architekturou, bez ručních pravidel pro každou hru.

## Policy gradient — alternativa k učení Q

Q-learning a DQN se učí *hodnoty* a politiku z nich odvozují (`argmax`). **Policy gradient** metody jdou jinudy: parametrizují politiku $\pi_\theta(a \mid s)$ neuronovou sítí (vstup = stav, výstup = pravděpodobnosti akcí, jako u klasifikátoru) a **optimalizují ji přímo** gradientním vzestupem. Gradient očekávané odměny $J(\theta)$ má tvar:

::: math
\nabla_\theta J(\theta) = \mathbb{E}\big[\, \nabla_\theta \log \pi_\theta(a \mid s)\, \cdot\, R \,\big]
:::

Intuice: po epizodě se podívám, které akce vedly k vysoké odměně $R$, a **zvýším jejich pravděpodobnost**; u akcí s nízkou odměnou ji snížím. Je to jako *vážená klasifikace*, kde „třída" = provedená akce a „váha" = získaná odměna. Výhody: zvládají **spojité akce** a přirozeně stochastické chování; nevýhoda: gradient má **vysokou varianci** a nižší sample efficiency. Kombinací obou přístupů je **Actor-Critic** — *actor* (policy gradient) vybírá akce, *critic* (value/Q) je hodnotí a stabilizuje učení.

::: quiz "Proč DQN používá cílovou síť (target network) s parametry θ⁻?"
- [ ] Aby zmenšil počet parametrů, které je třeba trénovat
- [x] Aby byl TD cíl po určitou dobu stabilní a trénink „nehonil pohyblivý cíl"
  > Cíl $r + \gamma \max_{a'} Q_{\theta^-}(s',a')$ se počítá ze zamrzlé kopie sítě, aktualizované jen občas. Bez toho by se odhad i cíl měnily současně a trénink by se rozkolísal/divergoval.
- [ ] Aby agent prozkoumával víc nových stavů (explorace)
  > Exploraci řeší ε-greedy, ne target network.
- [ ] Aby nahradil potřebu experience replay
  > Replay buffer a target network jsou dva *nezávislé* stabilizační triky; DQN používá oba.
:::

::: link "Mnih et al. — Human-level control through deep RL (DQN, Nature 2015)" "https://www.nature.com/articles/nature14236"
:::

::: link "Watkins & Dayan — Q-learning (Machine Learning, 1992)" "https://link.springer.com/article/10.1007/BF00992698"
:::

::: link "Sutton & Barto — Reinforcement Learning: An Introduction (2nd ed.), kap. 6 (TD), 13 (policy gradient)" "http://incompleteideas.net/book/the-book-2nd.html"
:::

---

*Zdroj: KNN státnicové okruhy NMAL, VUT FIT. Externí reference: Mnih, V. et al.: „Human-level control through deep reinforcement learning" (Nature 518, 2015, [článek](https://www.nature.com/articles/nature14236)) — DQN, experience replay, target network; Watkins, C., Dayan, P.: „Q-learning" (Machine Learning 8, 1992, [článek](https://link.springer.com/article/10.1007/BF00992698)); Sutton, R. S., Barto, A. G.: „Reinforcement Learning — An Introduction" (MIT Press, 2nd ed. 2018, [free PDF](http://incompleteideas.net/book/the-book-2nd.html)).*
