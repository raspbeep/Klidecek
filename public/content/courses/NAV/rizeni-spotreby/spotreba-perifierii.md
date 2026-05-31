---
title: Spotřeba modulů a SW kooperace
---

Samotné uspání jádra nestačí — energii spotřebovávají i periferie, paměti, I/O piny a způsob, jakým je software využívá. Skutečně úsporný systém řídí spotřebu *komplexně*: nechává jádro spát co nejdéle, data zpracovává autonomními bloky a pečlivě ošetří i zdánlivé maličkosti, jako jsou nepoužité piny.

## Autonomní operace na pozadí (LPBAM / BAM)

Klíčová myšlenka: data lze přijímat i odbavovat, **aniž by se probudilo jádro**. Mechanismus *Batch Acquisition Mode* (BAM, resp. nízkopříkonová varianta LPBAM) nechá vybrané periferie (ADC, UART, I2C) sbírat či vysílat data a ukládat je do paměti přes nezávislé kanály **DMA**. Jádro může zůstat ve Stop režimu a probudí se až po naplnění bufferu nebo po dokončení celé dávky, ne po každém vzorku.

::: svg "Bez DMA se jádro budí na každý vzorek; s autonomním DMA spí a probudí se až po dávce"
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="20" font-size="11" font-weight="600" fill="var(--text)">bez DMA — jádro budí každý vzorek</text>
  <line x1="10" y1="58" x2="510" y2="58" stroke="var(--line)" stroke-width="1"/>
  <text x="6" y="40" font-size="9" fill="var(--text-faint)">CPU</text>
  <!-- spikes: CPU wakes 6x -->
  <g fill="oklch(0.6 0.18 22 / 0.7)">
    <rect x="40" y="32" width="14" height="26"/>
    <rect x="120" y="32" width="14" height="26"/>
    <rect x="200" y="32" width="14" height="26"/>
    <rect x="280" y="32" width="14" height="26"/>
    <rect x="360" y="32" width="14" height="26"/>
    <rect x="440" y="32" width="14" height="26"/>
  </g>
  <text x="60" y="78" font-size="9" fill="var(--text-muted)">↑ probuzení na každý vzorek = velká spotřeba</text>

  <text x="10" y="112" font-size="11" font-weight="600" fill="var(--text)">s autonomním DMA — jádro spí, budí se po dávce</text>
  <line x1="10" y1="150" x2="510" y2="150" stroke="var(--line)" stroke-width="1"/>
  <text x="6" y="132" font-size="9" fill="var(--text-faint)">CPU</text>
  <rect x="10" y="142" width="430" height="8" fill="oklch(0.62 0.14 142 / 0.3)"/>
  <text x="220" y="139" font-size="9" fill="oklch(0.45 0.14 142)">CPU ve Stop, DMA plní buffer</text>
  <rect x="440" y="124" width="14" height="26" fill="oklch(0.6 0.18 22 / 0.7)"/>
  <text x="430" y="172" font-size="9" fill="var(--text-muted)">jediné probuzení po naplnění dávky</text>
</svg>
:::

## Optimalizace paměti a napájení

Čtení z integrované **Flash** paměti je energeticky náročné. **Instruction cache** (u některých rodin zvaná akcelerátor typu ART) drží často prováděný kód blízko jádra a výrazně sníží počet přístupů do Flash, čímž ušetří energii i takty. Nepoužívané bloky pamětí (banky Flash, segmenty SRAM) mají vlastní napájecí spínače a lze je **hardwarově zcela odpojit**.

Napájení samotného jádra řeší volba regulátoru. **SMPS** (spínaný zdroj, step-down měnič) má vysokou účinnost při větších odběrech, je proto výhodný v aktivním provozu. **LDO** (lineární regulátor) má klidový odběr v nanoampérech a jednodušší chování, hodí se proto pro hluboký spánek. Procesory umějí mezi nimi automaticky přepínat podle režimu.

