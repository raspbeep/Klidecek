---
title: Siamské sítě a contrastive loss
---

# Siamské sítě a contrastive loss

Představ si, že stavíš systém, který odemkne telefon podle obličeje. Při registraci máš jednu jedinou fotku majitele. Klasická klasifikační síť (typu „rozpoznej, kterou z 1000 tříd vidíš") tu selhává hned ze dvou důvodů: zaprvé bys ji musela přetrénovat pokaždé, když přibude nový uživatel, a zadruhé z jedné fotky se prostě nedá natrénovat třída.

Klíčový obrat je tohle: **místo otázky „do které třídy patří tento obrázek?" se ptáme „jak moc se tyto dva obrázky podobají?"**. Síť nepřevádí vstup na pravděpodobnosti tříd, ale na **embedding** — číselný vektor (např. 128 čísel). Cíl trénování je geometrický: vstupy patřící stejné osobě mají mít v prostoru embeddingů malou vzdálenost, vstupy různých osob velkou. Tomuto přístupu se říká **metric learning** (učení metriky podobnosti).

## Embedding a vzdálenost

**Embedding** je vektor $f(x) \in \mathbb{R}^d$, do kterého síť zakóduje podstatné rysy vstupu $x$ (tvar obličeje, barva a vzdálenost očí, …) a zahodí nepodstatné (osvětlení, pozadí). Podobnost dvou objektů pak měříme vzdáleností jejich embeddingů. Dvě nejčastější metriky:

::: math
d(f_1, f_2) = \lVert f_1 - f_2 \rVert_2 \qquad\text{(eukleidovská)}
:::

::: math
d_{\cos}(f_1, f_2) = 1 - \frac{f_1 \cdot f_2}{\lVert f_1\rVert\,\lVert f_2\rVert} \qquad\text{(kosinová vzdálenost)}
:::

Eukleidovská vzdálenost sleduje, jak daleko jsou body od sebe. Kosinová vzdálenost porovnává hlavně **směr** vektorů (úhel mezi nimi), nikoli jejich délku. Proto se kosinová metrika hodí pro embeddingy normalizované na jednotkovou délku — což je velmi častá volba, protože pak `||f||=1` a obě metriky se stávají monotonně ekvivalentní ($d^2 = 2 - 2\cos$).

## Siamská síť: dvě věže, jedny váhy

**Siamská síť** není zvláštní typ neuronky — je to spíš *způsob použití*. Vezmeš jednu obyčejnou síť (encoder) $f$ a aplikuješ ji na **oba** vstupy zvlášť: $f(x_1)$ a $f(x_2)$. Obě „věže" mají **sdílené váhy** (jeden a tentýž model), takže stejný obličej dá vždy stejný embedding bez ohledu na to, kterou větví projde. Výstupem jsou dva embeddingy a z nich spočítaná vzdálenost.

::: viz siamese-arch "Schéma siamské sítě: dva vstupy → tatáž síť se sdílenými vahami → dva embeddingy → vzdálenost → ztráta. Přepni, zda jde o pár stejné/různé identity, a sleduj, jak se vzdálenost a contrastive loss mění."
:::

Proč sdílet váhy? Kdyby každá věž měla vlastní parametry, mohly by se stejný obličej zakódovat dvěma nesouměřitelnými způsoby a vzdálenost by nedávala smysl. Sdílení vah zaručuje **symetrii** — $f$ je jedna konzistentní funkce a vzdálenost $d(f(x_1), f(x_2))$ má jasný význam.

Tato architektura se v NLP a retrievalu označuje i jako **dual-encoder** (bi-encoder): oba vstupy se embedují **nezávisle**, podobnost se počítá až nad hotovými embeddingy. To je obrovská praktická výhoda — embeddingy celé databáze si můžeš **předpočítat** a pak jen rychle hledat nejbližšího souseda. Protipólem je **cross-encoder**, kde oba vstupy vejdou do modelu společně a síť rovnou predikuje jejich vztah; bývá přesnější, ale nelze nic předpočítat, takže je pro vyhledávání v milionech položek nepoužitelně pomalý.

## Contrastive loss (pair loss)

Jak ale síť donutit, aby embeddingy měly tu správnou geometrii? Nejjednodušší recept pracuje s **dvojicemi**. Každá dvojice $(x_1, x_2)$ dostane nálepku $y$:

- $y = 1$ → **stejná** identita (pozitivní pár),
- $y = 0$ → **různá** identita (negativní pár).

Intuice je „pružina a odpuzování": stejné dvojice **přitahuj** k sobě, různé dvojice **odpuzuj** — ale jen dokud nejsou dostatečně daleko. To „dostatečně" je **margin** $m$: jakmile jsou různé objekty od sebe víc než $m$, už nás nezajímají a netlačíme je dál. **Contrastive loss** (Hadsell, Chopra, LeCun, 2006) tuto myšlenku zapisuje takto:

::: math
L = y \cdot d^2 + (1 - y)\cdot \max(0,\; m - d)^2
:::

kde $d = d(f(x_1), f(x_2))$ je vzdálenost embeddingů. Rozeber si to po členech:

- Pro **stejný** pár ($y=1$) zůstává jen $d^2$ — síť je trestána úměrně tomu, jak daleko od sebe jsou, takže je tlačí k sobě (ideálně $d \to 0$).
- Pro **různý** pár ($y=0$) zůstává $\max(0, m-d)^2$. Když je $d < m$, vzniká kladná ztráta, která body odpuzuje. Jakmile $d \ge m$, je člen nulový — pár je „vyřešený" a netáhne se zbytečně dál.

::: svg "Contrastive loss po členech: stejný pár roste jako d², různý pár klesá jako max(0, m−d)² a za marginem m je nula."
<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="150" fill="var(--bg-inset)"/>
  <line x1="35" y1="120" x2="285" y2="120" stroke="var(--line-strong)" stroke-width="0.6"/>
  <line x1="35" y1="20" x2="35" y2="120" stroke="var(--line-strong)" stroke-width="0.6"/>
  <text x="285" y="135" text-anchor="end" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">d (vzdálenost) →</text>
  <text x="6" y="18" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">ztráta</text>
  <!-- same pair: y=1, loss = d^2 grows -->
  <path d="M 35 120 Q 120 118 230 24" fill="none" stroke="var(--accent)" stroke-width="1.8"/>
  <text x="170" y="55" font-size="9" font-family="var(--font-mono)" fill="var(--accent)">stejný: d²</text>
  <!-- different pair: y=0, loss = (m-d)^2 until margin then 0 -->
  <path d="M 35 28 Q 100 95 175 120 L 285 120" fill="none" stroke="var(--text-muted)" stroke-width="1.8"/>
  <text x="60" y="50" font-size="9" font-family="var(--font-mono)" fill="var(--text-muted)">různý: max(0,m−d)²</text>
  <!-- margin marker -->
  <line x1="175" y1="20" x2="175" y2="120" stroke="var(--line)" stroke-width="0.8" stroke-dasharray="3 3"/>
  <text x="178" y="34" font-size="9" font-family="var(--font-mono)" fill="var(--text-muted)">m</text>
</svg>
:::

Pozor na **konvenci značení** $y$: originální článek Hadsell et al. (2006) používá *opačnou* konvenci ($Y=0$ pro stejné, $Y=1$ pro různé) a vzorec má prohozené členy. Výsledek je naprosto stejný — důležité je, aby člen $d^2$ vždy patřil **stejným** párům a člen s marginem **různým**. My držíme konvenci $y=1$ = stejné, která je čitelnější.

Hlavní slabina contrastive loss: pracuje vždy jen s **absolutními** vzdálenostmi izolovaných dvojic. Nutí stejné páry k $d \approx 0$ a různé za pevný margin $m$, ale neumí vyjádřit relativní vztah „A je bližší než B". Pro opravdu kvalitní embedding prostor to často nestačí — proto vznikla triplet loss, která porovnává trojice naráz.

## Verifikace vs. identifikace

Hotový embedding prostor řeší dvě různé úlohy:

- **Verifikace** (1:1) — „Jsou tito dva titíž?" Spočítáš $d(f(x_1), f(x_2))$ a porovnáš s prahem $\tau$: $d < \tau$ → *same*, jinak *different*. Typicky odemykání telefonu nebo přihlášení hlasem.
- **Identifikace** (1:N) — „Kdo to je?" Embedding dotazu porovnáš s databází známých embeddingů a vybereš **nejbližšího souseda** (nearest neighbor).

Identifikace odhaluje pravou sílu tohoto přístupu: novou identitu přidáš tak, že do databáze prostě uložíš její embedding — **bez přetrénování sítě**. Funguje tedy i pro osoby, které síť za trénování nikdy neviděla. Tomu se říká **open-set recognition** — při nasazení se objevují identity neznámé z trénování. (To by čistá klasifikační síť s pevným počtem výstupních tříd nezvládla.)

::: quiz "Proč siamská síť používá pro obě věže sdílené (stejné) váhy?"
- [ ] Aby se ušetřila paměť na GPU
  > Úspora paměti je vedlejší efekt, ne hlavní důvod — záleží na korektnosti embeddingu.
- [x] Aby byl embedding stejného vstupu vždy stejný a vzdálenost mezi embeddingy měla konzistentní význam
  > Sdílení vah dělá z f jednu konzistentní funkci; symetrie zaručuje, že d(f(x1), f(x2)) dává smysl bez ohledu na pořadí a větev.
- [ ] Aby síť mohla klasifikovat vstup do jedné z pevných tříd
  > Naopak — smysl siamských sítí je vyhnout se pevným třídám a umět přidávat nové identity bez přetrénování.
- [ ] Protože contrastive loss vyžaduje dva různé modely
  > Contrastive loss pracuje nad jedním modelem aplikovaným na oba vstupy; dva různé modely by vzdálenost rozbily.
:::

::: link "Hadsell, Chopra, LeCun — Dimensionality Reduction by Learning an Invariant Mapping (CVPR 2006, contrastive loss)" "https://ieeexplore.ieee.org/document/1640964"
:::

::: link "Koch, Zemel, Salakhutdinov — Siamese Neural Networks for One-shot Image Recognition (2015)" "https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf"
:::

---

*Zdroj: KNN státnicové okruhy NMAL, VUT FIT. Externí reference: Hadsell, R., Chopra, S., LeCun, Y.: „Dimensionality Reduction by Learning an Invariant Mapping" (CVPR 2006, [IEEE 1640964](https://ieeexplore.ieee.org/document/1640964)) — contrastive loss; Koch, G., Zemel, R., Salakhutdinov, R.: „Siamese Neural Networks for One-shot Image Recognition" ([ICML 2015 workshop](https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf)).*
