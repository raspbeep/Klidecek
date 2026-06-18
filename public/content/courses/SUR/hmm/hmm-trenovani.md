---
title: Trénování (Baum–Welch) a aplikace na řeč
---

# Trénování (Baum–Welch) a aplikace na řeč

Doteď jsme parametry $\lambda = (A, B, \pi)$ brali jako dané. Trénování je opačná úloha: **máme data (řečové nahrávky) a chceme z nich parametry odhadnout** tak, aby model data co nejlépe vysvětloval, tj. aby maximalizoval věrohodnost $P(X \mid \lambda)$. Problém je v tom, že **neznáme skryté stavy** — kdybychom u každého příznaku věděli, do kterého stavu patří, byl by to triviální počet četností. Jenže to nevíme. Z téhle „slepičí–vejce" situace se dostaneme **iterativně**.

## Intuice: kdyby tady nebyly skryté stavy…

Kdybychom u každého časového snímku $x_t$ znali jeho stav, odhad by byl snadný:

- $a_{ij}$ = (kolikrát jsme přešli $i\to j$) / (kolikrát jsme byli ve stavu $i$),
- emisní parametry stavu $j$ = spočítáme jen z těch $x_t$, které patří do $j$.

Ale stavy neznáme. **Trik EM:** začneme s nějakými (třeba náhodnými) parametry, jimi **odhadneme, do kterého stavu která data patří**, a z toho odhadu **přepočítáme parametry**. Opakujeme — a každá iterace věrohodnost zlepší (nebo nechá stejnou).

## Dvě verze: tvrdé vs měkké zarovnání

**Viterbi training (tvrdé zarovnání):** v každé iteraci spustíme Viterbiho algoritmus, čímž každý snímek $x_t$ přiřadíme **právě jednomu** stavu (nejlepší cesta). Pak spočítáme četnosti a přeodhadneme parametry. Jednoduché a rychlé, ale „natvrdo" — hraniční snímky se přiřadí celé jednomu stavu.

**Baum–Welch (měkké zarovnání):** místo jednoho stavu necháme každý snímek patřit **do všech stavů částečně**, podle pravděpodobnosti. Toto je matematicky správný **EM (Expectation–Maximization)** algoritmus pro HMM a v praxi konverguje k lepšímu řešení. Zbytek podtématu je o něm.

## Forward–backward: srdce E-kroku

Abychom spočítali „nakolik snímek $x_t$ patří do stavu $s$", potřebujeme **posterior obsazení stavu**

::: math
\gamma_s(t) = P(s_t = s \mid X, \lambda).
:::

Forward proměnnou $\alpha_s(t)$ (pravděpodobnost **začátku** sekvence končícího v $s$ v čase $t$) už známe z evaluace. Doplníme **zpětnou proměnnou** $\beta$:

::: math
\beta_s(t) = P(x_{t+1}, x_{t+2}, \dots, x_T \mid s_t = s,\ \lambda)
:::

slovně: „pravděpodobnost, že model vygeneruje **zbytek** sekvence od $t+1$ do konce, jsem-li v čase $t$ ve stavu $s$". Počítá se rekurzí **odzadu**:

::: math
\beta_s(T) = 1, \qquad
\beta_s(t) = \sum_{j} a_{sj}\, b_j(x_{t+1})\, \beta_j(t+1)
:::

Když teď máme $\alpha$ (vše před $t$ a včetně) i $\beta$ (vše po $t$), jejich **součin pokrývá celou sekvenci** přes stav $s$ v čase $t$. Po normalizaci celkovou pravděpodobností $P(X)$ dostaneme posterior:

::: math
\gamma_s(t) = \frac{\alpha_s(t)\,\beta_s(t)}{P(X)}, \qquad P(X) = \sum_{j} \alpha_j(T)
:::

::: viz hmm-forward-backward "Posuň čas t a sleduj, jak forward (α, modrá oblast vlevo) pokrývá začátek sekvence a backward (β, oblast vpravo) zbytek. Velikost uzlů ve vybraném sloupci odpovídá posterioru γ_s(t) = α·β / P(X)."
:::

## EM smyčka: E-krok a M-krok

Algoritmus střídá dva kroky, dokud věrohodnost neustálí:

- **E-krok (Expectation):** s aktuálními parametry spočítej forward–backward, z toho **měkká zarovnání** $\gamma_s(t)$ (obsazení stavu) a $\xi_{ij}(t)$ (očekávaný přechod $i\to j$ v čase $t$).
- **M-krok (Maximization):** přeodhadni parametry, kde $\gamma$ a $\xi$ fungují jako **spojité váhy** místo tvrdých četností.

