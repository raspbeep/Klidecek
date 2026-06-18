---
title: Genetické programování
---

# Genetické programování

Genetický algoritmus evolučně ladí **řetězec dat** pevné délky — třeba parametry součástky. Co kdyby ale samotné řešení, které hledáme, byl **program** nebo **vzorec**? Tedy nejen *jaké hodnoty*, ale *jaký výpočet*. Přesně to dělá **genetické programování (GP)**, které představil John Koza: aplikuje evoluci na **spustitelné programy / matematické výrazy** místo na pevné řetězce.

Příklad, který GP řeší přirozeně: dostaneš tabulku bodů $(x, y)$ a chceš najít vzorec $f(x)$, který je co nejlépe proloží. Tomu se říká **symbolická regrese** — nehledáš jen koeficienty dané rovnice, ale **rovnici samotnou**.

## Jedinec = strom výrazu

Klíčový rozdíl oproti GA je **reprezentace**. Jedinec v GP není řetězec pevné délky, ale **syntaktický strom proměnlivé velikosti**. Strom má dva druhy uzlů:

- **Funkce (vnitřní uzly)** — operace, které berou vstupy a něco s nimi dělají: aritmetika `+ − * /`, logika `AND OR`, podmínky `IF`.
- **Terminály (listy)** — vstupní proměnné (`x`, `y`) nebo konstanty (`3.14`, `5`). Nemají potomky.

Strom čteš jako výraz. Například výraz $x \cdot (x + 1)$ vypadá jako:

::: svg "Strom výrazu x * (x + 1): funkce ve vnitřních uzlech, terminály v listech"
<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <line x1="140" y1="34" x2="84" y2="84" stroke="var(--line-strong)" stroke-width="1.2"/>
  <line x1="140" y1="34" x2="196" y2="84" stroke="var(--line-strong)" stroke-width="1.2"/>
  <line x1="196" y1="84" x2="156" y2="134" stroke="var(--line-strong)" stroke-width="1.2"/>
  <line x1="196" y1="84" x2="236" y2="134" stroke="var(--line-strong)" stroke-width="1.2"/>
  <circle cx="140" cy="34" r="15" fill="var(--accent)" opacity="0.85"/>
  <text x="140" y="38" text-anchor="middle" font-size="13" fill="var(--bg-inset)" font-weight="600">*</text>
  <circle cx="84" cy="84" r="15" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="84" y="88" text-anchor="middle" font-size="12" fill="var(--text)">x</text>
  <circle cx="196" cy="84" r="15" fill="var(--accent)" opacity="0.85"/>
  <text x="196" y="88" text-anchor="middle" font-size="13" fill="var(--bg-inset)" font-weight="600">+</text>
  <circle cx="156" cy="134" r="15" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="156" y="138" text-anchor="middle" font-size="12" fill="var(--text)">x</text>
  <circle cx="236" cy="134" r="15" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="236" y="138" text-anchor="middle" font-size="12" fill="var(--text)">1</text>
  <text x="14" y="40" font-size="9.5" fill="var(--text-muted)">funkce =</text>
  <text x="14" y="52" font-size="9.5" fill="var(--text-muted)">vnitřní uzly</text>
  <text x="14" y="130" font-size="9.5" fill="var(--text-muted)">terminály =</text>
  <text x="14" y="142" font-size="9.5" fill="var(--text-muted)">listy</text>
  <text x="140" y="156" text-anchor="middle" font-size="10" fill="var(--text-faint)">strom výrazu  x * (x + 1)</text>
</svg>
:::

Funkce a terminály, ze kterých GP staví, tvoří tzv. **function set** a **terminal set**. Volí je řešitel podle úlohy — to je do velké míry, čím GP „nasměruje".

## Selekce a fitness

**Selekce** rodičů funguje stejně jako u GA — velmi často turnajový výběr. Mění se ale **vyhodnocení fitness**, a to je výpočetně dražší. Abys zjistil fitness jednoho stromu, musíš ho **spustit** nad sadou tréninkových dat a porovnat výstupy s požadovanými.

U symbolické regrese je fitness třeba **chyba** mezi tím, co strom spočítá, a skutečnými body — typicky **MSE** (střední kvadratická chyba). Pozor na orientaci: nižší MSE = lepší, takže fitness se obvykle definuje tak, aby ji algoritmus **minimalizoval** (nebo se převede na hodnotu, kterou maximalizuje, např. $1/(1+\text{MSE})$).

## Křížení: výměna podstromů

Protože jedinec je strom, i křížení vypadá jinak než u GA. **Stromové křížení** prohodí celé **podstromy**:

