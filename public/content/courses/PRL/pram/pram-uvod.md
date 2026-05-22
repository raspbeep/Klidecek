---
title: PRAM — model paralelního výpočtu
---

# PRAM — Parallel Random Access Machine

Předchozí kapitola ([[paralelizace-uvod]], [[amdahl-gustafson]], [[flynn-klasifikace]]) probrala *limity* paralelizace a *taxonomii* hardwaru. Při návrhu a analýze paralelních algoritmů ale potřebujeme **formální výpočetní model** — analogii Turingova stroje pro paralelní svět, abstrahovanou od konkrétního hardwaru. **PRAM** (Parallel Random Access Machine) je takový model. Je *synchronní*, používá *sdílenou paměť* a každý procesor vykonává v každém kroku jednoduchou RAM operaci. Většina teoretické paralelní algoritmiky (analýza časové složitosti, dolní meze, optimalita) je formulována právě v PRAM.

## Motivace — proč abstraktní model

Reálné paralelní stroje se liší v desítkách parametrů: sdílená vs distribuovaná paměť, typ propojovací sítě, latence, šířka pásma, cache koherence, šíření chyb, synchronizační primitiva. Návrhář algoritmu *nemůže* zohlednit všechny tyto detaily — potřebuje **rozhraní**, které odděluje *vysokoúrovňový* návrh algoritmu od *nízkoúrovňové* implementace.

PRAM hraje tuto roli stejně, jako sekvenční **RAM** (Random Access Machine) hraje roli pro analýzu sekvenčních algoritmů ve stylu CLRS. Programátor PRAM nemusí vědět *jak* se komunikace fyzicky uskutečňuje — stačí mu *co* se má kde sdílet.

Zároveň: dolní meze odvozené v PRAM platí *automaticky* pro slabší (realističtější) modely — pokud daný problém *nelze* na PRAM vyřešit rychleji než v $\Omega(\log n)$, pak ho nelze vyřešit rychleji ani na cluster s message-passing rozhraním.

## Definice modelu

**PRAM** se skládá z:

- $p$ **procesorů** $P_1, P_2, \dots, P_p$, každý je *standardní RAM* (sekvenční stroj s lokální pamětí, aditivními a multiplikativními instrukcemi, podmíněnými skoky a indexovým adresováním).
- $m$ buněk **sdílené paměti** $M_1, M_2, \dots, M_m$.
- Společného **řízení** — všechny procesory pracují *synchronně*, v jednom *taktu* (kroku).

::: svg "Architektura PRAM — procesory, lokální paměti, sdílená paměť"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="200" y="15" width="140" height="28" rx="3"/>
    <rect x="30" y="75" width="80" height="40"/>
    <rect x="130" y="75" width="80" height="40"/>
    <rect x="330" y="75" width="80" height="40"/>
    <rect x="430" y="75" width="80" height="40"/>
    <rect x="30" y="125" width="80" height="22"/>
    <rect x="130" y="125" width="80" height="22"/>
    <rect x="330" y="125" width="80" height="22"/>
    <rect x="430" y="125" width="80" height="22"/>
    <rect x="50" y="170" width="440" height="35"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="34">Společné řízení (program counter)</text>
    <text x="70" y="92">RAM₁</text>
    <text x="170" y="92">RAM₂</text>
    <text x="370" y="92">RAM₃</text>
    <text x="470" y="92">RAMₚ</text>
    <text x="70" y="140" font-size="10">LM₁</text>
    <text x="170" y="140" font-size="10">LM₂</text>
    <text x="370" y="140" font-size="10">LM₃</text>
    <text x="470" y="140" font-size="10">LMₚ</text>
    <text x="270" y="192" font-style="italic">Sdílená paměť  M₁ … Mₘ</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="270" y="115">⋯</text>
    <text x="270" y="160">⋯</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="270" y1="43" x2="70" y2="75"/>
    <line x1="270" y1="43" x2="170" y2="75"/>
    <line x1="270" y1="43" x2="370" y2="75"/>
    <line x1="270" y1="43" x2="470" y2="75"/>
    <line x1="70" y1="147" x2="70" y2="170"/>
    <line x1="170" y1="147" x2="170" y2="170"/>
    <line x1="370" y1="147" x2="370" y2="170"/>
    <line x1="470" y1="147" x2="470" y2="170"/>
  </g>
</svg>
:::

Každý procesor má:

