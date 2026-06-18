---
title: Příznaky a jejich požadované vlastnosti
---

# Příznaky a jejich požadované vlastnosti

Klasifikátor je jen tak dobrý, jak dobrá jsou čísla, která dostane na vstup. Surová data — pixely fotky, vzorky zvukového signálu, řádky z databáze — bývají obrovská, zašuměná a plná nepodstatných detailů. **Příznak (feature)** je jedno číslo, které z těchto surových dat spočítáme a o němž věříme, že nese informaci užitečnou pro rozhodování.

Sadu příznaků seskupíme do **příznakového vektoru** $x \in \mathbb{R}^d$. **Extrakce příznaků (feature extraction)** je krok, který surová data převede na takový vektor — typicky tak, aby byl menší a informativnější než vstup.

Pár konkrétních příkladů, ať to není abstraktní:

- **řeč:** zvukový signál (tisíce vzorků za sekundu) → ~13 **MFCC** koeficientů na krátký úsek (Mel-frequency cepstral coefficients, příznaky popisující barvu zvuku),
- **obraz:** matice pixelů → vektor příznaků (hrany, textury, dnes typicky aktivace neuronové sítě),
- **biometrie:** obraz otisku prstu → souřadnice charakteristických bodů (minucie).

## Jaké příznaky chceme

Ideální příznak nese co nejvíc informace pro rozlišení tříd a co nejmíň balastu. To se dá rozepsat do několika konkrétních požadavků.

**Diskriminativnost (diskriminační schopnost).** To je ten nejdůležitější. Příznak má nabývat *odlišných* hodnot pro vzorky z různých tříd. „Délka okvětního lístku" odliší druhy kosatce; „pořadové číslo řádku v souboru" je sice číslo, ale o třídě neříká nic — má nulovou diskriminativnost.

**Invariance (robustnost vůči nepodstatným změnám).** Příznak se nemá měnit, když se mění věci, na kterých nezáleží. Rozpoznání číslice má fungovat, ať je číslice posunutá, otočená nebo jinak velká — chceme tedy příznaky **invariantní vůči posunu, rotaci a měřítku**. Podobně rozpoznání řeči nemá záviset na hlasitosti.

**Nízká dimenze a nízká redundance.** Příznaků chceme málo a každý má nést *jinou* informaci. Dva silně korelované příznaky (např. „výška v cm" a „výška v palcích") jsou skoro duplikát — jeden je redundantní. Méně příznaků znamená rychlejší výpočet a menší riziko **přetrénování** (overfitting), kdy se model naučí šum místo struktury.

**Robustnost vůči šumu.** Malá chyba měření nemá hodnotu příznaku rozhodit. Příznak citlivý na každý zákmit senzoru je nepoužitelný.

::: svg
<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="300" height="150" fill="var(--bg-inset)"/>
  <!-- left: bad feature -->
  <rect x="10" y="14" width="130" height="118" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <text x="75" y="28" text-anchor="middle" font-size="10" fill="var(--text-muted)">špatný příznak</text>
  <line x1="20" y1="118" x2="130" y2="118" stroke="var(--line-strong)" stroke-width="0.6"/>
  <!-- two overlapping clouds -->
  <g fill="oklch(0.65 0.16 264)"><circle cx="55" cy="100" r="3"/><circle cx="68" cy="95" r="3"/><circle cx="60" cy="106" r="3"/><circle cx="74" cy="101" r="3"/><circle cx="63" cy="90" r="3"/></g>
  <g fill="oklch(0.62 0.18 28)"><circle cx="70" cy="103" r="3"/><circle cx="80" cy="97" r="3"/><circle cx="64" cy="99" r="3"/><circle cx="76" cy="106" r="3"/><circle cx="58" cy="96" r="3"/></g>
  <text x="75" y="132" text-anchor="middle" font-size="8" fill="var(--text-faint)">třídy splývají</text>
  <!-- right: good feature -->
  <rect x="160" y="14" width="130" height="118" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <text x="225" y="28" text-anchor="middle" font-size="10" fill="var(--text-muted)">dobrý příznak</text>
  <line x1="170" y1="118" x2="280" y2="118" stroke="var(--line-strong)" stroke-width="0.6"/>
  <g fill="oklch(0.65 0.16 264)"><circle cx="185" cy="100" r="3"/><circle cx="193" cy="95" r="3"/><circle cx="188" cy="106" r="3"/><circle cx="197" cy="101" r="3"/><circle cx="191" cy="90" r="3"/></g>
  <g fill="oklch(0.62 0.18 28)"><circle cx="255" cy="103" r="3"/><circle cx="263" cy="97" r="3"/><circle cx="250" cy="99" r="3"/><circle cx="259" cy="106" r="3"/><circle cx="266" cy="93" r="3"/></g>
  <text x="225" y="132" text-anchor="middle" font-size="8" fill="var(--text-faint)">třídy oddělené</text>
