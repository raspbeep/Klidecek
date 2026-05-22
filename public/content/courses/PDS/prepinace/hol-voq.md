# HOL blokování a Virtual Output Queues

Crossbar ([[architektury]]) je strukturálně neblokující — *má* cestu mezi libovolnou (vstup, výstup) dvojicí. V provozu ale dochází k **logickému blokování** zvanému **HOL** (*Head of Line*), které srazí propustnost na ~58 %. Tato sekce vysvětluje problém a řešení — **Virtual Output Queues (VOQ)**.

::: viz hol-voq "Klikni „krok" pro plánovač. Přepni VOQ — uvidíš, jak se zmizí blokování čela fronty."
:::

## Problém HOL

V *naivní* implementaci má každý vstupní port *jednu FIFO frontu*. Plánovač vidí jen *první* paket fronty (head of line). Pokud paket na hlavě *čeká* (protože jeho výstup je obsazen), všechny pakety *za ním* taky čekají — i kdyby chtěly jiný (volný) výstup.

### Analogie z dopravy

Auto na hlavě fronty *odbočuje vlevo*, blokuje červenou. Auta za ním chtějí *rovně*, ale stojí, protože nemají odbočovací pruh.

```
                          ┌───→ (volno)
[→][→][←][→][→][→] ──┤
                          └───  (zablokováno odbočujícím autem)
```

### Důsledek

Pro náhodný traffic na $N$ portech bez ochrany HOL: maximální propustnost = $2 - \sqrt{2} \approx 58{,}6\%$ (Karol et al., 1987). To je *katastrofálně málo* — kupujeme 100 Gb/s switch, dostaneme reálných 58 Gb/s.

## Řešení: Virtual Output Queues (VOQ)

**Idea:** přidat *odbočovací pruh* — rozdělit vstupní frontu na **jednu frontu na výstupní port**. Vizualizace nahoře přepne na VOQ režim při kliknutí na zaškrtávátko.

### Důsledky

- Pro každý vstupní port × výstupní port existuje *vlastní VOQ*.
- Pro $N \times N$ switch potřebujeme **$N^2$ front**.
- Plánovací algoritmus pracuje s **virtuálními frontami** — vidí *všechny* potenciální páry, ne jen head of FIFO.

### Náklady

- *Paměť*: $N^2$ front, každá s nějakou hloubkou.
- *Kontrola*: plánovač řeší $N^2$ stavů (binary requests).

Pro $N = 32$ portů je $N^2 = 1024$ — *zvládnutelné* v moderním ASIC. Pro $N = 256$ je $65\,536$ front — náročné, ale stále reálné s rychlou SRAM.

### Propustnost s VOQ

S VOQ + správným plánováním dosáhneme **~99 %** propustnosti pro náhodný traffic (McKeown, 1995). To je *zásadní* zlepšení proti 58 % HOL.

## Problém párování (matching)

S VOQ je plánovač řeší formálně:

> Z **bipartitního grafu** $G = (X \cup Y, E)$, kde $X$ = vstupní porty, $Y$ = výstupní porty, $E$ = požadavky (existuje VOQ s nenulovou délkou), najdi **párování** $M \subseteq E$ tak, že žádné dvě hrany v $M$ nemají společný vrchol.

```
vstupní porty       výstupní porty
     1   ────────       1
     2   ──┐            2
          ╲╲╲           
     3   ───╲╲          3
          ╲ ╲╲
     4   ──╲╲╲          4
          ╲╲╲╲
     X ────╲╲           Y
```

### Maximum vs maximal matching

- **Maximum matching** — *globální* maximum, párování s největším počtem hran.
- **Maximal matching** — *lokální* maximum, nelze přidat hranu bez zvýšení stupně uzlu.

Klasický příklad — 4 požadavky $\{(A,1), (A,2), (A,3), (B,1), (B,3), (B,4), (C,1), (C,3), (C,4), (D,2), (D,3), (D,4)\}$:

- **Maximum** $M_1$ — typicky 4 párování (např. $\{(A,2), (B,1), (C,4), (D,3)\}$).
- **Maximal** $M_2$ — může mít jen 3 (např. $\{(A,1), (B,4), (D,3)\}$ — nelze přidat čtvrté).

### Výpočetní složitost

- *Maximum matching* (Hopcroft-Karp): $\mathcal{O}(\sqrt{N} \cdot E)$ nebo $\mathcal{O}(N^{2{,}5})$ ve worst case.
- *Maximal matching* (greedy): $\mathcal{O}(N + E)$ — *mnohem rychlejší*.

Pro switch je *maximum matching* příliš pomalé — *nestihne se* v jednom časovém slotu (např. 1.6 ns na 100 Gb/s portu). Proto se používají **iterativní heuristiky** — PIM, iSLIP. Tyto **konvergují** k maximal matching pomocí *paralelních iterací*.

## Typy blokování v crossbaru

Kromě HOL existují další formy blokování:

- **Vstupní blokování (Input Blocking)** — víc buněk na různých VOQ téhož vstupu; jen *jedna* může být vybrána pro přenos.
- **Výstupní blokování (Output Blocking)** — víc požadavků na *jeden* výstup; jen jeden vstup může být vybrán.
- **Vnitřní blokování (Internal Blocking)** — pouze u *vícestupňových sítí*; v crossbaru nikdy (interně neblokující).

Plánovací algoritmy řeší *vstupní* a *výstupní* blokování. Vnitřní blokování řeší výběr *neblokující topologie* Clos sítě ([[multistage-clos-benes]]).

## Prioritní přeposílání

V iSLIP lze přidat **prioritní VOQ**:

- Pro každý (input, output) páru *více front* podle priority.
- Příklad: 4 priority → 16×16 switch má $16 \times 16 \times 4 = 1024$ VOQ.
- Vlastní ukazatele $I_i^k$ a $O_j^k$ pro každou prioritu.

Výběr spojení: výstup vybere požadavek s *nejvyšší prioritou $k$*; vstup vybere oprávnění s *nejvyšší prioritou $k$*.

Tím lze zajistit **QoS** — vysokopriorita (voice, video) má přednost před nízkou (best-effort).

## Co dále

S VOQ je problém *jak vybrat párování* — to řeší plánovací algoritmy. Začneme s **PIM** ([[planovani-pim]]) a pak **iSLIP** ([[planovani-islip]]).

---

*Zdroj: PDS přednáška 4, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Karol, M.J., Hluchyj, M.G., Morgan, S.P.: „Input Versus Output Queueing on a Space-Division Packet Switch" (IEEE Trans. Comm., 1987); McKeown, N.: „A Fast Switched Backplane for a Gigabit Switched Router" (Business Communications Review, 1997).*
