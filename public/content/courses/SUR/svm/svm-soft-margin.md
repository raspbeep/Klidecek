---
title: Měkký margin (neseparabilní data)
---

# Měkký margin (neseparabilní data)

Hard margin z předchozí části má jeden zásadní háček: vyžaduje, aby data byla **dokonale lineárně oddělitelná**. V praxi to skoro nikdy neplatí — třídy se kvůli šumu nebo přirozenému překryvu prolínají. Jediný "zatoulaný" bod uprostřed druhé třídy pak hard-margin úlohu **úplně rozbije**: žádná nadrovina nesplní všechny podmínky a řešení neexistuje.

Řešení je nechat klasifikátor **trochu chybovat**. Místo neústupného "každý bod vně pásu" řekneme "většina bodů vně pásu, pár výjimek toleruji za pokutu". Tomu se říká **soft margin** (měkký margin).

## Slack proměnné: povolené porušení

Ke každému bodu $i$ přidáme **slack proměnnou** $\xi_i \ge 0$ (slack = "vůle, prověšení"). Ta měří, **jak moc** bod porušuje pravidlo marginu. Změkčíme jí podmínku:

::: math
y_i\!\left(\mathbf{w}^\top \mathbf{x}_i + b\right) \ge 1 - \xi_i, \qquad \xi_i \ge 0
:::

Význam jednotlivých hodnot $\xi_i$:

- $\xi_i = 0$ — bod je v pořádku, leží vně pásu (nebo přesně na okraji). Žádné porušení.
- $0 < \xi_i \le 1$ — bod je **uvnitř** pásu, ale pořád na **správné straně** nadroviny. Mírné provinění.
- $\xi_i > 1$ — bod je už za nadrovinou, tedy **špatně klasifikovaný**.

## Hyperparametr C: kompromis margin vs. chyby

Kdybychom slack nechali zadarmo, model by si nastavil $\xi_i$ obrovské a podmínky by neznamenaly nic. Proto za součet porušení **platíme pokutu** v účelové funkci, řízenou konstantou $C > 0$:

::: math
\min_{\mathbf{w},\,b,\,\boldsymbol{\xi}} \ \underbrace{\tfrac{1}{2}\|\mathbf{w}\|^2}_{\text{široký margin}} + \ C \underbrace{\sum_{i=1}^{N} \xi_i}_{\text{cena za chyby}} \qquad \text{za podmínek} \quad y_i(\mathbf{w}^\top\mathbf{x}_i + b) \ge 1 - \xi_i,\ \ \xi_i \ge 0
:::

Účelová funkce teď přetahuje dvě protichůdná přání. První člen chce **široký margin** (malé $\|\mathbf{w}\|$), druhý chce **málo porušení**. $C$ je váha, která říká, čemu dáme přednost:

- **Velké $C$** — chyby jsou drahé, model se je snaží za každou cenu eliminovat. Výsledek: **úzký margin**, hranice se ohýbá kvůli každému bodu, **riziko přeučení** (overfitting). V limitě $C \to \infty$ se vrátíme k hard marginu.
- **Malé $C$** — chyby jsou levné, model je raději toleruje výměnou za hezky **široký margin**. Výsledek: jednodušší, hladší hranice, **lepší zobecnění** (silnější regularizace), ale víc tolerovaných porušení.

::: viz svm-soft-margin "Dvě překrývající se třídy. Táhni slider C: při malém C se pás rozšíří a model toleruje víc bodů uvnitř (zvýrazněná porušení), při velkém C se pás zúží a model se snaží porušení potlačit. Sleduj odečet počtu porušení a šířky marginu."
:::

::: svg
<svg viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="280" height="150" fill="var(--bg-inset)"/>
  <!-- separating line -->
  <line x1="40" y1="20" x2="160" y2="140" stroke="var(--accent)" stroke-width="1.5"/>
  <!-- margin edges -->
  <line x1="65" y1="10" x2="185" y2="130" stroke="var(--accent-line)" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="15" y1="30" x2="135" y2="150" stroke="var(--accent-line)" stroke-width="1" stroke-dasharray="3 3"/>
  <!-- correct + class points (right side) -->
  <circle cx="210" cy="40" r="5" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.2"/>
  <circle cx="225" cy="80" r="5" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.2"/>
  <circle cx="200" cy="110" r="5" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1.2"/>
  <!-- correct - class points (left side) -->
  <circle cx="40" cy="70" r="5" fill="var(--text-muted)"/>
  <circle cx="55" cy="115" r="5" fill="var(--text-muted)"/>
  <circle cx="30" cy="105" r="5" fill="var(--text-muted)"/>
  <!-- a + point inside the band but correct side -->
  <circle cx="150" cy="55" r="5" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
  <text x="156" y="48" font-size="8" fill="var(--accent)">0&lt;ξ≤1</text>
  <!-- a misclassified - point on the + side -->
  <circle cx="175" cy="95" r="5" fill="var(--text-muted)" stroke="var(--accent)" stroke-width="2"/>
  <text x="181" y="90" font-size="8" fill="var(--accent)">ξ&gt;1</text>
  <text x="8" y="143" font-size="8" fill="var(--text-faint)">plná = nadrovina · čárkovaná = okraje pásu (margin)</text>
