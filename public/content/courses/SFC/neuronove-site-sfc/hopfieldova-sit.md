---
title: Hopfieldova síť
---

# Hopfieldova síť

Představ si, že do paměti uložíš pár obrázků a pak ti někdo ukáže jeden z nich **rozmazaný nebo poškozený**. Hopfieldova síť je model, který takový poškozený vstup **dotáhne zpět** k nejbližšímu uloženému vzoru — funguje jako **asociativní paměť**, kde se k obsahu dostaneš podle *podobnosti*, ne podle adresy. Místo "dej mi buňku číslo 42" řekneš "dej mi vzor podobný tomuhle" a síť doplní zbytek.

## Co to je: rekurentní, plně propojená, symetrická

Hopfieldova síť je **plně propojená rekurentní** síť: každý neuron je spojený s každým jiným. Spojení jsou **symetrická** ($w_{ij} = w_{ji}$) a neuron **nemá smyčku sám na sebe** ($w_{ii} = 0$). Stav každého neuronu je **binární**, typicky $y_i \in \{-1, +1\}$ (jeden pixel obrázku: černá / bílá).

Síť je **autoasociativní** — učí se spojovat vstup *sám se sebou*, takže výstup má být stejný jako (čistá verze) vstupu. Proto se hodí na **opravu poškozených vzorů**. (Příbuzné jsou *heteroasociativní* paměti jako BAM, které mapují jeden typ vstupu na jiný typ výstupu — to ale Hopfield nedělá.)

## Ukládání vzorů — Hebbovo pravidlo (jednorázově, bez gradientu)

Tady je hezká věc: Hopfieldova síť se **netrénuje** iterativně jako MLP. Váhy se spočítají **jednou analyticky** z uložených vzorů podle **Hebbova pravidla**. Hebbova idea zní *„neurony, které pálí spolu, se spolu propojí"* — když mají dva neurony v daném vzoru stejné znaménko, posílíme jejich spojení; když opačné, oslabíme ho.

Pro $P$ uložených vzorů $\boldsymbol{\xi}^{(1)}, \dots, \boldsymbol{\xi}^{(P)}$ (každý $\xi_i^{(p)} \in \{-1,+1\}$) se váha mezi neurony $i$ a $j$ spočítá jako součin jejich stavů sečtený přes všechny vzory:

::: math
w_{ij} = \sum_{p=1}^{P} \xi_i^{(p)}\,\xi_j^{(p)} \quad (i \ne j), \qquad w_{ii} = 0
:::

(Často se přidává faktor $\tfrac{1}{N}$, který nemění chování, jen měřítko vah.) Výsledná matice je automaticky symetrická a má nulovou diagonálu — přesně jak Hopfieldova síť vyžaduje.

## Obnova vzoru — aktualizace podle znaménka

Když pak síti předložíme **poškozený vstup**, nastavíme jím počáteční stavy neuronů a necháme síť **iterovat**. Každý neuron se aktualizuje podle znaménka svého váženého vstupu (to je jeho LBF potenciál):

::: math
y_i \leftarrow \operatorname{sgn}\!\left(\sum_{j} w_{ij}\, y_j - \theta_i\right)
:::

kde $\theta_i$ je práh (často 0). Aktualizace bývá **asynchronní** — v jednom kroku přepočítáme *jeden* neuron (typicky náhodně vybraný), ne všechny najednou. To je důležité pro důkaz konvergence (viz dál). Po několika průchodech se stavy přestanou měnit a síť se ustálí ve **stabilním stavu** — ideálně v tom uloženém vzoru, který byl poškozenému vstupu nejbližší.

::: viz hopfield-recall "Mřížka pixelů s uloženým vzorem. Přepni (poškoď) část pixelů a krokuj asynchronní aktualizaci neuronů — sleduj, jak energie klesá a síť konverguje zpět k uloženému vzoru. Můžeš přepínat mezi uloženými vzory."
:::

## Energetická funkce — proč to vždy doběhne

Klíč k pochopení Hopfieldovy sítě je **energetická funkce** (fyzikální analogie: kulička, která se koulí do údolí). Definuje se jako:

::: math
E = -\frac{1}{2}\sum_{i=1}^{n}\sum_{j=1}^{n} w_{ij}\, y_i\, y_j \;+\; \sum_{i=1}^{n} \theta_i\, y_i
:::

Intuice za znaménky: první člen je nízký (energie klesá), když souhlasí stavy neuronů s tím, co jim váhy "doporučují" — tedy když je síť v souladu sama se sebou. Uložené vzory jsou navrženy tak, aby seděly do **lokálních minim** této energie.

Teď ten důkaz, proč síť **vždy doběhne** a nezacyklí se. Spočítáme, jak se změní energie, když asynchronně překlopíme jediný neuron $k$ ze stavu $y_k$ na $y_k'$:

::: math
\Delta E = -\,(y_k' - y_k)\!\left(\sum_{j \ne k} w_{kj}\, y_j - \theta_k\right)
:::

A teď pozor — pravidlo aktualizace je nastavené přesně tak, aby tohle nikdy nebylo kladné:

- Neuron překlopíme jen tehdy, když má jeho nový stav **stejné znaménko** jako vážený vstup v závorce. Takže pokud se $y_k$ změní z $-1$ na $+1$, je závorka kladná, $(y_k'-y_k) > 0$, a celé $\Delta E < 0$.
- Pokud se změní z $+1$ na $-1$, je závorka záporná, $(y_k'-y_k) < 0$, a opět $\Delta E < 0$.
- Pokud se stav nezmění, je $\Delta E = 0$.

Každý krok tedy energii **buď sníží, nebo nechá stejnou** — nikdy nezvýší. A protože energie je **zdola ohraničená** (je to konečná suma konečně mnoha členů), nemůže klesat donekonečna. Výpočet se proto **musí zastavit** v nějakém lokálním minimu = stabilním stavu = (ideálně) uloženém vzoru. Tomu se říká **konvergence**, energie hraje roli **Ljapunovovy funkce**.

::: svg
<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="300" height="150" fill="var(--bg-inset)"/>
  <path d="M 15 30 C 60 130, 90 130, 115 60 C 130 20, 150 20, 165 55 C 185 130, 215 130, 250 35 C 262 18, 280 25, 285 35"
        fill="none" stroke="var(--line-strong)" stroke-width="1.5"/>
  <circle cx="80" cy="118" r="5" fill="var(--accent)"/>
  <circle cx="200" cy="118" r="5" fill="var(--accent)"/>
  <circle cx="138" cy="38" r="4" fill="var(--text-faint)"/>
  <circle cx="245" cy="20" r="6" fill="var(--accent-line)" stroke="var(--accent)" stroke-width="1.5"/>
  <path d="M 245 22 L 232 50" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 2" marker-end="url(#ar)"/>
  <defs><marker id="ar" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)"/></marker></defs>
  <text x="80" y="138" text-anchor="middle" font-size="8" fill="var(--text-muted)">uložený vzor</text>
  <text x="200" y="138" text-anchor="middle" font-size="8" fill="var(--text-muted)">uložený vzor</text>
  <text x="138" y="30" text-anchor="middle" font-size="8" fill="var(--text-faint)">falešný atraktor</text>
  <text x="245" y="13" text-anchor="middle" font-size="8" fill="var(--accent)">poškozený vstup</text>
  <text x="8" y="14" font-size="8.5" fill="var(--text-muted)">energie E</text>
</svg>
:::

Energetická krajina: poškozený vstup začíná vysoko a "koulí se" dolů do nejbližšího údolí (atraktoru). Většinou skončí v uloženém vzoru, ale ne vždy — existují i nechtěná mělká minima (falešné atraktory).

## Kapacita a falešné atraktory — kde to selhává

Hopfieldova síť má dvě známé bolesti:

- **Malá kapacita.** Do $N$ neuronů nelze nacpat libovolně mnoho vzorů. Klasický výsledek říká, že spolehlivě uložíme jen zhruba $P_{\max} \approx 0{,}138\,N$ náhodných vzorů. Pro $N = 100$ neuronů to je jen asi **14 vzorů**. Když mez překročíš, paměť se "rozsype" a uložené vzory přestanou být stabilní.
- **Falešné atraktory (spurious states).** Kromě uložených vzorů má energetická krajina i další nechtěná lokální minima — třeba **lineární kombinace** uložených vzorů nebo jejich **inverze** (každý uložený vzor $\boldsymbol{\xi}$ má díky symetrii energie i svůj zrcadlový $-\boldsymbol{\xi}$ jako stabilní stav). Síť do takového falešného minima může spadnout a vrátit "vzor", který jsi nikdy neuložil.

::: quiz "Proč Hopfieldova síť při asynchronní aktualizaci vždy konverguje a nezacyklí se?"
- [ ] Protože váhy se během iterací stále zmenšují
- [ ] Protože každý neuron se aktualizuje jen jednou
- [x] Protože každá změna stavu energii buď sníží, nebo nezmění ($\Delta E \le 0$), a energie je zdola ohraničená
  > Pravidlo aktualizace překlápí neuron jen ve směru, který snižuje energii; energie je Ljapunovova funkce a má dolní mez, takže výpočet musí skončit v lokálním minimu.
- [ ] Protože síť je plně propojená
:::

::: link "Hopfield — Neural networks and physical systems with emergent collective computational abilities (PNAS 1982)" "https://doi.org/10.1073/pnas.79.8.2554"
:::

::: link "Hopfield network — Wikipedia (kapacita, energie, falešné atraktory)" "https://en.wikipedia.org/wiki/Hopfield_network"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Hopfield, J. J.: „Neural networks and physical systems with emergent collective computational abilities" (PNAS 1982, [DOI:10.1073/pnas.79.8.2554](https://doi.org/10.1073/pnas.79.8.2554)); Amit, D. J., Gutfreund, H., Sompolinsky, H.: „Storing Infinite Numbers of Patterns in a Spin-Glass Model of Neural Networks" (1985) — kapacita ≈ 0,138 N; Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [PRML](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)).*
