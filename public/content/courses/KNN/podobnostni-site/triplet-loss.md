---
title: Triplet loss a hard negative mining
---

# Triplet loss a hard negative mining

Contrastive loss má vrozenou slabinu: dívá se vždy jen na jednu dvojici a tlačí ji na **absolutní** vzdálenost (stejné k nule, různé za pevný margin). Jenže pro dobré rozpoznávání nepotřebujeme znát přesné vzdálenosti — potřebujeme **relativní** uspořádání: „fotka mě je bližší jiné mojí fotce než fotce kohokoliv jiného." Přesně tohle vyjadřuje **triplet loss**.

## Trojice: anchor, positive, negative

Triplet loss pracuje s **trojicí** vzorků:

- **Anchor** ($a$) — referenční vzorek (např. moje fotka),
- **Positive** ($p$) — **stejná** identita jako anchor (jiná moje fotka),
- **Negative** ($n$) — **jiná** identita (cizí obličej).

Cíl je jednoduchý: přitáhni `positive` k `anchoru` a zároveň odstrč `negative`. Ale nestačí jen „positive blíž než negative" — chceme **rezervu** $m$ (margin), aby uspořádání bylo robustní:

::: math
d(a, p) + m \;<\; d(a, n)
:::

Slovně: „vzdálenost ke svému musí být alespoň o margin $m$ menší než vzdálenost k cizímu." Z toho plyne ztráta — kolik nám do splnění té podmínky chybí, ořezané na nezáporné hodnoty:

::: math
L = \max\!\bigl(0,\; d(a,p) - d(a,n) + m\bigr)
:::

Když je podmínka splněna ($d(a,n) \ge d(a,p)+m$), je výraz uvnitř záporný, $\max$ ho ořízne na **0** a trojice nepřispívá ke ztrátě — je „vyřešená". Když splněna není, ztráta je kladná a gradient současně **táhne positive blíž a tlačí negative dál**.

::: viz triplet-loss "Táhni body anchor (A), positive (P) a negative (N) v 2D embedding prostoru. Vidíš obě vzdálenosti, kruh marginu kolem A a aktuální triplet loss — sleduj, jak je nulová, jakmile N je za marginem za P, a kladná, když je N moc blízko."
:::

V originálním článku **FaceNet** (Schroff et al., 2015) se používá **kvadrát** eukleidovské vzdálenosti a embeddingy normalizované na jednotkovou kouli ($\lVert f(x)\rVert_2 = 1$), takže přesný tvar je:

::: math
L = \sum_i \Bigl[\, \lVert f(a_i) - f(p_i)\rVert_2^2 - \lVert f(a_i) - f(n_i)\rVert_2^2 + \alpha \,\Bigr]_+
:::

kde $[\cdot]_+ = \max(0, \cdot)$ a $\alpha$ je margin (autoři používali $\alpha = 0.2$ pro 128-rozměrný embedding). Normalizace na jednotkovou kouli brání síti „podvádět" tím, že by všechny embeddingy nafoukla nebo zmenšila — geometrie se pak řeší jen úhly/polohou na kouli, ne velikostí.

## Proč jsou těžké trojice klíčové

Tady je háček, který rozhoduje o tom, jestli se síť vůbec naučí něco užitečného. Vezmeš-li trojice **náhodně**, drtivá většina z nich je **triviální**: anchor (já) vs. positive (zase já) vs. negative (úplně jiný člověk) jsou snadno odlišitelní, podmínka $d(a,p)+m < d(a,n)$ už **platí**, ztráta je 0 a gradient nulový. Z takových trojic se síť **nic nenaučí** — jen marně počítá.

Užitečné jsou jen trojice, kde se síť **plete** nebo má malou rezervu. Podle hodnoty $d(a,n) - d(a,p)$ se trojice dělí na tři druhy:

::: svg "Tři druhy trojic podle polohy negativu (n) vůči positivu (p) a marginu: easy (loss 0), semi-hard (n za p, ale uvnitř marginu), hard (n blíž než p)."
<svg viewBox="0 0 300 168" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="168" fill="var(--bg-inset)"/>
  <!-- three rows: easy / semi-hard / hard -->
  <!-- common: anchor on left -->
  <!-- EASY -->
  <text x="8" y="26" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">easy</text>
  <circle cx="70" cy="30" r="6" fill="var(--accent)"/><text x="70" y="33" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">a</text>
  <circle cx="100" cy="30" r="6" fill="var(--accent-line)"/><text x="100" y="33" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">p</text>
  <circle cx="250" cy="30" r="6" fill="var(--text-muted)"/><text x="250" y="33" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">n</text>
  <text x="150" y="22" font-size="8" font-family="var(--font-mono)" fill="var(--text-faint)">n daleko → loss=0</text>
  <!-- SEMI-HARD -->
  <text x="8" y="86" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">semi-hard</text>
  <circle cx="70" cy="90" r="6" fill="var(--accent)"/><text x="70" y="93" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">a</text>
  <circle cx="100" cy="90" r="6" fill="var(--accent-line)"/><text x="100" y="93" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">p</text>
  <circle cx="135" cy="90" r="6" fill="var(--text-muted)"/><text x="135" y="93" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">n</text>
  <line x1="100" y1="78" x2="100" y2="102" stroke="var(--line)" stroke-width="0.7" stroke-dasharray="2 2"/>
  <line x1="155" y1="78" x2="155" y2="102" stroke="var(--line)" stroke-width="0.7" stroke-dasharray="2 2"/>
  <text x="150" y="74" font-size="8" font-family="var(--font-mono)" fill="var(--text-faint)">d(a,p)&lt;d(a,n)&lt;d(a,p)+m</text>
  <text x="118" y="115" font-size="7" font-family="var(--font-mono)" fill="var(--text-faint)">margin</text>
  <!-- HARD -->
  <text x="8" y="146" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">hard</text>
  <circle cx="70" cy="150" r="6" fill="var(--accent)"/><text x="70" y="153" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">a</text>
  <circle cx="115" cy="150" r="6" fill="var(--accent-line)"/><text x="115" y="153" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">p</text>
  <circle cx="90" cy="150" r="6" fill="var(--text-muted)"/><text x="90" y="153" text-anchor="middle" font-size="7.5" fill="var(--bg-inset)" font-family="var(--font-mono)">n</text>
  <text x="150" y="142" font-size="8" font-family="var(--font-mono)" fill="var(--text-faint)">n blíž než p → velká loss</text>