</svg>
:::

## Hinge ztráta: jiný pohled na totéž

Soft-margin úlohu lze přepsat **bez** explicitních slack proměnných — jako klasickou minimalizaci "ztráta + regularizace". Z podmínek totiž plyne, že optimální slack je $\xi_i = \max(0,\, 1 - y_i(\mathbf{w}^\top\mathbf{x}_i+b))$. To je přesně **hinge ztráta** (hinge = pant, kvůli zalomenému tvaru):

::: math
\min_{\mathbf{w},\,b} \ \underbrace{\tfrac{1}{2}\|\mathbf{w}\|^2}_{\text{regularizace}} \ + \ C \sum_{i=1}^{N} \underbrace{\max\!\big(0,\ 1 - y_i(\mathbf{w}^\top\mathbf{x}_i + b)\big)}_{\text{hinge ztráta bodu } i}
:::

Označme **margin bodu** jako $m = y_i(\mathbf{w}^\top\mathbf{x}_i+b)$ — kladné $m$ znamená správně klasifikovaný bod. Hinge ztráta $\max(0, 1-m)$ se chová takto:

- $m \ge 1$ — bod je správně a vně pásu → ztráta **0**. Body daleko od hranice už klasifikátor nijak netáhnou (tady je rozdíl proti logistické regresi, která penalizuje pořád).
- $m < 1$ — ztráta roste **lineárně** se zhoršující se pozicí; pro špatně klasifikovaný bod ($m<0$) je ztráta velká.

Tenhle pohled odhalí, že SVM je vlastně **lineární model trénovaný na hinge ztrátu s L2 regularizací**. Člen $\tfrac12\|\mathbf{w}\|^2$ je standardní L2 (weight decay), který tlačí na jednoduchost; $C$ je převrácená síla regularizace ($C$ velké = slabá regularizace).

::: svg
<svg viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="280" height="150" fill="var(--bg-inset)"/>
  <!-- axes -->
  <line x1="30" y1="120" x2="265" y2="120" stroke="var(--line-strong)" stroke-width="0.6"/>
  <line x1="155" y1="15" x2="155" y2="125" stroke="var(--line-strong)" stroke-width="0.6"/>
  <!-- hinge: max(0,1-m). zero for m>=1 (m=1 at x=205), linear rising to the left -->
  <line x1="205" y1="120" x2="265" y2="120" stroke="var(--accent)" stroke-width="1.8"/>
  <line x1="205" y1="120" x2="35" y2="35" stroke="var(--accent)" stroke-width="1.8"/>
  <!-- m=1 marker -->
  <line x1="205" y1="118" x2="205" y2="124" stroke="var(--text-muted)" stroke-width="0.8"/>
  <text x="205" y="135" font-size="8" fill="var(--text-muted)" text-anchor="middle">m=1</text>
  <!-- m=0 marker -->
  <text x="155" y="135" font-size="8" fill="var(--text-muted)" text-anchor="middle">m=0</text>
  <text x="262" y="115" font-size="8.5" fill="var(--text-faint)" text-anchor="end">margin m = y·(wᵀx+b) →</text>
  <text x="34" y="28" font-size="8.5" fill="var(--text-faint)">ztráta</text>
  <text x="60" y="55" font-size="8" fill="var(--accent)">roste lineárně</text>
  <text x="215" y="112" font-size="8" fill="var(--accent)">= 0</text>
</svg>
:::

::: quiz "Trénuješ SVM a hranice se křiví kolem jednotlivých bodů — vypadá to na přeučení. Jak upravíš parametr C?"
- [ ] Zvýším C, aby model lépe potlačil chyby
  > Velké C chyby penalizuje ještě přísněji → margin se zúží a hranice se ohne ke každému bodu. Přeučení se zhorší.
- [x] Sním C, aby model toleroval víc porušení a měl širší (hladší) margin
  > Malé C = levné chyby = širší margin a silnější regularizace. Hranice se vyhladí a model líp generalizuje.
- [ ] C nechám a místo toho odeberu slack proměnné
  > Odebrání slacku vede k hard marginu, který u překrývajících se dat nemá řešení vůbec.
- [ ] Nastavím C = 0
  > Pak by margin neměl žádný protitlak a podmínky by ztratily smysl; $C$ musí být kladné.
:::

::: link "Cortes & Vapnik — Support-Vector Networks (1995)" "https://doi.org/10.1007/BF00994018"
:::

::: link "scikit-learn — RBF SVM parameters (C a gamma vizuálně)" "https://scikit-learn.org/stable/auto_examples/svm/plot_rbf_parameters.html"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Cortes, C., Vapnik, V.: „Support-Vector Networks" (Machine Learning, 1995, [doi:10.1007/BF00994018](https://doi.org/10.1007/BF00994018)); Bishop, C.M.: „Pattern Recognition and Machine Learning" (Springer 2006, [kap. 7](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)).*
