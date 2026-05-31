---
title: Konzistentní řez a podmínky C1/C2
---

V distribuovaném systému neexistuje sdílená paměť ani jednotné fyzické hodiny, podle kterých by všechny uzly „současně“ zapsaly svůj stav. Přesto potřebujeme umět o systému uvažovat jako o celku — například při detekci uváznutí, kontrolním bodu (checkpoint) nebo distribuovaném ladění. K tomu slouží pojem **globální stav**.

**Globální stav** distribuovaného výpočtu je sjednocení dvou složek:

* **lokální stavy procesů** $LS_i$ — co každý proces $P_i$ právě „ví“ a má uloženo (hodnoty proměnných, fronty, čítače),
* **stavy komunikačních kanálů** $SC_{ij}$ — množina zpráv, které byly procesem $P_i$ odeslány procesu $P_j$, ale ten je ještě nepřijal (zprávy *v tranzitu*).

Kanály se do globálního stavu počítají proto, že odeslaná, ale nedoručená zpráva je reálná část výpočtu — kdybychom ji ignorovali, snímek by „ztratil“ data, která jsou prokazatelně na cestě.

## Řez výpočtu

Výpočet lze nakreslit jako prostoro-časový diagram: každý proces je vodorovná časová osa s událostmi (interní krok, `send`, `receive`), šipky mezi osami představují zprávy. **Řez (cut)** je čára, která na každé ose vybere jeden okamžik — vše vlevo od řezu je *minulost*, vše vpravo *budoucnost*. Globální stav je obraz systému přesně podél tohoto řezu.

Ne každý řez ale dává smysl. Klíčová je relace **nastalo-před** (*happened-before*, $\to$) z [[logicky-cas]]: událost `send(m)` vždy nastala před odpovídajícím `receive(m)`. Řez musí být s touto kauzalitou v souladu.

::: math
\text{Řez } C \text{ je konzistentní} \iff \big(\forall e,e':\ e \in C \wedge e' \to e \ \Rightarrow\ e' \in C\big)
:::

Slovy: pokud řez obsahuje nějakou událost, musí obsahovat i **všechny její kauzální příčiny**. Konzistentní řez je tedy *uzavřený vůči relaci nastalo-před* — nelze zaznamenat následek, jehož příčina by spadala do budoucnosti.

::: viz pdi-konzistentni-rez "Táhni řez na každém procesu. Šipka zprava doleva (z budoucnosti do minulosti) je kauzální porušení — řez se zbarví červeně."
:::

Geometricky to znamená jedno jediné pravidlo: **žádná šipka zprávy nesmí mířit z budoucnosti do minulosti**. Šipka vedoucí z minulosti do budoucnosti je v pořádku — odpovídá zprávě v tranzitu (odeslána, ještě nedoručena). Šipka opačným směrem by znamenala přijetí zprávy, která ještě nebyla odeslána — fyzikální nemožnost.

## Podmínky C1 a C2

Co znamená „být v souladu s kauzalitou“ konkrétně pro každou zprávu? Formálně se konzistence globálního stavu zachycuje dvěma podmínkami nad obsahem snímku. Uvažujme zprávu $m_{ij}$ posílanou z $P_i$ do $P_j$.

**Podmínka C1 — zachycení zpráv z minulosti.** Pokud řez zaznamená *odeslání* zprávy (událost `send` je v lokálním stavu $LS_i$), musí být tato zpráva ve snímku někde přítomna: buď už *doručená* u příjemce, nebo *v tranzitu* v kanálu — a právě v jednom z těchto míst (exkluzivní disjunkce $\oplus$, tedy XOR).

::: math
\text{send}(m_{ij}) \in LS_i \ \Rightarrow\ \big(m_{ij} \in SC_{ij}\big) \oplus \big(\text{rec}(m_{ij}) \in LS_j\big)
:::

C1 zaručuje, že se z výpočtu žádná odeslaná zpráva „neztratí“. Kdyby `send` byl v minulosti, ale zpráva nebyla ani v kanálu, ani u příjemce, snímek by tvrdil, že proces poslal zprávu, která zmizela.

**Podmínka C2 — zákaz efektu bez příčiny.** Pokud řez zprávu *neodeslal* (`send` spadá do budoucnosti, není v $LS_i$), pak tato zpráva nesmí být ve snímku nikde evidována — ani v kanálu, ani jako přijatá.

::: math
\text{send}(m_{ij}) \notin LS_i \ \Rightarrow\ \big(m_{ij} \notin SC_{ij}\big) \wedge \big(\text{rec}(m_{ij}) \notin LS_j\big)
:::

C2 je tou skutečně netriviální podmínkou — vylučuje **efekt bez příčiny**. Klasickým důsledkem jejího porušení je **fantomové uváznutí (ghost deadlock)**: pokud by snímek zachytil přijetí zprávy „žádám o zdroj“, ale neobsahoval její odeslání (které se ve skutečnosti stane až později), monitor by vyhodnotil neexistující kruhové čekání a hlásil uváznutí, které v reálném výpočtu nikdy nenastalo.

| Podmínka | Co hlídá | Porušení vede k |
| :--- | :--- | :--- |
| **C1** | každá odeslaná zpráva z minulosti je ve snímku (u příjemce *nebo* v kanálu) | ztracená zpráva, neúplný stav |
| **C2** | žádná zpráva z budoucnosti není ve snímku zachycena | efekt bez příčiny, *ghost deadlock* |

Řez na obrázku výše porušující C2 je přesně ten, kde šipka vede z budoucnosti odesílatele do minulosti příjemce.

## Stupně konzistence a zprávy v tranzitu

Podle toho, co snímek říká o kanálech (mohou v nich, nebo nemohou být zprávy v tranzitu), rozlišujeme tři úrovně.

::: svg "Tři stupně konzistence globálního stavu — vztah kauzality a prázdnosti kanálů"
<svg viewBox="0 0 540 196" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect x="14" y="20" width="166" height="160" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <rect x="187" y="20" width="166" height="160" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <rect x="360" y="20" width="166" height="160" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="97" y="40" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text)">Slabě konzistentní</text>
  <text x="270" y="40" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--text)">Beztranzitní</text>
  <text x="443" y="40" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--accent)">Silně konzistentní</text>
  <text x="97" y="74" text-anchor="middle" font-size="10" fill="var(--text-muted)">C1 ∧ C2</text>
  <text x="97" y="90" text-anchor="middle" font-size="10" fill="var(--text-muted)">kanály smí mít</text>
  <text x="97" y="105" text-anchor="middle" font-size="10" fill="var(--text-muted)">zprávy v tranzitu</text>
  <text x="270" y="74" text-anchor="middle" font-size="10" fill="var(--text-muted)">všechny kanály</text>
  <text x="270" y="90" text-anchor="middle" font-size="10" fill="var(--text-muted)">prázdné</text>
  <text x="270" y="105" text-anchor="middle" font-size="10" fill="var(--text-muted)">SC_ij = ∅</text>
  <text x="443" y="74" text-anchor="middle" font-size="10" fill="var(--text-muted)">C1 ∧ C2</text>
  <text x="443" y="90" text-anchor="middle" font-size="10" fill="var(--text-muted)">a zároveň</text>
  <text x="443" y="105" text-anchor="middle" font-size="10" fill="var(--text-muted)">prázdné kanály</text>
  <text x="97" y="148" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">kauzálně v pořádku,</text>
  <text x="97" y="162" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">data jsou na cestě</text>
  <text x="270" y="148" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">sám o sobě</text>
  <text x="270" y="162" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">negarantuje C2</text>
  <text x="443" y="148" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">průnik obojího —</text>
  <text x="443" y="162" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">nejsilnější záruka</text>