1. V každém z obou rodičů zvol náhodně jeden uzel — **bod křížení**.
2. Vyměň podstromy zakořeněné v těchto uzlech mezi rodiči.

Tím vzniknou dva potomci. Protože stromy nemají pevnou velikost ani tvar, křížení **přirozeně mění hloubku i velikost** programů — potomek může být mnohem větší nebo menší než rodič.

Drobnost, kterou původní popis často zjednodušuje: bod křížení může být **libovolný** uzel (i list). V praxi se ale podle Kozy uzly volí **se zkreslením ~90 % na vnitřní uzly (funkce) a 10 % na listy (terminály)** — kdyby se body braly úplně rovnoměrně, většina křížení by jen přehazovala jednotlivé listy a měnila by se málo.

::: viz gp-crossover "Dva rodičovské stromy výrazů. Vyber bod křížení v každém a klikni 'Zkřížit' — uvidíš, jak se vyměnou podstromů vytvoří dva potomci a jak se změní jejich velikost."
:::

## Mutace

Mutace v GP má dvě běžné podoby:

- **Podstromová mutace (subtree):** v náhodném uzlu odřízni stávající podstrom a na jeho místo vygeneruj **zcela nový náhodný podstrom** (do nějaké maximální hloubky). Mění strukturu i velikost.
- **Bodová mutace (point):** náhodný uzel jen **přepíše hodnotu** za jinou kompatibilní ze stejné sady — `+` → `−`, nebo `x` → `5`. **Topologie stromu se nemění.**

## Bloat: zbytnění kódu

Specifický problém GP je **bloat** (zbytnění): velikost a hloubka stromů během generací **nekontrolovaně rostou, aniž by se zlepšovala fitness**. Vznikají redundantní, „mrtvé" kusy kódu — třeba `x + 0` nebo `x * 1`, které nic nepřidají, ale strom nafukují. Velké stromy se pomaleji vyhodnocují, hůř interpretují a snáz přeučují.

Jak proti bloatu bojovat:

- **Parsimony pressure** — do fitness přidej penalizaci za velikost stromu (preferuj menší řešení při stejné kvalitě).
- **Limit hloubky/velikosti** — tvrdě omez maximální hloubku stromu.
- **Zjednodušující operátory** — mutace cílící na odstranění redundantních podstromů.

## Vztah ke genetickému algoritmu

GP je v podstatě **GA s pružnější reprezentací**. Sdílí stejný generační cyklus (inicializace → evaluace → selekce → operátory → náhrada) i stejnou filozofii selekčního tlaku, explorace a exploatace. Liší se jen tím, **co je jedinec** a **jak vypadají operátory**:

| | Genetický algoritmus | Genetické programování |
|---|---|---|
| jedinec | řetězec pevné délky | strom proměnlivé velikosti |
| křížení | výměna úseků řetězce | výměna podstromů |
| mutace | změna bitu / čísla | nový podstrom / záměna uzlu |
| typický cíl | parametry, kombinatorika | program, vzorec (symbolická regrese) |

(Pozn.: existuje i **kartézské GP**, kde se program kóduje jako mřížka uzlů místo stromu — to je samostatný okruh kurzu BIN.)

::: quiz "Čím se jedinec v genetickém programování liší od jedince v klasickém genetickém algoritmu?"
- [ ] Je to binární řetězec pevné délky, jen delší
  > To je reprezentace klasického GA. GP právě pevnou délku opouští.
- [x] Je to strom programu/výrazu proměnlivé velikosti (funkce ve vnitřních uzlech, terminály v listech)
  > Proto i operátory pracují se stromy: křížení = výměna podstromů, mutace = nový podstrom nebo záměna uzlu.
- [ ] Je to vždy číslo s plovoucí čárkou
  > Číslo je jen terminál (list); celý jedinec je strom skládající funkce a terminály.
- [ ] Nemá fitness, protože se nedá spustit
  > Naopak — fitness se získá tak, že se program spustí nad daty a výstup se porovná s cílem.
:::

::: link "Koza — Genetic Programming (overview)" "https://geneticprogramming.com/"
:::

::: link "Poli, Langdon, McPhee — A Field Guide to Genetic Programming (volně dostupná)" "https://dces.essex.ac.uk/staff/rpoli/gp-field-guide/"
:::

---

*Zdroj: SFC státnicové okruhy NMAL, VUT FIT. Externí reference: Koza, J.R.: „Genetic Programming: On the Programming of Computers by Means of Natural Selection" (MIT Press, 1992, [přehled](https://geneticprogramming.com/)); Poli, R., Langdon, W.B., McPhee, N.F.: „A Field Guide to Genetic Programming" ([2008, volně online](https://dces.essex.ac.uk/staff/rpoli/gp-field-guide/)).*