</svg>
:::

Vlevo i vpravo je tatáž úloha promítnutá na jeden příznak (vodorovná osa). Vlevo se obě třídy překrývají — z hodnoty příznaku třídu neuhádneme. Vpravo leží každá třída jinde — příznak je diskriminativní.

Diskriminativnost přitom závisí na tom, *jakou* veličinu z dat spočítáme. Stejná dvojice tříd může být na jednom příznaku k nerozeznání a na jiném krásně oddělená — vyzkoušej si to:

::: viz feature-separability "Dva mraky bodů (dvě třídy); přepínej, který 1D příznak ponecháš (jen x, jen y, nebo úhlopříčka x+y) a sleduj, jak se třídy po promítnutí na zvolenou osu buď překryjí, nebo oddělí. Skóre dole je Fisherova separabilita — čím větší, tím diskriminativnější příznak."
:::

Na osách *jen x* a *jen y* se třídy slévají (nízká separabilita), protože do nich prosakuje velký společný rozptyl. Úhlopříčka $x+y$ ten rozptyl odečte a třídy se rozdělí — Fisherovo skóre vyskočí nahoru. Hledat dobrý příznak tedy znamená najít směr, podél kterého se třídy nejlépe oddělí; přesně to dělají metody jako LDA.

## Proč chceme málo příznaků: prokletí dimenzionality

Mohlo by se zdát, že čím víc příznaků, tím líp — vždyť přidáním příznaku informaci jen přidáváme. Háček je v tom, že **objem prostoru roste exponenciálně s dimenzí**, a data se v něm „rozředí".

::: svg
<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="300" height="140" fill="var(--bg-inset)"/>
  <!-- 1D: line densely covered -->
  <text x="50" y="20" text-anchor="middle" font-size="9" fill="var(--text-muted)">d=1: 10 bodů</text>
  <line x1="14" y1="40" x2="86" y2="40" stroke="var(--line-strong)" stroke-width="0.6"/>
  <g fill="var(--accent)"><circle cx="18" cy="40" r="2.4"/><circle cx="25" cy="40" r="2.4"/><circle cx="33" cy="40" r="2.4"/><circle cx="40" cy="40" r="2.4"/><circle cx="48" cy="40" r="2.4"/><circle cx="55" cy="40" r="2.4"/><circle cx="63" cy="40" r="2.4"/><circle cx="70" cy="40" r="2.4"/><circle cx="78" cy="40" r="2.4"/><circle cx="85" cy="40" r="2.4"/></g>
  <text x="50" y="58" text-anchor="middle" font-size="8" fill="var(--text-faint)">hustě</text>
  <!-- 2D: square with same 10 points scattered -->
  <text x="150" y="20" text-anchor="middle" font-size="9" fill="var(--text-muted)">d=2: stejných 10 bodů</text>
  <rect x="118" y="28" width="64" height="64" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <g fill="var(--accent)"><circle cx="128" cy="40" r="2.4"/><circle cx="160" cy="34" r="2.4"/><circle cx="145" cy="60" r="2.4"/><circle cx="174" cy="52" r="2.4"/><circle cx="124" cy="80" r="2.4"/><circle cx="156" cy="86" r="2.4"/><circle cx="170" cy="74" r="2.4"/><circle cx="138" cy="46" r="2.4"/><circle cx="150" cy="72" r="2.4"/><circle cx="166" cy="44" r="2.4"/></g>
  <text x="150" y="104" text-anchor="middle" font-size="8" fill="var(--text-faint)">řidčeji</text>
  <!-- 3D: cube, points lost in volume -->
  <text x="250" y="20" text-anchor="middle" font-size="9" fill="var(--text-muted)">d=3: ztrácejí se</text>
  <path d="M222 36 h44 v44 h-44 z" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <path d="M222 36 l14 -12 h44 l-14 12 z" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <path d="M266 36 l14 -12 v44 l-14 12 z" fill="var(--bg-card)" stroke="var(--line)" stroke-width="0.5"/>
  <g fill="var(--accent)"><circle cx="234" cy="48" r="2.2"/><circle cx="258" cy="40" r="2.2"/><circle cx="246" cy="66" r="2.2"/><circle cx="270" cy="58" r="2.2"/><circle cx="230" cy="72" r="2.2"/><circle cx="262" cy="74" r="2.2"/></g>
  <text x="251" y="104" text-anchor="middle" font-size="8" fill="var(--text-faint)">prázdno</text>
