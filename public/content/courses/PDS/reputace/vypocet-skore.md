---
title: Výpočet reputačního skóre — modely
---

# Výpočet reputačního skóre

Architektura ([[architektura-reputace]]) říká, *kdo* hodnotí; tato sekce říká, *jak* se z hodnocení spočítá číslo. Existuje několik tříd modelů — od triviálního součtu po pravděpodobnostní rozdělení a algoritmy nad grafem.

## 1. Součet hodnocení

Nejjednodušší model: skóre = počet pozitivních minus počet negativních reakcí. Tak fungoval **eBay Feedback Forum**:

::: math
R = \sum_i \text{positive\_score}_i - \sum_j \text{negative\_score}_j
:::

Problém je v tom, že součet *ztrácí informaci o objemu a poměru*. Co je lepší — prodejce se 100 kladnými a 10 zápornými reakcemi (R = 90), nebo prodejce s 90 kladnými a 0 zápornými (R = 90)? Oba mají stejné R, ale velmi rozdílnou *kvalitu a riziko*.

::: quiz "Prodejce A má 100 kladných a 10 záporných hodnocení (R = 90). Prodejce B má 90 kladných a 0 záporných (R = 90). Co je problém prostého součtu?"
- [x] Obě skóre jsou stejná (90), ačkoli profily představují různé riziko a různý objem důkazů.
  > Přesně — součet smaže poměr i objem. B nemá jediné negativní hodnocení, A jich má 10; přesto R = R.
- [ ] Prodejce B je jednoznačně horší, protože má méně hodnocení celkem.
  > Méně hodnocení neznamená horší prodejce — znamená *méně jistoty*. To je důvod pro pravděpodobnostní modely (Beta), ne pro odsouzení B.
- [ ] Součet je vždy špatně, protože neumí záporná čísla.
  > Součet záporná čísla umí (odečítá negativa). Problém je ztráta poměru a objemu, ne znaménka.
:::

## 2. Průměr hodnocení

Místo součtu se počítá **průměr** na pevné škále. Tak hodnotí spokojenost např. **Amazon** (škála **1–5 hvězd**). Průměr řeší poměr (5× pětihvězda vyjde lépe než 5× pětihvězda + 5× jednohvězda), ale stále neřeší *objem* — jedno pětihvězdičkové hodnocení dá průměr 5,0 stejně jako tisíc hodnocení.

## 3. Bayesovské / Beta systémy

Bayesovské systémy řeší objem i nejistotu *staticky korektně*. Vstupem je **binární hodnocení** (pozitivní / negativní) a reputační skóre se počítá pomocí **rozdělení pravděpodobnosti Beta**.

### Rozdělení pravděpodobnosti Beta

Beta je spojité rozdělení na intervalu [0, 1], které vyjadřuje *rozdělení pravděpodobnosti budoucí události* — tedy „jak je pravděpodobné, že příští interakce bude pozitivní". Hustota závisí na dvou parametrech α, β:

::: math
f(p \mid \alpha,\beta) = \frac{p^{\alpha-1}(1-p)^{\beta-1}}{B(\alpha,\beta)}, \quad B(\alpha,\beta) = \frac{\Gamma(\alpha)\,\Gamma(\beta)}{\Gamma(\alpha+\beta)}, \quad E(p) = \frac{\alpha}{\alpha+\beta}
:::

Beta je *spojitý protějšek* binomického rozdělení. Tam, kde binomické rozdělení popisuje *počet* úspěchů v *n* pokusech při známém *p*, Beta naopak popisuje **pravděpodobnost úspěchu *p*** na základě pozorovaných úspěchů a neúspěchů. Konkrétně:

> Mějme entitu s **r** pozitivními a **s** negativními zkušenostmi. Položíme **α = r + 1** a **β = s + 1**. Beta(α, β) je pak naše „mínění" o budoucím chování entity.

Pokud například proces A měl výstup *a* (pozitivní) 8× a výstup *ā* (negativní) 2×, dosadíme α = 9, β = 3 a z Beta rozdělení odečteme pravděpodobnost, že příští výstup bude pozitivní. Čím víc dat, tím *užší* (jistější) je distribuce.