</svg>
:::

* **Slabě konzistentní stav** (často jen „konzistentní“) — splňuje C1 i C2, přičemž v kanálech *mohou* být zprávy v tranzitu. To je přesně stav odpovídající libovolnému konzistentnímu řezu.
* **Beztranzitní stav (transitless)** — všechny kanály jsou prázdné ($SC_{ij} = \emptyset$): nic není na cestě, vše odeslané bylo doručeno. Prázdnost kanálů sama o sobě ale ještě nezaručuje kauzální konzistenci.
* **Silně konzistentní stav (strongly consistent)** — průnik obou: splňuje C1 i C2 *a zároveň* jsou všechny kanály prázdné. Je to nejsilnější garance — stav, do nějž by systém mohl reálně dospět a „zastavit se“ bez žádné nedoručené zprávy.

::: quiz "Snímek zaznamenal u procesu P_j přijetí zprávy m, ale u odesílatele P_i událost send(m) není (spadá do budoucnosti řezu). Která podmínka je porušena a čím to hrozí?"
- [ ] C1 — odeslaná zpráva se ztratila.
  > C1 řeší opačný směr: zprávu odeslanou v minulosti, která chybí ve snímku. Zde je problém v přijaté zprávě bez odeslání.
- [x] C2 — vznikl efekt bez příčiny (např. ghost deadlock).
  > Přesně. Příjem bez odpovídajícího odeslání je následek bez příčiny; monitor může vyhodnotit fiktivní stav, který reálně nikdy nenastal.
- [ ] Žádná — jde o běžnou zprávu v tranzitu.
  > Zpráva v tranzitu je odeslaná, ale nedoručená (minulost → budoucnost). Zde je to naopak: doručená, ale neodeslaná.
:::

::: link "Kshemkalyani, Singhal — Distributed Computing: Principles, Algorithms, and Systems (kap. 4, Global State)" "https://www.cs.uic.edu/~ajayk/Chapter4.pdf"
:::

::: link "Mattern, F. — Virtual Time and Global States of Distributed Systems (1988)" "https://courses.csail.mit.edu/6.852/01/papers/VirtTime_GlobState.pdf"
:::

---

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Kshemkalyani & Singhal (Distributed Computing, kap. 2 a 4), Mattern (Virtual Time and Global States, 1988), Chandy & Lamport (Distributed Snapshots, ACM TOCS 1985), Coulouris et al. (Distributed Systems, 5. vyd., kap. 14).*
