---
title: Hrubé množiny a aproximační prostory
---

# Hrubé množiny a aproximační prostory

Představ si, že máš databázi pacientů a o každém znáš jen pár atributů — třeba *teplotu* a *krevní tlak*. Chceš zjistit, kdo má srdeční problém. Háček je v tom, že dva pacienti se stejnou teplotou i stejným tlakem ti připadají **úplně stejní** — podle dostupných atributů je nedokážeš rozlišit. A přesto jeden problém má a druhý ne. Co s takovou znalostí?

Přesně tohle řeší **hrubé množiny** (rough sets), které v roce 1982 zavedl Zdzisław Pawlak. Místo abychom předstírali, že cílovou množinu (např. „pacienti se srdečním problémem") umíme přesně popsat, **obklíčíme ji zevnitř a zvenku** dvěma množinami, které popsat umíme. Tím poctivě přiznáme, kde si jsme jistí a kde ne.

## Nerozlišitelnost: dva objekty, které pro nás splývají

Základ je relace **nerozlišitelnosti** (indiscernibility). Máme **univerzum** $U$ (množinu všech objektů, např. pacientů) a sadu atributů. Dva objekty $x, y$ jsou *nerozlišitelné* podle atributů $B$, když mají na **všech** atributech z $B$ stejné hodnoty. Jednoduše: data je od sebe neumí odlišit.

::: math
x \,\mathrm{IND}(B)\, y \quad\Longleftrightarrow\quad \forall a \in B:\; a(x) = a(y)
:::

Tato relace je **relace ekvivalence** (je reflexivní, symetrická a tranzitivní), takže rozdělí univerzum na **třídy ekvivalence**. Každé třídě říkáme **elementární množina** — je to nejmenší „balíček" objektů, který naše atributy ještě dokážou pojmenovat. Uvnitř jednoho balíčku jsou objekty navzájem nerozlišitelné, takže s nimi musíme zacházet jako s jedním celkem.

::: math
[x]_B = \{\, y \in U : x \,\mathrm{IND}(B)\, y \,\}
:::

> **Malý příklad.** $U = \{a,b,c,d,e,f\}$ a atributy nám dají rozklad
> $U/\mathrm{IND}(B) = \{\{a,b\},\{c,d,e\},\{f\}\}$. Pak $\{a,b\}$, $\{c,d,e\}$ a $\{f\}$ jsou elementární množiny. Objekty $c,d,e$ od sebe prostě neodlišíme.

## Aproximační prostor

**Aproximační prostor** je dvojice $S = (U, R)$, kde $U$ je univerzum a $R$ je relace ekvivalence (tj. naše nerozlišitelnost). $R$ rozseká $U$ na elementární množiny $R^* = \{X_1, X_2, \dots, X_n\}$. Tohle je jediná „surovina", se kterou pracujeme — z elementárních množin pak skládáme popisy.

Množinu, kterou **umíme** přesně poskládat jako sjednocení elementárních množin, nazýváme **definovatelná** (přesná) množina. Když takhle množinu poskládat **nelze** — protože „přetíná" některou elementární množinu napůl — je to **hrubá množina** (rough set).

> $X_1 \cup X_2 = \{a,b,c,d,e\}$ je definovatelná (je to přesně sjednocení dvou tříd). Naproti tomu $Y = \{b,c,d\}$ je hrubá: bere jen *kus* třídy $\{a,b\}$ a jen *kus* třídy $\{c,d,e\}$, takže ji z celých elementárních množin nesložíš.

## Dolní a horní aproximace

Když cílovou množinu $X \subseteq U$ neumíme popsat přesně, popíšeme ji **ze dvou stran**. Klíčová otázka u každé elementární množiny zní: *leží celá uvnitř $X$, nebo se s $X$ jen někde dotýká?*

**Dolní aproximace** $\underline{S}(X)$ = sjednocení těch tříd, které jsou **celé** uvnitř $X$. To jsou objekty, které do $X$ **určitě** patří — žádná pochybnost.

::: math
\underline{S}(X) = \bigcup_{X_i \subseteq X} X_i
:::

**Horní aproximace** $\overline{S}(X)$ = sjednocení těch tříd, které mají s $X$ **alespoň jeden** společný prvek. To jsou objekty, které do $X$ **možná** patří.

::: math
\overline{S}(X) = \bigcup_{X_i \cap X \neq \emptyset} X_i
:::

Vždy platí $\underline{S}(X) \subseteq X \subseteq \overline{S}(X)$ — pravdivá množina je sevřená mezi tím, co víme jistě, a tím, co nemůžeme vyloučit.

::: viz rough-sets "Univerzum rozdělené na elementární množiny (silně orámované bloky). Klikáním přepínáš, které objekty patří do cílové množiny X (tečka). Sleduj, jak se třídy obarví: sytě obarvená = dolní aproximace (celá v X, jistě uvnitř), slabě = hranice (třída do X zasahuje jen zčásti), bez výplně = mimo. Dole se přepočítává přesnost α."
:::

## Hraniční oblast: kde leží nejistota

Rozdíl horní a dolní aproximace je **hraniční oblast** (boundary region). To je srdce celé teorie — tady leží objekty, o kterých podle našich atributů **nedokážeme rozhodnout**, jestli do $X$ patří, nebo ne.

::: math
\mathrm{BND}_S(X) = \overline{S}(X) \setminus \underline{S}(X)
:::

Univerzum se tak rozpadne na tři oblasti:

- **pozitivní** $\mathrm{POS}_S(X) = \underline{S}(X)$ — objekty určitě v $X$,
- **hraniční** $\mathrm{BND}_S(X) = \overline{S}(X) \setminus \underline{S}(X)$ — objekty možná v $X$,
- **negativní** $\mathrm{NEG}_S(X) = U \setminus \overline{S}(X)$ — objekty určitě mimo $X$.

A teď to nejdůležitější kritérium: množina $X$ je **přesná (ostrá)** právě tehdy, když je hraniční oblast **prázdná** ($\underline{S}(X) = \overline{S}(X)$). Jakmile je hranice **neprázdná**, je $X$ **hrubá**.

> **Příklad.** $U = \{a,b,c,d,e,f,g\}$, rozklad $X_1=\{a,b\}$, $X_2=\{c,d\}$, $X_3=\{e,f,g\}$, cíl $X=\{b,c,d\}$.
> - $\underline{S}(X) = X_2 = \{c,d\}$ (jen $X_2$ leží celá v $X$).
> - $\overline{S}(X) = X_1 \cup X_2 = \{a,b,c,d\}$ ($X_1$ se s $X$ dotýká přes $b$).
> - $\mathrm{BND}_S(X) = \overline{S}(X)\setminus\underline{S}(X) = X_1 = \{a,b\}$.
> - $\mathrm{NEG}_S(X) = X_3 = \{e,f,g\}$.
>
> Hranice je neprázdná, takže $X$ je hrubá. Objekt $a$ do $X$ vlastně nepatří, ale protože je nerozlišitelný od $b$ (které tam patří), spadne celá třída $\{a,b\}$ do hranice.

## Přesnost a hrubost: změř to číslem

Jak moc je množina „rozmazaná", vyčíslíme jediným poměrem. **Přesnost aproximace** $\alpha_S(X)$ je podíl toho, co víme jistě, ku tomu, co nemůžeme vyloučit:

::: math
\alpha_S(X) = \frac{|\underline{S}(X)|}{|\overline{S}(X)|} \in [0, 1]
:::

- $\alpha_S(X) = 1$ → hranice je prázdná, množina je **přesná**.
- $\alpha_S(X) < 1$ → množina je **hrubá**; čím menší $\alpha$, tím větší nejistota.

Doplňkově se definuje **hrubost** (roughness) $\rho_S(X) = 1 - \alpha_S(X)$ — přímá míra neurčitosti. V příkladu výše je $\alpha = |\{c,d\}| / |\{a,b,c,d\}| = 2/4 = 0{,}5$, tedy $\rho = 0{,}5$.

::: quiz "Co znamená, že objekt $x$ leží v hraniční oblasti $\mathrm{BND}_S(X)$?"
- [ ] $x$ určitě patří do cílové množiny $X$
  > To je pozitivní oblast (dolní aproximace), ne hranice.
- [x] $x$ je nerozlišitelný od některého objektu z $X$ i od některého mimo $X$ — nelze rozhodnout
  > Třída $x$ má s $X$ neprázdný průnik (proto je v horní aproximaci), ale není celá v $X$ (proto chybí v dolní). Atributy na rozhodnutí nestačí.
- [ ] $x$ určitě nepatří do $X$
  > To je negativní oblast $U \setminus \overline{S}(X)$.
- [ ] $x$ je prvek, který nemá žádnou hodnotu atributu
  > Hraniční oblast nemá nic společného s chybějícími hodnotami; jde o nerozlišitelnost daným rozkladem.
:::

## Redukty a jádro: které atributy opravdu potřebuju

V praxi máme často víc atributů, než je nutné — některé jsou nadbytečné a rozklad univerza by zůstal stejný i bez nich. **Redukt** je **minimální** podmnožina atributů, která zachová **přesně stejný rozklad** (stejnou nerozlišitelnost) jako celá sada. „Minimální" znamená, že už nejde odebrat žádný další atribut, aniž by se rozklad změnil.

Reduktů může být víc — různé podmnožiny atributů mohou popisovat tatáž data. **Jádro** (core) je průnik všech reduktů: atributy, které jsou ve **každém** reduktu. Jsou to **nepostradatelné** atributy — kdybys některý z nich vyhodil, žádný redukt už nepokryje data správně a část rozlišovací schopnosti se nenávratně ztratí.

::: math
\mathrm{CORE}(B) = \bigcap \mathrm{RED}(B)
:::

> **Intuice.** Redukt je jako minimální sada otázek, kterou pořád rozeznáš všechny případy. Jádro jsou otázky, bez kterých to nikdy nepůjde — musí být v každé funkční sadě. Tohle je v podstatě **výběr atributů (feature selection)** odvozený přímo z teorie.

## Hrubé vs. fuzzy množiny: dva různé druhy „rozmazanosti"

Obojí pracuje s neurčitostí, ale **jinou**. Pleteme si je často, tak pozor na rozdíl.

**Fuzzy množina** řeší **vágnost stupně příslušnosti**: prvek patří do množiny *částečně*, s nějakým číslem $\mu(x) \in [0,1]$ (např. „teplota 37,5 °C patří do množiny *vysoká* na 0,6"). Hranice je rozostřená *u jednotlivého prvku*, ale o tom prvku víme všechno.

**Hrubá množina** řeší **nerozlišitelnost kvůli hrubým datům**: prvek do množiny patří plně, nebo plně nepatří (členství je $0/1$), jen **neumíme rozhodnout které**, protože ho nedokážeme odlišit od jeho sousedů. Neurčitost není ve stupni příslušnosti, ale v **rozlišovací schopnosti našich atributů**.

::: svg
<svg viewBox="0 0 340 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="340" height="150" fill="var(--bg-inset)"/>
  <text x="80" y="18" text-anchor="middle" font-size="11" fill="var(--text)">Fuzzy: stupeň příslušnosti</text>
  <text x="255" y="18" text-anchor="middle" font-size="11" fill="var(--text)">Hrubá: nerozlišitelnost</text>
  <!-- fuzzy: gradient membership -->
  <defs>
    <linearGradient id="fz" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="var(--accent)" stop-opacity="0.85"/>
      <stop offset="1" stop-color="var(--accent)" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect x="18" y="35" width="124" height="60" rx="6" fill="url(#fz)" stroke="var(--line-strong)" stroke-width="1"/>
  <text x="80" y="112" text-anchor="middle" font-size="9" fill="var(--text-muted)">μ(x) klesá plynule z 1 → 0</text>
  <text x="80" y="125" text-anchor="middle" font-size="9" fill="var(--text-faint)">jeden prvek, dílčí členství</text>
  <!-- rough: discrete cells, lower / boundary -->
  <g>
    <rect x="200" y="35" width="26" height="26" rx="3" fill="color-mix(in oklch, var(--accent) 55%, var(--bg-card))" stroke="var(--line-strong)"/>
    <rect x="228" y="35" width="26" height="26" rx="3" fill="color-mix(in oklch, var(--accent) 55%, var(--bg-card))" stroke="var(--line-strong)"/>
    <rect x="256" y="35" width="26" height="26" rx="3" fill="color-mix(in oklch, var(--accent) 18%, var(--bg-card))" stroke="var(--line-strong)"/>
    <rect x="284" y="35" width="26" height="26" rx="3" fill="color-mix(in oklch, var(--accent) 18%, var(--bg-card))" stroke="var(--line-strong)"/>
    <rect x="200" y="63" width="26" height="26" rx="3" fill="color-mix(in oklch, var(--accent) 55%, var(--bg-card))" stroke="var(--line-strong)"/>
    <rect x="228" y="63" width="26" height="26" rx="3" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <rect x="256" y="63" width="26" height="26" rx="3" fill="color-mix(in oklch, var(--accent) 18%, var(--bg-card))" stroke="var(--line-strong)"/>
    <rect x="284" y="63" width="26" height="26" rx="3" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  </g>
  <text x="255" y="112" text-anchor="middle" font-size="9" fill="var(--text-muted)">členství je 0/1, ale třídy splývají</text>
  <text x="255" y="125" text-anchor="middle" font-size="9" fill="var(--text-faint)">sytě = jistě (dolní), slabě = hranice</text>
</svg>
:::

Pawlak sám oba přístupy považoval za **komplementární** — řeší odlišné aspekty neurčitosti a v praxi (např. v *rough-fuzzy* hybridech) se dají kombinovat.

## Od aproximací k rozhodovacím pravidlům

K čemu to celé je? Hrubé množiny jsou základem **dolování pravidel** z dat. Vezmeme rozhodovací tabulku (podmínkové atributy $C$, rozhodovací atribut $D$) a pro každou elementární množinu se ptáme, jestli leží **celá** v jedné rozhodovací třídě.

- Pokud ano, indukujeme **jisté pravidlo** se spolehlivostí 1. Např. „teplota *normální* ∧ tlak *nízký* → bez srdečního problému" — všechny takové pacienty data klasifikují stejně.
- Pokud elementární množina spadá do hraniční oblasti (míchá obě rozhodnutí), získáme jen **nejisté pravidlo** se spolehlivostí $< 1$. Např. třída $\{e,f,g\}$ má dva pacienty s problémem a jednoho bez — pravidlo „→ problém ANO" má spolehlivost $2/3$.

Tahle myšlenka — jisté jádro plus poctivě označená šedá zóna — je přesně to, co dělá hrubé množiny užitečné pro dolování znalostí a redukci atributů v reálných datech.

::: quiz "Čím se hrubá množina liší od fuzzy množiny?"
- [ ] Hrubá množina je vždy konečná, fuzzy nekonečná
  > Velikost nosiče s tím nesouvisí; obě mohou být konečné i nekonečné.
- [x] U hrubé je členství 0/1, ale kvůli nerozlišitelnosti nevíme které; u fuzzy je členství plynulý stupeň v $[0,1]$
  > Hrubá množina řeší nedostatečnou rozlišovací schopnost atributů (hranice tříd), fuzzy řeší vágnost stupně příslušnosti jednotlivého prvku.
- [ ] Fuzzy množina potřebuje relaci ekvivalence, hrubá ne
  > Je to naopak: relace ekvivalence (nerozlišitelnost) je základ hrubých množin.
- [ ] Jsou to dva názvy pro totéž
  > Pawlak je výslovně považoval za komplementární, ne za totožné přístupy.
:::

::: link "Pawlak — Rough Sets (1982)" "https://doi.org/10.1007/BF01001956"
:::

::: link "Rough set — Wikipedia" "https://en.wikipedia.org/wiki/Rough_set"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Pawlak, Z.: „Rough Sets" (International Journal of Computer & Information Sciences, 1982, [doi:10.1007/BF01001956](https://doi.org/10.1007/BF01001956)); Pawlak, Z.: „Rough Sets: Theoretical Aspects of Reasoning about Data" (Kluwer, 1991); Pawlak, Z., Skowron, A.: „Rudiments of rough sets" (Information Sciences 177, 2007, [doi:10.1016/j.ins.2006.06.003](https://doi.org/10.1016/j.ins.2006.06.003)).*