| Regulátor | Princip | Účinnost při zátěži | Klidový odběr | Vhodný pro |
|---|---|---|---|---|
| SMPS | spínaný měnič | vysoká (~80–90 %) | vyšší | aktivní Run |
| LDO | lineární (úbytek napětí) | nízká při velkém ΔU | velmi nízký (nA) | spánek, malé odběry |

## Ošetření plovoucích GPIO pinů

Skrytý a často podceňovaný zdroj ztrát. Nepoužitý vstupní pin ponechaný „ve vzduchu" (**floating input**) nemá definované napětí — vnější šum jej rozkmitá kolem prahu vstupního bufferu. Když napětí leží uprostřed mezi log. 0 a log. 1, otevřou se *oba* komplementární tranzistory vstupního obvodu (Schmittova klopného obvodu) současně a teče trvalý **příčný zkratový proud** (shoot-through). Tento svod přitom běží pořád, i v hlubokém spánku, a může zničit veškerou úsporu.

::: svg "Floating vstup u prahu otevírá oba tranzistory → příčný zkratový proud; analogový režim vstup odpojí"
<svg viewBox="0 0 520 190" xmlns="http://www.w3.org/2000/svg">
  <!-- left: floating digital input -->
  <text x="10" y="18" font-size="11" font-weight="600" fill="oklch(0.5 0.18 22)">digitální vstup, plovoucí pin</text>
  <line x1="80" y1="30" x2="80" y2="60" stroke="var(--line-strong)"/>
  <text x="86" y="36" font-size="10" fill="var(--text)">Vdd</text>
  <rect x="55" y="60" width="50" height="26" rx="4" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="80" y="77" text-anchor="middle" font-size="9" fill="var(--text)">PMOS</text>
  <rect x="55" y="110" width="50" height="26" rx="4" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="80" y="127" text-anchor="middle" font-size="9" fill="var(--text)">NMOS</text>
  <line x1="80" y1="136" x2="80" y2="166" stroke="var(--line-strong)"/>
  <text x="86" y="166" font-size="10" fill="var(--text)">Vss</text>
  <!-- floating gate input -->
  <line x1="10" y1="98" x2="55" y2="98" stroke="oklch(0.6 0.18 22)" stroke-width="1.5" stroke-dasharray="3 2"/>
  <text x="6" y="92" font-size="9" fill="oklch(0.6 0.18 22)">~½Vdd (šum)</text>
  <!-- shoot-through arrow -->
  <line x1="80" y1="86" x2="80" y2="110" stroke="oklch(0.6 0.18 22)" stroke-width="2.5" marker-end="url(#navArr)"/>
  <text x="120" y="100" font-size="10" fill="oklch(0.6 0.18 22)">I_zkrat (oba on)</text>

  <!-- divider -->
  <line x1="300" y1="20" x2="300" y2="170" stroke="var(--line)" stroke-dasharray="3 4"/>

  <!-- right: analog mode -->
  <text x="320" y="18" font-size="11" font-weight="600" fill="oklch(0.45 0.14 142)">analogový režim (řešení)</text>
  <line x1="330" y1="98" x2="380" y2="98" stroke="var(--text-muted)" stroke-width="1.5"/>
  <text x="320" y="92" font-size="9" fill="var(--text-muted)">pin</text>
  <line x1="380" y1="92" x2="392" y2="104" stroke="oklch(0.6 0.18 22)" stroke-width="1.5"/>
  <line x1="392" y1="92" x2="380" y2="104" stroke="oklch(0.6 0.18 22)" stroke-width="1.5"/>
  <text x="396" y="90" font-size="9" fill="oklch(0.6 0.18 22)">odpojen od</text>
  <text x="396" y="102" font-size="9" fill="oklch(0.6 0.18 22)">Schmitt. obvodu</text>
  <rect x="330" y="120" width="160" height="40" rx="6" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.62 0.14 142)"/>
  <text x="410" y="138" text-anchor="middle" font-size="10" fill="var(--text)">žádný digitální buffer</text>
  <text x="410" y="152" text-anchor="middle" font-size="10" fill="var(--text)">→ svod ≈ 0</text>
  <defs>
    <marker id="navArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.6 0.18 22)"/>
    </marker>
  </defs>