- **lokální paměť** (vlastní RAM registry),
- **unikátní index** $i \in \{1, \dots, p\}$, který může číst za běhu (typický prostředek paralelní algoritmizace: „pokud `i = 0`, dělej X, jinak Y").

## Krok výpočtu — tříflázový model

Jeden krok PRAM se skládá ze *tří fází*, vykonávaných všemi procesory současně:

1. **Read** — každý procesor přečte (nanejvýš jednu) buňku sdílené paměti do své lokální paměti.
2. **Local op** — provede lokální výpočet (aritmetika, porovnání, podmínka).
3. **Write** — zapíše (nanejvýš jeden) výsledek do (nanejvýš jedné) buňky sdílené paměti.

Toto rozdělení **zjednodušuje analýzu** — read a write fáze jsou striktně oddělené, takže konflikt přístupu k téže buňce se řeší *jen* mezi procesory ve *stejné* fázi. Zavedení tří fází mění čas běhu jen o konstantní násobek.

Procesory mohou v jednom kroku vykonávat *různé operace* — PRAM je tedy ve Flynnově klasifikaci **MIMD** se sdílenou pamětí (i když pro mnohé algoritmy se SIMD-styl vykonávání nabízí).

## Vstup a výstup

**Vstup** velikosti $n$ je zpravidla na začátku v prvních $n$ buňkách sdílené paměti $M_1, \dots, M_n$ (pro $n \le m$). Výstup se objeví v prvních $n'$ buňkách na konci výpočtu.

Když je sdílená paměť malá ($m \ll n$), vstup se rozdělí *přibližně rovnoměrně* mezi lokální paměti procesorů. Variantou je *separátní read-only paměť* obsahující vstup — někdy umožňuje rychlejší algoritmy než když je vstup ve sdílené paměti.

## Čas, počet procesorů, práce

Pro PRAM algoritmus na vstupu velikosti $n$ se sledují tři veličiny:

- $t(n)$ — **čas běhu** = počet kroků (paralelních taktů).
- $p(n)$ — **počet procesorů** (může záviset na $n$).
- $c(n) = p(n) \cdot t(n)$ — **cena (cost)** = celková „procesorová práce".

Definice **optimality** (viz [[amdahl-gustafson]]):

- **Cost-optimal**: $c(n) = O(T_\text{sekv}(n))$ — algoritmus *neplýtvá* paralelní prací oproti nejlepšímu sekvenčnímu řešení.
- **Efficient** (silnější vyjádření): $p(n) \cdot t(n)$ je do konstantního násobku stejné jako sekvenční složitost. Každý efficient je cost-optimal; opak neplatí.

Konkrétní příklad: redukce $n$ čísel.

- Sekvenčně: $T_\text{sekv} = O(n)$.
- Naivně paralelně s $p = n/2$ procesory: $t = O(\log n)$, $c = (n/2)\log n = O(n\log n)$. *Není* cost-optimal.
- Brentova konstrukce: $p = n/\log n$, $t = O(\log n)$, $c = O(n)$. *Je* cost-optimal.

## Simulace mezi PRAM s různým počtem procesorů

Vlastnost PRAM (a velký zdroj jeho síly jako modelu): algoritmus napsaný pro velký $p$ lze automaticky simulovat menším počtem procesorů.

::: math
\text{Věta (Brent, 1974).} \quad \text{Algoritmus, který běží na PRAM s } p \text{ procesory v } t \text{ krocích,} \\
\text{lze simulovat na PRAM s } p' \le p \text{ procesory v } O\!\left(\dfrac{t \cdot p}{p'}\right) \text{ krocích.}
:::

