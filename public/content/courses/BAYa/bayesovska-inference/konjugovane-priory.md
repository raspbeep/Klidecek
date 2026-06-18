---
title: Konjugované apriorní rozdělení
---

# Konjugované apriorní rozdělení

Vraťme se k jádru Bayese: posterior $\propto$ likelihood $\times$ prior. Problém je, že když vynásobíš dvě "náhodné" rozdělení, ten součin obvykle **nemá žádný standardní tvar** — a abys z něj udělal pořádný posterior, musel bys spočítat ošklivý normalizační integrál (evidenci) ve jmenovateli. To je často nemožné.

**Konjugovaný prior je trik, jak se tomu integrálu úplně vyhnout.** Vybereš prior z takové rodiny rozdělení, že po vynásobení likelihoodem vyjde posterior ze **stejné rodiny**. Žádný integrál se nepočítá; jen se chytře přepočítají parametry. Inference se tím zredukuje na školní aritmetiku.

## Definice konjugovanosti

Apriorní rozdělení $p(\theta)$ je **konjugované** k dané věrohodnostní funkci $p(X \mid \theta)$, pokud posterior $p(\theta \mid X)$ patří do **stejné parametrické rodiny** jako prior.

::: math
p(\theta) \in \mathcal{F} \quad\text{a}\quad p(X \mid \theta) \text{ daná} \;\Longrightarrow\; p(\theta \mid X) \in \mathcal{F}
:::

Příklad: pokud je prior $\mathrm{Beta}(\alpha, \beta)$ a likelihood je Bernoulliho/binomická, pak posterior je zase nějaká $\mathrm{Beta}(\alpha', \beta')$ — jen s jinými parametry. "Tvar zůstává, mění se jen čísla."

## Beta–Bernoulli/Binomial: vlajková loď

Tohle je nejdůležitější příklad ke zkoušce. Modelujeme minci s pravděpodobností líce $\theta \in [0,1]$. Prior nad $\theta$ je $\mathrm{Beta}(\alpha, \beta)$:

::: math
p(\theta) = \mathrm{Beta}(\theta \mid \alpha, \beta) \propto \theta^{\alpha-1}(1-\theta)^{\beta-1}
:::

Hodíme $n$-krát a uvidíme $s$ líců a $f = n - s$ rubů. Likelihood (Bernoulli/binomická) je:

::: math
p(X \mid \theta) \propto \theta^{s}(1-\theta)^{f}
:::

Vynásobíme prior $\times$ likelihood a — kouzlo konjugovanosti — exponenty se prostě **sečtou**:

::: math
p(\theta \mid X) \propto \theta^{\alpha-1}(1-\theta)^{\beta-1}\cdot \theta^{s}(1-\theta)^{f} = \theta^{(\alpha+s)-1}(1-\theta)^{(\beta+f)-1}
:::

A to je přesně jádro $\mathrm{Beta}(\alpha + s,\; \beta + f)$. Aktualizace je tedy triviální:

::: math
\boxed{\;\mathrm{Beta}(\alpha,\beta) \;\xrightarrow{\;s\text{ úspěchů},\;f\text{ neúspěchů}\;}\; \mathrm{Beta}(\alpha+s,\;\beta+f)\;}
:::

Hraj si s tím — posuň slidery prioru $(\alpha, \beta)$ a počet pozorovaných úspěchů/neúspěchů, a sleduj prior, likelihood a posterior na jednom plátně:

::: viz bayes-conjugate-beta "Slidery (α,β) nastaví Beta prior, slidery s/f přidají data. Posterior = Beta(α+s, β+f). Sleduj, jak likelihood táhne prior k poměru s/(s+f) a jak posterior leží mezi nimi."
:::

## Pseudopočty: prior jako "fiktivní data"

Parametry $\alpha$ a $\beta$ mají krásnou intuici: chovají se jako **pseudopočty (pseudocounts)** — jako kdybys před experimentem už "viděl" $\alpha - 1$ úspěchů a $\beta - 1$ neúspěchů. Posterior pak prostě přičte skutečné počty.

To krásně vysvětluje, proč posteriorní střední hodnota je **vážený průměr** prioru a dat. Pro $\mathrm{Beta}(\alpha+s, \beta+f)$ je střední hodnota:

::: math
\mathbb{E}[\theta \mid X] = \frac{\alpha + s}{\alpha + \beta + s + f} = \frac{\alpha+\beta}{\alpha+\beta+n}\cdot\underbrace{\frac{\alpha}{\alpha+\beta}}_{\text{prior. průměr}} + \frac{n}{\alpha+\beta+n}\cdot\underbrace{\frac{s}{n}}_{\text{MLE}}
:::

kde $n = s + f$. Když je dat málo ($n \ll \alpha+\beta$), dominuje prior. Když je dat hodně ($n \gg \alpha+\beta$), výraz konverguje k MLE $s/n$ — prior "zmizí". To je přesně to asymptotické chování, které čekáme.

