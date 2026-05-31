---
title: Obsluha přerušení (ISR)
---

Hlavní smyčka i stavové automaty pracují *polling*em — vstup se přečte teprve při dalším průchodu (viz [[super-loop]]). To je pro mnoho událostí příliš pomalé a nepřesné. **Přerušení** (*interrupt*) tento problém řeší: vnesou do jinak sekvenčního kódu **událostní orientaci** a umožní okamžitě reagovat na **asynchronní události** — vnější (hrana na pinu, příchozí bajt na UART) i vnitřní (přetečení časovače, dokončení převodu ADC) — bez čekání na smyčku.

Když hardware ohlásí přerušení, procesor pozastaví běžící program, vykoná **obslužnou rutinu přerušení** (*Interrupt Service Routine*, **ISR**) a poté se vrátí přesně tam, kde byl. ISR tak běží „mimo" hlavní tok řízení a může přijít kdykoliv.

## Latence přerušení a kontext

Mezi vznikem události a vykonáním první instrukce ISR uplyne **latence přerušení**. Skládá se z několika kroků, z nichž některé řeší hardware automaticky:

1. **Dokončení aktuální instrukce.** Přerušení obvykle nastane uprostřed instrukce; procesor ji nejprve dokončí.
2. **Uložení kontextu (stacking).** Hardware automaticky uloží na zásobník tzv. *caller-saved* registry, aby je ISR mohla volně používat. Na architektuře **Arm Cortex-M** je to osm slov — `xPSR`, `PC`, `LR`, `R12`, `R3`, `R2`, `R1`, `R0` — a samotný stacking trvá řádově ~12 cyklů.
3. **Čtení vektoru přerušení.** Z **tabulky vektorů přerušení** se načte adresa příslušné ISR do čítače instrukcí (PC). Na Cortex-M probíhá toto čtení *souběžně* se stackingem, takže latenci dále nezvyšuje.

Latenci ale prodlužují i dvě softwarové příčiny: **blokování prioritou** (právě běží jiná, stejně nebo výše prioritní obsluha, která musí doběhnout) a **kritická sekce v hlavním programu** (přerušení jsou dočasně zakázána, viz níže). Tyto dvě složky jsou pod kontrolou programátora — a právě proto se kritické sekce drží co nejkratší.

::: viz nav-isr-latency "Krokuj cestu od vzniku události po obsluhu. Zapni kritickou sekci a sleduj, jak zakázané přerušení prodlouží latenci. Stacking i fetch vektoru řeší hardware."
:::

## Pravidla pro psaní ISR

Protože ISR pozastavuje hlavní program (a může blokovat i další, nižší prioritní přerušení), platí jediné zásadní pravidlo: **musí být co nejkratší a nesmí blokovat.**

* **Žádné blokující volání.** Čekací smyčky (busy-wait), `delay()`, složité I/O operace nebo čekání na jinou periferii v ISR nepatří — zablokovaly by celý systém.
* **Minimum volání dalších funkcí.** Každé vnoření zabírá místo na zásobníku a přidává cykly; ISR by měla být plochá a přímočará.
* **Žádný dlouhý výpočet.** Těžkou práci přesuň jinam.

Osvědčeným vzorem je rozdělení obsluhy na dvě části — model **top-half / bottom-half**:

* **Top-half** = samotná ISR. Jen *rychle zaznamená* událost: nastaví **volatile příznak**, vloží data do fronty nebo do bufferu. Hned skončí.
* **Bottom-half** = pokračování v **hlavní smyčce**. Ta si příznaku všimne a teprve teď provede zdlouhavé zpracování — bez tlaku na latenci, protože už neběží v kontextu přerušení.

```c
volatile uint8_t  rx_flag = 0;        // sdíleno mezi ISR a smyčkou
volatile uint8_t  rx_byte;

void USART_IRQHandler(void) {          // TOP-HALF — krátké, neblokující
    rx_byte = USART->DR;               // přečti, zahoď příznak HW
    rx_flag = 1;                       // jen označ událost
}

void loop(void) {                      // BOTTOM-HALF — v hlavní smyčce
    if (rx_flag) {
        rx_flag = 0;
        process(rx_byte);              // zdlouhavé zpracování až tady
    }
}
```

## Sdílení dat: `volatile`, atomicita a kritické sekce

Protože ISR přeruší hlavní kód **kdykoliv**, vzniká problém při sdílení proměnných mezi nimi. Řeší ho dva *nezávislé* mechanismy, které se často pletou.

**Klíčové slovo `volatile`** říká překladači, že hodnota proměnné se může změnit „zvenčí" (právě v ISR). Tím překladači zakáže optimalizaci, při níž by si proměnnou **nacachoval do registru** a v cyklu pořád dokola četl zastaralou kopii. S `volatile` se proměnná čte **vždy přímo z paměti RAM**. Bez něj se např. čekání `while (!rx_flag);` ve smyčce může změnit v nekonečnou smyčku, protože překladač usoudí, že se `rx_flag` „nikdy nemění".

**`volatile` ale nijak nezaručuje atomicitu.** Pokud sdílená proměnná zabírá *více bajtů, než je šířka sběrnice* (klasicky 32bitová proměnná na 8bitovém MCU) nebo jde o operaci *čtení-úprava-zápis* (`x++`, `flags |= …`), skládá se přístup z více instrukcí. Když přerušení udeří *uprostřed* takové operace, druhá strana přečte poškozenou, napůl aktualizovanou hodnotu — to je **race condition** (souběh).