**Důkaz.** Rozdělíme původních $p$ procesorů do $p'$ skupin po maximálně $\lceil p/p' \rceil$ procesorech. Každý ze simulujících $p'$ procesorů má na starost jednu skupinu. Pro simulaci jednoho původního kroku každý simulující procesor sekvenčně provede *read fázi* všech procesorů ve své skupině, poté *local* fáze a nakonec *write* fázi. Jeden simulační krok tak trvá $O(p/p')$ skutečných kroků; celkem $O(tp/p')$.

::: svg "Brentova simulace — p procesorů rozděleno do p′ skupin"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" fill="var(--bg-card)" stroke-width="0.8">
    <rect x="30" y="30" width="20" height="20"/>
    <rect x="55" y="30" width="20" height="20"/>
    <rect x="80" y="30" width="20" height="20"/>
    <rect x="105" y="30" width="20" height="20"/>
    <rect x="130" y="30" width="20" height="20"/>
    <rect x="155" y="30" width="20" height="20"/>
    <rect x="180" y="30" width="20" height="20"/>
    <rect x="205" y="30" width="20" height="20"/>
    <rect x="230" y="30" width="20" height="20"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" stroke-dasharray="3 2">
    <rect x="26" y="26" width="78" height="28"/>
    <rect x="104" y="26" width="78" height="28"/>
    <rect x="182" y="26" width="72" height="28"/>
  </g>
  <text x="65" y="70" fill="var(--accent)" text-anchor="middle" font-size="10">skupina 1</text>
  <text x="143" y="70" fill="var(--accent)" text-anchor="middle" font-size="10">skupina 2</text>
  <text x="218" y="70" fill="var(--accent)" text-anchor="middle" font-size="10">skupina 3</text>
  <text x="140" y="20" text-anchor="middle" fill="var(--text-muted)" font-size="10">p = 9 původních procesorů</text>
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="30" y="120" width="60" height="32"/>
    <rect x="120" y="120" width="60" height="32"/>
    <rect x="210" y="120" width="60" height="32"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="140">P₁'</text>
    <text x="150" y="140">P₂'</text>
    <text x="240" y="140">P₃'</text>
  </g>
  <text x="150" y="105" text-anchor="middle" fill="var(--text-muted)" font-size="10">p' = 3 simulující</text>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="65" y1="55" x2="60" y2="120"/>
    <line x1="143" y1="55" x2="150" y2="120"/>
    <line x1="218" y1="55" x2="240" y2="120"/>
  </g>
  <text x="380" y="80" fill="var(--text)" font-size="11">Každý P′ sekvenčně simuluje</text>
  <text x="380" y="95" fill="var(--text)" font-size="11">⌈p/p′⌉ = 3 procesory:</text>
  <text x="380" y="115" fill="var(--text-muted)" font-size="10">read fáze (3× po sobě),</text>
  <text x="380" y="130" fill="var(--text-muted)" font-size="10">local fáze (3×),</text>
  <text x="380" y="145" fill="var(--text-muted)" font-size="10">write fáze (3×).</text>
  <text x="380" y="170" fill="var(--accent)" font-size="11">Čas: t · ⌈p/p′⌉ = O(tp/p')</text>
</svg>
:::

**Důsledek.** Procesor-časový součin $p \cdot t$ libovolného PRAM algoritmu je *aspoň* (do konstanty) roven sekvenční časové složitosti. Tj. dolní mez sekvenčního času dává *dolní* mez na součin $pt$. Toto je *základní* dolní mez paralelní algoritmiky.

## Optimální vs efficient — terminologická hierarchie

V literatuře (zejména Akl, *Design and Analysis of Parallel Algorithms*, 1989) se vyskytují tyto pojmy:

- **Optimal PRAM algorithm**: pro každé zlepšení času je nutné zhoršení počtu procesorů (a obráceně) o víc než konstantu — algoritmus leží na *Pareto* hranici.
- **Efficient**: $p \cdot t$ je do konstanty stejné jako *sekvenční složitost*. Všechny efficient algoritmy jsou optimal; opačně ne.

Některé prameny definují „optimal" jako „$p \cdot t$ je do konstanty rovno *nejlepší známé* sekvenční složitosti" — definice je *kluzká*, protože když najdeme rychlejší sekvenční algoritmus, paralelní *přestane* být optimal.

## Co PRAM ignoruje

PRAM záměrně abstrahuje od:

- **Paměťové organizace** — neexistuje cache hierarchie, NUMA, banks.
- **Komunikační topologie** — všechny procesory mají rovnocenný přístup ke všem buňkám.
- **Latence** — read a write jsou *konstantního* času.
- **Konflikty na sběrnici** — pokud je dovoleno paralelní čtení/zápis, jsou *zdarma*.

Toto je *nereálné* — žádný skutečný stroj nemá konstantní přístup do paměti pro neomezený počet procesorů. PRAM přesto má hodnotu: dolní meze v něm platí pro *jakýkoli* realistický stroj, a horní meze (algoritmy) lze často *kompilovat* do skutečných strojů s logaritmickým zpomalením.

## Co dál

PRAM definuje *čtyři varianty* podle toho, zda je dovoleno *paralelní čtení* a/nebo *paralelní zápis*. [[pram-varianty]] zavádí **EREW**, **CREW**, **CRCW** a podtypy CRCW (COMMON / ARBITRARY / PRIORITY). [[pram-simulace]] ukáže, *jak* silnou variantu simulovat slabší — což překládá algoritmy mezi modely. [[pram-algoritmy]] aplikuje PRAM na konkrétní úlohy: paralelní redukci, hledání minima, jednoduché výpočty.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 2; Reif, J.: *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993), kap. 20 ([online ZIP](https://www.cs.duke.edu/~reif/paper/SyntPA.html)); Fortune, S., Wyllie, J.: „Parallelism in random access machines" (STOC 1978, [DOI 10.1145/800133.804339](https://doi.org/10.1145/800133.804339)); Brent, R.P.: „The Parallel Evaluation of General Arithmetic Expressions" (J. ACM 21(2), 1974, [DOI 10.1145/321812.321815](https://doi.org/10.1145/321812.321815)); JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 1–2.*