</svg>
:::

- **Easy** ($d(a,n) > d(a,p) + m$): podmínka splněna s rezervou, loss = 0, gradient nulový.
- **Semi-hard** ($d(a,p) < d(a,n) < d(a,p) + m$): negative je dál než positive, ale **ne dost** — porušuje margin. Mírná kladná loss, stabilní gradient.
- **Hard** ($d(a,n) < d(a,p)$): negative je **blíž** než positive — síť se opravdu plete. Největší loss.

## Hard / semi-hard negative mining

**Negative mining** je strategie, jak do trénovacích trojic cíleně vybírat ty informativní (porušující margin), místo náhodného losování. Dělí se podle toho, kdy výběr probíhá:

- **Offline mining** — před každou epochou projdeš data, spočítáš embeddingy a vybereš těžké trojice dopředu. Je to drahé a embeddingy rychle „zastarají" (síť se mezitím změní).
- **Online mining** — trojice se skládají **uvnitř každého minibatche**. Z `B` obrázků spočítáš všechny vzájemné vzdálenosti a pro každý anchor vybereš těžký positive/negative přímo z aktuálního batche. To je standard (např. *batch-hard* / *batch-all*).

Lákavé je vždy brát ten **úplně nejtěžší** negative (nejbližší cizí). Jenže to je past: nejtvrdší trojice často pocházejí ze **špatně označených dat** nebo extrémních odlehlých případů a trénink na nich **kolabuje** (všechny embeddingy se zhroutí do jednoho bodu). Proto FaceNet záměrně volí **semi-hard** negativy — negative, který je dál než positive, ale stále uvnitř marginu:

::: math
d(a,p) < d(a,n) < d(a,p) + m
:::

Tyto trojice dávají nenulový, ale **rozumný** gradient: dost informativní na učení, ale ne tak agresivní, aby trénink rozhodily. To je hlavní praktický recept, proč FaceNet vůbec konvergoval.

## Aplikace

Triplet loss pohání řadu reálných systémů pro **určování identity z biometrie**:

- **FaceNet** (Schroff et al., 2015) — rozpoznávání obličejů; embedding obličeje na jednotkové kouli, verifikace prahem nad eukleidovskou vzdáleností. Dosáhl tehdy špičkové přesnosti na benchmarku LFW.
- **Rozpoznávání mluvčího podle hlasu** — síť převede úsek řeči na vektor (tzv. *speaker embedding*, např. *d-vector* / *x-vector*) a triplet/contrastive loss nutí nahrávky stejného mluvčího k sobě. Verifikace „je to stejný hlas?" pak funguje úplně stejně jako u obličejů.
- Obecně **image retrieval** a **re-identifikace osob** (person re-ID) napříč kamerami.

::: quiz "Proč FaceNet při tréninku vybírá semi-hard negativy a ne vždy ten úplně nejtěžší (nejbližší) negative?"
- [ ] Protože nejtěžší negativy se hůř počítají na GPU
  > Výpočetní náročnost není ten důvod; vzdálenosti v batchi se počítají stejně tak jako tak.
- [x] Nejtěžší negativy často pocházejí ze špatně označených/odlehlých dat a vedou ke kolapsu embeddingů; semi-hard dávají informativní, ale stabilní gradient
  > Semi-hard negative (dál než positive, ale uvnitř marginu) má nenulovou, ale rozumnou ztrátu — to udrží trénink stabilní a zároveň síť něco naučí.
- [ ] Semi-hard negativy mají vždy nulovou ztrátu, takže trénink je rychlejší
  > Naopak — easy negativy mají nulovou ztrátu (nic neučí); semi-hard mají kladnou, ale umírněnou ztrátu.
- [ ] Protože triplet loss nemá margin
  > Triplet loss margin má (právě jím je definováno pásmo semi-hard negativů).
:::

::: link "Schroff, Kalenichenko, Philbin — FaceNet: A Unified Embedding for Face Recognition and Clustering (CVPR 2015, triplet loss)" "https://arxiv.org/abs/1503.03832"
:::

::: link "Hermans, Beyer, Leibe — In Defense of the Triplet Loss for Person Re-Identification (batch-hard mining, 2017)" "https://arxiv.org/abs/1703.07737"
:::

---

*Zdroj: KNN státnicové okruhy NMAL, VUT FIT. Externí reference: Schroff, F., Kalenichenko, D., Philbin, J.: „FaceNet: A Unified Embedding for Face Recognition and Clustering" (CVPR 2015, [arXiv:1503.03832](https://arxiv.org/abs/1503.03832)) — triplet loss + semi-hard mining; Hermans, A., Beyer, L., Leibe, B.: „In Defense of the Triplet Loss for Person Re-Identification" (2017, [arXiv:1703.07737](https://arxiv.org/abs/1703.07737)) — batch-hard online mining.*