Přechodové pravděpodobnosti jako podíl očekávaných počtů:

::: math
\hat a_{ij} = \frac{\sum_{t} \xi_{ij}(t)}{\sum_{t} \gamma_i(t)}
= \frac{\text{očekávaný počet přechodů } i \to j}{\text{očekávaný počet návštěv stavu } i}
:::

Emisní parametry (u spojité řeči střední hodnoty a rozptyly GMM) jako **vážené průměry** — čím vyšší $\gamma_s(t)$, tím víc daný snímek ovlivní stav $s$:

::: math
\hat\mu_s = \frac{\sum_t \gamma_s(t)\, x_t}{\sum_t \gamma_s(t)}, \qquad
\hat\sigma_s^2 = \frac{\sum_t \gamma_s(t)\,(x_t - \hat\mu_s)^2}{\sum_t \gamma_s(t)}
:::

Klíčová **garance EM:** každá iterace věrohodnost $P(X\mid\lambda)$ **nezhorší** (roste nebo stagnuje). Konverguje ale jen k **lokálnímu** maximu — proto na inicializaci záleží (často se startuje z výsledku pár iterací Viterbi trainingu).

## Aplikace na rozpoznávání řeči

Proč zrovna HMM na řeč? Protože řeč je **sekvence proměnné délky** — totéž slovo můžu vyslovit pomalu nebo rychle, takže dostane různý počet snímků. HMM to zvládá přirozeně: skrytý stav může „zůstat sám v sobě" libovolně dlouho (smyčka $a_{ii}$), takže model **roztáhne nebo stlačí** sekvenci podle potřeby. To je obrovská výhoda oproti modelům s pevnou délkou vstupu.

Typický pipeline klasického systému (před érou hlubokých sítí):

1. **Příznaky:** z nahrávky se po krátkých rámcích (≈ 10 ms) spočítají **MFCC** (Mel-frequency cepstral coefficients) — pozorování $x_t$.
2. **Stavy = fonémy:** každý foném (např. `/s/`, `/eh/`) se modeluje malým HMM, obvykle se 3 stavy (začátek–střed–konec hlásky).
3. **Emise = GMM:** ve stavu se pravděpodobnost příznakového vektoru $b_j(x)$ modeluje **směsí Gaussovek** — proto „GMM-HMM".
4. **Slova = řetězení fonémů:** podle výslovnostního slovníku se slovo poskládá z fonémových HMM (`yes` = `/y/ → /eh/ → /s/`).
5. **Dekódování:** přes velkou síť všech slov (vedenou jazykovým modelem $P(\text{slovo}\mid\text{kontext})$) se **Viterbim** najde nejlepší cesta = rozpoznaná věta.

Pro **izolovaná slova** je to ještě jednodušší: natrénuje se po jednom HMM na slovo a při rozpoznávání se vybere model s nejvyšší aposteriorní pravděpodobností, tj. ten, kde $P(X\mid\text{slovo})\,P(\text{slovo})$ vyjde největší.

::: quiz "K čemu slouží backward proměnná β_s(t) v Baum–Welch?"
- [ ] Nahrazuje Viterbiho zpětný průchod při dekódování
- [x] Dává pravděpodobnost zbytku sekvence (od t+1 do konce) za podmínky stavu s — spolu s α tvoří posterior γ_s(t)
  > γ_s(t) = α_s(t)·β_s(t)/P(X). α pokrývá začátek až po t, β zbytek po t; jejich součin (normalizovaný P(X)) dá pravděpodobnost obsazení stavu s v čase t, což je měkké zarovnání pro E-krok.
- [ ] Počítá matici přechodů A přímo, bez iterací
- [ ] Je to jen jiný název pro forward proměnnou α
:::

::: link "Rabiner — A Tutorial on Hidden Markov Models (1989)" "https://doi.org/10.1109/5.18626"
:::

::: link "Baum et al. — A Maximization Technique in the Statistical Analysis of Probabilistic Functions of Markov Chains (1970)" "https://doi.org/10.1214/aoms/1177697196"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Rabiner, L.R.: „A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition" (Proc. IEEE 1989, [doi:10.1109/5.18626](https://doi.org/10.1109/5.18626)); Baum, L.E. et al.: „A Maximization Technique Occurring in the Statistical Analysis of Probabilistic Functions of Markov Chains" (Ann. Math. Statist. 1970, [doi:10.1214/aoms/1177697196](https://doi.org/10.1214/aoms/1177697196)); Gales, M., Young, S.: „The Application of Hidden Markov Models in Speech Recognition" (Found. Trends Signal Process. 2008, [doi:10.1561/2000000004](https://doi.org/10.1561/2000000004)).*
