---
title: Fuzzy řízení (Mamdani)
---

# Fuzzy řízení (Mamdani)

Představ si, že máš regulovat klimatizaci. Klasický (PID) regulátor potřebuje **přesný matematický model** soustavy — rovnice, jak teplota reaguje na výkon. U složitých, nelineárních nebo špatně popsatelných soustav takový model buď nemáme, nebo je děsivě složitý.

**Fuzzy regulátor** to obejde elegantně: místo rovnic v něm sedí **slovní pravidla** typu *„když je moc horko, chlaď silně"* — přesně tak, jak by problém popsal zkušený člověk. Tato pravidla zvládnou nelinearitu a nepřesnost přirozeně, protože překrývající se fuzzy množiny dělají mezi pravidly **plynulé přechody** (žádné skoky na ostrých prazích).

Nejrozšířenější je **Mamdaniho** typ regulátoru. Pracuje ve třech krocích: **fuzzifikace → inference → defuzzifikace**.

## Krok 1: Fuzzifikace

Ostrou naměřenou hodnotu (např. odchylku teploty od žádané, tzv. *chybu* $e = 25\,°\text{C}$) převedeme na **stupně příslušnosti** k jednotlivým termům vstupní lingvistické proměnné. Stačí odečíst hodnoty funkcí příslušnosti v daném bodě:

::: math
\mu_{\text{nízká}}(25) = 0{,}0 \qquad \mu_{\text{střední}}(25) = 0{,}8 \qquad \mu_{\text{vysoká}}(25) = 0{,}2
:::

Vstup tedy „aktivuje" termy *střední* (silně) a *vysoká* (slabě) zároveň. To je důvod, proč výstup neskáče — vstup plynule přechází mezi pojmy.

## Krok 2: Inference (vyhodnocení pravidel)

Jádrem regulátoru je **báze pravidel** ve tvaru IF-THEN, kde na pravé straně (v *následku*) je u Mamdaniho modelu zase fuzzy množina:

```
R1: IF chyba JE vysoká   THEN akce JE silná
R2: IF chyba JE střední  THEN akce JE střední
R3: IF chyba JE nízká    THEN akce JE slabá
```

Inference proběhne pro každé pravidlo zvlášť ve dvou fázích:

1. **Síla aktivace** (firing strength) — jak moc je splněn předpoklad. U jednoduché podmínky je to přímo příslušnost vstupu; u složené podmínky spojené **AND** se vezme **minimum** (T-norma), u **OR** maximum (S-norma). Pro chybu 25 vyjde síla R2 (term *střední*) = 0,8 a síla R1 (term *vysoká*) = 0,2; pravidlo R3 (term *nízká*) se vůbec neaktivuje, protože $\mu_{\text{nízká}}(25) = 0$.
2. **Ořez následku** — výstupní fuzzy množinou pravidla se „seřízne" právě touto silou: pomocí operace **min** se shora omezí na výšku rovnou síle aktivace. Z trojúhelníku *silná* tak zbude jeho seříznutá (plochá) verze ve výšce 0,2.

Když máme více pravidel, jejich seříznuté výstupní množiny **sloučíme dohromady** operací **max** (S-norma) do jediné výsledné plochy:

::: math
\mu_{\text{out}}(v) = \max_{i}\ \min\big(\underbrace{w_i}_{\text{síla } i\text{-tého pravidla}},\ \mu_{B_i}(v)\big)
:::

Tohle je zobecněný *modus ponens*: z pravidla $A \to B$ a faktu $X$ odvozujeme výsledek $Y$ pomocí **max-min kompozice**.

::: viz fuzzy-control "Táhni vstupní chybou. Uvidíš, které pravidlo se jak silně aktivuje, jak se seřízne každý výstupní term, jak se sloučí do jedné plochy — a jakou ostrou hodnotu z ní vypadne po defuzzifikaci těžištěm."
:::

## Krok 3: Defuzzifikace

Výsledkem inference je fuzzy plocha, ale akční člen (motor, ventil) potřebuje **jedno ostré číslo**. Defuzzifikace ho z plochy vytáhne. Nejpoužívanější je metoda **těžiště** (COG — *center of gravity* / centroid): najde vodorovnou souřadnici geometrického středu plochy.

::: math
v^{*} = \frac{\displaystyle\int v \cdot \mu_{\text{out}}(v)\,\mathrm{d}v}{\displaystyle\int \mu_{\text{out}}(v)\,\mathrm{d}v}
\qquad\text{(diskrétně: } v^{*} = \frac{\sum_k v_k\,\mu_{\text{out}}(v_k)}{\sum_k \mu_{\text{out}}(v_k)}\text{)}
:::

