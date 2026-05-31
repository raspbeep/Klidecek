---
title: Typické režimy činnosti
---

Hardwarové techniky z předchozí části (clock gating, power gating, DVFS) se sdružují do předdefinovaných **provozních režimů**, mezi kterými software přepíná podle aktuální potřeby výkonu. Moderní mikrokontroléry — typicky na jádru ARM Cortex-M — nabízejí stupnici od plného výkonu po hluboký spánek s odběrem v nanoampérech. Volba režimu je vždy kompromis mezi třemi veličinami: **odběrem**, **dobou probuzení** a tím, **co se v paměti a registrech zachová**.

Čím hlubší režim, tím nižší odběr, ale tím delší probuzení a tím víc kontextu se ztratí — od plné retence (Sleep, Stop) přes částečnou (Standby drží jen zálohovou doménu) až po úplnou ztrátu se studeným resetem (Shutdown).

::: viz nav-power-modes "Klikni na režim a sleduj, co běží, co se zachová a co se ztratí. Pravý panel ukazuje typický odběr a způsob probuzení."
:::

## Run a Low-power run

V **Run** režimu běží jádro i povolené periferie naplno; spotřebu určuje frekvence a napětí (DVFS). Pro úsporu lze snížit systémové hodiny (často pod ~2 MHz) a přepnout do **Low-power run**, kde se aktivuje nízkopříkonový napěťový regulátor (LP regulator) místo hlavního. Jádro stále vykonává kód, jen pomaleji a úsporněji.

## Sleep a Low-power sleep

V **Sleep** režimu se zastaví pouze hodiny jádra (CPU) — typicky instrukcí **WFI** (*Wait For Interrupt*) nebo **WFE** (*Wait For Event*). Periferie, paměti i hodiny periferií běží dál a kterékoli povolené přerušení jádro okamžitě probudí. Probuzení je proto velmi rychlé (řád taktů), úspora oproti Run pouze částečná.

Rozdíl mezi instrukcemi je v tom, *co* probudí jádro:

| | WFI (Wait For Interrupt) | WFE (Wait For Event) |
|---|---|---|
| Probudí | přerušení / debug request | událost, přerušení i debug |
| Event latch | nepoužije | pokud je latch nastaven, WFE *vůbec neusne* a jen jej smaže |
| Typické použití | čekání na obsluhu přerušení | spin-wait, synchronizace více jader |

## Stop — hluboký spánek

Ve **Stop** režimu se zastaví hlavní hodiny jádra i vysokorychlostní oscilátory (PLL, HSI, HSE) a regulátor přejde do úsporného módu. **Obsah SRAM i registrů zůstává plně zachován** — po probuzení aplikace pokračuje, kde skončila, jen je třeba znovu rozběhnout hodiny. Probuzení obstarají *asynchronní* události, např. externí přerušení (EXTI) nebo autonomní periferie. Odběr klesá do řádu jednotek µA.

## Standby — pohotovostní režim

Ve **Standby** se zcela odpojí napájení jádrové domény (Vcore). Zastaví se téměř vše a **obsah SRAM i registrů se ztrácí**. Přežije jen vyhrazená **zálohová doména** napájená z VBAT: hodiny reálného času (RTC), pár zálohovacích registrů a malá retenční část SRAM (lze zvolit zachování jen vybraných KB). Odběr typicky klesá **pod 1 µA**. Probuzení má charakter částečného restartu — kontext se obnovuje ze zálohy.

## Shutdown — nejnižší odběr

**Shutdown** je režim s absolutně nejnižší spotřebou, často **pod 100 nA**. Vypínají se i monitorovací podpěťové obvody (BOR), takže napětí už nikdo nehlídá. Probudí jen hodiny reálného času z nízkofrekvenčního oscilátoru (LSE) nebo specifické wake-up piny. Obnova trvá nejdéle a má charakter **studeného resetu** — aplikace startuje od začátku, jako po zapnutí.

| Režim | Hodiny jádra | Vcore | SRAM/registry | Typický odběr | Probuzení |
|---|---|---|---|---|---|
| Run / LP run | běží | zapnuto | zachováno | mA / stovky µA | — |
| Sleep | stop (WFI/WFE) | zapnuto | zachováno | stovky µA | přerušení, velmi rychlé |
| Stop | stop, osc. stop | LP režim | **zachováno** | jednotky µA | EXTI / async, rychlé |
| Standby | stop | **odpojeno** | ztraceno (mimo zálohu) | < 1 µA | wake-up pin / RTC, restart |
| Shutdown | stop | odpojeno | ztraceno | < 100 nA | wake-up pin / LSE, studený reset |

::: quiz "Aplikace musí po probuzení pokračovat přesně tam, kde skončila (zachovaná data v RAM), ale chce co nejnižší odběr. Který režim je nejhlubší vhodný?"
- [ ] Standby — má přece nejnižší odběr pod 1 µA.
  > Ve Standby se Vcore odpojí a SRAM/registry se ztratí (mimo malou zálohovou doménu). Aplikace by nemohla pokračovat z plného stavu.
- [x] Stop — zastaví hodiny i oscilátory, ale plně zachová SRAM i registry.
  > Správně. Stop je nejhlubší režim, který drží celý kontext; po probuzení (EXTI) jen znovu nastartují hodiny a kód běží dál. Standby a Shutdown už kontext obětují za nižší odběr.
- [ ] Shutdown — nejnižší možná spotřeba je vždy nejlepší.
  > Shutdown probouzí studeným resetem a ztrácí RAM; aplikace by startovala od nuly, což zadání vylučuje.
:::

::: quiz "Čím se Standby liší od Shutdown z hlediska toho, co zůstane funkční?"
- [ ] Ničím podstatným, oba ztrácejí veškerý stav i RTC.
  > RTC a zálohová doména zůstávají funkční minimálně ve Standby; rozdíl mezi režimy existuje.
- [x] Ve Shutdown se navíc vypnou i hlídací podpěťové obvody (BOR) a odběr klesá pod 100 nA; probouzí jen LSE/RTC a wake-up piny.
  > Ano. Standby ještě udržuje BOR a širší zálohu (~pod 1 µA), Shutdown obětuje i hlídání napětí pro nejnižší možný odběr, za cenu nejpomalejší obnovy.
- [ ] Standby ztrácí RAM, zatímco Shutdown ji celou zachovává.
  > Je to spíš naopak — oba ztrácejí hlavní SRAM, Shutdown je hlubší, ne mělčí.
:::

::: link "STM32 — Getting started with PWR (ST wiki)" "https://wiki.st.com/stm32mcu/wiki/Getting_started_with_PWR"
:::

::: link "ARM Cortex-M — Ultralow-power designs (WFI/WFE, Sleep-on-Exit)" "https://www.embedded.com/the-definitive-guide-to-arm-cortex-m0-m0-ultralow-power-designs/"
:::

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: STMicroelectronics (STM32 PWR, datasheety STM32L4/U5), ARM (Cortex-M Generic User Guide, WFI/WFE).*
