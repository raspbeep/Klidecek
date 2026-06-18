---
title: Bayesův teorém a aktualizace přesvědčení
---

# Bayesův teorém a aktualizace přesvědčení

Představ si, že chceš zjistit, jak je mince "férová" — jaká je pravděpodobnost $\theta$, že padne líc. Klasický (frekventistický) statistik řekne: $\theta$ je sice neznámé, ale je to **pevné číslo**; já ho odhadnu z dat (třeba poměrem líců). Bayesián řekne něco jiného: $\theta$ **sám o sobě neznám, takže ho popíšu rozdělením pravděpodobnosti** — křivkou, která říká, kterým hodnotám $\theta$ věřím víc a kterým míň.

To je celé jádro bayesovského přístupu. **Pravděpodobnost vyjadřuje míru našeho přesvědčení**, ne jen "limitní četnost při nekonečném opakování". A protože parametr je pro nás náhodná veličina, můžeme korektně pracovat s tím, jak moc si jsme jistí — a to jak před viděním dat, tak po něm.

## Bayesův vzorec: čtyři jména, jedna rovnice

Mějme pozorovaná data $X = \{x_1, \dots, x_N\}$ a neznámé parametry modelu $\theta$. Bayesův teorém (jen přepsané pravidlo pro podmíněnou pravděpodobnost) říká:

::: math
\underbrace{p(\theta \mid X)}_{\text{posterior}} = \frac{\overbrace{p(X \mid \theta)}^{\text{likelihood}}\;\overbrace{p(\theta)}^{\text{prior}}}{\underbrace{p(X)}_{\text{evidence}}}
:::

Každý ze čtyř kusů má svoje jméno a hlavně svůj **význam**:

- **Prior** $p(\theta)$ — apriorní rozdělení. Co si o parametru myslíme **předtím**, než vidíme jakákoli data. Třeba "u nové mince čekám, že bude zhruba férová, ale nejsem si jistý".
- **Likelihood (věrohodnost)** $p(X \mid \theta)$ — jak dobře konkrétní hodnota $\theta$ **vysvětluje** pozorovaná data. Pozor: bereme ji jako **funkci $\theta$** při fixních datech $X$, ne jako rozdělení dat. (Proto se nesčítá do jedničky přes $\theta$ — není to hustota v $\theta$.)
- **Posterior** $p(\theta \mid X)$ — apriorní přesvědčení **aktualizované daty**. To, co o parametru víme **potom**.
- **Evidence** $p(X)$ — tzv. marginální věrohodnost. Číslo ve jmenovateli, které celý zlomek normalizuje, aby se posterior integroval do 1.

## Proč se vzorec píše s ∝ (úměrně)

Jmenovatel $p(X)$ **nezávisí na $\theta$** — je to jen konstanta. Proto se Bayes často píše zkráceně:

::: math
p(\theta \mid X) \;\propto\; p(X \mid \theta)\,p(\theta)
:::

Slovy: **posterior ∝ likelihood × prior**. Tvar posterioru (kde má vrchol, jak je široký) určuje *jen* součin likelihoodu a prioru. Jmenovatel jen dorovná plochu na 1. To je užitečné, protože ten součin se počítá snadno, kdežto $p(X)$ může být peklo (viz dál).

Evidence je přitom integrál přes všechny možné parametry:

::: math
p(X) = \int p(X \mid \theta)\,p(\theta)\,\mathrm{d}\theta
:::

Pro spojité parametry je to integrál, pro diskrétní suma. U modelů s tisíci až miliony parametrů (neuronové sítě) je tenhle vícerozměrný integrál typicky **analyticky neřešitelný** a numericky drahý ("prokletí dimenzionality"). To je hlavní praktická komplikace bayesovské inference a důvod, proč existují aproximace jako MCMC nebo variační inference.

## Aktualizace přesvědčení daty

Nejlepší způsob, jak Bayese chápat, je jako **sekvenční učení**. Začneš s priorem. Přijde první pozorování, vynásobíš priorem likelihood toho pozorování → dostaneš posterior. Ten posterior se stane **novým priorem** pro další pozorování. A tak dál:

::: math
\text{prior} \xrightarrow{\;x_1\;} \text{posterior}_1 \xrightarrow{\;x_2\;} \text{posterior}_2 \xrightarrow{\;x_3\;} \cdots
:::

S každým datovým bodem se křivka přesvědčení **zužuje** (jsme si jistější) a **posouvá** k hodnotě, kterou data podporují. Vyzkoušej si to — házej mincí a sleduj, jak se Beta posterior nad $p$ (= pravděpodobnost líce) mění s každým hodem:

::: viz bayes-coin-update "Klikej +líc / +rub a sleduj, jak se posterior Beta(α,β) nad p posouvá a zužuje. Málo hodů → široká nejistá křivka; hodně hodů → úzký pík kolem skutečného poměru."
:::

