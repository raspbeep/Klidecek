---
title: Fuzzy k-means a ANFIS
---

# Fuzzy k-means a ANFIS

Stejná fuzzy myšlenka — *„prvek patří někam jen částečně"* — se hodí i pro **strojové učení**. Dvě klasické aplikace: shlukování, kde bod nepatří ostře do jednoho shluku (fuzzy c-means), a hybridní model, který se fuzzy pravidla **naučí z dat** jako neuronová síť (ANFIS).

## Fuzzy c-means: měkké shlukování

Klasický **k-means** je *tvrdý* (hard): každý bod přiřadí do **právě jednoho** shluku — i bod přesně na pomezí dostane ostré 0/1. To je nepřirozené tam, kde shluky překrývají.

**Fuzzy c-means** (FCM, Dunn 1973, Bezdek 1981) je *měkký* (soft): každý bod patří do **všech** $c$ shluků současně, s váhami $u_{ij} \in \langle 0, 1 \rangle$ (příslušnost bodu $j$ ke shluku $i$), které se pro každý bod **sčítají na 1**:

::: math
\sum_{i=1}^{c} u_{ij} = 1 \qquad \text{pro každý bod } j
:::

Bod uprostřed mezi dvěma centry dostane třeba (0,5; 0,5) místo násilného (1; 0). To je stejný princip „měkkého přiřazení" jako u Gaussovských směsí (GMM) trénovaných EM algoritmem.

### Algoritmus

FCM minimalizuje váženou sumu čtverců vzdáleností, kde váhy jsou příslušnosti umocněné na **fuzziness exponent** $m > 1$ (typicky $m = 2$):

::: math
J = \sum_{i=1}^{c}\sum_{j=1}^{n} u_{ij}^{\,m}\,\lVert x_j - v_i \rVert^{2}
:::

Iteruje se ve dvou krocích (jako EM), dokud se centra nepřestanou hýbat:

1. **Aktualizace příslušností** — pro každý bod podle jeho vzdáleností ke všem centrům. Čím blíž centru $i$, tím vyšší $u_{ij}$:

::: math
u_{ij} = \frac{1}{\displaystyle\sum_{k=1}^{c}\left(\dfrac{\lVert x_j - v_i \rVert}{\lVert x_j - v_k \rVert}\right)^{\!\frac{2}{m-1}}}
:::

2. **Aktualizace center** — nové centrum je **vážený průměr** všech bodů, kde vahou je $u_{ij}^m$:

::: math
v_i = \frac{\displaystyle\sum_{j=1}^{n} u_{ij}^{\,m}\, x_j}{\displaystyle\sum_{j=1}^{n} u_{ij}^{\,m}}
:::

> **Pozor na zdrojovou nepřesnost.** Příslušnost *není* prostě „převrácená hodnota vzdálenosti" — je to normalizovaný **poměr** vzdáleností ke všem centrům umocněný na $2/(m-1)$. Jen tak je zaručeno, že se příslušnosti jednoho bodu sečtou na 1. Exponent $m$ řídí „měkkost": $m \to 1^{+}$ se blíží tvrdému k-means (ostré 0/1), velké $m$ vše rozmaže k rovnoměrnému $1/c$.

::: viz fuzzy-kmeans "Krokuj FCM na 2D bodech se dvěma shluky. Barva každého bodu plynule přechází podle fuzzy příslušnosti (čistě modrý = patří shluku A, čistě oranžový = B, smíšený = pomezí). Sleduj, jak se centra v každé iteraci posouvají do váženého průměru."
:::

## ANFIS: fuzzy systém, který se učí

Vraťme se k fuzzy regulátoru. Jeho síla je **čitelnost** — pravidla *„IF horko THEN chlaď"* dávají smysl člověku. Jeho slabina: tvary funkcí příslušnosti a parametry pravidel musí někdo **ručně naladit** (experti), systém se z dat sám neučí. Neuronové sítě to mají naopak: skvěle se učí z dat, ale jsou **černá skříňka** bez interpretace.