::: svg
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="320" height="150" fill="var(--bg-inset)"/>
  <text x="160" y="20" text-anchor="middle" font-size="10" fill="var(--text-muted)">posterior. průměr = vážený průměr</text>
  <line x1="40" y1="70" x2="280" y2="70" stroke="var(--line-strong)" stroke-width="1"/>
  <circle cx="40" cy="70" r="5" fill="var(--text-muted)"/>
  <text x="40" y="95" text-anchor="middle" font-size="9" fill="var(--text-muted)">prior α/(α+β)</text>
  <circle cx="280" cy="70" r="5" fill="var(--accent-line)"/>
  <text x="280" y="95" text-anchor="middle" font-size="9" fill="var(--accent-line)">MLE s/n</text>
  <circle cx="160" cy="70" r="6" fill="var(--accent)"/>
  <text x="160" y="110" text-anchor="middle" font-size="9" fill="var(--accent)">E[θ|X]</text>
  <text x="100" y="60" text-anchor="middle" font-size="8" fill="var(--text-faint)">málo dat ←</text>
  <text x="220" y="60" text-anchor="middle" font-size="8" fill="var(--text-faint)">→ hodně dat</text>
  <text x="160" y="135" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">víc dat → posterior klouže k MLE, prior mizí</text>
</svg>
:::

## Další konjugované dvojice

Stejný princip funguje i jinde. K zapamatování ke zkoušce:

| Prior | Likelihood (data) | Posterior | Typický příklad |
|---|---|---|---|
| **Beta** | Bernoulli / binomická | Beta | hod mincí (2 výsledky) |
| **Dirichlet** | multinomická / kategorická | Dirichlet | hod kostkou (K výsledků) |
| **Gauss** | Gauss (známý rozptyl) | Gauss | odhad střední hodnoty |
| **Gamma** | Poisson | Gamma | počty událostí za čas |
| **Normal-Inverse-Gamma** | Gauss (neznámá $\mu$ i $\sigma^2$) | Normal-Inverse-Gamma | spojitá data, neznámý šum |

Dvě upřesnění, kde bývají chyby:

- **Dirichlet** je vícerozměrné zobecnění Bety. Beta dává rozdělení nad jednou pravděpodobností $\theta$; Dirichlet dává rozdělení nad celým vektorem pravděpodobností $(\theta_1, \dots, \theta_K)$, který se sčítá do 1. Jeho pseudopočty $(\alpha_1, \dots, \alpha_K)$ jsou jako "fiktivní počty zastoupení tříd".
- **Gauss–Gauss** platí jen pro **známý rozptyl** (neznámou střední hodnotu). Když je neznámý i rozptyl, správný konjugovaný prior je **Normal-Inverse-Gamma** (nebo ekvivalentně Normal-Gamma, parametrizuje-li se přesností $1/\sigma^2$), ne čistý Gauss. Tahle nuance je častý zdroj chyb — zdroje, které píšou jen "Gauss → Gauss", mlčky předpokládají známý rozptyl.

## Co když konjugovaný prior nejde použít

Konjugovanost je pohodlí, ne nutnost. Pokud tvoje apriorní znalost neodpovídá žádné konjugované rodině, nebo model nemá konjugovaný tvar, vrátíš se k obecnému (drahému) integrálu evidence. Pak nezbývá než **aproximovat posterior**:

- **MCMC** (Markov Chain Monte Carlo, např. Gibbsovo nebo Metropolisovo-Hastingsovo vzorkování) — z posterioru vzorkuje, místo aby ho počítal analyticky.
- **Variační inference (Variational Bayes)** — nahradí pravý posterior nejbližším členem nějaké jednodušší rodiny rozdělení a převede inferenci na optimalizaci.

::: quiz "Proč jsou konjugované priory v praxi tak oblíbené?"
- [ ] Protože dávají vždy přesnější predikce než nekonjugované priory
  > Ne. Přesnost závisí na tom, jak dobře prior odpovídá realitě, ne na konjugovanosti. Konjugovanost je o výpočetní pohodlnosti.
- [x] Protože posterior vyjde ze stejné rodiny jako prior, takže se nemusí počítat těžký normalizační integrál — stačí přepočítat parametry
  > Přesně. Aktualizace se redukuje na sčítání pseudopočtů / posun parametrů; integrál evidence odpadá a inference je analytická.
- [ ] Protože odstraňují potřebu prioru úplně
  > Ne, konjugovaný prior je pořád plnohodnotný prior; jen je vybraný tak, aby s likelihoodem hezky "zapadl".
- [ ] Protože garantují, že prior nemá na výsledek žádný vliv
  > Ne — prior vliv má (jako pseudopočty); ten vliv jen s rostoucím počtem dat slábne.
:::

::: link "Conjugate prior — Wikipedia (přehledová tabulka dvojic)" "https://en.wikipedia.org/wiki/Conjugate_prior"
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 2.1–2.3)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: BAYa státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [PDF](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)), kap. 2; Murphy, K. P.: „Conjugate Bayesian analysis of the Gaussian distribution" (2007, [PDF](https://www.cs.ubc.ca/~murphyk/Papers/bayesGauss.pdf)); [Conjugate prior — Wikipedia](https://en.wikipedia.org/wiki/Conjugate_prior).*