::: svg "Neatomický zápis 32bitové hodnoty přerušený v půli → race condition"
<svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg">
  <text x="14" y="22" font-size="10" fill="var(--text-muted)" font-family="var(--font-mono)">hlavní smyčka zapisuje count (32 bit) ve 4 krocích:</text>
  <g font-family="var(--font-mono)" font-size="9">
    <rect x="14"  y="34" width="78" height="26" rx="3" fill="oklch(0.65 0.13 264 / 0.4)" stroke="oklch(0.6 0.14 264)"/>
    <text x="53"  y="51" text-anchor="middle" fill="var(--text)">B0 ←</text>
    <rect x="98"  y="34" width="78" height="26" rx="3" fill="oklch(0.65 0.13 264 / 0.4)" stroke="oklch(0.6 0.14 264)"/>
    <text x="137" y="51" text-anchor="middle" fill="var(--text)">B1 ←</text>
    <rect x="182" y="34" width="78" height="26" rx="3" fill="var(--bg-card)" stroke="oklch(0.6 0.18 30)" stroke-dasharray="3 2"/>
    <text x="221" y="51" text-anchor="middle" fill="var(--text-muted)">B2 ?</text>
    <rect x="266" y="34" width="78" height="26" rx="3" fill="var(--bg-card)" stroke="oklch(0.6 0.18 30)" stroke-dasharray="3 2"/>
    <text x="305" y="51" text-anchor="middle" fill="var(--text-muted)">B3 ?</text>
  </g>
  <line x1="265" y1="28" x2="265" y2="66" stroke="oklch(0.62 0.2 30)" stroke-width="1.4"/>
  <text x="275" y="80" text-anchor="start" font-size="9" fill="oklch(0.55 0.2 30)" font-weight="600">⚡ ISR přijde mezi B1 a B2</text>
  <text x="14" y="104" font-size="10" fill="var(--text-muted)" font-family="var(--font-mono)">ISR teď čte count → vidí B0,B1 nové, B2,B3 staré</text>
  <rect x="14" y="116" width="360" height="24" rx="4" fill="oklch(0.6 0.18 30 / 0.18)" stroke="oklch(0.6 0.18 30)"/>
  <text x="194" y="132" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="600">= poškozená hodnota (race condition)</text>
</svg>
:::

Řešením je **kritická sekce**: kolem manipulace se sdílenými daty v hlavní smyčce se přerušení **dočasně zakáže**, hodnota se přečte/zapíše vcelku a přerušení se zase **povolí**. Tím se zaručí, že operaci nikdo nepřeruší. Alternativou jsou **atomické instrukce** procesoru, pokud je dané jádro nabízí.

```c
uint32_t snapshot;
__disable_irq();          // začátek kritické sekce (zakázat přerušení)
snapshot = count;         // konzistentní čtení celé 32bitové hodnoty
__enable_irq();           // konec kritické sekce (povolit přerušení)
```

Kritickou sekci je třeba držet **co nejkratší** — po dobu jejího trvání jsou přerušení zakázána, což přímo zvyšuje jejich latenci (přesně to demonstruje vizualizace výše).

| Mechanismus | Co řeší | Co NEřeší |
|---|---|---|
| `volatile` | cachování proměnné v registru → vždy čte z RAM | **ne**atomicitu vícebajtových / RMW operací |
| kritická sekce (zákaz IRQ) | atomicitu vůči přerušení (souběh) | nic víc — za cenu zvýšené latence |
| atomická instrukce | atomicitu bez globálního zákazu IRQ | dostupnost závisí na architektuře |

::: quiz "Proč k bezpečnému sdílení 32bitového čítače mezi ISR a hlavní smyčkou na 8bitovém MCU nestačí jen `volatile`?"
- [ ] Protože `volatile` zpomaluje přístup natolik, že vznikne souběh.
  > `volatile` jen zakazuje cachování v registru; rychlost s atomicitou nesouvisí.
- [x] Protože `volatile` nezaručuje atomicitu — 32bitový přístup se na 8bitové sběrnici skládá z více instrukcí a může být přerušen uprostřed.
  > Přesně. `volatile` zajistí čerstvé čtení z RAM, ale ne nedělitelnost přístupu. Vícebajtovou hodnotu je nutné chránit kritickou sekcí nebo atomickou instrukcí.
- [ ] Protože `volatile` funguje jen pro 8bitové proměnné.
  > `volatile` funguje pro libovolný typ; jeho rolí je zákaz optimalizace, ne velikostní omezení. Problém je atomicita přístupu, ne typ.
:::

::: link "A Practical Guide to Arm Cortex-M Exception Handling — Memfault" "https://interrupt.memfault.com/blog/arm-cortex-m-exceptions-and-nvic"
:::

::: link "Embedded Systems and the `volatile` Keyword — mbedded.ninja" "https://blog.mbedded.ninja/programming/languages/c/embedded-systems-and-the-volatile-keyword/"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Arm Developer & Memfault Interrupt (Cortex-M exception handling), mbedded.ninja (volatile v embedded C).*