::: viz pds-beta-reputation
:::

### Reputační funkce a normalizované skóre

Reputační funkce φ entity *T* (target) na základě zkušeností r_T pozitivních a s_T negativních je hustota Beta s parametry (r_T + 1, s_T + 1):

::: math
\varphi(p \mid r_T, s_T) = \frac{\Gamma(r_T + s_T + 2)}{\Gamma(r_T + 1)\,\Gamma(s_T + 1)}\; p^{\,r_T}(1-p)^{\,s_T}
:::

Reputační skóre **Rep** je *normalizovaná střední hodnota* tohoto rozdělení, posunutá do intervalu [−1, 1]:

::: math
\text{Rep}(r_T, s_T) = \big(E(\varphi(p \mid r_T, s_T)) - 0{,}5\big)\cdot 2 = \frac{r_T - s_T}{r_T + s_T + 2}
:::

Tento vzorec je elegantní: bere v úvahu **poměr** (čitatel r − s) i **objem** (jmenovatel roste s počtem hodnocení). Prodejce A (100/10) a B (90/0) z modelu součtu zde vyjdou *různě*, protože jmenovatel i čitatel odráží celkový počet a poměr důkazů.

### Rozšíření výpočtu Rep

Beta model lze obohatit o realistické jevy:

| Rozšíření | Význam |
| :--- | :--- |
| **Kombinovaná zpětná vazba** | hodnocení od více agentů se sčítají: r_T = r_T^x + r_T^y, s_T = s_T^x + s_T^y |
| **Opinion (mínění)** | názor ω = (b, d, u): *belief* (důvěra), *disbelief* (nedůvěra), *uncertainty* (nejistota); mapuje se na Beta |
| **Faktor zapomínání λ** | starší zkušenosti váží méně: r_T = Σ r_{T,i}·λ^{n−i}, s_T = Σ s_{T,i}·λ^{n−i} (λ ∈ [0,1]) |

Faktor zapomínání je důležitý prakticky: reputace má být **časově podmíněná** — entita, která byla rok zlomyslná, ale poslední měsíc se chová dobře, by neměla nést starý hřích navždy.

## 4. Modely důvěry (belief models)

Modely důvěry počítají metriky **na základě důvěry, nedůvěry a nejistoty** (právě trojice belief/disbelief/uncertainty). Tyto názory (*opinions*) se mapují na funkci hustoty Beta — jde tedy o nadstavbu nad Beta systémem, která explicitně modeluje *neznalost*.

## 5. Modely toků (flow models)

Modely toků počítají důvěru a reputaci **na základě tranzitivity** hodnocení účastníků — důvěra „teče" grafem od důvěryhodných uzlů k těm, na které odkazují. Sem patří:

- **[PageRank](https://snap.stanford.edu/class/cs224w-readings/Brin98Anatomy.pdf)** (Google) — viz [[priklady-rizika]],
- **Appleseed**,
- **Advogato**.

Rekurzivní povaha (reputace uzlu závisí na reputaci těch, kdo na něj odkazují) je silná i zrádná — vznikají cyklické odkazy a problém s inicializací. Detail PageRanku je v [[priklady-rizika]].

::: link "Jøsang, Ismail: The Beta Reputation System (2002)" "https://people.cs.vt.edu/~irchen/5984/pdf/Josang-BECC02.pdf"
:::

::: link "Beta distribution — Wikipedia" "https://en.wikipedia.org/wiki/Beta_distribution"
:::

*Zdroj: PDS — přednáška Reputační systémy, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Jøsang, A., Ismail, R.: „The Beta Reputation System" (Bled Electronic Commerce Conference 2002); Jøsang, A., Ismail, R., Boyd, C.: „A Survey of Trust and Reputation Systems for Online Service Provision" (Decision Support Systems 43(2), 2007, [DOI 10.1016/j.dss.2005.05.019](https://doi.org/10.1016/j.dss.2005.05.019)).*