</svg>
:::

Řešením je konfigurovat nepoužité piny do **analogového režimu**, který vstup fyzicky odpojí od digitálního bufferu (Schmittova obvodu). Plovoucí napětí pak vypadá jako obyčejná analogová úroveň bez následků — příčný proud zmizí. (Alternativně lze pin definovat pull-up/pull-down rezistorem, ale ten sám o sobě malý proud spotřebovává; analogový vstup je z hlediska spotřeby čistší.)

## Softwarová kooperace (RTOS)

I dokonalý hardware znehodnotí špatně napsaný software. Klasický RTOS pravidelně budí jádro **časovačem SysTick** (např. každou milisekundu), aby plánovač mohl přepínat úlohy. Takové buzení ovšem maří jakýkoli pokus o spánek — jádro nikdy nespí dlouho.

**Tickless Idle** to řeší: jakmile RTOS zjistí, že není připravena žádná úloha, vypne SysTick a místo něj nakonfiguruje asynchronní nízkopříkonový časovač (**LPTIM**), aby probudil systém buď po nejbližším naplánovaném termínu, nebo dřív při přerušení. Po probuzení RTOS dopočítá, kolik systémových ticků „prospal", a srovná čítač plánovače. Jádro tak může nerušeně spát desítky až stovky ms místo 1 ms intervalů.

```c
/* FreeRTOSConfig.h — zapnutí tickless idle */
#define configUSE_TICKLESS_IDLE   1
/* Kernel pak v idle volá vPortSuppressTicksAndSleep(xExpectedIdleTime):
   - zastaví SysTick, nastaví LPTIM na xExpectedIdleTime,
   - uspí jádro (WFI),
   - po probuzení dopočte čas přes vTaskStepTick(). */
```

Druhým trikem na úrovni jádra je bit **Sleep-on-Exit** (v registru SCR jádra Cortex-M). Je-li nastaven, procesor po dokončení obsluhy přerušení (ISR) **nevrací řízení hlavnímu vláknu**, ale rovnou znovu usne (jako by provedl WFI) — pokud nečeká další přerušení. U aplikací typu „spi a jen reaguj na přerušení" tím odpadá zbytečná obnova kontextu hlavního vlákna a šetří se takty i energie. Sleep-on-Exit neusne, pokud se ISR vrací do jiné (vnořené) obsluhy přerušení.

::: quiz "Proč je v RTOS aplikaci s úsporným režimem výchozí periodické buzení SysTickem problém?"
- [ ] SysTick spotřebovává příliš mnoho proudu jako periferie.
  > Samotný čítač je levný; problém je v důsledku, ne v jeho odběru.
- [x] Budí jádro v krátkých intervalech (např. 1 ms), takže nikdy nespí dostatečně dlouho a hluboké režimy se nevyplatí.
  > Přesně. Každé probuzení znamená rozběh hodin a obnovu — při 1 ms intervalu se jádro nedostane do efektivního spánku. Tickless idle SysTick vypne a nechá spát do nejbližšího termínu úlohy.
- [ ] SysTick maže obsah SRAM při každém ticku.
  > SysTick je jen čítač, paměť nijak nemaže.
:::

::: link "FreeRTOS — Low Power / Tickless Idle Mode" "https://freertos.org/low-power-tickless-rtos.html"
:::

::: link "ARM Cortex-M — Sleep-On-Exit (ScienceDirect topics)" "https://www.sciencedirect.com/topics/engineering/sleep-on-exit"
:::

::: link "Save Power By Managing Unused CMOS I/O Pins (Electronic Design)" "https://electronicdesign.com/technologies/boards/article/21765936/save-power-by-managing-unused-cmos-io-pins"
:::

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: FreeRTOS (tickless idle), ARM (Cortex-M SCR / Sleep-on-Exit), STMicroelectronics (LPBAM/BAM, SMPS vs LDO, ART akcelerátor), Electronic Design (unused CMOS I/O pins).*