Všimni si dvou věcí. Za prvé, **pořadí dat nehraje roli** — 3 líce a 2 ruby dají stejný posterior, ať je házíš v jakémkoli pořadí (násobení je komutativní). Za druhé, **prior má největší vliv na začátku**; s rostoucím počtem dat ho likelihood postupně "přehluší".

## Bayes vs. MLE vs. MAP

V čem se bayesovský přístup liší od dvou běžných bodových odhadů? Klíčový rozdíl: MLE a MAP vyplivnou **jediné číslo** $\hat\theta$, kdežto plný Bayes ti dá **celé rozdělení** $p(\theta \mid X)$.

- **MLE (Maximum Likelihood Estimation)** — vezme jen likelihood, prior ignoruje:
  ::: math
  \hat\theta_{\mathrm{MLE}} = \arg\max_\theta\; p(X \mid \theta)
  :::
  Pro minci: $\hat\theta_{\mathrm{MLE}} = s/n$ (poměr líců). Po jednom hodu, který padl líc, dá MLE odhad $\theta = 1$ — "mince padá vždy líc". To je očividně přehnané, a právě tady prior pomáhá.

- **MAP (Maximum A Posteriori)** — najde **vrchol (modus) posterioru**, takže prior už zohledňuje:
  ::: math
  \hat\theta_{\mathrm{MAP}} = \arg\max_\theta\; p(\theta \mid X) = \arg\max_\theta\; p(X \mid \theta)\,p(\theta)
  :::
  MAP je jakoby "MLE s regularizací priorem". Pokud je prior plochý (uniformní), pak $\hat\theta_{\mathrm{MAP}} = \hat\theta_{\mathrm{MLE}}$.

- **Plný Bayes** — nevybírá jeden bod, **podrží celý posterior** a do predikcí promítne nejistotu (o tom je posteriorní prediktivní rozdělení v dalším podtématu).

::: svg
<svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="320" height="170" fill="var(--bg-inset)"/>
  <line x1="30" y1="135" x2="300" y2="135" stroke="var(--line-strong)" stroke-width="0.7"/>
  <line x1="30" y1="20" x2="30" y2="135" stroke="var(--line-strong)" stroke-width="0.7"/>
  <text x="300" y="150" text-anchor="end" font-size="9" fill="var(--text-faint)">θ →</text>
  <path d="M30 135 Q60 130 90 118 Q130 100 165 50 Q200 100 240 122 Q270 131 300 134" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <line x1="165" y1="50" x2="165" y2="135" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3"/>
  <circle cx="165" cy="50" r="3" fill="var(--accent)"/>
  <text x="165" y="42" text-anchor="middle" font-size="9" fill="var(--accent)">MAP = modus</text>
  <line x1="195" y1="20" x2="195" y2="135" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="2 2"/>
  <text x="200" y="30" font-size="9" fill="var(--text-muted)">stř. hodnota</text>
  <text x="36" y="32" font-size="9" fill="var(--text-faint)">p(θ|X)</text>
  <text x="36" y="128" font-size="8.5" fill="var(--text-faint)">posterior</text>
</svg>
:::

Schéma: MAP je *vrchol* posterioru, kdežto střední hodnota (těžiště plochy) může ležet jinde, je-li posterior nesymetrický. Plný Bayes nepoužije ani jeden bod — podrží celou křivku.

::: quiz "Co přesně je likelihood $p(X \mid \theta)$ v Bayesově vzorci?"
- [ ] Rozdělení pravděpodobnosti přes $\theta$, které se integruje do 1
  > Ne. Likelihood se bere jako funkce $\theta$ při fixních datech, ale NENÍ to hustota v $\theta$ — přes $\theta$ se obecně neintegruje do 1.
- [x] Funkce parametrů $\theta$ (při fixních datech $X$), která říká, jak dobře dané $\theta$ vysvětluje pozorovaná data
  > Přesně. Data $X$ jsou fixní, $\theta$ se mění; hodnota říká pravděpodobnost, že právě toto $\theta$ vygeneruje pozorovaná data.
- [ ] Pravděpodobnost parametrů po zohlednění dat
  > To je posterior $p(\theta \mid X)$, ne likelihood.
- [ ] Normalizační konstanta zajišťující součet do 1
  > To je evidence $p(X)$ ve jmenovateli.
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 2–3)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Murphy — Probabilistic Machine Learning: Advanced Topics" "https://probml.github.io/pml-book/book2.html"
:::

---

*Zdroj: BAYa státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [PDF](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)), kap. 2–3; Murphy, K. P.: „Probabilistic Machine Learning: Advanced Topics" (MIT Press 2023, [probml.github.io](https://probml.github.io/pml-book/book2.html)).*
