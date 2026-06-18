---
title: Genetický algoritmus
---

# Genetický algoritmus

Představ si, že hledáš nejlepší nastavení nějakého problému — třeba rozvrh, parametry součástky nebo jen řetězec znaků, který se má rovnat cílovému slovu. Prostor možných řešení je obrovský a nemáš vzorec, jak optimum spočítat přímo. **Genetický algoritmus (GA)** je trik, jak takový prostor prohledat: napodobíš **přirozený výběr** z biologie. Místo jednoho řešení si držíš celou **populaci** kandidátů, necháš ty lepší se „rozmnožovat" a postupně z generace na generaci řešení vylepšuješ.

GA je **stochastická** (náhodou řízená) optimalizační technika. Nezaručuje, že najde globální optimum, ale v praxi často najde velmi dobré řešení tam, kde přesné metody selhávají, protože prostor je příliš velký nebo nehladký.

## Slovníček: jedinec, gen, fitness

Než půjdeme dál, zaveďme si pár pojmů, které se v GA pořád opakují.

- **Jedinec (chromozom)** — jedno kandidátní řešení. U klasického GA je zakódovaný jako **lineární řetězec pevné délky**, nejčastěji binární (`01101…`) nebo pole čísel.
- **Gen** — jedna pozice v tom řetězci (jeden bit, jedno číslo).
- **Populace** — množina jedinců, se kterou pracujeme v jedné generaci (typicky desítky až tisíce).
- **Fitness** — číslo, které říká, **jak dobrý jedinec je**. Vyšší fitness = lepší řešení. Fitness funkci si definuje řešitel podle úlohy (např. „kolik znaků sedí s cílovým slovem").

Důležité je rozlišit **genotyp** a **fenotyp**. Genotyp je ten zakódovaný řetězec, se kterým pracují genetické operátory. **Fenotyp** je jeho skutečný význam po dekódování — konkrétní rozvrh, konkrétní parametry součástky. Fitness se vyhodnocuje nad fenotypem.

## Generační cyklus

GA běží v cyklu. Jedna otočka cyklu = jedna **generace**:

1. **Inicializace** — náhodně vygeneruj počáteční populaci.
2. **Evaluace** — každému jedinci spočítej fitness.
3. **Selekce** — vyber rodiče úměrně jejich úspěšnosti.
4. **Genetické operátory** — z rodičů vytvoř potomky pomocí **křížení** a **mutace**.
5. **Náhrada** — potomci nahradí starou populaci (úplně nebo částečně).
6. **Test ukončení** — opakuj kroky 2–5, dokud nemáš dost dobré řešení nebo neuplyne daný počet generací.

::: viz genetic-algorithm "Evoluce populace binárních řetězců k cílovému vzoru. Klikej 'Další generace' a sleduj, jak selekce + křížení + mutace tlačí nejlepší i průměrnou fitness nahoru."
:::

Klíčová intuice: žádný jednotlivý krok není „chytrý". Selekce jen preferuje lepší, křížení jen míchá, mutace jen šťouchá náhodou. Síla je v **opakování** — dobré stavební bloky (kousky řetězce) se selekcí množí a křížením kombinují do stále lepších celků.

## Selekce: kdo se stane rodičem

Selekce zavádí **selekční tlak** — preferenci lepších jedinců. Příliš slabý tlak = pomalý postup; příliš silný tlak = **předčasná konvergence** (populace zkolabuje na jedno průměrné řešení a uvázne). Nejčastější metody:

**Ruletový výběr (roulette wheel).** Každému jedinci přiřaď výseč kola úměrnou jeho fitness. Pravděpodobnost výběru je

::: math
P(i) = \frac{f_i}{\sum_{j=1}^{N} f_j}
:::

Příklad: tři jedinci s fitness 1, 3, 6. Součet je 10, takže šance jsou 10 %, 30 %, 60 %. Nevýhoda: když jeden jedinec má na začátku obří fitness, „pohltí" ruletu a přivodí předčasnou konvergenci. Naopak v závěru, kdy si jsou všichni podobní, tlak skoro zmizí.

**Turnajový výběr (tournament).** Náhodně vyber *k* jedinců a rodičem se stane ten nejlepší z nich. Velikost turnaje *k* přímo ladí selekční tlak: *k* = 2 je mírný tlak, větší *k* tlačí silněji. Je jednoduchý, rychlý, necitlivý na měřítko fitness — proto **nejpoužívanější**.

**Pořadový výběr (rank-based).** Seřaď jedince podle fitness a pravděpodobnost počítej z **pořadí**, ne z absolutní hodnoty fitness. Tím se zbavíš problému, že jeden extrémně zdatný jedinec deformuje ruletu.

::: svg "Ruletový vs. turnajový výběr rodičů"
<svg viewBox="0 0 280 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <text x="70" y="14" text-anchor="middle" font-size="10" fill="var(--text-muted)">ruleta (úměrná fitness)</text>
  <circle cx="70" cy="80" r="48" fill="var(--bg-inset)" stroke="var(--line)" stroke-width="1"/>
  <path d="M70 80 L70 32 A48 48 0 0 1 116 92 Z" fill="var(--accent)" opacity="0.75"/>
  <path d="M70 80 L116 92 A48 48 0 0 1 52 126 Z" fill="var(--accent)" opacity="0.45"/>
  <path d="M70 80 L52 126 A48 48 0 0 1 70 32 Z" fill="var(--accent)" opacity="0.2"/>
  <text x="92" y="60" font-size="9" fill="var(--text)">60%</text>
  <text x="74" y="112" font-size="9" fill="var(--text)">30%</text>
  <text x="40" y="76" font-size="9" fill="var(--text)">10%</text>
  <text x="210" y="14" text-anchor="middle" font-size="10" fill="var(--text-muted)">turnaj (k=3)</text>
  <rect x="170" y="34" width="26" height="16" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <rect x="200" y="34" width="26" height="16" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <rect x="230" y="34" width="26" height="16" rx="3" fill="var(--accent)" opacity="0.8"/>
  <text x="183" y="46" text-anchor="middle" font-size="8" fill="var(--text)">f=4</text>
  <text x="213" y="46" text-anchor="middle" font-size="8" fill="var(--text)">f=2</text>
  <text x="243" y="46" text-anchor="middle" font-size="8" fill="var(--text)">f=7</text>
  <text x="213" y="74" text-anchor="middle" font-size="9" fill="var(--text-muted)">vybrán</text>
  <path d="M243 54 L243 64" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="243" y="90" text-anchor="middle" font-size="9" fill="var(--accent)">f=7</text>
  <text x="213" y="120" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">vyhrává nejvyšší</text>
  <text x="213" y="132" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">fitness z k-tice</text>
</svg>
:::

## Křížení: kombinace rodičů

**Křížení (crossover)** je hlavní operátor pro **kombinování** informace — vezme dva rodiče a vyrobí potomky, kteří dědí kousky od obou. Provádí se s pravděpodobností $p_c$ (typicky 0,6–0,9); pokud ke křížení nedojde, potomci jsou kopie rodičů.

- **Jednobodové (single-point):** zvol jeden dělicí bod. Potomek vezme geny před bodem od prvního rodiče, za bodem od druhého.
- **Vícebodové (multi-point):** zvol *n* dělicích bodů a úseky mezi nimi střídavě kopíruj z obou rodičů.
- **Uniformní (uniform):** o každém genu zvlášť rozhoď mincí, od kterého rodiče se zdědí.

Příklad jednobodového křížení s bodem za 3. genem:

```
rodič A:  1 0 1 | 1 0 1 0
rodič B:  0 1 1 | 0 1 1 1
─────────────────────────
potomek1: 1 0 1 | 0 1 1 1
potomek2: 0 1 1 | 1 0 1 0
```

Křížení je hlavně **exploatace (exploitation)** — využívá a rekombinuje to dobré, co už v populaci je, a hledá lepší řešení v okolí stávajících. Samo o sobě ale nedokáže přinést gen, který v populaci vůbec není.

## Mutace: udržení rozmanitosti

**Mutace** je doplňkový operátor: s malou pravděpodobností $p_m$ (typicky 0,001–0,01 **na jeden gen**) náhodně pošťouchne jednotlivé geny.

- **Bitová mutace** (binární kódování): vybraný bit se invertuje (0↔1).
- **Gaussovská mutace** (reálná čísla): k hodnotě genu se přičte malé náhodné číslo z normálního rozdělení.

Mutace je hlavně **explorace (exploration)** — vnáší novou genetickou rozmanitost (diverzitu), kterou selekce postupně ubírá. Bez mutace by populace mohla „vyschnout" na jednu hodnotu v daném genu a uvíznout v lokálním optimu, ze kterého samotné křížení nevybředne.

To je jádro kompromisu **explorace vs. exploatace**: musíš zároveň prozkoumávat nové oblasti (mutace, slabší selekce) i vytěžovat ty nadějné (křížení, silnější selekce). Špatné vyladění vede buď k náhodnému bloudění, nebo k předčasné konvergenci.

## Elitismus

I dobrá náhrada populace má vadu: křížení a mutace mohou nejlepšího jedince **zničit**. **Elitismus** tomu brání — *e* nejlepších jedinců se beze změny překopíruje do další generace. Tím zaručíš, že nejlepší dosažená fitness nikdy neklesne (je **monotónně neklesající**). Stačí malé *e* (často 1–2); příliš velký elitismus by zase přibrzdil exploraci.

::: quiz "Zvýšíš velikost turnaje *k* v turnajové selekci. Co se stane?"
- [ ] Sníží se selekční tlak a populace bude rozmanitější
  > Naopak — větší turnaj znamená, že do něj častěji padne nejlepší jedinec, takže tlak roste.
- [x] Vzroste selekční tlak — silnější preference nejlepších, rychlejší konvergence (i riziko předčasné)
  > Větší *k* = víc kandidátů v turnaji = větší šance, že vyhraje opravdu nejlepší. Tlak roste, diverzita klesá rychleji.
- [ ] Nic, *k* ovlivňuje jen rychlost výpočtu
  > *k* je hlavní páka na selekční tlak, ne jen výkonová konstanta.
- [ ] Fitness funkce se začne počítat z pořadí místo z hodnoty
  > To je pořadová (rank-based) selekce, jiná metoda; turnaj porovnává přímo fitness uvnitř k-tice.
:::

::: link "Mitchell — An Introduction to Genetic Algorithms (MIT Press)" "https://mitpress.mit.edu/9780262631853/an-introduction-to-genetic-algorithms/"
:::

::: link "Crossover versus Mutation: A Comparative Analysis (PMC)" "https://pmc.ncbi.nlm.nih.gov/articles/PMC4137700/"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Mitchell, M.: „An Introduction to Genetic Algorithms" ([MIT Press 1996](https://mitpress.mit.edu/9780262631853/an-introduction-to-genetic-algorithms/)); Holland, J.H.: „Adaptation in Natural and Artificial Systems" (University of Michigan Press, 1975); Goldberg, D.E.: „Genetic Algorithms in Search, Optimization, and Machine Learning" (Addison-Wesley, 1989).*