**ANFIS** (Adaptive Neuro-Fuzzy Inference System, Jang 1993) oba světy spojuje: vezme **Takagi-Sugeno** fuzzy systém a uspořádá jeho výpočet do **dopředné vícevrstvé sítě**, jejíž parametry se dají **trénovat** standardními metodami. Struktura (počet pravidel) je dána předem; učením se ladí jen parametry. Výsledek je tedy zároveň trénovatelný *i* interpretovatelný — pořád jde o fuzzy pravidla.

### Pět vrstev ANFIS

Pro dvě pravidla Takagi-Sugeno tvaru `IF x JE A_i AND y JE B_i THEN f_i = p_i·x + q_i·y + r_i` síť počítá takto:

::: svg
<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="300" height="180" fill="var(--bg-inset)"/>
  <!-- layer headers -->
  <text x="36"  y="14" font-size="8" text-anchor="middle" fill="var(--text-faint)">L1 μ</text>
  <text x="96"  y="14" font-size="8" text-anchor="middle" fill="var(--text-faint)">L2 Π</text>
  <text x="150" y="14" font-size="8" text-anchor="middle" fill="var(--text-faint)">L3 N</text>
  <text x="210" y="14" font-size="8" text-anchor="middle" fill="var(--text-faint)">L4 w·f</text>
  <text x="270" y="14" font-size="8" text-anchor="middle" fill="var(--text-faint)">L5 Σ</text>
  <!-- inputs -->
  <text x="8" y="64" font-size="9" fill="var(--text)">x</text>
  <text x="8" y="124" font-size="9" fill="var(--text)">y</text>
  <!-- L1 nodes -->
  <circle cx="36" cy="40"  r="9" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
  <circle cx="36" cy="70"  r="9" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
  <circle cx="36" cy="110" r="9" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
  <circle cx="36" cy="140" r="9" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
  <!-- L2 nodes (rule firing) -->
  <circle cx="96" cy="55"  r="9" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.2"/>
  <circle cx="96" cy="125" r="9" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.2"/>
  <text x="96" y="58"  font-size="8" text-anchor="middle" fill="var(--text)">Π</text>
  <text x="96" y="128" font-size="8" text-anchor="middle" fill="var(--text)">Π</text>
  <!-- L3 -->
  <circle cx="150" cy="55"  r="9" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.2"/>
  <circle cx="150" cy="125" r="9" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-width="1.2"/>
  <text x="150" y="58"  font-size="7.5" text-anchor="middle" fill="var(--text)">N</text>
  <text x="150" y="128" font-size="7.5" text-anchor="middle" fill="var(--text)">N</text>
  <!-- L4 -->
  <circle cx="210" cy="55"  r="9" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
  <circle cx="210" cy="125" r="9" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2"/>
  <!-- L5 sum -->
  <circle cx="270" cy="90" r="11" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
  <text x="270" y="93" font-size="9" text-anchor="middle" fill="var(--text)">Σ</text>
  <text x="290" y="93" font-size="9" fill="var(--text)">f</text>
  <!-- edges (light) -->
  <g stroke="var(--line-strong)" stroke-width="0.6" opacity="0.55" fill="none">
    <line x1="14" y1="60" x2="27" y2="40"/><line x1="14" y1="60" x2="27" y2="70"/>
    <line x1="14" y1="120" x2="27" y2="110"/><line x1="14" y1="120" x2="27" y2="140"/>
    <line x1="45" y1="40" x2="87" y2="55"/><line x1="45" y1="110" x2="87" y2="55"/>
    <line x1="45" y1="70" x2="87" y2="125"/><line x1="45" y1="140" x2="87" y2="125"/>
    <line x1="105" y1="55" x2="141" y2="55"/><line x1="105" y1="125" x2="141" y2="125"/>
    <line x1="159" y1="55" x2="201" y2="55"/><line x1="159" y1="125" x2="201" y2="125"/>
    <line x1="219" y1="55" x2="260" y2="86"/><line x1="219" y1="125" x2="260" y2="94"/>
  </g>