</svg>
:::

Tatáž skupinka deseti bodů: na přímce ($d=1$) leží hustě vedle sebe, ve čtverci ($d=2$) už mezi nimi zejí mezery a v krychli ($d=3$) se v objemu skoro ztratí. Žádný nový bod nepřibyl — jen prostor kolem nich nabobtnal.

Konkrétně: kdyby na pokrytí jednorozměrného intervalu se zvolenou hustotou stačilo $N$ vzorků, na dvourozměrný čtverec stejné hustoty potřebujeme $N^2$ a na $d$-rozměrnou krychli $N^d$. Pro $N=10$ a $d=10$ to je $10^{10}$ vzorků — nedosažitelné. Při pevném počtu dat tedy s rostoucí dimenzí klesá hustota vzorků, prostor je čím dál prázdnější a klasifikátor nemá z čeho se učit. Tomuto jevu se říká **prokletí dimenzionality (curse of dimensionality)**.

Důsledek: za jistou hranicí přidání dalšího (slabého) příznaku přesnost *zhorší*, ne zlepší. Proto chceme příznaky kvalitní a v malém počtu — a proto existují metody redukce dimenze jako PCA a LDA.

## Extrakce vs. výběr příznaků

Dvě cesty, jak se dostat k malé sadě dobrých příznaků, se snadno pletou:

- **Výběr příznaků (feature selection)** — z existujících příznaků *vybereme podmnožinu* a zbytek zahodíme. Výsledné příznaky jsou původní příznaky beze změny (např. „ponech sloupce 1, 4, 7"). Výhoda: zůstávají interpretovatelné.
- **Extrakce příznaků (feature extraction)** — vytvoříme *nové* příznaky jako (typicky lineární) **kombinace** těch původních. PCA i LDA sem patří: nový příznak je třeba $0{,}7\,x_1 + 0{,}7\,x_2$. Výhoda: může do jednoho čísla namíchat informaci z mnoha původních.

::: math
\underbrace{x \in \mathbb{R}^d}_{\text{původní}} \;\longrightarrow\; \underbrace{y \in \mathbb{R}^K}_{\text{redukované}},\qquad K < d
:::

V obou případech je cíl stejný: snížit dimenzi z $d$ na $K < d$ a přitom zachovat co nejvíc informace užitečné pro klasifikaci.

::: quiz "Čím se liší extrakce příznaků od výběru příznaků?"
- [ ] Extrakce funguje jen na obrazech, výběr jen na textu
- [x] Výběr ponechá podmnožinu původních příznaků; extrakce vytvoří nové příznaky jako kombinace původních
  > PCA i LDA jsou extrakce — nové osy jsou lineární kombinace původních souřadnic, ne pouhý výběr některých z nich.
- [ ] Výběr zvyšuje dimenzi, extrakce ji snižuje
- [ ] Jsou to dva názvy pro tutéž operaci
:::

::: link "Bishop — Pattern Recognition and Machine Learning (kap. 12: Continuous Latent Variables)" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Bishop, C. M.: „Pattern Recognition and Machine Learning" (Springer 2006, [PRML](https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/)) — kap. 12; Bellman, R.: „Adaptive Control Processes" (Princeton 1961) — původ pojmu prokletí dimenzionality.*