Těžiště přirozeně **zprůměruje vliv všech aktivních pravidel** vážený jejich silou — silněji aktivované pravidlo „přitáhne" výsledek víc ke svému následku. Proto je výstup hladký a kompromisní, ne skokový.

> Existuje i druhý hlavní typ regulátoru — **Takagi-Sugeno**. Tam následek pravidla není fuzzy množina, ale ostrá funkce vstupů, např. `THEN akce = 2·chyba + 5`. Výstup je pak rovnou vážený průměr těchto funkcí a **drahá defuzzifikace plochy odpadá**. Mamdani je čitelnější a intuitivnější, Sugeno je výpočetně levnější a snadno se trénuje (toho využívá ANFIS).

## Příklad: odhad rizika půjčky

Pojďme celý cyklus projít na číslech. Vstup *Score* (0–100 bodů), výstup *Risk* (0–100 %), dva termy u každého a dvě pravidla, která by definovali zkušení bankéři:

```
R1: IF Score JE nízké  THEN Risk JE velké
R2: IF Score JE vysoké THEN Risk JE malé
```

Aby šel příklad dopočítat, ať si zafixujeme i **tvar výstupních množin**: jsou to dva trojúhelníky na ose Risk s vrcholem v krajích a poloviční šířkou 25 — *malé* se středem v 0 % a *velké* se středem v 100 % (tedy $\mu_{\text{malé}}(v) = \max(0,\,1 - v/25)$ a $\mu_{\text{velké}}(v) = \max(0,\,1 - (100-v)/25)$).

Přijde klient se **Score = 40**.

1. **Fuzzifikace:** z grafů odečteme $\mu_{\text{nízké}}(40) = 0{,}7$, $\mu_{\text{vysoké}}(40) = 0{,}3$.
2. **Inference:** R1 aktivováno silou 0,7 → term *velké* seřízneme na výšku 0,7. R2 silou 0,3 → term *malé* na 0,3. Sloučíme operací max.
3. **Defuzzifikace:** těžiště (COG) sloučené plochy vyjde přibližně **Risk ≈ 62 %** (spočítáno stejným diskrétním vzorcem jako ve viz výše).

Systém tedy „zreplikoval cit bankéřů": skóre 40 odpovídá spíš vyššímu riziku, ale ne extrémnímu — a vyšlo to plynulou interpolací mezi oběma pravidly.

::: quiz "Pravidlo R1 *IF Score JE nízké THEN Risk JE velké* má pro daný vstup sílu aktivace 0,7. Co se s touto hodnotou stane při Mamdaniho inferenci?"
- [ ] Risk se rovnou nastaví na 70 % a defuzzifikace se přeskočí
  > Ne, 0,7 je síla aktivace (výška ořezu), ne výsledná ostrá hodnota. Tu dá až defuzzifikace sloučené plochy.
- [x] Výstupní množina *velké* se operací min seřízne na výšku 0,7 a sloučí se s ostatními
  > Správně: síla aktivace ořezává (min) tvar následku, ořezané plochy se spojí přes max a teprve pak defuzzifikujeme.
- [ ] 0,7 se vynásobí pravděpodobností pravidla R1
  > Pravidla nemají pravděpodobnost; 0,7 je čistě stupeň splnění předpokladu, ne pravděpodobnostní výrok.
- [ ] Pravidlo R2 se vypne, protože R1 má vyšší sílu
  > Ne — všechna pravidla přispívají současně; menší síla R2 dá jen nižší (slabší) příspěvek, nezmizí.
:::

::: link "Mamdani & Assilian — An experiment in linguistic synthesis with a fuzzy logic controller (1975)" "https://doi.org/10.1016/S0020-7373(75)80002-2"
:::

::: link "Zadeh — Fuzzy Sets (1965)" "https://doi.org/10.1016/S0019-9958(65)90241-X"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Mamdani, E.H., Assilian, S.: „An experiment in linguistic synthesis with a fuzzy logic controller" (Int. J. Man-Machine Studies, 1975, [DOI:10.1016/S0020-7373(75)80002-2](https://doi.org/10.1016/S0020-7373(75)80002-2)); Takagi, T., Sugeno, M.: „Fuzzy identification of systems and its applications to modeling and control" (IEEE Trans. SMC, 1985, [DOI:10.1109/TSMC.1985.6313399](https://doi.org/10.1109/TSMC.1985.6313399)).*