</svg>
:::

- **Vrstva 1 — fuzzifikace:** každý uzel spočítá příslušnost vstupu k jednomu termu, $\mu_{A_i}(x)$. *Parametry zde (tvar funkcí příslušnosti) = premisové / vstupní parametry.*
- **Vrstva 2 — síla pravidla:** uzel `Π` vynásobí příslušnosti (T-norma součin = AND): $w_i = \mu_{A_i}(x)\cdot\mu_{B_i}(y)$.
- **Vrstva 3 — normalizace:** podíl síly pravidla na celkové síle, $\bar{w}_i = w_i / \sum_k w_k$.
- **Vrstva 4 — vážený následek:** $\bar{w}_i\,f_i$, kde $f_i = p_i x + q_i y + r_i$. *Parametry zde ($p_i, q_i, r_i$) = konsekventní / výstupní parametry.*
- **Vrstva 5 — součet:** výstup $f = \sum_i \bar{w}_i f_i$ — vážený průměr následků (přesně Takagi-Sugeno).

### Hybridní učení

Trik ANFIS je v tom, jak chytře dělí trénink. Standardní **hybridní algoritmus** (Jang) v každé iteraci kombinuje dvě metody:

- **Dopředný průchod** — premisové parametry zafixuje, a protože výstup je *lineární* v konsekventních parametrech $p, q, r$, dohledá je optimálně **metodou nejmenších čtverců** (LSE). Jeden přesný krok místo pomalého šplhání.
- **Zpětný průchod** — konsekventní parametry zafixuje a premisové (tvary funkcí příslušnosti) doladí **gradientním sestupem** (backpropagation), protože v nich výstup lineární není.

Tahle dělba (rychlé LSE na lineární část, gradient na nelineární) je výrazně rychlejší a stabilnější než trénovat všechno jen gradientem. Učením se tedy z dat **automaticky vyladí jak tvary funkcí příslušnosti, tak koeficienty pravidel** — a výsledek je pořád čitelný fuzzy systém.

::: quiz "Při hybridním učení ANFIS se konsekventní parametry (koeficienty p, q, r lineárních následků) v dopředném průchodu řeší metodou nejmenších čtverců, ne gradientem. Proč to jde?"
- [ ] Protože jich je málo a gradient by byl pomalý
  > Počet není ten důvod — i mnoho parametrů by šlo gradientem. Klíč je v matematické struktuře.
- [x] Protože výstup sítě je v těchto parametrech *lineární*, takže optimum lze dopočítat přesně jedním krokem LSE
  > Přesně tak: pevné premisové parametry udělají z výstupu lineární kombinaci p, q, r, a lineární nejmenší čtverce mají uzavřené řešení.
- [ ] Protože funkce příslušnosti jsou Gaussovy a ty se nedají derivovat
  > Naopak — Gaussovy MF se derivovat dají a premisové parametry se právě gradientem ladí ve zpětném průchodu.
- [ ] Protože nejmenší čtverce nepotřebují trénovací data
  > LSE trénovací data potřebuje; právě z dvojic vstup-výstup počítá optimální koeficienty.
:::

::: link "Jang — ANFIS (1993)" "https://doi.org/10.1109/21.256541"
:::

::: link "Bezdek — Pattern Recognition with Fuzzy Objective Function Algorithms (FCM, 1981)" "https://doi.org/10.1007/978-1-4757-0450-1"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Jang, J.-S.R.: „ANFIS: Adaptive-Network-Based Fuzzy Inference System" (IEEE Trans. SMC, 1993, [DOI:10.1109/21.256541](https://doi.org/10.1109/21.256541)); Bezdek, J.C.: „Pattern Recognition with Fuzzy Objective Function Algorithms" (Plenum Press, 1981, [DOI:10.1007/978-1-4757-0450-1](https://doi.org/10.1007/978-1-4757-0450-1)); Dunn, J.C.: „A Fuzzy Relative of the ISODATA Process" (J. Cybernetics, 1973).*
